"""The v1 API surface. Every route the application exposes is mounted here.

**Routes are private by default.** Anything included into `private` needs a
signed-in user before its handler runs. A new router goes there unless it has a
real reason to be public, and `tests/unit/test_route_protection.py` fails the
build if a route answers anonymous requests without being on its allowlist.

Signed in is not the same as allowed: handlers still scope every lookup to the
caller — see `repository_repo`.
"""

from fastapi import APIRouter, Depends

from app.api.v1.dependencies.auth import get_current_user
from app.api.v1.routes import auth, graph, health, jobs, qa, repositories, tours

api_router = APIRouter()

# Public. `/auth/me` lives here but guards itself.
api_router.include_router(health.router)
api_router.include_router(auth.router)

private = APIRouter(dependencies=[Depends(get_current_user)])
private.include_router(repositories.router)
private.include_router(jobs.router)
private.include_router(tours.router)
private.include_router(graph.router)
private.include_router(qa.router)

api_router.include_router(private)
