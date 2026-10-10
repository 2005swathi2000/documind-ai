import fitz
import os
import pytest
from app.ingestion.pdf_extractor import PDFExtractor
from app.ingestion.chunker import DocumentChunker

@pytest.fixture
def sample_pdf_path(tmp_path):
    pdf_file = tmp_path / "test_sample.pdf"
    doc = fitz.open()
    page1 = doc.new_page()
    page1.insert_text((50, 50), "DocuMind AI Document Intelligence Framework. Page 1 Text.")
    page2 = doc.new_page()
    page2.insert_text((50, 50), "Retrieval Augmented Generation with FAISS Vector Store. Page 2 Text.")
    doc.save(str(pdf_file))
    doc.close()
    return str(pdf_file)

def test_pdf_extraction(sample_pdf_path):
    info = PDFExtractor.extract_document_info(sample_pdf_path)
    assert info["page_count"] == 2
    assert len(info["file_hash"]) == 64

    pages = PDFExtractor.extract_pages(sample_pdf_path)
    assert len(pages) == 2
    assert "DocuMind AI" in pages[0].text
    assert "FAISS" in pages[1].text

def test_document_chunker():
    chunker = DocumentChunker(chunk_size=100, overlap=20)
    pages = [{"page_number": 1, "text": "This is a long sample sentence designed for testing chunk creation with overlap context preservation.", "is_ocr": False}]
    chunks = chunker.process_document_pages("doc_123", pages)
    assert len(chunks) > 0
    assert chunks[0].document_id == "doc_123"
    assert chunks[0].page_number == 1
