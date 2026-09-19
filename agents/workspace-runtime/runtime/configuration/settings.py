from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    BACKEND_URL: str = "http://localhost:3000"
    WS_BACKEND_URL: str = "ws://localhost:3000/api/v1/runtime/ws"
    WORKSPACE_ID: str = "default-workspace"
    RUNTIME_TOKEN: str = ""
    TELEMETRY_INTERVAL: int = 30
    HEALTH_CHECK_INTERVAL: int = 15
    
    class Config:
        env_file = ".env"

settings = Settings()
