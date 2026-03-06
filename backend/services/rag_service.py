"""
services/rag_service.py — Retrieval-Augmented Generation Orchestrator
"""
import logging
from typing import Dict, Any

from services.pinecone_service import search_medical_records
from services.llm_service import generate_answer
from services.embedding_service import translate_query_if_needed
from utils.trust_score import calculate_trust_score

logger = logging.getLogger(__name__)

def generate_medical_response(query: str) -> Dict[str, Any]:
    """
    RAG Orchestration Pipeline:
    1. Retrieve relevant medical records from Pinecone.
    2. Format the retrieved context and send to the LLM.
    3. Return the generated answer along with the retrieved evidence.

    Args:
        query: User's medical question.

    Returns:
        dict: {
            "answer": str,
            "sources": [{"text": str, "score": float}, ...],
            "trust_score": float
        }
    """
    logger.info("Starting RAG pipeline for query: '%s'", query)

    # 0. Translate query if not English
    processed_query = translate_query_if_needed(query)

    # 1 & 2: Retrieve relevant medical records from Pinecone
    try:
        records = search_medical_records(query=processed_query, top_k=5)
        logger.info("Retrieved %d records from Pinecone.", len(records))
    except Exception as exc:
        logger.error("Error retrieving records from Pinecone: %s", exc)
        raise RuntimeError(f"Retrieval failed: {exc}") from exc

    # 3 & 4: Format context and send to LLM
    context_lines = [f"- {r['text']}" for r in records]
    context_str = "\n".join(context_lines)

    try:
        answer = generate_answer(query=query, context=context_str)
        logger.info("Generated LLM answer successfully.")
    except Exception as exc:
        logger.error("Error generating LLM answer: %s", exc)
        raise RuntimeError(f"Generation failed: {exc}") from exc

    # 5: Compute trust score
    trust_score = calculate_trust_score(records)
    logger.info("Overall trust score calculated: %.2f%%", trust_score)

    # 6: Return generated answer + retrieved evidence + trust score
    return {
        "answer": answer,
        "sources": records,
        "trust_score": trust_score
    }
