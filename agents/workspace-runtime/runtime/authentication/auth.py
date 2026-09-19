import logging
from runtime.configuration.settings import settings

logger = logging.getLogger(__name__)

class AuthenticationManager:
    def __init__(self):
        self.jwt_token = ""

    async def authenticate(self) -> bool:
        logger.info(f"Runtime authenticating with backend {settings.BACKEND_URL}")
        self.jwt_token = settings.RUNTIME_TOKEN
        return True

    def get_token(self) -> str:
        return self.jwt_token
