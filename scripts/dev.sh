#!/usr/bin/env bash
# Convenience wrapper. Plain `docker compose -f docker/docker-compose.yml up -d`
# does the same thing — this just prints the URLs and waits until the app is
# actually reachable.
#
#   ./scripts/dev.sh           start everything (leaves it running)
#   ./scripts/dev.sh logs      follow the API and worker logs
#   ./scripts/dev.sh stop      stop the containers, keep them and their data
#   ./scripts/dev.sh down      remove the containers, keep the data volumes
#   ./scripts/dev.sh reset     remove the containers AND delete all data
#
# Run from the repository root.
set -euo pipefail

COMPOSE="docker compose -f docker/docker-compose.yml"

case "${1:-up}" in
  up)
    $COMPOSE up -d
    echo "waiting for the app..."
    # --retry-all-errors matters: the port is open before the server is
    # listening, so early attempts fail with a reset, not a refusal.
    curl -sS --retry 60 --retry-delay 1 --retry-connrefused --retry-all-errors \
      -o /dev/null http://localhost:5173/
    curl -sS --retry 60 --retry-delay 1 --retry-connrefused --retry-all-errors \
      -o /dev/null http://localhost:8000/api/v1/health
    cat <<'URLS'

  App        http://localhost:5173
  API docs   http://localhost:8000/docs
  Neo4j      http://localhost:7474   (neo4j / codecompass)

URLS
    ;;
  logs)
    $COMPOSE logs -f api worker
    ;;
  stop)
    # Containers stay, so `up` next time is instant.
    $COMPOSE stop
    ;;
  down)
    $COMPOSE down
    ;;
  reset)
    # Destroys the database, the graph, and the vector store. Asks first.
    read -r -p "Delete all local CodeCompass data volumes? [y/N] " reply
    [[ "$reply" == "y" ]] && $COMPOSE down -v || echo "cancelled"
    ;;
  *)
    echo "usage: $0 [up|logs|stop|down|reset]" >&2
    exit 1
    ;;
esac
