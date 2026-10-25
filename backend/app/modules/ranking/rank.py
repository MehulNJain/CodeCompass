"""M4 — Ranking: score each file by how central it is to the codebase.

PageRank over the import graph (A imports B passes importance to B), so files
that many important files depend on rise to the top. Entry points get a boost:
nothing imports `__main__.py` or `cli.py`, yet they are where a reader starts.
"""

import networkx as nx

ENTRY_POINT_NAMES = {
    "__main__.py", "main.py", "cli.py", "app.py", "manage.py", "wsgi.py",
}
# ponytail: a flat x2 for entry points by file name; read setup.py /
# pyproject [project.scripts] when name-matching proves too blunt.
ENTRY_POINT_BOOST = 2.0


def rank(graph: nx.DiGraph) -> dict[str, float]:
    """Path -> score in [0, 1], where the most important file scores 1."""
    if graph.number_of_nodes() == 0:
        return {}
    scores = nx.pagerank(graph)
    for path in scores:
        if path.rsplit("/", 1)[-1] in ENTRY_POINT_NAMES:
            scores[path] *= ENTRY_POINT_BOOST
    top = max(scores.values())
    return {path: score / top for path, score in scores.items()}

