from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class EvaluationRunRequest(BaseModel):
    run_name: str = Field("Hybrid RAG vs Baseline", description="Name of evaluation run")
    retrieval_modes: List[str] = Field(["keyword", "vector", "hybrid"], description="Modes to compare")
    abstention_enabled: bool = True
    dataset_name: str = "DocVQA_synthetic_benchmark"
    top_k: int = 5

class MetricComparison(BaseModel):
    retrieval_mode: str
    recall_at_5: float
    precision_at_5: float
    mrr: float
    citation_accuracy: float
    abstention_precision: float
    avg_latency_ms: float

class EvaluationRunResponse(BaseModel):
    id: str
    run_name: str
    dataset_name: str
    total_queries: int
    created_at: datetime
    comparisons: List[MetricComparison]
