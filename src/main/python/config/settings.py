import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    
    # OpenAI API Configuration
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    
    # Whisper API Settings
    whisper_model: str = "whisper-1"
    max_file_size_mb: int = 30
    
    # ChatGPT API Settings
    chatgpt_model: str = "gpt-4o-mini"
    max_tokens: int = 2000
    temperature: float = 0.3
    
    # Obsidian Settings
    default_obsidian_vault: str = os.getenv("DEFAULT_OBSIDIAN_VAULT", "Paper-Note")
    default_paper_path: str = os.getenv("DEFAULT_PAPER_PATH", "Papers/Summaries")
    
    # Server Settings
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # File Upload Settings
    upload_dir: str = "uploads"
    allowed_extensions: list = [".mp3", ".m4a", ".wav", ".mp4", ".flac", ".ogg"]
    
    class Config:
        env_file = ".env"

settings = Settings()