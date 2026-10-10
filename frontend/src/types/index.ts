export interface DocumentItem {
  id: string;
  filename: string;
  file_size_bytes: number;
  file_hash: string;
  page_count: number;
  has_scanned_pages: boolean;
  table_count: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error_message?: string;
  created_at: string;
  updated_at: string;
  chunks_count?: number;
}

export interface Citation {
  document_id: string;
  filename: string;
  page_number: number;
  chunk_id: string;
  score: number;
  excerpt: string;
  is_table: boolean;
  is_ocr: boolean;
}

export interface QueryResponse {
  question: string;
  answer: string;
  abstained: boolean;
  citations: Citation[];
  retrieved_passages: Array<{
    chunk_id: string;
    document_id: string;
    page_number: number;
    content: string;
    score: number;
    is_table: boolean;
    is_ocr: boolean;
  }>;
  conversation_id: string;
  latency_ms: number;
  retrieval_mode: string;
}

export interface DashboardStats {
  total_documents: number;
  completed_documents: number;
  failed_documents: number;
  pending_documents: number;
  total_pages: number;
  total_tables: number;
  total_chunks: number;
  vector_index_size: number;
  total_queries: number;
  abstained_queries: number;
  abstention_rate_pct: number;
  avg_query_latency_ms: number;
}

export interface MetricComparison {
  retrieval_mode: string;
  recall_at_5: number;
  precision_at_5: number;
  mrr: number;
  citation_accuracy: number;
  abstention_precision: number;
  avg_latency_ms: number;
}

export interface EvaluationRunResponse {
  id: string;
  run_name: string;
  dataset_name: string;
  total_queries: number;
  created_at: string;
  comparisons: MetricComparison[];
}

export interface SystemHealth {
  status: string;
  version: string;
  python_version: string;
  pymupdf_version: string;
  ocr_available: boolean;
  ollama_online: boolean;
  ollama_url: string;
  default_model: string;
  embedding_model: string;
  vector_index_status: {
    index_type: string;
    dimension: number;
    indexed_chunks: number;
  };
}

export interface ConversationItem {
  id: string;
  title: string;
  document_scope?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant';
  query?: string;
  answer: string;
  citations: Citation[];
  abstained: boolean;
  latency_ms: number;
  created_at: string;
}
