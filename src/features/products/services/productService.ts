import {
  Product,
  ProductFilters,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ApiResponse,
  PaginatedResponse,
  ProductStats,
  CategoryPerformance,
  TopSellingProduct,
  ProductAvailability,
  ProductMargin,
} from "../types/product";
import { getAuthHeaders } from "../../../shared/services/api";

class ProductService {
  private baseUrl =
    "http://cvm.groupngs.com:8080/api/database-service/products";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Try to parse error message from response
      try {
        const errorData = await response.json();

        if (errorData.error) {
          throw new Error(errorData.error);
        }
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        if (errorData.details) {
          throw new Error(errorData.details);
        }
        // If we have data but no specific error message, show generic error
        throw new Error("An error occurred. Please try again.");
      } catch {
        // If parsing fails, show generic error
        throw new Error("An error occurred. Please try again.");
      }
    }

    return response.json();
  }

  // 1. Analytics & Stats Endpoints

  async getStats(
    skipCache: boolean = false
  ): Promise<ApiResponse<ProductStats>> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<ApiResponse<ProductStats>>(`/stats${params}`);
  }

  async getCategoryPerformance(
    params: {
      limit?: number;
      offset?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<PaginatedResponse<CategoryPerformance>> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<PaginatedResponse<CategoryPerformance>>(
      `/category-performance${query ? "?" + query : ""}`
    );
  }

  async getTopSelling(
    params: {
      limit?: number;
      offset?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<PaginatedResponse<TopSellingProduct>> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<PaginatedResponse<TopSellingProduct>>(
      `/top-selling${query ? "?" + query : ""}`
    );
  }

  // 2. Search Endpoints

  async searchProducts(params: {
    q: string;
    limit?: number;
    offset?: number;
    skipCache?: boolean;
  }): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    queryParams.append("q", params.q);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<PaginatedResponse<Product>>(`/search?${queryParams}`);
  }

  async superSearch(
    params: {
      id?: number;
      product_code?: string;
      name?: string;
      category_id?: number;
      price_min?: number;
      price_max?: number;
      currency?: string;
      is_active?: boolean;
      requires_inventory?: boolean;
      validity_days?: number;
      validity_hours?: number;
      effective_from?: string;
      effective_to?: string;
      limit?: number;
      offset?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params.id) queryParams.append("id", params.id.toString());
    if (params.product_code)
      queryParams.append("product_code", params.product_code);
    if (params.name) queryParams.append("name", params.name);
    if (params.category_id)
      queryParams.append("category_id", params.category_id.toString());
    if (params.price_min)
      queryParams.append("price_min", params.price_min.toString());
    if (params.price_max)
      queryParams.append("price_max", params.price_max.toString());
    if (params.currency) queryParams.append("currency", params.currency);
    if (params.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());
    if (params.requires_inventory !== undefined)
      queryParams.append(
        "requires_inventory",
        params.requires_inventory.toString()
      );
    if (params.validity_days)
      queryParams.append("validity_days", params.validity_days.toString());
    if (params.validity_hours)
      queryParams.append("validity_hours", params.validity_hours.toString());
    if (params.effective_from)
      queryParams.append("effective_from", params.effective_from);
    if (params.effective_to)
      queryParams.append("effective_to", params.effective_to);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<PaginatedResponse<Product>>(
      `/super-search?${queryParams}`
    );
  }

  // 3. Filtered List Endpoints

  async getActiveProducts(
    params: {
      limit?: number;
      offset?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    // Ensure limit doesn't exceed API maximum of 100
    const limit = Math.min(params.limit || 50, 100);
    queryParams.append("limit", limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Product>>(
      `/active${query ? "?" + query : ""}`
    );
  }

  async getEffectiveProducts(
    params: {
      asOfDate?: string;
      limit?: number;
      offset?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params.asOfDate) queryParams.append("asOfDate", params.asOfDate);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Product>>(
      `/effective${query ? "?" + query : ""}`
    );
  }

  async getInventoryRequiredProducts(
    params: {
      limit?: number;
      offset?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Product>>(
      `/inventory-required${query ? "?" + query : ""}`
    );
  }

  async getLowInventoryProducts(
    params: {
      threshold?: number;
      limit?: number;
      offset?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params.threshold)
      queryParams.append("threshold", params.threshold.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Product>>(
      `/low-inventory${query ? "?" + query : ""}`
    );
  }

  async getProductsByPriceRange(params: {
    minPrice: number;
    maxPrice: number;
    currency?: string;
    limit?: number;
    offset?: number;
    skipCache?: boolean;
  }): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    queryParams.append("minPrice", params.minPrice.toString());
    queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.currency) queryParams.append("currency", params.currency);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<PaginatedResponse<Product>>(
      `/price-range?${queryParams}`
    );
  }

  async getProductsByValidity(
    params: {
      days?: number;
      hours?: number;
      limit?: number;
      offset?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append("days", params.days.toString());
    if (params.hours) queryParams.append("hours", params.hours.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Product>>(
      `/validity${query ? "?" + query : ""}`
    );
  }

  // 4. Specific Lookup Endpoints

  async getProductByUuid(
    uuid: string,
    skipCache: boolean = false
  ): Promise<ApiResponse<Product>> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<ApiResponse<Product>>(`/uuid/${uuid}${params}`);
  }

  async getProductByCode(
    code: string,
    skipCache: boolean = false
  ): Promise<ApiResponse<Product>> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<ApiResponse<Product>>(`/code/${code}${params}`);
  }

  async getProductByDaId(
    daId: string,
    skipCache: boolean = false
  ): Promise<ApiResponse<Product>> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<ApiResponse<Product>>(`/da/${daId}${params}`);
  }

  async getProductByName(
    name: string,
    skipCache: boolean = false
  ): Promise<ApiResponse<Product>> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<ApiResponse<Product>>(`/name/${name}${params}`);
  }

  async getProductsByCategory(
    categoryId: number,
    params: {
      limit?: number;
      offset?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Product>>(
      `/category/${categoryId}${query ? "?" + query : ""}`
    );
  }

  // 5. Product Operations Endpoints

  async checkAvailability(
    id: number,
    quantity: number = 1,
    skipCache: boolean = false
  ): Promise<ApiResponse<ProductAvailability>> {
    const params = new URLSearchParams();
    params.append("quantity", quantity.toString());
    if (skipCache) params.append("skipCache", "true");

    return this.request<ApiResponse<ProductAvailability>>(
      `/${id}/availability?${params}`
    );
  }

  async getMargin(
    id: number,
    skipCache: boolean = false
  ): Promise<ApiResponse<ProductMargin>> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<ApiResponse<ProductMargin>>(`/${id}/margin${params}`);
  }

  async activateProduct(
    id: number,
    updatedBy?: number
  ): Promise<ApiResponse<Product>> {
    const body = updatedBy ? { updated_by: updatedBy } : {};
    return this.request<ApiResponse<Product>>(`/${id}/activate`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async deactivateProduct(
    id: number,
    updatedBy?: number
  ): Promise<ApiResponse<Product>> {
    const body = updatedBy ? { updated_by: updatedBy } : {};
    return this.request<ApiResponse<Product>>(`/${id}/deactivate`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async reserveInventory(
    id: number,
    quantity: number,
    updatedBy?: number
  ): Promise<ApiResponse<Product>> {
    const body = { quantity, ...(updatedBy && { updated_by: updatedBy }) };
    return this.request<ApiResponse<Product>>(`/${id}/inventory/reserve`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async releaseInventory(
    id: number,
    quantity: number,
    updatedBy?: number
  ): Promise<ApiResponse<Product>> {
    const body = { quantity, ...(updatedBy && { updated_by: updatedBy }) };
    return this.request<ApiResponse<Product>>(`/${id}/inventory/release`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  // 6. CRUD Operations Endpoints

  async getProductById(
    id: number,
    skipCache: boolean = false
  ): Promise<ApiResponse<Product>> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<ApiResponse<Product>>(`/${id}${params}`);
  }

  async getAllProducts(
    params: {
      limit?: number;
      offset?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    // Ensure limit doesn't exceed API maximum of 100
    const limit = Math.min(params.limit || 50, 100);
    queryParams.append("limit", limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Product>>(
      `/${query ? "?" + query : ""}`
    );
  }

  async createProduct(
    data: CreateProductRequest
  ): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>("/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(
    id: number,
    data: UpdateProductRequest
  ): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(
    id: number
  ): Promise<ApiResponse<{ message: string; deleted_at: string }>> {
    return this.request<ApiResponse<{ message: string; deleted_at: string }>>(
      `/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  // Legacy methods for backward compatibility
  async getProducts(filters?: ProductFilters): Promise<ProductResponse> {
    // Convert old filters to new API
    const params = {
      limit: filters?.pageSize || 50,
      offset: ((filters?.page || 1) - 1) * (filters?.pageSize || 50),
      skipCache: true,
    };

    let response: PaginatedResponse<Product>;

    if (filters?.search) {
      response = await this.searchProducts({ q: filters.search, ...params });
    } else if (filters?.categoryId) {
      response = await this.getProductsByCategory(filters.categoryId, params);
    } else if (filters?.isActive !== undefined) {
      response = filters.isActive
        ? await this.getActiveProducts(params)
        : await this.getAllProducts(params);
    } else {
      response = await this.getAllProducts(params);
    }

    // Convert PaginatedResponse to ProductResponse
    return {
      data: response.data || [],
      total: response.pagination?.total || 0,
      page:
        Math.floor(
          (response.pagination?.offset || 0) /
            (response.pagination?.limit || 50)
        ) + 1,
      pageSize: response.pagination?.limit || 50,
    };
  }
}

export const productService = new ProductService();
