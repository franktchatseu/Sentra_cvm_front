export type ServerEnvironment = "dev" | "qa" | "uat" | "prod" | string;

export type ServerProtocol =
  | "http"
  | "https"
  | "ftp"
  | "ftps"
  | "sftp"
  | "tcp"
  | "smtp"
  | "smtps"
  | string;

export interface ServerType {
  id: number;
  name: string;
  code: string;
  server_type: string | null;
  environment: ServerEnvironment;
  region: string | null;
  protocol: ServerProtocol;
  host: string;
  port: number | null;
  base_path: string | null;
  timeout_seconds: number;
  max_retries: number;
  circuit_breaker_enabled: boolean;
  circuit_breaker_threshold: number;
  health_check_enabled: boolean;
  health_check_url: string | null;
  health_check_interval_seconds: number;
  last_health_check_at: string | null;
  last_health_check_status: string | null;
  consecutive_health_failures: number;
  tls_enabled: boolean;
  authentication_type: string | null;
  is_active: boolean;
  is_deprecated: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  metadata: Record<string, unknown> | null;
}

export interface CreateServerPayload {
  name: string;
  code: string;
  server_type?: string;
  environment?: ServerEnvironment;
  region?: string;
  protocol: ServerProtocol;
  host: string;
  port?: number;
  base_path?: string;
  timeout_seconds?: number;
  max_retries?: number;
  circuit_breaker_enabled?: boolean;
  circuit_breaker_threshold?: number;
  health_check_enabled?: boolean;
  health_check_url?: string;
  health_check_interval_seconds?: number;
  tls_enabled?: boolean;
  authentication_type?: string;
  metadata?: Record<string, unknown>;
  user_id?: number;
}

export type UpdateServerPayload = Partial<CreateServerPayload> & {
  is_active?: boolean;
  is_deprecated?: boolean;
};

export type ServerListMeta = {
  total?: number;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
};

export interface PaginatedServersResponse {
  data: ServerType[];
  meta?: ServerListMeta;
}

export type ServerListResponse = ServerType[] | PaginatedServersResponse;

export interface ServerListQuery {
  limit?: number;
  offset?: number;
  activeOnly?: boolean;
  skipCache?: boolean;
}

export interface ServerSearchQuery extends ServerListQuery {
  searchTerm: string;
}

export interface ServerFilterQuery extends ServerListQuery {
  activeOnly?: boolean;
}

export interface BulkServerStatusRequest {
  serverIds: number[];
  user_id: number;
}

export interface BulkServerStatusResponse {
  activated?: number;
  deactivated?: number;
  errors: string[];
}

export interface ServerHealthCheckResultPayload {
  status: "healthy" | "unhealthy";
  details?: string;
}

export interface ServerHealthCheckEnablePayload {
  healthCheckUrl?: string;
}

export interface ServerHealthStats {
  total_servers: number;
  health_check_enabled: number;
  healthy: number;
  unhealthy: number;
  never_checked: number;
}

export type ServerCountByEnvironment = Array<{
  environment: string;
  count: number;
}>;

export type ServerCountByProtocol = Array<{
  protocol: string;
  count: number;
}>;

export type ServerCountByRegion = Array<{
  region: string;
  count: number;
}>;
