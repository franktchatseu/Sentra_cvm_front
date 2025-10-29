// Core offer category data structure
export interface OfferCategoryType {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface CreateOfferCategoryRequest {
  name: string;
  description?: string;
  created_by?: number;
}

export interface UpdateOfferCategoryRequest {
  name?: string;
  description?: string;
  updated_by?: number;
}

export interface ActivateCategoryRequest {
  updated_by?: number;
}

export interface DeactivateCategoryRequest {
  updated_by?: number;
}

export interface SearchParams {
  q: string;
  limit?: number;
  offset?: number;
  skipCache?: boolean;
}

export interface AdvancedSearchParams {
  name?: string;
  is_active?: boolean;
  created_by?: number;
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
  skipCache?: boolean;
}

export interface FilterParams {
  limit?: number;
  offset?: number;
  skipCache?: boolean;
}

export interface DateRangeParams {
  days?: number;
  skipCache?: boolean;
}

export interface OfferCategoryResponse {
  success: boolean;
  data: OfferCategoryType;
  source: "cache" | "database" | "database-forced";
}

export interface OfferCategoryListResponse {
  success: boolean;
  data: OfferCategoryType[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  source: "cache" | "database" | "database-forced";
}

// Analytics response types
export interface OfferCategoryStatsResponse {
  success: boolean;
  data: {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    categoriesWithOffers: number;
    categoriesWithoutOffers: number;
    averageOffersPerCategory: number;
    mostUsedCategory: {
      id: number;
      name: string;
      offerCount: number;
    };
    leastUsedCategory: {
      id: number;
      name: string;
      offerCount: number;
    };
  };
  source: "cache" | "database" | "database-forced";
}

export interface PopularCategoriesResponse {
  success: boolean;
  data: Array<{
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
    offerCount: number;
    activeOfferCount: number;
    created_at: string;
    updated_at: string;
  }>;
  source: "cache" | "database" | "database-forced";
}

export interface OfferCountsResponse {
  success: boolean;
  data: Array<{
    categoryId: number;
    categoryName: string;
    totalOffers: number;
    activeOffers: number;
    expiredOffers: number;
    draftOffers: number;
  }>;
  source: "cache" | "database" | "database-forced";
}

export interface ActiveOfferCountsResponse {
  success: boolean;
  data: Array<{
    categoryId: number;
    categoryName: string;
    activeOfferCount: number;
  }>;
  source: "cache" | "database" | "database-forced";
}

export interface UsageTrendsResponse {
  success: boolean;
  data: Array<{
    category_name: string;
    year: number;
    month: number;
    offers_created: number;
  }>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  source: "cache" | "database" | "database-forced";
}

export interface PerformanceByTypeResponse {
  success: boolean;
  data: Array<{
    category_name: string;
    offer_type: string;
    offer_count: number;
    avg_discount_percentage: number;
    avg_discount_amount: number;
  }>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  source: "cache" | "database" | "database-forced";
}

// Category-offer relationship responses
export interface CategoryOfferCountResponse {
  success: boolean;
  data: {
    categoryId: number;
    categoryName: string;
    totalOffers: number;
    activeOffers: number;
    expiredOffers: number;
    draftOffers: number;
    pendingOffers: number;
  };
  source: "cache" | "database" | "database-forced";
}

export interface CategoryActiveOfferCountResponse {
  success: boolean;
  data: {
    categoryId: number;
    categoryName: string;
    activeOfferCount: number;
  };
  source: "cache" | "database" | "database-forced";
}

export interface CategoryOffersResponse {
  success: boolean;
  data: Array<unknown>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  source: "cache" | "database" | "database-forced";
}

export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}
