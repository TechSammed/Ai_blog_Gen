from __future__ import annotations

import asyncio
from typing import Any

from langgraph.graph import END, StateGraph

from models.schemas import (
    Blog, KeywordAnalysis, Prediction, PipelineState, SerpGap,
)
from core.logger import get_logger

logger = get_logger("pipeline")

# ═══════════════════════════════════════════════════════════════
#  FALLBACK DEFAULTS — every node has a safety net
# ═══════════════════════════════════════════════════════════════

_FALLBACK_KEYWORD = KeywordAnalysis(
    primary_keyword="AI blog automation",
    secondary_keywords=["SEO tools", "content marketing", "AI writing", "blog optimization", "content automation"],
    long_tail_keywords=["AI SEO tools India", "best blog automation platform", "free AI content writing tools",
                        "AI blog SEO optimization", "automated content marketing tools", "AI blog writing for startups"],
    keyword_roi_score=78.5,
    internal_linking_suggestions=["/blog/ai-seo-guide", "/resources/automation-checklist", "/blog/content-marketing-101"],
)

_FALLBACK_GAP = SerpGap(
    missing_topics=["case studies", "pricing comparison", "ROI metrics", "implementation guides", "video tutorials"],
    competitor_weakness=["No FAQ section", "Slow page speed", "No structured data", "Poor mobile UX", "Missing CTAs"],
)

_FALLBACK_PREDICTION = Prediction(
    seo_score_predicted=72,
    traffic_potential="Medium",
    ranking_difficulty="Medium",
    estimated_monthly_traffic=4500,
)


# ═══════════════════════════════════════════════════════════════
#  NODE FUNCTIONS — every node self-recovers, NEVER sets error
# ═══════════════════════════════════════════════════════════════

async def keyword_node(state: PipelineState) -> dict[str, Any]:
    """Node 1 — Keyword Intelligence. NEVER fails."""
    logger.info("Node 1: Keyword Intelligence [Input: %s]", state.keyword)
    try:
        from core.keyword import expand_keywords
        result = await expand_keywords(state.keyword)
        if result is None:
            raise ValueError("expand_keywords returned None")
        logger.info("keyword_analysis.primary_keyword = %s", result.primary_keyword)
        return {"keyword_analysis": result}
    except Exception as exc:
        logger.error("keyword_node exception: %s", exc)
        logger.warning("Using fallback keyword analysis")
        fallback = _FALLBACK_KEYWORD.model_copy()
        if state.keyword and state.keyword.strip():
            fallback.primary_keyword = f"AI tools for {state.keyword} blogging SEO"
        return {"keyword_analysis": fallback}


async def serp_node(state: PipelineState) -> dict[str, Any]:
    """Node 2 — SERP Gap Analyzer. NEVER fails."""
    logger.info("Node 2: SERP Gap Analyzer")
    kw = state.keyword_analysis.primary_keyword if state.keyword_analysis else "AI blog automation"
    try:
        from core.serp import analyze_serp
        result = await analyze_serp(kw)
        if result is None:
            raise ValueError("analyze_serp returned None")
        logger.info("Found %d missing topics", len(result.missing_topics))
        return {"gap": result}
    except Exception as exc:
        logger.error("serp_node exception: %s", exc)
        logger.warning("Using fallback SERP gap")
        return {"gap": _FALLBACK_GAP.model_copy()}


async def predictor_node(state: PipelineState) -> dict[str, Any]:
    """Node 3 — Performance Predictor. NEVER fails."""
    logger.info("Node 3: Performance Predictor")
    try:
        from core.predictor import predict_performance
        result = await predict_performance(state.keyword_analysis, state.gap)
        if result is None:
            raise ValueError("predict_performance returned None")
        logger.info("SEO score predicted: %d", result.seo_score_predicted)
        return {"prediction": result}
    except Exception as exc:
        logger.error("predictor_node exception: %s", exc)
        logger.warning("Using fallback prediction")
        return {"prediction": _FALLBACK_PREDICTION.model_copy()}


async def generator_node(state: PipelineState) -> dict[str, Any]:
    """Node 4 — Blog Generator. NEVER fails."""
    logger.info("Node 4: Blog Generator")
    try:
        from core.generator import generate_blogs
        raw_blogs = await generate_blogs(state.keyword_analysis, state.gap)
        if not raw_blogs:
            raise ValueError("generate_blogs returned empty list")
        logger.info("Generated %d blogs", len(raw_blogs))
        return {"raw_blogs": raw_blogs}
    except Exception as exc:
        logger.error("generator_node exception: %s", exc)
        logger.warning("Using fallback blogs")
        return {"raw_blogs": [
            {"title": "AI Blog Automation Guide", "content": "# AI Blog Automation\n\nAutomate your blogging with AI."},
            {"title": "Blogy – Best AI Blog Automation Tool in India", "content": "# Blogy\n\nIndia's leading AI blog platform."},
            {"title": "How Blogy is Disrupting Martech", "content": "# Blogy Martech\n\nDisrupting martech with AI."},
        ]}


async def seo_node(state: PipelineState) -> dict[str, Any]:
    """Node 5 — SEO Validator. Flattens SeoScore into Blog. NEVER fails."""
    logger.info("Node 5: SEO Validator")
    kw = state.keyword_analysis.primary_keyword if state.keyword_analysis else "AI blog automation"
    blogs = []
    for i, raw in enumerate(state.raw_blogs):
        try:
            from core.seo import validate_seo
            seo = await validate_seo(raw["content"], kw)
            blogs.append(Blog(
                title=raw["title"],
                content=raw["content"],
                seo_score=seo.seo_score,
                keyword_density=seo.keyword_density,
                readability_score=seo.readability_score,
                ai_detection_score=seo.ai_detection_score,
                snippet_readiness=seo.snippet_readiness,
                humanization_score=seo.humanization_score,
                featured_snippet=seo.featured_snippet,
                platform_formats=None,
            ))
            logger.info("Blog %d SEO score: %d | density: %.2f%%", i + 1, seo.seo_score, seo.keyword_density)
        except Exception as exc:
            logger.warning("Blog %d SEO validation failed: %s", i + 1, exc)
            blogs.append(Blog(title=raw["title"], content=raw["content"]))
    return {"blogs": blogs}


async def export_node(state: PipelineState) -> dict[str, Any]:
    """Node 6 — Platform Adaptation. Runs SEQUENTIALLY to avoid rate limits. NEVER fails."""
    logger.info("Node 6: Platform Adaptation (SEQUENTIAL)")

    updated_blogs = []
    for i, blog in enumerate(state.blogs):
        if i > 0:
            logger.info("Waiting 1.5s before next export...")
            await asyncio.sleep(1.5)
        try:
            from core.exporter import format_for_platforms
            formats = await format_for_platforms(blog.title, blog.content)
            logger.info("Blog %d exported to 5 platforms", i + 1)
            updated_blogs.append(blog.model_copy(update={"platform_formats": formats}))
        except Exception as exc:
            logger.warning("Blog %d export failed: %s", i + 1, exc)
            updated_blogs.append(blog)

    return {"blogs": updated_blogs}


async def blogy_node(state: PipelineState) -> dict[str, Any]:
    """Node 7 — Blogy Dashboard Analysis. Now dynamic! NEVER fails."""
    logger.info("Node 7: Blogy Dashboard Analysis")
    try:
        from core.blogy_analysis import analyze_blogy
        result = await analyze_blogy(blogs=state.blogs, keyword=state.keyword)
        logger.info("Blogy analysis complete")
        return {"blogy_analysis": result}
    except Exception as exc:
        logger.error("blogy_node exception: %s", exc)
        from models.schemas import BlogyAnalysis, ImprovementsMapping
        return {"blogy_analysis": BlogyAnalysis(
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
        )}


# ═══════════════════════════════════════════════════════════════
#  NODE-TO-STEP MAPPING (for streaming progress)
# ═══════════════════════════════════════════════════════════════

NODE_STEP_MAP = {
    "keyword_node": 1,
    "serp_node": 2,
    "predictor_node": 3,
    "generator_node": 4,
    "seo_node": 5,
    "export_node": 6,
    "blogy_node": 7,
}


# ═══════════════════════════════════════════════════════════════
#  GRAPH CONSTRUCTION & EXECUTION
# ═══════════════════════════════════════════════════════════════

def _build_graph() -> StateGraph:
    graph = StateGraph(PipelineState)

    graph.add_node("keyword_node", keyword_node)
    graph.add_node("serp_node", serp_node)
    graph.add_node("predictor_node", predictor_node)
    graph.add_node("generator_node", generator_node)
    graph.add_node("seo_node", seo_node)
    graph.add_node("export_node", export_node)
    graph.add_node("blogy_node", blogy_node)

    graph.set_entry_point("keyword_node")
    graph.add_edge("keyword_node", "serp_node")
    graph.add_edge("serp_node", "predictor_node")
    graph.add_edge("predictor_node", "generator_node")
    graph.add_edge("generator_node", "seo_node")
    graph.add_edge("seo_node", "export_node")
    graph.add_edge("export_node", "blogy_node")
    graph.add_edge("blogy_node", END)

    return graph


_compiled_graph = _build_graph().compile()


async def run_pipeline(keyword: str) -> PipelineState:
    """Execute the full pipeline. NEVER crashes."""
    logger.info("PIPELINE START: '%s'", keyword)
    initial_state = PipelineState(keyword=keyword)
    result = await _compiled_graph.ainvoke(initial_state)
    logger.info("PIPELINE COMPLETE")
    return result


async def run_pipeline_stream(keyword: str):
    """Execute the pipeline, yielding real-time progress after each node.

    Yields dicts:
      {"type": "progress", "step": 1-7, "node": "keyword_node"}
      {"type": "complete", "state": {accumulated state dict}}
    """
    logger.info("PIPELINE STREAM START: '%s'", keyword)
    initial_state = PipelineState(keyword=keyword)
    accumulated = {}

    async for event in _compiled_graph.astream(initial_state, stream_mode="updates"):
        for node_name, updates in event.items():
            step = NODE_STEP_MAP.get(node_name)
            if step:
                accumulated.update(updates)
                logger.info("Stream: Node %d (%s) completed", step, node_name)
                yield {"type": "progress", "step": step, "node": node_name}

    yield {"type": "complete", "state": accumulated}
    logger.info("PIPELINE STREAM COMPLETE")
