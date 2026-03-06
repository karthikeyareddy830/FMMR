"""
ingest.py — Pinecone Ingestion Pipeline for Healthcare RAG

Reads the healthcare CSV dataset and uploads all records to the Pinecone index
in batches using integrated embeddings (multilingual-e5-large).

Because the index uses integrated embeddings, we send raw text records directly.
Pinecone's inference layer converts them to vectors — no local model required.

Usage:
    python ingest.py
    python ingest.py --file data/pinecone_ready_dataset.csv --batch-size 96
    python ingest.py --dry-run           # preview without uploading
"""

import argparse
import csv
import hashlib
import logging
import sys
import time
from pathlib import Path

from pinecone import Pinecone
from dotenv import load_dotenv

from config import get_settings

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("ingest")

# ── Defaults ──────────────────────────────────────────────────────────────────
DEFAULT_CSV     = Path(__file__).parent / "data" / "pinecone_ready_dataset.csv"
DEFAULT_BATCH   = 96          # Pinecone recommends ≤ 100 records per upsert
NAMESPACE       = ""          # change if your index uses namespaces
RETRY_LIMIT     = 3
RETRY_DELAY_SEC = 5


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_id(text: str, row_index: int) -> str:
    """
    Generate a stable, unique document ID from the text content.
    Falls back to row index if text is empty.
    Format: doc_<row>_<8-char-sha256>
    """
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:8]
    return f"doc_{row_index:05d}_{digest}"


def extract_source(text: str) -> str:
    """
    Try to extract a source label from the text.
    Dataset rows look like:
      'Patient symptoms: ... Possible disease: <Disease Name>.'
    We use the disease name as the 'source' metadata field.
    """
    lower = text.lower()
    marker = "possible disease:"
    if marker in lower:
        after = text[lower.index(marker) + len(marker):].strip()
        # Take everything up to the first period or end of string
        disease = after.split(".")[0].strip().title()
        return disease if disease else "Unknown"
    return "Unknown"


def load_csv(filepath: Path) -> list[dict]:
    """
    Read the CSV and return a list of dicts with keys: id, text, source, row.
    Skips empty rows.
    """
    records = []
    with filepath.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)

        if "text" not in (reader.fieldnames or []):
            raise ValueError(
                f"CSV must have a 'text' column. Found: {reader.fieldnames}"
            )

        for i, row in enumerate(reader, start=1):
            text = row.get("text", "").strip().strip('"')
            if not text:
                logger.warning("Row %d is empty — skipping.", i)
                continue

            records.append(
                {
                    "id":     make_id(text, i),
                    "text":   text,
                    "source": extract_source(text),
                    "row":    i,
                }
            )

    logger.info("Loaded %d valid records from '%s'.", len(records), filepath.name)
    return records


def batch(records: list, size: int):
    """Yield successive chunks of `size` from a list."""
    for i in range(0, len(records), size):
        yield records[i : i + size]


# ─────────────────────────────────────────────────────────────────────────────
# Ingestion
# ─────────────────────────────────────────────────────────────────────────────

def ingest(records: list[dict], index, batch_size: int, dry_run: bool) -> dict:
    """
    Upload records to Pinecone in batches via integrated embeddings.

    For an integrated-embedding index, we use `upsert_records` which accepts:
        [{ "id": str, "text": str, **extra_metadata }]
    Pinecone's inference layer embeds the "text" field automatically using the
    model configured on the index (multilingual-e5-large in our case).

    Returns:
        { "total": int, "upserted": int, "skipped": int, "failed": int }
    """
    total    = len(records)
    upserted = 0
    failed   = 0
    batches  = list(batch(records, batch_size))
    n_batches = len(batches)

    for batch_num, chunk in enumerate(batches, start=1):
        logger.info(
            "Batch %d / %d  (%d records)…",
            batch_num, n_batches, len(chunk),
        )

        if dry_run:
            logger.info("[DRY RUN] Would upsert %d records — skipping API call.", len(chunk))
            upserted += len(chunk)
            continue

        # ── Build records for integrated embedding upsert ─────────────────────
        # Each record must have "id" and the text field that the index maps to
        # its embedding. Additional fields are stored as metadata.
        pinecone_records = [
            {
                "_id":    rec["id"],       # Pinecone integrated record ID field
                "text":   rec["text"],     # field used for embedding by multilingual-e5-large
                "source": rec["source"],   # stored as filterable metadata
                "row":    rec["row"],      # original row number for debugging
            }
            for rec in chunk
        ]

        # ── Retry loop ────────────────────────────────────────────────────────
        for attempt in range(1, RETRY_LIMIT + 1):
            try:
                index.upsert_records(
                    records=pinecone_records,
                    namespace=NAMESPACE,
                )
                upserted += len(chunk)
                logger.info(
                    "  ✅ Batch %d upserted (%d/%d total).",
                    batch_num, upserted, total,
                )
                break   # success — exit retry loop

            except Exception as exc:
                logger.error(
                    "  ❌ Batch %d attempt %d/%d failed: %s",
                    batch_num, attempt, RETRY_LIMIT, exc,
                )
                if attempt < RETRY_LIMIT:
                    logger.info(
                        "  Retrying in %d seconds…", RETRY_DELAY_SEC * attempt
                    )
                    time.sleep(RETRY_DELAY_SEC * attempt)
                else:
                    logger.error(
                        "  Batch %d permanently failed after %d attempts.",
                        batch_num, RETRY_LIMIT,
                    )
                    failed += len(chunk)

    return {
        "total":    total,
        "upserted": upserted,
        "failed":   failed,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(
        description="Upload healthcare CSV dataset to Pinecone (integrated embeddings)."
    )
    parser.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_CSV,
        help=f"Path to the CSV dataset (default: {DEFAULT_CSV})",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=DEFAULT_BATCH,
        help=f"Number of records per Pinecone upsert batch (default: {DEFAULT_BATCH})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Load and validate the CSV but don't upload anything to Pinecone.",
    )
    parser.add_argument(
        "--namespace",
        type=str,
        default=NAMESPACE,
        help="Pinecone namespace to upsert into (default: empty string = default namespace).",
    )
    return parser.parse_args()


def main():
    load_dotenv()
    args = parse_args()
    settings = get_settings()

    logger.info("=" * 60)
    logger.info("  Healthcare RAG — Pinecone Ingestion Pipeline")
    logger.info("=" * 60)
    logger.info("  Index      : %s", settings.pinecone_index_name)
    logger.info("  Namespace  : %s", args.namespace or "(default)")
    logger.info("  CSV file   : %s", args.file)
    logger.info("  Batch size : %d", args.batch_size)
    logger.info("  Dry run    : %s", args.dry_run)
    logger.info("=" * 60)

    # ── Validate CSV exists ────────────────────────────────────────────────────
    if not args.file.exists():
        logger.error("CSV file not found: %s", args.file)
        sys.exit(1)

    # ── Load dataset ──────────────────────────────────────────────────────────
    try:
        records = load_csv(args.file)
    except Exception as exc:
        logger.error("Failed to load CSV: %s", exc)
        sys.exit(1)

    if not records:
        logger.error("No valid records found in the CSV. Aborting.")
        sys.exit(1)

    # ── Preview first 3 records ───────────────────────────────────────────────
    logger.info("\nSample records:")
    for r in records[:3]:
        logger.info("  id=%-30s  source=%-35s  text=%.60s…", r["id"], r["source"], r["text"])

    # ── Connect to Pinecone ───────────────────────────────────────────────────
    if not args.dry_run:
        logger.info("\nConnecting to Pinecone…")
        try:
            pc = Pinecone(api_key=settings.pinecone_api_key)
            index = pc.Index(settings.pinecone_index_name)
            stats = index.describe_index_stats()
            logger.info(
                "Connected. Index currently has %d records.",
                stats.get("total_vector_count", stats.get("namespaces", {})
                           .get("", {}).get("vector_count", "unknown")),
            )
        except Exception as exc:
            logger.error("Could not connect to Pinecone: %s", exc)
            sys.exit(1)
    else:
        index = None   # not needed for dry run

    # ── Run ingestion ─────────────────────────────────────────────────────────
    logger.info("\nStarting ingestion…")
    start = time.time()
    result = ingest(records, index, args.batch_size, args.dry_run)
    elapsed = time.time() - start

    # ── Summary ───────────────────────────────────────────────────────────────
    logger.info("\n" + "=" * 60)
    logger.info("  Ingestion complete in %.1f seconds", elapsed)
    logger.info("  Total records  : %d", result["total"])
    logger.info("  Upserted       : %d", result["upserted"])
    logger.info("  Failed         : %d", result["failed"])
    logger.info("=" * 60)

    if result["failed"] > 0:
        logger.warning("%d records failed to upload. Check logs above.", result["failed"])
        sys.exit(1)

    logger.info("✅ All records uploaded successfully!")


if __name__ == "__main__":
    main()
