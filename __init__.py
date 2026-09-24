from .nano_gemini import NanoBEditGemini, NanoBRefConfig, NanoBRefStacker

NODE_CLASS_MAPPINGS = {
    "NanoBEditGemini": NanoBEditGemini,
    "NanoBRefConfig": NanoBRefConfig,
    "NanoBRefStacker": NanoBRefStacker,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "NanoBEditGemini": "Comfyui-DHan-NanoB Gemini Editor",
    "NanoBRefConfig": "Comfyui-DHan-NanoB Reference Adapter (Legacy)",
    "NanoBRefStacker": "Comfyui-DHan-NanoB Reference Stacker"
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']
