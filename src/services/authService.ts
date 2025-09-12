import { User, LoginRequest, CreateUserRequest, PasswordResetRequest } from '../types/auth';
import { getAuthHeaders, API_CONFIG } from '../config/api';

// Response types
interface LoginResponse {
  token: string;
  user: User;
}

interface RejectAccountResponse {
  message: string;
}

class AuthService {
  private baseUrl = `${API_CONFIG.BASE_URL}/auth/users`;

  // Create new user account
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await fetch(`${this.baseUrl}/create`, {
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
    const response = await fetch(`${this.baseUrl}/${userId}`, {
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
      throw new Error('Invalid credentials');
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

  // Get pending account requests (users who need password reset)
  async getAccountRequests(): Promise<User[]> {
    // Get users who have force_password_reset = true (pending activation)
    const response = await fetch(`${this.baseUrl}/list?page=1&pageSize=50`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch account requests');
    }

    const result = await response.json();
    return result.data || [];
  }

  // Approve account request
  async approveAccountRequest(userId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${userId}/activate`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to approve account request');
    }
  }

  // Reject account request
  async rejectAccountRequest(requestId: number): Promise<RejectAccountResponse> {
    const response = await fetch(`${this.baseUrl}/requests/${requestId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'rejected',
        role: 'user'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to reject account request');
    }

    return response.json();
  }

  // Request password reset
  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/password-reset-request`, {
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

  // Reset password with token
  async resetPassword(data: { token: string; email: string; newPassword: string }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/password-reset`, {
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
    // Get current user ID from localStorage, default to 1 if not available or 0
    const savedUser = localStorage.getItem('auth_user');
    let userId = 1; // Default user ID
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        userId = user.id && user.id !== 0 ? user.id : 1;
      } catch (e) {
        // If parsing fails, use default userId = 1
        userId = 1;
      }
    }
    
    const response = await fetch(`${this.baseUrl}/list`, {
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
    const response = await fetch(`${this.baseUrl}/${userId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const result = await response.json();
    return result.data;
  }


  // Delete user
  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }

  // Activate/Deactivate user
  async toggleUserStatus(userId: number, isActive: boolean): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${userId}/${isActive ? 'activate' : 'deactivate'}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to ${isActive ? 'activate' : 'deactivate'} user`);
    }

    const result = await response.json();
    return result.data;
  }
}

export const authService = new AuthService();
