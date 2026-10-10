# DocuMind AI API Specification

Interactive Swagger API documentation is available at `http://localhost:8000/docs`.

## Endpoints Summary

### Documents API
- `POST /api/documents/upload`
  - Uploads PDF file (max 50MB). Starts background PyMuPDF, pdfplumber, Tesseract OCR, and FAISS indexing pipeline.
- `GET /api/documents`
  - Returns array of document objects with page count, table count, and processing status.
- `GET /api/documents/{doc_id}`
  - Returns detailed document metadata and chunk count.
- `DELETE /api/documents/{doc_id}`
  - Removes document from SQLite database, deletes stored file, and purges vectors from FAISS index.

### Question Answering API
- `POST /api/qa/query`
  - **Payload:**
    ```json
    {
      "question": "What is the primary goal of DocuMind AI?",
      "retrieval_mode": "hybrid",
      "top_k": 5,
      "abstention_threshold": 0.35
    }
    ```
  - **Response:** Grounded answer, citations list with exact page numbers, abstention flag, latency_ms.

### Dashboard & Health API
- `GET /api/dashboard/stats`
  - Returns verified real database statistics.
- `GET /api/system/health`
  - Returns system status, PyMuPDF version, OCR engine availability, FAISS index vector count, and Ollama connection status.

### Evaluation API
- `POST /api/evaluation/run`
  - Runs reproducible benchmark experiment comparing Keyword, Vector, and Hybrid retrieval.
- `GET /api/evaluation/export/{run_id}`
  - Downloads experiment results as a CSV file.
