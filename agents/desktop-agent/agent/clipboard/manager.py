import win32clipboard

class ClipboardManager:
    @staticmethod
    def read() -> str:
        try:
            win32clipboard.OpenClipboard()
            data = win32clipboard.GetClipboardData()
            win32clipboard.CloseClipboard()
            return str(data)
        except Exception:
            try:
                win32clipboard.CloseClipboard()
            except Exception:
                pass
            return ""

    @staticmethod
    def write(text: str) -> bool:
        try:
            win32clipboard.OpenClipboard()
            win32clipboard.EmptyClipboard()
            win32clipboard.SetClipboardText(text)
            win32clipboard.CloseClipboard()
            return True
        except Exception:
            try:
                win32clipboard.CloseClipboard()
            except Exception:
                pass
            return False
