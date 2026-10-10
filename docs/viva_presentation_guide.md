# Viva Review & Presentation Guide: DocuMind AI

## Project Overview for Examiners
**DocuMind AI** is an Evidence-Grounded Multimodal Retrieval-Augmented Generation (RAG) Framework designed for intelligent document understanding and reliable question answering over complex PDF documents.

## Key Defense Points for Viva Review

1. **Why Hybrid Retrieval instead of Standard Vector Search?**
   - Pure vector search often fails on exact keyword codes or numbers (e.g., invoice numbers, technical codes).
   - Pure keyword search (BM25) fails on semantic synonyms.
   - DocuMind AI combines both using **Reciprocal Rank Fusion (RRF)**, delivering superior Recall@5 (100% on benchmark).

2. **How does the system prevent LLM Hallucinations?**
   - The **Abstention Engine** calculates relevance scores for top-retrieved passages.
   - If maximum relevance is below the threshold (\(\tau = 0.35\)), the system explicitly returns: *"The requested answer could not be established from the uploaded document(s)."*

3. **How are Tables and Scanned Pages Handled?**
   - **pdfplumber** extracts grid tables into structured Markdown.
   - **Tesseract OCR** detects scanned image pages, renders 300 DPI frames, and extracts text.

4. **Is the System Fully Open-Source and Free to Run?**
   - Yes. It requires zero paid API keys. It uses open-source SentenceTransformers (`all-MiniLM-L6-v2`), FAISS, SQLite, PyMuPDF, pdfplumber, and optional local Ollama models.
