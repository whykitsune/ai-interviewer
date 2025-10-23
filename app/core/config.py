from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Interview Platform"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./app.db"
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"

settings = Settings()
