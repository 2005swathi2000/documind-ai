import os

class Settings:
    PROJECT_NAME: str = "DocuMind AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "storage", "uploads")
    FAISS_INDEX_DIR: str = os.path.join(BASE_DIR, "storage", "vector_store")
    DATABASE_PATH: str = os.path.join(BASE_DIR, "storage", "documind.db")
    DATABASE_URL: str = f"sqlite:///{DATABASE_PATH}"
    
    # Model Configuration
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    DEFAULT_LLM_MODEL: str = os.getenv("DEFAULT_LLM_MODEL", "llama3")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "documind_secret_key_research_development_2026")
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
    
    # Document limits
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: set = {".pdf"}
    
    # RAG settings
    DEFAULT_CHUNK_SIZE: int = 600
    DEFAULT_CHUNK_OVERLAP: int = 100
    TOP_K_RETRIEVAL: int = 5
    SIMILARITY_THRESHOLD: float = 0.35  # For evidence ground check & abstention engine

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.FAISS_INDEX_DIR, exist_ok=True)
os.makedirs(os.path.dirname(settings.DATABASE_PATH), exist_ok=True)
