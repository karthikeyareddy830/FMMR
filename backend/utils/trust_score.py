"""
utils/trust_score.py — Simple confidence scorer based on Pinecone similarity
"""

def calculate_trust_score(records: list[dict]) -> float:
    """
    Calculate an overall trust score based on retrieved medical records.

    Formula: average(similarity_scores) * 100

    Args:
        records: A list of record dictionaries, each containing a "score" float.

    Returns:
        The trust score as a percentage float. E.g. 87.5
    """
    if not records:
        return 0.0

    total_score = sum(record.get("score", 0.0) for record in records)
    average_score = total_score / len(records)
    
    trust_score = average_score * 100
    
    return round(trust_score, 2)
