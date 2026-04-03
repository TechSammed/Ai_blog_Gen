
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from core.logger import setup_logging
setup_logging()

from api.routes import router

app = FastAPI(
    title="AI Blog Intelligence Engine",
    description=(
        "Hackathon-grade SEO engine: keyword analysis → SERP gap detection → "
        "performance prediction → multi-step blog generation → SEO validation → "
        "multi-platform export → Blogy dashboard analysis."
    ),
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router)


@app.get("/", tags=["health"])
async def health_check():
    return {"status": "healthy", "engine": "AI Blog Intelligence Engine v1.0.0"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
