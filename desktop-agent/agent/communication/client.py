import asyncio
import websockets
import json
import logging
from agent.config.settings import settings
from agent.authentication.auth import AuthenticationManager
from agent.core.registry import CapabilityRegistry
from agent.applications.manager import ApplicationManager
from agent.windows.manager import WindowManager
from agent.clipboard.manager import ClipboardManager
from agent.screenshots.capture import ScreenshotService
from agent.security.validator import SecurityValidator
from agent.performance.monitor import PerformanceMonitor
from agent.files.transfer import FileTransferManager
import os
import sys

logger = logging.getLogger(__name__)

class WebsocketClient:
    def __init__(self):
        self.auth = AuthenticationManager()
        self.registry = CapabilityRegistry()
        self.connection = None
        self.running = False

    async def connect(self):
        await self.auth.authenticate()
        uri = f"{settings.WS_BACKEND_URL}/{settings.WORKSPACE_ID}"
        logger.info(f"Connecting to WS: {uri}")
        
        while self.running:
            try:
                async with websockets.connect(uri) as websocket:
                    self.connection = websocket
                    # Register
                    await websocket.send(json.dumps({
                        "type": "register",
                        "payload": self.registry.get_registration_payload()
                    }))
                    
                    # Start performance reporting task
                    perf_task = asyncio.create_task(self.report_performance())
                    
                    try:
                        async for message in websocket:
                            await self.handle_message(message)
                    finally:
                        perf_task.cancel()
                        
            except Exception as e:
                logger.error(f"WS Connection error: {e}")
                await asyncio.sleep(5)

    async def report_performance(self):
        while True:
            try:
                if self.connection:
                    metrics = PerformanceMonitor.get_metrics()
                    await self.connection.send(json.dumps({
                        "type": "performance_metrics",
                        "payload": metrics
                    }))
            except Exception as e:
                logger.error(f"Failed to report performance: {e}")
            await asyncio.sleep(settings.POLL_INTERVAL)

    async def handle_message(self, message: str):
        try:
            data = json.loads(message)
            cmd_type = data.get("type")
            payload = data.get("payload", {})
            if not SecurityValidator.is_valid_command(cmd_type):
                return
            response = {"type": f"{cmd_type}_response", "success": True, "data": None}
            
            if cmd_type == "launch_application":
                success = ApplicationManager.launch_application(payload.get("path", ""))
                response["success"] = success
            elif cmd_type == "kill_application":
                success = ApplicationManager.terminate_application(payload.get("name", ""))
                response["success"] = success
            elif cmd_type == "read_clipboard":
                response["data"] = ClipboardManager.read()
            elif cmd_type == "write_clipboard":
                response["success"] = ClipboardManager.write(payload.get("text", ""))
            elif cmd_type == "screenshot":
                response["data"] = ScreenshotService.capture_desktop()
            elif cmd_type == "manage_window":
                response["success"] = WindowManager.manage_window(payload.get("window_id", ""), payload.get("action", ""))
            elif cmd_type == "upload_file":
                import base64
                file_data = base64.b64decode(payload.get("data", ""))
                response["success"] = FileTransferManager().upload(payload.get("path", ""), file_data)
            elif cmd_type == "download_file":
                import base64
                data = FileTransferManager().download(payload.get("path", ""))
                if data:
                    response["data"] = base64.b64encode(data).decode('utf-8')
                    response["success"] = True
                else:
                    response["success"] = False
            elif cmd_type == "shutdown_agent":
                response["success"] = True
                if self.connection:
                    await self.connection.send(json.dumps(response))
                self.stop()
                sys.exit(0)
            elif cmd_type == "restart_agent":
                response["success"] = True
                if self.connection:
                    await self.connection.send(json.dumps(response))
                self.stop()
                os.execl(sys.executable, sys.executable, *sys.argv)
            else:
                response["success"] = False
                response["error"] = "Unknown command"
                
            if self.connection:
                await self.connection.send(json.dumps(response))
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            
    async def start(self):
        self.running = True
        await self.connect()
        
    def stop(self):
        self.running = False
        if self.connection:
            asyncio.create_task(self.connection.close())
