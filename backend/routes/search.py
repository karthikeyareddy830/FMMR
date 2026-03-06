"""
routes/search.py — POST /search
Lightweight document search endpoint (no LLM).
Returns raw Pinecone results for testing or direct document retrieval.
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Body
from pydantic import BaseModel, Field

from services.pinecone_service import search_medical_records

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Document Search"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=2,
        max_length=500,
        description="Medical question or keyword to search.",
        examples=["symptoms of Type 2 diabetes"],
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of documents to retrieve.",
    )


class SearchHit(BaseModel):
    text: str = Field(..., description="Document chunk text.")
    score: float = Field(..., description="Relevance score (higher = more relevant).")


class SearchResponse(BaseModel):
    query: str
    total: int = Field(..., description="Number of documents returned.")
    results: list[SearchHit]


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post(
    "/search",
    response_model=SearchResponse,
    summary="Search medical documents",
    description=(
        "Queries the Pinecone vector index with integrated embeddings and returns "
        "the top matching medical document chunks. No LLM is invoked."
    ),
    response_description="Top-k matching documents ordered by relevance.",
)
async def search_endpoint(
    body: Annotated[SearchRequest, Body(embed=False)],
) -> SearchResponse:
    logger.info("POST /search | top_k=%d | '%s'", body.top_k, body.query[:80])

    matches = search_medical_records(query=body.query, top_k=body.top_k)

    results = [
        SearchHit(
            text=m["text"],
            score=round(m["score"], 6)
        )
        for m in matches
    ]

    logger.info("Returning %d results for query '%s'", len(results), body.query[:40])

    return SearchResponse(
        query=body.query,
        total=len(results),
        results=results,
    )
