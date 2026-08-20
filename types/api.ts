import type { Session, User } from '@supabase/supabase-js';

export interface RagRequest {
  query: string;
  dev?: boolean;
}

export interface Citation {
  claim: string;
  chunk_id: string;
  document_id: string;
  filename: string;
  page_start: number;
  page_end: number;
}

export interface CitationValidation {
  claim: string;
  chunk_id: string;
  chunk_text: string;
  supported: boolean;
  reason: string;
  status: 'supports' | 'contradicts' | 'unclear';
  risk_level: 'standard' | 'high';
}

export interface RagResponse {
  answer: string;
  citations: Citation[];
  citation_validations: CitationValidation[];
  evidence_score: number;
  confidence_label: 'high' | 'medium' | 'low';
  abstained: boolean;
  disclaimer: string;
}

export type DocumentStatus =
  | 'pending_review'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'failed';

export interface UploadResponse {
  document_id: string;
  filename: string;
  file_type: string;
  status: DocumentStatus;
  message: string;
}

export interface StatusResponse {
  document_id: string;
  filename: string;
  status: DocumentStatus;
  total_pages?: number | null;
  rejection_reason?: string | null;
  failure_message?: string | null;
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ confirmationRequired: boolean }>;
  signOut: () => Promise<void>;
}
