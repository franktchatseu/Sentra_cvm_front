import { 
  User, 
  LoginRequest, 
  LoginResponse,
  RefreshTokenResponse,
  MeResponse,
  PermissionsResponse,
  PasswordChangeRequest,
  PasswordChangeResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetCompleteRequest,
  PasswordResetCompleteResponse,
  ValidateResponse,
  CreateUserRequest, 
  LegacyPasswordResetRequest 
} from '../types/auth';
import { getAuthHeaders, API_CONFIG } from '../../../shared/services/api';

class AuthService {
  private baseUrl = `${API_CONFIG.BASE_URL}/auth`;

  // Core auth methods using new backend endpoints
  
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: errorData.message || 'Invalid credentials'
        }
      };
    }

    return response.json();
  }

  // Logout user
  async logout(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to logout');
    }
  }

  // Logout all sessions
  async logoutAll(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/logout-all`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to logout all sessions');
    }
  }

  // Refresh token
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await fetch(`${this.baseUrl}/refresh`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: errorData.message || 'Failed to refresh token'
        }
      };
    }

    return response.json();
  }

  // Get current user info
  async getMe(): Promise<MeResponse> {
    const response = await fetch(`${this.baseUrl}/me`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: 'GET_ME_FAILED',
          message: errorData.message || 'Failed to get user info'
        }
      };
    }

    return response.json();
  }

  // Get user permissions
  async getPermissions(): Promise<PermissionsResponse> {
    const response = await fetch(`${this.baseUrl}/permissions`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: 'GET_PERMISSIONS_FAILED',
          message: errorData.message || 'Failed to get permissions'
        }
      };
    }

    return response.json();
  }

  // Change password
  async changePassword(data: PasswordChangeRequest): Promise<PasswordChangeResponse> {
    const response = await fetch(`${this.baseUrl}/password/change`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: 'PASSWORD_CHANGE_FAILED',
          message: errorData.message || 'Failed to change password'
        }
      };
    }

    return response.json();
  }

  // Request password reset
  async requestPasswordReset(request: PasswordResetRequest): Promise<PasswordResetResponse> {
    const response = await fetch(`${this.baseUrl}/password/reset-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: 'PASSWORD_RESET_REQUEST_FAILED',
          message: errorData.message || 'Failed to request password reset'
        }
      };
    }

    return response.json();
  }

  // Complete password reset
  async completePasswordReset(data: PasswordResetCompleteRequest): Promise<PasswordResetCompleteResponse> {
    const response = await fetch(`${this.baseUrl}/password/reset-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: 'PASSWORD_RESET_COMPLETE_FAILED',
          message: errorData.message || 'Failed to complete password reset'
        }
      };
    }

    return response.json();
  }

  // Validate token
  async validateToken(token: string): Promise<ValidateResponse> {
    const response = await fetch(`${this.baseUrl}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      return {
        valid: false,
        reason: 'Token validation failed'
      };
    }

    return response.json();
  }

  // Legacy user management methods - keeping unchanged for backward compatibility
  private legacyBaseUrl = `${API_CONFIG.BASE_URL}/auth/users`;

  // Create new user account
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await fetch(`${this.legacyBaseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Failed to create user account');
    }

    return response.json();
  }

  // Update user
  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const response = await fetch(`${this.legacyBaseUrl}/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update user');
    }

    const result = await response.json();
    return result.data;
  }

  // Get pending account creation requests (NOT users yet - they're requests awaiting approval)
  async getAccountRequests(): Promise<User[]> {
    // For now, return empty array since backend doesn't have this endpoint yet
    // When backend implements GET /auth/users/requests, this will work automatically
    try {
      const response = await fetch(`${this.legacyBaseUrl}/requests`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }
    } catch {
      // Endpoint doesn't exist yet, return empty array
    }
    
    return [];
  }

  // Approve account request
  async approveAccountRequest(userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.legacyBaseUrl}/requests/${userId}/status`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'approved'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve account request');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // If endpoint doesn't exist yet, show a helpful message
      throw new Error('Approve functionality not available yet - backend endpoint not implemented');
    }
  }

  // Reject account request
  async rejectAccountRequest(requestId: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.legacyBaseUrl}/requests/${requestId}/status`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'rejected'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject account request');
      }

      return response.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // If endpoint doesn't exist yet, show a helpful message
      throw new Error('Reject functionality not available yet - backend endpoint not implemented');
    }
  }

  // Legacy password reset methods - keeping for backward compatibility
  async legacyRequestPasswordReset(request: LegacyPasswordResetRequest): Promise<void> {
    const response = await fetch(`${this.legacyBaseUrl}/password-reset-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error('Failed to request password reset');
    }
  }

  // Legacy reset password with token
  async legacyResetPassword(data: { token: string; email: string; newPassword: string }): Promise<void> {
    const response = await fetch(`${this.legacyBaseUrl}/password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to reset password');
    }
  }

  // Get all users (admin only)
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${this.legacyBaseUrl}/list`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch users');
    }

    const result = await response.json();
    return result.data || [];
  }

  // Get user by ID
  async getUserById(userId: number): Promise<User> {
    const response = await fetch(`${this.legacyBaseUrl}/${userId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const result = await response.json();
    return result.data;
  }

  // Delete user
  async deleteUser(userId: number, userEmail: string): Promise<void> {
    const response = await fetch(`${this.legacyBaseUrl}/delete`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        userId,
        email: userEmail
      })
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }

  // Activate/Deactivate user
  async toggleUserStatus(_userId: number, isActive: boolean, userEmail: string): Promise<User> {
    const endpoint = isActive ? 'reactivate' : 'deactivate';
    const response = await fetch(`${this.legacyBaseUrl}/${endpoint}`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userEmail
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to ${isActive ? 'reactivate' : 'deactivate'} user`);
    }

    const result = await response.json();
    return result.data;
  }

  // Get user sessions
  async getUserSessions(userId: number): Promise<Array<{ id: string; device: string; ip: string; lastActivity: string; createdAt: string }>> {
    const response = await fetch(`${this.legacyBaseUrl}/${userId}/sessions`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user sessions');
    }

    const result = await response.json();
    return result.data || [];
  }

  // Update user preferences
  async updateUserPreferences(userId: number, preferences: Record<string, unknown>): Promise<User> {
    const response = await fetch(`${this.legacyBaseUrl}/${userId}/preferences`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      throw new Error('Failed to update user preferences');
    }

    const result = await response.json();
    return result.data;
  }

  // Get authentication logs
  async getAuthenticationLogs(): Promise<Array<{ id: string; userId: number; action: string; timestamp: string; ip: string; success: boolean }>> {
    const response = await fetch(`${this.legacyBaseUrl}/logs`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch authentication logs');
    }

    const result = await response.json();
    return result.data || [];
  }
}

export const authService = new AuthService();
