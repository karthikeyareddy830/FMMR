"""
routes/query.py — POST /api/query  (the core RAG endpoint)

Pipeline (integrated-embedding version):
  1. Pass raw query text → Pinecone (index embeds internally)
  2. Apply trust scoring to retrieved documents
  3. Send top docs as context → LLM
  4. Return answer + sources + confidence
"""
import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List

from services.rag_service import generate_medical_response
from utils.prompt_guard import check_malicious_query

logger = logging.getLogger(__name__)
router = APIRouter(tags=["RAG Query"])


# ── Request / Response Schemas ────────────────────────────────────────────────

class SimpleQueryRequest(BaseModel):
    query: str = Field(..., description="The user query to search for.")

class SimpleResult(BaseModel):
    text: str
    score: float

class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    trust_score: float
    sources: List[SimpleResult]


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post(
    "/query",
    response_model=RAGQueryResponse,
    summary="Ask a healthcare question via RAG",
)
async def query_endpoint(request: SimpleQueryRequest) -> RAGQueryResponse:
    logger.info("Received query: '%s'", request.query)

    # Security check: reject malicious queries
    if check_malicious_query(request.query):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query rejected: Malicious content detected."
        )

    try:
        # Step 1-4: Retrieve documents + Generate LLM Response
        rag_output = generate_medical_response(query=request.query)
    except Exception as exc:
        logger.error("RAG pipeline error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG orchestrator failed: {exc}"
        )

    # Format the results exactly as requested
    results = [
        SimpleResult(
            text=match["text"],
            score=round(match["score"], 4),
        )
        for match in rag_output["sources"]
    ]

    return RAGQueryResponse(
        query=request.query,
        answer=rag_output["answer"],
        trust_score=rag_output["trust_score"],
        sources=results
    )
