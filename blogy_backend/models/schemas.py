"""Pydantic models for the AI Blog Intelligence Engine."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field



class KeywordInput(BaseModel):
    keyword: str = Field(..., min_length=1, description="Primary keyword to analyze")



class KeywordAnalysis(BaseModel):
    primary_keyword: str
    secondary_keywords: list[str]
    long_tail_keywords: list[str]
    keyword_roi_score: float = Field(..., ge=0, le=100)
    internal_linking_suggestions: list[str]



class SerpGap(BaseModel):
    missing_topics: list[str]
    competitor_weakness: list[str]



class Prediction(BaseModel):
    seo_score_predicted: int = Field(..., ge=0, le=100)
    traffic_potential: str  # Low / Medium / High
    ranking_difficulty: str  # Easy / Medium / Hard
    estimated_monthly_traffic: int



class SeoScore(BaseModel):
    seo_score: int = Field(..., ge=0, le=100)
    keyword_density: float
    readability_score: int = Field(..., ge=0, le=100)
    ai_detection_score: int = Field(..., ge=0, le=100)
    snippet_readiness: bool
    humanization_score: int = Field(..., ge=0, le=100)
    featured_snippet: str



class PlatformFormats(BaseModel):
    medium: str
    linkedin: str
    wordpress: str
    devto: str
    hashnode: str



class ImprovementsMapping(BaseModel):
    missing_feature: str
    your_solution: str


class BlogyAnalysis(BaseModel):
    ux_issues: list[str]
    seo_issues: list[str]
    conversion_gaps: list[str]
    technical_risks: list[str]
    feature_suggestions: list[str]
    product_differentiation: str
    scalability: str
    improvements_mapping: list[ImprovementsMapping]



class GenerateResponse(BaseModel):
    keyword_analysis: KeywordAnalysis
    gap: SerpGap
    prediction: Prediction
    blog: str
    seo_score: SeoScore
    platform_formats: PlatformFormats
    blogy_analysis: BlogyAnalysis



class PipelineState(BaseModel):
    """Mutable state object that travels through every LangGraph node."""

    keyword: str = ""
    keyword_analysis: Optional[KeywordAnalysis] = None
    gap: Optional[SerpGap] = None
    prediction: Optional[Prediction] = None
    blog: str = ""
    seo_score: Optional[SeoScore] = None
    platform_formats: Optional[PlatformFormats] = None
    blogy_analysis: Optional[BlogyAnalysis] = None
    error: Optional[str] = None
