from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    BACKEND_URL: str = "http://localhost:3000"
    WS_BACKEND_URL: str = "ws://localhost:3000/api/v1/ws"
    WORKSPACE_ID: str = "default-workspace"
    AGENT_TOKEN: str = ""
    POLL_INTERVAL: int = 5
    HEARTBEAT_INTERVAL: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
