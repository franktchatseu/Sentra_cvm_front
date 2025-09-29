import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api';
import { CreateCampaignRequest, Campaign } from '../types/campaign';

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
      throw new Error(`HTTP error! status: ${response.status}`);
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

  async getCampaignById(id: string): Promise<Campaign> {
    return this.request<Campaign>(`/${id}`);
  }

  async getAllCampaigns(): Promise<CampaignResponse> {
    return this.request<CampaignResponse>('/all');
  }

  // Campaign execution
  async runCampaign(id: number, request: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/run`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async validateCampaign(id: number, request: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Approval workflow
  async approveCampaign(id: number, request: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async rejectCampaign(id: number, request: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  // Campaign lifecycle
  async pauseCampaign(id: number, request: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/pause`, {
      method: 'PUT',
      body: JSON.stringify(request),
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

  // Campaign cloning
  async cloneCampaign(id: number, request: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async duplicateCampaign(id: number, request: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Campaign categories
  async getCampaignCategories(): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>('/categories');
  }

  async createCampaignCategory(request: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/categories', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateCampaignCategory(id: number, request: Record<string, unknown>): Promise<Record<string, unknown>> {
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

  // Campaign linking
  async linkCampaignToOffer(campaignId: number, request: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/${campaignId}/link-offer`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Export and history
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

  async downloadCampaignData(id: number, filename?: string): Promise<void> {
    const blob = await this.exportCampaign(id);
    const defaultFilename = `campaign-${id}-data.csv`;
    const finalFilename = filename || defaultFilename;
    
    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async getApprovalHistory(id: number): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(`/${id}/approval-history`);
  }

  async getLifecycleHistory(id: number): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(`/${id}/lifecycle-history`);
  }
}

export const campaignService = new CampaignService();
export default campaignService;