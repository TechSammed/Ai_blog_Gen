"""Unit tests for core.utils — shared utility functions."""
from __future__ import annotations

import pytest
from core.utils import (
    keyword_density,
    flesch_reading_ease,
    ai_detection_score,
    humanization_score,
    word_count,
    sentence_count,
    sanitize_keyword,
)


# ─── keyword_density ───

class TestKeywordDensity:
    def test_empty_text_returns_zero(self):
        assert keyword_density("", "test") == 0.0

    def test_empty_keyword_returns_zero(self):
        assert keyword_density("some text here", "") == 0.0

    def test_single_word_keyword(self):
        text = "AI is great. AI tools are useful. Use AI daily."
        result = keyword_density(text, "AI")
        assert result > 0

    def test_multi_word_exact_match(self):
        text = "AI blog automation is great. AI blog automation saves time."
        result = keyword_density(text, "AI blog automation")
        assert result > 0

    def test_multi_word_term_fallback(self):
        text = "AI tools help with blog writing and automation of content."
        result = keyword_density(text, "AI blog automation tools India")
        assert result > 0  # counts individual significant terms

    def test_case_insensitive(self):
        text = "ai Blog AUTOMATION is here."
        result = keyword_density(text, "AI Blog Automation")
        assert result > 0

    def test_no_match_returns_zero(self):
        text = "The weather is sunny today in the park."
        assert keyword_density(text, "blockchain") == 0.0


# ─── readability ───

class TestReadability:
    def test_simple_text_scores_high(self):
        text = "The cat sat on the mat. It was a good day."
        assert flesch_reading_ease(text) > 60

    def test_empty_text_returns_default(self):
        assert flesch_reading_ease("") == 50.0


# ─── AI detection ───

class TestAiDetection:
    def test_clean_text_low_score(self):
        text = "Here are five tips for better blogging. Start with research."
        assert ai_detection_score(text) <= 30

    def test_ai_heavy_high_score(self):
        text = (
            "In today's world, it's important to note that the future looks bright. "
            "Furthermore, additionally, as we can see, this is a game-changer."
        )
        assert ai_detection_score(text) >= 40

    def test_humanization_inverse(self):
        assert humanization_score(20) == 80
        assert humanization_score(90) == 10


# ─── text metrics ───

class TestTextMetrics:
    def test_word_count(self):
        assert word_count("one two three") == 3

    def test_sentence_count(self):
        assert sentence_count("Hello world. How are you? Fine!") == 4  # 3 sentences + trailing split


# ─── input sanitization ───

class TestSanitizeKeyword:
    def test_strips_html(self):
        assert sanitize_keyword("<b>AI</b> tools") == "AI tools"

    def test_strips_control_chars(self):
        assert sanitize_keyword("AI\x00tools") == "AItools"

    def test_normalizes_whitespace(self):
        assert sanitize_keyword("  AI   blog   ") == "AI blog"

    def test_preserves_valid_input(self):
        assert sanitize_keyword("AI content marketing") == "AI content marketing"
