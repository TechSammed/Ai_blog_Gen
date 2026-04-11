# QuillNexus AI Blog Intelligence Engine

The **AI Blog Intelligence Engine** is a full-stack application built with **FastAPI + LangGraph** (backend) and **React + Vite + Tailwind** (frontend). It orchestrates a 7-node AI pipeline that transforms a single keyword into SEO-optimized, multi-platform blog content.

---

## System Pipeline Architecture

```
Keyword → Node 1 → Node 2 → Node 3 → Node 4 → Node 5 → Node 6 → Node 7 → Result.
```

| Node | Name | What It Does |
|------|------|-------------|
| 1 | **Keyword Intelligence** | Clustering, ROI scoring, long-tail expansion |
| 2 | **SERP Gap Analyzer** | Missing topics & competitor weaknesses |
| 3 | **Performance Predictor** | Traffic estimation & ranking difficulty |
| 4 | **Blog Generator** | Multi-step LLM content generation (3 blogs) |
| 5 | **SEO Validator** | Keyword density, readability, AI-detection scoring |
| 6 | **Platform Exporter** | Multi-platform formatting (Medium, LinkedIn, WordPress, Dev.to, Hashnode) |
| 7 | **QuillNexus Analysis** | Dashboard audit with UX, SEO, conversion & technical insights |

---

## Tech Stack

**Backend:** Python 3.10+, FastAPI, LangGraph, LangChain, Groq (LLaMA 3.1), Pydantic

**Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, ReactMarkdown

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- A [Groq API Key](https://console.groq.com/keys)
- Langchain API

### 1. Clone & Navigate
```bash
git clone <your-repo-url>
cd Ai_blog_Gen
```

### 2. Backend Setup
```bash
cd blogy_backend

# We recommend using conda for managing environments
conda create -p blogy_env python=3.10 -y 
conda activate ./blogy_env

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
# LANGCHAIN_API_KEY: Required for creating clear pipelines (optional)

# Start the server
uvicorn main:app --reload
```

The API will be running at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd blogy_frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be running at `http://localhost:5173`

### 4. Use the App
1. Open `http://localhost:5173` in your browser
2. Enter a keyword in the command bar (e.g., "AI content marketing")
3. Click **Start Analysis** — the 7-node pipeline will run
4. Explore results across the sidebar tabs: Keywords, SERP, Performance, Blogs, Dashboard

---

## API Reference

### `POST /api/generate`
**Body:** `{ "keyword": "your keyword" }`

**Response:** Full pipeline output including `keyword_analysis`, `gap`, `prediction`, `blogs[]`, and `blogy_analysis`.

### `POST /api/generate/stream`
Same input, returns Server-Sent Events showing pipeline node progress before final result.

### `GET /`
**Health check** — returns `{ "status": "healthy", "engine": "AI Blog Intelligence Engine v1.0.0" }`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for LLM calls. Without it, all nodes use fallback data. |

---

## Project Structure

```text
Ai_blog_Gen/
├── blogy_backend/          # FastAPI + LangGraph backend
│   ├── main.py             # Entry point
│   ├── api/routes.py       # API endpoints
│   ├── models/schemas.py   # Pydantic models
│   ├── pipeline/graph.py   # LangGraph orchestration
│   └── core/               # 7 pipeline node implementations
│       ├── keyword.py      # Node 1
│       ├── serp.py         # Node 2
│       ├── predictor.py    # Node 3
│       ├── generator.py    # Node 4
│       ├── seo.py          # Node 5
│       ├── exporter.py     # Node 6
│       └── blogy_analysis.py # Node 7
│
└── blogy_frontend/         # React + Vite frontend
    └── src/
        ├── api/blogApi.js          # API client
        ├── hooks/useAppContext.jsx # Global state
        └── components/
            ├── layout/     # Sidebar, TopBar
            ├── sections/   # 6 page-level components
            └── ui/         # BlogModal, ScoreRing
```

---

## License

MIT
