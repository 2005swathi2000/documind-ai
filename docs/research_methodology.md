# Research Methodology & Evaluation Protocol

## Objective
To empirically evaluate whether **Hybrid Retrieval (BM25 + FAISS via RRF)** combined with an **Abstention Engine** outperforms standalone Vector RAG or Keyword search in:
1. Retrieval Recall at Top-5 (Recall@5)
2. Mean Reciprocal Rank (MRR)
3. Citation Accuracy
4. Abstention Precision on Out-of-Domain queries

## Evaluation Metrics Formulations

1. **Recall@K:**
   \[
   Recall@K = \frac{|\text{Retrieved Pages within Top } K \cap \text{Expected Pages}|}{|\text{Expected Pages}|}
   \]

2. **Precision@K:**
   \[
   Precision@K = \frac{|\text{Retrieved Pages within Top } K \cap \text{Expected Pages}|}{K}
   \]

3. **Mean Reciprocal Rank (MRR):**
   \[
   MRR = \frac{1}{|Q|} \sum_{i=1}^{|Q|} \frac{1}{\text{rank}_i}
   \]

4. **Citation Accuracy:**
   \[
   \text{Citation Accuracy} = \frac{\text{Number of Correctly Cited Pages}}{\text{Total Cited Pages}}
   \]

5. **Abstention Precision:**
   \[
   \text{Abstention Precision} = \frac{\text{True Abstentions}}{\text{True Abstentions} + \text{False Generation}}
   \]

## Benchmark Experiment Protocol
1. Load synthetic/DocVQA-style ground truth benchmark dataset (`research/datasets/sample_eval_dataset.json`).
2. Execute query batch against Keyword, Vector, and Hybrid retrieval modes under identical top-K parameter settings (\( K = 5 \)).
3. Record latency (ms), retrieved page rankings, citation binding accuracy, and abstention behavior.
4. Export experiment metrics to CSV format (`storage/eval_run_<id>.csv`).
