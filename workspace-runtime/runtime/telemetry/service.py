import platform
import psutil
from typing import Dict, Any
from runtime.health.monitor import HealthMonitor

class TelemetryService:
    @staticmethod
    def gather_telemetry(state: str) -> Dict[str, Any]:
        health = HealthMonitor.check_health()
        uname = platform.uname()
        
        return {
            "workspace_state": state,
            "os": f"{uname.system} {uname.release}",
            "hardware": {
                "cpu_cores": psutil.cpu_count(logical=True),
                "ram_total": psutil.virtual_memory().total,
            },
            "performance": health,
            "network": psutil.net_io_counters()._asdict()
        }
