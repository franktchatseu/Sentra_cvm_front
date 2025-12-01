import {
  CreateOfferCategoryRequest,
  UpdateOfferCategoryRequest,
  ActivateCategoryRequest,
  DeactivateCategoryRequest,
  SearchParams,
  AdvancedSearchParams,
  FilterParams,
  DateRangeParams,
  OfferCategoryResponse,
  OfferCategoryListResponse,
  OfferCategoryStatsResponse,
  PopularCategoriesResponse,
  OfferCountsResponse,
  ActiveOfferCountsResponse,
  UsageTrendsResponse,
  PerformanceByTypeResponse,
  CategoryOfferCountResponse,
  CategoryActiveOfferCountResponse,
  CategoryOffersResponse,
  DeleteCategoryResponse,
} from "../types/offerCategory";
import {
  API_CONFIG,
  buildApiUrl,
  getAuthHeaders,
} from "../../../shared/services/api";

const BASE_URL = buildApiUrl(API_CONFIG.ENDPOINTS.OFFER_CATEGORIES);

class OfferCategoryService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  //  Analytics & Stats

  async getStats(
    skipCache: boolean = false
  ): Promise<OfferCategoryStatsResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<OfferCategoryStatsResponse>(`/stats${params}`);
  }

  async getUnusedCategories(
    params: FilterParams = {}
  ): Promise<OfferCategoryListResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<OfferCategoryListResponse>(
      `/unused${query ? `?${query}` : ""}`
    );
  }

  async getPopularCategories(
    params: FilterParams = {}
  ): Promise<PopularCategoriesResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<PopularCategoriesResponse>(
      `/popular${query ? `?${query}` : ""}`
    );
  }

  async getOfferCounts(
    skipCache: boolean = false
  ): Promise<OfferCountsResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<OfferCountsResponse>(`/offer-counts${params}`);
  }

  async getActiveOfferCounts(
    skipCache: boolean = false
  ): Promise<ActiveOfferCountsResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<ActiveOfferCountsResponse>(
      `/active-offer-counts${params}`
    );
  }

  async getUsageTrends(
    params: FilterParams = {}
  ): Promise<UsageTrendsResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<UsageTrendsResponse>(
      `/usage-trends${query ? `?${query}` : ""}`
    );
  }

  async getPerformanceByType(
    params: FilterParams = {}
  ): Promise<PerformanceByTypeResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<PerformanceByTypeResponse>(
      `/performance-by-type${query ? `?${query}` : ""}`
    );
  }

  //  Search & Filter

  async searchCategories(
    params: SearchParams
  ): Promise<OfferCategoryListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("searchTerm", params.q);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<OfferCategoryListResponse>(`/search?${query}`);
  }

  async advancedSearch(
    params: AdvancedSearchParams
  ): Promise<OfferCategoryListResponse> {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append("name", params.name);
    if (params.is_active !== undefined && params.is_active !== null)
      queryParams.append("is_active", params.is_active.toString());
    if (params.created_by)
      queryParams.append("created_by", params.created_by.toString());
    if (params.created_after)
      queryParams.append("created_after", params.created_after);
    if (params.created_before)
      queryParams.append("created_before", params.created_before);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<OfferCategoryListResponse>(`/advanced-search?${query}`);
  }

  async getActiveCategories(
    params: FilterParams = {}
  ): Promise<OfferCategoryListResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<OfferCategoryListResponse>(
      `/active${query ? `?${query}` : ""}`
    );
  }

  //  Specific Lookups

  async getCategoryByName(
    name: string,
    skipCache: boolean = false
  ): Promise<OfferCategoryResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<OfferCategoryResponse>(
      `/by-name/${encodeURIComponent(name)}${params}`
    );
  }

  async getCategoryById(
    id: number,
    skipCache: boolean = false
  ): Promise<OfferCategoryResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<OfferCategoryResponse>(`/${id}${params}`);
  }

  // Category-Offer Relationships

  async getCategoryOffers(
    id: number,
    params: FilterParams = {}
  ): Promise<CategoryOffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<CategoryOffersResponse>(
      `/${id}/offers${query ? `?${query}` : ""}`
    );
  }

  async getCategoryOfferCount(
    id: number,
    skipCache: boolean = false
  ): Promise<CategoryOfferCountResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<CategoryOfferCountResponse>(
      `/${id}/offer-count${params}`
    );
  }

  async getCategoryActiveOfferCount(
    id: number,
    skipCache: boolean = false
  ): Promise<CategoryActiveOfferCountResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<CategoryActiveOfferCountResponse>(
      `/${id}/active-offer-count${params}`
    );
  }

  // CRUD Operations

  async getAllCategories(
    params: FilterParams = {}
  ): Promise<OfferCategoryListResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const query = queryParams.toString();
    return this.request<OfferCategoryListResponse>(
      `/${query ? `?${query}` : ""}`
    );
  }

  async createCategory(
    request: CreateOfferCategoryRequest
  ): Promise<OfferCategoryResponse> {
    return this.request<OfferCategoryResponse>("/", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async updateCategory(
    id: number,
    request: UpdateOfferCategoryRequest
  ): Promise<OfferCategoryResponse> {
    return this.request<OfferCategoryResponse>(`/${id}`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  async deleteCategory(id: number): Promise<DeleteCategoryResponse> {
    return this.request<DeleteCategoryResponse>(`/${id}`, {
      method: "DELETE",
    });
  }

  async activateCategory(
    id: number,
    request: ActivateCategoryRequest = {}
  ): Promise<OfferCategoryResponse> {
    return this.request<OfferCategoryResponse>(`/${id}/activate`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  async deactivateCategory(
    id: number,
    request: DeactivateCategoryRequest = {}
  ): Promise<OfferCategoryResponse> {
    return this.request<OfferCategoryResponse>(`/${id}/deactivate`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }
}

export const offerCategoryService = new OfferCategoryService();
export default offerCategoryService;
