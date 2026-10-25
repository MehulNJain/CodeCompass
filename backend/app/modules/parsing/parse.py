"""M2 — Parsing: run the language adapter over each file in an inventory.

Structure comes only from here (the design invariant): deterministic syntax
trees, no language model.
"""

from app.core.logging import get_logger
from app.modules.ingestion.ingest import Inventory
from app.modules.parsing.languages import python
from app.modules.parsing.model import ParsedFile

logger = get_logger(__name__)

# ponytail: Python only for the first demo; JavaScript/TypeScript adapters
# plug in here (the grammars are already installed).
ADAPTERS = {"python": python.parse}


def parse_files(inventory: Inventory) -> list[ParsedFile]:
    """One ParsedFile per file whose language has an adapter. Files in other
    languages stay in the inventory but contribute no structure yet."""
    parsed = []
    for file in inventory.files:
        adapter = ADAPTERS.get(file.language or "")
        if adapter is None:
            continue
        imports, symbols = adapter((inventory.root / file.path).read_bytes())
        parsed.append(ParsedFile(file.path, file.language, imports, symbols))
    logger.info("parsed %d of %d files", len(parsed), len(inventory.files))
    return parsed
