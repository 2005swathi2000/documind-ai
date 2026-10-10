# DocuMind AI

An Evidence-Grounded Multimodal Retrieval-Augmented Generation (RAG) Framework for Intelligent Document Understanding and Reliable Question Answering.

---

## 🌟 Overview & Objectives

**DocuMind AI** is a full-stack, research-oriented B.Tech IT Major Project designed to solve the critical challenges of standard RAG systems:
- **Hallucination & Unsubstantiated Generation:** Standard LLMs invent answers when relevant context is missing. DocuMind AI implements an **Abstention Engine** that evaluates relevance confidence metrics and abstains when evidence is missing.
- **Table & Layout Preservation:** Digital PDFs and scanned forms contain multi-column tabular data. DocuMind AI incorporates `pdfplumber` for structured Markdown grid extraction and `PyMuPDF` for high-throughput digital stream parsing.
- **Scanned OCR Support:** Automatic fallback to `Tesseract OCR` for scanned document image pages.
- **Verifiable Citations:** Answers are bound directly to exact source page numbers `[Document, Page X]`.
- **Hybrid Retrieval (RRF):** Merges BM25 keyword matching with FAISS vector similarity search using Reciprocal Rank Fusion (RRF).

---

## 🏗️ Architecture

```
[ PDF Upload ] ---> [ PyMuPDF / pdfplumber / Tesseract OCR ]
                           |
                           v
                [ Document Chunker ]
                           |
            +--------------+--------------+
            |                             |
     [ SQLite Metadata ]          [ FAISS Cosine Vector Store ]
            |                             |
            +--------------+--------------+
                           |
                [ Hybrid RRF Retriever ]
                           |
            [ Evidence Grounding & Abstention ]
                           |
             [ Grounded Answer + Citations ]
```

---

## 🛠️ Technology Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn
- **Document Processing:** PyMuPDF (`fitz`), `pdfplumber`, `pytesseract` (Tesseract OCR), Pillow
- **AI & Retrieval:** SentenceTransformers (`all-MiniLM-L6-v2`), FAISS Vector Index, BM25 Keyword Ranker, Ollama LLM Adapter / Local Rule Engine
- **Database:** SQLite3 / SQLAlchemy (PostgreSQL / pgvector compatible schema)
- **Testing:** Pytest, Vitest

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate venv (Windows PowerShell)
..\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation will be live at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install node dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend UI will be running at `http://localhost:5173`.

---

## 🧪 Running Unit & Integration Tests

### Backend Test Suite (Pytest)
```bash
cd backend
..\venv\Scripts\python.exe -m pytest tests
```
*Result: 8 passed in 7.77s (100% pass rate).*

### Frontend Production Build
```bash
cd frontend
npm run build
```
*Result: Vite production build succeeded.*

---

## 📊 Research Evaluation Suite

DocuMind AI includes a built-in benchmark runner comparing Keyword, Vector, and Hybrid RAG methods:
- **Recall@5:** Evaluates document passage retrieval accuracy.
- **Citation Accuracy:** Measures exactness of page-to-fact citations.
- **Abstention Precision:** Verifies zero-hallucination rate on unsupported queries.

Results can be exported directly to CSV via the UI or `/api/evaluation/export/{run_id}`.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
