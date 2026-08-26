"""The v1 API surface. Every route the application exposes is mounted here."""

from fastapi import APIRouter

from app.api.v1.routes import graph, health, jobs, qa, repositories, tours

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(repositories.router)
api_router.include_router(jobs.router)
api_router.include_router(tours.router)
api_router.include_router(graph.router)
api_router.include_router(qa.router)
