"""Celery application.

The worker runs the same `app.modules` code the API imports — the queue exists
to move long analyses off the request cycle, not to split the system in two.
"""

from celery import Celery

from app.core.config import settings
from app.core.logging import configure_logging

configure_logging()

celery_app = Celery(
    "codecompass",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.workers.tasks.analyze_repository"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    # Analysis is long and not idempotent halfway through; acknowledge only
    # once the task finishes so a killed worker re-runs it from the start.
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_track_started=True,
)
