<div align="center">

# 🪶 QuillNexus — AI Blog Intelligence Engine

**Transform a single keyword into SEO-optimized, multi-platform blog content in minutes.**

![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge\&logo=fastapi\&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![LangGraph](https://img.shields.io/badge/LangGraph-0.0.40+-1C3A5F?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203-FF6B35?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)

</div>

---

📖 What is QuillNexus?

QuillNexus is not just a blog generator.

It is an AI-powered content intelligence system that:

Analyzes a keyword deeply
Identifies SEO opportunities & content gaps
Predicts performance before writing
Generates optimized content
Adapts it for multiple platforms

👉 It combines research + analysis + generation + optimization into one pipeline.

---

## 🚀 Key Features

### ✍️ Content Generation

* Generate complete blogs from a single keyword
* Human-like structured writing
* Optimized keyword density

### 📊 SEO Intelligence

* SERP gap analysis
* SEO score & traffic prediction
* Readability and quality checks

### 🌐 Multi-Platform Output

* Medium
* LinkedIn
* WordPress

### 🔍 Content Quality Engine

* Readability scoring
* Keyword density checks
* SEO validation & improvement

### ⚡ System Strengths

* 7-stage AI pipeline
* Fault-tolerant (fallback handling)
* Real-time processing

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

### 🔄 Pipeline Overview
* Keyword Intelligence
* SERP Gap Analysis
* Performance Prediction
* Blog Generation
* SEO Validation
* Platform Formatting
* Final Insight & Analysis

---

## 🛠️ Tech Stack

### Backend
* Python
* FastAPI
* LangGraph / LangChain

### Frontend
* React (Vite)
* Tailwind CSS

### LLM Used 
* Groq (LLaMA 3)

### DevOps
* Docker
* Docker Compose

---

## 🐳 Docker Setup (Recommended)

### 🚀 Run Full Project

```bash
from root 
docker-compose up --build
```

---

### 🌐 Access

* Frontend → http://localhost:3000
* Backend → http://localhost:8000
* API Docs → http://localhost:8000/docs

---

### 🔁 Run Again

```bash
docker-compose up
```

---

### ⚙️ Environment Variables

#### Frontend (`blogy_frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```

#### Backend (`blogy_backend/.env`)

```env
GROQ_API_KEY=your_key
LANGCHAIN_API_KEY=your_key
```

⚠️ Backend `.env` is not included in repo (security reason)

---

## 💻 Manual Setup (Optional)

### Backend

```bash
cd blogy_backend

conda create -p blogy_env python=3.10 -y
conda activate ./blogy_env

pip install -r requirements.txt

uvicorn main:app --reload
```

---

### Frontend

```bash
cd blogy_frontend

npm install
npm run dev
```

---

## 📁 Project Structure

```
Ai_blog_Gen/
│
├── blogy_backend/
│   ├── main.py
│   ├── api/
│   ├── core/
│   ├── pipeline/
│   └── models/
│
├── blogy_frontend/
│   ├── src/
│   ├── components/
│   └── api/
│
└── docker-compose.yml
```

---

## 🔄 Pipeline Overview

1. Keyword Intelligence
2. SERP Gap Analysis
3. Performance Prediction
4. Blog Generation
5. SEO Validation
6. Platform Formatting
7. Final Analysis

---

## 📌 Notes

* Use `localhost:8000` in browser (not `backend:8000`)
* `backend` hostname is only for Docker internal networking
* Rebuild after env changes:

```bash
docker-compose up --build
```

---

## 🚀 Future Improvements

* Database integration
* Authentication system
* Deployment (cloud hosting)
* Advanced analytics dashboard

---
updated Readme
