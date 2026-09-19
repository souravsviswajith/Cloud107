import asyncio
import logging
from runtime.communication.client import RuntimeWebsocketClient
from runtime.lifecycle.manager import LifecycleManager
from runtime.plugins.manager import PluginManager
from runtime.policy.engine import PolicyEngine

logging.basicConfig(level=logging.INFO)

async def main():
    lifecycle = LifecycleManager()
    plugins = PluginManager()
    policy = PolicyEngine()
    client = RuntimeWebsocketClient(lifecycle, plugins, policy)
    await client.start()

if __name__ == "__main__":
    asyncio.run(main())
