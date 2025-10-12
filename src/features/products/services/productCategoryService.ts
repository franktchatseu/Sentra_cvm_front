import { API_CONFIG, getAuthHeaders } from '../../../shared/services/api';
import { 
  ProductCategory, 
  CreateProductCategoryRequest, 
  UpdateProductCategoryRequest,
  ProductCategoryFilters,
  ProductCategoryResponse 
} from '../../../shared/types/productCategory';

class ProductCategoryService {
  private baseUrl = `${API_CONFIG.BASE_URL}/products/categories`;

  async getCategories(filters?: ProductCategoryFilters): Promise<ProductCategoryResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.includeProductCount !== undefined) params.append('includeProductCount', filters.includeProductCount.toString());
    if (filters?.skipCache !== undefined) params.append('skipCache', filters.skipCache.toString());
    else params.append('skipCache', 'true'); // Default to skip cache

    const response = await fetch(`${this.baseUrl}/all?${params}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product categories');
    }

    const result = await response.json();
    const categoriesData = result.data || [];
    const categories = Array.isArray(categoriesData) ? categoriesData.map((cat: any) => ({
      id: parseInt(cat.id),
      name: cat.name,
      description: cat.description,
      productCount: cat.product_count || 0,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at
    })) : [];
    
    return {
      categories,
      total: result.meta?.total || categories.length
    };
  }

  async getCategoryById(id: number): Promise<ProductCategory> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product category');
    }

    return response.json();
  }

  async getCategoryByName(name: string, includeProductCount = false): Promise<ProductCategory> {
    const params = new URLSearchParams();
    params.append('searchBy', 'name');
    if (includeProductCount) params.append('includeProductCount', 'true');

    const response = await fetch(`${this.baseUrl}/${encodeURIComponent(name)}?${params}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product category');
    }

    return response.json();
  }

  async createCategory(categoryData: CreateProductCategoryRequest): Promise<ProductCategory> {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    });

    if (!response.ok) {
      throw new Error('Failed to create product category');
    }

    return response.json();
  }

  async updateCategory(id: number, categoryData: UpdateProductCategoryRequest): Promise<ProductCategory> {
    const response = await fetch(`${this.baseUrl}/update/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    });

    if (!response.ok) {
      throw new Error('Failed to update product category');
    }

    return response.json();
  }

  async deleteCategory(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/delete/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete product category');
    }
  }
}

export const productCategoryService = new ProductCategoryService();
