from __future__ import annotations

import re
from typing import Any, Optional
from pydantic import BaseModel, Field, field_validator

class KeywordInput(BaseModel):
    keyword: str = Field(..., min_length=1, max_length=200)

    @field_validator("keyword")
    @classmethod
    def sanitize_keyword(cls, v: str) -> str:
        v = re.sub(r'<[^>]+>', '', v)                
        v = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', v)  
        v = ' '.join(v.split())                       
        v = v.strip()
        if not v:
            raise ValueError('Keyword cannot be empty after sanitization')
        return v

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
    seo_score: int = 0
    keyword_density: float = 0.0
    readability_score: int = 0
    ai_detection_score: int = 0
    snippet_readiness: bool = False
    humanization_score: int = 0
    featured_snippet: str = ""
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

    raw_blogs: list[dict[str, str]] = Field(default_factory=list)
    blogs: list[Blog] = Field(default_factory=list)

    blogy_analysis: Optional[BlogyAnalysis] = None
    error: Optional[str] = None
