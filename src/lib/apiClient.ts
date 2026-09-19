import { auth } from './auth';
import { Workspace, Application, ApplicationSession } from '../types';

const API_BASE_URL = '/api/v1';

export interface ApiErrorResponse {
  message: string;
  code: string | number;
  details?: unknown;
}

export class ApiClientError extends Error {
  public code: string | number;
  public details?: unknown;

  constructor(message: string, code: string | number, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ApiClientError';
  }
}

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithAuth<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { timeoutMs = 15000, retries = 2, ...fetchOptions } = options;
  let attempt = 0;
  
  while (attempt <= retries) {
    try {
      return await performFetch<T>(endpoint, fetchOptions, timeoutMs, attempt > 0);
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'AUTHENTICATION_FAILED' && attempt < retries) {
        attempt++;
        continue;
      }
      
      if (attempt >= retries || (error instanceof ApiClientError && error.code !== 'SYSTEM_ERROR' && error.code !== 500 && error.code !== 502 && error.code !== 503 && error.code !== 504)) {
        throw error;
      }
      
      attempt++;
      if (attempt <= retries) {
        await sleep(Math.pow(2, attempt) * 500); // Exponential backoff
      }
    }
  }
  throw new Error('Unreachable');
}

async function performFetch<T>(endpoint: string, options: RequestInit, timeoutMs: number, forceRefresh: boolean): Promise<T> {
  const user = auth.currentUser;
  let token = '';
  if (!user) { token = 'dev-token'; }

  if (user) {
    token = await user.getIdToken(forceRefresh);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new ApiClientError("Received HTML instead of JSON. The dev server may have been in a bad state. Please refresh the page.", 502);
    }
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      const apiError = data.error as ApiErrorResponse | undefined;
      throw new ApiClientError(
        apiError?.message || `API request failed with status ${response.status}`,
        apiError?.code || response.status,
        apiError?.details
      );
    }
    
    return data.data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiClientError('Request timed out', 'TIMEOUT');
    }
    throw new ApiClientError(error instanceof Error ? error.message : 'Network error', 'NETWORK_ERROR');
  } finally {
    clearTimeout(id);
  }
}

export const applicationApi = {
  listApplications: async (): Promise<Application[]> => {
    return fetchWithAuth<Application[]>('/applications');
  },

  getApplication: async (id: string): Promise<Application> => {
    return fetchWithAuth<Application>(`/applications/${id}`);
  },

  launchApplication: async (applicationId: string, workspaceId: string): Promise<ApplicationSession> => {
    return fetchWithAuth<ApplicationSession>(`/applications/${applicationId}/launch`, {
      method: 'POST',
      body: JSON.stringify({ workspaceId }),
    });
  },

  stopApplication: async (sessionId: string): Promise<ApplicationSession> => {
    return fetchWithAuth<ApplicationSession>(`/applications/sessions/${sessionId}/stop`, { method: 'POST' });
  },
};

export const workspaceApi = {
  listWorkspaces: async (): Promise<Workspace[]> => {
    return fetchWithAuth<Workspace[]>('/workspaces');
  },

  getWorkspace: async (id: string): Promise<Workspace> => {
    return fetchWithAuth<Workspace>(`/workspaces/${id}`);
  },

  createWorkspace: async (name: string): Promise<Workspace> => {
    return fetchWithAuth<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  startWorkspace: async (id: string): Promise<Workspace> => {
    return fetchWithAuth<Workspace>(`/workspaces/${id}/start`, { method: 'POST' });
  },

  stopWorkspace: async (id: string): Promise<Workspace> => {
    return fetchWithAuth<Workspace>(`/workspaces/${id}/stop`, { method: 'POST' });
  },

  restartWorkspace: async (id: string): Promise<Workspace> => {
    return fetchWithAuth<Workspace>(`/workspaces/${id}/restart`, { method: 'POST' });
  },

  suspendWorkspace: async (id: string): Promise<Workspace> => {
    return fetchWithAuth<Workspace>(`/workspaces/${id}/suspend`, { method: 'POST' });
  },

  connectWorkspace: async (id: string): Promise<Workspace> => {
    return fetchWithAuth<Workspace>(`/workspaces/${id}/connect`, { method: 'POST' });
  },

  disconnectWorkspace: async (id: string): Promise<Workspace> => {
    return fetchWithAuth<Workspace>(`/workspaces/${id}/disconnect`, { method: 'POST' });
  },
  deleteWorkspace: async (id: string): Promise<void> => {
    return fetchWithAuth<void>(`/workspaces/${id}`, { method: 'DELETE' });
  },
};

