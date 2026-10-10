from typing import List, Dict, Any, Optional
from app.retrieval.vector_store import VectorStore
from app.retrieval.keyword_retriever import KeywordRetriever

class HybridRetriever:
    def __init__(self, vector_store: VectorStore, rrf_k: int = 60):
        self.vector_store = vector_store
        self.rrf_k = rrf_k

    def retrieve(
        self,
        query: str,
        mode: str = "hybrid",
        top_k: int = 5,
        document_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        mode = mode.lower()
        
        if mode == "vector":
            return self.vector_store.search(query, top_k=top_k, document_ids=document_ids)
        elif mode == "keyword":
            return KeywordRetriever.search(
                query,
                metadata_store=self.vector_store.metadata_store,
                top_k=top_k,
                document_ids=document_ids
            )
        else: # "hybrid"
            vector_results = self.vector_store.search(query, top_k=top_k * 2, document_ids=document_ids)
            keyword_results = KeywordRetriever.search(
                query,
                metadata_store=self.vector_store.metadata_store,
                top_k=top_k * 2,
                document_ids=document_ids
            )

            # Reciprocal Rank Fusion (RRF) score calculation
            rrf_scores: Dict[str, float] = {}
            passage_map: Dict[str, Dict[str, Any]] = {}

            # Map vector ranks
            for rank, item in enumerate(vector_results):
                cid = item["chunk_id"]
                rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (self.rrf_k + rank + 1))
                passage_map[cid] = item

            # Map keyword ranks
            for rank, item in enumerate(keyword_results):
                cid = item["chunk_id"]
                rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (self.rrf_k + rank + 1))
                if cid not in passage_map:
                    passage_map[cid] = item

            # Sort passages by unified RRF score
            sorted_chunk_ids = sorted(rrf_scores.keys(), key=lambda k: rrf_scores[k], reverse=True)
            
            hybrid_results = []
            for cid in sorted_chunk_ids[:top_k]:
                item = passage_map[cid]
                # Attach normalized RRF score
                item["score"] = round(rrf_scores[cid], 4)
                item["retrieval_source"] = "hybrid"
                hybrid_results.append(item)

            return hybrid_results
