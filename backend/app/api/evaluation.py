from fastapi import APIRouter, Depends, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import json
import os
import uuid

from app.database.session import get_db
from app.database.models import EvaluationRun
from app.schemas.evaluation import EvaluationRunRequest, EvaluationRunResponse, MetricComparison
from app.evaluation.eval_suite import EvaluationSuite, SAMPLE_BENCHMARK_DATASET
from app.api.qa import hybrid_retriever
from app.config import settings

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])

eval_suite = EvaluationSuite(hybrid_retriever)

@router.post("/run", response_model=EvaluationRunResponse)
def run_evaluation_benchmark(req: EvaluationRunRequest, db: Session = Depends(get_db)):
    results = eval_suite.run_experiment(
        retrieval_modes=req.retrieval_modes,
        dataset=SAMPLE_BENCHMARK_DATASET,
        top_k=req.top_k
    )

    run_id = str(uuid.uuid4())
    csv_file_path = os.path.join(settings.BASE_DIR, "storage", f"eval_run_{run_id}.csv")
    eval_suite.export_to_csv(results, csv_file_path)

    # Calculate aggregate summary for DB record
    avg_recall = sum(r["recall_at_5"] for r in results) / len(results) if results else 0.0
    avg_cit_acc = sum(r["citation_accuracy"] for r in results) / len(results) if results else 0.0

    eval_record = EvaluationRun(
        id=run_id,
        run_name=req.run_name,
        retrieval_mode=",".join(req.retrieval_modes),
        abstention_enabled=req.abstention_enabled,
        dataset_name=req.dataset_name,
        total_queries=len(SAMPLE_BENCHMARK_DATASET),
        recall_at_5=avg_recall,
        citation_accuracy=avg_cit_acc,
        results_json=json.dumps(results)
    )
    db.add(eval_record)
    db.commit()

    comparisons = [MetricComparison(**r) for r in results]

    return EvaluationRunResponse(
        id=run_id,
        run_name=req.run_name,
        dataset_name=req.dataset_name,
        total_queries=len(SAMPLE_BENCHMARK_DATASET),
        created_at=eval_record.created_at,
        comparisons=comparisons
    )

@router.get("/export/{run_id}")
def export_evaluation_csv(run_id: str, db: Session = Depends(get_db)):
    eval_record = db.query(EvaluationRun).filter(EvaluationRun.id == run_id).first()
    if not eval_record:
        # Fallback to general export
        csv_file_path = os.path.join(settings.BASE_DIR, "storage", "eval_export.csv")
        results = eval_suite.run_experiment()
        eval_suite.export_to_csv(results, csv_file_path)
        return FileResponse(csv_file_path, filename="documind_eval_results.csv", media_type="text/csv")

    csv_file_path = os.path.join(settings.BASE_DIR, "storage", f"eval_run_{run_id}.csv")
    if not os.path.exists(csv_file_path):
        results = json.loads(eval_record.results_json) if eval_record.results_json else []
        eval_suite.export_to_csv(results, csv_file_path)

    return FileResponse(csv_file_path, filename=f"documind_eval_{run_id[:8]}.csv", media_type="text/csv")
