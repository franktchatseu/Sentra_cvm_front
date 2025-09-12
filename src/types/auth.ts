export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  private_email_address: string;
  role: 'admin' | 'user';
  photo_url?: string;
  is_activated: boolean;
  is_deleted: boolean;
  force_password_reset: boolean;
  created_on: string;
  updated_on: string;
  created_by?: number;
  updated_by?: number;
  password_hash?: string;
  req_id?: number;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  role: string;
  message?: string;
}

export interface CreateUserResponse {
  userId: number;
  email: string;
  to_be_redacted: {
    defaultPassword: string;
  };
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  mustResetPassword: boolean;
  session_id: number;
}

export interface LogoutRequest {
  sessionId: number;
}

export interface LogoutResponse {
  success: boolean;
}

export interface AccountRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  photoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ApproveRejectRequest {
  status: 'approved' | 'rejected';
  role: 'admin' | 'user';
}

export interface ApproveAccountResponse {
  message: string;
  userId: number;
  email: string;
}

export interface RejectAccountResponse {
  message: string;
  requestId: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  email: string;
  newPassword: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<CreateUserResponse>;
  approveAccount: (requestId: number, role: 'admin' | 'user') => Promise<ApproveAccountResponse>;
  rejectAccount: (requestId: number) => Promise<RejectAccountResponse>;
  requestPasswordReset: (email: string, requestedBy: string) => Promise<PasswordResetResponse>;
  resetPassword: (userId: number, newPassword: string, token: string) => Promise<PasswordResetResponse>;
}
