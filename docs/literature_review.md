# Literature Review: Intelligent Document Understanding & Multimodal RAG

| Paper / Resource Title | Authors & Year | Research Problem | Methodology | Dataset | Reported Findings | Limitations Relevant to Project | Evaluation Strategy |
|---|---|---|---|---|---|---|---|
| **DocVQA: A Dataset for VQA on Document Images** | Mathew et al. (2021) | Question answering over visual document images containing text, tables, and diverse layouts. | Multi-page OCR + Transformer layout awareness (LayoutLM). | 50,000+ document images (DocVQA) | High accuracy on structured text; layout embeddings improve spatial reading order. | High computational cost for 2D spatial embeddings; requires large GPU inference cluster. | Evaluated via Edit Distance and Average Normalized Levenshtein Similarity (ANLS). |
| **FUNSD: Form Understanding in Noisy Scanned Documents** | Jaume et al. (2019) | Spatial key-value extraction and entity linking in noisy scanned forms. | Layout-aware sequence labeling with OCR bounding boxes. | 199 annotated real-world scanned form documents | Bounding box spatial coordinate features improve key-value association by 14% over raw OCR text. | Fails on complex multi-column scientific tables spanning multiple pages. | Evaluated via F1-score on entity detection and link prediction. |
| **Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks** | Lewis et al. (2020) | LLM hallucinations and static memory cutoff in standard parametric models. | Combines dense vector retrieval (DPR) with sequence-to-sequence autoregressive generation (BART). | Natural Questions, TriviaQA | RAG significantly reduces factual hallucinations and allows real-time knowledge updates without retraining weights. | No inherent confidence scoring for abstaining when evidence is absent from top-K retrieved passages. | Evaluated via Exact Match (EM) and F1 against ground-truth passages. |
| **Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks** | Reimers & Gurevych (2019) | Inefficient dense vector similarity search with standard BERT models. | Siamese and triplet network structures to derive semantically meaningful sentence embeddings. | SNLI, MultiNLI, STS Benchmark | Reduces 10,000 sentence similarity computation time from 65 hours to 5 milliseconds with minimal accuracy loss. | Fixed context window length (e.g., 512 tokens); sensitive to long PDF paragraph truncations. | Evaluated using Spearman rank correlation against human similarity judgements. |
| **Billion-Scale Similarity Search with GPUs (FAISS)** | Johnson et al. (2019) | Fast nearest-neighbor vector search over millions of high-dimensional embeddings. | Inverted file index with Product Quantization (IVF-PQ) and flat inner-product GPU acceleration. | Deep1B, SIFT1B | Achieves sub-millisecond retrieval latency for million-scale 768D vector queries. | In-memory indexing requires careful memory management or disk-backed persistence. | Evaluated using Recall@K vs Index Construction Latency. |
| **FastAPI: Modern Web Framework for Python** | Ramirez (2018) | Asynchronous high-throughput web service API handling in Python. | Python type hints, Pydantic data validation, OpenAPI specification, and Starlette ASGI engine. | Benchmark web performance suites | Ranks among the fastest Python web frameworks, comparable to NodeJS and Go. | Single-threaded CPU bounds if heavy PDF processing is run synchronously on main event loop. | Evaluated via requests/sec and P99 latency benchmarks. |

---

## Identified Research Gap & Contribution

While modern RAG frameworks effectively retrieve textual passages from digital documents, standard approaches exhibit three key vulnerabilities:
1. **Layout & Table Blindness:** Text-only chunking collapses tabular grids, losing row-column association.
2. **Hallucination under Unsupported Queries:** Conventional RAG forces model generation even when zero relevant context exists.
3. **Citation Fabrication:** Language models often hallucinate page numbers not present in the retrieved passages.

**DocuMind AI** addresses these gaps through:
- **Hybrid Retrieval (BM25 + FAISS via Reciprocal Rank Fusion):** Preserves keyword precision for technical codes while retrieving semantic vector passages.
- **Evidence-Validation Abstention Engine:** Calculates relevance confidence and explicitly abstains when evidence is missing.
- **Verifiable Citation Binding:** Maps citations directly to extracted PDF page numbers.
