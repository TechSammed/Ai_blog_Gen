from __future__ import annotations

import os
import textwrap
from typing import Optional

from models.schemas import KeywordAnalysis, SerpGap


_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        from langchain_groq import ChatGroq
        _llm = ChatGroq(model="mixtral-8x7b-32768", temperature=0.7)
    return _llm


def _has_api_key() -> bool:
    return bool(os.environ.get("GROQ_API_KEY"))




async def _generate_with_llm(
    keyword_analysis: KeywordAnalysis,
    gap: Optional[SerpGap] = None,
) -> str:
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.messages import HumanMessage


    kw = keyword_analysis.primary_keyword
    secondaries = ", ".join(keyword_analysis.secondary_keywords[:5])
    longtails = ", ".join(keyword_analysis.long_tail_keywords[:4])
    gap_topics = ", ".join(gap.missing_topics[:4]) if gap else "N/A"

    llm = _get_llm()

    # Step 1 — Outline
    outline_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an elite SEO content strategist specializing in Indian market."),
        ("human", textwrap.dedent("""\
            Create a detailed blog outline for the keyword: "{keyword}"
            Secondary keywords: {secondaries}
            Long-tail keywords: {longtails}
            SERP gap topics to cover: {gap_topics}

            Requirements:
            - Use H1, H2, H3 heading hierarchy
            - Include at least 6 H2 sections
            - GEO-optimize for India context
            - Include a FAQ section heading
            - Include a CTA section heading
            - Format as markdown headings only
        """)),
    ])
    outline_msg = await llm.ainvoke(
        outline_prompt.format_messages(
            keyword=kw, secondaries=secondaries,
            longtails=longtails, gap_topics=gap_topics,
        )
    )
    outline = outline_msg.content

    # Step 2 — Full blog body
    body_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert SEO blog writer. Write in a natural, conversational tone."),
        ("human", textwrap.dedent("""\
            Write a comprehensive, SEO-optimized blog post following this outline:

            {outline}

            Primary keyword: "{keyword}"
            Secondary keywords: {secondaries}

            Requirements:
            - 1500-2000 words
            - Use the keyword naturally (1-2% density)
            - Include statistics and examples relevant to India
            - Use short paragraphs (2-3 sentences)
            - Add transition sentences between sections
            - Write in a natural, human tone — avoid AI-sounding phrases
            - Conversion-focused with subtle persuasion
            - Format in markdown
        """)),
    ])
    body_msg = await llm.ainvoke(
        body_prompt.format_messages(
            outline=outline, keyword=kw, secondaries=secondaries,
        )
    )
    blog_body = body_msg.content

    # Step 3 — FAQ section
    faq_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an SEO specialist creating featured-snippet-ready FAQ content."),
        ("human", textwrap.dedent("""\
            Generate 5 FAQs for the keyword: "{keyword}"

            Requirements:
            - Questions people actually search for
            - Concise answers (2-3 sentences each)
            - Optimized for Google featured snippets
            - Include the keyword naturally
            - Format each as: ## Q: question\\nA: answer
        """)),
    ])
    faq_msg = await llm.ainvoke(
        faq_prompt.format_messages(keyword=kw)
    )
    faqs = faq_msg.content

    # Step 4 — CTA
    cta_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a conversion copywriter."),
        ("human", textwrap.dedent("""\
            Write a compelling call-to-action section for a blog about "{keyword}".

            Requirements:
            - Create urgency
            - Highlight value proposition
            - Include a clear action button text
            - 3-4 sentences max
            - Format in markdown with ## heading
        """)),
    ])
    cta_msg = await llm.ainvoke(
        cta_prompt.format_messages(keyword=kw)
    )
    cta = cta_msg.content

    return f"{blog_body}\n\n---\n\n{faqs}\n\n---\n\n{cta}"




def _generate_fallback(
    keyword_analysis: KeywordAnalysis,
    gap: Optional[SerpGap] = None,
) -> str:
    kw = keyword_analysis.primary_keyword
    secondaries = keyword_analysis.secondary_keywords
    longtails = keyword_analysis.long_tail_keywords
    gap_topics = gap.missing_topics if gap else []

    sections = []

    # H1
    sections.append(f"# The Ultimate Guide to {kw.title()}: Everything You Need to Know in 2025\n")

    # Intro
    sections.append(textwrap.dedent(f"""\
        In today's rapidly evolving digital landscape, **{kw}** has become a game-changer
        for businesses across India and beyond. Whether you're a startup founder in
        Bengaluru or a seasoned marketer in Mumbai, understanding {kw} can unlock
        unprecedented growth opportunities.

        In this comprehensive guide, we'll dive deep into every aspect of {kw} — from
        foundational concepts to advanced strategies that top performers use to stay ahead
        of the competition.
    """))

    # H2 sections based on secondary keywords
    for i, sec_kw in enumerate(secondaries[:5]):
        sections.append(f"## {sec_kw.title()}\n")
        sections.append(textwrap.dedent(f"""\
            When it comes to **{sec_kw}**, Indian businesses are discovering innovative
            approaches that deliver measurable results. Recent data from a 2024 industry
            report shows that companies actively investing in {sec_kw} see an average
            ROI increase of {30 + i * 7}%.

            Here's what makes this approach particularly effective:

            - **Cost-efficiency**: Ideal for bootstrapped startups and SMEs
            - **Scalability**: Grows with your business from day one
            - **Localization**: Adapts to India's diverse market segments

            ### Key Implementation Steps

            1. Audit your current {kw} strategy
            2. Identify quick wins using data-driven insights
            3. Implement changes in 2-week sprints
            4. Measure, iterate, and scale what works
        """))

    # Gap topics coverage
    if gap_topics:
        sections.append("## Addressing the Gaps: What Competitors Miss\n")
        for topic in gap_topics[:4]:
            sections.append(f"### {topic}\n")
            sections.append(
                f"Most guides overlook **{topic.lower()}**, but this is exactly where "
                f"forward-thinking teams gain their competitive edge with {kw}. "
                f"By addressing this gap, you position yourself as a thought leader "
                f"in the space.\n"
            )

    # Long-tail section
    sections.append("## Deep Dive: Advanced Strategies\n")
    for lt in longtails[:3]:
        sections.append(f"- **{lt.title()}** — a high-intent search query that "
                        f"signals strong buyer readiness\n")

    # FAQ
    sections.append("\n---\n")
    sections.append("## Frequently Asked Questions\n")
    faq_pairs = [
        (f"What is {kw} and why does it matter?",
         f"{kw.title()} is a strategic approach that helps businesses optimize their "
         f"digital presence. In the Indian market alone, companies using {kw} "
         f"strategies report 2-3x higher engagement rates."),
        (f"How much does {kw} cost for a small business?",
         f"The cost of implementing {kw} varies widely. Startups can begin with ₹5,000–₹15,000/month "
         f"using freemium tools, while enterprise solutions range from ₹50,000 upward."),
        (f"How long does it take to see results from {kw}?",
         f"Most businesses see initial results within 3-6 months. However, sustainable, "
         f"compounding growth typically kicks in after 6-12 months of consistent effort."),
        (f"Is {kw} relevant for the Indian market?",
         f"Absolutely. With India's digital economy projected to reach $1 trillion by 2030, "
         f"{kw} is more relevant than ever for businesses targeting Indian consumers."),
        (f"What tools do I need to get started with {kw}?",
         f"Start with free tools like Google Search Console and Google Analytics. "
         f"As you scale, consider platforms that offer {kw}-specific analytics and automation."),
    ]
    for q, a in faq_pairs:
        sections.append(f"### Q: {q}\n**A:** {a}\n")

    # CTA
    sections.append("\n---\n")
    sections.append("## Ready to Transform Your Strategy?\n")
    sections.append(textwrap.dedent(f"""\
        Don't let your competitors get ahead. Start leveraging **{kw}** today and
        watch your traffic, engagement, and conversions soar.

        👉 **[Get Your Free {kw.title()} Audit Now](#cta)** — Limited slots available this month!

        *Join 5,000+ Indian businesses already seeing results.*
    """))

    return "\n".join(sections)




async def generate_blog(
    keyword_analysis: KeywordAnalysis,
    gap: Optional[SerpGap] = None,
) -> str:
    """Generate a full SEO-optimized blog post.

    Uses Groq via LangChain when GROQ_API_KEY is set,
    otherwise falls back to a rich deterministic template.
    """
    if _has_api_key():
        return await _generate_with_llm(keyword_analysis, gap)
    return _generate_fallback(keyword_analysis, gap)
