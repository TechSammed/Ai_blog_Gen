from __future__ import annotations

from fastapi import APIRouter

from models.schemas import (
    Blog, BlogyAnalysis, GenerateResponse, ImprovementsMapping,
    KeywordAnalysis, KeywordInput, Prediction, SerpGap,
)
from pipeline.graph import run_pipeline

router = APIRouter(prefix="/api", tags=["blog-engine"])


# ═══════════════════════════════════════════════════════════════
#  FALLBACK DEFAULTS (last resort — should never be needed
#  because graph.py already self-recovers)
# ═══════════════════════════════════════════════════════════════

_FALLBACK_KW = KeywordAnalysis(
    primary_keyword="AI blog automation",
    secondary_keywords=["SEO tools", "content marketing"],
    long_tail_keywords=["AI SEO tools India"],
    keyword_roi_score=75.0,
    internal_linking_suggestions=["/blog/ai-seo-guide"],
)
_FALLBACK_GAP = SerpGap(
    missing_topics=["case studies", "pricing"],
    competitor_weakness=["No FAQ section", "Slow page speed"],
)
_FALLBACK_PREDICTION = Prediction(
    seo_score_predicted=65,
    traffic_potential="Medium",
    ranking_difficulty="Medium",
    estimated_monthly_traffic=3000,
)
_FALLBACK_BLOGY = BlogyAnalysis(
    ux_issues=["Dashboard needs improvement"],
    seo_issues=["Missing meta tags"],
    conversion_gaps=["No email capture"],
    technical_risks=["No rate limiting"],
    feature_suggestions=["AI content outline generator"],
    product_differentiation="AI-native blogging platform",
    scalability="Supports ~500 concurrent users",
    improvements_mapping=[ImprovementsMapping(
        missing_feature="No SEO analysis",
        your_solution="Real-time SEO Validator Node",
    )],
)


@router.post("/generate", response_model=GenerateResponse)
async def generate_blog(payload: KeywordInput):
    """Run the full AI Blog Intelligence pipeline.

    NEVER throws — always returns structured JSON with status field.
    """
    warnings: list[str] = []

    try:
        state = await run_pipeline(payload.keyword)
    except Exception as exc:
        # Even if the entire pipeline somehow crashes, return structured output
        print(f"💥 PIPELINE CATASTROPHIC FAILURE: {exc}")
        return GenerateResponse(
            status="partial_success",
            message=f"Pipeline failed completely: {exc}. Returning fallback data.",
            keyword_analysis=_FALLBACK_KW,
            gap=_FALLBACK_GAP,
            prediction=_FALLBACK_PREDICTION,
            blogs=[Blog(title="AI Blog Automation", content="# AI Blog Automation\n\nFallback content.")],
            blogy_analysis=_FALLBACK_BLOGY,
        )

    # ---------- Extract with fallbacks ----------
    # State from LangGraph can be dict or object
    def _get(field: str, fallback):
        if isinstance(state, dict):
            val = state.get(field)
        else:
            val = getattr(state, field, None)
        if val is None:
            warnings.append(f"Missing '{field}', using fallback")
            return fallback
        return val

    keyword_analysis = _get("keyword_analysis", _FALLBACK_KW)
    gap = _get("gap", _FALLBACK_GAP)
    prediction = _get("prediction", _FALLBACK_PREDICTION)
    blogs = _get("blogs", [Blog(title="AI Blog Automation", content="Fallback content.")])
    blogy_analysis = _get("blogy_analysis", _FALLBACK_BLOGY)

    # Determine status
    status = "partial_success" if warnings else "success"
    message = "; ".join(warnings) if warnings else "All pipeline nodes completed successfully."

    return GenerateResponse(
        status=status,
        message=message,
        keyword_analysis=keyword_analysis,
        gap=gap,
        prediction=prediction,
        blogs=blogs,
        blogy_analysis=blogy_analysis,
    )
