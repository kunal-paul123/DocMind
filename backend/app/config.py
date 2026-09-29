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
    GOOGLE_REDIRECT_URI:str

    GOOGLE_AUTH_URL:str
    GOOGLE_TOKEN_URL:str
    GOOGLE_USERINFO_URL:str

    # frontend url
    LOCALHOST_FRONTEND_URL:str
    FRONTEND_URL:str

    model_config = SettingsConfigDict(
        env_file = ".env"
    )

settings = Settings()


