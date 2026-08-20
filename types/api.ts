export interface RagRequest {
  query: string;
  dev?: boolean;
  personal_context?: string;
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
  has_personal_info?: boolean;
  extracted_personal_info?: string;
  memory_prompt?: string;
}

export interface UploadResponse {
  document_id: string;
  filename: string;
  file_type: string;
  status: 'queued';
  message: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  user_id: string;
  email: string;
  full_name?: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: UserResponse;
}

export interface SaveMemoryRequest {
  memory_text: string;
}

export interface MemoryItem {
  id: string;
  user_id: string;
  memory_text: string;
  created_at: string;
}

export interface MemoryListResponse {
  memories: MemoryItem[];
  concatenated_context: string;
}
