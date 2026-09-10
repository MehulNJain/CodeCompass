"""The analysis task.

**This is a skeleton.** It walks the job through the pipeline stages of
documentation §11 and then fails deliberately, because modules M1–M7 do not
exist yet. It fails loudly on purpose: a task that quietly reported success
would make the system look finished when nothing has been analysed.

Whoever builds M1 replaces `_run_pipeline` with real stage calls.
"""

from app.core.constants import JobState, RepositoryStatus
from app.core.logging import get_logger
from app.db.relational.repositories import repository_repo
from app.db.relational.session import session_scope
from app.workers.celery_app import celery_app

logger = get_logger(__name__)

# Documentation §11, steps 2–8. The API reports the current one to the UI.
PIPELINE_STAGES = (
    "ingest",
    "parse",
    "build_graph",
    "rank",
    "embed",
    "generate_tour",
    "explain",
)


@celery_app.task(name="codecompass.analyze_repository", bind=True)
def analyze_repository(self, repository_id: int, job_id: int) -> dict:
    logger.info("analysis start repository_id=%s job_id=%s", repository_id, job_id)

    with session_scope() as session:
        job = repository_repo.get_job(session, job_id)
        repository = repository_repo.get_by_id(session, repository_id)
        if job is None or repository is None:
            logger.error("job %s or repository %s vanished", job_id, repository_id)
            return {"ok": False, "reason": "missing job or repository"}

        repository_repo.mark_job_running(session, job, stage=PIPELINE_STAGES[0])
        repository_repo.set_status(session, repository, RepositoryStatus.ANALYZING)

    try:
        _run_pipeline(repository_id)
    except NotImplementedError as exc:
        with session_scope() as session:
            job = repository_repo.get_job(session, job_id)
            repository = repository_repo.get_by_id(session, repository_id)
            if job is not None:
                repository_repo.mark_job_finished(
                    session, job, state=JobState.FAILED, error_message=str(exc)
                )
            if repository is not None:
                repository_repo.set_status(session, repository, RepositoryStatus.FAILED)
        logger.warning("analysis not implemented repository_id=%s", repository_id)
        return {"ok": False, "reason": str(exc)}

    with session_scope() as session:
        job = repository_repo.get_job(session, job_id)
        repository = repository_repo.get_by_id(session, repository_id)
        if job is not None:
            repository_repo.mark_job_finished(session, job, state=JobState.SUCCEEDED)
        if repository is not None:
            repository_repo.set_status(session, repository, RepositoryStatus.READY)
    return {"ok": True}


def _run_pipeline(repository_id: int) -> None:
    """Replace this with the real stages as the modules land.

    The intended shape, one call per stage:

        inventory = ingestion.clone_and_inventory(...)   # M1
        parsed    = parsing.parse_files(inventory)       # M2
        graph     = graph.build(parsed)                  # M3
        ranked    = ranking.score(graph)                 # M4
        tour      = tour.generate(ranked, persona)       # M5
        semantic.explain(tour)                           # M6

    Persist between stages through `app/db/`, never from inside a module.
    """
    raise NotImplementedError(
        "The analysis pipeline is not built yet — modules M1–M7 are unimplemented. "
        "See backend/app/workers/tasks/analyze_repository.py."
    )
