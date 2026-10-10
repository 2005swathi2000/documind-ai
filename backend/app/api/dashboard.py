from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.database.models import Document, DocumentChunk, ChatMessage, ProcessingStatus
from app.api.documents import global_vector_store

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_docs = db.query(Document).count()
    completed_docs = db.query(Document).filter(Document.status == ProcessingStatus.COMPLETED.value).count()
    failed_docs = db.query(Document).filter(Document.status == ProcessingStatus.FAILED.value).count()
    pending_docs = db.query(Document).filter(Document.status.in_([ProcessingStatus.PENDING.value, ProcessingStatus.PROCESSING.value])).count()

    total_pages = db.query(func.sum(Document.page_count)).scalar() or 0
    total_tables = db.query(func.sum(Document.table_count)).scalar() or 0
    total_chunks = db.query(DocumentChunk).count()

    total_queries = db.query(ChatMessage).count()
    abstained_queries = db.query(ChatMessage).filter(ChatMessage.abstained == True).count()

    avg_latency = db.query(func.avg(ChatMessage.latency_ms)).scalar() or 0.0

    faiss_index_size = global_vector_store.index.ntotal if global_vector_store.index else 0

    return {
        "total_documents": total_docs,
        "completed_documents": completed_docs,
        "failed_documents": failed_docs,
        "pending_documents": pending_docs,
        "total_pages": int(total_pages),
        "total_tables": int(total_tables),
        "total_chunks": total_chunks,
        "vector_index_size": faiss_index_size,
        "total_queries": total_queries,
        "abstained_queries": abstained_queries,
        "abstention_rate_pct": round((abstained_queries / total_queries * 100), 1) if total_queries > 0 else 0.0,
        "avg_query_latency_ms": round(float(avg_latency), 2)
    }
