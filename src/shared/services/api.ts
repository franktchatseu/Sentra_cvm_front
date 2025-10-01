// API Configuration
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_CONFIG = {
  // Use direct API for localhost (from .env), proxy for production to avoid mixed content issues
  BASE_URL: isLocalhost
    ? import.meta.env.VITE_API_BASE_URL
    : '/api/proxy',
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
