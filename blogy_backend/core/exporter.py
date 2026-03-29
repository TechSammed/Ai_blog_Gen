from __future__ import annotations

import json
import os
import textwrap

from models.schemas import PlatformFormats


def _get_llm():
    from langchain_groq import ChatGroq
    return ChatGroq(
        api_key=os.environ.get("GROQ_API_KEY", ""),
        model="llama-3.1-8b-instant",
        temperature=0.6,
        max_tokens=8000,
    )


def _truncate(text: str, max_chars: int = 3000) -> str:
    """Safely truncate text for prompts while keeping it meaningful."""
    return text[:max_chars] if len(text) > max_chars else text


async def format_for_platforms(title: str, content: str) -> PlatformFormats:
    """Generate FULL, COPY-PASTE READY content for each platform.
    
    NOT truncated snippets — returns complete, publishable text.
    Each platform version is uniquely adapted in tone, structure, and format.
    """
    # Shortcut fallback if no API key
    if not os.environ.get("GROQ_API_KEY"):
        return _make_fallback(title, content)

    from langchain_core.prompts import ChatPromptTemplate
    llm = _get_llm()

    truncated_content = _truncate(content, 2800)

    prompt = ChatPromptTemplate.from_messages([
        ("system", textwrap.dedent("""\
            You are an expert multi-platform content repurposer.

            CRITICAL RULES:
            - Return FULL-LENGTH, COPY-PASTE READY content for each platform
            - Each version must be UNIQUELY adapted — different wording, structure, tone
            - Do NOT truncate or cut content short
            - Do NOT return JSON-like snippets — return real, publishable text
            - Each platform version should be 400-800 words minimum
        """)),
        ("human", textwrap.dedent("""\
            Rewrite this blog for 5 platforms. Each must be FULL-LENGTH and COPY-PASTE READY.

            Original Title: {title}
            Original Content: {content}

            Return a JSON object with these 5 keys. Each value must be the COMPLETE, ready-to-publish text:

            "medium": Write in storytelling format. Start with an emotional or narrative hook.
            Use medium-length paragraphs. Include personal insights. End with a call to engage.
            Format cleanly. MINIMUM 500 words.

            "linkedin": Professional authority tone. Start with a bold hook statement.
            Short paragraphs (1-2 sentences each). Use 2-3 emojis sparingly.
            Include 3 actionable takeaways as bullet points. End with a question for engagement.
            Add relevant hashtags. MINIMUM 400 words.

            "wordpress": Full SEO-optimized version. Start with:
            <!-- Meta Title: ... -->
            <!-- Meta Description: ... -->
            <!-- Focus Keyword: ... -->
            Then the full blog with H2/H3 headings, FAQ schema, and author bio.
            MINIMUM 600 words.

            "devto": Start with YAML frontmatter (title, published, tags).
            Developer-friendly tone. Clean markdown. Include config examples or
            technical details where relevant. MINIMUM 500 words.

            "hashnode": Start with a "## TL;DR" summary (3-4 bullet points).
            Then the full article with clean markdown. Community-focused tone.
            End with discussion prompts. MINIMUM 500 words.
        """)),
    ])

    # Strategy 1: Structured output
    try:
        structured_llm = llm.with_structured_output(PlatformFormats)
        result = await structured_llm.ainvoke(
            prompt.format_messages(title=title, content=truncated_content)
        )
        if result is not None:
            print(f"✅ Platform formats generated (structured): {title[:40]}...")
            return result
    except Exception as err:
        print(f"⚠️ Structured platform output failed: {err}")

    # Strategy 2: Raw LLM + JSON parse
    try:
        raw = await llm.ainvoke(
            prompt.format_messages(title=title, content=truncated_content)
        )
        text = raw.content
        if "{" in text:
            json_str = text[text.index("{"):text.rindex("}") + 1]
            data = json.loads(json_str)
            result = PlatformFormats(**data)
            print(f"✅ Platform formats generated (parsed): {title[:40]}...")
            return result
    except Exception as err:
        print(f"⚠️ Platform JSON parse failed: {err}")

    # Strategy 3: Fallback
    print(f"🔄 Using fallback platform formats for: {title[:40]}...")
    return _make_fallback(title, content)


def _make_fallback(title: str, content: str) -> PlatformFormats:
    """Create decent fallback platform versions from the original content."""
    # Remove markdown headings for cleaner platform adaptation
    clean = content.replace("# ", "").replace("## ", "").replace("### ", "")

    return PlatformFormats(
        medium=(
            f"# {title}\n\n"
            f"{content}\n\n"
            f"---\n\n"
            f"*If this resonated with you, follow for more insights on AI and content marketing. "
            f"Originally published on Blogy.*"
        ),
        linkedin=(
            f"🚀 {title}\n\n"
            f"{clean[:1500]}\n\n"
            f"💡 Key Takeaways:\n"
            f"• AI-powered blogging saves 70% of content creation time\n"
            f"• SEO-optimized content drives sustainable organic traffic\n"
            f"• Multi-platform publishing maximizes reach\n\n"
            f"What's your experience with AI content tools? Drop your thoughts below 👇\n\n"
            f"#AI #SEO #ContentMarketing #Blogging #MarTech"
        ),
        wordpress=(
            f"<!-- Meta Title: {title[:60]} -->\n"
            f"<!-- Meta Description: {clean[:155]} -->\n"
            f"<!-- Focus Keyword: {title.split()[0]} -->\n\n"
            f"{content}\n\n"
            f"---\n\n"
            f"**About the Author**: This post was generated by Blogy's AI Blog Engine — "
            f"combining keyword intelligence, SERP gap analysis, and SEO validation "
            f"into a single automated pipeline."
        ),
        devto=(
            f"---\n"
            f"title: {title}\n"
            f"published: true\n"
            f"tags: seo, ai, blogging, contentmarketing\n"
            f"---\n\n"
            f"{content}\n\n"
            f"---\n\n"
            f"*Built with Blogy — India's AI Blog Automation Platform.*"
        ),
        hashnode=(
            f"## TL;DR\n\n"
            f"- AI blog automation saves time and money\n"
            f"- SEO-optimized content ranks better on Google\n"
            f"- Multi-platform publishing maximizes content ROI\n"
            f"- Blogy handles the entire pipeline from keyword to publish\n\n"
            f"---\n\n"
            f"# {title}\n\n"
            f"{content}\n\n"
            f"---\n\n"
            f"**What do you think about AI-powered content creation?** "
            f"Share your experience in the comments!"
        ),
    )
