"""
config.py — Application settings loaded from .env
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Pinecone ──────────────────────────────
    pinecone_api_key: str
    pinecone_index_name: str = "healthcare-rag"
    pinecone_environment: str = "us-east-1-aws"

    # ── Embedding ─────────────────────────────
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dimension: int = 384

    # ── LLM ───────────────────────────────────
    llm_provider: str = "gemini"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
        
    # ── App ───────────────────────────────────
    app_env: str = "development"
    log_level: str = "INFO"
    default_top_k: int = 5
    max_top_k: int = 20
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # ── Trust Scoring ─────────────────────────
    trusted_sources: str = "WHO,CDC,PubMed,NIH,MedlinePlus"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def trusted_sources_list(self) -> list[str]:
        return [s.strip() for s in self.trusted_sources.split(",")]


@lru_cache
def get_settings() -> Settings:
    """Cached singleton — importable across the app."""
    return Settings()
