import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api';

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
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get active campaigns count for dashboard stats
  async getActiveCampaignsCount(): Promise<number> {
    const response = await this.request<CampaignResponse>(`/?status=active&pageSize=1`);
    return response.meta.total;
  }
}

export const campaignService = new CampaignService();
export default campaignService;