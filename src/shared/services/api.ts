// API Configuration
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

export const API_CONFIG = {
  // Use proxy in production, direct API in development
  BASE_URL: isProduction 
    ? '/api/proxy' 
    : 'http://cvm.groupngs.com:8080/api/database-service',
  ENDPOINTS: {
    OFFERS: '/offers',
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    CAMPAIGNS: '/campaigns',
    SEGMENTS: '/segments'
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || 'mmmm';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};
