import type { RagRequest, RagResponse, UploadResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function parseError(response: Response): Promise<never> {
  let message = `Request failed (${response.status})`;
  try {
    const body = await response.json();
    if (typeof body?.detail === 'string') message = body.detail;
    else if (typeof body?.message === 'string') message = body.message;
  } catch {
    /* keep default */
  }
  throw new Error(message);
}

export async function askRag(payload: RagRequest): Promise<RagResponse> {
  const response = await fetch(`${API_URL}/rag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  console.log(response);
  
  if (!response.ok) await parseError(response);
  return response.json() as Promise<RagResponse>;
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file, file.name);
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: form,
  });
  if (!response.ok) await parseError(response);
  return response.json() as Promise<UploadResponse>;
}
