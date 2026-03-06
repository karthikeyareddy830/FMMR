"""
ingest_data.py — Upload healthcare dataset to Pinecone (integrated embeddings)

Reads data/pinecone_ready_dataset.csv and upserts all records into the
"healthcare-rag" Pinecone index in batches of 100.

Usage:
    python ingest_data.py

Requirements in .env:
    PINECONE_API_KEY=<your key>
"""

import csv
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from pinecone import Pinecone

# ── Config ────────────────────────────────────────────────────────────────────
load_dotenv()

CSV_PATH     = Path(__file__).parent / "data" / "pinecone_ready_dataset.csv"
INDEX_NAME   = "healthcare-rag"
BATCH_SIZE   = 96
NAMESPACE    = "__default__"
MAX_RETRIES  = 3          # attempts per batch before giving up
RETRY_DELAY  = 5          # seconds to wait before first retry (doubles each attempt)


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_records(filepath: Path) -> list[dict]:
    """
    Read the CSV and return a list of record dicts.
    Each record has:
        _id  — stable string ID (e.g. "doc_00001")
        text — the raw text from the 'text' column
    """
    records = []

    with filepath.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)

        if not reader.fieldnames or "text" not in reader.fieldnames:
            print(f"ERROR: CSV must have a 'text' column. Found: {reader.fieldnames}")
            sys.exit(1)

        for i, row in enumerate(reader, start=1):
            text = row.get("text", "").strip().strip('"')
            if not text:
                continue
            records.append({
                "_id":  f"doc_{i:05d}",
                "text": text,
            })

    return records


def chunked(lst: list, size: int):
    """Yield successive chunks of `size` from lst."""
    for i in range(0, len(lst), size):
        yield lst[i : i + size]


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    # ── Validate environment ──────────────────────────────────────────────────
    api_key = os.getenv("PINECONE_API_KEY", "")
    if not api_key:
        print("ERROR: PINECONE_API_KEY not set in environment / .env file.")
        sys.exit(1)

    # ── Validate CSV path ─────────────────────────────────────────────────────
    if not CSV_PATH.exists():
        print(f"ERROR: Dataset not found at {CSV_PATH}")
        sys.exit(1)

    # ── Load records ──────────────────────────────────────────────────────────
    print(f"Loading records from '{CSV_PATH}'…")
    records = load_records(CSV_PATH)

    if not records:
        print("ERROR: No valid records found in the CSV.")
        sys.exit(1)

    print(f"Loaded {len(records)} records.")

    # ── Connect to Pinecone ───────────────────────────────────────────────────
    print(f"Connecting to Pinecone index '{INDEX_NAME}'…")
    pc    = Pinecone(api_key=api_key)
    index = pc.Index(INDEX_NAME)
    print("Connected.")

    # ── Upload in batches ─────────────────────────────────────────────────────
    total     = len(records)
    uploaded  = 0
    failed    = 0
    n_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE   # ceil division

    print(f"\nUploading {total} records in {n_batches} batches of {BATCH_SIZE}…\n")

    for batch_num, start in enumerate(range(0, total, BATCH_SIZE), start=1):
        # Slice out the next batch using direct index arithmetic
        batch = records[start : start + BATCH_SIZE]

        # ── Retry loop ────────────────────────────────────────────────────────
        success = False
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                index.upsert_records(
                    records=batch,
                    namespace=NAMESPACE,
                )
                success = True
                break   # upload succeeded — exit retry loop

            except Exception as exc:
                print(
                    f"  ERROR: Batch {batch_num}/{n_batches} failed "
                    f"(attempt {attempt}/{MAX_RETRIES}): {exc}"
                )
                if attempt < MAX_RETRIES:
                    wait = RETRY_DELAY * attempt   # 5s, 10s, 15s …
                    print(f"  Retrying in {wait} seconds…")
                    time.sleep(wait)
                else:
                    print(
                        f"  SKIPPING batch {batch_num} after {MAX_RETRIES} "
                        f"failed attempts. Records {start + 1}–{start + len(batch)} lost."
                    )

        if success:
            uploaded += len(batch)
            print(f"  Batch {batch_num}/{n_batches} uploaded — {uploaded}/{total} records")
        else:
            failed += len(batch)

        # Release this batch from memory before the next iteration
        del batch

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\nUpload finished")
    print(f"  Successfully uploaded : {uploaded}/{total} records")
    if failed > 0:
        print(f"  Failed (skipped)      : {failed}/{total} records")
        print("  Check the error messages above for details.")
        sys.exit(1)


if __name__ == "__main__":
    main()
