from __future__ import annotations

import re

from models.schemas import SeoScore
from core.utils import (
    word_count, sentence_count, syllable_count,
    flesch_reading_ease, keyword_density, ai_detection_score,
    humanization_score,
)
from core.logger import get_logger

logger = get_logger("seo")


def _snippet_readiness(text: str) -> bool:
    """Check whether the blog contains FAQ-style Q&A suitable for snippets."""
    return bool(re.search(r"(##\s*Q:|###\s*Q:|<h[23]>Q:)", text, re.IGNORECASE))


def _extract_featured_snippet(text: str, keyword: str) -> str:
    """Pull out the best candidate paragraph for a featured snippet."""
    kw_lower = keyword.lower()
    paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 60]

    # Try exact keyword match first
    for p in paragraphs:
        if kw_lower in p.lower() and not p.startswith("#"):
            return p[:300].rsplit(" ", 1)[0] + "…" if len(p) > 300 else p

    # Fallback: find paragraph containing the most keyword terms
    stopwords = {"a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "is", "it", "by", "with", "as", "from"}
    terms = [w for w in kw_lower.split() if w not in stopwords and len(w) > 2]
    if terms:
        best_p, best_score = None, 0
        for p in paragraphs:
            if p.startswith("#"):
                continue
            p_lower = p.lower()
            score = sum(1 for t in terms if t in p_lower)
            if score > best_score:
                best_score = score
                best_p = p
        if best_p and best_score >= min(2, len(terms)):
            return best_p[:300].rsplit(" ", 1)[0] + "…" if len(best_p) > 300 else best_p

    return paragraphs[0][:300] if paragraphs else ""


async def validate_seo(blog: str, keyword: str) -> SeoScore:
    """Run the full SEO validation suite and return aggregated scores."""
    density = keyword_density(blog, keyword)
    flesch = flesch_reading_ease(blog)
    readability = max(0, min(100, int(flesch)))
    ai_score = ai_detection_score(blog)
    human_score = humanization_score(ai_score)
    snippet_ok = _snippet_readiness(blog)
    snippet_text = _extract_featured_snippet(blog, keyword)

    density_score = max(0, min(100, 100 - abs(density - 1.5) * 30))  # ideal ≈ 1.5%
    snippet_bonus = 10 if snippet_ok else 0
    length_bonus = min(15, word_count(blog) // 150)
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

    logger.info(
        "SEO validation: score=%d | density=%.2f%% | readability=%d | AI=%d",
        seo_score, density, readability, ai_score,
    )

    return SeoScore(
        seo_score=seo_score,
        keyword_density=density,
        readability_score=readability,
        ai_detection_score=ai_score,
        snippet_readiness=snippet_ok,
        humanization_score=human_score,
        featured_snippet=snippet_text,
    )
