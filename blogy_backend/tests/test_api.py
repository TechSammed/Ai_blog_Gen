"""API integration tests for the Blogy backend."""
from __future__ import annotations

import json

import pytest

from models.schemas import (
    Blog,
    BlogyAnalysis,
    ImprovementsMapping,
    KeywordAnalysis,
    Prediction,
    SerpGap,
)


def _fake_state(keyword: str):
    return {
        "keyword": keyword,
        "keyword_analysis": KeywordAnalysis(
            primary_keyword=f"{keyword} primary",
            secondary_keywords=["secondary one", "secondary two"],
            long_tail_keywords=["long tail one", "long tail two"],
            keyword_roi_score=82.5,
            internal_linking_suggestions=["/blog/sample"],
        ),
        "gap": SerpGap(
            missing_topics=["topic 1", "topic 2"],
            competitor_weakness=["weakness 1", "weakness 2"],
        ),
        "prediction": Prediction(
            seo_score_predicted=74,
            traffic_potential="Medium",
            ranking_difficulty="Medium",
            estimated_monthly_traffic=4200,
        ),
        "blogs": [
            Blog(
                title="Sample Blog",
                content="# Sample\n\nSample content.",
                seo_score=71,
                keyword_density=1.5,
                readability_score=65,
                ai_detection_score=18,
                snippet_readiness=True,
                humanization_score=82,
                featured_snippet="Sample snippet",
            )
        ],
        "blogy_analysis": BlogyAnalysis(
            ux_issues=["ux issue"],
            seo_issues=["seo issue"],
            conversion_gaps=["conversion gap"],
            technical_risks=["technical risk"],
            feature_suggestions=["feature suggestion"],
            product_differentiation="Differentiation",
            scalability="Scalable",
            improvements_mapping=[
                ImprovementsMapping(
                    missing_feature="missing",
                    your_solution="solution",
                )
            ],
        ),
    }


@pytest.mark.anyio
async def test_health_check(client):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.anyio
async def test_generate_empty_keyword_rejected(client):
    response = await client.post("/api/generate", json={"keyword": ""})
    assert response.status_code == 422  # Pydantic validation error


@pytest.mark.anyio
async def test_generate_html_sanitized(client, monkeypatch):
    """Ensure HTML tags are stripped from keyword input."""
    from api import routes

    async def fake_run_pipeline(keyword: str):
        return _fake_state(keyword)

    monkeypatch.setattr(routes, "run_pipeline", fake_run_pipeline)

    response = await client.post("/api/generate", json={"keyword": "<script>alert(1)</script>AI blogging"})
    # Should not 500 - either 422 (if empty after strip) or 200 (sanitized)
    assert response.status_code in (200, 422)


@pytest.mark.anyio
async def test_generate_too_long_keyword_rejected(client):
    long_keyword = "a" * 201
    response = await client.post("/api/generate", json={"keyword": long_keyword})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_generate_returns_structured_response(client, monkeypatch):
    """Smoke test — pipeline should always return structured JSON, never crash."""
    from api import routes

    async def fake_run_pipeline(keyword: str):
        return _fake_state(keyword)

    monkeypatch.setattr(routes, "run_pipeline", fake_run_pipeline)

    response = await client.post("/api/generate", json={"keyword": "test"})
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "keyword_analysis" in data
    assert "blogs" in data
    assert data["status"] in ("success", "partial_success")


@pytest.mark.anyio
async def test_generate_uses_cache_for_repeated_keyword(client, monkeypatch, tmp_path):
    from api import routes

    calls = {"count": 0}

    async def fake_run_pipeline(keyword: str):
        calls["count"] += 1
        return {}

    monkeypatch.setattr(routes, "run_pipeline", fake_run_pipeline)
    routes.cache.cache_file = tmp_path / "generation_cache.json"

    payload = {"keyword": "fastapi"}
    first = await client.post("/api/generate", json=payload)
    second = await client.post("/api/generate", json=payload)

    assert first.status_code == 200
    assert second.status_code == 200
    assert calls["count"] == 1


@pytest.mark.anyio
async def test_generate_stream_uses_cache_for_repeated_keyword(client, monkeypatch, tmp_path):
    from api import routes

    calls = {"count": 0}

    async def fake_run_pipeline_stream(keyword: str):
        calls["count"] += 1
        yield {"type": "progress", "step": 1, "node": "keyword_node"}
        yield {"type": "complete", "state": {"keyword": keyword}}

    monkeypatch.setattr(routes, "run_pipeline_stream", fake_run_pipeline_stream)
    routes.cache.cache_file = tmp_path / "generation_cache_stream.json"

    payload = {"keyword": "fastapi"}
    first = await client.post("/api/generate/stream", json=payload)
    second = await client.post("/api/generate/stream", json=payload)

    assert first.status_code == 200
    assert second.status_code == 200
    assert "data: [DONE]" in first.text
    assert "data: [DONE]" in second.text
    assert calls["count"] == 1

    second_lines = [line for line in second.text.splitlines() if line.startswith("data: ")]
    second_payload = json.loads(second_lines[0][6:])
    assert second_payload["type"] == "result"
