import asyncio
import websockets
import json
import logging
import sys
import os
from runtime.configuration.settings import settings
from runtime.authentication.auth import AuthenticationManager
from runtime.lifecycle.manager import LifecycleManager
from runtime.telemetry.service import TelemetryService
from runtime.plugins.manager import PluginManager
from runtime.policy.engine import PolicyEngine
from runtime.diagnostics.collector import DiagnosticsCollector

logger = logging.getLogger(__name__)

class RuntimeWebsocketClient:
    def __init__(self, lifecycle: LifecycleManager, plugins: PluginManager, policy: PolicyEngine):
        self.auth = AuthenticationManager()
        self.lifecycle = lifecycle
        self.plugins = plugins
        self.policy = policy
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
                    
                    await websocket.send(json.dumps({
                        "type": "runtime_register",
                        "payload": {"version": "1.0.0"}
                    }))
                    
                    telemetry_task = asyncio.create_task(self.report_telemetry())
                    
                    try:
                        async for message in websocket:
                            await self.handle_message(message)
                    finally:
                        telemetry_task.cancel()
                        
            except Exception as e:
                logger.error(f"WS Connection error: {e}")
                await asyncio.sleep(5)

    async def report_telemetry(self):
        while True:
            try:
                if self.connection:
                    telemetry = TelemetryService.gather_telemetry(self.lifecycle.state.value)
                    await self.connection.send(json.dumps({
                        "type": "telemetry_report",
                        "payload": telemetry
                    }))
            except Exception as e:
                logger.error(f"Failed to report telemetry: {e}")
            await asyncio.sleep(settings.TELEMETRY_INTERVAL)

    async def handle_message(self, message: str):
        try:
            data = json.loads(message)
            cmd_type = data.get("type")
            payload = data.get("payload", {})
            response = {"type": f"{cmd_type}_response", "success": True, "data": None}
            
            if cmd_type == "execute_lifecycle_hook":
                hook = payload.get("hook")
                if hook == "suspend":
                    await self.lifecycle.suspend()
                elif hook == "resume":
                    await self.lifecycle.resume()
                elif hook == "shutdown":
                    await self.lifecycle.shutdown()
            elif cmd_type == "load_plugin":
                response["success"] = self.plugins.load_plugin(payload.get("name"), payload.get("config", {}))
            elif cmd_type == "unload_plugin":
                response["success"] = self.plugins.unload_plugin(payload.get("name"))
            elif cmd_type == "update_policy":
                self.policy.update_policies(payload.get("policies", {}))
            elif cmd_type == "get_diagnostics":
                response["data"] = DiagnosticsCollector.generate_report()
            else:
                response["success"] = False
                response["error"] = "Unknown command"
                
            if self.connection:
                await self.connection.send(json.dumps(response))
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            
    async def start(self):
        self.running = True
        await self.lifecycle.startup()
        await self.connect()
        
    def stop(self):
        self.running = False
        if self.connection:
            asyncio.create_task(self.connection.close())
