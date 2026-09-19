from typing import Dict, Any
from agent.hardware.detector import HardwareDetector

class CapabilityRegistry:
    def __init__(self):
        self.hardware = HardwareDetector.detect()
        self.capabilities = {
            "clipboard_support": True,
            "desktop_capture": True,
            "window_capture": True,
            "file_transfer": True,
            "powershell": True,
            "registry_access": True
        }

    def get_registration_payload(self) -> Dict[str, Any]:
        return {
            "hardware": self.hardware,
            "capabilities": self.capabilities,
            "agent_version": "1.0.0"
        }
