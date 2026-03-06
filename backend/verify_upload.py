"""
verify_upload.py — Verify Pinecone index contents after ingestion

Connects to the "healthcare-rag" index, prints the total record count,
runs a sample search query, and displays the top 3 results.

Usage:
    python verify_upload.py

Requirements in .env:
    PINECONE_API_KEY=<your key>
"""

import os
import sys
from dotenv import load_dotenv
from pinecone import Pinecone

# ── Config ────────────────────────────────────────────────────────────────────
load_dotenv()

INDEX_NAME   = "healthcare-rag"
SAMPLE_QUERY = "dizziness and insomnia"
TOP_K        = 3
NAMESPACE    = "__default__"


def main():
    # ── Validate environment ──────────────────────────────────────────────────
    api_key = os.getenv("PINECONE_API_KEY", "")
    if not api_key:
        print("ERROR: PINECONE_API_KEY not set in environment / .env file.")
        sys.exit(1)

    # ── Connect to Pinecone ───────────────────────────────────────────────────
    print(f"Connecting to Pinecone index '{INDEX_NAME}'...")
    pc    = Pinecone(api_key=api_key)
    index = pc.Index(INDEX_NAME)
    print("Connected.\n")

    # ── 1. Print total record count ───────────────────────────────────────────
    try:
        stats = index.describe_index_stats()
        # Total count key differs slightly across SDK versions
        total = (
            stats.get("total_vector_count")
            or stats.get("totalVectorCount")
            or sum(
                ns.get("vector_count", 0)
                for ns in stats.get("namespaces", {}).values()
            )
            or 0
        )
        print(f"Total records in index: {total}")
    except Exception as exc:
        print(f"WARNING: Could not retrieve index stats: {exc}")

    # ── 2. Run sample search query ────────────────────────────────────────────
    print(f"\nRunning sample query: \"{SAMPLE_QUERY}\"")
    print("-" * 55)

    try:
        response = index.search(
            namespace=NAMESPACE,
            query={
                "inputs": {"text": SAMPLE_QUERY},
                "top_k":  TOP_K,
            },
        )
    except Exception as exc:
        print(f"ERROR: Search query failed: {exc}")
        sys.exit(1)

    # ── 3. Print top results ──────────────────────────────────────────────────
    hits = (
        response.get("result", {}).get("hits", [])
        or response.get("matches", [])
    )

    if not hits:
        print("No results returned. The index may be empty or still indexing.")
        sys.exit(0)

    for rank, hit in enumerate(hits, start=1):
        metadata = hit.get("metadata") or hit.get("fields") or {}
        score    = hit.get("score") or hit.get("_score") or 0.0
        doc_id   = hit.get("id") or hit.get("_id", "unknown")
        text     = (
            metadata.get("text")
            or metadata.get("content")
            or "(no text field in metadata)"
        )

        print(f"\nResult #{rank}")
        print(f"  ID    : {doc_id}")
        print(f"  Score : {score:.4f}")
        print(f"  Text  : {text[:200]}{'...' if len(text) > 200 else ''}")

    print("\n" + "-" * 55)
    print("Verification complete.")


if __name__ == "__main__":
    main()
