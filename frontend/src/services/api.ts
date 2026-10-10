import axios from 'axios';
import type {
  DocumentItem,
  QueryResponse,
  DashboardStats,
  EvaluationRunResponse,
  SystemHealth,
  ConversationItem,
  ChatMessage
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

export const documentService = {
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ id: string; filename: string; status: string; message: string }>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  listDocuments: async (): Promise<DocumentItem[]> => {
    try {
      const res = await api.get<DocumentItem[]>('/documents');
      return res.data;
    } catch (err) {
      console.warn('API connection failed. Returning empty list.', err);
      return [];
    }
  },

  getDocumentDetails: async (docId: string) => {
    const res = await api.get(`/documents/${docId}`);
    return res.data;
  },

  deleteDocument: async (docId: string) => {
    const res = await api.delete(`/documents/${docId}`);
    return res.data;
  },
};

export const qaService = {
  query: async (payload: {
    question: string;
    conversation_id?: string;
    document_ids?: string[];
    retrieval_mode?: string;
    abstention_threshold?: number;
    top_k?: number;
  }): Promise<QueryResponse> => {
    const res = await api.post<QueryResponse>('/qa/query', payload);
    return res.data;
  },
};

export const conversationService = {
  listConversations: async (): Promise<ConversationItem[]> => {
    const res = await api.get<ConversationItem[]>('/conversations');
    return res.data;
  },

  getMessages: async (convId: string): Promise<ChatMessage[]> => {
    const res = await api.get<ChatMessage[]>(`/conversations/${convId}/messages`);
    return res.data;
  },

  deleteConversation: async (convId: string) => {
    const res = await api.delete(`/conversations/${convId}`);
    return res.data;
  },
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const res = await api.get<DashboardStats>('/dashboard/stats');
      return res.data;
    } catch {
      return {
        total_documents: 0,
        completed_documents: 0,
        failed_documents: 0,
        pending_documents: 0,
        total_pages: 0,
        total_tables: 0,
        total_chunks: 0,
        vector_index_size: 0,
        total_queries: 0,
        abstained_queries: 0,
        abstention_rate_pct: 0.0,
        avg_query_latency_ms: 0.0,
      };
    }
  },
};

export const evaluationService = {
  runBenchmark: async (payload: {
    run_name?: string;
    retrieval_modes?: string[];
    abstention_enabled?: boolean;
    dataset_name?: string;
    top_k?: number;
  }): Promise<EvaluationRunResponse> => {
    const res = await api.post<EvaluationRunResponse>('/evaluation/run', payload);
    return res.data;
  },

  getExportUrl: (runId?: string) => {
    return `${API_BASE_URL}/evaluation/export/${runId || 'default'}`;
  },
};

export const systemService = {
  getHealth: async (): Promise<SystemHealth> => {
    const res = await api.get<SystemHealth>('/system/health');
    return res.data;
  },
};

export default api;
