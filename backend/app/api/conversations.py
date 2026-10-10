from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from app.database.session import get_db
from app.database.models import Conversation, ChatMessage
from app.schemas.conversations import ConversationResponse, ChatMessageResponse

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("", response_model=List[ConversationResponse])
def list_conversations(db: Session = Depends(get_db)):
    convs = db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
    res = []
    for c in convs:
        count = db.query(ChatMessage).filter(ChatMessage.conversation_id == c.id).count()
        res.append(ConversationResponse(
            id=c.id,
            title=c.title,
            document_scope=c.document_scope,
            created_at=c.created_at,
            updated_at=c.updated_at,
            message_count=count
        ))
    return res

@router.get("/{conv_id}/messages", response_model=List[ChatMessageResponse])
def get_conversation_messages(conv_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation thread not found.")

    msgs = db.query(ChatMessage).filter(ChatMessage.conversation_id == conv_id).order_by(ChatMessage.created_at.asc()).all()
    
    response_msgs = []
    for m in msgs:
        citations = json.loads(m.citations_json) if m.citations_json else []
        response_msgs.append(ChatMessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            sender=m.sender,
            query=m.query,
            answer=m.answer,
            citations=citations,
            abstained=m.abstained,
            latency_ms=m.latency_ms,
            created_at=m.created_at
        ))
    return response_msgs

@router.delete("/{conv_id}")
def delete_conversation(conv_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    db.delete(conv)
    db.commit()
    return {"message": "Conversation thread deleted successfully."}
