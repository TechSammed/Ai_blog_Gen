from __future__ import annotations

import hashlib
import random
from typing import Any

from models.schemas import KeywordAnalysis, Prediction, SerpGap
from core.logger import get_logger

logger = get_logger("predictor")


def _seed(keyword: str) -> int:
    return int(hashlib.md5(keyword.encode()).hexdigest(), 16) % (10**9)


async def predict_performance(
    keyword_analysis: KeywordAnalysis | dict[str, Any] | None,
    gap: SerpGap | dict[str, Any] | None,
) -> Prediction:
    """Compute a simulated performance prediction."""

    # Safe Access
    if isinstance(keyword_analysis, dict):
        kw_primary = keyword_analysis.get("primary_keyword", "AI blog automation")
        roi = keyword_analysis.get("keyword_roi_score", 70.0)
        long_tails = keyword_analysis.get("long_tail_keywords", [])
    elif keyword_analysis:
        kw_primary = getattr(keyword_analysis, "primary_keyword", "AI blog automation")
        roi = getattr(keyword_analysis, "keyword_roi_score", 70.0)
        long_tails = getattr(keyword_analysis, "long_tail_keywords", [])
    else:
        kw_primary = "AI blog automation"
        roi = 70.0
        long_tails = []

    if isinstance(gap, dict):
        missing = gap.get("missing_topics", [])
        weaknesses = gap.get("competitor_weakness", [])
    elif gap:
        missing = getattr(gap, "missing_topics", [])
        weaknesses = getattr(gap, "competitor_weakness", [])
    else:
        missing = []
        weaknesses = []

    rng = random.Random(_seed(kw_primary))

    gap_opportunity = min(len(missing) * 6, 40)
    cluster_breadth = min(len(long_tails) * 4, 30)
    roi_bonus = roi * 0.3

    raw_score = gap_opportunity + cluster_breadth + roi_bonus + rng.uniform(-5, 5)
    seo_score = max(30, min(98, int(raw_score)))

    if seo_score >= 75:
        traffic = "High"
        est_traffic = rng.randint(8_000, 25_000)
    elif seo_score >= 50:
        traffic = "Medium"
        est_traffic = rng.randint(2_000, 8_000)
    else:
        traffic = "Low"
        est_traffic = rng.randint(300, 2_000)

    weakness_count = len(weaknesses)
    if weakness_count >= 6:
        difficulty = "Easy"
    elif weakness_count >= 4:
        difficulty = "Medium"
    else:
        difficulty = "Hard"

    logger.info(
        "Prediction: SEO=%d | traffic=%s | difficulty=%s | est=%d/mo",
        seo_score, traffic, difficulty, est_traffic,
    )

    return Prediction(
        seo_score_predicted=seo_score,
        traffic_potential=traffic,
        ranking_difficulty=difficulty,
        estimated_monthly_traffic=est_traffic,
    )
