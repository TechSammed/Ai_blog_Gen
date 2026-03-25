from __future__ import annotations

import re
import textwrap

from models.schemas import PlatformFormats


def _strip_headings_to_level(text: str, max_level: int) -> str:
    """Downgrade headings deeper than *max_level* to bold text."""
    lines = []
    for line in text.split("\n"):
        m = re.match(r"^(#{1,6})\s+(.*)", line)
        if m and len(m.group(1)) > max_level:
            lines.append(f"**{m.group(2)}**")
        else:
            lines.append(line)
    return "\n".join(lines)


def _extract_title(blog: str) -> str:
    m = re.search(r"^#\s+(.+)", blog, re.MULTILINE)
    return m.group(1).strip() if m else "Untitled"


def _truncate(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rsplit(" ", 1)[0] + "…"




def _format_medium(blog: str) -> str:
    """Medium: keep markdown, add publication header and tags footer."""
    title = _extract_title(blog)
    tags = "#SEO #DigitalMarketing #ContentStrategy #India #Blogging"
    header = (
        f"*Originally published on the AI Blog Intelligence Engine*\n\n"
        f"---\n\n"
    )
    footer = (
        f"\n\n---\n\n"
        f"**If you found this useful, give it a 👏 and follow for more!**\n\n"
        f"{tags}"
    )
    return header + blog + footer


def _format_linkedin(blog: str) -> str:
    """LinkedIn: conversational hook + condensed version (<3 000 chars)."""
    title = _extract_title(blog)
    # Extract first 2 substantial paragraphs for the post body
    paragraphs = [p.strip() for p in blog.split("\n\n") if len(p.strip()) > 40 and not p.startswith("#")]
    body = "\n\n".join(paragraphs[:4])
    body = _truncate(body, 2500)

    return textwrap.dedent(f"""\
🚀 {title}

{body}

💡 Key takeaway: mastering this topic today gives you a head start that competitors will struggle to catch up with.

👉 Drop a comment if you want the full guide!

#SEO #ContentMarketing #DigitalIndia #StartupGrowth #AI
""")


def _format_wordpress(blog: str) -> str:
    """WordPress: full HTML-ready markdown + Yoast-friendly meta block."""
    title = _extract_title(blog)
    meta = textwrap.dedent(f"""\
<!--
SEO Title: {title}
Meta Description: A comprehensive guide to {title.lower()} — strategies, tools, and actionable tips for the Indian market.
Focus Keyword: {title.split(':')[0].strip().lower() if ':' in title else title.lower()}
-->

""")
    return meta + blog


def _format_devto(blog: str) -> str:
    """Dev.to: add front-matter block for their markdown editor."""
    title = _extract_title(blog)
    front_matter = textwrap.dedent(f"""\
---
title: "{title}"
published: true
tags: seo, webdev, productivity, tutorial
cover_image: ""
---

""")
    return front_matter + blog


def _format_hashnode(blog: str) -> str:
    """Hashnode: add front-matter + canonical URL placeholder."""
    title = _extract_title(blog)
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    front_matter = textwrap.dedent(f"""\
---
title: "{title}"
slug: "{slug}"
tags: seo, content-marketing, digital-india, ai-tools
canonical: "https://yourdomain.com/blog/{slug}"
---

""")
    return front_matter + blog




async def format_for_platforms(blog: str) -> PlatformFormats:
    """Convert a single blog into five platform-specific formats."""
    return PlatformFormats(
        medium=_format_medium(blog),
        linkedin=_format_linkedin(blog),
        wordpress=_format_wordpress(blog),
        devto=_format_devto(blog),
        hashnode=_format_hashnode(blog),
    )
