from __future__ import annotations

import json
import os
from models.schemas import KeywordAnalysis


# ---------- FALLBACK (NEVER RETURN None) ----------
_FALLBACK_KEYWORD = KeywordAnalysis(
    primary_keyword="AI blog automation",
    secondary_keywords=[
        "SEO tools", "content marketing", "AI writing",
        "blog optimization", "content automation",
    ],
    long_tail_keywords=[
        "AI SEO tools India",
        "best blog automation platform",
        "free AI content writing tools",
        "AI blog SEO optimization",
        "automated content marketing tools",
        "AI blog writing for startups",
    ],
    keyword_roi_score=78.5,
    internal_linking_suggestions=[
        "/blog/ai-seo-guide",
        "/resources/automation-checklist",
        "/blog/content-marketing-101",
    ],
)


async def expand_keywords(keyword: str) -> KeywordAnalysis:
    """Node 1 — Keyword Intelligence (LLM).

    Transforms the incoming keyword into an SEO-aware analysis.
    NEVER returns None — falls back to defaults on any error.
    """
    try:
        from langchain_groq import ChatGroq

        llm = ChatGroq(
            api_key=os.getenv("GROQ_API_KEY", ""),
            model="llama-3.1-8b-instant",
            temperature=0.3,
        )

        prompt = (
            f"You are an elite SEO strategist.\n"
            f"The user has provided the keyword: '{keyword}'.\n\n"
            f"Your rules:\n"
            f"1. If the keyword is extremely generic (e.g., 'food', 'random', 'blog'), "
            f"you MUST upgrade its primary_keyword to be an SEO-aware variant inside our domain "
            f"(e.g. 'AI tools for food blogging SEO').\n"
            f"2. Generate 5 highly relevant secondary_keywords.\n"
            f"3. Generate 6 long_tail_keywords that a startup or marketer would search for.\n"
            f"4. Assign a keyword_roi_score between 70.0 and 99.0 reflecting its value for B2B SaaS.\n"
            f"5. Suggest 3 internal_linking_suggestions (URL slugs starting with /blog/ or /resources/).\n\n"
            f"Return ONLY valid JSON matching this exact schema:\n"
            f'{{"primary_keyword": "...", "secondary_keywords": [...], "long_tail_keywords": [...], '
            f'"keyword_roi_score": 85.0, "internal_linking_suggestions": [...]}}'
        )

        # Try structured output first
        try:
            structured_llm = llm.with_structured_output(KeywordAnalysis)
            result = await structured_llm.ainvoke(prompt)
            if result is not None:
                print(f"✅ Keyword Analysis (structured): {result.primary_keyword}")
                return result
        except Exception as struct_err:
            print(f"⚠️ Structured output failed, trying raw JSON: {struct_err}")

        # Fallback: raw LLM call + manual parse
        raw_result = await llm.ainvoke(prompt)
        text = raw_result.content.strip()

        # Extract JSON from response
        if "{" in text:
            json_str = text[text.index("{"):text.rindex("}") + 1]
            data = json.loads(json_str)
            result = KeywordAnalysis(**data)
            print(f"✅ Keyword Analysis (parsed): {result.primary_keyword}")
            return result

    except Exception as exc:
        print(f"❌ Keyword node FAILED completely: {exc}")

    # ABSOLUTE FALLBACK — never return None
    print(f"🔄 Using fallback keyword analysis for: '{keyword}'")
    fallback = _FALLBACK_KEYWORD.model_copy()
    # At least incorporate the user's keyword into the fallback
    if keyword and keyword.strip():
        fallback.primary_keyword = f"AI tools for {keyword} blogging SEO"
    return fallback
