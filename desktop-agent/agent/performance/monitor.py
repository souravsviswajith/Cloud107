import psutil
from typing import Dict, Any

class PerformanceMonitor:
    @staticmethod
    def get_metrics() -> Dict[str, Any]:
        return {
            "cpu_percent": psutil.cpu_percent(interval=0.1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent,
            "network": psutil.net_io_counters()._asdict()
        }
