from __future__ import annotations

import asyncio
import re
import textwrap
from typing import Any

from models.schemas import KeywordAnalysis, SerpGap
from core.utils import (
    get_llm, safe_llm_call, keyword_density,
    flesch_reading_ease, ai_detection_score,
)
from core.logger import get_logger

logger = get_logger("generator")



BANNED_PHRASES = [
    "the future looks bright", "in today's world", "has shown promise",
    "rapidly evolving", "revolutionizing", "game-changer", "game changer",
    "dive deep", "harness the power", "it's important to note",
    "it is important to note", "without further ado", "at the end of the day",
    "in conclusion", "leverage the power", "in the ever-evolving",
    "in this day and age", "needless to say", "it goes without saying",
    "as we all know", "the landscape is changing", "paradigm shift",
    "synergy", "unlock the potential", "unlock the power",
    "the bottom line is", "to put it simply", "at the forefront",
    "cutting-edge", "groundbreaking",
]


def _kill_banned_phrases(content: str) -> str:
    """Remove banned AI-sounding phrases from content."""
    result = content
    killed = []
    for phrase in BANNED_PHRASES:
        if phrase.lower() in result.lower():
            pattern = re.compile(re.escape(phrase), re.IGNORECASE)
            result = pattern.sub("", result)
            killed.append(phrase)
    result = re.sub(r"  +", " ", result)
    result = re.sub(r"\n\n\n+", "\n\n", result)
    if killed:
        logger.info("Killed %d banned phrases: %s", len(killed), killed[:5])
    return result


def _split_long_sentences(content: str) -> str:
    """Split sentences longer than 20 words at natural break points."""
    lines = content.split("\n")
    fixed_lines = []
    splits_made = 0

    for line in lines:
        if (line.strip().startswith("#") or line.strip().startswith("-") or
            line.strip().startswith("|") or line.strip().startswith("*") or
            line.strip().startswith(">") or len(line.strip()) == 0):
            fixed_lines.append(line)
            continue

        sentences = re.split(r'(?<=[.!?])\s+', line)
        new_sentences = []
        for sentence in sentences:
            words = sentence.split()
            if len(words) > 20:
                split_points = [" and ", " but ", " which ", " while ", " because ",
                               " however ", " although ", " since ", " when ", ", "]
                split_done = False
                for sp in split_points:
                    if sp in sentence:
                        idx = sentence.index(sp)
                        left = sentence[:idx].strip()
                        right = sentence[idx + len(sp):].strip()
                        if len(left.split()) >= 5 and len(right.split()) >= 5:
                            if not left.endswith(('.', '!', '?')):
                                left += '.'
                            right = right[0].upper() + right[1:] if right else right
                            new_sentences.append(left)
                            new_sentences.append(right)
                            split_done = True
                            splits_made += 1
                            break
                if not split_done:
                    new_sentences.append(sentence)
            else:
                new_sentences.append(sentence)
        fixed_lines.append(" ".join(new_sentences))

    if splits_made:
        logger.info("Split %d long sentences (>20 words)", splits_made)
    return "\n".join(fixed_lines)


async def _clean_for_density(blog: str, keyword: str) -> str:
    """LLM rewrite to fix keyword density. ALWAYS runs after generation."""
    async def _do_clean():
        llm = get_llm(temperature=0.5, max_tokens=4000)
        prompt = (
            f"Rewrite the blog to:\n"
            f"- Reduce keyword repetition\n"
            f"- Maintain meaning\n"
            f"- Keep keyword density between 1%–2% for \"{keyword}\"\n"
            f"- Improve readability\n\n"
            f"Return ONLY cleaned blog text.\n\n"
            f"BLOG:\n{blog}"
        )
        result = await llm.ainvoke(prompt)
        return result.content

    return await safe_llm_call(_do_clean)


async def _quality_pipeline(blog_content: str, keyword: str) -> str:
    """Post-generation pipeline: local cleanup → LLM clean → final metrics."""
    content = blog_content
    logger.info("QUALITY PIPELINE START")

    #STEP 1: Local fixes 
    content = _kill_banned_phrases(content)
    content = _split_long_sentences(content)

    #STEP 2: LLM clean for density (ALWAYS runs)
    density_before = keyword_density(content, keyword)
    logger.info("Density BEFORE clean: %.2f%%", density_before)

    try:
        content = await _clean_for_density(content, keyword)
        content = _kill_banned_phrases(content)
    except Exception as exc:
        logger.error("Clean step failed: %s, keeping original", exc)

    #STEP 3: Calculate density AFTER cleaning 
    final_density = keyword_density(content, keyword)
    final_read = flesch_reading_ease(content)
    final_ai = ai_detection_score(content)
    final_words = len(content.split())
    logger.info(
        "FINAL METRICS: density=%.2f%% | readability=%.0f | AI=%d | words=%d",
        final_density, final_read, final_ai, final_words,
    )

    return content



def _safe_kw(keyword_analysis) -> str:
    if isinstance(keyword_analysis, dict):
        return keyword_analysis.get("primary_keyword", "AI blog automation")
    elif keyword_analysis:
        return getattr(keyword_analysis, "primary_keyword", "AI blog automation")
    return "AI blog automation"

def _safe_list(obj, field: str) -> list[str]:
    if isinstance(obj, dict):
        return obj.get(field, [])
    elif obj:
        return getattr(obj, field, [])
    return []


_FALLBACK_GENERAL = {
    "title": "AI Blog Automation: The Complete Guide to Scaling Content",
    "content": textwrap.dedent("""\
        # AI Blog Automation: The Complete Guide to Scaling Content

        Most content teams spend 4-6 hours per blog post. That's fine if you publish twice a month. But if you need 10+ posts weekly, manual writing doesn't scale. AI blog automation changes this equation completely.

        ## What AI Blog Automation Actually Looks Like

        It's not a magic button. The best AI blog automation tools follow a structured pipeline:

        1. **Keyword research** — identify what people actually search for
        2. **SERP analysis** — study what's ranking and find gaps
        3. **Draft generation** — create an SEO-aware first draft
        4. **Quality validation** — check density, readability, and structure
        5. **Multi-platform export** — adapt for Medium, LinkedIn, WordPress

        ## How AI Blog Automation Compares to Manual Writing

        | Factor | Manual | Automated |
        |--------|--------|-----------| 
        | Time per post | 4-6 hours | 15-30 minutes |
        | SEO consistency | Varies | Built-in |
        | Cost at scale | Linear increase | Flat |

        ## Content Gaps / Unique Insights

        - Transparent ROI case studies with real numbers
        - Step-by-step setup guides
        - Failure stories — what doesn't work

        ## FAQ

        ### Q: Will Google penalize AI-generated content?
        A: No. Google evaluates content quality, not authorship.

        ### Q: What keyword density should I target?
        A: Keep it between 1-2%. Above 2% feels unnatural.

        ### Q: How much editing does AI content need?
        A: A good tool needs 10-15 minutes of human polish.

        ## Start Publishing Smarter

        Try Blogy's AI blog automation pipeline — from keyword to published blog in under 10 minutes.

        **[Start Your Free Trial →](#)**
    """),
}

_FALLBACK_BLOGY_1 = {
    "title": "Blogy – Best AI Blog Automation Tool in India",
    "content": textwrap.dedent("""\
        # Blogy – Best AI Blog Automation Tool in India

        India has 65+ million small businesses. Most can't afford a content team. Blogy was built for exactly this gap.

        ## Why Blogy Works for Indian Creators

        - Priced for Indian markets
        - End-to-end pipeline — keyword research through publishing
        - No SEO expertise needed

        ## Blogy SEO Features That Matter

        - Automatic keyword density control (1-2%)
        - Smart heading hierarchy
        - FAQ section generation
        - Readability scoring

        ## Content Gaps / Unique Insights

        Most competing tools miss:
        - No integrated SERP gap analysis
        - No multi-platform export
        - No post-generation quality validation

        ## FAQ

        ### Q: How is Blogy different from ChatGPT?
        A: Blogy is purpose-built for SEO blogging with keyword intelligence built in.

        ### Q: Is there a free tier?
        A: Yes — enough credits for multiple posts per month.

        ### Q: How much editing is needed?
        A: Most posts need 10-15 minutes of human polish.

        ## Get Started

        Join thousands of Indian creators scaling content with Blogy.

        **[Try Blogy Free →](#)**
    """),
}

_FALLBACK_BLOGY_2 = {
    "title": "How Blogy is Disrupting Martech – Organic Traffic on Autopilot",
    "content": textwrap.dedent("""\
        # How Blogy is Disrupting Martech – Organic Traffic on Autopilot

        Indian businesses spent ₹21,000 crore on digital ads last year. Most of that disappeared when campaigns stopped. Blogy offers a better path.

        ## The Cost Problem

        - SEO agency: ₹50,000–₹2,00,000/month
        - In-house team: ₹3,00,000+/month
        - Blogy: A fraction of those costs

        ## How Blogy Automates the Pipeline

        1. Enter a keyword
        2. AI analyzes SERP gaps
        3. Generates optimized blog posts
        4. Validates density and readability
        5. Exports to 5 platforms

        ## Content Gaps / Unique Insights

        - Transparent pricing comparisons
        - ROI timelines with real numbers
        - Setup guides for non-technical founders

        ## FAQ

        ### Q: Can Blogy replace an SEO agency?
        A: For content creation and on-page SEO — yes.

        ### Q: How fast does organic traffic grow?
        A: Expect results in 60-90 days with consistent publishing.

        ### Q: Is Blogy suitable for enterprise?
        A: Yes — scales from solo creators to teams.

        ## Stop Renting Traffic

        Every blog post is an asset. Paid ads are a rental.

        **[Start Your Free Trial →](#)**
    """),
}


async def _generate_general_blog(
    keyword_analysis: KeywordAnalysis | dict[str, Any] | None,
    gap: SerpGap | dict[str, Any] | None,
) -> dict[str, str]:
    """Generate a single general blog with controlled keyword density."""
    try:
        from langchain_core.prompts import ChatPromptTemplate

        kw = _safe_kw(keyword_analysis)
        secondary = ", ".join(_safe_list(keyword_analysis, "secondary_keywords")) or "SEO tools, content marketing"
        longtail = ", ".join(_safe_list(keyword_analysis, "long_tail_keywords")) or "AI SEO tools India"
        missing = _safe_list(gap, "missing_topics")
        weakness = _safe_list(gap, "competitor_weakness")

        missing_bullets = "\n".join(f"- {t}" for t in missing) if missing else "- Case studies\n- Pricing\n- ROI metrics"
        weakness_bullets = "\n".join(f"- {w}" for w in weakness) if weakness else "- No FAQ\n- Slow pages"

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert blog writer. Write high-quality, human-like content."),
            ("human", textwrap.dedent("""\
                Write a high-quality blog.

                Constraints:
                - Target keyword: "{keyword}"
                - Word count: 800–1000
                - Keyword density MUST be between 1% and 2%
                - Use the keyword naturally (avoid stuffing)
                - Use synonyms where possible
                - Human tone, readable, not robotic
                - Short sentences (max 20 words)
                - Paragraphs: 2–3 lines max
                - No generic phrases like "revolutionizing", "game-changer", "dive deep",
                  "in today's world", "cutting-edge", "groundbreaking"

                Secondary keywords: {secondary}
                Long-tail keywords: {longtail}

                STRUCTURE:
                1. Hook (first 2-3 lines, engaging — include "{keyword}" in first 100 words)
                2. 3-5 actionable sections (H2 headings — use "{keyword}" in at least 2 H2s)
                3. Real example or use case (specific: company type, city, results)
                4. "## Content Gaps / Unique Insights" covering:
                {missing_bullets}
                5. Address weaknesses:
                {weakness_bullets}
                6. "## FAQ" with 3-4 questions (### Q: format)
                7. Strong CTA ending

                Output:
                - Only blog content in clean Markdown
                - No explanation
            """)),
        ])

        async def _do_generate():
            llm = get_llm(temperature=0.5, max_tokens=4000)
            return await llm.ainvoke(
                prompt.format_messages(
                    keyword=kw,
                    secondary=secondary,
                    longtail=longtail,
                    missing_bullets=missing_bullets,
                    weakness_bullets=weakness_bullets,
                )
            )

        result_msg = await safe_llm_call(_do_generate)
        content = result_msg.content

        title = kw.title()
        for line in content.split("\n"):
            if line.startswith("# "):
                title = line.replace("# ", "").strip()
                break

        logger.info("General blog generated: %s (%d words)", title, len(content.split()))
        content = await _quality_pipeline(content, kw)

        return {"title": title, "content": content}

    except Exception as exc:
        logger.error("General blog generation FAILED: %s", exc)
        return _FALLBACK_GENERAL.copy()


async def _generate_blogy_blog(title: str, specific_prompt: str) -> dict[str, str]:
    """Generate a single Blogy blog with controlled keyword density."""
    try:
        from langchain_core.prompts import ChatPromptTemplate

        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "You are a content writer for 'Blogy', an AI Blog Automation Tool in India. "
             "Only write about AI blogging, SEO automation, Blogy features, organic traffic. "
             "Never inject unrelated topics."),
            ("human", textwrap.dedent(f"""\
                Write a blog titled EXACTLY: "{title}"

                Constraints:
                - Target keyword: "Blogy"
                - Word count: 800–1000
                - Keyword density for "Blogy" MUST be between 1% and 2%
                - Use "Blogy" naturally (avoid stuffing)
                - Use synonyms where possible
                - Human tone, readable, not robotic
                - Short sentences (max 20 words)
                - Paragraphs: 2–3 lines max

                {specific_prompt}

                Output:
                - Only blog content in clean Markdown
                - No explanation
            """)),
        ])

        async def _do_generate():
            llm = get_llm(temperature=0.5, max_tokens=4000)
            return await llm.ainvoke(prompt.format_messages())

        msg = await safe_llm_call(_do_generate)

        logger.info("Blogy blog raw: %d words", len(msg.content.split()))
        content = await _quality_pipeline(msg.content, "Blogy")

        return {"title": title, "content": content}

    except Exception as exc:
        logger.error("Blogy blog generation FAILED (%s): %s", title[:40], exc)
        return None


async def _generate_blogy_blogs() -> list[dict[str, str]]:
    """Generate 2 Blogy blogs SEQUENTIALLY with delay between calls."""
    blog_configs = [
        {
            "title": "Blogy – Best AI Blog Automation Tool in India",
            "prompt": textwrap.dedent("""\
                INCLUDE:
                - 2 real examples (startup, freelancer — with city and results)
                - 1 comparison (Blogy vs traditional methods)
                - Features + benefits (bullet list)
                - "## Content Gaps / Unique Insights" section
                - "## FAQ" with 3-4 questions
                - CTA at the end
            """),
            "fallback": _FALLBACK_BLOGY_1,
        },
        {
            "title": "How Blogy is Disrupting Martech – Organic Traffic on Autopilot",
            "prompt": textwrap.dedent("""\
                INCLUDE:
                - Cost comparison table (Agency vs Freelancer vs Blogy)
                - Organic vs Paid traffic math
                - 1 real example
                - "## Content Gaps / Unique Insights" section
                - "## FAQ" with 3-4 questions
                - CTA at the end
            """),
            "fallback": _FALLBACK_BLOGY_2,
        },
    ]

    results = []
    for i, config in enumerate(blog_configs):
        if i > 0:
            logger.info("Waiting 1.5s before next blog...")
            await asyncio.sleep(1.5)

        blog = await _generate_blogy_blog(config["title"], config["prompt"])
        if blog is None:
            blog = config["fallback"].copy()
        results.append(blog)

    return results


async def generate_blogs(
    keyword_analysis: KeywordAnalysis | dict[str, Any] | None,
    gap: SerpGap | dict[str, Any] | None,
) -> list[dict[str, str]]:
    """Generate 1 general + 2 Blogy blogs SEQUENTIALLY. No parallel = no rate limits."""

    kw = _safe_kw(keyword_analysis)
    logger.info("Generating blogs SEQUENTIALLY | keyword=%s", kw)

    # Blog 1: General blog
    general_blog = await _generate_general_blog(keyword_analysis, gap)

    # Wait before next batch
    logger.info("Waiting 1.5s before Blogy blogs...")
    await asyncio.sleep(1.5)

    # Blog 2 & 3: Blogy blogs
    blogy_blogs = await _generate_blogy_blogs()

    if len(blogy_blogs) < 2:
        while len(blogy_blogs) < 2:
            blogy_blogs.append(_FALLBACK_BLOGY_2.copy())

    result = [general_blog] + blogy_blogs
    logger.info("Total blogs generated: %d", len(result))
    return result
