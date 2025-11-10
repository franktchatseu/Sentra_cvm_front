import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../../../shared/services/api';
import { Campaign, GetCampaignsResponse, GetCampaignCategoriesResponse } from '../types/campaign';
import { CreateCampaignRequest, CreateCampaignResponse } from '../types/createCampaign';
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

  async createCampaign(request: CreateCampaignRequest): Promise<CreateCampaignResponse> {
    console.log('Creating campaign:', { request, url: `${BASE_URL}/` });
    
    const response = await this.request<CreateCampaignResponse>('/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    console.log('Campaign created:', response);
    return response;
  }

  async updateCampaign(id: number, request: Partial<CreateCampaignRequest>): Promise<Campaign> {
    return this.request<Campaign>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteCampaign(id: number, deletedBy: number = 1): Promise<void> {
    console.log('Deleting campaign:', { id, deletedBy });
    return this.request<void>(`/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({
        deleted_by: deletedBy
      }),
    });
  }

  async getCampaignById(id: string | number, skipCache?: boolean): Promise<Campaign> {
    const params = new URLSearchParams();
    if (skipCache) params.append('skipCache', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
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
    
    queryParams.append('limit', String(limit));
    queryParams.append('offset', String(offset));
    queryParams.append('skipCache', String(skipCache));
    
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<GetCampaignsResponse>(`/${query}`);
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
          // Convert boolean to string "true"/"false"
          if (typeof value === 'boolean') {
            queryParams.append(key, value ? 'true' : 'false');
          } 
          // Keep numbers as strings (backend will parse)
          // Keep strings as strings
          else {
            queryParams.append(key, String(value));
          }
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

  async submitForApproval(id: number, updatedBy: number = 1): Promise<Record<string, unknown>> {
    console.log('Submitting campaign for approval:', { id, updatedBy });
    return this.request<Record<string, unknown>>(`/${id}/submit-approval`, {
      method: 'PATCH',
      body: JSON.stringify({
        updated_by: updatedBy
      }),
    });
  }

  async approveCampaign(id: number, approvedBy: number = 1): Promise<ApproveCampaignResponse> {
    console.log('Approving campaign:', { id, approvedBy });
    return this.request<ApproveCampaignResponse>(`/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      }),
    });
  }

  async rejectCampaign(id: number, rejectedBy: number, rejectionReason: string): Promise<RejectCampaignResponse> {
    console.log('Rejecting campaign:', { id, rejectedBy, rejectionReason });
    return this.request<RejectCampaignResponse>(`/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({
        rejected_by: rejectedBy,
        rejection_reason: rejectionReason,
        rejected_at: new Date().toISOString()
      }),
    });
  }

  async activateCampaign(id: number, updatedBy: number = 1): Promise<Record<string, unknown>> {
    console.log('Activating campaign:', { id, updatedBy });
    return this.request<Record<string, unknown>>(`/${id}/activate`, {
      method: 'PATCH',
      body: JSON.stringify({
        updated_by: updatedBy
      }),
    });
  }

  async pauseCampaign(id: number, updatedBy: number = 1): Promise<PauseCampaignResponse> {
    console.log('Pausing campaign:', { id, updatedBy });
    return this.request<PauseCampaignResponse>(`/${id}/pause`, {
      method: 'PATCH',
      body: JSON.stringify({
        updated_by: updatedBy
      }),
    });
  }

  async resumeCampaign(id: number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/resume`, {
      method: 'PUT',
    });
  }

  async archiveCampaign(id: number, updatedBy: number = 1): Promise<Record<string, unknown>> {
    console.log('Archiving campaign:', { id, updatedBy });
    return this.request<Record<string, unknown>>(`/${id}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({
        updated_by: updatedBy
      }),
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
    
    queryParams.append('limit', String(limit));
    queryParams.append('offset', String(offset));
    if (skipCache) queryParams.append('skipCache', 'true');
    
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    // Use campaign-categories endpoint instead of /categories
    const categoriesUrl = `${API_CONFIG.BASE_URL}/campaign-categories${query}`;
    
    const response = await fetch(categoriesUrl, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: categoriesUrl,
      });
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
    }

    return response.json();
  }

  async createCampaignCategory(request: { name: string; description?: string }): Promise<Record<string, unknown>> {
    const categoriesUrl = `${API_CONFIG.BASE_URL}/campaign-categories`;
    
    const response = await fetch(categoriesUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: categoriesUrl,
      });
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
    }

    return response.json();
  }

  async updateCampaignCategory(id: number, request: { name?: string; description?: string }): Promise<Record<string, unknown>> {
    const categoriesUrl = `${API_CONFIG.BASE_URL}/campaign-categories/${id}`;
    
    console.log('Updating campaign category:', { id, request, url: categoriesUrl });
    
    const response = await fetch(categoriesUrl, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    console.log('Update response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: categoriesUrl,
      });
      throw new Error(`Failed to update category: ${response.status} - ${errorBody}`);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    // Return empty object if no JSON content
    return {};
  }

  async deleteCampaignCategory(id: number): Promise<void> {
    const categoriesUrl = `${API_CONFIG.BASE_URL}/campaign-categories/${id}`;
    
    console.log('Deleting campaign category:', { id, url: categoriesUrl });
    
    const response = await fetch(categoriesUrl, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    console.log('Delete response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: categoriesUrl,
      });
      throw new Error(`Failed to delete category: ${response.status} - ${errorBody}`);
    }
    
    // DELETE may not return a body, so we don't try to parse JSON
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

  /**
   * Execute a campaign
   */
  async executeCampaign(request: {
    campaign_id: number;
    segments: Array<{
      segment_id: number;
      channel_codes: string[];
    }>;
    mode: 'immediate' | 'scheduled';
  }): Promise<Record<string, unknown>> {
    console.log('Executing campaign:', request);
    
    return this.request<Record<string, unknown>>('/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const campaignService = new CampaignService();
export default campaignService;