import logging
from enum import Enum
from runtime.events.bus import event_bus

logger = logging.getLogger(__name__)

class WorkspaceState(str, Enum):
    STARTUP = "startup"
    RUNNING = "running"
    SUSPENDED = "suspended"
    MAINTENANCE = "maintenance"
    SAFE_MODE = "safe_mode"
    RECOVERY = "recovery"
    SHUTDOWN = "shutdown"

class LifecycleManager:
    def __init__(self):
        self.state = WorkspaceState.STARTUP

    async def change_state(self, new_state: WorkspaceState):
        logger.info(f"Changing runtime state from {self.state} to {new_state}")
        self.state = new_state
        await event_bus.publish("RuntimeStateChanged", {"state": new_state.value})

    async def startup(self):
        await self.change_state(WorkspaceState.RUNNING)

    async def shutdown(self):
        await self.change_state(WorkspaceState.SHUTDOWN)

    async def suspend(self):
        await self.change_state(WorkspaceState.SUSPENDED)

    async def resume(self):
        await self.change_state(WorkspaceState.RUNNING)

    async def enter_safe_mode(self):
        await self.change_state(WorkspaceState.SAFE_MODE)
        
    async def enter_recovery_mode(self):
        await self.change_state(WorkspaceState.RECOVERY)
