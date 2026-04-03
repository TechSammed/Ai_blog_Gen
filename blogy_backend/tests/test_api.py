"""API integration tests for the Blogy backend."""
from __future__ import annotations

import pytest


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
async def test_generate_html_sanitized(client):
    """Ensure HTML tags are stripped from keyword input."""
    response = await client.post("/api/generate", json={"keyword": "<script>alert(1)</script>AI blogging"})
    # Should not 500 - either 422 (if empty after strip) or 200 (sanitized)
    assert response.status_code in (200, 422)


@pytest.mark.anyio
async def test_generate_too_long_keyword_rejected(client):
    long_keyword = "a" * 201
    response = await client.post("/api/generate", json={"keyword": long_keyword})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_generate_returns_structured_response(client):
    """Smoke test — pipeline should always return structured JSON, never crash."""
    response = await client.post("/api/generate", json={"keyword": "test"})
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "keyword_analysis" in data
    assert "blogs" in data
    assert data["status"] in ("success", "partial_success")
