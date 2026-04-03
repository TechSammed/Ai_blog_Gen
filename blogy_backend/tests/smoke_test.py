"""Quick smoke test to verify all refactored modules import and work."""
from core.logger import setup_logging, get_logger
setup_logging()

logger = get_logger("smoke_test")

# 1. Shared utils
from core.utils import keyword_density, flesch_reading_ease, ai_detection_score, sanitize_keyword
logger.info("All utils imported OK")

d = keyword_density("AI is great AI tools are useful AI rocks", "AI")
logger.info("keyword_density = %.2f%%", d)
assert d > 0, "keyword_density should be > 0"

r = flesch_reading_ease("The cat sat on the mat. It was a good day.")
logger.info("flesch_reading_ease = %.1f", r)
assert r > 0, "readability should be > 0"

a = ai_detection_score("Simple clean text here.")
logger.info("ai_detection_score = %d", a)
assert a < 50, "clean text should have low AI score"

s = sanitize_keyword("<b>test</b>  keyword  ")
logger.info("sanitize_keyword = [%s]", s)
assert s == "test keyword", f"Expected 'test keyword', got '{s}'"

# 2. Pydantic input sanitization
from models.schemas import KeywordInput
ki = KeywordInput(keyword="<script>alert(1)</script>AI blog")
logger.info("Pydantic sanitized: [%s]", ki.keyword)
assert "<script>" not in ki.keyword, "HTML should be stripped"

# 3. Try importing pipeline modules (may fail without langgraph, that's OK)
try:
    from pipeline.graph import run_pipeline, run_pipeline_stream, NODE_STEP_MAP
    logger.info("Pipeline modules imported OK (NODE_STEP_MAP has %d nodes)", len(NODE_STEP_MAP))
except ImportError as e:
    logger.warning("Pipeline import skipped (missing dep): %s", e)

print("\n=== ALL SMOKE TESTS PASSED ===")
