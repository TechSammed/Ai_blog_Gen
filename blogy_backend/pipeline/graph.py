

from __future__ import annotations

import traceback
from typing import Any, TypedDict, Optional

from langgraph.graph import END, StateGraph

from models.schemas import (
    BlogyAnalysis,
    KeywordAnalysis,
    PlatformFormats,
    Prediction,
    SeoScore,
    SerpGap,
)


class PipelineState(TypedDict, total=False):
    keyword: str
    keyword_analysis: Optional[KeywordAnalysis]
    gap: Optional[SerpGap]
    prediction: Optional[Prediction]
    blog: str
    seo_score: Optional[SeoScore]
    platform_formats: Optional[PlatformFormats]
    blogy_analysis: Optional[BlogyAnalysis]
    error: Optional[str]


async def keyword_node(state: PipelineState) -> dict[str, Any]:
    """Node 1 — Keyword Intelligence."""
    try:
        from core.keyword import expand_keywords
        result = await expand_keywords(state["keyword"])
        return {"keyword_analysis": result}
    except Exception as exc:
        return {"error": f"keyword_node failed: {exc}\n{traceback.format_exc()}"}


async def serp_node(state: PipelineState) -> dict[str, Any]:
    """Node 2 — SERP Gap Analyzer."""
    try:
        from core.serp import analyze_serp
        result = await analyze_serp(state["keyword"])
        return {"gap": result}
    except Exception as exc:
        return {"error": f"serp_node failed: {exc}\n{traceback.format_exc()}"}


async def predictor_node(state: PipelineState) -> dict[str, Any]:
    """Node 3 — Performance Predictor."""
    try:
        from core.predictor import predict_performance
        result = await predict_performance(
            state["keyword_analysis"],  
            state["gap"],  
        )
        return {"prediction": result}
    except Exception as exc:
        return {"error": f"predictor_node failed: {exc}\n{traceback.format_exc()}"}


async def generator_node(state: PipelineState) -> dict[str, Any]:
    """Node 4 — Blog Generator (multi-step)."""
    try:
        from core.generator import generate_blog
        blog = await generate_blog(
            state["keyword_analysis"],  
            state.get("gap"),
        )
        return {"blog": blog}
    except Exception as exc:
        return {"error": f"generator_node failed: {exc}\n{traceback.format_exc()}"}


async def seo_node(state: PipelineState) -> dict[str, Any]:
    """Node 5 — SEO Validator."""
    try:
        from core.seo import validate_seo
        result = await validate_seo(state["blog"], state["keyword"])
        return {"seo_score": result}
    except Exception as exc:
        return {"error": f"seo_node failed: {exc}\n{traceback.format_exc()}"}


async def export_node(state: PipelineState) -> dict[str, Any]:
    """Node 6 — Blog Export (Part 3)."""
    try:
        from core.exporter import format_for_platforms
        result = await format_for_platforms(state["blog"])
        return {"platform_formats": result}
    except Exception as exc:
        return {"error": f"export_node failed: {exc}\n{traceback.format_exc()}"}


async def blogy_node(state: PipelineState) -> dict[str, Any]:
    """Node 7 — Blogy Dashboard Analysis (Part 2)."""
    try:
        from core.blogy_analysis import analyze_blogy
        result = await analyze_blogy()
        return {"blogy_analysis": result}
    except Exception as exc:
        return {"error": f"blogy_node failed: {exc}\n{traceback.format_exc()}"}

def _build_graph() -> StateGraph:
    graph = StateGraph(PipelineState)

    # Register nodes
    graph.add_node("keyword_node", keyword_node)
    graph.add_node("serp_node", serp_node)
    graph.add_node("predictor_node", predictor_node)
    graph.add_node("generator_node", generator_node)
    graph.add_node("seo_node", seo_node)
    graph.add_node("export_node", export_node)
    graph.add_node("blogy_node", blogy_node)

    # Define edges (linear pipeline)
    graph.set_entry_point("keyword_node")
    graph.add_edge("keyword_node", "serp_node")
    graph.add_edge("serp_node", "predictor_node")
    graph.add_edge("predictor_node", "generator_node")
    graph.add_edge("generator_node", "seo_node")
    graph.add_edge("seo_node", "export_node")
    graph.add_edge("export_node", "blogy_node")
    graph.add_edge("blogy_node", END)

    return graph


# Compile once at module level
_compiled_graph = _build_graph().compile()


async def run_pipeline(keyword: str) -> PipelineState:
    """Execute the full LangGraph pipeline for a given keyword.

    Returns the final state dict with all analysis results populated.
    """
    initial_state: PipelineState = {
        "keyword": keyword,
        "keyword_analysis": None,
        "gap": None,
        "prediction": None,
        "blog": "",
        "seo_score": None,
        "platform_formats": None,
        "blogy_analysis": None,
        "error": None,
    }

    result = await _compiled_graph.ainvoke(initial_state)
    return result  
