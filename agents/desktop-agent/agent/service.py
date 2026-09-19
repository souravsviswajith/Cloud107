import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import sys
import asyncio
import logging
from agent.communication.client import WebsocketClient

logging.basicConfig(
    filename='C:\\CloudWorkspaceAgent.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

class DesktopAgentService(win32serviceutil.ServiceFramework):
    _svc_name_ = "CloudWorkspaceDesktopAgent"
    _svc_display_name_ = "Cloud Workspace Desktop Agent"
    _svc_description_ = "Manages the interactive desktop environment for Cloud Workspace"

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        socket.setdefaulttimeout(60)
        self.is_running = True
        self.client = WebsocketClient()

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.is_running = False
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
        servicemanager.PrepareToHostSingle(DesktopAgentService)
        servicemanager.StartServiceCtrlDispatcher()
    else:
        win32serviceutil.HandleCommandLine(DesktopAgentService)
