// Session Types
export type SessionType = {
  id: number;
  user_id: number;
  username?: string;
  token_hash: string;
  session_type: string;
  device_type?: string;
  device_name?: string;
  ip_address?: string;
  country?: string;
  user_agent?: string;
  is_active: boolean;
  is_verified: boolean;
  is_suspicious: boolean;
  risk_score?: number;
  last_activity_at: string;
  expires_at?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

// API Response Types
export type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    isCachedResponse?: boolean;
    cacheDurationSec?: number;
  };
};

export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    isCachedResponse?: boolean;
    cacheDurationSec?: number;
  };
};

export type SessionStatsResponse = ApiSuccessResponse<
  Record<string, number> | Array<{ key: string; count: number }>
>;

// Request Types
export type CreateSessionRequest = {
  user_id: number;
  session_type: string;
  device_type?: string;
  device_name?: string;
  ip_address?: string;
  user_agent?: string;
  expires_at?: string;
  metadata?: Record<string, unknown>;
};

export type SearchSessionsQuery = {
  search?: string;
  user_id?: number;
  session_type?: string;
  device_type?: string;
  ip_address?: string;
  country?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_suspicious?: boolean;
  min_risk_score?: number;
  created_at_from?: string;
  created_at_to?: string;
  last_activity_from?: string;
  last_activity_to?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  skipCache?: boolean;
};

export type UpdateSessionActivityRequest = {
  activity_type?: string;
  metadata?: Record<string, unknown>;
};

export type VerifyMFARequest = {
  mfa_code: string;
  method?: string;
};

export type MarkSuspiciousRequest = {
  reason?: string;
  risk_score?: number;
};

export type UpdateRiskScoreRequest = {
  risk_score: number;
  reason?: string;
};

export type UpdateSessionMetadataRequest = {
  metadata: Record<string, unknown>;
};

export type EndSessionRequest = {
  reason?: string;
};

export type EndUserSessionsRequest = {
  exclude_session_ids?: number[];
  reason?: string;
};

export type EndOtherSessionsRequest = {
  reason?: string;
};

export type ExpireSessionsRequest = {
  older_than_hours?: number;
  reason?: string;
};

export type ExpireInactiveSessionsRequest = {
  inactive_for_hours?: number;
  reason?: string;
};

export type EndSuspiciousSessionsRequest = {
  min_risk_score?: number;
  reason?: string;
};
