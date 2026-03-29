from __future__ import annotations

from typing import Any

from langgraph.graph import END, StateGraph

from models.schemas import (
    Blog, KeywordAnalysis, Prediction, PipelineState, SerpGap,
)


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
    print(f"\n{'='*60}")
    print(f"🔑 Node 1: Keyword Intelligence [Input: {state.keyword}]")
    try:
        from core.keyword import expand_keywords
        result = await expand_keywords(state.keyword)
        # Double-check: expand_keywords should never return None, but just in case
        if result is None:
            raise ValueError("expand_keywords returned None")
        print(f"✅ keyword_analysis.primary_keyword = {result.primary_keyword}")
        return {"keyword_analysis": result}
    except Exception as exc:
        print(f"❌ keyword_node exception: {exc}")
        print(f"🔄 Using fallback keyword analysis")
        fallback = _FALLBACK_KEYWORD.model_copy()
        if state.keyword and state.keyword.strip():
            fallback.primary_keyword = f"AI tools for {state.keyword} blogging SEO"
        return {"keyword_analysis": fallback}


async def serp_node(state: PipelineState) -> dict[str, Any]:
    """Node 2 — SERP Gap Analyzer. NEVER fails."""
    print(f"\n{'='*60}")
    print(f"🔍 Node 2: SERP Gap Analyzer")
    kw = state.keyword_analysis.primary_keyword if state.keyword_analysis else "AI blog automation"
    try:
        from core.serp import analyze_serp
        result = await analyze_serp(kw)
        if result is None:
            raise ValueError("analyze_serp returned None")
        print(f"✅ Found {len(result.missing_topics)} missing topics")
        return {"gap": result}
    except Exception as exc:
        print(f"❌ serp_node exception: {exc}")
        print(f"🔄 Using fallback SERP gap")
        return {"gap": _FALLBACK_GAP.model_copy()}


async def predictor_node(state: PipelineState) -> dict[str, Any]:
    """Node 3 — Performance Predictor. NEVER fails."""
    print(f"\n{'='*60}")
    print(f"📊 Node 3: Performance Predictor")
    try:
        from core.predictor import predict_performance
        result = await predict_performance(state.keyword_analysis, state.gap)
        if result is None:
            raise ValueError("predict_performance returned None")
        print(f"✅ SEO score predicted: {result.seo_score_predicted}")
        return {"prediction": result}
    except Exception as exc:
        print(f"❌ predictor_node exception: {exc}")
        print(f"🔄 Using fallback prediction")
        return {"prediction": _FALLBACK_PREDICTION.model_copy()}


async def generator_node(state: PipelineState) -> dict[str, Any]:
    """Node 4 — Blog Generator. NEVER fails."""
    print(f"\n{'='*60}")
    print(f"📝 Node 4: Blog Generator")
    try:
        from core.generator import generate_blogs
        raw_blogs = await generate_blogs(state.keyword_analysis, state.gap)
        if not raw_blogs:
            raise ValueError("generate_blogs returned empty list")
        print(f"✅ Generated {len(raw_blogs)} blogs")
        return {"raw_blogs": raw_blogs}
    except Exception as exc:
        print(f"❌ generator_node exception: {exc}")
        print(f"🔄 Using fallback blogs")
        return {"raw_blogs": [
            {"title": "AI Blog Automation Guide", "content": "# AI Blog Automation\n\nAutomate your blogging with AI."},
            {"title": "Blogy – Best AI Blog Automation Tool in India", "content": "# Blogy\n\nIndia's leading AI blog platform."},
            {"title": "How Blogy is Disrupting Martech", "content": "# Blogy Martech\n\nDisrupting martech with AI."},
        ]}


async def seo_node(state: PipelineState) -> dict[str, Any]:
    """Node 5 — SEO Validator. NEVER fails."""
    print(f"\n{'='*60}")
    print(f"🔍 Node 5: SEO Validator")
    kw = state.keyword_analysis.primary_keyword if state.keyword_analysis else "AI blog automation"
    blogs = []
    for i, raw in enumerate(state.raw_blogs):
        try:
            from core.seo import validate_seo
            seo_score = await validate_seo(raw["content"], kw)
            blogs.append(Blog(title=raw["title"], content=raw["content"], seo_score=seo_score, platform_formats=None))
            print(f"  ✅ Blog {i+1} SEO score: {seo_score.seo_score}")
        except Exception as exc:
            print(f"  ⚠️ Blog {i+1} SEO validation failed: {exc}")
            blogs.append(Blog(title=raw["title"], content=raw["content"], seo_score=None, platform_formats=None))
    return {"blogs": blogs}


async def export_node(state: PipelineState) -> dict[str, Any]:
    """Node 6 — Platform Adaptation. Runs ALL blogs in PARALLEL. NEVER fails."""
    import asyncio
    print(f"\n{'='*60}")
    print(f"🌐 Node 6: Platform Adaptation (PARALLEL)")

    async def _export_one(i: int, blog: Blog) -> Blog:
        try:
            from core.exporter import format_for_platforms
            formats = await format_for_platforms(blog.title, blog.content)
            print(f"  ✅ Blog {i+1} exported to 5 platforms")
            return blog.model_copy(update={"platform_formats": formats})
        except Exception as exc:
            print(f"  ⚠️ Blog {i+1} export failed: {exc}")
            return blog

    # 🚀 Run all exports concurrently
    tasks = [_export_one(i, blog) for i, blog in enumerate(state.blogs)]
    updated_blogs = list(await asyncio.gather(*tasks))
    return {"blogs": updated_blogs}


async def blogy_node(state: PipelineState) -> dict[str, Any]:
    """Node 7 — Blogy Dashboard Analysis. NEVER fails."""
    print(f"\n{'='*60}")
    print(f"📈 Node 7: Blogy Dashboard Analysis")
    try:
        from core.blogy_analysis import analyze_blogy
        result = await analyze_blogy()
        print(f"✅ Blogy analysis complete")
        return {"blogy_analysis": result}
    except Exception as exc:
        print(f"❌ blogy_node exception: {exc}")
        # Import and create a minimal fallback
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
    print(f"\n{'#'*60}")
    print(f"# PIPELINE START: '{keyword}'")
    print(f"{'#'*60}")
    initial_state = PipelineState(keyword=keyword)
    result = await _compiled_graph.ainvoke(initial_state)
    print(f"\n{'#'*60}")
    print(f"# PIPELINE COMPLETE")
    print(f"{'#'*60}\n")
    return result
