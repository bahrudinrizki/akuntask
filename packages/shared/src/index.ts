export interface AuthUser {
  id: string;
  email: string;
  name: string;
  companyId: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface CompanyDto {
  id: string;
  name: string;
  npwp?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyRequest {
  name: string;
  npwp?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface RegisterRequest {
  company: CreateCompanyRequest;
  user: {
    email: string;
    password: string;
    name: string;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}
