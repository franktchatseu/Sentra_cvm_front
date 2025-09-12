export interface Product {
  id: string;
  product_id: string;
  da_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  category_id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  // Legacy fields for backward compatibility
  category?: string;
  categoryId?: number;
  daId?: string;
  price?: number;
  currency?: string;
  sku?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  image_url?: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface CreateProductRequest {
  product_id: string;
  name: string;
  da_id?: string;
  description?: string;
  category_id?: number;
  is_active?: boolean;
}

export interface UpdateProductRequest {
  product_id?: string;
  name?: string;
  da_id?: string;
  description?: string;
  category_id?: number;
  is_active?: boolean;
}

export interface ProductResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}
