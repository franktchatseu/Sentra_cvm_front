import { 
  Segment,
  SegmentFilters,
  SegmentSearchFilters,
  SegmentResponse,
  CreateSegmentRequest,
  UpdateSegmentRequest,
  DuplicateSegmentRequest,
  ValidateCriteriaRequest,
  SegmentRule,
  CreateSegmentRuleRequest,
  UpdateSegmentRuleRequest,
  ValidateRulesRequest,
  ComputeSegmentRequest,
  BatchComputeRequest,
  ComputationStatus,
  PreviewSegmentRequest,
  
  SegmentMembersResponse,
  AddSegmentMembersRequest,
  DeleteSegmentMembersRequest,
  SearchSegmentMembersRequest,
  ExportSegmentRequest,
  ExportStatus,
  SegmentCategory,
  CreateSegmentCategoryRequest,
  UpdateSegmentCategoryRequest,
  SegmentCategoriesResponse,
  ExportFormat
} from '../types/segment';
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
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private buildQueryParams(params: Record<string, unknown>): string {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          urlParams.append(key, value.join(','));
        } else if (typeof value === 'boolean') {
          urlParams.append(key, value.toString());
        } else {
          urlParams.append(key, String(value));
        }
      }
    });

    const queryString = urlParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // ==================== BASIC CRUD ====================

  /**
   * Get all segments with optional filters
   */
  async getSegments(filters?: SegmentFilters): Promise<SegmentResponse> {
    const queryString = this.buildQueryParams({
      search: filters?.search,
      categoryId: filters?.categoryId,
      type: filters?.type,
      page: filters?.page,
      pageSize: filters?.pageSize,
      sortBy: filters?.sortBy,
      sortDirection: filters?.sortDirection,
      skipCache: filters?.skipCache,
      tags: filters?.tags
    });
    
    return this.request<SegmentResponse>(`/${queryString}`);
  }

  /**
   * Search segments with advanced filters
   */
  async searchSegments(filters?: SegmentSearchFilters): Promise<SegmentResponse> {
    const queryParams = {
      q: filters?.q || '', // Ensure q is always present (required by backend)
      category: filters?.category,
      type: filters?.type,
      visibility: filters?.visibility,
      tags: filters?.tags,
      page: filters?.page,
      pageSize: filters?.pageSize,
      sortBy: filters?.sortBy,
      sortDirection: filters?.sortDirection,
      skipCache: filters?.skipCache
    };
    
    // Build query string manually to ensure q parameter is always included
    const urlParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          urlParams.append(key, value.join(','));
        } else if (typeof value === 'boolean') {
          urlParams.append(key, value.toString());
        } else {
          urlParams.append(key, String(value));
        }
      }
    });
    
    const queryString = urlParams.toString();
    const fullUrl = `/search?${queryString}`;
    
    return this.request<SegmentResponse>(fullUrl);
  }

  /**
   * Get segment by ID
   */
  async getSegmentById(id: number, skipCache: boolean = false): Promise<Segment> {
    const queryString = this.buildQueryParams({ skipCache });
    return this.request<Segment>(`/${id}${queryString}`);
  }

  /**
   * Create new segment
   */
  async createSegment(segment: CreateSegmentRequest): Promise<Segment> {
    return this.request<Segment>('/', {
      method: 'POST',
      body: JSON.stringify(segment),
    });
  }

  /**
   * Update existing segment
   */
  async updateSegment(id: number, segment: Partial<UpdateSegmentRequest>): Promise<Segment> {
    return this.request<Segment>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(segment),
    });
  }

  /**
   * Delete segment
   */
  async deleteSegment(id: number): Promise<void> {
    return this.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Duplicate segment
   */
  async duplicateSegment(id: number, request: DuplicateSegmentRequest): Promise<Segment> {
    return this.request<Segment>(`/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ==================== VALIDATION ====================

  /**
   * Validate segment criteria
   */
  async validateCriteria(request: ValidateCriteriaRequest): Promise<{ valid: boolean; errors?: string[] }> {
    return this.request<{ valid: boolean; errors?: string[] }>('/validate-criteria', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ==================== RULES MANAGEMENT ====================

  /**
   * Get segment rules
   */
  async getSegmentRules(segmentId: number): Promise<SegmentRule[]> {
    return this.request<SegmentRule[]>(`/${segmentId}/srules`);
  }

  /**
   * Create segment rule
   */
  async createSegmentRule(segmentId: number, request: CreateSegmentRuleRequest): Promise<SegmentRule> {
    return this.request<SegmentRule>(`/${segmentId}/srules`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Update segment rule
   */
  async updateSegmentRule(
    segmentId: number, 
    ruleId: number, 
    request: UpdateSegmentRuleRequest
  ): Promise<SegmentRule> {
    return this.request<SegmentRule>(`/${segmentId}/srules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  /**
   * Delete segment rule
   */
  async deleteSegmentRule(segmentId: number, ruleId: number): Promise<void> {
    return this.request<void>(`/${segmentId}/srules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Validate rules
   */
  async validateRules(request: ValidateRulesRequest): Promise<{ valid: boolean; errors?: string[] }> {
    return this.request<{ valid: boolean; errors?: string[] }>('/rules/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ==================== COMPUTATION ====================

  /**
   * Compute segment
   */
  async computeSegment(id: number, request?: ComputeSegmentRequest): Promise<ComputationStatus> {
    return this.request<ComputationStatus>(`/${id}/compute`, {
      method: 'POST',
      body: JSON.stringify(request || {}),
    });
  }

  /**
   * Batch compute segments
   */
  async batchCompute(request: BatchComputeRequest): Promise<ComputationStatus> {
    return this.request<ComputationStatus>('/batch-compute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get computation status
   */
  async getComputationStatus(segmentId: number, jobId: string): Promise<ComputationStatus> {
    return this.request<ComputationStatus>(`/${segmentId}/computation-status/${jobId}`);
  }

  // ==================== PREVIEW ====================

  /**
   * Preview segment
   */
  async previewSegment(id: number, request?: PreviewSegmentRequest): Promise<{ 
    data: Record<string, unknown>[]; 
    count: number; 
    preview_id?: string;
  }> {
    return this.request<{ data: Record<string, unknown>[]; count: number; preview_id?: string }>(`/${id}/preview`, {
      method: 'POST',
      body: JSON.stringify(request || {}),
    });
  }

  /**
   * Get preview count
   */
  async getPreviewCount(id: number, criteriaOverride?: Record<string, unknown>): Promise<{ count: number }> {
    const queryString = criteriaOverride 
      ? this.buildQueryParams({ criteria_override: JSON.stringify(criteriaOverride) })
      : '';
    return this.request<{ count: number }>(`/${id}/preview/count${queryString}`);
  }

  /**
   * Get preview sample
   */
  async getPreviewSample(segmentId: number, previewId: string): Promise<{ data: Record<string, unknown>[] }> {
    return this.request<{ data: Record<string, unknown>[] }>(`/${segmentId}/preview/sample/${previewId}`, {
      method: 'POST',
    });
  }

  // ==================== MEMBERS MANAGEMENT ====================

  /**
   * Get segment members
   */
  async getSegmentMembers(
    id: number, 
    page: number = 1, 
    pageSize: number = 10, 
    skipCache: boolean = false
  ): Promise<SegmentMembersResponse> {
    const queryString = this.buildQueryParams({ page, pageSize, skipCache });
    return this.request<SegmentMembersResponse>(`/${id}/members${queryString}`);
  }

  /**
   * Add segment members
   */
  async addSegmentMembers(id: number, request: AddSegmentMembersRequest): Promise<{ 
    success: boolean; 
    added_count: number; 
  }> {
    return this.request<{ success: boolean; added_count: number }>(`/${id}/members`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Delete segment members
   */
  async deleteSegmentMembers(id: number, request: DeleteSegmentMembersRequest): Promise<{ 
    success: boolean; 
    removed_count: number; 
  }> {
    return this.request<{ success: boolean; removed_count: number }>(`/${id}/members`, {
      method: 'DELETE',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get segment members count
   */
  async getSegmentMembersCount(id: number, skipCache: boolean = false): Promise<{ count: number }> {
    const queryString = this.buildQueryParams({ skipCache });
    return this.request<{ count: number }>(`/${id}/members/count${queryString}`);
  }

  /**
   * Search segment members
   */
  async searchSegmentMembers(
    id: number, 
    request: SearchSegmentMembersRequest
  ): Promise<SegmentMembersResponse> {
    return this.request<SegmentMembersResponse>(`/${id}/members/search`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ==================== EXPORT ====================

  /**
   * Export segment
   */
  async exportSegment(id: number, format: ExportFormat = 'json'): Promise<Blob> {
    const queryString = this.buildQueryParams({ format });
    const url = `${BASE_URL}/${id}/export${queryString}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  /**
   * Custom export
   */
  async customExport(id: number, request: ExportSegmentRequest): Promise<ExportStatus> {
    return this.request<ExportStatus>(`/${id}/export/custom`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get export status
   */
  async getExportStatus(segmentId: number, jobId: string): Promise<ExportStatus> {
    return this.request<ExportStatus>(`/${segmentId}/export-status/${jobId}`);
  }

  // ==================== CATEGORIES ====================

  /**
   * Get segment categories
   */
  async getSegmentCategories(search?: string, skipCache: boolean = false): Promise<SegmentCategoriesResponse> {
    const queryString = this.buildQueryParams({ search, skipCache });
    return this.request<SegmentCategoriesResponse>(`/categories${queryString}`);
  }

  /**
   * Create segment category
   */
  async createSegmentCategory(request: CreateSegmentCategoryRequest): Promise<SegmentCategory> {
    return this.request<SegmentCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Update segment category
   */
  async updateSegmentCategory(
    id: number, 
    request: UpdateSegmentCategoryRequest
  ): Promise<SegmentCategory> {
    return this.request<SegmentCategory>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  /**
   * Delete segment category
   */
  async deleteSegmentCategory(id: number): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== LEGACY/COMPATIBILITY ====================

  /**
   * Get segment customer count (preview) - Legacy method
   * @deprecated Use previewSegment or getPreviewCount instead
   */
  async getSegmentPreview(conditions: Record<string, unknown>[]): Promise<{ count: number }> {
    return this.request<{ count: number }>('/preview', {
      method: 'POST',
      body: JSON.stringify({ conditions }),
    });
  }

  /**
   * Toggle segment active status - Custom endpoint (not in spec)
   * May need to be implemented via updateSegment
   */
  async toggleSegmentStatus(id: number, isActive: boolean): Promise<Segment> {
    // Try custom endpoint first
    try {
      return await this.request<Segment>(`/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive }),
      });
    } catch {
      // Fallback to standard update if custom endpoint doesn't exist
      return this.updateSegment(id, { is_active: isActive });
    }
  }
}

export const segmentService = new SegmentService();
