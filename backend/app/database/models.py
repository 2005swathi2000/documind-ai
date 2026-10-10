from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import uuid
import enum

Base = declarative_base()

class ProcessingStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    stored_path = Column(String(512), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    file_hash = Column(String(64), nullable=False, index=True)
    page_count = Column(Integer, default=0)
    has_scanned_pages = Column(Boolean, default=False)
    table_count = Column(Integer, default=0)
    status = Column(String(32), default=ProcessingStatus.PENDING.value)
    error_message = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    char_count = Column(Integer, nullable=False)
    is_table = Column(Boolean, default=False)
    is_ocr = Column(Boolean, default=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), default="New Chat")
    document_scope = Column(Text, nullable=True)  # Comma-separated doc_ids or JSON array
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(16), nullable=False)  # 'user' or 'assistant'
    query = Column(Text, nullable=True)
    answer = Column(Text, nullable=False)
    citations_json = Column(Text, nullable=True)  # JSON string of list of citations
    retrieved_passages_json = Column(Text, nullable=True)  # JSON string
    abstained = Column(Boolean, default=False)
    latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_name = Column(String(255), nullable=False)
    retrieval_mode = Column(String(64), nullable=False)  # 'keyword', 'vector', 'hybrid'
    abstention_enabled = Column(Boolean, default=True)
    dataset_name = Column(String(128), default="DocVQA_synthetic_benchmark")
    total_queries = Column(Integer, default=0)
    recall_at_5 = Column(Float, default=0.0)
    precision_at_5 = Column(Float, default=0.0)
    mrr = Column(Float, default=0.0)
    citation_accuracy = Column(Float, default=0.0)
    abstention_precision = Column(Float, default=0.0)
    avg_latency_ms = Column(Float, default=0.0)
    results_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
