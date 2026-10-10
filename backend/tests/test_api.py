from fastapi.testclient import TestClient
import pytest
from app.main import app
from app.database.session import init_db

# Initialize database schema for tests
init_db()

client = TestClient(app)

def test_system_health():
    res = client.get("/api/system/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "version" in data
    assert "pymupdf_version" in data

def test_dashboard_stats():
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_documents" in data
    assert "vector_index_size" in data

def test_qa_query_empty_failure():
    res = client.post("/api/qa/query", json={"question": "   "})
    assert res.status_code == 400

def test_qa_query_unsupported_abstention():
    res = client.post("/api/qa/query", json={
        "question": "What is the capital of Mars?",
        "retrieval_mode": "hybrid",
        "abstention_threshold": 0.5
    })
    assert res.status_code == 200
    data = res.json()
    assert data["abstained"] == True
    assert "could not be established" in data["answer"]
