# AI Blog Intelligence Engine

The **AI Blog Intelligence Engine** is a powerful, fully-async backend built with FastAPI, LangGraph, and Groq. It orchestrates a sophisticated multi-node pipeline for high-quality, SEO-optimized content production.

### System Pipeline Architecture
The system consists of 7 sequential nodes to act as an SEO decision-making engine:
1. **Keyword Intelligence**: Clustering and return on investment (ROI) scoring.
2. **SERP Gap Analyzer**: Evaluating missing topics from competitors.
3. **Performance Predictor**: Estimating traffic and ranking difficulty.
4. **Blog Generator**: Multi-step LLM content generation (Outline → Body → FAQ → CTA).
5. **SEO Validator**: Real-time evaluation of keyword density, readability, AI-detection.
6. **Blog Export**: Multi-platform format generation (Medium, LinkedIn, Dev.to, Hashnode, WordPress).
7. **Blogy Analysis**: Dashboard analysis and mapping to real solutions.

---

## Installation Setup

### Prerequisites
- Python 3.10+
- Conda (optional, but recommended)
- A Groq API Key

### 1. Clone the repository and navigate
\`\`\`bash
cd blogy_backend
\`\`\`

### 2. Set up the Environment
We recommend using conda for managing environments:
\`\`\`bash
# Create a localized conda environment
conda create --prefix ./blogy_env python=3.10 -y

# Activate it (on Windows/macOS)
conda activate ./blogy_env
\`\`\`

*(Alternatively, you can just use `python -m venv venv` and `source venv/bin/activate` if not using conda).*

### 3. Install Requirements
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Configure Environment Variables
Inside `blogy_backend`, create a `.env` file from the template and add your Groq API key:
\`\`\`bash
# .env required keys
GROQ_API_KEY="your-groq-api-key"
\`\`\`
*(You can use the `.env.example` file as a reference).*

### 5. Run the Engine
Run the FastAPI application from the `blogy_backend` folder using Uvicorn:
\`\`\`bash
uvicorn main:app --reload
\`\`\`

The API will now be accessible at `http://127.0.0.1:8000/api/generate`.

### API Keys Required
- **GROQ_API_KEY**: Required for interacting with the LangChain Mixtral language model. Without this key, the engine will safely fallback to a deterministic generation path. Store it in `.env` within the backend folder.

 **LANGCHAIN_API_KEY**: Required
