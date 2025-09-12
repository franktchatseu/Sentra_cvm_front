export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  currency: string;
  sku?: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
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
