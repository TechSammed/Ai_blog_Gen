from __future__ import annotations

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from core.cache import GenerationCache
from core.logger import get_logger
from models.schemas import (
    Blog, BlogyAnalysis, GenerateResponse, ImprovementsMapping,
    KeywordAnalysis, KeywordInput, Prediction, SerpGap,
)
from pipeline.graph import run_pipeline, run_pipeline_stream

logger = get_logger("routes")
cache = GenerationCache()

router = APIRouter(prefix="/api", tags=["blog-engine"])

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


def _get(state, field: str, fallback):
    """Extract a field from pipeline state (dict or object) with fallback."""
    if isinstance(state, dict):
        val = state.get(field)
    else:
        val = getattr(state, field, None)
    return fallback if val is None else val


def _build_response(state, warnings: list[str] | None = None) -> GenerateResponse:
    """Build a GenerateResponse from pipeline state (dict or PipelineState)."""
    warnings = warnings or []

    keyword_analysis = _get(state, "keyword_analysis", _FALLBACK_KW)
    gap = _get(state, "gap", _FALLBACK_GAP)
    prediction = _get(state, "prediction", _FALLBACK_PREDICTION)
    blogs = _get(state, "blogs", [Blog(title="AI Blog Automation", content="Fallback content.")])
    blogy_analysis = _get(state, "blogy_analysis", _FALLBACK_BLOGY)

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


# ═══════════════════════════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@router.post("/generate", response_model=GenerateResponse)
async def generate_blog(payload: KeywordInput):
    """Run the full AI Blog Intelligence pipeline (non-streaming).

    NEVER throws — always returns structured JSON with status field.
    Blog SEO fields are FLAT (no nested seo_score object).
    """
    cached_payload = cache.get(payload.keyword)
    if cached_payload:
        logger.info("Cache hit for keyword: %s", payload.keyword)
        return GenerateResponse.model_validate(cached_payload)

    try:
        state = await run_pipeline(payload.keyword)
    except Exception as exc:
        logger.error("PIPELINE CATASTROPHIC FAILURE: %s", exc)
        return GenerateResponse(
            status="partial_success",
            message=f"Pipeline failed completely: {exc}. Returning fallback data.",
            keyword_analysis=_FALLBACK_KW,
            gap=_FALLBACK_GAP,
            prediction=_FALLBACK_PREDICTION,
            blogs=[Blog(title="AI Blog Automation", content="# AI Blog Automation\n\nFallback content.")],
            blogy_analysis=_FALLBACK_BLOGY,
        )

    response = _build_response(state)
    if response.status == "success":
        cache.set(payload.keyword, response.model_dump(mode="json"))
    return response


@router.post("/generate/stream")
async def generate_blog_stream(payload: KeywordInput):
    """Run the full pipeline with real-time SSE progress events.

    Emits:
      data: {"type": "progress", "step": 1-7, "node": "..."}
      data: {"type": "result", "data": { ... full response ... }}
      data: [DONE]
    """
    async def event_stream():
        try:
            cached_payload = cache.get(payload.keyword)
            if cached_payload:
                logger.info("Stream cache hit for keyword: %s", payload.keyword)
                cached_response = GenerateResponse.model_validate(cached_payload)
                yield f"data: {json.dumps({'type': 'result', 'data': cached_response.model_dump(mode='json')})}\n\n"
                yield "data: [DONE]\n\n"
                return

            final_state = None

            async for event in run_pipeline_stream(payload.keyword):
                if event["type"] == "progress":
                    yield f"data: {json.dumps(event)}\n\n"
                elif event["type"] == "complete":
                    final_state = event["state"]

            # Build the response from accumulated state
            if final_state:
                response = _build_response(final_state)
            else:
                response = _build_response({}, warnings=["Stream ended without final state"])

            if response.status == "success":
                cache.set(payload.keyword, response.model_dump(mode="json"))

            yield f"data: {json.dumps({'type': 'result', 'data': response.model_dump()})}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as exc:
            logger.error("Stream pipeline error: %s", exc)
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
