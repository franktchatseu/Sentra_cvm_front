// Core User Type
export type UserType = {
  id: number;
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  employee_id?: string;
  department?: string;
  status: "active" | "inactive" | "suspended" | "locked";
  role_id?: number;
  role_name?: string;
  data_access_level?: string;
  pii_access?: boolean;
  mfa_enabled?: boolean;
  manager_id?: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
  password_expires_at?: string;
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

// Request Types
export type CreateUserRequest = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role_id?: number;
  department?: string;
  employee_id?: string;
  manager_id?: number;
  data_access_level?: string;
};

export type UpdateUserRequest = {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  department?: string;
  employee_id?: string;
  manager_id?: number;
  data_access_level?: string;
  status?: "active" | "inactive" | "suspended";
};

export type SearchUsersQuery = {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  status?: string;
  department?: string;
  role_id?: number;
  skipCache?: boolean;
};

export type AdvancedSearchUsersQuery = {
  id?: number;
  uuid?: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  employee_id?: string;
  department?: string;
  status?: string;
  role_id?: number;
  manager_id?: number;
  mfa_enabled?: boolean;
  pii_access?: boolean;
  created_at_from?: string;
  created_at_to?: string;
  last_login_from?: string;
  last_login_to?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  skipCache?: boolean;
};

export type UserReportsQuery = {
  department?: string;
  role_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  skipCache?: boolean;
};

export type BatchDeactivateRequest = {
  user_ids: number[];
  reason?: string;
};

export type BatchUpdateDepartmentRequest = {
  user_ids: number[];
  department: string;
};

export type ValidatePasswordResetTokenRequest = {
  token: string;
  email?: string;
};

export type UserPermissionsResponse = {
  success: true;
  user_id: number;
  permissions: string[];
  roles: string[];
  data_access_level?: string;
};

export type UserPermissionsCheckResponse = {
  success: true;
  user_id: number;
  permission_code: string;
  has_permission: boolean;
};

export type UserPermissionsSummaryResponse = {
  success: true;
  user_id: number;
  total_permissions: number;
  permissions_by_category: Record<string, number>;
  roles: string[];
  data_access_level?: string;
};

export type ActivateUserRequest = {
  reason?: string;
  notify_user?: boolean;
};

export type ChangeUserPasswordRequest = {
  new_password: string;
  force_change_on_login?: boolean;
  notify_user?: boolean;
};

export type EnableMFARequest = {
  method?: "totp" | "sms" | "email";
  phone_number?: string;
};

export type AssignRoleRequest = {
  role_id: number;
  notify_user?: boolean;
};

export type UpdateDataAccessLevelRequest = {
  data_access_level: string;
  reason?: string;
};

export type GrantPIIAccessRequest = {
  reason?: string;
  expires_at?: string;
};
