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
            temperature=0.3,
            max_tokens=1000,
        )

        prompt = (
            "You are an SEO expert.\n\n"
            "Return ONLY valid JSON.\n\n"
            "Schema:\n"
            '{\n'
            '  "missing_topics": ["string"],\n'
            '  "competitor_weakness": ["string"]\n'
            '}\n\n'
            "Rules:\n"
            "- Minimum 5 items in each array\n"
            "- No explanation\n"
            "- No markdown\n"
            "- No extra text\n"
            "- No trailing commas\n"
            "- Ensure valid JSON parsable by json.loads()\n\n"
            f"Input keyword: {keyword}"
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
