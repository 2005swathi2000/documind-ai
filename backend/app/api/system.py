from fastapi import APIRouter
from app.generation.llm_adapter import LLMAdapter
from app.ingestion.ocr_engine import OCREngine
from app.api.documents import global_vector_store
from app.config import settings
import fitz
import sys

router = APIRouter(prefix="/system", tags=["System"])

@router.get("/health")
def get_system_health():
    return {
        "status": "online",
        "version": settings.VERSION,
        "python_version": sys.version.split()[0],
        "pymupdf_version": fitz.__version__,
        "ocr_available": OCREngine.is_available(),
        "ollama_online": LLMAdapter.is_ollama_online(),
        "ollama_url": settings.OLLAMA_BASE_URL,
        "default_model": settings.DEFAULT_LLM_MODEL,
        "embedding_model": settings.EMBEDDING_MODEL_NAME,
        "vector_index_status": {
            "index_type": "FAISS IndexFlatIP (Cosine)",
            "dimension": global_vector_store.dimension,
            "indexed_chunks": global_vector_store.index.ntotal if global_vector_store.index else 0
        }
    }
