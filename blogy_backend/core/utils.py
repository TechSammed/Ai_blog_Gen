
from __future__ import annotations

import asyncio
import os
import re

from core.logger import get_logger

logger = get_logger("utils")


def get_llm(temperature: float = 0.3, max_tokens: int = 4000):
    """Create a Groq LLM instance. Shared across all pipeline nodes."""
    from langchain_groq import ChatGroq
    return ChatGroq(
        api_key=os.environ.get("GROQ_API_KEY", ""),
        model="llama-3.1-8b-instant",
        temperature=temperature,
        max_tokens=max_tokens,
    )



async def safe_llm_call(func, *args, max_retries: int = 3):
    """Call an async LLM function with automatic retry on rate limits."""
    for attempt in range(max_retries):
        try:
            return await func(*args)
        except Exception as e:
            error_str = str(e).lower()
            if "rate_limit" in error_str or "429" in error_str or "too many" in error_str:
                wait_time = 2 * (attempt + 1)
                logger.warning("Rate limit hit, waiting %ds (attempt %d/%d)", wait_time, attempt + 1, max_retries)
                await asyncio.sleep(wait_time)
            else:
                raise e
    return await func(*args)



def word_count(text: str) -> int:
    return len(text.split())


def sentence_count(text: str) -> int:
    return max(1, len(re.split(r"[.!?]+", text)))


def syllable_count(word: str) -> int:
    """Rough syllable estimator (English)."""
    word = word.lower().strip(".,!?;:\"'()-")
    if len(word) <= 3:
        return 1
    vowels = "aeiou"
    count = 0
    prev_vowel = False
    for ch in word:
        is_vowel = ch in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    if word.endswith("e") and count > 1:
        count -= 1
    return max(1, count)


def flesch_reading_ease(text: str) -> float:
    """Return Flesch Reading Ease score (0-100, higher = easier)."""
    words = text.split()
    wc = len(words)
    sc = sentence_count(text)
    syllables = sum(syllable_count(w) for w in words)
    if wc == 0 or sc == 0:
        return 50.0
    return 206.835 - 1.015 * (wc / sc) - 84.6 * (syllables / wc)


def keyword_density(text: str, keyword: str) -> float:
    """Compute keyword density as a percentage.

    For multi-word keywords that rarely appear as an exact phrase,
    falls back to counting individual significant terms.
    """
    content = text.lower()
    kw = keyword.lower().strip()
    if not kw:
        return 0.0

    words = len(content.split())
    if words == 0:
        return 0.0

    exact_matches = len(re.findall(re.escape(kw), content))
    kw_word_count = len(kw.split())

    if kw_word_count <= 2 or exact_matches > 0:
        return round((exact_matches * kw_word_count / words) * 100, 2)

    stopwords = {
        "a", "an", "the", "in", "on", "at", "to", "for", "of", "and",
        "or", "is", "it", "by", "with", "as", "from", "that", "this",
        "be", "are", "was", "were", "been", "being", "has", "have", "had",
        "do", "does", "did", "will", "would", "could", "should", "can",
        "may", "might", "shall", "not", "no", "but", "if", "so", "up",
    }
    terms = [w for w in kw.split() if w not in stopwords and len(w) > 2]
    if not terms:
        return 0.0

    term_hits = sum(len(re.findall(r'\b' + re.escape(t) + r'\b', content)) for t in terms)
    return round((term_hits / words) * 100, 2)


def ai_detection_score(text: str) -> int:
    """Score how AI-like the text sounds. Lower = more human. Target: ≤20."""
    ai_indicators = [
        "it's worth noting", "importantly", "furthermore", "additionally",
        "in summary", "to summarize", "overall", "in essence",
        "as we can see", "as mentioned", "as discussed", "moving forward",
        "it should be noted", "on the other hand", "having said that",
        "with that being said", "that being said", "all in all",
        "to conclude", "in a nutshell", "at its core",
    ]
    banned = [
        "the future looks bright", "in today's world", "rapidly evolving",
        "revolutionizing", "game-changer", "game changer", "dive deep",
        "harness the power", "it's important to note", "it is important to note",
        "in the ever-evolving", "cutting-edge", "groundbreaking",
        "leverage the power", "paradigm shift", "synergy",
    ]
    text_lower = text.lower()
    hits = sum(1 for phrase in ai_indicators if phrase in text_lower)
    banned_hits = sum(1 for phrase in banned if phrase in text_lower)
    return min(95, 10 + hits * 5 + banned_hits * 8)


def humanization_score(ai_score: int) -> int:
    """Inverse of AI detection — higher = more human."""
    return max(5, 100 - ai_score)


def sanitize_keyword(keyword: str) -> str:
    """Sanitize user keyword input."""
    keyword = re.sub(r'<[^>]+>', '', keyword)       
    keyword = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', keyword)  
    keyword = ' '.join(keyword.split())             
    return keyword.strip()
