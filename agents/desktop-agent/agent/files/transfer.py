import os
import logging

logger = logging.getLogger(__name__)

class FileTransferManager:
    def __init__(self):
        self.workspace_dir = os.path.join(os.environ.get("USERPROFILE", "C:\\"), "CloudWorkspace")
        os.makedirs(self.workspace_dir, exist_ok=True)

    def upload(self, remote_path: str, file_data: bytes) -> bool:
        try:
            local_path = os.path.join(self.workspace_dir, remote_path)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            with open(local_path, "wb") as f:
                f.write(file_data)
            return True
        except Exception as e:
            logger.error(f"File upload error: {e}")
            return False

    def download(self, remote_path: str) -> bytes:
        try:
            local_path = os.path.join(self.workspace_dir, remote_path)
            with open(local_path, "rb") as f:
                return f.read()
        except Exception as e:
            logger.error(f"File download error: {e}")
            return b""
