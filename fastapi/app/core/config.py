from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str 
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    DUMMY_PASSWORD: str

    class Config:
        env_file=Path(__file__).resolve().parent.parent.parent / ".env"

settings = Settings()