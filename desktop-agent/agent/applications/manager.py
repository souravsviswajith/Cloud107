import subprocess
import os
import winreg
from typing import List, Dict, Any

class ApplicationManager:
    @staticmethod
    def list_installed_applications() -> List[Dict[str, Any]]:
        # A simple implementation reading Uninstall registry keys
        apps = []
        reg_paths = [
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
            r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
        ]
        
        for path in reg_paths:
            try:
                key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, path)
                for i in range(0, winreg.QueryInfoKey(key)[0]):
                    try:
                        subkey_name = winreg.EnumKey(key, i)
                        subkey = winreg.OpenKey(key, subkey_name)
                        display_name, _ = winreg.QueryValueEx(subkey, "DisplayName")
                        try:
                            display_icon, _ = winreg.QueryValueEx(subkey, "DisplayIcon")
                        except FileNotFoundError:
                            display_icon = ""
                        try:
                            install_location, _ = winreg.QueryValueEx(subkey, "InstallLocation")
                        except FileNotFoundError:
                            install_location = ""
                            
                        apps.append({
                            "name": display_name,
                            "path": install_location,
                            "icon": display_icon
                        })
                    except Exception:
                        continue
            except Exception:
                pass
        return apps

    @staticmethod
    def launch_application(executable_path: str) -> bool:
        try:
            subprocess.Popen(executable_path, shell=True)
            return True
        except Exception as e:
            return False

    @staticmethod
    def terminate_application(executable_name: str) -> bool:
        try:
            # We can use taskkill or psutil
            import psutil
            killed = False
            for proc in psutil.process_iter(['name']):
                if proc.info['name'] and proc.info['name'].lower() == executable_name.lower():
                    proc.kill()
                    killed = True
            return killed
        except Exception:
            return False

    @staticmethod
    def restart_application(executable_name: str, executable_path: str) -> bool:
        ApplicationManager.terminate_application(executable_name)
        return ApplicationManager.launch_application(executable_path)
