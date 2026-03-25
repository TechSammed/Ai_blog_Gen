from __future__ import annotations

import hashlib
import random

from models.schemas import KeywordAnalysis
def _seed(keyword: str) -> int:
    return int(hashlib.md5(keyword.encode()).hexdigest(), 16) % (10**9)
_SECONDARY_TEMPLATES = [
    "{kw} tools",
    "{kw} strategies",
    "{kw} guide",
    "how to use {kw}",
    "{kw} for beginners",
    "{kw} best practices",
    "{kw} tips and tricks",
    "{kw} comparison",
]

_LONGTAIL_TEMPLATES = [
    "best {kw} for small businesses in India",
    "how to improve {kw} in 2025",
    "{kw} step by step tutorial",
    "top 10 {kw} platforms",
    "free {kw} resources for startups",
    "why {kw} matters for SEO",
    "{kw} case studies and results",
    "{kw} vs traditional approaches",
    "affordable {kw} solutions",
    "{kw} ROI calculator",
]

_LINKING_TEMPLATES = [
    "/blog/{slug}-ultimate-guide",
    "/blog/{slug}-case-study",
    "/resources/{slug}-checklist",
    "/tools/{slug}-analyzer",
    "/blog/{slug}-vs-competitors",
]


async def expand_keywords(keyword: str) -> KeywordAnalysis:
    """Simulate keyword clustering and expansion."""
    rng = random.Random(_seed(keyword))
    slug = keyword.lower().replace(" ", "-")

    secondary = [t.format(kw=keyword) for t in rng.sample(_SECONDARY_TEMPLATES, k=min(5, len(_SECONDARY_TEMPLATES)))]
    long_tail = [t.format(kw=keyword) for t in rng.sample(_LONGTAIL_TEMPLATES, k=min(6, len(_LONGTAIL_TEMPLATES)))]
    links = [t.format(slug=slug) for t in rng.sample(_LINKING_TEMPLATES, k=min(3, len(_LINKING_TEMPLATES)))]
    roi = round(rng.uniform(45, 95), 1)

    return KeywordAnalysis(
        primary_keyword=keyword,
        secondary_keywords=secondary,
        long_tail_keywords=long_tail,
        keyword_roi_score=roi,
        internal_linking_suggestions=links,
    )
