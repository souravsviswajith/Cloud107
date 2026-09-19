# Standalone run entry point (useful for testing without installing the service)
import asyncio
import logging
from agent.communication.client import WebsocketClient

logging.basicConfig(level=logging.INFO)

async def main():
    client = WebsocketClient()
    await client.start()

if __name__ == "__main__":
    asyncio.run(main())
