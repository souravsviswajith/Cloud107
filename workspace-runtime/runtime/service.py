import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import sys
import asyncio
import logging
from runtime.communication.client import RuntimeWebsocketClient
from runtime.lifecycle.manager import LifecycleManager
from runtime.plugins.manager import PluginManager
from runtime.policy.engine import PolicyEngine

logging.basicConfig(
    filename='C:\\WorkspaceRuntime.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

class WorkspaceRuntimeService(win32serviceutil.ServiceFramework):
    _svc_name_ = "CloudWorkspaceRuntime"
    _svc_display_name_ = "Cloud Workspace Runtime"
    _svc_description_ = "Manages the workspace lifecycle and automation for Cloud Workspace"

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        socket.setdefaulttimeout(60)
        
        self.lifecycle = LifecycleManager()
        self.plugins = PluginManager()
        self.policy = PolicyEngine()
        self.client = RuntimeWebsocketClient(self.lifecycle, self.plugins, self.policy)

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.client.stop()

    def SvcDoRun(self):
        servicemanager.LogMsg(
            servicemanager.EVENTLOG_INFORMATION_TYPE,
            servicemanager.PYS_SERVICE_STARTED,
            (self._svc_name_, '')
        )
        self.main()

    def main(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(self.client.start())
        except Exception as e:
            logging.error(f"Service error: {e}")
            
if __name__ == '__main__':
    if len(sys.argv) == 1:
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(WorkspaceRuntimeService)
        servicemanager.StartServiceCtrlDispatcher()
    else:
        win32serviceutil.HandleCommandLine(WorkspaceRuntimeService)
