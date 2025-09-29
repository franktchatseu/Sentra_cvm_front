// Offer Category Types

export interface OfferCategory {
  id: string; // Backend returns string IDs
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  updated_at?: string;
  offer_count?: number; // Optional, included when requested
}

// Query Parameters for GET /offers/categories/all
export interface GetOfferCategoriesQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'id' | 'name' | 'description' | 'created_at' | 'updated_at';
  sortDirection?: 'ASC' | 'DESC';
  skipCache?: 'true' | 'false';
}

// Query Parameters for GET /offers/categories/:identifier
export interface GetOfferCategoryByIdentifierQuery {
  searchBy: 'id' | 'name';
  includeOfferCount?: boolean;
  skipCache?: 'true' | 'false';
}

// Request body for POST /offers/categories/create
export interface CreateOfferCategoryRequest {
  name: string; // 1-64 chars
  description?: string; // max 1000 chars, can be null
}

// Request body for PUT /offers/categories/update/:id
export interface UpdateOfferCategoryRequest {
  name?: string; // 1-64 chars
  description?: string; // max 1000 chars, can be null
}

// Query Parameters for GET /offers/categories/:id/offers
export interface GetCategoryOffersQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'id' | 'name' | 'description' | 'lifecycle_status' | 'approval_status' | 'reusable' | 'multi_language' | 'created_at' | 'updated_at';
  sortDirection?: 'ASC' | 'DESC';
  lifecycleStatus?: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'EXPIRED' | 'SUSPENDED';
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  reusable?: boolean;
  multiLanguage?: boolean;
  skipCache?: 'true' | 'false';
}

// Response types
export interface OfferCategoriesResponse {
  success: boolean;
  data: OfferCategory[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sortBy: string;
    sortDirection: string;
  };
  cacheDurationSec: number;
  isCachedResponse: boolean;
}

export interface CategoryOffersResponse {
  offers: any[]; // You can define a proper Offer type if needed
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error response
export interface OfferCategoryError {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}
