import math
import re
from typing import List, Dict, Any, Optional

class KeywordRetriever:
    @staticmethod
    def tokenize(text: str) -> List[str]:
        return re.findall(r'\w+', text.lower())

    @staticmethod
    def compute_bm25_score(query_tokens: List[str], doc_tokens: List[str], avg_dl: float, idf_dict: Dict[str, float], k1: float = 1.5, b: float = 0.75) -> float:
        doc_len = len(doc_tokens)
        if doc_len == 0:
            return 0.0
            
        score = 0.0
        doc_token_counts = {}
        for t in doc_tokens:
            doc_token_counts[t] = doc_token_counts.get(t, 0) + 1

        for token in query_tokens:
            if token not in doc_token_counts:
                continue
            freq = doc_token_counts[token]
            idf = idf_dict.get(token, 0.5)
            numerator = freq * (k1 + 1)
            denominator = freq + k1 * (1 - b + b * (doc_len / avg_dl))
            score += idf * (numerator / denominator)

        return score

    @classmethod
    def search(
        cls,
        query: str,
        metadata_store: List[Dict[str, Any]],
        top_k: int = 5,
        document_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        if not metadata_store or not query.strip():
            return []

        # Filter candidate documents
        candidates = [
            m for m in metadata_store 
            if not document_ids or m["document_id"] in document_ids
        ]
        
        if not candidates:
            return []

        query_tokens = cls.tokenize(query)
        if not query_tokens:
            return []

        corpus_tokens = [cls.tokenize(m["content"]) for m in candidates]
        total_docs = len(candidates)
        avg_dl = sum(len(toks) for toks in corpus_tokens) / max(1, total_docs)

        # Compute IDF
        df = {}
        for toks in corpus_tokens:
            unique_toks = set(toks)
            for t in unique_toks:
                df[t] = df.get(t, 0) + 1

        idf_dict = {}
        for token, doc_freq in df.items():
            idf_dict[token] = math.log((total_docs - doc_freq + 0.5) / (doc_freq + 0.5) + 1.0)

        # Rank candidates
        scored_results = []
        for meta, doc_toks in zip(candidates, corpus_tokens):
            score = cls.compute_bm25_score(query_tokens, doc_toks, avg_dl, idf_dict)
            if score > 0:
                scored_results.append({
                    "chunk_id": meta["chunk_id"],
                    "document_id": meta["document_id"],
                    "page_number": meta["page_number"],
                    "content": meta["content"],
                    "score": float(score),
                    "is_table": meta.get("is_table", False),
                    "is_ocr": meta.get("is_ocr", False),
                    "metadata": meta.get("metadata", {})
                })

        scored_results.sort(key=lambda x: x["score"], reverse=True)
        return scored_results[:top_k]
