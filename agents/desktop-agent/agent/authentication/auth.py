import aiohttp
import logging
from agent.config.settings import settings

logger = logging.getLogger(__name__)

class AuthenticationManager:
    def __init__(self):
        self.jwt_token = ""

    async def authenticate(self) -> bool:
        logger.info(f"Authenticating with backend {settings.BACKEND_URL}")
        # In a real scenario, this would use a secure method to obtain a JWT token
        # For now, using AGENT_TOKEN from settings
        self.jwt_token = settings.AGENT_TOKEN
        return True

    def get_token(self) -> str:
        return self.jwt_token
