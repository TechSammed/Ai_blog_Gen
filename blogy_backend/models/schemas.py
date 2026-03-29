from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, Field

class KeywordInput(BaseModel):
    keyword: str = Field(..., min_length=1)

class KeywordAnalysis(BaseModel):
    primary_keyword: str
    secondary_keywords: list[str]
    long_tail_keywords: list[str]
    keyword_roi_score: float
    internal_linking_suggestions: list[str]

class SerpGap(BaseModel):
    missing_topics: list[str]
    competitor_weakness: list[str]

class Prediction(BaseModel):
    seo_score_predicted: int
    traffic_potential: str
    ranking_difficulty: str
    estimated_monthly_traffic: int

class SeoScore(BaseModel):
    seo_score: int
    keyword_density: float
    readability_score: int
    ai_detection_score: int
    snippet_readiness: bool
    humanization_score: int
    featured_snippet: str

class PlatformFormats(BaseModel):
    medium: str
    linkedin: str
    wordpress: str
    devto: str
    hashnode: str

class Blog(BaseModel):
    title: str
    content: str
    seo_score: Optional[SeoScore] = None
    platform_formats: Optional[PlatformFormats] = None

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
    status: str = "success"
    message: str = ""
    keyword_analysis: KeywordAnalysis
    gap: SerpGap
    prediction: Prediction
    blogs: list[Blog]
    blogy_analysis: BlogyAnalysis

class PipelineState(BaseModel):
    keyword: str = ""
    keyword_analysis: Optional[KeywordAnalysis] = None
    gap: Optional[SerpGap] = None
    prediction: Optional[Prediction] = None
    
    # Internal state holds the blogs before they get seo and platforms added
    raw_blogs: list[dict[str, str]] = Field(default_factory=list)
    blogs: list[Blog] = Field(default_factory=list)
    
    blogy_analysis: Optional[BlogyAnalysis] = None
    error: Optional[str] = None
