# B.Tech Major Project Report Outline

## Chapter 1: Introduction
- 1.1 Background & Motivation
- 1.2 Problem Statement
- 1.3 Project Objectives & Scope
- 1.4 Major Research Contributions

## Chapter 2: Literature Review
- 2.1 Visual Document Question Answering (DocVQA)
- 2.2 Form Understanding & Key-Value Extraction (FUNSD)
- 2.3 Retrieval-Augmented Generation (RAG) Architecture
- 2.4 Dense Vector Indexing & FAISS
- 2.5 Literature Comparison Table

## Chapter 3: System Architecture & Design
- 3.1 Overall Framework Architecture
- 3.2 Document Ingestion Pipeline (PyMuPDF, pdfplumber, OCR)
- 3.3 Overlapping Chunking & Metadata Preservation
- 3.4 Hybrid Retrieval Algorithm (BM25 + FAISS via RRF)
- 3.5 Evidence Validation & Abstention Engine
- 3.6 Database Schema & Data Models

## Chapter 4: Implementation Details
- 4.1 Technology Stack & Prerequisites
- 4.2 Backend Development (FastAPI, SQLAlchemy, PyMuPDF, SentenceTransformers, FAISS)
- 4.3 Frontend Development (React, Vite, TypeScript, Tailwind CSS, Recharts)
- 4.4 Untrusted Input Sanitization & Security Controls

## Chapter 5: Experimental Results & Performance Evaluation
- 5.1 Evaluation Dataset & Setup
- 5.2 Retrieval Comparison (Keyword vs Vector vs Hybrid RAG)
- 5.3 Abstention Precision & Citation Accuracy Metrics
- 5.4 Latency & Computational Overhead

## Chapter 6: Conclusion & Future Work
- 6.1 Project Summary
- 6.2 Key Findings
- 6.3 Future Extensions (Full Layout-Aware Vision Models)
