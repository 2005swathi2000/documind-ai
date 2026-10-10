from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
import json

from app.database.session import get_db
from app.database.models import Document, DocumentChunk, ProcessingStatus
from app.schemas.documents import DocumentResponse, DocumentDetailResponse, DocumentUploadResponse
from app.config import settings
from app.ingestion.pdf_extractor import PDFExtractor
from app.ingestion.table_extractor import TableExtractor
from app.ingestion.ocr_engine import OCREngine
from app.ingestion.chunker import DocumentChunker
from app.retrieval.vector_store import VectorStore

router = APIRouter(prefix="/documents", tags=["Documents"])

# Global singleton vector store instance
global_vector_store = VectorStore()

def process_document_background(doc_id: str, file_path: str, db: Session):
    try:
        # 1. Update status to PROCESSING
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return
        doc.status = ProcessingStatus.PROCESSING.value
        db.commit()

        # 2. Extract Document Info & Page Text
        doc_info = PDFExtractor.extract_document_info(file_path)
        pages = PDFExtractor.extract_pages(file_path)
        
        doc.page_count = doc_info["page_count"]
        doc.file_hash = doc_info["file_hash"]
        
        pages_text_list = []
        has_scanned = False

        for p in pages:
            text = p.text
            is_ocr = False
            if p.is_scanned:
                has_scanned = True
                ocr_text, ocr_success = OCREngine.process_scanned_page(file_path, p.page_num)
                if ocr_success and ocr_text:
                    text = f"{text}\n[OCR Extracted Text]: {ocr_text}"
                    is_ocr = True

            pages_text_list.append({
                "page_number": p.page_num,
                "text": text,
                "is_ocr": is_ocr
            })

        doc.has_scanned_pages = has_scanned

        # 3. Extract Tables
        tables = TableExtractor.extract_tables_from_pdf(file_path)
        doc.table_count = len(tables)

        # 4. Chunk Content
        chunker = DocumentChunker(chunk_size=settings.DEFAULT_CHUNK_SIZE, overlap=settings.DEFAULT_CHUNK_OVERLAP)
        chunks = chunker.process_document_pages(doc_id, pages_text_list, tables)

        # 5. Save chunks to SQLite DB
        db_chunks = []
        for c in chunks:
            db_chunk = DocumentChunk(
                id=c.id,
                document_id=doc_id,
                page_number=c.page_number,
                chunk_index=c.chunk_index,
                content=c.content,
                char_count=c.char_count,
                is_table=c.is_table,
                is_ocr=c.is_ocr,
                metadata_json=json.dumps(c.metadata)
            )
            db_chunks.append(db_chunk)

        db.bulk_save_objects(db_chunks)

        # 6. Add chunks to FAISS Vector Index
        global_vector_store.add_chunks(chunks)

        # 7. Update status to COMPLETED
        doc.status = ProcessingStatus.COMPLETED.value
        db.commit()

    except Exception as e:
        db.rollback()
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = ProcessingStatus.FAILED.value
            doc.error_message = str(e)
            db.commit()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db)
):
    # Validation
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Only PDF files are allowed."
        )

    # Save to disk
    doc_id = str(uuid.uuid4())
    stored_filename = f"{doc_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

    file_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(8192):
            buffer.write(chunk)
            file_size += len(chunk)

    if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_MB}MB."
        )

    # Create document record
    doc_record = Document(
        id=doc_id,
        filename=file.filename,
        stored_path=file_path,
        file_size_bytes=file_size,
        file_hash="",  # Will be populated during processing
        status=ProcessingStatus.PENDING.value
    )
    db.add(doc_record)
    db.commit()

    # Trigger background ingestion task
    background_tasks.add_task(process_document_background, doc_id, file_path, db)

    return DocumentUploadResponse(
        id=doc_id,
        filename=file.filename,
        status=ProcessingStatus.PENDING.value,
        message="File uploaded successfully. Processing started in background."
    )

@router.get("", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return docs

@router.get("/{doc_id}", response_model=DocumentDetailResponse)
def get_document_details(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    chunks_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc_id).count()
    
    return DocumentDetailResponse(
        id=doc.id,
        filename=doc.filename,
        file_size_bytes=doc.file_size_bytes,
        file_hash=doc.file_hash,
        page_count=doc.page_count,
        has_scanned_pages=doc.has_scanned_pages,
        table_count=doc.table_count,
        status=doc.status,
        error_message=doc.error_message,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        chunks_count=chunks_count,
        pages_info=[]
    )

@router.delete("/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Remove stored file
    if os.path.exists(doc.stored_path):
        try:
            os.remove(doc.stored_path)
        except Exception:
            pass

    # Remove FAISS index vectors
    global_vector_store.delete_document_chunks(doc_id)

    # Delete DB record (cascade deletes chunks)
    db.delete(doc)
    db.commit()

    return {"message": "Document and associated vectors deleted successfully."}
