import { app } from "../../scripts/app.js";

const EXTENSION_NAME = "NanoGemini.ProgressiveRefInputs";
const TARGET_COMFY_CLASS = "NanoBRefStacker";
const MAX_REFS = 14;

function normalizeName(name) {
    return String(name || "").replaceAll("_", " ").toLowerCase();
}

function isRefName(name) {
    return /^ref image \d+$/.test(normalizeName(name));
}

function getRefIndex(name) {
    const match = /^ref image (\d+)$/.exec(normalizeName(name));
    return match ? Number(match[1]) : null;
}

function getHighestConnectedRefIndex(node) {
    let highest = 0;
    for (const input of node.inputs || []) {
        if (!input || !isRefName(input.name)) continue;
        const idx = getRefIndex(input.name);
        if (idx && input.link != null) highest = Math.max(highest, idx);
    }
    return highest;
}

function ensureInputDefs(node) {
    if (node.__nanoGeminiInputDefs) return;
    const defs = {};
    for (const input of node.inputs || []) {
        if (!input?.name || !isRefName(input.name)) continue;
        const idx = getRefIndex(input.name);
        defs[idx] = {
            name: input.name,
            type: input.type ?? "IMAGE",
            extra_info: input.extra_info ? { ...input.extra_info } : undefined,
        };
    }
    node.__nanoGeminiInputDefs = defs;
}

function findRefInput(node, index) {
    return (node.inputs || []).find((input) => getRefIndex(input?.name) === index);
}

function addRefInput(node, index) {
    const def = node.__nanoGeminiInputDefs?.[index];
    if (!def || findRefInput(node, index)) return;
    node.addInput(def.name, def.type, def.extra_info);
}

function removeRefInput(node, index) {
    const input = findRefInput(node, index);
    if (!input || input.link != null) return;
    const slot = (node.inputs || []).indexOf(input);
    if (slot >= 0) node.removeInput(slot);
}

function syncVisibleInputs(node) {
    ensureInputDefs(node);
    const highestConnected = getHighestConnectedRefIndex(node);
    const visible = Math.min(MAX_REFS, Math.max(1, highestConnected + 1));

    for (let i = 1; i <= visible; i++) addRefInput(node, i);
    for (let i = MAX_REFS; i > visible; i--) removeRefInput(node, i);

    node.size = node.computeSize?.() || node.size;
    node.setDirtyCanvas?.(true, true);
    app.graph?.setDirtyCanvas?.(true, true);
}

app.registerExtension({
    name: EXTENSION_NAME,
    async beforeRegisterNodeDef(nodeType) {
        if ((nodeType.comfyClass || nodeType.ComfyClass) !== TARGET_COMFY_CLASS) return;

        const oldConnections = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onConnectionsChange = function () {
            const result = oldConnections?.apply(this, arguments);
            syncVisibleInputs(this);
            return result;
        };

        const oldCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = oldCreated?.apply(this, arguments);
            syncVisibleInputs(this);
            return result;
        };
    },
    async nodeCreated(node) {
        if (node.comfyClass === TARGET_COMFY_CLASS) syncVisibleInputs(node);
    },
    loadedGraphNode(node) {
        if (node.comfyClass === TARGET_COMFY_CLASS) syncVisibleInputs(node);
    },
    async afterConfigureGraph() {
        for (const node of app.graph?._nodes || []) {
            if (node?.comfyClass === TARGET_COMFY_CLASS) syncVisibleInputs(node);
        }
    },
});
