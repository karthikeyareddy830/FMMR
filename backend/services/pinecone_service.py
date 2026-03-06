"""
services/pinecone_service.py — Pinecone client with integrated embeddings

With an "integrated embeddings" index, Pinecone handles the embedding model
internally. We pass raw query text directly — no local embedding step needed.

Pinecone SDK docs:
  https://docs.pinecone.io/guides/inference/integrated-embeddings
"""
import logging
from functools import lru_cache

from pinecone import Pinecone
from config import get_settings

logger = logging.getLogger(__name__)


# ── Pinecone client (cached singleton) ────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_index():
    """
    Initialise and cache the Pinecone Index object.
    Called once on first request; reused for all subsequent queries.
    """
    settings = get_settings()
    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index_name)
    logger.info(
        "Connected to Pinecone index: '%s'",
        settings.pinecone_index_name,
    )
    return index


# ── Public API ─────────────────────────────────────────────────────────────────

def search_medical_records(query: str, top_k: int = 5) -> list[dict]:
    """
    Search the "healthcare-rag" Pinecone index using integrated embeddings.
    
    Returns a clean list of dictionaries:
      [ { "text": "...", "score": 0.91 }, ... ]
    """
    if not query or not query.strip():
        logger.warning("search_medical_records called with empty query — returning []")
        return []

    index = _get_index()

    logger.info("Querying Pinecone | top_k=%d | query='%s...'", top_k, query[:60])

    try:
        response = index.search(
            namespace="__default__",
            query={
                "inputs": {"text": query},
                "top_k": top_k,
            },
        )
    except Exception as exc:
        logger.error("Pinecone search failed: %s", exc)
        raise RuntimeError(f"Pinecone query error: {exc}") from exc

    # Parse results
    results = []
    
    hits = (
        response.get("result", {}).get("hits", [])
        or response.get("matches", [])
    )

    for hit in hits:
        metadata = hit.get("metadata") or hit.get("fields") or {}
        score    = float(hit.get("score", hit.get("_score", 0.0)))
        
        text = (
            metadata.get("text")
            or metadata.get("content")
            or ""
        )

        results.append({
            "text": text,
            "score": round(score, 4)
        })

    logger.info("Returned %d results", len(results))
    return results
