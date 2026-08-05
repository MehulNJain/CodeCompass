# CodeCompass
### A Guided Codebase Onboarding Tour Generator

**Major Project Documentation — B.Tech (Computer Science & Engineering), Final Year**

*(CodeCompass is a working title and may be renamed.)*

---

## Table of Contents

1. Abstract
2. Introduction
3. Problem Statement
4. Motivation
5. Objectives
6. Scope of the Project
7. Proposed System Overview
8. Key Features
9. System Architecture
10. Module Breakdown
11. How It Works — The Processing Pipeline
12. Technology Stack
13. Database Design
14. Core Algorithms
15. Functional Requirements
16. Non-Functional Requirements
17. Unique Value Proposition
18. Implementation Plan (Two-Semester Timeline)
19. Testing Strategy
20. Expected Outcomes
21. Limitations
22. Future Scope
23. Conclusion
24. References

---

## 1. Abstract

Joining an unfamiliar software project is one of the most time-consuming activities in a developer's workflow. A new contributor typically spends days or weeks manually reading source files, searching for entry points, and reconstructing how the different parts of a system fit together — often with little or no up-to-date documentation to rely on.

**CodeCompass** is a web-based developer tool that automatically analyses a source-code repository and produces a *guided onboarding tour*: an ordered, human-readable walkthrough that tells a newcomer exactly which files to read, in what order, and why each one matters. Rather than acting only as a question-and-answer assistant, the system generates a structured learning path, an interactive dependency map, and traceable explanations that are grounded in the actual source code.

The system combines deterministic static analysis (structural parsing and dependency-graph construction) with a semantic explanation layer powered by a language model. The static analysis guarantees factual accuracy — every relationship shown is derived from real code — while the semantic layer translates the structure into plain-language guidance. The result is a tool that meaningfully reduces the time it takes a developer to become productive in a new codebase.

---

## 2. Introduction

Modern software systems are large, interconnected, and evolve rapidly. Documentation, when it exists, tends to describe intended design rather than the current state of the code, and it drifts out of date as the project changes. Consequently, the fastest and most reliable source of truth about a system is the source code itself — but reading a large codebase from scratch is slow and unstructured.

CodeCompass addresses this gap by turning a raw repository into structured, navigable onboarding material. It treats the codebase as the ground truth, extracts its structure automatically, and presents that structure as a guided experience aimed at a specific kind of reader (for example, a new hire, a contributor fixing a bug, or a reviewer auditing the system).

The project is intentionally designed as a **systems-heavy application with a bounded intelligence layer**. The bulk of the engineering lies in repository ingestion, structural parsing, graph construction, ranking, and the web application that presents the results. The language model is used for one clearly defined purpose — generating explanations and narrative — and is architected to be replaceable.

---

## 3. Problem Statement

When a developer joins a new project, their options for understanding it are all inadequate:

- **Reading the README** usually covers installation and setup, not architecture, and is frequently outdated.
- **Searching through code manually** works for small projects but breaks down as size grows.
- **Asking a teammate** interrupts them, does not scale, and the knowledge transferred is easily forgotten.
- **Reading every file sequentially** is impractical for any real-world codebase.

There is no tool in a typical developer's workflow that answers the single most important onboarding question — *"Where do I start, and what should I read next?"* — with an ordered, code-grounded plan. CodeCompass is built to answer exactly that.

---

## 4. Motivation

- **A universal, repeated pain point.** Every developer who has changed teams, joined an open-source project, or inherited a legacy system has felt the cost of slow onboarding.
- **Measurable impact.** Faster onboarding translates directly into productivity, and the effect is easy to demonstrate — a repository that would take days to understand can be reduced to a guided reading session.
- **Strong technical foundation.** The project draws on genuine computer-science concepts — static analysis, graph theory, and information retrieval — rather than being a thin wrapper around a single library.
- **A clear, memorable demonstration.** Pointing the tool at an unfamiliar repository and watching it produce a structured tour and a live dependency graph makes for a compelling, self-explanatory demo.

---

## 5. Objectives

1. To ingest any Git-based source repository and analyse its structure automatically.
2. To construct an accurate dependency and call graph derived directly from the source code.
3. To rank files and modules by importance so that the most significant parts of the system surface first.
4. To generate an ordered, guided onboarding tour tailored to a selected reader persona.
5. To produce plain-language explanations that are grounded in specific files and line ranges, avoiding unverifiable claims.
6. To visualise the architecture as an interactive, explorable dependency graph.
7. To detect and flag documentation that has become stale relative to the latest code changes.
8. To deliver all of the above through a clean, responsive web application.

---

## 6. Scope of the Project

**In scope:**

- Support for repositories in a defined set of mainstream languages (initially Python and JavaScript/TypeScript, with the parsing layer designed to extend to additional languages).
- Structural parsing, dependency-graph construction, importance ranking, tour generation, and persona tailoring.
- An interactive web interface with the tour view, the dependency-graph view, and a grounded question-answer view.
- Incremental re-analysis when a repository is updated, with staleness detection.

**Out of scope (for the initial version):**

- Automated code modification, refactoring, or pull-request generation.
- Deep runtime/dynamic analysis (the system performs static analysis only).
- Support for every programming language; the architecture allows extension, but only a limited set is targeted initially.
- Real-time multi-user collaborative editing of tours.

---

## 7. Proposed System Overview

CodeCompass is organised as a pipeline that transforms an input repository into structured onboarding output, wrapped in a web application.

At a high level:

1. A user submits a repository (a Git URL or an upload).
2. The system clones and ingests the repository.
3. A structural parser extracts symbols, imports, and call relationships.
4. A graph builder assembles these into a dependency/call graph.
5. A ranking engine scores files and modules by structural importance.
6. A tour generator selects and orders the material for the chosen persona.
7. A semantic layer produces explanations grounded in the code.
8. The web application presents the tour, the interactive graph, and a grounded Q&A interface.

The design principle throughout is a strict separation between **deterministic structure** (facts extracted from code) and **generated narrative** (explanations produced by the language model). Structure is never invented by the model; the model only explains structure that has already been extracted.

---

## 8. Key Features

The following features constitute the deliverable. They are grouped into core features (required for the project to be considered complete) and enhanced features (higher-value additions that strengthen the project).

### 8.1 Core Features

**F1 — Repository ingestion.**
Accept a public Git repository URL (or an uploaded archive), clone it, and prepare it for analysis. Handle common repository structures and ignore irrelevant files (build artefacts, dependencies, binaries).

**F2 — Structural code parsing.**
Parse source files to extract symbols (functions, classes, methods), import statements, and call relationships using a language-aware parser. This produces a precise, deterministic representation of the code's structure.

**F3 — Dependency & call graph construction.**
Assemble the extracted relationships into a directed graph of files and modules. Edges represent real import and call relationships taken directly from the source, not inferred or generated.

**F4 — Importance ranking.**
Score each file and module using graph-centrality measures so that entry points, core modules, and heavily-depended-upon components rank highest. This determines what a newcomer should look at first.

**F5 — Guided tour generation.**
Produce an *ordered* walkthrough — "read these files, in this sequence, and here is why each matters" — rather than an unordered summary. This ordered, guided path is the central feature of the system.

**F6 — Code-grounded explanations.**
For each item in the tour, generate a plain-language explanation of what the file/module does and how it fits into the whole, with every explanation linked to specific files and line ranges so the reader can verify it. The system does not assert that a component is responsible for behaviour unless it can point to the code that implements it.

**F7 — Interactive dependency-graph view.**
Render the dependency graph as an interactive, zoomable diagram. Users can click a node to inspect its connections and jump to the corresponding source. Large graphs are automatically aggregated to a module-level overview to remain readable.

**F8 — Grounded question-answer interface.**
Allow the user to ask natural-language questions about the repository ("where is authentication handled?") and receive answers grounded in retrieved source code, with citations to the exact files and lines.

**F9 — Web application shell.**
A responsive web interface presenting the tour, the graph, and the Q&A view, with the ability to manage multiple analysed repositories.

### 8.2 Enhanced Features

**F10 — Persona-tailored tours.**
Let the user select a reader persona (for example: *new contributor*, *bug fixer*, *security reviewer*). The same repository yields different tours emphasising the parts of the system relevant to that persona.

**F11 — End-to-end user-journey tracing.**
Trace one real path through the system — for example, from an application's entry point through to a database interaction — and present it as a narrated sequence, so the newcomer sees how the pieces connect in practice rather than only in the abstract.

**F12 — Staleness detection.**
When a repository is re-analysed after new commits, detect which previously-generated explanations or tour sections now refer to changed code, and flag them as potentially out of date. This directly addresses the well-known weakness of generated documentation drifting behind the code.

**F13 — Incremental re-analysis.**
On repository update, re-process only the changed portions rather than the whole codebase, keeping analysis fast and inexpensive after the first run.

**F14 — Model-agnostic explanation layer.**
Route all language-model calls through a single internal interface so the underlying model (a hosted API, a free-tier model, or a locally-run model) can be swapped through configuration without changing application logic.

**F15 — Export.**
Export a generated tour as a shareable document (for example, Markdown or PDF) so it can be committed to the repository or handed to a new team member.

---

## 9. System Architecture

CodeCompass follows a layered architecture with a clear separation between the analysis pipeline and the presentation layer.

```
+-------------------------------------------------------------+
|                     Web Frontend (Client)                   |
|   Tour View   |   Dependency Graph View   |   Q&A View      |
+-------------------------------------------------------------+
                          |  (REST API)
                          v
+-------------------------------------------------------------+
|                    Application / API Layer                  |
|   Request handling, auth, job orchestration, results API    |
+-------------------------------------------------------------+
        |                       |                     |
        v                       v                     v
+----------------+   +----------------------+   +----------------+
|  Ingestion     |   |  Analysis Pipeline   |   | Semantic Layer |
|  - clone/upload|   |  - structural parse  |   | - explanations |
|  - file filter |   |  - graph build       |   | - tour narrative|
|                |   |  - ranking           |   | - Q&A retrieval |
+----------------+   +----------------------+   +----------------+
        |                       |                     |
        v                       v                     v
+-------------------------------------------------------------+
|                     Storage Layer                           |
|   Relational DB (metadata, graph, tours) | Vector Store     |
|   Object storage (repo snapshots, exports)                  |
+-------------------------------------------------------------+
```

Long-running analysis is handled asynchronously through a background job queue, so that submitting a large repository does not block the web request. The client polls or subscribes for completion.

---

## 10. Module Breakdown

**M1 — Ingestion Module.**
Responsible for cloning or receiving a repository, filtering out irrelevant files, and producing a clean file inventory for analysis.

**M2 — Parsing Module.**
Runs a language-aware structural parser over each source file, extracting symbols, imports, and call sites. Produces a normalised, language-independent representation.

**M3 — Graph Module.**
Consumes the parsed output and builds the directed dependency/call graph. Handles aggregation to module level for large repositories.

**M4 — Ranking Module.**
Computes centrality and importance scores over the graph to determine reading priority.

**M5 — Tour Generation Module.**
Selects and orders content into a guided path, applies persona filtering, and assembles the user-journey trace.

**M6 — Semantic Module.**
Generates grounded explanations and tour narrative, and powers the retrieval-based Q&A. All model access passes through the model-agnostic interface.

**M7 — Staleness & Incremental Module.**
Compares repository states across commits, drives incremental re-analysis, and flags outdated content.

**M8 — API / Orchestration Module.**
Exposes the REST API, manages the job queue, and coordinates the pipeline stages.

**M9 — Frontend Module.**
Implements the tour view, interactive graph, Q&A interface, and repository management.

---

## 11. How It Works — The Processing Pipeline

1. **Submit.** The user provides a repository URL or upload and selects a persona.
2. **Ingest.** The repository is cloned; irrelevant files are excluded; a file inventory is produced.
3. **Parse.** Each source file is parsed structurally. Symbols, imports, and call relationships are extracted deterministically.
4. **Build graph.** The extracted relationships are assembled into a directed graph of files and modules. Every edge corresponds to a real relationship in the code.
5. **Rank.** Centrality measures score the graph; the most structurally important files rise to the top.
6. **Chunk & embed (for Q&A).** Source is split into meaningful chunks and embedded into a vector store to support grounded retrieval.
7. **Generate tour.** The ranking, persona, and graph are combined to select and order the reading path; a user-journey trace is assembled.
8. **Explain.** The semantic layer produces plain-language explanations for each tour item, each linked to specific files and line ranges.
9. **Present.** The web application renders the ordered tour, the interactive dependency graph, and the grounded Q&A interface.
10. **Update (later).** When the repository changes, incremental re-analysis updates only affected parts and flags stale content.

**Design invariant:** structure comes only from parsing; narrative comes only from the semantic layer. This keeps the factual backbone verifiable and confines generation to explanation.

---

## 12. Technology Stack

**Frontend**
- React (application shell and views)
- An interactive graph-rendering library with automatic layout (for the dependency-graph visualisation)
- Tailwind CSS (styling)

**Backend / API**
- Python with FastAPI (best ecosystem support for parsing and graph libraries)
- A background job queue for asynchronous analysis of large repositories

**Analysis**
- A language-aware structural parser for multi-language symbol/import/call extraction
- A graph library for building the dependency graph and computing centrality
- Code-oriented embedding models for the retrieval layer

**Semantic Layer**
- A language model accessed through a single model-agnostic interface, configurable to use a hosted API, a free-tier model, or a locally-run model

**Storage**
- A relational database (PostgreSQL) for repository metadata, the graph, tours, and job state
- A vector store for code embeddings used in retrieval
- Object storage for repository snapshots and exported tours

**Tooling**
- Git for version control
- Containerisation for reproducible setup and deployment

---

## 13. Database Design

The following is a representative schema (fields abbreviated). It will be refined during implementation.

**repositories**
- `id` (PK)
- `name`
- `source_url`
- `default_branch`
- `last_analyzed_commit`
- `status` (queued / analyzing / ready / failed)
- `created_at`

**files**
- `id` (PK)
- `repository_id` (FK → repositories)
- `path`
- `language`
- `importance_score`
- `last_changed_commit`

**graph_edges**
- `id` (PK)
- `repository_id` (FK)
- `source_file_id` (FK → files)
- `target_file_id` (FK → files)
- `edge_type` (import / call)

**tours**
- `id` (PK)
- `repository_id` (FK)
- `persona`
- `created_at`

**tour_steps**
- `id` (PK)
- `tour_id` (FK → tours)
- `order_index`
- `file_id` (FK → files)
- `explanation`
- `cited_line_start`
- `cited_line_end`
- `is_stale` (boolean)

**embeddings** *(may reside in the vector store rather than the relational DB)*
- `id`
- `repository_id`
- `file_id`
- `chunk_text`
- `vector`
- `line_start`, `line_end`

**analysis_jobs**
- `id` (PK)
- `repository_id` (FK)
- `state`
- `started_at`, `finished_at`
- `error_message`

---

## 14. Core Algorithms

**14.1 Structural extraction.**
Each source file is parsed into a syntax tree from which symbols, import statements, and call sites are read directly. Because this is derived from the grammar of the language, the extracted relationships are exact rather than estimated.

**14.2 Dependency-graph construction.**
Files (and, at a coarser level, modules) become nodes; import and call relationships become directed edges. For large repositories, file-level nodes are aggregated into module-level nodes to keep the graph comprehensible.

**14.3 Importance ranking.**
Graph-centrality measures (such as in-degree and PageRank-style importance) identify the files that many other files depend on, as well as likely entry points. These scores determine the reading order surfaced to the user.

**14.4 Tour ordering.**
The tour begins at high-level entry points and proceeds along dependency edges toward supporting modules, producing a path that mirrors how an experienced developer would explain the system — top-down, following the flow of control.

**14.5 Persona filtering.**
For a selected persona, the ranking is re-weighted so that persona-relevant files are emphasised (for example, a security reviewer's tour weights authentication and input-handling code more heavily).

**14.6 Grounded retrieval (Q&A).**
For questions, the system expands the query, retrieves the most relevant code chunks using a combination of vector similarity and keyword matching, and generates an answer constrained to the retrieved material, with citations to the source lines.

**14.7 Staleness detection.**
On re-analysis, the commit that last changed each file is compared against the commit at which its explanation was generated. Explanations tied to files that have since changed are flagged as potentially stale.

---

## 15. Functional Requirements

- The system shall accept a Git repository URL or an uploaded archive.
- The system shall parse supported-language source files and extract structural relationships.
- The system shall build and store a dependency graph for each analysed repository.
- The system shall rank files by structural importance.
- The system shall generate an ordered, persona-specific onboarding tour.
- The system shall link every explanation to specific files and line ranges.
- The system shall render an interactive dependency graph.
- The system shall answer natural-language questions with source-grounded, cited responses.
- The system shall detect and flag stale content after repository updates.
- The system shall allow export of a generated tour.

---

## 16. Non-Functional Requirements

- **Accuracy:** Structural relationships shown to the user must be derived from the code, not generated. Explanations must be verifiable against cited source.
- **Performance:** Initial analysis of a moderate repository should complete within a reasonable, bounded time; subsequent updates should be faster through incremental re-analysis.
- **Scalability:** The graph and interface must remain usable on larger repositories through module-level aggregation.
- **Usability:** A new user should be able to submit a repository and begin a tour with minimal instruction.
- **Portability:** The semantic layer must be swappable between hosted and local models via configuration.
- **Reliability:** Long-running analysis must be handled asynchronously and recover gracefully from failures.

---

## 17. Unique Value Proposition

CodeCompass is distinguished by four design decisions:

1. **A guided, ordered tour — not just an answer box.** The primary output is a sequenced reading path that directly answers "where do I start and what next," rather than requiring the user to already know what to ask.
2. **Persona-tailored onboarding.** The same repository produces different tours for different kinds of readers, matching what each actually needs to understand.
3. **Staleness awareness.** The system explicitly tracks and flags when generated guidance has fallen behind the code, addressing the single biggest weakness of automatically generated documentation.
4. **Verifiable, code-grounded explanations.** Every claim is tied to specific source lines, and the system never asserts responsibility for behaviour it cannot point to in the code — keeping the tool trustworthy.

---

## 18. Implementation Plan (Two-Semester Timeline)

**Semester 1 — Foundations and Core Pipeline**

- *Weeks 1–2:* Requirement finalisation, technology setup, repository skeleton, environment and containerisation.
- *Weeks 3–4:* Ingestion module — cloning, filtering, file inventory.
- *Weeks 5–7:* Parsing module — structural extraction for the first target language.
- *Weeks 8–9:* Graph module — dependency-graph construction and storage.
- *Weeks 10–11:* Ranking module — centrality-based importance scoring.
- *Weeks 12–13:* Basic web frontend and the interactive dependency-graph view; first end-to-end demo (repository → graph). **Milestone: structural analysis working end to end.**

**Semester 2 — Intelligence, Enhanced Features, and Polish**

- *Weeks 1–2:* Semantic layer with the model-agnostic interface; grounded explanations for tour items.
- *Weeks 3–4:* Guided tour generation with ordering; tour view in the frontend.
- *Weeks 5–6:* Grounded Q&A — chunking, embedding, retrieval, cited answers.
- *Weeks 7–8:* Enhanced features — persona-tailored tours and user-journey tracing.
- *Weeks 9–10:* Staleness detection and incremental re-analysis.
- *Weeks 11–12:* Export, second target language, performance tuning, caching.
- *Weeks 13–14:* Testing, evaluation, documentation, and final demonstration. **Milestone: complete system with core and enhanced features.**

---

## 19. Testing Strategy

- **Unit testing:** Individual functions in the parsing, graph, and ranking modules are tested against small, hand-verified code samples with known structure.
- **Integration testing:** The full pipeline is run on curated sample repositories to confirm that ingestion, parsing, graph building, ranking, and tour generation work together.
- **Accuracy validation:** Extracted dependency edges are checked against the actual imports/calls in test repositories to confirm the graph is faithful to the source.
- **Grounding checks:** Generated explanations are spot-checked to confirm that cited files and line ranges genuinely correspond to the claims made.
- **Performance testing:** Analysis time and memory are measured across repositories of increasing size to characterise scaling behaviour, and incremental re-analysis is timed against full re-analysis.
- **Usability review:** A small group of developers unfamiliar with a test repository use a generated tour and report whether it accelerated their understanding.

---

## 20. Expected Outcomes

- A working web application that turns an arbitrary supported-language repository into a guided onboarding tour.
- An accurate, interactive dependency-graph visualisation of any analysed repository.
- Ordered, persona-specific reading paths with code-grounded, cited explanations.
- A grounded question-answer facility over the codebase.
- Demonstrable reduction in the effort required to begin understanding an unfamiliar codebase, shown live during evaluation.

---

## 21. Limitations

- The system performs **static analysis only**; behaviour that emerges at runtime (dynamic dispatch, reflection, configuration-driven wiring) may not be fully captured.
- Language support is limited to the targeted set; extending to other languages requires additional parser configuration.
- The quality of generated explanations depends on the chosen language model; a locally-run model trades some quality for zero cost and privacy.
- Very large monorepos will require aggregation and may have longer first-run analysis times.

---

## 22. Future Scope

- Support for additional programming languages.
- Integration with hosting platforms so tours update automatically as commits land.
- Team features: shared, annotated tours and saved onboarding paths per project.
- Deeper analysis linking code to project history (commits, discussions) to explain *why* code exists, not only *what* it does.
- An editor/IDE extension that surfaces the relevant tour step for the file a developer is currently viewing.

---

## 23. Conclusion

CodeCompass reframes codebase onboarding as a solvable engineering problem rather than an unavoidable cost. By extracting a codebase's true structure deterministically and layering plain-language, verifiable explanations on top of it, the system produces something no static README can: an ordered, persona-aware, up-to-date guided tour that tells a newcomer exactly where to begin and what to read next. The project balances substantial systems engineering — ingestion, parsing, graph construction, ranking, and a full web application — with a focused, bounded intelligence layer, making it both technically rigorous and immediately useful.

---

## 24. References

*To be completed during the literature phase. Suggested categories of sources:*

- Foundations of static program analysis and abstract syntax trees.
- Graph-theory literature on centrality measures (degree centrality, PageRank).
- Information-retrieval and retrieval-augmented generation techniques for grounded question answering.
- Documentation on the chosen parsing, graph, embedding, and web frameworks.
- Studies on developer onboarding time and developer experience.

---

*Document version 1.0 — prepared for project finalisation.*
