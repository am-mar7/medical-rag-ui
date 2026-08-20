import type {
  AuthResponse,
  LoginRequest,
  MemoryItem,
  MemoryListResponse,
  RagRequest,
  RagResponse,
  SignUpRequest,
  UploadResponse,
  UserResponse,
} from '@/types/api';

export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }
  }
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('52.28.26.147')) {
    return envUrl;
  }
  return 'http://127.0.0.1:8000';
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('medical_rag_token');
}

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

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check backend connection at http://127.0.0.1:8000.');
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

export async function askRag(payload: RagRequest): Promise<RagResponse> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetchWithTimeout(`${getApiUrl()}/rag`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) await parseError(response);
  return response.json() as Promise<RagResponse>;
}

export async function askRagStream(
  payload: RagRequest,
  onToken: (delta: string) => void,
  onMetadata?: (meta: { selected_chunks_count: number; status: string }) => void
): Promise<RagResponse> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiUrl()}/rag/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) await parseError(response);

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('ReadableStream not supported by browser environment.');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let finalResponse: RagResponse | null = null;
  let currentEvent = '';

  const processLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) {
      currentEvent = '';
      return;
    }
    if (trimmed.startsWith('event:')) {
      currentEvent = trimmed.slice(6).trim();
    } else if (trimmed.startsWith('data:')) {
      const dataStr = trimmed.slice(5).trim();
      try {
        const data = JSON.parse(dataStr);
        if (currentEvent === 'token' || (!currentEvent && data.delta)) {
          if (data.delta) onToken(data.delta);
        } else if (currentEvent === 'metadata') {
          if (onMetadata) onMetadata(data);
        } else if (currentEvent === 'final') {
          finalResponse = data as RagResponse;
        }
      } catch (err) {
        console.warn('Failed to parse SSE data:', dataStr, err);
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      processLine(line);
    }
  }

  if (buffer.trim()) {
    processLine(buffer);
  }

  if (!finalResponse) {
    throw new Error('Stream completed without receiving final RAG response payload.');
  }

  return finalResponse;
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const token = getAuthToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const form = new FormData();
  form.append('file', file, file.name);

  const response = await fetchWithTimeout(`${getApiUrl()}/upload`, {
    method: 'POST',
    headers,
    body: form,
  }, 60000);
  if (!response.ok) await parseError(response);
  return response.json() as Promise<UploadResponse>;
}

/* Auth API endpoints */
export async function signUpApi(payload: SignUpRequest): Promise<AuthResponse> {
  const response = await fetchWithTimeout(`${getApiUrl()}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) await parseError(response);
  return response.json() as Promise<AuthResponse>;
}

export async function loginApi(payload: LoginRequest): Promise<AuthResponse> {
  const response = await fetchWithTimeout(`${getApiUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) await parseError(response);
  return response.json() as Promise<AuthResponse>;
}

export async function getMeApi(token: string): Promise<UserResponse> {
  const response = await fetchWithTimeout(`${getApiUrl()}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) await parseError(response);
  return response.json() as Promise<UserResponse>;
}

/* Personal Memory API endpoints */
export async function saveMemoryApi(memoryText: string, token: string): Promise<MemoryItem> {
  const response = await fetchWithTimeout(`${getApiUrl()}/auth/memory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({ memory_text: memoryText }),
  });

  if (!response.ok) await parseError(response);
  return response.json() as Promise<MemoryItem>;
}

export async function getMemoriesApi(token: string): Promise<MemoryListResponse> {
  const response = await fetchWithTimeout(`${getApiUrl()}/auth/memory`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) await parseError(response);
  return response.json() as Promise<MemoryListResponse>;
}

export async function deleteMemoryApi(memoryId: string, token: string): Promise<void> {
  const response = await fetchWithTimeout(`${getApiUrl()}/auth/memory/${memoryId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) await parseError(response);
}
