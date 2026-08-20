import { supabase } from '@/lib/supabase/client';
import {
  ApiError,
  RagRequest,
  RagResponse,
  StatusResponse,
  UploadResponse,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function parseApiError(response: Response): Promise<ApiError> {
  let message = `Request failed (${response.status})`;
  try {
    const body = await response.json();
    if (typeof body?.detail === 'string') message = body.detail;
    else if (typeof body?.message === 'string') message = body.message;
  } catch {
    /* fallback message */
  }
  return new ApiError(response.status, message);
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  isRetry = false
): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    if (!isRetry) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError && refreshData?.session?.access_token) {
        return fetchWithAuth(url, options, true);
      }
    }
    await supabase.auth.signOut();
    throw await parseApiError(response);
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response;
}

export async function askRag(payload: RagRequest): Promise<RagResponse> {
  const response = await fetchWithAuth(`${API_URL}/rag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<RagResponse>;
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file, file.name);
  const response = await fetchWithAuth(`${API_URL}/upload`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: form,
  });
  return response.json() as Promise<UploadResponse>;
}

export async function getDocumentStatus(documentId: string): Promise<StatusResponse> {
  const response = await fetchWithAuth(`${API_URL}/documents/${documentId}/status`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  return response.json() as Promise<StatusResponse>;
}
