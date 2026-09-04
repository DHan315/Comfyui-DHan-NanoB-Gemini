from .nano_gemini import NanoBEditGemini, NanoBRefConfig, NanoBRefStacker

NODE_CLASS_MAPPINGS = {
    "NanoBEditGemini": NanoBEditGemini,
    "NanoBRefConfig": NanoBRefConfig,
    "NanoBRefStacker": NanoBRefStacker,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "NanoBEditGemini": "NanoB Gemini Editor",
    "NanoBRefConfig": "NanoB Reference Adapter (Legacy)",
    "NanoBRefStacker": "NanoB Reference Stacker"
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']