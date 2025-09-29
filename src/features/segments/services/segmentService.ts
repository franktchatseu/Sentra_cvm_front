import { 
  Segment, 
  SegmentFilters, 
  SegmentResponse, 
  CreateSegmentRequest, 
  UpdateSegmentRequest 
} from '../../../shared/types/segment';
import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../../../shared/services/api';

const BASE_URL = buildApiUrl(API_CONFIG.ENDPOINTS.SEGMENTS || '/segments');

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all segments with optional filters
  async getSegments(filters?: SegmentFilters): Promise<SegmentResponse> {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    
    // Note: Backend API doesn't support active status filtering
    // if (filters?.is_active !== undefined) {
    //   params.append('active', filters.is_active.toString());
    // }

    const queryString = params.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    return this.request<SegmentResponse>(endpoint);
  }

  // Get segment by ID
  async getSegmentById(id: number): Promise<Segment> {
    return this.request<Segment>(`/${id}`);
  }

  // Create new segment
  async createSegment(segment: CreateSegmentRequest): Promise<Segment> {
    return this.request<Segment>('', {
      method: 'POST',
      body: JSON.stringify(segment),
    });
  }

  // Update existing segment
  async updateSegment(id: number, segment: Partial<UpdateSegmentRequest>): Promise<Segment> {
    return this.request<Segment>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(segment),
    });
  }

  // Delete segment
  async deleteSegment(id: number): Promise<void> {
    return this.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Get segment customer count (preview)
  async getSegmentPreview(conditions: any[]): Promise<{ count: number }> {
    return this.request<{ count: number }>('/preview', {
      method: 'POST',
      body: JSON.stringify({ conditions }),
    });
  }

  // Toggle segment active status
  async toggleSegmentStatus(id: number, isActive: boolean): Promise<Segment> {
    return this.request<Segment>(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  }
}

export const segmentService = new SegmentService();
