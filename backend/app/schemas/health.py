"""Health-check response shapes."""

from typing import Literal

from pydantic import BaseModel


class ServiceStatus(BaseModel):
    name: str
    reachable: bool
    detail: str | None = None


class HealthRead(BaseModel):
    status: Literal["ok", "degraded"]
    environment: str
    services: list[ServiceStatus]
