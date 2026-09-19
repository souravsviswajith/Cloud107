import psutil
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class HealthMonitor:
    @staticmethod
    def check_health() -> Dict[str, Any]:
        cpu = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory().percent
        disk = psutil.disk_usage('/').percent
        
        status = "healthy"
        issues = []
        
        if cpu > 95:
            status = "degraded"
            issues.append("High CPU usage")
        if mem > 95:
            status = "degraded"
            issues.append("High Memory usage")
        if disk > 95:
            status = "degraded"
            issues.append("Low Disk space")
            
        return {
            "status": status,
            "cpu_percent": cpu,
            "memory_percent": mem,
            "disk_percent": disk,
            "issues": issues
        }
