from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    query: Optional[str]
    answer: str
    citations: List[Dict[str, Any]] = []
    abstained: bool
    latency_ms: float
    created_at: datetime

class ConversationResponse(BaseModel):
    id: str
    title: str
    document_scope: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
