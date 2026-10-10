from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
import uuid

from app.database.session import get_db
from app.database.models import Document, Conversation, ChatMessage
from app.schemas.qa import QueryRequest, QueryResponse
from app.retrieval.hybrid_retriever import HybridRetriever
from app.api.documents import global_vector_store
from app.generation.evidence_engine import EvidenceEngine

router = APIRouter(prefix="/qa", tags=["Question Answering"])

hybrid_retriever = HybridRetriever(global_vector_store)

@router.post("/query", response_model=QueryResponse)
def query_documents(req: QueryRequest, db: Session = Depends(get_db)):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # 1. Retrieve filename mapping for active documents
    docs = db.query(Document).all()
    doc_filename_map = {d.id: d.filename for d in docs}

    # If specific document IDs requested, verify existence
    if req.document_ids:
        valid_ids = [did for did in req.document_ids if did in doc_filename_map]
        filter_ids = valid_ids if valid_ids else None
    else:
        filter_ids = None

    # 2. Retrieve top evidence passages using selected retrieval mode
    retrieved_passages = hybrid_retriever.retrieve(
        query=req.question,
        mode=req.retrieval_mode,
        top_k=req.top_k,
        document_ids=filter_ids
    )

    # 3. Synthesize evidence-grounded answer
    grounded_res = EvidenceEngine.generate_grounded_answer(
        question=req.question,
        retrieved_passages=retrieved_passages,
        doc_filename_map=doc_filename_map,
        abstention_threshold=req.abstention_threshold
    )

    # 4. Save to conversation thread if conversation_id provided or create new thread
    conv_id = req.conversation_id
    if not conv_id:
        new_conv = Conversation(
            id=str(uuid.uuid4()),
            title=req.question[:40] + ("..." if len(req.question) > 40 else ""),
            document_scope=",".join(filter_ids) if filter_ids else "all"
        )
        db.add(new_conv)
        db.commit()
        conv_id = new_conv.id
    else:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            new_conv = Conversation(id=conv_id, title=req.question[:40])
            db.add(new_conv)
            db.commit()

    # Save ChatMessage record
    msg = ChatMessage(
        conversation_id=conv_id,
        sender="user",
        query=req.question,
        answer=grounded_res["answer"],
        citations_json=json.dumps(grounded_res["citations"]),
        retrieved_passages_json=json.dumps(grounded_res["retrieved_passages"]),
        abstained=grounded_res["abstained"],
        latency_ms=grounded_res["latency_ms"]
    )
    db.add(msg)
    db.commit()

    return QueryResponse(
        question=req.question,
        answer=grounded_res["answer"],
        abstained=grounded_res["abstained"],
        citations=grounded_res["citations"],
        retrieved_passages=grounded_res["retrieved_passages"],
        conversation_id=conv_id,
        latency_ms=grounded_res["latency_ms"],
        retrieval_mode=req.retrieval_mode
    )
