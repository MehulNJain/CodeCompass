# 0001 — Store embeddings in PostgreSQL (pgvector), not Chroma

**Status:** accepted

The presented stack lists Chroma as the vector store. We use the `pgvector`
extension in the existing PostgreSQL instead.

- One fewer service to run, configure, and back up.
- Chunks can reference `files` and `repositories` with real foreign keys, so
  deleting a repository deletes its embeddings, and ownership checks are a join.
- Hybrid retrieval (doc §14: vector similarity + keyword matching) is one SQL
  query — pgvector distance plus Postgres full-text search.
- Volume is a few repositories' worth of chunks; Postgres handles that easily.

**Consequence:** Compose runs `pgvector/pgvector:pg16`. M6 enables the
extension (`CREATE EXTENSION IF NOT EXISTS vector`) in its migration and adds
the `pgvector` Python package alongside the embeddings table.
