import faiss
import numpy as np
import os
import json
import logging
from typing import List, Dict, Any, Tuple, Optional
from app.config import settings

logger = logging.getLogger(__name__)

# Fallback vectorizer if torch/sentence_transformers C++ DLL fails on host Windows OS
class LightweightVectorizer:
    def __init__(self, dimension: int = 384):
        from sklearn.feature_extraction.text import TfidfVectorizer
        self.dimension = dimension
        self.vectorizer = TfidfVectorizer(max_features=dimension)
        self.is_fitted = False

    def encode(self, texts: List[str], convert_to_numpy: bool = True, show_progress_bar: bool = False) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dimension), dtype=np.float32)
        if not self.is_fitted:
            vecs = self.vectorizer.fit_transform(texts).toarray()
            self.is_fitted = True
        else:
            vecs = self.vectorizer.transform(texts).toarray()
        
        # Pad to dimension if needed
        if vecs.shape[1] < self.dimension:
            padded = np.zeros((vecs.shape[0], self.dimension), dtype=np.float32)
            padded[:, :vecs.shape[1]] = vecs
            vecs = padded
        return vecs.astype(np.float32)

class VectorStore:
    def __init__(self, model_name: str = None, index_dir: str = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL_NAME
        self.index_dir = index_dir or settings.FAISS_INDEX_DIR
        self._model = None
        self.dimension = 384
        
        self.index_file = os.path.join(self.index_dir, "faiss_index.bin")
        self.metadata_file = os.path.join(self.index_dir, "chunks_metadata.json")
        
        self.index = None
        self.metadata_store: List[Dict[str, Any]] = []
        self._init_store()

    @property
    def model(self):
        if self._model is None:
            try:
                logger.info(f"Loading SentenceTransformer model: {self.model_name}")
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
                self.dimension = self._model.get_sentence_embedding_dimension()
            except Exception as e:
                logger.warning(f"SentenceTransformer load warning: {e}. Falling back to LightweightVectorizer.")
                self._model = LightweightVectorizer(dimension=self.dimension)
        return self._model

    def _init_store(self):
        if os.path.exists(self.index_file) and os.path.exists(self.metadata_file):
            try:
                self.index = faiss.read_index(self.index_file)
                with open(self.metadata_file, "r", encoding="utf-8") as f:
                    self.metadata_store = json.load(f)
                logger.info(f"Loaded existing FAISS index with {self.index.ntotal} vectors.")
            except Exception as e:
                logger.error(f"Failed to load FAISS index: {e}. Creating new index.")
                self._create_empty_index()
        else:
            self._create_empty_index()

    def _create_empty_index(self):
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata_store = []

    def save(self):
        os.makedirs(self.index_dir, exist_ok=True)
        if self.index is not None:
            faiss.write_index(self.index, self.index_file)
        with open(self.metadata_file, "w", encoding="utf-8") as f:
            json.dump(self.metadata_store, f, indent=2)

    def add_chunks(self, chunks: List[Any]):
        if not chunks:
            return
        
        texts = [c.content for c in chunks]
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        
        faiss.normalize_L2(embeddings)
        
        if self.index is None:
            self.dimension = embeddings.shape[1]
            self._create_empty_index()
            
        self.index.add(embeddings.astype(np.float32))
        
        for c in chunks:
            self.metadata_store.append({
                "chunk_id": c.id,
                "document_id": c.document_id,
                "page_number": c.page_number,
                "chunk_index": c.chunk_index,
                "content": c.content,
                "is_table": c.is_table,
                "is_ocr": c.is_ocr,
                "metadata": c.metadata
            })
            
        self.save()

    def search(
        self,
        query: str,
        top_k: int = 5,
        document_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        if self.index is None or self.index.ntotal == 0 or not self.metadata_store:
            return []

        query_vector = self.model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_vector)

        fetch_k = min(self.index.ntotal, top_k * 5 if document_ids else top_k)
        scores, indices = self.index.search(query_vector.astype(np.float32), fetch_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata_store):
                continue
                
            meta = self.metadata_store[idx]
            if document_ids and meta["document_id"] not in document_ids:
                continue

            results.append({
                "chunk_id": meta["chunk_id"],
                "document_id": meta["document_id"],
                "page_number": meta["page_number"],
                "content": meta["content"],
                "score": float(score),
                "is_table": meta.get("is_table", False),
                "is_ocr": meta.get("is_ocr", False),
                "metadata": meta.get("metadata", {})
            })

            if len(results) >= top_k:
                break

        return results

    def delete_document_chunks(self, document_id: str):
        if not self.metadata_store:
            return
            
        filtered_metadata = [m for m in self.metadata_store if m["document_id"] != document_id]
        
        if len(filtered_metadata) == len(self.metadata_store):
            return
            
        if not filtered_metadata:
            self._create_empty_index()
            self.save()
            return
            
        texts = [m["content"] for m in filtered_metadata]
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        faiss.normalize_L2(embeddings)
        
        self.index = faiss.IndexFlatIP(embeddings.shape[1])
        self.index.add(embeddings.astype(np.float32))
        self.metadata_store = filtered_metadata
        self.save()
