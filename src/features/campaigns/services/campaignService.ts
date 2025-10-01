import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../../../shared/services/api';
import { CreateCampaignRequest, Campaign } from '../types/campaign';
import { 
  RunCampaignRequest, 
  RunCampaignResponse,
  ValidateCampaignRequest,
  ValidateCampaignResponse,
  CloneCampaignWithModificationsRequest,
  CloneCampaignWithModificationsResponse,
  CloneCampaignRequest,
  CloneCampaignResponse,
  ApproveCampaignRequest,
  ApproveCampaignResponse,
  RejectCampaignRequest,
  RejectCampaignResponse,
  PauseCampaignRequest,
  PauseCampaignResponse,
} from '../types';

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
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url,
        params: options.body
      });
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
    }

    return response.json();
  }

  async createCampaign(request: CreateCampaignRequest): Promise<Campaign> {
    return this.request<Campaign>('/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateCampaign(id: number, request: Partial<CreateCampaignRequest>): Promise<Campaign> {
    return this.request<Campaign>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteCampaign(id: number): Promise<void> {
    return this.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  async getCampaignById(id: string | number, skipCache?: boolean): Promise<Campaign> {
    const params = new URLSearchParams();
    if (skipCache) params.append('skipCache', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Campaign>(`/${id}${query}`);
  }

  async getAllCampaigns(params?: {
    search?: string;
    status?: string;
    approvalStatus?: string;        // camelCase
    categoryId?: number;            // camelCase
    programId?: number;             // camelCase
    startDateFrom?: string;         // camelCase
    startDateTo?: string;           // camelCase
    sortBy?: string;                // camelCase
    sortDirection?: 'ASC' | 'DESC'; // camelCase
    page?: number;
    pageSize?: number;              // camelCase
    skipCache?: boolean;            // camelCase
  }): Promise<CampaignResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<CampaignResponse>(`/all${query}`);
  }

  async runCampaign(request: RunCampaignRequest): Promise<RunCampaignResponse> {
    return this.request<RunCampaignResponse>('/run', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async validateCampaign(request: ValidateCampaignRequest): Promise<ValidateCampaignResponse> {
    return this.request<ValidateCampaignResponse>('/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async approveCampaign(id: number, request?: ApproveCampaignRequest): Promise<ApproveCampaignResponse> {
    return this.request<ApproveCampaignResponse>(`/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify(request || {}),
    });
  }

  async rejectCampaign(id: number, request: RejectCampaignRequest): Promise<RejectCampaignResponse> {
    return this.request<RejectCampaignResponse>(`/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async activateCampaign(id: number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/activate`, {
      method: 'PUT',
    });
  }

  async pauseCampaign(id: number, request?: PauseCampaignRequest): Promise<PauseCampaignResponse> {
    return this.request<PauseCampaignResponse>(`/${id}/pause`, {
      method: 'PUT',
      body: JSON.stringify(request || {}),
    });
  }

  async resumeCampaign(id: number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/resume`, {
      method: 'PUT',
    });
  }

  async archiveCampaign(id: number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/archive`, {
      method: 'PUT',
    });
  }

  async cloneCampaign(id: number, request: CloneCampaignRequest): Promise<CloneCampaignResponse> {
    return this.request<CloneCampaignResponse>(`/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async cloneCampaignWithModifications(id: number, request: CloneCampaignWithModificationsRequest): Promise<CloneCampaignWithModificationsResponse> {
    return this.request<CloneCampaignWithModificationsResponse>(`/${id}/clone-with-modifications`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async duplicateCampaign(id: number, request: { newName: string }): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getCampaignCategories(params?: { search?: string; skipCache?: boolean }): Promise<Record<string, unknown>[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.skipCache) queryParams.append('skipCache', 'true');
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<Record<string, unknown>[]>(`/categories${query}`);
  }

  async createCampaignCategory(request: { name: string; description?: string }): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/categories', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateCampaignCategory(id: number, request: { name?: string; description?: string }): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteCampaignCategory(id: number): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async linkCampaignToOffer(campaignId: number, request: { offer_id: number; created_by: number }): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/link-to-offer/${campaignId}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async exportCampaign(id: number): Promise<Blob> {
    const response = await fetch(`${BASE_URL}/${id}/export`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

 

  async getApprovalHistory(id: number, skipCache?: boolean): Promise<Record<string, unknown>[]> {
    const params = new URLSearchParams();
    if (skipCache) params.append('skipCache', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Record<string, unknown>[]>(`/${id}/approval-history${query}`);
  }

  async getLifecycleHistory(id: number, skipCache?: boolean): Promise<Record<string, unknown>[]> {
    const params = new URLSearchParams();
    if (skipCache) params.append('skipCache', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Record<string, unknown>[]>(`/${id}/lifecycle-history${query}`);
  }
}

export const campaignService = new CampaignService();
export default campaignService;