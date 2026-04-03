from __future__ import annotations

import json
from typing import Any

from models.schemas import BlogyAnalysis, ImprovementsMapping
from core.utils import get_llm
from core.logger import get_logger

logger = get_logger("blogy_analysis")

# ─── STATIC FALLBACK (used when LLM fails or no blogs provided) ───
_STATIC_ANALYSIS = BlogyAnalysis(
    ux_issues=[
        "No drag-and-drop editor — users must write raw markdown with no preview",
        "Dashboard lacks onboarding tour for first-time users",
        "Mobile responsiveness is broken on blog creation page",
        "No autosave — users lose drafts on accidental navigation",
        "Color contrast issues on CTA buttons (fails WCAG AA)",
        "Inconsistent icon set across navigation and action buttons",
    ],
    seo_issues=[
        "Meta title and description fields are not exposed in the editor",
        "No canonical URL management — risk of duplicate content penalties",
        "Generated blogs lack JSON-LD structured data (Article schema)",
        "Sitemap.xml is not auto-generated or submitted to Google Search Console",
        "Open Graph and Twitter Card tags are missing from published pages",
        "No keyword density or readability feedback during writing",
        "Image alt-text field is absent in the media uploader",
    ],
    conversion_gaps=[
        "No built-in email capture or lead magnet placement",
        "Missing A/B testing capability for headlines and CTAs",
        "No social sharing buttons on published posts",
        "Exit-intent popup or sticky CTA bar not available",
        "No analytics integration to track conversion funnels",
        "Comment section is disabled — reduces engagement signals",
    ],
    technical_risks=[
        "No rate limiting on public API — vulnerable to abuse",
        "Auth tokens stored in localStorage instead of httpOnly cookies",
        "No input sanitization on blog body — XSS risk",
        "Single-server deployment with no horizontal scaling strategy",
        "No CI/CD pipeline — manual deployments increase error risk",
        "Missing health-check endpoint for uptime monitoring",
        "No database backup or disaster recovery plan",
    ],
    feature_suggestions=[
        "AI-powered content outline generator before writing",
        "Real-time SEO score sidebar while composing",
        "One-click cross-posting to Medium, Dev.to, and Hashnode",
        "Content calendar with scheduled publishing",
        "Plagiarism and AI-detection checker integration",
        "Multi-language support (Hindi, Tamil, Telugu, etc.)",
        "Team collaboration with role-based access",
        "Version history and diff viewer for blog revisions",
        "Custom domain support with free SSL",
        "Webhook support for Zapier/Make automation",
    ],
    product_differentiation=(
        "Blogy can differentiate itself by becoming an AI-native blogging "
        "platform that goes beyond content creation — offering built-in SEO "
        "intelligence, SERP gap analysis, traffic prediction, and one-click "
        "multi-platform publishing. Unlike WordPress or Ghost, Blogy would "
        "combine a lightweight editor with enterprise-grade SEO tooling, "
        "specifically tailored for the Indian creator economy."
    ),
    scalability=(
        "Current architecture supports ~500 concurrent users. To scale to "
        "50,000+ users, Blogy needs: (1) containerized microservices with "
        "Kubernetes orchestration, (2) a managed PostgreSQL cluster with "
        "read replicas, (3) Redis caching layer for hot content, (4) CDN "
        "for static assets and published blogs, (5) async job queue "
        "(Celery/RQ) for AI generation tasks, and (6) observability stack "
        "(Prometheus + Grafana) for proactive monitoring."
    ),
    improvements_mapping=[
        ImprovementsMapping(
            missing_feature="No SEO analysis during writing",
            your_solution="Real-time SEO Validator Node that scores content as the user types",
        ),
        ImprovementsMapping(
            missing_feature="No keyword research tool",
            your_solution="Keyword Intelligence Node with clustering, ROI scoring, and long-tail expansion",
        ),
        ImprovementsMapping(
            missing_feature="No competitive analysis",
            your_solution="SERP Gap Analyzer that identifies missing topics and competitor weaknesses",
        ),
        ImprovementsMapping(
            missing_feature="No traffic prediction",
            your_solution="Performance Predictor Node estimating traffic potential and ranking difficulty",
        ),
        ImprovementsMapping(
            missing_feature="No multi-platform publishing",
            your_solution="Blog Export Module formatting content for Medium, LinkedIn, WordPress, Dev.to, and Hashnode",
        ),
        ImprovementsMapping(
            missing_feature="No AI content generation",
            your_solution="LangChain multi-step Blog Generator with outline → body → FAQ → CTA pipeline",
        ),
        ImprovementsMapping(
            missing_feature="No structured data / schema markup",
            your_solution="Auto-inject JSON-LD Article schema into every published blog",
        ),
    ],
)


async def analyze_blogy(
    blogs: list[Any] | None = None,
    keyword: str = "",
) -> BlogyAnalysis:
    """Return a detailed analysis of the Blogy dashboard/platform.

    When blogs are provided, generates a DYNAMIC analysis based on the
    actual generated content and SEO metrics. Falls back to static
    analysis on any error.
    """
    if not blogs:
        logger.info("No blogs provided — returning static analysis")
        return _STATIC_ANALYSIS

    try:
        llm = get_llm(temperature=0.3, max_tokens=2000)

        # Build context from the generated blogs
        blog_summaries = []
        for i, blog in enumerate(blogs):
            title = blog.title if hasattr(blog, "title") else blog.get("title", "")
            seo = blog.seo_score if hasattr(blog, "seo_score") else blog.get("seo_score", 0)
            density = blog.keyword_density if hasattr(blog, "keyword_density") else blog.get("keyword_density", 0)
            readability = blog.readability_score if hasattr(blog, "readability_score") else blog.get("readability_score", 0)
            ai_det = blog.ai_detection_score if hasattr(blog, "ai_detection_score") else blog.get("ai_detection_score", 0)
            blog_summaries.append(
                f"Blog {i+1}: '{title}' | SEO={seo}/100 | Density={density}% | "
                f"Readability={readability} | AI_Detection={ai_det}"
            )

        context = "\n".join(blog_summaries)

        prompt = (
            f"You are a product strategist analyzing the Blogy AI blogging platform.\n\n"
            f"Generated blogs for keyword \"{keyword}\":\n{context}\n\n"
            f"Analyze the platform and return ONLY valid JSON:\n"
            f'{{\n'
            f'  "ux_issues": ["string (min 4 items)"],\n'
            f'  "seo_issues": ["string (min 4 items)"],\n'
            f'  "conversion_gaps": ["string (min 4 items)"],\n'
            f'  "technical_risks": ["string (min 4 items)"],\n'
            f'  "feature_suggestions": ["string (min 5 items)"],\n'
            f'  "product_differentiation": "string",\n'
            f'  "scalability": "string",\n'
            f'  "improvements_mapping": [\n'
            f'    {{"missing_feature": "string", "your_solution": "string"}}\n'
            f'  ]\n'
            f'}}\n\n'
            f"Rules:\n"
            f"- Tailor insights to the keyword \"{keyword}\" and the blog quality metrics above\n"
            f"- Be specific and actionable\n"
            f"- 5–7 improvements_mapping entries\n"
            f"- Mention actual SEO score values from the data if relevant\n"
            f"- No explanation, no markdown — ONLY the JSON object"
        )

        # Strategy 1: Structured output
        try:
            structured_llm = llm.with_structured_output(BlogyAnalysis)
            result = await structured_llm.ainvoke(prompt)
            if result is not None:
                logger.info("Dynamic blogy analysis generated (structured)")
                return result
        except Exception as struct_err:
            logger.warning("Structured blogy output failed: %s", struct_err)

        # Strategy 2: Raw LLM + JSON parse
        raw = await llm.ainvoke(prompt)
        text = raw.content.strip()
        if "{" in text:
            json_str = text[text.index("{"):text.rindex("}") + 1]
            data = json.loads(json_str)
            result = BlogyAnalysis(**data)
            logger.info("Dynamic blogy analysis generated (parsed)")
            return result

    except Exception as exc:
        logger.error("Dynamic blogy analysis FAILED: %s", exc)

    logger.warning("Falling back to static blogy analysis")
    return _STATIC_ANALYSIS
