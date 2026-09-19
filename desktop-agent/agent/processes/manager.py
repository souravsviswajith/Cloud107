import psutil
from typing import List, Dict, Any

class ProcessManager:
    @staticmethod
    def get_running_processes() -> List[Dict[str, Any]]:
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
            try:
                processes.append({
                    "pid": proc.info['pid'],
                    "name": proc.info['name'],
                    "cpu_percent": proc.info['cpu_percent'],
                    "memory_mb": proc.info['memory_info'].rss / (1024 * 1024) if proc.info['memory_info'] else 0
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        return processes

    @staticmethod
    def kill_process(pid: int) -> bool:
        try:
            proc = psutil.Process(pid)
            proc.kill()
            return True
        except Exception:
            return False
