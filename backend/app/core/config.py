"""
Centralized application configuration loaded from environment variables.
Uses pydantic-settings so .env values are validated and typed.
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/organic_ecommerce"

    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # AI Chatbot
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # OTP / SMS
    OTP_PROVIDER_API_KEY: str = ""

    # WhatsApp
    WHATSAPP_BUSINESS_NUMBER: str = ""

    # CORS - comma separated in .env, parsed to list
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
