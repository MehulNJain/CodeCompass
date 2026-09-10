"""FastAPI application factory.

Run it with:

    uvicorn app.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import CodeCompassError
from app.core.logging import configure_logging, get_logger

API_V1_PREFIX = "/api/v1"

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    settings.repo_storage_path.mkdir(parents=True, exist_ok=True)
    settings.export_storage_path.mkdir(parents=True, exist_ok=True)
    logger.info("CodeCompass API starting (env=%s)", settings.app_env)
    yield
    logger.info("CodeCompass API stopping")


def create_app() -> FastAPI:
    app = FastAPI(
        title="CodeCompass API",
        description="Guided codebase onboarding tours.",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        openapi_url=f"{API_V1_PREFIX}/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(CodeCompassError)
    async def handle_domain_error(_: Request, exc: CodeCompassError) -> JSONResponse:
        """Domain exceptions carry their own status code, so modules never
        need to import anything from FastAPI."""
        return JSONResponse(
            status_code=exc.status_code, content={"detail": exc.message}
        )

    app.include_router(api_router, prefix=API_V1_PREFIX)
    return app


app = create_app()
