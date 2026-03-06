"""
services/embedding_service.py — Query Translation Service
(Repurposed from local embeddings to translation since Pinecone handles embeddings natively)
"""
import logging
from langdetect import detect
from deep_translator import GoogleTranslator

logger = logging.getLogger(__name__)

def translate_query_if_needed(query: str) -> str:
    """
    Detects query language. If Hindi (hi) or Telugu (te), translates to English.
    Otherwise returns the original query.
    
    Args:
        query: User's raw question.
        
    Returns:
        The English-translated query, or the original if not hi/te.
    """
    if not query or not query.strip():
        return query

    try:
        lang = detect(query)
    except Exception as exc:
        logger.warning("Language detection failed: %s", exc)
        return query

    logger.info("Detected query language: '%s'", lang)

    if lang in ["hi", "te"]:
        try:
            translated_text = GoogleTranslator(source=lang, target='en').translate(query)
            logger.info("Translated query (%s -> en): '%s' -> '%s'", lang, query, translated_text)
            return translated_text
        except Exception as exc:
            logger.error("Translation failed: %s", exc)
            return query

    # Return original if it's already English or another unsupported language
    return query
