export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateProductCategoryRequest {
  name?: string;
  description?: string;
}

export interface ProductCategoryFilters {
  search?: string;
  includeProductCount?: boolean;
}

export interface ProductCategoryResponse {
  categories: ProductCategory[];
  total: number;
}
