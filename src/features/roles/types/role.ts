export type DataAccessLevel =
  | "public"
  | "internal"
  | "confidential"
  | "restricted"
  | string;

export type Role = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  parent_role_id?: number | null;
  role_level?: number | null;
  is_system_role?: boolean;
  is_default?: boolean;
  data_access_level?: DataAccessLevel;
  max_users?: number | null;
  current_users?: number | null;
  metadata?: Record<string, unknown> | null;
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
};

export type RoleListMeta = {
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  isCachedResponse?: boolean;
  cacheDurationSec?: number;
  [key: string]: unknown;
};

export type RoleListResult = {
  roles: Role[];
  meta?: RoleListMeta;
};

export type ListRolesQuery = {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  skipCache?: boolean;
};

export type RoleSearchQuery = {
  q: string;
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
  skipCache?: boolean;
};
