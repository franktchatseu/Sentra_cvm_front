// Updated Product types to match API documentation

export interface Product {
  id: number;
  product_uuid: string;
  product_code: string;
  da_id?: string;
  name: string;
  description?: string;
  category_id?: number;
  price: number;
  currency: string;
  cost?: number;
  validity_days?: number;
  validity_hours?: number;
  requires_inventory: boolean;
  available_quantity?: number;
  is_active: boolean;
  effective_from?: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  metadata?: Record<string, any>;
}

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export interface CreateProductRequest {
  product_code: string;
  name: string;
  description?: string;
  category_id?: number;
  price: number;
  currency?: string;
  cost?: number;
  validity_days?: number;
  validity_hours?: number;
  requires_inventory?: boolean;
  available_quantity?: number;
  effective_from?: string;
  effective_to?: string;
  da_id?: string;
  metadata?: Record<string, any>;
  created_by?: number;
}

export interface UpdateProductRequest {
  product_code?: string;
  name?: string;
  description?: string;
  category_id?: number;
  price?: number;
  currency?: string;
  cost?: number;
  validity_days?: number;
  validity_hours?: number;
  requires_inventory?: boolean;
  available_quantity?: number;
  effective_from?: string;
  effective_to?: string;
  da_id?: string;
  metadata?: Record<string, any>;
  updated_by?: number;
}

export interface ProductResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

// API Response types
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

export interface ProductStats {
  total_products: number;
  active_products: number;
  inactive_products: number;
  products_requiring_inventory: number;
  products_with_low_inventory: number;
  average_price: number;
  total_inventory_value: number;
  products_by_currency: Record<string, number>;
  products_by_category: Array<{
    category_id: number;
    category_name: string;
    product_count: number;
  }>;
}

export interface CategoryPerformance {
  category_id: number;
  category_name: string;
  product_count: number;
  average_price: number;
  total_value: number;
  active_products: number;
  inactive_products: number;
}

export interface TopSellingProduct extends Product {
  total_sales: number;
  revenue: number;
  margin_amount: number;
  margin_percentage: number;
}

export interface ProductAvailability {
  available: boolean;
  available_quantity: number;
  requested_quantity: number;
  can_fulfill: boolean;
}

export interface ProductMargin {
  margin_amount: number;
  margin_percentage: number;
  price: number;
  cost: number;
  currency: string;
}
