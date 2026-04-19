<div align="center">

# 🪶 QuillNexus — AI Blog Intelligence Engine

**Transform a single keyword into SEO-optimized, multi-platform blog content in minutes.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.0.40+-1C3A5F?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.1-FF6B35?style=for-the-badge)](https://groq.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📖 What Is QuillNexus?

**QuillNexus** is an AI-powered system that converts a single keyword into **SEO-optimized blog content**.

It analyzes the keyword, identifies content gaps, generates structured blog articles, and improves them for better readability and search performance. The system also adapts the content for different platforms, making it ready for publishing.

Overall, it simplifies the entire content creation process by combining research, writing, and optimization into one automated workflow.

---

## 🚀 The 7-Phase Pipeline

Every run flows through a sequential, fault-tolerant LangGraph DAG — every node has a fallback so the pipeline **never crashes**.

```
Keyword → Node 1 → Node 2 → Node 3 → Node 4 → Node 5 → Node 6 → Node 7 → Result.
=======
Keyword Input
    │
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Node 1 ── Keyword Intelligence                                     │
│  Node 2 ── SERP Gap Analyzer                                        │
│  Node 3 ── Performance Predictor                                    │
│  Node 4 ── Blog Generator  (1 general + 2 brand-specific blogs)     │
│  Node 5 ── SEO Validator                                            │
│  Node 6 ── Platform Exporter                                        │
│  Node 7 ── QuillNexus Dashboard Analysis                            │
└─────────────────────────────────────────────────────────────────────┘
    │
    ▼
Full Pipeline Result (JSON)
```
---
##  Pipeline Overview

### Phase 1 — Keyword Intelligence 🔍  
Generates optimized keywords from the input keyword.

It produces:
- Primary keyword (refined version)
- Secondary keywords
- Long-tail keywords  
- Basic SEO relevance (ROI score)

This helps in building a strong SEO foundation before content generation.

---

### Phase 2 — SERP Gap Analyzer 📊  
Analyzes existing search results to identify content gaps and competitor weaknesses.

It focuses on:
- Missing topics in top-ranking pages  
- Weak areas in competitor content  

These insights are used to generate more competitive and valuable blogs.

---

### Phase 3 — Performance Predictor 📈  
Estimates how well the content will perform before publishing.

It predicts:
- SEO score  
- Traffic potential  
- Ranking difficulty  

This helps in understanding whether the keyword is worth targeting.

---

### Phase 4 — Blog Generator ✍️  
Generates SEO-optimized blog content using AI.

It ensures:
- Proper structure (headings, sections)  
- Controlled keyword usage  
- Readable and human-like writing  

Multiple blog variations can be generated for better flexibility.

---

### Phase 5 — SEO Validator ✅  
Evaluates the generated blog using important SEO metrics.

It checks:
- Keyword density  
- Readability score  
- Content quality  

Based on this, it assigns a final SEO score and improves weak areas.

---

### Phase 6 — Platform Exporter 🌐  
Formats the blog for different platforms like:

- Medium  
- LinkedIn  
- WordPress  

Each version follows platform-specific writing styles, tone, and formatting to maximize engagement.

---

### Phase 7 — Dashboard Analysis 🧠  
Provides insights and improvement suggestions based on generated content.

Includes recommendations for:
- SEO improvements  
- User experience  
- Feature enhancements  

Helps in refining both content strategy and overall product performance.

---

## 🏗️ System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                        React Frontend                             │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌────────────────┐   │
│  │ TopBar   │  │  Sidebar   │  │ Sections │  │ BlogModal / UI │   │
│  │(Command) │  │(Navigation)│  │(6 pages) │  │ ScoreRing      │   │
│  └──────────┘  └────────────┘  └──────────┘  └────────────────┘   │
│            useAppContext.jsx (Global State + SSE)                 │
│                   blogApi.js (axios + SSE)                        │
└────────────────────────┬──────────────────────────────────────────┘
                         │ HTTP / SSE
┌────────────────────────▼──────────────────────────────────────────┐
│                      FastAPI Backend                              │
│  POST /api/generate          (full pipeline, JSON response)       │
│  POST /api/generate/stream   (SSE with node-by-node progress)     │
│  GET  /                      (health check)                       │
└────────────────────────┬──────────────────────────────────────────┘
                         │ ainvoke / astream
┌────────────────────────▼──────────────────────────────────────────┐
│                LangGraph State Machine                            │
│  PipelineState (Pydantic basemodel — shared across all nodes)     │
│                                                                   │
│  [keyword_node] → [serp_node] → [predictor_node]                  │
│       → [generator_node] → [seo_node] → [export_node]             │
│       → [blogy_node] → END                                        │
└────────────────────────┬──────────────────────────────────────────┘
                         │ LangChain Groq API
┌────────────────────────▼──────────────────────────────────────────┐
│               Groq Cloud — LLaMA 3.1-8B-Instant                   │
│  Ultra-low latency inference (<1s/call) — free tier supported     │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Project Structure

```text
Ai_blog_Gen/
│
├── blogy_backend/                   # FastAPI + LangGraph backend
│   ├── main.py                      # App entry point, CORS, router
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Environment variable template
│   │
│   ├── api/
│   │   └── routes.py                # /api/generate + /api/generate/stream
│   │
│   ├── models/
│   │   └── schemas.py               # All Pydantic models (10 schemas)
│   │
│   ├── pipeline/
│   │   └── graph.py                 # LangGraph DAG — nodes, edges, streaming
│   │
│   └── core/                        # 7 pipeline node implementations
│       ├── keyword.py               # Node 1 — Keyword Intelligence
│       ├── serp.py                  # Node 2 — SERP Gap Analyzer
│       ├── predictor.py             # Node 3 — Performance Predictor
│       ├── generator.py             # Node 4 — Blog Generator + quality pipeline
│       ├── seo.py                   # Node 5 — SEO Validator
│       ├── exporter.py              # Node 6 — Platform Exporter
│       ├── blogy_analysis.py        # Node 7 — Dashboard Analyzer
│       ├── utils.py                 # Flesch, keyword density, AI detection, LLM factory
│       ├── cache.py                 # Response caching layer
│       └── logger.py                # Structured logging setup
│
└── blogy_frontend/                  # React 19 + Vite + Tailwind v4 frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                  # Root layout
        ├── main.jsx                 # Entry point
        ├── index.css                # Tailwind + custom design system
        │
        ├── api/
        │   └── blogApi.js           # Axios client + SSE event source
        │
        ├── hooks/
        │   └── useAppContext.jsx    # Global state, pipeline state machine
        │
        ├── constants/               # UI constants, node labels
        │
        └── components/
            ├── layout/
            │   ├── TopBar.jsx       # Command bar + trigger
            │   └── Sidebar.jsx      # Navigation tabs
            │
            ├── sections/
            │   ├── GenerateSection.jsx   # Homepage + pipeline runner
            │   ├── KeywordsSection.jsx   # Node 1 output
            │   ├── SerpSection.jsx       # Node 2 output
            │   ├── PredictionSection.jsx # Node 3 output
            │   ├── BlogsSection.jsx      # Node 4–6 output + preview
            │   └── NexusSection.jsx      # Node 7 — Dashboard audit
            │
            └── ui/
                ├── BlogModal.jsx    # Full-screen blog reader + platform tabs
                └── ScoreRing.jsx    # Animated SVG score ring
```

---

## ✨ Key Features

### 🚀 Core Capabilities
- Generate SEO-optimized blogs from a single keyword  
- Identify content gaps and competitor weaknesses  
- Predict SEO score, traffic, and ranking difficulty  
- End-to-end automated content pipeline  

---

### ✍️ Content Quality
- Human-like, structured blog generation  
- Automatic keyword optimization (1–2% density)  
- Readability improvement and sentence refinement  
- Removes AI-sounding phrases  

---

### 🌐 Multi-Platform Support
- Ready-to-publish formats for:
  - Medium  
  - LinkedIn  
  - WordPress  
- Platform-specific tone and formatting  

---

### 📊 Insights & Analysis
- SEO scoring and content evaluation  
- Keyword relevance and ROI estimation  
- Actionable suggestions for improvement  

---

### ⚡ System Strengths
- Reliable pipeline with fallback handling  
- Real-time processing and response  
- Scalable and modular architecture  
---

## 🛠️ Tech Stack

### Backend
- Python  
- FastAPI  
- LangChain / LangGraph  

### Frontend
- React  
- Tailwind CSS  

### AI & Tools
- Groq (LLaMA 3)  
- REST APIs  

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

- Groq API Key
- Langchain API 

### 1. Clone & Navigate

```bash
git clone https://github.com/your-username/QuillNexus.git
cd QuillNexus/Ai_blog_Gen
```

### 2. Backend Setup

```bash
cd blogy_backend

# Create and activate environment (conda recommended)
conda create -p blogy_env python=3.10 -y
conda activate ./blogy_env

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
.env
add your Groq and Langchain API key
```

**.env file:**
```env
GROQ_API_KEY=gsk_your_key_here
LANGCHAIN_API_KEY=ls__your_key_here   # Optional — for LangSmith tracing
```

```bash
# cd blogy_backend
uvicorn main:app --reload
# → API running at http://localhost:8000
```

### 3. Frontend Setup

```bash
cd blogy_frontend

npm install
npm run dev
# → Frontend running at http://localhost:5173
```

### 4. Use the Application

1. Open `http://localhost:5173`
2. Enter a keyword in the command bar (e.g., `"AI content marketing"`)
3. Click **Start Analysis** — watch the 7-node pipeline run in real time
4. Explore results across tabs: **Keywords → SERP → Performance → Blogs → Dashboard**

---

## 🔌 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | **Yes** | Groq inference key — get it at [console.groq.com/keys](https://console.groq.com/keys). Without this, all LLM nodes use static fallback data. |
| `LANGCHAIN_API_KEY` | No | LangSmith API key for pipeline tracing and visualization |



## 📦 Pydantic Data Models

```
KeywordInput         → Input validation + XSS/control-char sanitization
KeywordAnalysis      → Node 1 output (primary, secondary, long-tail, ROI, links)
SerpGap              → Node 2 output (missing_topics, competitor_weakness)
Prediction           → Node 3 output (seo_score, traffic, difficulty, est_traffic)
SeoScore             → Node 5 intermediate (density, readability, AI-score, snippet)
PlatformFormats      → Node 6 output (medium, linkedin, wordpress, devto, hashnode)
Blog                 → Aggregated blog (content + all SEO metrics + platform formats)
ImprovementsMapping  → Node 7 sub-model (missing_feature → your_solution)
BlogyAnalysis        → Node 7 output (ux, seo, conversion, technical, features, etc.)
GenerateResponse     → Full API response envelope
PipelineState        → LangGraph shared state (carries data between all 7 nodes)
```



