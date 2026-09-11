"""Application settings.

Every value here maps to a variable in `.env.example`. Nothing reads
`os.environ` directly — import `settings` instead, so there is exactly one
place where configuration is defined and validated.
"""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/core/config.py -> backend/
BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(BACKEND_ROOT.parent / ".env", BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Application ---
    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    # Comma-separated in .env; split in `cors_origin_list`.
    cors_origins: str = "http://localhost:5173"

    # --- Authentication ---
    session_ttl_days: int = 14

    # --- PostgreSQL ---
    database_url: str = (
        "postgresql+psycopg://codecompass:codecompass@localhost:5432/codecompass"
    )

    # --- Neo4j ---
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = ""
    neo4j_database: str = "neo4j"

    # --- Chroma ---
    chroma_host: str = "localhost"
    chroma_port: int = 8001
    chroma_collection: str = "code_chunks"

    # --- Celery + Redis ---
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    # --- Semantic layer (F14: model-agnostic) ---
    # Deliberately optional. The API must boot without a model configured —
    # only module M6 requires these, and nothing else may read them.
    llm_provider: str = ""
    llm_model: str = ""
    llm_api_key: str = ""
    llm_base_url: str = ""
    embedding_model: str = ""

    # --- Object storage ---
    repo_storage_path: Path = Field(default=BACKEND_ROOT / "storage" / "repos")
    export_storage_path: Path = Field(default=BACKEND_ROOT / "storage" / "exports")

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def session_cookie_secure(self) -> bool:
        """HTTPS-only everywhere except local development, which is plain
        http://localhost."""
        return not self.is_development


@lru_cache
def get_settings() -> Settings:
    """Cached so the .env file is read once per process."""
    return Settings()


settings = get_settings()
