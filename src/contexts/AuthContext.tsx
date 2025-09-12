import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService } from '../services/authService';
import { User, LoginResponse, CreateUserRequest, CreateUserResponse } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<CreateUserResponse>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, email: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    const savedSessionId = localStorage.getItem('session_id');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      if (savedSessionId) {
        setSessionId(parseInt(savedSessionId));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await authService.login({ email, password });
      
      // Store auth data
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('session_id', response.session_id.toString());
      
      setToken(response.token);
      setSessionId(response.session_id);
      setIsAuthenticated(true);
      
      // Note: We don't have user data from login response, 
      // you might need to fetch user profile separately
      // For now, we'll create a basic user object
      const basicUser: User = {
        id: 0, // Will be updated when we fetch full profile
        email,
        firstName: '',
        lastName: '',
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setUser(basicUser);
      localStorage.setItem('auth_user', JSON.stringify(basicUser));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (sessionId) {
        await authService.logout({ sessionId });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setSessionId(null);
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('session_id');
    }
  };

  const createUser = async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
    try {
      const response = await authService.createUser(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    try {
      await authService.requestPasswordReset({ email });
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token: string, email: string, newPassword: string): Promise<void> => {
    try {
      await authService.resetPassword({ token, email, newPassword });
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      token, 
      login, 
      logout, 
      createUser,
      requestPasswordReset,
      resetPassword,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}