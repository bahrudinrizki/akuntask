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

export type CoaType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface CoaDto {
  id: string;
  code: string;
  name: string;
  type: CoaType;
  parentId: string | null;
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoaRequest {
  code: string;
  name: string;
  type: CoaType;
  parentId?: string;
  level?: number;
}

export interface UpdateCoaRequest {
  name?: string;
  isActive?: boolean;
  parentId?: string | null;
}

export interface JournalLineInput {
  coaId: string;
  debit?: number;
  credit?: number;
  description?: string;
}

export interface JournalLineDto {
  id: string;
  coaId: string;
  coaCode: string;
  coaName: string;
  debit: number;
  credit: number;
  description: string | null;
}

export interface JournalDto {
  id: string;
  referenceNo: string;
  date: string;
  description: string;
  status: string;
  totalDebit: number;
  totalCredit: number;
  createdAt: string;
  lines: JournalLineDto[];
}

export interface CreateJournalRequest {
  date: string;
  description: string;
  lines: JournalLineInput[];
}

export interface LedgerEntry {
  journalId: string;
  date: string;
  referenceNo: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerResponse {
  coa: CoaDto;
  from: string;
  to: string;
  opening: number;
  totalDebit: number;
  totalCredit: number;
  closing: number;
  entries: LedgerEntry[];
}

export interface ReportLine {
  accountId: string;
  code: string;
  name: string;
  amount: number;
  previousAmount?: number;
}

export interface ReportSection {
  category: string;
  parentId?: string;
  lines: ReportLine[];
  total: number;
  previousTotal?: number;
}

export interface ProfitLossResponse {
  from: string;
  to: string;
  comparison: 'off' | 'prev';
  revenue: ReportSection[];
  expense: ReportSection[];
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  previousTotalRevenue?: number;
  previousTotalExpense?: number;
  previousNetProfit?: number;
}

export interface BalanceSheetResponse {
  asOf: string;
  comparison: 'off' | 'prev';
  assets: ReportSection[];
  liabilities: ReportSection[];
  equity: ReportSection[];
  assetsTotal: number;
  liabilitiesTotal: number;
  equityTotal: number;
  totalLiabilitiesEquity: number;
  previousAssetsTotal?: number;
  previousLiabilitiesTotal?: number;
  previousEquityTotal?: number;
  balanced: boolean;
}

export interface TrialBalanceLine {
  accountId: string;
  code: string;
  name: string;
  type: CoaType;
  debit: number;
  credit: number;
  previousDebit?: number;
  previousCredit?: number;
}

export interface TrialBalanceResponse {
  asOf: string;
  comparison: 'off' | 'prev';
  adjusted: boolean;
  lines: TrialBalanceLine[];
  totalDebit: number;
  totalCredit: number;
  previousTotalDebit?: number;
  previousTotalCredit?: number;
  balanced: boolean;
}

export interface ClosingResult {
  closingJournals: JournalDto[];
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  periodFrom: string;
  periodTo: string;
}
