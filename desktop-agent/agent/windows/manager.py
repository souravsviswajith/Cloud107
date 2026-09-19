import win32gui
import win32con
from typing import List, Dict, Any

class WindowManager:
    @staticmethod
    def enum_windows() -> List[Dict[str, Any]]:
        windows = []
        def callback(hwnd, extra):
            if win32gui.IsWindowVisible(hwnd) and win32gui.GetWindowText(hwnd):
                rect = win32gui.GetWindowRect(hwnd)
                windows.append({
                    "id": str(hwnd),
                    "title": win32gui.GetWindowText(hwnd),
                    "x": rect[0],
                    "y": rect[1],
                    "width": rect[2] - rect[0],
                    "height": rect[3] - rect[1]
                })
        win32gui.EnumWindows(callback, None)
        return windows
        
    @staticmethod
    def manage_window(hwnd_str: str, action: str) -> bool:
        try:
            hwnd = int(hwnd_str)
            if action == "minimize":
                win32gui.ShowWindow(hwnd, win32con.SW_MINIMIZE)
            elif action == "maximize":
                win32gui.ShowWindow(hwnd, win32con.SW_MAXIMIZE)
            elif action == "restore":
                win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
            elif action == "close":
                win32gui.PostMessage(hwnd, win32con.WM_CLOSE, 0, 0)
            elif action == "focus":
                win32gui.SetForegroundWindow(hwnd)
            return True
        except Exception:
            return False
