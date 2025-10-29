import {
  CreateOfferRequest,
  UpdateOfferRequest,
  UpdateStatusRequest,
  SubmitApprovalRequest,
  ApproveOfferRequest,
  OfferResponse,
  OffersResponse,
  CreateOfferResponse,
  OfferStatsResponse,
  TypeDistributionResponse,
  CategoryPerformanceResponse,
  SearchParams,
  FilterParams,
  DateRangeParams,
  OfferProductsResponse,
  OfferStatusEnum,
  OfferTypeEnum,
} from "../types/offer";
import {
  API_CONFIG,
  buildApiUrl,
  getAuthHeaders,
} from "../../../shared/services/api";

const BASE_URL = buildApiUrl(API_CONFIG.ENDPOINTS.OFFERS);

class OfferService {
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
      } catch (parseError) {
        // If parsing fails, show generic error
        throw new Error("An error occurred. Please try again.");
      }
    }

    return response.json();
  }

  // Analytics & Stats
  async getStats(skipCache: boolean = false): Promise<OfferStatsResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<OfferStatsResponse>(`/stats${params}`);
  }

  async getTypeDistribution(
    skipCache: boolean = false
  ): Promise<TypeDistributionResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<TypeDistributionResponse>(
      `/type-distribution${params}`
    );
  }

  async getCategoryPerformance(
    skipCache: boolean = false
  ): Promise<CategoryPerformanceResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<CategoryPerformanceResponse>(
      `/category-performance${params}`
    );
  }

  // Search & Filter
  async searchOffers(params: SearchParams): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("searchTerm", params.searchTerm);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(`/search?${queryParams.toString()}`);
  }

  async getActiveOffers(params: FilterParams = {}): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(`/active?${queryParams.toString()}`);
  }

  async getCurrentOffers(params: FilterParams = {}): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(`/current?${queryParams.toString()}`);
  }

  async getExpiredOffers(params: FilterParams = {}): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(`/expired?${queryParams.toString()}`);
  }

  async getUpcomingOffers(params: FilterParams = {}): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(`/upcoming?${queryParams.toString()}`);
  }

  async getPendingApprovalOffers(
    params: FilterParams = {}
  ): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(
      `/pending-approval?${queryParams.toString()}`
    );
  }

  async getApprovedOffers(params: FilterParams = {}): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(`/approved?${queryParams.toString()}`);
  }

  async getRejectedOffers(params: FilterParams = {}): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(`/rejected?${queryParams.toString()}`);
  }

  // Date & Range
  async getOffersByDateRange(params: DateRangeParams): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("startDate", params.startDate);
    queryParams.append("endDate", params.endDate);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(
      `/date-range?${queryParams.toString()}`
    );
  }

  // Specific Lookups
  async getOffersByStatus(
    status: OfferStatusEnum,
    params: FilterParams = {}
  ): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(
      `/status/${status}?${queryParams.toString()}`
    );
  }

  async getOffersByType(
    type: OfferTypeEnum,
    params: FilterParams = {}
  ): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(
      `/type/${type}?${queryParams.toString()}`
    );
  }

  async getOffersByCategory(
    categoryId: number,
    params: FilterParams = {}
  ): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(
      `/category/${categoryId}?${queryParams.toString()}`
    );
  }

  async getOffersByProduct(
    productId: number,
    params: FilterParams = {}
  ): Promise<OffersResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    return this.request<OffersResponse>(
      `/product/${productId}?${queryParams.toString()}`
    );
  }

  async getOfferByUuid(
    uuid: string,
    skipCache: boolean = false
  ): Promise<OfferResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<OfferResponse>(`/uuid/${uuid}${params}`);
  }

  async getOfferByName(
    name: string,
    skipCache: boolean = false
  ): Promise<OfferResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<OfferResponse>(
      `/name/${encodeURIComponent(name)}${params}`
    );
  }

  async getOfferByCode(
    code: string,
    skipCache: boolean = false
  ): Promise<OfferResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<OfferResponse>(`/code/${code}${params}`);
  }

  // Write Operations
  async createOffer(offer: CreateOfferRequest): Promise<CreateOfferResponse> {
    return this.request<CreateOfferResponse>("/", {
      method: "POST",
      body: JSON.stringify(offer),
    });
  }

  async updateOfferStatus(
    id: number,
    request: UpdateStatusRequest
  ): Promise<OfferResponse> {
    return this.request<OfferResponse>(`/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  async submitForApproval(
    id: number,
    request: SubmitApprovalRequest
  ): Promise<OfferResponse> {
    return this.request<OfferResponse>(`/${id}/submit-approval`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  async approveOffer(
    id: number,
    request: ApproveOfferRequest
  ): Promise<OfferResponse> {
    return this.request<OfferResponse>(`/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  // Nested Resources
  async getOfferProducts(
    id: number,
    skipCache: boolean = false
  ): Promise<OfferProductsResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<OfferProductsResponse>(`/${id}/products${params}`);
  }

  // Basic CRUD
  async getOfferById(
    id: number,
    skipCache: boolean = false
  ): Promise<OfferResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    return this.request<OfferResponse>(`/${id}${params}`);
  }

  async updateOffer(
    id: number,
    offer: UpdateOfferRequest
  ): Promise<OfferResponse> {
    return this.request<OfferResponse>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(offer),
    });
  }

  async deleteOffer(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/${id}`, {
      method: "DELETE",
    });
  }
}

export const offerService = new OfferService();
export default offerService;
