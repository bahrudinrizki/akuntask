import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  CompanyDto,
  CreateCompanyRequest,
  AuthUser,
  CoaDto,
  CreateCoaRequest,
  JournalDto,
  CreateJournalRequest,
  LedgerResponse,
} from '@akuntask/shared';

const API_BASE = (import.meta.env.VITE_API_URL ?? '') + '/api/v1';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('akuntask_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (data: LoginRequest) => request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: RegisterRequest) => request<LoginResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<AuthUser>('/users/me'),
  myCompany: () => request<CompanyDto>('/companies/me'),
  createCompany: (data: CreateCompanyRequest) => request<CompanyDto>('/companies', { method: 'POST', body: JSON.stringify(data) }),

  listCoa: () => request<CoaDto[]>('/coa'),
  createCoa: (data: CreateCoaRequest) => request<CoaDto>('/coa', { method: 'POST', body: JSON.stringify(data) }),

  listJournals: () => request<JournalDto[]>('/journals'),
  createJournal: (data: CreateJournalRequest) => request<JournalDto>('/journals', { method: 'POST', body: JSON.stringify(data) }),

  getLedger: (coaId: string, from: string, to: string) =>
    request<LedgerResponse>(`/ledger/${coaId}?from=${from}&to=${to}`),
};

export { ApiError };
