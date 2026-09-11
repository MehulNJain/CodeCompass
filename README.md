# CodeCompass

> A Guided Codebase Onboarding Tour Generator — B.Tech (CSE) Final Year Major Project.

**Status: the spine runs, the analysis does not.** The full loop works —
paste a Git URL into the dashboard and the API queues a job, Celery hands it to
a worker, and the row updates itself as the job moves.

**That job then fails on purpose**, because the pipeline it would run does not
exist. Every `modules/` directory (M1–M7) is still empty.

Accounts are real: email and password sign-up and sign-in, with each user seeing
only the repositories they added. GitHub sign-in is not built yet.

Everything runs in Docker: `docker compose -f docker/docker-compose.yml up -d`,
then open http://localhost:5173.

Full specification: [CodeCompass_Project_Documentation.md](CodeCompass_Project_Documentation.md)

---

## Architecture

A **monolith**: one repository, one deployable backend, one frontend build. The
FastAPI application owns the whole analysis pipeline; modules are separated by
package boundaries rather than by network boundaries. Long-running analysis is
pushed to a background worker that runs the same code.

```
Browser (React SPA)
      |  REST  /api/v1/*
      v
FastAPI application  ──Redis──>  Celery worker
      |                              |
      +──────── app/modules/ ────────+   (shared analysis pipeline)
      |
      v
PostgreSQL  |  Neo4j  |  Chroma  |  Object/file storage
 metadata     graph     vectors    repo snapshots, exports
```

## Technology stack

As presented. On the frontend, React, TypeScript, Vite, Tailwind,
`react-router-dom`, and `lucide-react` are installed; React Flow is not. Nothing
on the backend is installed yet.

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Flow |
| Backend / API | Python, FastAPI, Celery + Redis |
| Analysis engine | Tree-sitter (structural parsing), NetworkX (graph + centrality) |
| Semantic layer | sentence-transformers (code embeddings), LLM behind a model-agnostic interface |
| Storage | PostgreSQL, Neo4j, Chroma, object storage |
| Tooling | Git, Docker |

**NetworkX and Neo4j are not alternatives here.** NetworkX builds the graph in
memory and computes centrality during analysis (`app/modules/graph/`,
`app/modules/ranking/`); Neo4j persists the result and serves it back for
queries and the frontend graph view (`app/db/graph/`).

---

## Repository layout

```
CodeCompass/
├── backend/                        FastAPI monolith — API + analysis pipeline
│   ├── app/
│   │   ├── main.py                 Application factory — `uvicorn app.main:app`
│   │   ├── api/v1/
│   │   │   ├── router.py           Mounts every route under /api/v1; private by default
│   │   │   ├── routes/             HTTP endpoints (auth, repositories, tours, graph, qa, jobs)
│   │   │   └── dependencies/       Shared FastAPI dependencies (db session, current user, pagination)
│   │   ├── core/                   Config, logging, exceptions, constants, security (hashing)
│   │   ├── db/                     Storage layer — one folder per store
│   │   │   ├── relational/         PostgreSQL
│   │   │   │   ├── base.py         Declarative base + constraint naming
│   │   │   │   ├── session.py      Engine and session factory (API and worker share it)
│   │   │   │   ├── models/         ORM models — users, user_sessions, repositories,
│   │   │   │   │                   files, tours, tour_steps, analysis_jobs (doc §13)
│   │   │   │   ├── repositories/   Data-access layer; queries live here, not in routes
│   │   │   │   └── migrations/     Alembic migration environment + versions/
│   │   │   ├── graph/              Neo4j — persisted dependency/call graph
│   │   │   │   ├── queries/        Cypher queries
│   │   │   │   └── schema/         Constraints and indexes
│   │   │   └── vector/             Chroma — code embeddings
│   │   │       └── collections/    Collection definitions
│   │   ├── schemas/                Pydantic request/response models (the API contract)
│   │   ├── services/               Orchestration — composes modules into use cases
│   │   ├── modules/                The analysis pipeline (doc §10, M1–M7)
│   │   │   ├── ingestion/          M1 — clone/upload, file filtering, inventory
│   │   │   ├── parsing/            M2 — structural extraction → normalised representation
│   │   │   │   └── languages/      Per-language parser adapters (Python, JS/TS, …)
│   │   │   ├── graph/              M3 — dependency/call graph build + module aggregation
│   │   │   ├── ranking/            M4 — centrality / importance scoring
│   │   │   ├── tour/               M5 — ordering, journey tracing
│   │   │   │   └── personas/       Persona weighting profiles (new contributor, bug fixer, …)
│   │   │   ├── semantic/           M6 — the ONLY place that talks to a language model
│   │   │   │   ├── providers/      Model-agnostic adapters (hosted / free-tier / local) — F14
│   │   │   │   ├── prompts/        Prompt templates, versioned
│   │   │   │   ├── embeddings/     Chunking + embedding for retrieval
│   │   │   │   └── retrieval/      Hybrid retrieval + citation assembly for Q&A
│   │   │   ├── staleness/          M7 — commit diffing, stale-content flagging
│   │   │   └── export/             F15 — Markdown / PDF tour export
│   │   ├── workers/                Background job queue
│   │   │   ├── celery_app.py       Celery configuration
│   │   │   └── tasks/              Individual async tasks (analyse_repository, reanalyse, …)
│   │   └── utils/                  Small generic helpers with no domain knowledge
│   ├── tests/
│   │   ├── unit/                   No services needed — run anywhere
│   │   ├── integration/            Against real Postgres, in its own `_test` database
│   │   └── fixtures/sample_repos/  Tiny repos with known structure, for accuracy checks
│   ├── storage/                    Runtime working data (gitignored)
│   │   ├── repos/                  Cloned repository snapshots
│   │   └── exports/                Generated tour exports
│   ├── alembic.ini                 Migration config (URL comes from settings, not here)
│   ├── pyproject.toml              Ruff and pytest config — dependencies are NOT here
│   ├── requirements.txt            API + worker runtime
│   ├── requirements-analysis.txt   tree-sitter / networkx / sentence-transformers (M1–M7)
│   └── requirements-dev.txt        pytest, ruff
│
├── frontend/                       React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── api/                    Typed HTTP client + endpoint wrappers
│   │   │   ├── client.ts           fetch wrapper, ApiError — the only network code
│   │   │   ├── auth.ts             /auth endpoints (session is an httpOnly cookie)
│   │   │   └── repositories.ts     /repositories endpoints
│   │   ├── assets/                 Images, icons, fonts
│   │   ├── components/
│   │   │   ├── ui/                 Primitives (Button, Input) — no domain logic
│   │   │   ├── layout/             SiteHeader/Footer (public), AppShell (signed in)
│   │   │   └── common/             EmptyState, ErrorState, Skeleton
│   │   ├── features/               One folder per product surface; owns its own state
│   │   │   ├── landing/            Public marketing page sections
│   │   │   ├── auth/               Sign-in / sign-up form, session hooks (useAuth)
│   │   │   ├── repositories/       Submit a repo, list/manage analysed repos
│   │   │   │   ├── components/     Form, list, row, status badge, job detail
│   │   │   │   └── hooks/          TanStack Query hooks (list, submit, poll job)
│   │   │   ├── tour/               The guided ordered tour view (F5, F6)
│   │   │   ├── graph/              Interactive dependency-graph view (F7)
│   │   │   ├── qa/                 Grounded question–answer view (F8)
│   │   │   └── export/             Tour export UI (F15)
│   │   ├── hooks/                  App-wide reusable hooks
│   │   ├── lib/                    Third-party setup (http client, query client, graph lib)
│   │   ├── pages/                  Route-level page components
│   │   ├── routes/                 Router definition and route guards (RequireAuth)
│   │   ├── store/                  Global client state
│   │   ├── styles/                 Tailwind theme extensions, global CSS
│   │   ├── types/                  Shared TypeScript types (mirror backend schemas)
│   │   ├── constants/              Enums, config, persona lists
│   │   └── utils/                  Pure helper functions
│   └── index.css                   Tailwind entry point
│
├── design-system/
│   └── codecompass/
│       ├── MASTER.md               Global design tokens — read before styling
│       └── pages/                  Per-page overrides (override MASTER.md)
│           ├── landing.md          Surface ramp + measured contrast — read this
│           ├── login.md            Auth layout and form rules
│           └── dashboard.md        App shell, status badges, polling rules
│
├── docs/
│   ├── architecture/               Diagrams, deeper design notes
│   ├── api/                        API contract documentation
│   ├── decisions/                  ADRs — one file per significant decision
│   └── meeting-notes/              Weekly progress notes
│
├── docker/
│   ├── Dockerfile.backend          One image, two commands (API and worker)
│   ├── Dockerfile.frontend         Vite dev server (not a production build)
│   └── docker-compose.yml          The whole stack — 7 services
├── scripts/
│   └── dev.sh                      up / logs / stop / down / reset
├── .github/
│   ├── workflows/                  CI pipelines
│   └── ISSUE_TEMPLATE/
├── .env.example                    Copy to .env and fill in
└── CodeCompass_Project_Documentation.md
```

---

## Work split

Directories map to the modules in the documentation, so tasks can be assigned
without two people editing the same files.

| Module | Directory | Depends on | Status |
|---|---|---|---|
| M1 Ingestion | `backend/app/modules/ingestion/` | — | empty |
| M2 Parsing | `backend/app/modules/parsing/` | M1 | empty |
| M3 Graph | `backend/app/modules/graph/` | M2 | empty |
| M4 Ranking | `backend/app/modules/ranking/` | M3 | empty |
| M5 Tour generation | `backend/app/modules/tour/` | M3, M4 | empty |
| M6 Semantic layer | `backend/app/modules/semantic/` | M2, M5 | empty |
| M7 Staleness / incremental | `backend/app/modules/staleness/` | M1, M6 | empty |
| M8 API / orchestration | `backend/app/api/`, `services/`, `workers/` | all | foundation runs, email auth |
| M9 Frontend | `frontend/src/` | M8 | landing, auth, dashboard |

**M1 is the unblocking task.** Everything downstream waits on a file inventory,
and the pipeline it plugs into is already wired: replace `_run_pipeline` in
`backend/app/workers/tasks/analyze_repository.py`.

Ownership as presented:

| Area | Owners | Modules |
|---|---|---|
| Frontend & backend development | Sanket Kale, Mehul Jain | M8, M9 |
| Code analysis & AI | Deep Lokhande, Palak Mantage | M1–M7 |
| Database & system integration | Harshal Kala, Palak Mantage | `db/`, `workers/`, `modules/export/` |
| Testing & deployment | All members | `tests/`, `docker/` |

---

## Conventions

- **The design invariant holds in the code layout.** Structure comes only from
  `modules/parsing/` → `modules/graph/`. Narrative comes only from
  `modules/semantic/`. No module outside `semantic/` may call a language model.
- **Modules do not import each other's internals.** They communicate through
  `services/`, which orchestrates the pipeline.
- **Routes stay thin.** Endpoints validate input and delegate to `services/`;
  database access lives in `db/`, never in a route.
- **`modules/` never talks to a database directly.** Analysis modules work on
  in-memory structures; `services/` persists their output through `db/`.
- **Raise domain exceptions, not `HTTPException`.** `app/core/exceptions.py`
  defines them and `app/main.py` maps them to status codes, which is what keeps
  FastAPI out of the analysis pipeline.
- **An unbuilt endpoint answers 501, not 404.** A 404 tells the frontend the URL
  is wrong; 501 tells it the route is real and the module is coming. Use
  `NotImplementedYetError` and name the module in the message.
- **Routes are private by default.** Mount a new router inside `private` in
  `app/api/v1/router.py`. A route that answers without a session fails
  `tests/unit/test_route_protection.py` unless it is added to that test's
  allowlist on purpose.
- **Signed in is not the same as allowed.** Look repositories and jobs up
  through the `owner_id`-scoped functions (`repository_service.get_repository`,
  `repository_repo.get_owned`), never by bare id. Someone else's id answers 404,
  not 403 — a 403 confirms the thing exists.
- **Nothing reads `os.environ`.** Import `settings` from `app/core/config.py`.
- **After changing a model, generate a migration** in the same commit:
  `alembic revision --autogenerate -m "..."`. A model without a migration breaks
  everyone else's database.
- **Frontend features are self-contained.** Put a component in
  `components/` only once a second feature needs it.
- **All network code lives in `src/api/`.** Components never call `fetch`;
  they use a hook from their feature's `hooks/`, which calls an endpoint
  wrapper. Server state is TanStack Query's, not `useState`'s.
- **`src/types/api.ts` mirrors the backend schemas.** Change a Pydantic model
  and change it here in the same PR, or the two silently drift.
- **Styling follows `design-system/codecompass/`.** Read `MASTER.md` before
  writing CSS, and check `pages/<page>.md` — a page override beats the master.
  Use the theme tokens from `frontend/src/index.css` (`bg-canvas`, `text-ink`,
  `text-accent`, …), never raw hex in a component.
- **Icons are SVG, never emoji.** Use `lucide-react`; inline the official
  artwork for brand marks.
- `@/` is an import alias for `frontend/src/`.

---

## Getting started

One command. You need Docker, and nothing else — no Python, no Node, no
databases installed on your machine.

```bash
docker compose -f docker/docker-compose.yml up -d
```

Then open **http://localhost:5173**. That is the whole setup.

| | |
|---|---|
| App | http://localhost:5173 |
| API docs (interactive) | http://localhost:8000/docs |
| Health / readiness | `/api/v1/health`, `/api/v1/health/ready` |
| Neo4j browser | http://localhost:7474 (`neo4j` / `codecompass`) |
| Postgres | `localhost:5432` (`codecompass` / `codecompass`) |
| Redis | `localhost:6379` |
| Chroma | `localhost:8001` |

Database migrations run automatically when the API container starts, so there
is no follow-up command after `up`.

`./scripts/dev.sh` wraps the same thing and waits until the app actually
answers before printing the URLs:

```bash
./scripts/dev.sh          # start, and wait until it is reachable
./scripts/dev.sh logs     # follow the API and worker logs
./scripts/dev.sh stop     # stop the containers, keep them and the data
./scripts/dev.sh down     # remove the containers, keep the data volumes
./scripts/dev.sh reset    # remove containers AND delete all data (asks first)
```

### Editing code

Your working tree is mounted into the containers, so **just edit files** —
React hot-reloads through Vite, and the API restarts through `uvicorn
--reload`. There is no rebuild step for ordinary changes.

Two cases do need a rebuild, because they change what is installed in the
image rather than what is mounted into it:

```bash
C="docker compose -f docker/docker-compose.yml"

# after adding a dependency to package.json
$C build frontend && $C up -d frontend

# after adding one to backend/requirements*.txt
$C build api worker && $C up -d api worker
```

### Common commands

```bash
C="docker compose -f docker/docker-compose.yml"

$C exec api pytest                                    # backend tests (unit + integration)
$C exec api ruff check .                              # backend lint
$C exec frontend npm run build                        # typecheck + build
$C exec frontend npx oxlint src                       # frontend lint
$C exec api alembic revision --autogenerate -m "..."  # after changing a model
$C logs -f worker                                     # watch the job queue
```

### Running something outside Docker

The ports above are published on localhost, so a locally-run process can talk
to the containers. Useful if you want a debugger attached.

```bash
cd frontend && npm install && npm run dev      # needs Node 24+

cd backend                                     # needs Python 3.11+
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload
celery -A app.workers.celery_app.celery_app worker --loglevel=info
```

`vite.config.ts` proxies `/api` to `VITE_API_PROXY_TARGET` when Compose sets
it, and to `localhost:8000` otherwise, so both paths work unchanged.

### Not yet installed

- **Frontend:** `reactflow`, for the graph view (F7). Everything else is
  installed — `react-router-dom`, `lucide-react`, `@tanstack/react-query`.
- **Backend analysis libraries** — `tree-sitter`, `networkx`, and
  `sentence-transformers` are listed in `backend/requirements-analysis.txt` but
  are deliberately **not** in the Docker image yet: `sentence-transformers`
  pulls in torch, which is several gigabytes. Add
  `-r requirements-analysis.txt` to `docker/Dockerfile.backend` when M2 starts.

Everything else — FastAPI, SQLAlchemy, Alembic, Celery, Redis, the Neo4j and
Chroma clients — is installed and running.

Record any deviation from the presented stack in `docs/decisions/`.

---

## Contributing

1. Branch from `main`: `feat/<module>-<short-description>`.
2. Keep changes inside your assigned module where possible.
3. Open a PR; do not push directly to `main`.
