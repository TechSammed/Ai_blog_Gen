from __future__ import annotations

import json
import os
from models.schemas import SerpGap


# ---------- FALLBACK (NEVER RETURN None) ----------
_FALLBACK_GAP = SerpGap(
    missing_topics=[
        "case studies and success stories",
        "pricing comparison with competitors",
        "ROI metrics and benchmarks",
        "step-by-step implementation guides",
        "video tutorial walkthroughs",
    ],
    competitor_weakness=[
        "No FAQ section on most pages",
        "Slow page speed and poor Core Web Vitals",
        "No structured data or JSON-LD markup",
        "Poor mobile responsiveness",
        "Missing clear call-to-action buttons",
    ],
)


async def analyze_serp(keyword: str) -> SerpGap:
    """Node 2 — SERP Gap Analyzer (LLM).

    Identifies missing topics and competitor weaknesses.
    NEVER returns None — falls back to defaults on any error.
    """
    try:
        from langchain_groq import ChatGroq

        llm = ChatGroq(
            api_key=os.getenv("GROQ_API_KEY", ""),
            model="llama-3.1-8b-instant",
            temperature=0.5,
        )

        prompt = (
            f"You are an elite SEO SERP analyzer.\n"
            f"Analyze this specific optimized keyword: '{keyword}'.\n\n"
            f"Rules:\n"
            f"1. Generate exactly 5 'missing_topics' that top-ranking pages currently fail to cover in depth.\n"
            f"2. Generate exactly 5 'competitor_weakness' bullet points indicating where current SERP results fall short "
            f"(e.g., 'No mobile-responsive layout', 'Slow page speed', 'No FAQ section').\n\n"
            f"Return ONLY valid JSON matching this exact schema:\n"
            f'{{"missing_topics": [...], "competitor_weakness": [...]}}'
        )

        # Try structured output first
        try:
            structured_llm = llm.with_structured_output(SerpGap)
            result = await structured_llm.ainvoke(prompt)
            if result is not None:
                print(f"✅ SERP Gap (structured): {len(result.missing_topics)} topics")
                return result
        except Exception as struct_err:
            print(f"⚠️ SERP structured output failed, trying raw JSON: {struct_err}")

        # Fallback: raw LLM call + manual parse
        raw_result = await llm.ainvoke(prompt)
        text = raw_result.content.strip()

        if "{" in text:
            json_str = text[text.index("{"):text.rindex("}") + 1]
            data = json.loads(json_str)
            result = SerpGap(**data)
            print(f"✅ SERP Gap (parsed): {len(result.missing_topics)} topics")
            return result

    except Exception as exc:
        print(f"❌ SERP node FAILED completely: {exc}")

    # ABSOLUTE FALLBACK
    print(f"🔄 Using fallback SERP gap for: '{keyword}'")
    return _FALLBACK_GAP.model_copy()
