from __future__ import annotations

import re

from models.schemas import SeoScore

def _word_count(text: str) -> int:
    return len(text.split())

def _sentence_count(text: str) -> int:
    return max(1, len(re.split(r"[.!?]+", text)))

def _syllable_count(word: str) -> int:
    """Rough syllable estimator (English)."""
    word = word.lower().strip(".,!?;:")
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

def _flesch_reading_ease(text: str) -> float:
    """Return Flesch Reading Ease score (0-100, higher = easier)."""
    words = text.split()
    wc = len(words)
    sc = _sentence_count(text)
    syllables = sum(_syllable_count(w) for w in words)
    if wc == 0 or sc == 0:
        return 50.0
    return 206.835 - 1.015 * (wc / sc) - 84.6 * (syllables / wc)

def _keyword_density(text: str, keyword: str) -> float:
    """Compute keyword density as a percentage using robust regex matching."""
    content = text.lower()
    kw = keyword.lower().strip()
    if not kw:
        return 0.0
    wc = _word_count(text)
    if wc == 0:
        return 0.0
    matches = len(re.findall(re.escape(kw), content))
    kw_word_count = len(kw.split())
    return round((matches * kw_word_count / wc) * 100, 2)

def _ai_detection_score(text: str) -> int:
    """Simulated AI detection: lower = more human-like."""
    ai_phrases = [
        "in today's world",
        "it's important to note",
        "in conclusion",
        "dive deep",
        "game-changer",
        "leverage",
        "unlock",
        "harness the power",
        "at the end of the day",
        "without further ado",
    ]
    text_lower = text.lower()
    hits = sum(1 for p in ai_phrases if p in text_lower)
    return min(95, 15 + hits * 8)

def _humanization_score(ai_score: int) -> int:
    """Inverse of AI detection — higher = more human."""
    return max(5, 100 - ai_score)

def _snippet_readiness(text: str) -> bool:
    """Check whether the blog contains FAQ-style Q&A suitable for snippets."""
    return bool(re.search(r"(##\s*Q:|###\s*Q:|<h[23]>Q:)", text, re.IGNORECASE))

def _extract_featured_snippet(text: str, keyword: str) -> str:
    """Pull out the best candidate paragraph for a featured snippet."""
    kw_lower = keyword.lower()
    paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 60]
    for p in paragraphs:
        if kw_lower in p.lower() and not p.startswith("#"):
            return p[:300].rsplit(" ", 1)[0] + "…" if len(p) > 300 else p
    return paragraphs[0][:300] if paragraphs else ""

async def validate_seo(blog: str, keyword: str) -> SeoScore:
    """Run the full SEO validation suite and return aggregated scores."""
    density = _keyword_density(blog, keyword)
    flesch = _flesch_reading_ease(blog)
    readability = max(0, min(100, int(flesch)))
    ai_score = _ai_detection_score(blog)
    human_score = _humanization_score(ai_score)
    snippet_ok = _snippet_readiness(blog)
    snippet_text = _extract_featured_snippet(blog, keyword)

    density_score = 100 - abs(density - 1.5) * 30  # ideal ≈ 1.5%
    snippet_bonus = 10 if snippet_ok else 0
    length_bonus = min(15, _word_count(blog) // 150)
    heading_bonus = min(10, blog.count("## ") * 2)

    raw = (
        density_score * 0.25
        + readability * 0.25
        + human_score * 0.20
        + snippet_bonus
        + length_bonus
        + heading_bonus
    )
    seo_score = max(10, min(100, int(raw)))

    return SeoScore(
        seo_score=seo_score,
        keyword_density=density,
        readability_score=readability,
        ai_detection_score=ai_score,
        snippet_readiness=snippet_ok,
        humanization_score=human_score,
        featured_snippet=snippet_text,
    )
