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

**QuillNexus** is a full-stack, production-grade **AI Blog Intelligence Engine** that orchestrates a 7-stage automated pipeline — from raw keyword input to fully formatted, SEO-validated, multi-platform blog content. It is built on top of **FastAPI + LangGraph** (backend) and **React 19 + Vite + Tailwind CSS v4** (frontend).

The engine doesn't just generate blogs — it **researches, analyzes, validates, and exports** content across five major publishing platforms, making it a complete content operations system powered by LLMs.

> ⚡ Built with **LLaMA 3.1-8B via Groq** — ultra-fast, free-tier friendly inference.

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

### Phase 1 — Keyword Intelligence 🔍

**File:** `core/keyword.py`

| Output Field | Description |
|---|---|
| `primary_keyword` | SEO-upgraded keyword variant (generic inputs are auto-improved) |
| `secondary_keywords` | 5 highly relevant related keywords |
| `long_tail_keywords` | 6 startup/marketer-focused long-tail variations |
| `keyword_roi_score` | Float 70–99 reflecting B2B SaaS content ROI |
| `internal_linking_suggestions` | 3 internal URL slugs for link-building |

- Uses **LangChain structured output** with automatic fallback to raw JSON parsing
- Detects generic inputs (e.g., `"food"`) and auto-upgrades them to SEO-aware variants
- Zero-crash guarantee: full fallback dataset used if LLM unavailable

---

### Phase 2 — SERP Gap Analyzer 📊

**File:** `core/serp.py`

Identifies **what is missing** in current search results for the keyword and surfaces **competitor weaknesses**.

| Output Field | Description |
|---|---|
| `missing_topics` | ≥5 content gaps not covered by current top-ranking pages |
| `competitor_weakness` | ≥5 structural/technical weaknesses in competing content |

- Results feed directly into the blog generator as content briefs
- Uses `temperature=0.3` for deterministic, research-quality outputs

---

### Phase 3 — Performance Predictor 📈

**File:** `core/predictor.py`

A **deterministic scoring engine** (seeded by MD5 hash for reproducibility) that computes realistic performance forecasts.

| Output Field | Values |
|---|---|
| `seo_score_predicted` | 30–98 computed score |
| `traffic_potential` | `High`, `Medium`, or `Low` |
| `ranking_difficulty` | `Easy`, `Medium`, or `Hard` |
| `estimated_monthly_traffic` | 300–25,000 monthly visitors |

**Scoring formula:**
```
raw_score = (gap_opportunity × 6) + (cluster_breadth × 4) + (roi × 0.3) + noise
```
- `High` traffic: 8,000–25,000/mo | `Medium`: 2,000–8,000/mo | `Low`: 300–2,000/mo
- Fully deterministic — same keyword always produces same prediction

---

### Phase 4 — Blog Generator ✍️

**File:** `core/generator.py`

The most complex node. Generates **3 blogs** (1 general + 2 brand-specific) sequentially with a built-in **multi-step quality pipeline**.

#### Blogs Generated
| Blog | Title Pattern | Audience |
|---|---|---|
| Blog 1 | General SEO blog for the input keyword | Broad web audience |
| Blog 2 | `"Blogy – Best AI Blog Automation Tool in India"` | Indian SMBs & creators |
| Blog 3 | `"How Blogy is Disrupting Martech – Organic Traffic on Autopilot"` | MarTech founders |

#### Quality Pipeline (runs after every generation)
```
Raw LLM Output
    │
    ├── Step 1: Kill banned phrases  (30+ AI-sounding clichés removed)
    ├── Step 2: Split long sentences (>20 words split at conjunctions)
    ├── Step 3: LLM density rewrite  (keyword density capped to 1–2%)
    ├── Step 4: Re-apply banned phrase filter
    └── Step 5: Final metrics log   (density, readability, AI-score, word count)
```

**Banned phrases include:** `"revolutionizing"`, `"game-changer"`, `"dive deep"`, `"cutting-edge"`, `"paradigm shift"`, `"synergy"`, `"groundbreaking"`, and 20+ more.

**Constraints enforced:**
- Word count: 800–1,000 per blog
- Keyword density: 1%–2%
- Max sentence length: 20 words
- Paragraphs: 2–3 lines
- Structure: Hook → H2 Sections → Real Example → Content Gaps → FAQ → CTA

---

### Phase 5 — SEO Validator ✅

**File:** `core/seo.py`

Runs a comprehensive validation suite on every generated blog.

| Metric | Computation |
|---|---|
| `keyword_density` | Regex-based with multi-word semantic fallback |
| `readability_score` | Flesch Reading Ease (206.835 formula) |
| `ai_detection_score` | Pattern-matching against 20+ AI indicator phrases |
| `humanization_score` | `100 - ai_detection_score` |
| `snippet_readiness` | FAQ-format Q&A detection for featured snippet eligibility |
| `featured_snippet` | Best candidate paragraph extracted for Google answer box |
| `seo_score` | Composite: `(density×0.25) + (readability×0.25) + (human×0.20) + bonuses` |

**Score bonuses:**
- +10 for FAQ/snippet presence
- +2 per `## heading` (up to +10)
- Length bonus: +1 per 150 words (up to +15)

---

### Phase 6 — Platform Exporter 🌐

**File:** `core/exporter.py`

Adapts each blog for **5 publishing platforms** with platform-native formatting:

| Platform | Format Style |
|---|---|
| **Medium** | Storytelling hook + personal insights + follow CTA |
| **LinkedIn** | Professional tone + bold hook + 2–3 emojis + hashtags |
| **WordPress** | `<!-- Meta Title -->` + `<!-- Meta Description -->` + SEO comments |
| **Dev.to** | YAML frontmatter (`title`, `published`, `tags`) + content |
| **Hashnode** | TL;DR bullet summary + full content + engagement prompt |

- Uses 3-strategy resilience: structured output → raw JSON parse → graceful fallback
- Rate-limit safe: 1.5s delay between blog exports

---

### Phase 7 — QuillNexus Dashboard Analysis 🧠

**File:** `core/blogy_analysis.py`

A **dynamic AI product strategist** that audits the Blogy platform using the actual generated blog metrics as context input.

| Analysis Category | Description |
|---|---|
| `ux_issues` | Usability problems (drag-and-drop, autosave, mobile, onboarding) |
| `seo_issues` | Meta, canonical, JSON-LD, Open Graph, sitemap gaps |
| `conversion_gaps` | Missing email capture, A/B testing, social share, exit-intent |
| `technical_risks` | Rate limiting, XSS, auth vulnerabilities, scaling risks |
| `feature_suggestions` | AI outline generator, real-time SEO sidebar, content calendar |
| `product_differentiation` | Positioning vs. WordPress, Ghost, and generic AI tools |
| `scalability` | Migration path from 500 → 50,000 concurrent users |
| `improvements_mapping` | Side-by-side: `missing_feature` → `your_solution` |

---

## 🏗️ System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                        React Frontend                              │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ TopBar   │  │  Sidebar   │  │ Sections │  │ BlogModal / UI │  │
│  │(Command) │  │(Navigation)│  │(6 pages) │  │ ScoreRing      │  │
│  └──────────┘  └────────────┘  └──────────┘  └────────────────┘  │
│            useAppContext.jsx (Global State + SSE)                  │
│                   blogApi.js (axios + SSE)                          │
└────────────────────────┬──────────────────────────────────────────┘
                         │ HTTP / SSE
┌────────────────────────▼──────────────────────────────────────────┐
│                      FastAPI Backend                               │
│  POST /api/generate          (full pipeline, JSON response)        │
│  POST /api/generate/stream   (SSE with node-by-node progress)      │
│  GET  /                      (health check)                         │
└────────────────────────┬──────────────────────────────────────────┘
                         │ ainvoke / astream
┌────────────────────────▼──────────────────────────────────────────┐
│                LangGraph State Machine                              │
│  PipelineState (Pydantic basemodel — shared across all nodes)      │
│                                                                     │
│  [keyword_node] → [serp_node] → [predictor_node]                  │
│       → [generator_node] → [seo_node] → [export_node]             │
│       → [blogy_node] → END                                         │
└────────────────────────┬──────────────────────────────────────────┘
                         │ LangChain Groq API
┌────────────────────────▼──────────────────────────────────────────┐
│               Groq Cloud — LLaMA 3.1-8B-Instant                   │
│  Ultra-low latency inference (<1s/call) — free tier supported      │
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

## ✨ Features

### 🤖 AI & Pipeline
- **Zero-crash guarantee** — every node has full fallback data; pipeline always returns results
- **LangGraph DAG orchestration** — typed state machine with `ainvoke` + `astream`
- **Dual invocation modes** — blocking JSON response or real-time Server-Sent Events
- **3-strategy LLM resilience** — structured output → raw JSON parse → hardcoded fallback
- **Rate-limit safe** — exponential backoff retry (3× max), 1.5s inter-request throttling
- **Shared LLM factory** — single `ChatGroq` instance with configurable temperature/tokens

### 📝 Content Quality
- **Multi-step quality pipeline** after every blog generation
- **Banned phrase detection** — 30+ clichés automatically removed
- **Long sentence splitter** — sentences >20 words split at conjunctions
- **Keyword density enforcer** — hard cap at 2%, LLM rewrite if exceeded
- **Flesch Reading Ease** scoring with syllable-level computation
- **AI-detection scoring** — 20+ pattern-matched AI indicators
- **Humanization scoring** — inverse AI-score for human-likeness rating
- **Featured snippet extraction** — best paragraph auto-selected for Google answer box

### 🌐 Multi-Platform Publishing
- **5-platform adapters** — Medium, LinkedIn, WordPress, Dev.to, Hashnode
- Each adapted version is 200–300 words with native format conventions
- LinkedIn versions include emojis, hashtags, professional tone
- Dev.to includes YAML frontmatter; WordPress includes SEO meta comments
- Hashnode includes TL;DR bullets

### 📊 Analytics & Insights
- Deterministic traffic prediction (seeded by keyword hash)
- SERP gap identification (≥5 missing topics, ≥5 competitor weaknesses)
- Keyword ROI scoring (70–99 float)
- Dynamic platform audit with 8 analysis categories
- Improvements mapping: competitor gaps vs. your solution

### 🖥️ Frontend UX
- Real-time pipeline progress via SSE (step 1/7 through 7/7)
- 6-section sidebar navigation (Generate, Keywords, SERP, Performance, Blogs, Dashboard)
- Full-screen blog reader modal with platform format tabs
- Animated SVG score rings for SEO/readability/humanization metrics
- ReactMarkdown rendering for blog content
- Global state via Context + custom hook

---

## 🆚 Advantages Over Alternatives

| Feature | QuillNexus | ChatGPT | Jasper | SurferSEO | WordPress + Yoast |
|---|:---:|:---:|:---:|:---:|:---:|
| Keyword intelligence (ROI + long-tail) | ✅ | ❌ | Partial | ✅ | ❌ |
| SERP gap analysis | ✅ | ❌ | ❌ | ✅ | ❌ |
| Traffic prediction (per keyword) | ✅ | ❌ | ❌ | Partial | ❌ |
| Multi-blog generation (3 blogs) | ✅ | ❌ | ✅ | ❌ | ❌ |
| Banned phrase / AI detection filter | ✅ | ❌ | ❌ | ❌ | ❌ |
| Flesch readability enforcement | ✅ | ❌ | ❌ | ❌ | ✅ |
| 5-platform content adaptation | ✅ | ❌ | ❌ | ❌ | ❌ |
| No-code, single keyword trigger | ✅ | Partial | Partial | ❌ | ❌ |
| Real-time pipeline streaming (SSE) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Platform audit / product intelligence | ✅ | ❌ | ❌ | ❌ | ❌ |
| Open-source & self-hostable | ✅ | ❌ | ❌ | ❌ | ✅ |
| Free LLM tier (Groq) | ✅ | ❌ | ❌ | ❌ | N/A |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Role |
|---|---|---|
| Python | 3.10+ | Runtime |
| FastAPI | ≥0.110.0 | REST API + SSE streaming |
| Uvicorn | ≥0.27.0 | ASGI server |
| LangGraph | ≥0.0.40 | Pipeline DAG orchestration |
| LangChain | ≥0.2.0 | LLM abstraction layer |
| LangChain-Groq | ≥0.1.0 | Groq API integration |
| Pydantic | ≥2.5.0 | Schema validation & serialization |
| python-dotenv | ≥1.0.0 | Environment management |
| pytest + pytest-asyncio | ≥8.0.0 | Async testing |
| httpx | ≥0.27.0 | Async HTTP client |

### Frontend
| Technology | Version | Role |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8+ | Dev server + bundler |
| Tailwind CSS | v4 | Utility-first styling |
| Lucide React | 1.7+ | Icon library |
| ReactMarkdown | 10+ | Blog content rendering |

### AI / Cloud
| Technology | Role |
|---|---|
| Groq Cloud (LLaMA 3.1-8B-Instant) | Ultra-fast LLM inference |
| LangChain Structured Output | Type-safe LLM responses |
| LangSmith (optional) | Pipeline visibility & tracing |

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

- A [Groq API Key](https://console.groq.com/keys)
- Langchain API
=======
- A free [Groq API Key](https://console.groq.com/keys)

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
cp .env.example .env
# Edit .env — add your GROQ_API_KEY
```

**`.env` file:**
```env
GROQ_API_KEY=gsk_your_key_here
LANGCHAIN_API_KEY=ls__your_key_here   # Optional — for LangSmith tracing
```

```bash
# Start the backend server
uvicorn main:app --reload
# → API running at http://localhost:8000
# → Swagger docs at http://localhost:8000/docs
```

### 3. Frontend Setup

```bash
cd blogy_frontend

npm install
npm run dev
# → Frontend running at http://localhost:5173
```

### 4. Use the App

1. Open `http://localhost:5173`
2. Enter a keyword in the command bar (e.g., `"AI content marketing"`)
3. Click **Start Analysis** — watch the 7-node pipeline run in real time
4. Explore results across tabs: **Keywords → SERP → Performance → Blogs → Dashboard**

---

## 📡 API Reference

### `POST /api/generate`

Full pipeline execution. Returns all 7 node outputs in a single JSON response.

**Request:**
```json
{
  "keyword": "AI content marketing"
}
```

**Response schema:**
```json
{
  "status": "success",
  "keyword_analysis": {
    "primary_keyword": "...",
    "secondary_keywords": ["..."],
    "long_tail_keywords": ["..."],
    "keyword_roi_score": 85.0,
    "internal_linking_suggestions": ["..."]
  },
  "gap": {
    "missing_topics": ["..."],
    "competitor_weakness": ["..."]
  },
  "prediction": {
    "seo_score_predicted": 82,
    "traffic_potential": "High",
    "ranking_difficulty": "Medium",
    "estimated_monthly_traffic": 14200
  },
  "blogs": [
    {
      "title": "...",
      "content": "...",
      "seo_score": 78,
      "keyword_density": 1.6,
      "readability_score": 68,
      "ai_detection_score": 15,
      "snippet_readiness": true,
      "humanization_score": 85,
      "featured_snippet": "...",
      "platform_formats": {
        "medium": "...",
        "linkedin": "...",
        "wordpress": "...",
        "devto": "...",
        "hashnode": "..."
      }
    }
  ],
  "blogy_analysis": {
    "ux_issues": ["..."],
    "seo_issues": ["..."],
    "conversion_gaps": ["..."],
    "technical_risks": ["..."],
    "feature_suggestions": ["..."],
    "product_differentiation": "...",
    "scalability": "...",
    "improvements_mapping": [
      { "missing_feature": "...", "your_solution": "..." }
    ]
  }
}
```

---

### `POST /api/generate/stream`

Same inputs as `/api/generate`. Returns **Server-Sent Events** showing node-by-node progress before delivering the final result.

**SSE event format:**
```
data: {"type": "progress", "step": 1, "node": "keyword_node"}
data: {"type": "progress", "step": 2, "node": "serp_node"}
...
data: {"type": "progress", "step": 7, "node": "blogy_node"}
data: {"type": "complete", "state": { ...full pipeline result... }}
```

---

### `GET /`

Health check.

**Response:**
```json
{
  "status": "healthy",
  "engine": "AI Blog Intelligence Engine v1.0.0"
}
```

---

## 🔌 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | **Yes** | Groq inference key — get it at [console.groq.com/keys](https://console.groq.com/keys). Without this, all LLM nodes use static fallback data. |
| `LANGCHAIN_API_KEY` | No | LangSmith API key for pipeline tracing and visualization |

---

## 🧪 Testing

```bash
cd blogy_backend

# Run all tests
pytest tests/ -v

# Run with async support
pytest tests/ -v --asyncio-mode=auto
```

Tests cover API endpoints, pipeline node outputs, schema validation, and SSE streaming behavior using `pytest-asyncio` + `httpx`.

---

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
## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add X"`
4. Push and open a pull request

Please ensure all async tests pass before submitting.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using FastAPI · LangGraph · LangChain · Groq · React 19**

*QuillNexus — From keyword to published content, in one pipeline.*

</div>
