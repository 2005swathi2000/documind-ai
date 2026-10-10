from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChunkResponse(BaseModel):
    id: str
    document_id: str
    page_number: int
    chunk_index: int
    content: str
    char_count: int
    is_table: bool
    is_ocr: bool
    metadata_json: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_size_bytes: int
    file_hash: str
    page_count: int
    has_scanned_pages: bool
    table_count: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentResponse):
    chunks_count: int
    pages_info: List[Dict[str, Any]] = []

class DocumentUploadResponse(BaseModel):
    id: str
    filename: str
    status: str
    message: str
