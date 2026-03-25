from __future__ import annotations

import hashlib
import random

from models.schemas import SerpGap


def _seed(keyword: str) -> int:
    return int(hashlib.md5(keyword.encode()).hexdigest(), 16) % (10**9)


_MISSING_TOPIC_POOL = [
    "Comparison with open-source alternatives",
    "Pricing breakdown and hidden costs",
    "Integration with Indian payment gateways",
    "Regional language support and localization",
    "Step-by-step implementation guide",
    "Video tutorial or visual walkthrough",
    "Expert interviews or opinion roundup",
    "Performance benchmarks and load testing",
    "Mobile-first user experience analysis",
    "Data privacy and GDPR/IT Act compliance",
    "Accessibility (WCAG) compliance review",
    "Vendor lock-in risks and migration paths",
]

_WEAKNESS_POOL = [
    "Thin content — under 800 words with no depth",
    "Missing structured data / schema markup",
    "No FAQ section for featured snippets",
    "Poor internal linking strategy",
    "Outdated statistics (pre-2023)",
    "No original research or data",
    "Keyword stuffing detected",
    "Slow page speed (LCP > 4 s)",
    "No clear call-to-action",
    "Missing alt-text on images",
    "No mobile-responsive layout",
    "Duplicate meta descriptions across pages",
]


async def analyze_serp(keyword: str) -> SerpGap:
    """Return simulated SERP gap analysis for *keyword*."""
    rng = random.Random(_seed(keyword))

    missing = rng.sample(_MISSING_TOPIC_POOL, k=rng.randint(4, 7))
    weakness = rng.sample(_WEAKNESS_POOL, k=rng.randint(4, 7))

    return SerpGap(
        missing_topics=missing,
        competitor_weakness=weakness,
    )
