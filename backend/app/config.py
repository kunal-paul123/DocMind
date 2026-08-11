from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL:str
    GEMINI_API_KEY:str
    SECRET_KEY:str
    ALGORITHM:str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # google auth
    GOOGLE_CLIENT_ID:str
    GOOGLE_CLIENT_SECRET:str
    GOOGLE_REDIRECT_URI:str = "http://localhost:8000/auth/google/callback"

    # frontend url
    FRONTEND_URL:str = "http://localhost:5173"
    

    model_config = SettingsConfigDict(
        env_file = ".env"
    )

settings = Settings()
