from __future__ import annotations

import asyncio
import math
import os
import re
import textwrap
from typing import Any

from models.schemas import KeywordAnalysis, SerpGap


def _get_llm():
    from langchain_groq import ChatGroq
    return ChatGroq(
        api_key=os.environ.get("GROQ_API_KEY", ""),
        model="llama-3.1-8b-instant",
        temperature=0.5,
        max_tokens=8000,
    )


# ═══════════════════════════════════════════════════════════════
#  POST-GENERATION QUALITY PIPELINE
# ═══════════════════════════════════════════════════════════════

def keyword_density(text: str, keyword: str) -> float:
    """Compute keyword density as a percentage.
    
    Matches the FULL keyword phrase (not individual words).
    """
    text_lower = text.lower()
    kw_lower = keyword.lower().strip()
    words = text_lower.split()
    total_words = len(words)
    if total_words == 0:
        return 0.0
    # Count occurrences of the full keyword phrase
    count = text_lower.count(kw_lower)
    kw_word_count = len(kw_lower.split())
    return round((count * kw_word_count / total_words) * 100, 2)


def readability_score(text: str) -> float:
    """Compute Flesch Reading Ease score. Higher = easier to read. Target: 60+."""
    words = text.split()
    word_count = len(words)
    sentence_count = max(1, len(re.split(r"[.!?]+", text)))
    
    syllable_count = 0
    for word in words:
        word_clean = word.lower().strip(".,!?;:\"'()-")
        if len(word_clean) <= 3:
            syllable_count += 1
            continue
        vowels = "aeiou"
        count = 0
        prev_vowel = False
        for ch in word_clean:
            is_vowel = ch in vowels
            if is_vowel and not prev_vowel:
                count += 1
            prev_vowel = is_vowel
        if word_clean.endswith("e") and count > 1:
            count -= 1
        syllable_count += max(1, count)
    
    if word_count == 0 or sentence_count == 0:
        return 50.0
    
    return 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllable_count / word_count)


# ═══════════════════════════════════════════════════════════════
#  BANNED PHRASES — killed before output
# ═══════════════════════════════════════════════════════════════

BANNED_PHRASES = [
    "the future looks bright",
    "in today's world",
    "has shown promise",
    "rapidly evolving",
    "revolutionizing",
    "game-changer",
    "game changer",
    "dive deep",
    "harness the power",
    "it's important to note",
    "it is important to note",
    "without further ado",
    "at the end of the day",
    "in conclusion",
    "leverage the power",
    "in the ever-evolving",
    "in this day and age",
    "needless to say",
    "it goes without saying",
    "as we all know",
    "the landscape is changing",
    "paradigm shift",
    "synergy",
    "unlock the potential",
    "unlock the power",
    "the bottom line is",
    "to put it simply",
    "at the forefront",
    "cutting-edge",
    "groundbreaking",
]


def _kill_banned_phrases(content: str) -> str:
    """Remove banned AI-sounding phrases from content."""
    result = content
    killed = []
    for phrase in BANNED_PHRASES:
        if phrase.lower() in result.lower():
            # Case-insensitive removal — replace with empty or contextual fix
            pattern = re.compile(re.escape(phrase), re.IGNORECASE)
            result = pattern.sub("", result)
            killed.append(phrase)
    
    # Clean up double spaces and empty lines left behind
    result = re.sub(r"  +", " ", result)
    result = re.sub(r"\n\n\n+", "\n\n", result)
    
    if killed:
        print(f"  🔪 Killed {len(killed)} banned phrases: {killed[:5]}")
    return result


def _fix_paragraph_keyword_density(content: str, keyword: str) -> str:
    """Ensure keyword appears max ONCE per paragraph. Replace extras with synonyms."""
    kw_lower = keyword.lower().strip()
    if not kw_lower:
        return content
    
    paragraphs = content.split("\n\n")
    fixed_paragraphs = []
    fixes_made = 0
    
    for para in paragraphs:
        # Skip headings and short lines
        if para.strip().startswith("#") or len(para.split()) < 10:
            fixed_paragraphs.append(para)
            continue
        
        # Count keyword occurrences in this paragraph
        count = para.lower().count(kw_lower)
        if count > 1:
            # Keep only the first occurrence, remove extras
            parts = []
            remaining = para
            first_found = False
            while kw_lower in remaining.lower():
                idx = remaining.lower().index(kw_lower)
                if not first_found:
                    # Keep the first occurrence
                    parts.append(remaining[:idx + len(kw_lower)])
                    remaining = remaining[idx + len(kw_lower):]
                    first_found = True
                else:
                    # Remove subsequent occurrences (replace with "it" or "this approach")
                    parts.append(remaining[:idx] + "this approach")
                    remaining = remaining[idx + len(kw_lower):]
                    fixes_made += 1
            parts.append(remaining)
            fixed_paragraphs.append("".join(parts))
        else:
            fixed_paragraphs.append(para)
    
    if fixes_made:
        print(f"  ✂️ Fixed {fixes_made} paragraphs with repeated keywords")
    return "\n\n".join(fixed_paragraphs)


def _split_long_sentences(content: str) -> str:
    """Split sentences longer than 20 words using natural break points."""
    lines = content.split("\n")
    fixed_lines = []
    splits_made = 0
    
    for line in lines:
        # Skip headings, bullets, table rows, empty lines
        if (line.strip().startswith("#") or 
            line.strip().startswith("-") or 
            line.strip().startswith("|") or
            line.strip().startswith("*") or
            line.strip().startswith(">") or
            len(line.strip()) == 0):
            fixed_lines.append(line)
            continue
        
        # Split line into sentences
        sentences = re.split(r'(?<=[.!?])\s+', line)
        new_sentences = []
        
        for sentence in sentences:
            words = sentence.split()
            if len(words) > 20:
                # Try to split at conjunctions or natural break points
                split_points = [" and ", " but ", " which ", " while ", " because ",
                               " however ", " although ", " since ", " when ", " where ",
                               " that ", ", "]
                split_done = False
                for sp in split_points:
                    if sp in sentence:
                        idx = sentence.index(sp)
                        # Ensure both parts are substantial (>5 words)
                        left = sentence[:idx].strip()
                        right = sentence[idx + len(sp):].strip()
                        if len(left.split()) >= 5 and len(right.split()) >= 5:
                            # Add period to left if it doesn't end with one
                            if not left.endswith(('.', '!', '?')):
                                left += '.'
                            # Capitalize right
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
        print(f"  ✂️ Split {splits_made} long sentences (>20 words)")
    return "\n".join(fixed_lines)


def ai_detection_score(text: str) -> int:
    """Score how AI-like the text sounds. Lower = more human. Target: ≤20."""
    ai_indicators = [
        "it's worth noting", "importantly", "furthermore", "additionally",
        "in summary", "to summarize", "overall", "in essence",
        "as we can see", "as mentioned", "as discussed", "moving forward",
        "it should be noted", "on the other hand", "having said that",
        "with that being said", "that being said", "all in all",
        "to conclude", "in a nutshell", "at its core",
    ]
    text_lower = text.lower()
    hits = sum(1 for phrase in ai_indicators if phrase in text_lower)
    
    # Also check for banned phrases still present
    banned_hits = sum(1 for phrase in BANNED_PHRASES if phrase.lower() in text_lower)
    
    return min(95, 10 + hits * 5 + banned_hits * 8)


async def _rewrite_for_density(blog: str, keyword: str) -> str:
    """LLM rewrite to reduce keyword stuffing."""
    llm = _get_llm()
    prompt = textwrap.dedent(f"""\
        Rewrite this blog to reduce keyword stuffing.

        KEYWORD: "{keyword}"

        RULES:
        - Use "{keyword}" max 8 times total
        - Replace extras with synonyms and natural alternatives
        - Keep EXACT same structure, headings, and sections
        - Keep FAQ and CTA intact
        - Output clean Markdown ONLY

        BLOG:
        {blog}
    """)
    result = await llm.ainvoke(prompt)
    return result.content


async def _rewrite_for_ai_detection(blog: str) -> str:
    """LLM rewrite to remove AI-sounding patterns."""
    llm = _get_llm()
    prompt = textwrap.dedent(f"""\
        Rewrite this blog to sound more human and less AI-generated.

        RULES:
        - Remove generic transitional phrases ("furthermore", "additionally", "it's worth noting")
        - Replace formal language with casual, direct statements
        - Add small opinions or observations where natural
        - Vary sentence length (mix 5-word punchy with 15-word explanatory)
        - Keep ALL sections, headings, FAQ, CTA intact
        - Keep the same meaning
        - Output clean Markdown ONLY

        BLOG:
        {blog}
    """)
    result = await llm.ainvoke(prompt)
    return result.content


async def _human_polish(blog: str) -> str:
    """Final pass: make the blog sound like a human wrote it."""
    llm = _get_llm()
    prompt = textwrap.dedent(f"""\
        Give this blog a final human polish.

        Make it sound like a real person wrote it — not an AI.

        RULES:
        - Add a slightly casual tone (like explaining to a friend)
        - Remove any remaining stiffness or formality
        - Make the intro feel relatable
        - Vary sentence rhythm (short. Then a bit longer to explain. Then short again.)
        - Keep ALL structure, sections, FAQ, and CTA intact
        - Do NOT add new sections or remove existing ones
        - Output clean Markdown ONLY

        BLOG:
        {blog}
    """)
    result = await llm.ainvoke(prompt)
    return result.content


async def _quality_pipeline(blog_content: str, keyword: str) -> str:
    """Multi-pass post-generation quality pipeline.
    
    Pass 1: Kill banned AI phrases (local, instant)
    Pass 2: Fix paragraph-level keyword repetition (local, instant)
    Pass 3: Split long sentences >20 words (local, instant)
    Pass 4: Keyword density rewrite loop (LLM, max 3 attempts)
    Pass 5: AI detection rewrite if score >20 (LLM)
    Pass 6: Final human polish pass (LLM)
    """
    content = blog_content
    print(f"\n  🔧 QUALITY PIPELINE START")
    
    # --- PASS 1: Kill banned phrases (instant) ---
    content = _kill_banned_phrases(content)
    
    # --- PASS 2: Fix paragraph-level keyword repetition (instant) ---
    content = _fix_paragraph_keyword_density(content, keyword)
    
    # --- PASS 3: Split long sentences (instant) ---
    content = _split_long_sentences(content)
    
    # --- PASS 4: Keyword density rewrite loop (LLM) ---
    MAX_DENSITY_ATTEMPTS = 3
    for attempt in range(MAX_DENSITY_ATTEMPTS):
        density = keyword_density(content, keyword)
        print(f"  📊 Density check ({attempt + 1}/{MAX_DENSITY_ATTEMPTS}): {density}%")
        if density <= 2.0:
            print(f"  ✅ Density OK ({density}%)")
            break
        print(f"  ⚠️ Density {density}% > 2.0%, rewriting...")
        content = await _rewrite_for_density(content, keyword)
    
    # --- PASS 5: AI detection check (LLM if needed) ---
    ai_score = ai_detection_score(content)
    read_score = readability_score(content)
    print(f"  🤖 AI detection score: {ai_score} (target: ≤20)")
    print(f"  📖 Readability score: {read_score:.0f} (target: ≥55)")
    
    if ai_score > 20:
        print(f"  ⚠️ AI score {ai_score} > 20, rewriting for human tone...")
        content = await _rewrite_for_ai_detection(content)
        # Re-run local fixes after LLM rewrite
        content = _kill_banned_phrases(content)
        content = _fix_paragraph_keyword_density(content, keyword)
    
    # --- Readability check ---
    read_score = readability_score(content)
    if read_score < 55:
        print(f"  ⚠️ Readability {read_score:.0f} < 55, splitting sentences...")
        content = _split_long_sentences(content)
    
    # --- PASS 6: Final human polish (LLM) ---
    print(f"  ✨ Final human polish pass...")
    content = await _human_polish(content)
    # One last local cleanup after polish
    content = _kill_banned_phrases(content)
    content = _fix_paragraph_keyword_density(content, keyword)
    
    # Final metrics
    final_density = keyword_density(content, keyword)
    final_read = readability_score(content)
    final_ai = ai_detection_score(content)
    final_words = len(content.split())
    print(f"\n  📋 FINAL METRICS:")
    print(f"     Keyword density: {final_density}%")
    print(f"     Readability: {final_read:.0f}")
    print(f"     AI score: {final_ai}")
    print(f"     Word count: {final_words}")
    print(f"  🔧 QUALITY PIPELINE COMPLETE\n")
    
    return content


# ═══════════════════════════════════════════════════════════════
#  SAFE ACCESSORS
# ═══════════════════════════════════════════════════════════════

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


# ═══════════════════════════════════════════════════════════════
#  FALLBACK BLOGS
# ═══════════════════════════════════════════════════════════════

_FALLBACK_GENERAL = {
    "title": "AI Blog Automation: The Complete Guide to Scaling Content",
    "content": textwrap.dedent("""\
        # AI Blog Automation: The Complete Guide to Scaling Content

        **Most content teams spend 4-6 hours per blog post.** That's fine if you publish twice a month. But if you need 10+ posts weekly to compete in search, manual writing doesn't scale.

        Automated content tools are changing how teams approach publishing. Not by replacing writers — but by handling the repetitive parts so humans can focus on strategy and personality.

        ## What Automated Content Actually Looks Like

        It's not a magic button. The best tools follow a structured pipeline:

        1. **Keyword research** — identify what people actually search for
        2. **SERP analysis** — study what's ranking and find gaps
        3. **Draft generation** — create an SEO-aware first draft
        4. **Quality validation** — check density, readability, and structure
        5. **Multi-platform export** — adapt for Medium, LinkedIn, WordPress

        ### Example: A SaaS Startup

        A B2B startup in Pune used content automation to go from 3 posts/month to 12. Their organic traffic grew 280% in 5 months. They didn't hire new writers — they just freed their existing team from keyword research and SEO formatting.

        ### Example: A Marketing Agency

        A Mumbai agency handles 8 clients. Before automation, each client got 2 posts/month. After: 6 posts/month per client, same team size. Client retention went from 70% to 92%.

        ## How This Compares to Manual Writing

        | Factor | Manual | Automated |
        |--------|--------|-----------|
        | Time per post | 4-6 hours | 15-30 minutes |
        | SEO consistency | Varies | Built-in |
        | Keyword research | Separate tool | Integrated |
        | Multi-platform | Manual reformatting | One-click |
        | Cost at scale | Linear increase | Flat |

        The honest take: automated tools produce solid B+ drafts. A human editor can push them to A+. That's still 80% faster than starting from scratch.

        ## Content Gaps / Unique Insights

        After reviewing dozens of competing blogs, these topics are consistently missing:

        - **Transparent ROI case studies** — competitors claim results but rarely show numbers
        - **Real pricing breakdowns** — users want side-by-side cost comparisons
        - **Step-by-step setup guides** — not just "what" but "how exactly, in 15 minutes"
        - **Video walkthroughs** — 73% of users prefer video for learning new tools
        - **Failure stories** — what doesn't work is as valuable as what does

        ## Practical Insight

        The biggest mistake teams make with content automation isn't the tool — it's the prompt. Vague input gives you generic output. The more specific your keyword context and target audience, the sharper the draft.

        **Rule of thumb**: Spend 5 minutes refining your keyword and topic brief. It saves 30 minutes of editing later.

        ## FAQ

        ### Q: Will Google penalize AI-generated content?
        A: No. Google evaluates content quality, not authorship. Helpful, well-structured content ranks regardless of how it was created.

        ### Q: What keyword density should I target?
        A: Keep it between 0.8-1.5%. Anything above 2% starts to feel unnatural and risks triggering spam filters.

        ### Q: Can I use this for technical or niche topics?
        A: Yes — but you'll get better results by providing domain-specific context in your prompts.

        ### Q: How much editing does AI content need?
        A: A good tool produces content that needs 10-15 minutes of human polish. Bad tools need a full rewrite — which defeats the purpose.

        ## Start Publishing Smarter

        You don't need more writers. You need a better workflow. Try Blogy's automated pipeline — from keyword to published blog in under 10 minutes.

        **[Start Your Free Trial →](#)**
    """),
}

_FALLBACK_BLOGY_1 = {
    "title": "Blogy – Best AI Blog Automation Tool in India",
    "content": textwrap.dedent("""\
        # Blogy – Best AI Blog Automation Tool in India

        **India has 65+ million small businesses.** Most can't afford a content team. But they still need organic traffic to grow. Blogy was built for exactly this gap.

        ## Why Blogy Works for Indian Creators

        - **Priced for Indian markets** — not Silicon Valley pricing
        - **End-to-end pipeline** — keyword research through multi-platform publishing
        - **No SEO expertise needed** — the tool handles density, headings, and structure

        ## SEO Features That Matter

        - Automatic keyword density control (0.8-1.5%)
        - Smart heading hierarchy (H1 → H2 → H3)
        - FAQ section generation for featured snippets
        - Internal linking suggestions
        - Readability scoring and auto-improvement

        ### Example: Startup in Delhi

        A D2C brand used Blogy to publish 15 blog posts in their first month. Result: 340% organic traffic increase in 90 days, zero additional headcount.

        ### Example: Freelance Writer in Bangalore

        A freelancer added Blogy to her workflow. She now delivers 3x more content to clients while spending less time on keyword research and SEO formatting.

        ## Content Gaps / Unique Insights

        Most competing AI writing tools miss:
        - No integrated SERP gap analysis
        - No multi-platform export
        - No post-generation quality validation
        - No keyword density auto-correction

        ## FAQ

        ### Q: How is Blogy different from ChatGPT?
        A: Blogy is purpose-built for SEO blogging with keyword intelligence, SERP analysis, and multi-platform export built in.

        ### Q: Is there a free tier?
        A: Yes — enough credits for multiple blog posts per month.

        ### Q: Does Blogy support regional languages?
        A: Hindi support is coming first. More languages are on the roadmap.

        ### Q: How much editing is needed?
        A: Most posts need 10-15 minutes of human polish. The structure, SEO, and formatting are handled automatically.

        ## Get Started

        Join thousands of Indian creators scaling their content with Blogy.

        **[Try Blogy Free →](#)**
    """),
}

_FALLBACK_BLOGY_2 = {
    "title": "How Blogy is Disrupting Martech – Organic Traffic on Autopilot, Cheapest SEO",
    "content": textwrap.dedent("""\
        # How Blogy is Disrupting Martech – Organic Traffic on Autopilot, Cheapest SEO

        **Indian businesses spent ₹21,000 crore on digital ads last year.** Most of that money disappeared when campaigns stopped. Organic content — the kind that compounds — costs a fraction and keeps working.

        ## The Cost Problem

        - SEO agency: ₹50,000–₹2,00,000/month
        - In-house content team: ₹3,00,000+/month
        - Blogy: A fraction of agency costs for unlimited content

        ## Organic vs Paid: The Math

        | Metric | Paid Ads | Organic Content |
        |--------|---------|----------------|
        | Cost per visitor | ₹15-₹200 | ₹0 after creation |
        | Traffic when you stop paying | 0 | Compounds monthly |
        | Trust factor | Low | High |

        ## How Blogy Automates the Pipeline

        1. Enter a keyword
        2. AI analyzes SERP landscape and gaps
        3. Generates 3 optimized blog posts
        4. Validates keyword density and readability
        5. Exports to 5 platforms (Medium, LinkedIn, WordPress, Dev.to, Hashnode)

        ## Content Gaps / Unique Insights

        Martech content consistently misses:
        - Transparent pricing comparisons with real numbers
        - ROI timelines (not just "results" but "results in X months")
        - Setup guides for non-technical founders

        ## FAQ

        ### Q: Can AI replace an SEO agency?
        A: For content creation and on-page SEO — yes. Technical SEO and backlinks still benefit from specialists.

        ### Q: How fast does organic traffic grow?
        A: Expect measurable results in 60-90 days with consistent publishing.

        ### Q: Is this suitable for enterprise?
        A: Yes — Blogy scales from solo creators to teams with role-based access.

        ### Q: What if my niche is very specific?
        A: The keyword intelligence adapts to any domain. Specific input produces specific output.

        ## Stop Renting Traffic

        Every blog post is an asset that works for you permanently. Paid ads are a rental.

        **[Start Your Free Trial →](#)**
    """),
}


# ═══════════════════════════════════════════════════════════════
#  GENERATION FUNCTIONS
# ═══════════════════════════════════════════════════════════════

async def _generate_general_blog(
    keyword_analysis: KeywordAnalysis | dict[str, Any] | None,
    gap: SerpGap | dict[str, Any] | None,
) -> dict[str, str]:
    """Generate → Measure → Rewrite loop for general blog."""
    try:
        from langchain_core.prompts import ChatPromptTemplate
        llm = _get_llm()

        kw = _safe_kw(keyword_analysis)
        secondary = ", ".join(_safe_list(keyword_analysis, "secondary_keywords")) or "SEO tools, content marketing"
        longtail = ", ".join(_safe_list(keyword_analysis, "long_tail_keywords")) or "AI SEO tools India"
        missing = _safe_list(gap, "missing_topics")
        weakness = _safe_list(gap, "competitor_weakness")

        missing_bullets = "\n".join(f"- {t}" for t in missing) if missing else "- Case studies\n- Pricing\n- ROI metrics"
        weakness_bullets = "\n".join(f"- {w}" for w in weakness) if weakness else "- No FAQ\n- Slow pages"

        system_prompt = textwrap.dedent("""\
            You are an SEO content writer. You write like a human — natural, clear, opinionated.

            RULES:
            - Use the primary keyword naturally (max 8-10 times in the ENTIRE blog)
            - Do NOT repeat keyword in the same paragraph
            - Use synonyms and natural alternatives wherever possible
            - Avoid generic phrases: "revolutionizing", "game-changer", "dive deep",
              "harness the power", "in today's world", "it's important to note", "leverage"
            - Short paragraphs (2-4 lines max)
            - Simple English (Grade 6-8 reading level)
            - Vary sentence length. Add opinionated takes.
        """)

        body_prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", textwrap.dedent("""\
                Generate a high-quality blog.

                PRIMARY KEYWORD: {keyword}
                SECONDARY KEYWORDS: {secondary}
                LONG-TAIL KEYWORDS: {longtail}

                MUST INCLUDE:
                - 2 real examples (with specific details: company type, city, results)
                - 1 comparison section (table or bullet comparison)
                - 1 practical insight (actionable advice the reader can use today)

                STRUCTURE:
                1. Hook introduction (include keyword in first 100 words)
                2. H2 + H3 sections explaining the topic
                3. Comparison section (table format preferred)
                4. "## Content Gaps / Unique Insights" section covering:
                {missing_bullets}
                5. Address competitor weaknesses:
                {weakness_bullets}
                6. "## FAQ" section with 4 questions (### for each Q)
                7. Conclusion with specific CTA (not a placeholder)

                LENGTH: 1000-1400 words. Write the FULL blog.
                FORMAT: Clean Markdown ONLY. No JSON.
            """)),
        ])

        result_msg = await llm.ainvoke(
            body_prompt.format_messages(
                keyword=kw,
                secondary=secondary,
                longtail=longtail,
                missing_bullets=missing_bullets,
                weakness_bullets=weakness_bullets,
            )
        )
        content = result_msg.content

        # Extract title from H1
        title = kw.title()
        for line in content.split("\n"):
            if line.startswith("# "):
                title = line.replace("# ", "").strip()
                break

        # ═══ POST-GENERATION QUALITY PIPELINE ═══
        print(f"✅ General blog generated: {title} ({len(content.split())} words)")
        content = await _quality_pipeline(content, kw)

        return {"title": title, "content": content}

    except Exception as exc:
        print(f"❌ General blog generation FAILED: {exc}")
        return _FALLBACK_GENERAL.copy()


async def _generate_blogy_blogs() -> list[dict[str, str]]:
    """Generate 2 Blogy blogs with quality validation."""
    try:
        from langchain_core.prompts import ChatPromptTemplate
        llm = _get_llm()

        system_prompt = textwrap.dedent("""\
            You are a content writer for 'Blogy', an AI Blog Automation Tool in India.

            STRICT RULES:
            ❌ DO NOT use any user-provided keywords (like "food", "travel", etc.)
            ❌ DO NOT inject unrelated topics
            ✅ ONLY write about: AI blogging, SEO automation, Blogy features, organic traffic
            - Use "Blogy" naturally (max 8-10 times)
            - Short paragraphs, bullet points, real examples
            - No generic phrases or AI-sounding language
            - Grade 6-8 reading level
        """)

        # Blog 1
        title_1 = "Blogy – Best AI Blog Automation Tool in India"
        prompt_1 = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", textwrap.dedent(f"""\
                Write a blog titled EXACTLY: "{title_1}"

                INCLUDE:
                - 2 real examples (startup, freelancer — with city and results)
                - 1 comparison (Blogy vs traditional methods)
                - Features + benefits (bullet list)
                - "## FAQ" with 4 questions
                - CTA at the end

                LENGTH: 1000-1400 words. Clean Markdown.
            """)),
        ])
        msg_1 = await llm.ainvoke(prompt_1.format_messages())

        # Blog 2
        title_2 = "How Blogy is Disrupting Martech – Organic Traffic on Autopilot, Cheapest SEO"
        prompt_2 = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", textwrap.dedent(f"""\
                Write a blog titled EXACTLY: "{title_2}"

                INCLUDE:
                - Cost comparison table (Agency vs Freelancer vs Blogy)
                - Organic vs Paid traffic math
                - 1 real example
                - "## FAQ" with 4 questions
                - CTA at the end

                LENGTH: 1000-1400 words. Clean Markdown.
            """)),
        ])
        msg_2 = await llm.ainvoke(prompt_2.format_messages())

        # Quality pipeline for both
        print(f"✅ Blogy blog 1 raw: {len(msg_1.content.split())} words")
        content_1 = await _quality_pipeline(msg_1.content, "Blogy")
        
        print(f"✅ Blogy blog 2 raw: {len(msg_2.content.split())} words")
        content_2 = await _quality_pipeline(msg_2.content, "Blogy")

        return [
            {"title": title_1, "content": content_1},
            {"title": title_2, "content": content_2},
        ]

    except Exception as exc:
        print(f"❌ Blogy blog generation FAILED: {exc}")
        return [_FALLBACK_BLOGY_1.copy(), _FALLBACK_BLOGY_2.copy()]


async def generate_blogs(
    keyword_analysis: KeywordAnalysis | dict[str, Any] | None,
    gap: SerpGap | dict[str, Any] | None,
) -> list[dict[str, str]]:
    """Generate 1 general + 2 Blogy blogs IN PARALLEL. Then validate quality."""

    print(f"📝 Generating blogs IN PARALLEL | keyword={_safe_kw(keyword_analysis)}")

    # 🚀 Run general + blogy concurrently
    general_task = _generate_general_blog(keyword_analysis, gap)
    blogy_task = _generate_blogy_blogs()
    general_blog, blogy_blogs = await asyncio.gather(general_task, blogy_task)

    if len(blogy_blogs) < 2:
        while len(blogy_blogs) < 2:
            blogy_blogs.append(_FALLBACK_BLOGY_2.copy())

    result = [general_blog] + blogy_blogs
    print(f"✅ Total blogs generated: {len(result)}")
    return result
