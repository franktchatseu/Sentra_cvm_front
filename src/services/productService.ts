import { Product, ProductFilters, ProductResponse, CreateProductRequest, UpdateProductRequest } from '../types/product';
import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api';

class ProductService {
  private baseUrl = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS);

  // Get all products with pagination and filters
  async getProducts(filters?: ProductFilters): Promise<ProductResponse> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortDirection) params.append('sortDirection', filters.sortDirection);
    params.append('skipCache', 'true');

    const response = await fetch(`${this.baseUrl}/all?${params}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return response.json();
  }

  // Get product by ID, product_id, da_id, or name
  async getProductById(id: string, searchBy: 'id' | 'product_id' | 'da_id' | 'name' = 'id'): Promise<Product> {
    const params = new URLSearchParams();
    params.append('searchBy', searchBy);

    const response = await fetch(`${this.baseUrl}/${encodeURIComponent(id)}?${params}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const result = await response.json();
    return result.data; // Extract data from API response structure
  }

  // Create a new product
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      throw new Error('Failed to create product');
    }

    return response.json();
  }

  // Update an existing product
  async updateProduct(id: number, productData: UpdateProductRequest): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/update/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      throw new Error('Failed to update product');
    }

    return response.json();
  }

  // Activate a product
  async activateProduct(id: number): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/${id}/activate`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to activate product');
    }

    return response.json();
  }

  // Deactivate a product
  async deactivateProduct(id: number): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/${id}/deactivate`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to deactivate product');
    }

    return response.json();
  }

  // Delete a product (admin only)
  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/delete/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  }
}

export const productService = new ProductService();
