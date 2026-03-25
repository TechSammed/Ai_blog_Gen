from __future__ import annotations

import hashlib
import random

from models.schemas import KeywordAnalysis, Prediction, SerpGap


def _seed(keyword: str) -> int:
    return int(hashlib.md5(keyword.encode()).hexdigest(), 16) % (10**9)


async def predict_performance(
    keyword_analysis: KeywordAnalysis,
    gap: SerpGap,
) -> Prediction:
    """Compute a simulated performance prediction.

    The heuristic blends the ROI score, number of exploitable SERP gaps,
    and keyword-cluster breadth to produce realistic-looking figures.
    """
    rng = random.Random(_seed(keyword_analysis.primary_keyword))


    gap_opportunity = min(len(gap.missing_topics) * 6, 40)
    cluster_breadth = min(len(keyword_analysis.long_tail_keywords) * 4, 30)
    roi_bonus = keyword_analysis.keyword_roi_score * 0.3

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


    weakness_count = len(gap.competitor_weakness)
    if weakness_count >= 6:
        difficulty = "Easy"
    elif weakness_count >= 4:
        difficulty = "Medium"
    else:
        difficulty = "Hard"

    return Prediction(
        seo_score_predicted=seo_score,
        traffic_potential=traffic,
        ranking_difficulty=difficulty,
        estimated_monthly_traffic=est_traffic,
    )
