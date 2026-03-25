
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from models.schemas import GenerateResponse, KeywordInput
from pipeline.graph import run_pipeline

router = APIRouter(prefix="/api", tags=["blog-engine"])


@router.post("/generate", response_model=GenerateResponse)
async def generate_blog(payload: KeywordInput):
    """Run the full AI Blog Intelligence pipeline for a keyword.

    Accepts ``{"keyword": "..."}`` and returns the combined output from
    all 7 pipeline nodes: keyword analysis, SERP gap, prediction,
    generated blog, SEO score, platform formats, and Blogy analysis.
    """
    try:
        state = await run_pipeline(payload.keyword)

        # Check for pipeline-level errors
        if state.get("error"):
            raise HTTPException(status_code=500, detail=state["error"])

        # Validate that all required fields are populated
        required = [
            "keyword_analysis", "gap", "prediction",
            "blog", "seo_score", "platform_formats", "blogy_analysis",
        ]
        for field in required:
            if state.get(field) is None:
                raise HTTPException(
                    status_code=500,
                    detail=f"Pipeline did not produce '{field}'",
                )

        return GenerateResponse(
            keyword_analysis=state["keyword_analysis"],  # type: ignore[arg-type]
            gap=state["gap"],  # type: ignore[arg-type]
            prediction=state["prediction"],  # type: ignore[arg-type]
            blog=state["blog"],
            seo_score=state["seo_score"],  # type: ignore[arg-type]
            platform_formats=state["platform_formats"],  # type: ignore[arg-type]
            blogy_analysis=state["blogy_analysis"],  # type: ignore[arg-type]
        )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
