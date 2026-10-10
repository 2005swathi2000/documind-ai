from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class Citation(BaseModel):
    document_id: str
    filename: str
    page_number: int
    chunk_id: str
    score: float
    excerpt: str
    is_table: bool = False
    is_ocr: bool = False

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, description="The query question")
    conversation_id: Optional[str] = None
    document_ids: Optional[List[str]] = None  # None or empty = all documents
    retrieval_mode: str = Field("hybrid", description="keyword, vector, or hybrid")
    abstention_threshold: float = Field(0.35, ge=0.0, le=1.0)
    top_k: int = Field(5, ge=1, le=20)

class QueryResponse(BaseModel):
    question: str
    answer: str
    abstained: bool
    citations: List[Citation]
    retrieved_passages: List[Dict[str, Any]]
    conversation_id: str
    latency_ms: float
    retrieval_mode: str
