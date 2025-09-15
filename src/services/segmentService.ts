import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api';

export interface SegmentResponse {
  success: boolean;
  data: unknown[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const BASE_URL = buildApiUrl(API_CONFIG.ENDPOINTS.SEGMENTS);

class SegmentService {
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

  // Get total count of segments for dashboard stats
  async getTotalSegments(): Promise<number> {
    const response = await this.request<SegmentResponse>(`/?pageSize=1`);
    return response.meta.total;
  }
}

export const segmentService = new SegmentService();
export default segmentService;