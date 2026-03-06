"""
utils/prompt_guard.py — Security filter to prevent prompt injection and data leaks
"""
import logging

logger = logging.getLogger(__name__)

MALICIOUS_PHRASES = [
    "ignore instructions",
    "reveal system prompt",
    "leak data",
    "ignore previous",
    "system prompt",
]

def check_malicious_query(query: str) -> bool:
    """
    Check if a query contains known malicious phrases.
    
    Args:
        query: The user's input string.
        
    Returns:
        True if the query is deemed malicious, False otherwise.
    """
    if not query:
        return False
        
    query_lower = query.lower()
    
    for phrase in MALICIOUS_PHRASES:
        if phrase in query_lower:
            logger.warning("Malicious query detected: contains phrase '%s'", phrase)
            return True
            
    return False
