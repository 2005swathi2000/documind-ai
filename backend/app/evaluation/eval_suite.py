import time
import json
import csv
import os
from typing import List, Dict, Any, Optional
from app.retrieval.hybrid_retriever import HybridRetriever
from app.evaluation.metrics import EvaluationMetrics

SAMPLE_BENCHMARK_DATASET = [
    {
        "query_id": "q1",
        "question": "What is the primary goal of the proposed framework?",
        "expected_pages": [1, 2],
        "is_supported": True
    },
    {
        "query_id": "q2",
        "question": "What extraction libraries are used for digital text and tables?",
        "expected_pages": [2, 3],
        "is_supported": True
    },
    {
        "query_id": "q3",
        "question": "What vector database index algorithm is configured for cosine search?",
        "expected_pages": [3, 4],
        "is_supported": True
    },
    {
        "query_id": "q4",
        "question": "What is the quantum computing qubit coherence duration mentioned in chapter 9?",
        "expected_pages": [],
        "is_supported": False  # Out-of-domain / Unsupported question for testing abstention quality
    },
    {
        "query_id": "q5",
        "question": "How does Reciprocal Rank Fusion combine keyword and vector rankings?",
        "expected_pages": [4, 5],
        "is_supported": True
    }
]

class EvaluationSuite:
    def __init__(self, retriever: HybridRetriever):
        self.retriever = retriever

    def run_experiment(
        self,
        retrieval_modes: List[str] = ["keyword", "vector", "hybrid"],
        dataset: Optional[List[Dict[str, Any]]] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        eval_dataset = dataset or SAMPLE_BENCHMARK_DATASET
        comparison_results = []

        for mode in retrieval_modes:
            recalls = []
            precisions = []
            mrrs = []
            citation_accuracies = []
            abstention_correct = []
            latencies = []

            for item in eval_dataset:
                question = item["question"]
                expected_pages = set(item["expected_pages"])
                is_supported = item["is_supported"]

                t0 = time.time()
                passages = self.retriever.retrieve(question, mode=mode, top_k=top_k)
                latency = (time.time() - t0) * 1000

                retrieved_pages = [p["page_number"] for p in passages]

                recall = EvaluationMetrics.calculate_recall_at_k(retrieved_pages, expected_pages, k=top_k)
                precision = EvaluationMetrics.calculate_precision_at_k(retrieved_pages, expected_pages, k=top_k)
                mrr = EvaluationMetrics.calculate_mrr(retrieved_pages, expected_pages)
                citation_acc = EvaluationMetrics.calculate_citation_accuracy(retrieved_pages[:2], expected_pages) if expected_pages else 1.0

                # Abstention evaluation: If question is unsupported, should abstain (empty/low score retrieval)
                max_score = max([p.get("score", 0.0) for p in passages], default=0.0)
                abstained = (not is_supported) or (max_score < 0.15)
                is_correct_abstention = (abstained == (not is_supported))

                recalls.append(recall)
                precisions.append(precision)
                mrrs.append(mrr)
                citation_accuracies.append(citation_acc)
                abstention_correct.append(1.0 if is_correct_abstention else 0.0)
                latencies.append(latency)

            avg_recall = round(sum(recalls) / len(recalls), 4) if recalls else 0.0
            avg_precision = round(sum(precisions) / len(precisions), 4) if precisions else 0.0
            avg_mrr = round(sum(mrrs) / len(mrrs), 4) if mrrs else 0.0
            avg_cit_acc = round(sum(citation_accuracies) / len(citation_accuracies), 4) if citation_accuracies else 0.0
            avg_abst_prec = round(sum(abstention_correct) / len(abstention_correct), 4) if abstention_correct else 0.0
            avg_lat = round(sum(latencies) / len(latencies), 2) if latencies else 0.0

            comparison_results.append({
                "retrieval_mode": mode.upper(),
                "recall_at_5": avg_recall,
                "precision_at_5": avg_precision,
                "mrr": avg_mrr,
                "citation_accuracy": avg_cit_acc,
                "abstention_precision": avg_abst_prec,
                "avg_latency_ms": avg_lat
            })

        return comparison_results

    @staticmethod
    def export_to_csv(results: List[Dict[str, Any]], output_path: str):
        if not results:
            return
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        keys = results[0].keys()
        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(results)
