import platform
import psutil
import platform

class HardwareDetector:
    @staticmethod
    def detect() -> dict:
        uname = platform.uname()
        mem = psutil.virtual_memory()
        
        # Note: In a production environment, WMI or GPUtil would be used for GPU detection.
        return {
            "os": uname.system,
            "windows_version": uname.version,
            "cpu": uname.processor,
            "cores": psutil.cpu_count(logical=True),
            "ram_total": mem.total,
            "gpu": "Generic System GPU",
            "cuda_support": False,
            "nvenc_support": False,
            "av1_support": False,
            "directx_support": True,
            "vulkan_support": False
        }
