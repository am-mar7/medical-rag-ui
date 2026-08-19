export interface RagRequest { query: string; dev?: boolean }
export interface Citation { claim: string; chunk_id: string; document_id: string; filename: string; page_start: number; page_end: number }
export interface CitationValidation { claim: string; chunk_id: string; chunk_text: string; supported: boolean; reason: string; status: 'supports' | 'contradicts' | 'unclear'; risk_level: 'standard' | 'high' }
export interface RagResponse { answer: string; citations: Citation[]; citation_validations: CitationValidation[]; evidence_score: number; confidence_label: 'high' | 'medium' | 'low'; abstained: boolean; disclaimer: string }
export interface UploadResponse { document_id: string; filename: string; file_type: string; status: 'queued'; message: string }
