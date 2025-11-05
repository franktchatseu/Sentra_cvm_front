// API Configuration
// Base URL can be set via environment variable VITE_API_BASE_URL
// Default: http://localhost:8080/api/database-service
const API_BASE_URL =
  "http://cvm.groupngs.com/api/database-service";

const isProduction =
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";

export const API_CONFIG = {
  // Use proxy in production, direct API in development
  // BASE_URL is now configurable via VITE_API_BASE_URL environment variable
  BASE_URL: isProduction ? "/api/proxy" : API_BASE_URL,
  ENDPOINTS: {
    OFFERS: "/offers",
    PRODUCTS: "/products",
    CATEGORIES: "/categories",
    OFFER_CATEGORIES: "/offer-categories",
    CAMPAIGNS: "/campaigns",
    SEGMENTS: "/segments",
    OFFER_PRODUCTS: "/offer-products",
    OFFER_CREATIVES: "/offer-creatives",
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  // Check both possible token keys (authToken and auth_token for compatibility)
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn(
      "⚠️ WARNING: No auth token found in localStorage. Request will be sent without Authorization header."
    );
    console.warn("⚠️ Checked keys: 'authToken' and 'auth_token'");
    console.warn("⚠️ Please ensure you are logged in.");
  }

  return headers;
};
