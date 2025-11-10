import { API_CONFIG, getAuthHeaders } from '../../../shared/services/api';
import {
  QuickListResponse,
  SingleQuickListResponse,
  QuickListDataResponse,
  ImportLogsResponse,
  UploadTypesResponse,
  CreateQuickListRequest,
  UpdateQuickListRequest,
  QuickListStatsResponse,
} from '../types/quicklist';

const BASE_URL = `${API_CONFIG.BASE_URL}/quicklists`;

class QuickListService {
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
      });
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
    }

    return response.json();
  }

  // QuickList Management
  async getAllQuickLists(params?: {
    upload_type?: string;
    limit?: number;
    offset?: number;
    skipCache?: boolean;
  }): Promise<QuickListResponse> {
    const queryParams = new URLSearchParams();
    // Always skip cache by default
    queryParams.append('skipCache', 'true');
    if (params) {
      if (params.upload_type) queryParams.append('upload_type', params.upload_type);
      if (params.limit) queryParams.append('limit', String(params.limit));
      if (params.offset) queryParams.append('offset', String(params.offset));
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<QuickListResponse>(`${query}`);
  }

  async getQuickListById(id: number, skipCache: boolean = true): Promise<SingleQuickListResponse> {
    const query = skipCache ? '?skipCache=true' : '';
    return this.request<SingleQuickListResponse>(`/${id}${query}`);
  }

  async getQuickListData(
    id: number,
    params?: {
      limit?: number;
      offset?: number;
      skipCache?: boolean;
    }
  ): Promise<QuickListDataResponse> {
    const queryParams = new URLSearchParams();
    // Always skip cache by default
    queryParams.append('skipCache', 'true');
    if (params) {
      if (params.limit) queryParams.append('limit', String(params.limit));
      if (params.offset) queryParams.append('offset', String(params.offset));
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<QuickListDataResponse>(`/${id}/data${query}`);
  }

  async getImportLogs(
    id: number,
    params?: {
      status?: 'success' | 'failed' | 'skipped';
      limit?: number;
      offset?: number;
    }
  ): Promise<ImportLogsResponse> {
    const queryParams = new URLSearchParams();
    // Always skip cache by default
    queryParams.append('skipCache', 'true');
    if (params) {
      if (params.status) queryParams.append('status', params.status);
      if (params.limit) queryParams.append('limit', String(params.limit));
      if (params.offset) queryParams.append('offset', String(params.offset));
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<ImportLogsResponse>(`/${id}/logs${query}`);
  }

  async createQuickList(request: CreateQuickListRequest): Promise<SingleQuickListResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('upload_type', request.upload_type);
    formData.append('name', request.name);
    if (request.description) {
      formData.append('description', request.description);
    }
    formData.append('created_by', request.created_by);

    // Try multiple possible endpoints until we find the right one
    const possibleEndpoints = [
      `${API_CONFIG.BASE_URL}/quicklists`,           // Standard REST endpoint
      `${API_CONFIG.BASE_URL}/quicklists/upload`,    // Specific upload endpoint
      `${API_CONFIG.BASE_URL}/upload`,               // General upload endpoint
      `${API_CONFIG.BASE_URL}/quicklists/create`,    // Alternative create endpoint
    ];

    // Debug logging
    console.log('FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(key + ':', value);
    }
    console.log('Request headers:', getAuthHeaders(false));

    let lastError: Error | null = null;

    for (const url of possibleEndpoints) {
      try {
        console.log('Trying URL:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          headers: getAuthHeaders(false), // Don't include Content-Type for multipart
        });

        if (response.ok) {
          console.log('✅ Success with URL:', url);
          return response.json();
        } else if (response.status !== 404) {
          // If it's not a 404, this might be the right endpoint but with a different error
          const errorBody = await response.text();
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorBody,
            url,
          });
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
        } else {
          console.log('❌ 404 for URL:', url);
        }
      } catch (error) {
        console.log('❌ Error for URL:', url, error);
        lastError = error as Error;
      }
    }

    // If we get here, none of the endpoints worked
    throw new Error(`All endpoints failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  async updateQuickList(id: number, request: UpdateQuickListRequest): Promise<SingleQuickListResponse> {
    return this.request<SingleQuickListResponse>(`/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  }

  async deleteQuickList(id: number): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Search
  async searchQuickLists(params: {
    q: string;
    upload_type?: string;
    created_by?: string;
    limit?: number;
    offset?: number;
    skipCache?: boolean;
  }): Promise<QuickListResponse> {
    const queryParams = new URLSearchParams();
    // Always skip cache by default
    queryParams.append('skipCache', 'true');
    queryParams.append('q', params.q);
    if (params.upload_type) queryParams.append('upload_type', params.upload_type);
    if (params.created_by) queryParams.append('created_by', params.created_by);
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.offset) queryParams.append('offset', String(params.offset));

    return this.request<QuickListResponse>(`/search?${queryParams.toString()}`);
  }

  // Export
  async exportQuickList(id: number, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const url = `${BASE_URL}/${id}/export?format=${format}&skipCache=true`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Upload Types
  async getUploadTypes(params?: {
    activeOnly?: boolean;
    skipCache?: boolean;
  }): Promise<UploadTypesResponse> {
    const queryParams = new URLSearchParams();
    // Always skip cache by default
    queryParams.append('skipCache', 'true');
    if (params) {
      if (params.activeOnly !== undefined) queryParams.append('activeOnly', String(params.activeOnly));
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<UploadTypesResponse>(`/upload-types${query}`);
  }

  // Statistics
  async getStats(params?: {
    upload_type?: string;
    created_by?: string;
    start_date?: string;
    end_date?: string;
    skipCache?: boolean;
  }): Promise<QuickListStatsResponse> {
    const queryParams = new URLSearchParams();
    // Always skip cache by default
    queryParams.append('skipCache', 'true');
    if (params) {
      if (params.upload_type) queryParams.append('upload_type', params.upload_type);
      if (params.created_by) queryParams.append('created_by', params.created_by);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<QuickListStatsResponse>(`/stats${query}`);
  }
}

export const quicklistService = new QuickListService();
export default quicklistService;
