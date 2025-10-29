export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  parent_category_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface CreateProductCategoryRequest {
  name: string;
  description?: string;
  parent_category_id?: number;
  is_active?: boolean;
  created_by?: number;
}

export interface UpdateProductCategoryRequest {
  name?: string;
  description?: string;
  parent_category_id?: number;
  is_active?: boolean;
  updated_by?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source?: "cache" | "database" | "database-forced";
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CategoryStats {
  total_categories: number;
  active_categories: number;
  inactive_categories: number;
  root_categories: number;
  max_depth: number;
  categories_with_products: number;
  empty_categories: number;
  average_products_per_category: number;
}

export interface ProductCountByCategory {
  category_id: number;
  category_name: string;
  product_count: number;
  active_products: number;
  inactive_products: number;
}

export interface CategoryDepthAnalysis {
  depth: number;
  category_count: number;
  categories: Array<{
    id: number;
    name: string;
    path: string;
  }>;
}

export interface CategoryUsageStats {
  category_id: number;
  category_name: string;
  total_usage: number;
  recent_usage: number;
  usage_trend: "increasing" | "decreasing" | "stable";
}

export interface CategoryTree extends ProductCategory {
  children?: CategoryTree[];
  depth?: number;
  path?: string;
  product_count?: number;
  active_product_count?: number;
}

export interface MoveSubtreeRequest {
  from_parent_id: number;
  to_parent_id: number;
  updated_by?: number;
}
