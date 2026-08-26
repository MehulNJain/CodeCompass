"""Engine and session handling for PostgreSQL.

One synchronous engine, shared by the API and the Celery worker. Sync rather
than async is deliberate: Celery is synchronous, and a single session factory
that both sides use is far easier to reason about than two parallel stacks.
FastAPI runs plain `def` route handlers in a thread pool, so a blocking query
does not stall the event loop.
"""

from collections.abc import Generator, Iterator
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # drop connections the database closed underneath us
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_session() -> Iterator[Session]:
    """FastAPI dependency. Yields a session and always closes it."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@contextmanager
def session_scope() -> Generator[Session, None, None]:
    """For the Celery worker, which has no dependency injection.

    Commits on success, rolls back on any exception.
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
