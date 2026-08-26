"""Liveness and readiness.

`/health` answers "is this process up". `/health/ready` answers "can it reach
the things it needs" — which is the one that matters when four separate stores
have to be running.
"""

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings
from app.db.relational.session import engine
from app.schemas.health import HealthRead, ServiceStatus

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthRead)
def health() -> HealthRead:
    return HealthRead(status="ok", environment=settings.app_env, services=[])


@router.get("/health/ready", response_model=HealthRead)
def readiness() -> HealthRead:
    """Never raises. A readiness probe that 500s tells you less than one that
    reports which dependency is down."""
    services = [_check_postgres(), _check_redis()]
    status = "ok" if all(service.reachable for service in services) else "degraded"
    return HealthRead(status=status, environment=settings.app_env, services=services)


def _check_postgres() -> ServiceStatus:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return ServiceStatus(name="postgres", reachable=True)
    except Exception as exc:
        return ServiceStatus(name="postgres", reachable=False, detail=str(exc)[:200])


def _check_redis() -> ServiceStatus:
    try:
        from redis import Redis

        client = Redis.from_url(settings.celery_broker_url, socket_connect_timeout=2)
        client.ping()
        return ServiceStatus(name="redis", reachable=True)
    except Exception as exc:
        return ServiceStatus(name="redis", reachable=False, detail=str(exc)[:200])
