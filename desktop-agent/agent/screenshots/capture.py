from PIL import ImageGrab
import io
import base64

class ScreenshotService:
    @staticmethod
    def capture_desktop() -> str:
        try:
            img = ImageGrab.grab()
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            return base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
        except Exception as e:
            return ""

    @staticmethod
    def capture_window(bbox) -> str:
        try:
            img = ImageGrab.grab(bbox=bbox)
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            return base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
        except Exception:
            return ""
