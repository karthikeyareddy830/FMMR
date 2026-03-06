"""
models.py — Pydantic request/response schemas
"""
from pydantic import BaseModel, Field
from typing import Optional


# ── Request ───────────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="The medical question to answer.",
        examples=["What are the symptoms of Type 2 diabetes?"],
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of documents to retrieve from Pinecone.",
    )
    language: str = Field(
        default="en",
        description="Query language code. Supported: en, hi, te.",
        pattern="^(en|hi|te)$",
    )


# ── Retrieved Document ────────────────────────────────────────────────────────

class DocumentResult(BaseModel):
    id: str = Field(..., description="Pinecone document ID.")
    text: str = Field(..., description="Chunk text of the retrieved document.")
    score: float = Field(..., description="Cosine similarity score from Pinecone (0–1).")
    source: str = Field(default="Unknown", description="Source name (e.g. WHO, PubMed).")
    trust_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Computed trust score combining similarity + source reputation.",
    )
    metadata: Optional[dict] = Field(
        default=None,
        description="Raw metadata from Pinecone (title, url, etc.).",
    )


# ── Response ──────────────────────────────────────────────────────────────────

class QueryResponse(BaseModel):
    answer: str = Field(..., description="LLM-generated answer.")
    sources: list[DocumentResult] = Field(
        ..., description="Top-k retrieved documents with trust scores."
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Overall response confidence (avg of top document trust scores).",
    )
    language: str = Field(..., description="Language code the answer was generated in.")
    query: str = Field(..., description="Original query echoed back.")


# ── Health Check ──────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    environment: str
    pinecone_index: str
    embedding_model: str
    llm_provider: str
