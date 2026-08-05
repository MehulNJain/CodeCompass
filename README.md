# CodeCompass

> A Guided Codebase Onboarding Tour Generator — B.Tech (CSE) Final Year Major Project.

**This repository is a scaffold.** It contains the agreed folder structure and a
working React application shell. **No features are implemented yet.** Every
directory is a placeholder waiting for the module it is named after.

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

As presented. Nothing below is installed yet apart from React and Tailwind.

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
│   │   ├── api/v1/
│   │   │   ├── routes/             HTTP endpoints (repositories, tours, graph, qa, jobs)
│   │   │   └── dependencies/       Shared FastAPI dependencies (db session, auth, pagination)
│   │   ├── core/                   Config, settings, logging, exceptions, constants
│   │   ├── db/                     Storage layer — one folder per store
│   │   │   ├── relational/         PostgreSQL
│   │   │   │   ├── models/         ORM models — repositories, files, tours,
│   │   │   │   │                   tour_steps, analysis_jobs (see doc §13)
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
│   │   │   └── tasks/              Individual async tasks (analyse_repository, reanalyse, …)
│   │   └── utils/                  Small generic helpers with no domain knowledge
│   ├── tests/
│   │   ├── unit/                   Per-module tests against hand-verified samples
│   │   ├── integration/            Full-pipeline runs
│   │   └── fixtures/sample_repos/  Tiny repos with known structure, for accuracy checks
│   └── storage/                    Runtime working data (gitignored)
│       ├── repos/                  Cloned repository snapshots
│       └── exports/                Generated tour exports
│
├── frontend/                       React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── api/                    Typed HTTP client + endpoint wrappers
│   │   ├── assets/                 Images, icons, fonts
│   │   ├── components/
│   │   │   ├── ui/                 Primitives (Button, Dialog, Input) — no domain logic
│   │   │   ├── layout/             Shell, sidebar, header
│   │   │   └── common/             Shared composites (EmptyState, ErrorBoundary, …)
│   │   ├── features/               One folder per product surface; owns its own state
│   │   │   ├── repositories/       Submit a repo, list/manage analysed repos
│   │   │   ├── tour/               The guided ordered tour view (F5, F6)
│   │   │   ├── graph/              Interactive dependency-graph view (F7)
│   │   │   ├── qa/                 Grounded question–answer view (F8)
│   │   │   └── export/             Tour export UI (F15)
│   │   ├── hooks/                  App-wide reusable hooks
│   │   ├── lib/                    Third-party setup (http client, query client, graph lib)
│   │   ├── pages/                  Route-level page components
│   │   ├── routes/                 Router definition and route guards
│   │   ├── store/                  Global client state
│   │   ├── styles/                 Tailwind theme extensions, global CSS
│   │   ├── types/                  Shared TypeScript types (mirror backend schemas)
│   │   ├── constants/              Enums, config, persona lists
│   │   └── utils/                  Pure helper functions
│   └── index.css                   Tailwind entry point
│
├── docs/
│   ├── architecture/               Diagrams, deeper design notes
│   ├── api/                        API contract documentation
│   ├── decisions/                  ADRs — one file per significant decision
│   └── meeting-notes/              Weekly progress notes
│
├── docker/                         Dockerfiles + compose for reproducible setup
├── scripts/                        Dev/setup/seed helper scripts
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

| Module | Directory | Depends on |
|---|---|---|
| M1 Ingestion | `backend/app/modules/ingestion/` | — |
| M2 Parsing | `backend/app/modules/parsing/` | M1 |
| M3 Graph | `backend/app/modules/graph/` | M2 |
| M4 Ranking | `backend/app/modules/ranking/` | M3 |
| M5 Tour generation | `backend/app/modules/tour/` | M3, M4 |
| M6 Semantic layer | `backend/app/modules/semantic/` | M2, M5 |
| M7 Staleness / incremental | `backend/app/modules/staleness/` | M1, M6 |
| M8 API / orchestration | `backend/app/api/`, `services/`, `workers/` | all |
| M9 Frontend | `frontend/src/` | M8 |

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
- **Frontend features are self-contained.** Put a component in
  `components/` only once a second feature needs it.
- `@/` is an import alias for `frontend/src/`.

---

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173, proxies /api to :8000
```

### Backend

Not set up yet — the folder tree is in place but there is no application entry
point, dependency file, or database configuration. Whoever picks up **M8** should
add the FastAPI app, dependency management, and Alembic setup first, then update
this section.

### Not yet installed

The presented stack is settled — these still need to be added to the project:

- **Frontend:** `reactflow`, a router, and a data-fetching layer.
- **Backend:** `fastapi`, `celery`, `redis`, `tree-sitter` (+ per-language
  grammars), `networkx`, `sqlalchemy` + `alembic`, `neo4j`, `chromadb`,
  `sentence-transformers`.
- **Services:** PostgreSQL, Redis, Neo4j, and Chroma need `docker/` compose
  entries so the team can run the same environment.

Record any deviation from the presented stack in `docs/decisions/`.

---

## Contributing

1. Branch from `main`: `feat/<module>-<short-description>`.
2. Keep changes inside your assigned module where possible.
3. Open a PR; do not push directly to `main`.
