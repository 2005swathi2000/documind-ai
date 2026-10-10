from typing import List, Dict, Any, Set

class EvaluationMetrics:
    @staticmethod
    def calculate_recall_at_k(retrieved_pages: List[int], expected_pages: Set[int], k: int = 5) -> float:
        if not expected_pages:
            return 1.0
        top_k_pages = set(retrieved_pages[:k])
        hits = len(top_k_pages.intersection(expected_pages))
        return hits / len(expected_pages)

    @staticmethod
    def calculate_precision_at_k(retrieved_pages: List[int], expected_pages: Set[int], k: int = 5) -> float:
        if not retrieved_pages or k == 0:
            return 0.0
        top_k_pages = retrieved_pages[:k]
        hits = sum(1 for p in top_k_pages if p in expected_pages)
        return hits / len(top_k_pages)

    @staticmethod
    def calculate_mrr(retrieved_pages: List[int], expected_pages: Set[int]) -> float:
        if not expected_pages:
            return 1.0
        for rank, page in enumerate(retrieved_pages, start=1):
            if page in expected_pages:
                return 1.0 / rank
        return 0.0

    @staticmethod
    def calculate_citation_accuracy(cited_pages: List[int], expected_pages: Set[int]) -> float:
        if not cited_pages:
            return 0.0
        correct_citations = sum(1 for p in cited_pages if p in expected_pages)
        return correct_citations / len(cited_pages)
