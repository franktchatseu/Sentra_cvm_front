import {
  API_CONFIG,
  buildApiUrl,
  getAuthHeaders,
} from "../../../shared/services/api";
import {
  Campaign,
  GetCampaignsResponse,
  GetCampaignCategoriesResponse,
  CampaignCollection,
  CampaignDetail,
  CampaignStatsResponse,
  CampaignPerformanceResponse,
  CampaignBudgetUtilResponse,
  CampaignParticipantUtilResponse,
  CampaignSegmentsResponse,
  CampaignExecutionRequestPayload,
  CampaignExecutionResponse,
  CampaignStatus,
  CampaignSearchQuery,
  CampaignSuperSearchQuery,
  CampaignListQuery,
  CampaignDateRangeQuery,
  CampaignBudgetRangeQuery,
} from "../types/campaign";
import {
  CreateCampaignRequest,
  CreateCampaignResponse,
} from "../types/createCampaign";
import {
  RunCampaignRequest,
  RunCampaignResponse,
  ValidateCampaignRequest,
  ValidateCampaignResponse,
  CloneCampaignWithModificationsRequest,
  CloneCampaignWithModificationsResponse,
  CloneCampaignRequest,
  CloneCampaignResponse,
} from "../types";

export interface CampaignResponse {
  success: boolean;
  data: unknown[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const BASE_URL = buildApiUrl(API_CONFIG.ENDPOINTS.CAMPAIGNS);

class CampaignService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url,
        params: options.body,
      });
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorBody}`
      );
    }

    return response.json();
  }

  private buildQueryString(params?: Record<string, unknown>): string {
    if (!params) {
      return "";
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          searchParams.append(key, String(item));
        });
      } else if (typeof value === "boolean") {
        searchParams.append(key, value ? "true" : "false");
      } else {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : "";
  }

  private getCollection(
    path: string,
    params?: Record<string, unknown>
  ): Promise<CampaignCollection> {
    const query = this.buildQueryString(params);
    return this.request<CampaignCollection>(`${path}${query}`);
  }

  async createCampaign(
    request: CreateCampaignRequest
  ): Promise<CreateCampaignResponse> {
    console.log("Creating campaign:", { request, url: `${BASE_URL}/` });

    const response = await this.request<CreateCampaignResponse>("/", {
      method: "POST",
      body: JSON.stringify(request),
    });

    console.log("Campaign created:", response);
    return response;
  }

  async updateCampaign(
    id: number,
    request: Partial<CreateCampaignRequest>
  ): Promise<Campaign> {
    return this.request<Campaign>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  }

  async deleteCampaign(id: number, deletedBy: number = 1): Promise<void> {
    console.log("Deleting campaign:", { id, deletedBy });
    return this.request<void>(`/${id}`, {
      method: "DELETE",
      body: JSON.stringify({
        deleted_by: deletedBy,
      }),
    });
  }

  async getCampaignById(
    id: string | number,
    skipCache?: boolean
  ): Promise<Campaign> {
    const params = new URLSearchParams();
    if (skipCache) params.append("skipCache", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<Campaign>(`/${id}${query}`);
  }

  /**
   * Get campaigns list with pagination from new backend
   */
  async getCampaigns(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    search?: string;
    skipCache?: boolean;
  }): Promise<GetCampaignsResponse> {
    const queryParams = new URLSearchParams();

    // Set defaults
    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;
    const skipCache = params?.skipCache ?? true;

    queryParams.append("limit", String(limit));
    queryParams.append("offset", String(offset));
    queryParams.append("skipCache", String(skipCache));

    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return this.request<GetCampaignsResponse>(`/${query}`);
  }

  async getAllCampaigns(params?: {
    search?: string;
    status?: string;
    approvalStatus?: string; // camelCase
    categoryId?: number; // camelCase
    programId?: number; // camelCase
    startDateFrom?: string; // camelCase
    startDateTo?: string; // camelCase
    sortBy?: string; // camelCase
    sortDirection?: "ASC" | "DESC"; // camelCase
    page?: number;
    pageSize?: number; // camelCase
    skipCache?: boolean; // camelCase
  }): Promise<CampaignResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert boolean to string "true"/"false"
          if (typeof value === "boolean") {
            queryParams.append(key, value ? "true" : "false");
          }
          // Keep numbers as strings (backend will parse)
          // Keep strings as strings
          else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return this.request<CampaignResponse>(`/all${query}`);
  }

  async getCampaignStats(
    skipCache: boolean = true
  ): Promise<CampaignStatsResponse> {
    const query = this.buildQueryString({ skipCache });
    return this.request<CampaignStatsResponse>(`/stats${query}`);
  }

  async getCampaignsActive(
    params?: CampaignListQuery
  ): Promise<CampaignCollection> {
    return this.getCollection("/active", params);
  }

  async getCampaignsExpired(
    params?: CampaignListQuery
  ): Promise<CampaignCollection> {
    return this.getCollection("/expired", params);
  }

  async getCampaignsUpcoming(
    params?: CampaignListQuery & { days?: number }
  ): Promise<CampaignCollection> {
    return this.getCollection("/upcoming", params);
  }

  async getCampaignsByStatus(
    status: CampaignStatus,
    params?: CampaignListQuery
  ): Promise<CampaignCollection> {
    return this.getCollection(`/status/${status}`, params);
  }

  async getPendingApprovalCampaigns(
    params?: CampaignListQuery
  ): Promise<CampaignCollection> {
    return this.getCollection("/pending-approval", params);
  }

  async getApprovedCampaigns(
    params?: CampaignListQuery
  ): Promise<CampaignCollection> {
    return this.getCollection("/approved", params);
  }

  async getRejectedCampaigns(
    params?: CampaignListQuery
  ): Promise<CampaignCollection> {
    return this.getCollection("/rejected", params);
  }

  async getCampaignsByCategory(
    categoryId: number,
    params?: CampaignListQuery
  ): Promise<CampaignCollection> {
    return this.getCollection(`/category/${categoryId}`, params);
  }

  async getCampaignsByProgram(
    programId: number,
    params?: CampaignListQuery
  ): Promise<CampaignCollection> {
    return this.getCollection(`/program/${programId}`, params);
  }

  async getCampaignsByManager(
    managerId: number,
    params?: CampaignListQuery
  ): Promise<CampaignCollection> {
    return this.getCollection(`/manager/${managerId}`, params);
  }

  async searchCampaigns(
    params: CampaignSearchQuery
  ): Promise<CampaignCollection> {
    const query = this.buildQueryString(params);
    return this.request<CampaignCollection>(`/search${query}`);
  }

  async superSearchCampaigns(
    params: CampaignSuperSearchQuery
  ): Promise<CampaignCollection> {
    const query = this.buildQueryString(params);
    return this.request<CampaignCollection>(`/super-search${query}`);
  }

  async getCampaignsByDateRange(
    params: CampaignDateRangeQuery
  ): Promise<CampaignCollection> {
    const query = this.buildQueryString(params);
    return this.request<CampaignCollection>(`/date-range${query}`);
  }

  async getCampaignsByBudgetRange(
    params: CampaignBudgetRangeQuery
  ): Promise<CampaignCollection> {
    const query = this.buildQueryString(params);
    return this.request<CampaignCollection>(`/budget-range${query}`);
  }

  async getCampaignByUuid(
    uuid: string,
    skipCache: boolean = true
  ): Promise<CampaignDetail> {
    const query = this.buildQueryString({ skipCache });
    return this.request<CampaignDetail>(`/uuid/${uuid}${query}`);
  }

  async getCampaignByName(
    name: string,
    skipCache: boolean = true
  ): Promise<CampaignDetail> {
    const query = this.buildQueryString({ skipCache });
    return this.request<CampaignDetail>(
      `/name/${encodeURIComponent(name)}${query}`
    );
  }

  async getCampaignByCode(
    code: string,
    skipCache: boolean = true
  ): Promise<CampaignDetail> {
    const query = this.buildQueryString({ skipCache });
    return this.request<CampaignDetail>(
      `/code/${encodeURIComponent(code)}${query}`
    );
  }

  async getCampaignSegments(
    id: number,
    skipCache: boolean = true
  ): Promise<CampaignSegmentsResponse> {
    const query = this.buildQueryString({ skipCache });
    return this.request<CampaignSegmentsResponse>(`/${id}/segments${query}`);
  }

  async getCampaignPerformance(
    id: number,
    skipCache: boolean = true
  ): Promise<CampaignPerformanceResponse> {
    const query = this.buildQueryString({ skipCache });
    return this.request<CampaignPerformanceResponse>(
      `/${id}/performance${query}`
    );
  }

  async getCampaignBudgetUtilisation(
    id: number,
    skipCache: boolean = true
  ): Promise<CampaignBudgetUtilResponse> {
    const query = this.buildQueryString({ skipCache });
    return this.request<CampaignBudgetUtilResponse>(
      `/${id}/budget-utilization${query}`
    );
  }

  async getCampaignParticipantUtilisation(
    id: number,
    skipCache: boolean = true
  ): Promise<CampaignParticipantUtilResponse> {
    const query = this.buildQueryString({ skipCache });
    return this.request<CampaignParticipantUtilResponse>(
      `/${id}/participant-utilization${query}`
    );
  }

  async runCampaign(request: RunCampaignRequest): Promise<RunCampaignResponse> {
    return this.request<RunCampaignResponse>("/run", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async validateCampaign(
    request: ValidateCampaignRequest
  ): Promise<ValidateCampaignResponse> {
    return this.request<ValidateCampaignResponse>("/validate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async submitForApproval(
    id: number,
    updatedBy: number = 1
  ): Promise<CampaignDetail> {
    console.log("Submitting campaign for approval:", { id, updatedBy });
    return this.request<CampaignDetail>(`/${id}/submit-approval`, {
      method: "PATCH",
      body: JSON.stringify({
        updated_by: updatedBy,
      }),
    });
  }

  async approveCampaign(
    id: number,
    approvedBy: number = 1
  ): Promise<CampaignDetail> {
    console.log("Approving campaign:", { id, approvedBy });
    return this.request<CampaignDetail>(`/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      }),
    });
  }

  async rejectCampaign(
    id: number,
    rejectedBy: number,
    rejectionReason: string
  ): Promise<CampaignDetail> {
    console.log("Rejecting campaign:", { id, rejectedBy, rejectionReason });
    return this.request<CampaignDetail>(`/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({
        rejected_by: rejectedBy,
        rejection_reason: rejectionReason,
        rejected_at: new Date().toISOString(),
      }),
    });
  }

  async activateCampaign(
    id: number,
    updatedBy: number = 1
  ): Promise<CampaignDetail> {
    console.log("Activating campaign:", { id, updatedBy });
    return this.request<CampaignDetail>(`/${id}/activate`, {
      method: "PATCH",
      body: JSON.stringify({
        updated_by: updatedBy,
      }),
    });
  }

  async pauseCampaign(
    id: number,
    payloadOrUpdatedBy: number | Record<string, unknown> = 1
  ): Promise<CampaignDetail> {
    const payload =
      typeof payloadOrUpdatedBy === "number"
        ? { updated_by: payloadOrUpdatedBy }
        : { updated_by: 1, ...payloadOrUpdatedBy };

    console.log("Pausing campaign:", { id, payload });
    return this.request<CampaignDetail>(`/${id}/pause`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async completeCampaign(
    id: number,
    updatedBy: number = 1
  ): Promise<CampaignDetail> {
    console.log("Completing campaign:", { id, updatedBy });
    return this.request<CampaignDetail>(`/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify({
        updated_by: updatedBy,
      }),
    });
  }

  async resumeCampaign(id: number): Promise<CampaignDetail> {
    return this.request<CampaignDetail>(`/${id}/resume`, {
      method: "PUT",
    });
  }

  async archiveCampaign(
    id: number,
    updatedBy: number = 1
  ): Promise<CampaignDetail> {
    console.log("Archiving campaign:", { id, updatedBy });
    return this.request<CampaignDetail>(`/${id}/archive`, {
      method: "PATCH",
      body: JSON.stringify({
        updated_by: updatedBy,
      }),
    });
  }

  async updateCampaignStatus(
    id: number,
    status: CampaignStatus,
    updatedBy: number = 1
  ): Promise<CampaignDetail> {
    return this.request<CampaignDetail>(`/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, updated_by: updatedBy }),
    });
  }

  async updateCampaignBudget(
    id: number,
    budget_allocated: number,
    updatedBy: number = 1
  ): Promise<CampaignDetail> {
    return this.request<CampaignDetail>(`/${id}/budget`, {
      method: "PATCH",
      body: JSON.stringify({ budget_allocated, updated_by: updatedBy }),
    });
  }

  async updateCampaignSpentBudget(
    id: number,
    amount: number,
    updatedBy: number = 1
  ): Promise<CampaignDetail> {
    return this.request<CampaignDetail>(`/${id}/spent-budget`, {
      method: "PATCH",
      body: JSON.stringify({ amount, updated_by: updatedBy }),
    });
  }

  async updateCampaignParticipants(
    id: number,
    current_participants: number,
    updatedBy: number = 1
  ): Promise<CampaignDetail> {
    return this.request<CampaignDetail>(`/${id}/participants`, {
      method: "PATCH",
      body: JSON.stringify({ current_participants, updated_by: updatedBy }),
    });
  }

  async updateControlGroup(
    id: number,
    payload: { enabled: boolean; percentage?: number; updated_by?: number }
  ): Promise<CampaignDetail> {
    const body = {
      updated_by: payload.updated_by ?? 1,
      enabled: payload.enabled,
      percentage: payload.percentage,
    };
    return this.request<CampaignDetail>(`/${id}/control-group`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async addCampaignSegment(
    id: number,
    payload: {
      segment_id: number;
      is_primary?: boolean;
      include_exclude?: "include" | "exclude";
      created_by?: number;
    }
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/segments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async cloneCampaign(
    id: number,
    request: CloneCampaignRequest
  ): Promise<CloneCampaignResponse> {
    return this.request<CloneCampaignResponse>(`/${id}/clone`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async cloneCampaignWithModifications(
    id: number,
    request: CloneCampaignWithModificationsRequest
  ): Promise<CloneCampaignWithModificationsResponse> {
    return this.request<CloneCampaignWithModificationsResponse>(
      `/${id}/clone-with-modifications`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  async duplicateCampaign(
    id: number,
    request: { newName: string }
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/duplicate`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Get campaign categories from new backend endpoint
   */
  async getCampaignCategories(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    skipCache?: boolean;
  }): Promise<GetCampaignCategoriesResponse> {
    const queryParams = new URLSearchParams();

    // Set defaults
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    const skipCache = params?.skipCache ?? false;

    queryParams.append("limit", String(limit));
    queryParams.append("offset", String(offset));
    if (skipCache) queryParams.append("skipCache", "true");

    if (params?.search) {
      queryParams.append("search", params.search);
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

    // Use campaign-categories endpoint instead of /categories
    const categoriesUrl = `${API_CONFIG.BASE_URL}/campaign-categories${query}`;

    const response = await fetch(categoriesUrl, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: categoriesUrl,
      });
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorBody}`
      );
    }

    return response.json();
  }

  async createCampaignCategory(request: {
    name: string;
    description?: string;
  }): Promise<Record<string, unknown>> {
    const categoriesUrl = `${API_CONFIG.BASE_URL}/campaign-categories`;

    const response = await fetch(categoriesUrl, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: categoriesUrl,
      });
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorBody}`
      );
    }

    return response.json();
  }

  async updateCampaignCategory(
    id: number,
    request: { name?: string; description?: string }
  ): Promise<Record<string, unknown>> {
    const categoriesUrl = `${API_CONFIG.BASE_URL}/campaign-categories/${id}`;

    console.log("Updating campaign category:", {
      id,
      request,
      url: categoriesUrl,
    });

    const response = await fetch(categoriesUrl, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    console.log("Update response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: categoriesUrl,
      });
      throw new Error(
        `Failed to update category: ${response.status} - ${errorBody}`
      );
    }

    // Check if response has content
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    // Return empty object if no JSON content
    return {};
  }

  async deleteCampaignCategory(id: number): Promise<void> {
    const categoriesUrl = `${API_CONFIG.BASE_URL}/campaign-categories/${id}`;

    console.log("Deleting campaign category:", { id, url: categoriesUrl });

    const response = await fetch(categoriesUrl, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    console.log("Delete response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: categoriesUrl,
      });
      throw new Error(
        `Failed to delete category: ${response.status} - ${errorBody}`
      );
    }

    // DELETE may not return a body, so we don't try to parse JSON
  }

  async linkCampaignToOffer(
    campaignId: number,
    request: { offer_id: number; created_by: number }
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      `/link-to-offer/${campaignId}`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  async exportCampaign(id: number): Promise<Blob> {
    const response = await fetch(`${BASE_URL}/${id}/export`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  async getApprovalHistory(
    id: number,
    skipCache?: boolean
  ): Promise<Record<string, unknown>[]> {
    const params = new URLSearchParams();
    if (skipCache) params.append("skipCache", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<Record<string, unknown>[]>(
      `/${id}/approval-history${query}`
    );
  }

  async getLifecycleHistory(
    id: number,
    skipCache?: boolean
  ): Promise<Record<string, unknown>[]> {
    const params = new URLSearchParams();
    if (skipCache) params.append("skipCache", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<Record<string, unknown>[]>(
      `/${id}/lifecycle-history${query}`
    );
  }

  /**
   * Execute a campaign
   */
  async executeCampaign(
    request: CampaignExecutionRequestPayload
  ): Promise<CampaignExecutionResponse> {
    console.log("Executing campaign:", request);

    return this.request<CampaignExecutionResponse>("/execute", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }
}

export const campaignService = new CampaignService();
export default campaignService;
