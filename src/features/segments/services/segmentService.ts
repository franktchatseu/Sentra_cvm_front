import {
  SegmentType,
  SegmentCategoryType,
  SegmentRuleType,
  SegmentMemberType,
  CreateSegmentRequest,
  UpdateSegmentRequest,
  CreateSegmentCategoryRequest,
  UpdateSegmentCategoryRequest,
  AddSegmentMembersRequest,
  DeleteSegmentMembersRequest,
  CreateSegmentRuleRequest,
  UpdateSegmentRuleRequest,
  DuplicateSegmentRequest,
  ValidateCriteriaRequest,
  ValidateRulesRequest,
  ComputeSegmentRequest,
  BatchComputeRequest,
  PreviewSegmentRequest,
  SearchSegmentMembersRequest,
  CustomExportRequest,
  SearchSegmentsQuery,
  GetSegmentsQuery,
  GetSegmentMembersQuery,
  ApiSuccessResponse,
  PaginatedResponse,
  SegmentResponse,
  SegmentCategoriesResponse,
  SegmentMembersResponse,
  ComputationStatusResponse,
  ExportStatusResponse,
  PreviewResponse,
  PreviewSampleResponse,
  ExportSegmentQuery,
  ExportFormatEnum,
  // New Analytics Types
  HealthSummaryResponse,
  CreationTrendResponse,
  TypeDistributionResponse,
  CategoryDistributionResponse,
  LargestSegmentsResponse,
  StaleSegmentsResponse,
  // Advanced Types
  SegmentHierarchyResponse,
  GrowthTrendResponse,
  PerformanceMetricsResponse,
  UsageInCampaignsResponse,
  SegmentOverlapResponse,
  // Activation Types
  BatchActivationRequest,
  BatchActivationResponse,
  // Advanced Search
  AdvancedSearchQuery,
  // Tag Management
  TagManagementRequest,
  TagManagementResponse,
  // Query Management
  QueryUpdateRequest,
  QueryValidationResponse,
  // Size Estimation
  SizeEstimateRequest,
  SizeEstimateResponse,
} from "../types/segment";
import {
  API_CONFIG,
  buildApiUrl,
  getAuthHeaders,
} from "../../../shared/services/api";

const BASE_URL = buildApiUrl(API_CONFIG.ENDPOINTS.SEGMENTS || "/segments");
const CATEGORIES_BASE_URL = buildApiUrl("/segment-categories");

class SegmentService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    console.log("Making request to:", url);

    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      } catch (err) {
        if (err instanceof Error) {
          throw err;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    return response.json();
  }

  private async requestCategories<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${CATEGORIES_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      } catch (err) {
        if (err instanceof Error) {
          throw err;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    return response.json();
  }

  private buildQueryParams(params: Record<string, unknown>): string {
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          urlParams.append(key, value.join(","));
        } else if (typeof value === "boolean") {
          urlParams.append(key, value.toString());
        } else {
          urlParams.append(key, String(value));
        }
      }
    });

    const queryString = urlParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  // ==================== SEGMENT CATEGORIES (8 endpoints) ====================

  /**
   * GET /segment-categories/ - Get all categories
   */
  async getSegmentCategories(
    search?: string,
    skipCache: boolean = false
  ): Promise<SegmentCategoriesResponse> {
    const queryString = this.buildQueryParams({ search, skipCache });
    return this.requestCategories<SegmentCategoriesResponse>(`${queryString}`);
  }

  /**
   * GET /segment-categories/search - Search by name
   */
  async searchSegmentCategories(
    query: string,
    skipCache: boolean = false
  ): Promise<SegmentCategoriesResponse> {
    const queryString = this.buildQueryParams({ q: query, skipCache });
    return this.requestCategories<SegmentCategoriesResponse>(
      `/search${queryString}`
    );
  }

  /**
   * GET /segment-categories/super-search - Advanced search with multiple filters
   */
  async superSearchSegmentCategories(
    filters: AdvancedSearchQuery,
    skipCache: boolean = false
  ): Promise<SegmentCategoriesResponse> {
    const queryString = this.buildQueryParams({ ...filters, skipCache });
    return this.requestCategories<SegmentCategoriesResponse>(
      `/super-search${queryString}`
    );
  }

  /**
   * GET /segment-categories/check-name - Check if name exists
   */
  async checkSegmentCategoryName(
    name: string,
    excludeId?: number
  ): Promise<ApiSuccessResponse<{ exists: boolean; available: boolean }>> {
    const queryString = this.buildQueryParams({ name, exclude_id: excludeId });
    return this.requestCategories<
      ApiSuccessResponse<{ exists: boolean; available: boolean }>
    >(`/check-name${queryString}`);
  }

  /**
   * GET /segment-categories/:id - Get category by ID
   */
  async getSegmentCategoryById(
    id: number,
    skipCache: boolean = false
  ): Promise<ApiSuccessResponse<SegmentCategoryType>> {
    const queryString = this.buildQueryParams({ skipCache });
    return this.requestCategories<ApiSuccessResponse<SegmentCategoryType>>(
      `/${id}${queryString}`
    );
  }

  /**
   * POST /segment-categories/ - Create category
   */
  async createSegmentCategory(
    request: CreateSegmentCategoryRequest
  ): Promise<ApiSuccessResponse<SegmentCategoryType>> {
    return this.requestCategories<ApiSuccessResponse<SegmentCategoryType>>("", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * PUT /segment-categories/:id - Update category
   */
  async updateSegmentCategory(
    id: number,
    request: UpdateSegmentCategoryRequest
  ): Promise<ApiSuccessResponse<SegmentCategoryType>> {
    return this.requestCategories<ApiSuccessResponse<SegmentCategoryType>>(
      `/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * DELETE /segment-categories/:id - Delete category
   */
  async deleteSegmentCategory(id: number): Promise<void> {
    return this.requestCategories<void>(`/${id}`, {
      method: "DELETE",
    });
  }

  // ==================== CORE SEGMENTS (8 endpoints) ====================

  /**
   * GET /segments/ - Get all segments (with pagination/filtering)
   */
  async getSegments(
    filters?: GetSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams({
      search: filters?.search,
      categoryId: filters?.categoryId,
      type: filters?.type,
      skipCache: filters?.skipCache,
    });

    return this.request<PaginatedResponse<SegmentType>>(`/${queryString}`);
  }

  /**
   * POST /segments/ - Create segment
   */
  async createSegment(
    segment: CreateSegmentRequest
  ): Promise<ApiSuccessResponse<SegmentType>> {
    return this.request<ApiSuccessResponse<SegmentType>>("/", {
      method: "POST",
      body: JSON.stringify(segment),
    });
  }

  /**
   * GET /segments/:id - Get segment by ID
   */
  async getSegmentById(
    id: number,
    skipCache: boolean = false
  ): Promise<ApiSuccessResponse<SegmentType>> {
    const queryString = this.buildQueryParams({ skipCache });
    return this.request<ApiSuccessResponse<SegmentType>>(
      `/${id}${queryString}`
    );
  }

  /**
   * PUT /segments/:id - Update segment
   */
  async updateSegment(
    id: number,
    segment: Partial<UpdateSegmentRequest>
  ): Promise<ApiSuccessResponse<SegmentType>> {
    return this.request<ApiSuccessResponse<SegmentType>>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(segment),
    });
  }

  /**
   * DELETE /segments/:id - Delete segment
   */
  async deleteSegment(id: number): Promise<void> {
    return this.request<void>(`/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * POST /segments/:id/duplicate - Duplicate segment
   */
  async duplicateSegment(
    id: number,
    request: DuplicateSegmentRequest
  ): Promise<ApiSuccessResponse<SegmentType>> {
    return this.request<ApiSuccessResponse<SegmentType>>(`/${id}/duplicate`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * GET /segments/search - Search segments
   */
  async searchSegments(
    query: SearchSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams({
      q: query.q,
      category: query.category,
      type: query.type,
      visibility: query.visibility,
      tags: query.tags,
      skipCache: query.skipCache,
    });

    return this.request<PaginatedResponse<SegmentType>>(
      `/search${queryString}`
    );
  }

  /**
   * POST /segments/validate-criteria - Validate segment criteria
   */
  async validateCriteria(
    request: ValidateCriteriaRequest
  ): Promise<ApiSuccessResponse<{ valid: boolean; errors?: string[] }>> {
    return this.request<
      ApiSuccessResponse<{ valid: boolean; errors?: string[] }>
    >("/validate-criteria", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // ==================== ANALYTICS ENDPOINTS (7 endpoints) ====================

  /**
   * GET /segments/stats/health-summary - Get health summary
   */
  async getHealthSummary(): Promise<ApiSuccessResponse<HealthSummaryResponse>> {
    return this.request<ApiSuccessResponse<HealthSummaryResponse>>(
      "/stats/health-summary"
    );
  }

  /**
   * GET /segments/stats/creation-trend - Get creation trend
   */
  async getCreationTrend(
    period?: string,
    days?: number
  ): Promise<ApiSuccessResponse<CreationTrendResponse>> {
    const queryString = this.buildQueryParams({ period, days });
    return this.request<ApiSuccessResponse<CreationTrendResponse>>(
      `/stats/creation-trend${queryString}`
    );
  }

  /**
   * GET /segments/stats/type-distribution - Get type distribution
   */
  async getTypeDistribution(): Promise<
    ApiSuccessResponse<TypeDistributionResponse>
  > {
    return this.request<ApiSuccessResponse<TypeDistributionResponse>>(
      "/stats/type-distribution"
    );
  }

  /**
   * GET /segments/stats/category-distribution - Get category distribution
   */
  async getCategoryDistribution(): Promise<
    ApiSuccessResponse<CategoryDistributionResponse[]>
  > {
    return this.request<ApiSuccessResponse<CategoryDistributionResponse[]>>(
      "/stats/category-distribution"
    );
  }

  /**
   * GET /segments/stats/largest - Get largest segments
   */
  async getLargestSegments(
    limit: number = 10
  ): Promise<ApiSuccessResponse<LargestSegmentsResponse[]>> {
    const queryString = this.buildQueryParams({ limit });
    return this.request<ApiSuccessResponse<LargestSegmentsResponse[]>>(
      `/stats/largest${queryString}`
    );
  }

  /**
   * GET /segments/stats/stale - Get stale segments
   */
  async getStaleSegments(
    daysThreshold: number = 7
  ): Promise<ApiSuccessResponse<StaleSegmentsResponse[]>> {
    const queryString = this.buildQueryParams({
      days_threshold: daysThreshold,
    });
    return this.request<ApiSuccessResponse<StaleSegmentsResponse[]>>(
      `/stats/stale${queryString}`
    );
  }

  /**
   * GET /segments/stats - Get general segment statistics
   */
  async getSegmentStats(
    skipCache: boolean = false
  ): Promise<ApiSuccessResponse<any>> {
    const queryString = this.buildQueryParams({ skipCache });
    return this.request<ApiSuccessResponse<any>>(`/stats${queryString}`);
  }

  // ==================== QUERY GENERATION ENDPOINTS (2 endpoints) ====================

  /**
   * POST /segments/generate-query/preview - Generate segment query preview
   */
  async generateQueryPreview(request: {
    criteria: any;
  }): Promise<ApiSuccessResponse<{ query: string; preview: any }>> {
    return this.request<ApiSuccessResponse<{ query: string; preview: any }>>(
      "/generate-query/preview",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * POST /segments/recompute-segment-members - Recompute segment members
   */
  async recomputeSegmentMembers(request: {
    segment_ids?: number[];
    force?: boolean;
  }): Promise<ApiSuccessResponse<{ recomputed: number; message: string }>> {
    return this.request<
      ApiSuccessResponse<{ recomputed: number; message: string }>
    >("/recompute-segment-members", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // ==================== CATEGORIES (NESTED UNDER /segments) (6 endpoints) ====================

  /**
   * GET /segments/categories/name/:name - Get category by name
   */
  async getSegmentCategoryByNameNested(
    name: string,
    skipCache: boolean = false
  ): Promise<ApiSuccessResponse<SegmentCategoryType>> {
    const queryString = this.buildQueryParams({ skipCache });
    return this.request<ApiSuccessResponse<SegmentCategoryType>>(
      `/categories/name/${encodeURIComponent(name)}${queryString}`
    );
  }

  /**
   * GET /segments/categories/:id - Get category by ID
   */
  async getSegmentCategoryByIdNested(
    id: number,
    skipCache: boolean = false
  ): Promise<ApiSuccessResponse<SegmentCategoryType>> {
    const queryString = this.buildQueryParams({ skipCache });
    return this.request<ApiSuccessResponse<SegmentCategoryType>>(
      `/categories/${id}${queryString}`
    );
  }

  /**
   * GET /segments/categories - Get all categories
   */
  async getSegmentCategoriesNested(
    skipCache: boolean = false
  ): Promise<SegmentCategoriesResponse> {
    const queryString = this.buildQueryParams({ skipCache });
    return this.request<SegmentCategoriesResponse>(`/categories${queryString}`);
  }

  /**
   * POST /segments/categories - Create category
   */
  async createSegmentCategoryNested(
    request: CreateSegmentCategoryRequest
  ): Promise<ApiSuccessResponse<SegmentCategoryType>> {
    return this.request<ApiSuccessResponse<SegmentCategoryType>>(
      "/categories",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * PUT /segments/categories/:id - Update category
   */
  async updateSegmentCategoryNested(
    id: number,
    request: UpdateSegmentCategoryRequest
  ): Promise<ApiSuccessResponse<SegmentCategoryType>> {
    return this.request<ApiSuccessResponse<SegmentCategoryType>>(
      `/categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * DELETE /segments/categories/:id - Delete category
   */
  async deleteSegmentCategoryNested(id: number): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // ==================== ACTIVATION ENDPOINTS (4 endpoints) ====================

  /**
   * PATCH /segments/:id/activate - Activate segment
   */
  async activateSegment(id: number): Promise<ApiSuccessResponse<SegmentType>> {
    return this.request<ApiSuccessResponse<SegmentType>>(`/${id}/activate`, {
      method: "PATCH",
    });
  }

  /**
   * PATCH /segments/:id/deactivate - Deactivate segment
   */
  async deactivateSegment(
    id: number
  ): Promise<ApiSuccessResponse<SegmentType>> {
    return this.request<ApiSuccessResponse<SegmentType>>(`/${id}/deactivate`, {
      method: "PATCH",
    });
  }

  /**
   * POST /segments/batch/activate - Batch activate segments
   */
  async batchActivateSegments(
    request: BatchActivationRequest
  ): Promise<ApiSuccessResponse<BatchActivationResponse>> {
    return this.request<ApiSuccessResponse<BatchActivationResponse>>(
      "/batch/activate",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * POST /segments/batch/deactivate - Batch deactivate segments
   */
  async batchDeactivateSegments(
    request: BatchActivationRequest
  ): Promise<ApiSuccessResponse<BatchActivationResponse>> {
    return this.request<ApiSuccessResponse<BatchActivationResponse>>(
      "/batch/deactivate",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  // ==================== ADVANCED ENDPOINTS (12 endpoints) ====================

  /**
   * GET /segments/active - Get active segments
   */
  async getActiveSegments(
    filters?: GetSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams(filters || {});
    return this.request<PaginatedResponse<SegmentType>>(
      `/active${queryString}`
    );
  }

  /**
   * GET /segments/parents - Get parent segments
   */
  async getParentSegments(
    filters?: GetSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams(filters || {});
    return this.request<PaginatedResponse<SegmentType>>(
      `/parents${queryString}`
    );
  }

  /**
   * GET /segments/empty - Get empty segments
   */
  async getEmptySegments(
    filters?: GetSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams(filters || {});
    return this.request<PaginatedResponse<SegmentType>>(`/empty${queryString}`);
  }

  /**
   * GET /segments/most-used - Get most used segments
   */
  async getMostUsedSegments(
    limit: number = 10
  ): Promise<ApiSuccessResponse<SegmentType[]>> {
    const queryString = this.buildQueryParams({ limit });
    return this.request<ApiSuccessResponse<SegmentType[]>>(
      `/most-used${queryString}`
    );
  }

  /**
   * GET /segments/needing-refresh - Get segments needing refresh
   */
  async getSegmentsNeedingRefresh(
    filters?: GetSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams(filters || {});
    return this.request<PaginatedResponse<SegmentType>>(
      `/needing-refresh${queryString}`
    );
  }

  /**
   * GET /segments/code/:code - Get segment by code
   */
  async getSegmentByCode(
    code: string,
    skipCache: boolean = false
  ): Promise<ApiSuccessResponse<SegmentType>> {
    const queryString = this.buildQueryParams({ skipCache });
    return this.request<ApiSuccessResponse<SegmentType>>(
      `/code/${code}${queryString}`
    );
  }

  /**
   * GET /segments/name/:name - Get segment by name
   */
  async getSegmentByName(
    name: string,
    skipCache: boolean = false
  ): Promise<ApiSuccessResponse<SegmentType>> {
    const queryString = this.buildQueryParams({ skipCache });
    return this.request<ApiSuccessResponse<SegmentType>>(
      `/name/${name}${queryString}`
    );
  }

  /**
   * GET /segments/type/:type - Get segments by type
   */
  async getSegmentsByType(
    type: "static" | "dynamic" | "trigger",
    filters?: GetSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams(filters || {});
    return this.request<PaginatedResponse<SegmentType>>(
      `/type/${type}${queryString}`
    );
  }

  /**
   * GET /segments/category/:categoryId - Get segments by category
   */
  async getSegmentsByCategory(
    categoryId: number,
    filters?: GetSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams(filters || {});
    return this.request<PaginatedResponse<SegmentType>>(
      `/category/${categoryId}${queryString}`
    );
  }

  /**
   * GET /segments/visibility/:visibility - Get segments by visibility
   */
  async getSegmentsByVisibility(
    visibility: "private" | "public",
    filters?: GetSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams(filters || {});
    return this.request<PaginatedResponse<SegmentType>>(
      `/visibility/${visibility}${queryString}`
    );
  }

  /**
   * GET /segments/creator/:creatorId - Get segments by creator
   */
  async getSegmentsByCreator(
    creatorId: number,
    filters?: GetSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams(filters || {});
    return this.request<PaginatedResponse<SegmentType>>(
      `/creator/${creatorId}${queryString}`
    );
  }

  /**
   * GET /segments/tag/:tag - Get segments by tag
   */
  async getSegmentsByTag(
    tag: string,
    filters?: GetSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams(filters || {});
    return this.request<PaginatedResponse<SegmentType>>(
      `/tag/${tag}${queryString}`
    );
  }

  // ==================== SEGMENT-SPECIFIC OPERATIONS (15 endpoints) ====================

  /**
   * GET /segments/:id/children - Get segment children
   */
  async getSegmentChildren(
    id: number,
    filters?: GetSegmentsQuery
  ): Promise<PaginatedResponse<SegmentType>> {
    const queryString = this.buildQueryParams(filters || {});
    return this.request<PaginatedResponse<SegmentType>>(
      `/${id}/children${queryString}`
    );
  }

  /**
   * GET /segments/:id/hierarchy - Get segment hierarchy
   */
  async getSegmentHierarchy(
    id: number
  ): Promise<ApiSuccessResponse<SegmentHierarchyResponse>> {
    return this.request<ApiSuccessResponse<SegmentHierarchyResponse>>(
      `/${id}/hierarchy`
    );
  }

  /**
   * GET /segments/:id/growth-trend - Get segment growth trend
   */
  async getSegmentGrowthTrend(
    id: number,
    period?: string,
    days?: number
  ): Promise<ApiSuccessResponse<GrowthTrendResponse>> {
    const queryString = this.buildQueryParams({ period, days });
    return this.request<ApiSuccessResponse<GrowthTrendResponse>>(
      `/${id}/growth-trend${queryString}`
    );
  }

  /**
   * GET /segments/:id/performance-metrics - Get segment performance metrics
   */
  async getSegmentPerformanceMetrics(
    id: number
  ): Promise<ApiSuccessResponse<PerformanceMetricsResponse>> {
    return this.request<ApiSuccessResponse<PerformanceMetricsResponse>>(
      `/${id}/performance-metrics`
    );
  }

  /**
   * GET /segments/:id/usage-in-campaigns - Get segment usage in campaigns
   */
  async getSegmentUsageInCampaigns(
    id: number
  ): Promise<ApiSuccessResponse<UsageInCampaignsResponse[]>> {
    return this.request<ApiSuccessResponse<UsageInCampaignsResponse[]>>(
      `/${id}/usage-in-campaigns`
    );
  }

  /**
   * GET /segments/:id1/overlap/:id2 - Get segment overlap
   */
  async getSegmentOverlap(
    id1: number,
    id2: number
  ): Promise<ApiSuccessResponse<SegmentOverlapResponse>> {
    return this.request<ApiSuccessResponse<SegmentOverlapResponse>>(
      `/${id1}/overlap/${id2}`
    );
  }

  /**
   * POST /segments/:id/refresh - Refresh segment
   */
  async refreshSegment(
    id: number,
    request?: { force?: boolean }
  ): Promise<ApiSuccessResponse<ComputationStatusResponse>> {
    return this.request<ApiSuccessResponse<ComputationStatusResponse>>(
      `/${id}/refresh`,
      {
        method: "POST",
        body: JSON.stringify(request || {}),
      }
    );
  }

  /**
   * POST /segments/:id/compute-size - Compute segment size
   */
  async computeSegmentSize(
    id: number,
    request?: SizeEstimateRequest
  ): Promise<ApiSuccessResponse<SizeEstimateResponse>> {
    return this.request<ApiSuccessResponse<SizeEstimateResponse>>(
      `/${id}/compute-size`,
      {
        method: "POST",
        body: JSON.stringify(request || {}),
      }
    );
  }

  /**
   * POST /segments/:id/validate-query - Validate segment query
   */
  async validateSegmentQuery(
    id: number,
    request?: QueryUpdateRequest
  ): Promise<ApiSuccessResponse<QueryValidationResponse>> {
    return this.request<ApiSuccessResponse<QueryValidationResponse>>(
      `/${id}/validate-query`,
      {
        method: "POST",
        body: JSON.stringify(request || {}),
      }
    );
  }

  /**
   * POST /segments/:id/tags - Update segment tags
   */
  async updateSegmentTags(
    id: number,
    request: TagManagementRequest
  ): Promise<ApiSuccessResponse<TagManagementResponse>> {
    return this.request<ApiSuccessResponse<TagManagementResponse>>(
      `/${id}/tags`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * PATCH /segments/:id/query - Update segment query
   */
  async updateSegmentQuery(
    id: number,
    request: QueryUpdateRequest
  ): Promise<ApiSuccessResponse<SegmentType>> {
    return this.request<ApiSuccessResponse<SegmentType>>(`/${id}/query`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  /**
   * PATCH /segments/:id/size-estimate - Update segment size estimate
   */
  async updateSegmentSizeEstimate(
    id: number,
    sizeEstimate: number
  ): Promise<ApiSuccessResponse<SegmentType>> {
    return this.request<ApiSuccessResponse<SegmentType>>(
      `/${id}/size-estimate`,
      {
        method: "PATCH",
        body: JSON.stringify({ size_estimate: sizeEstimate }),
      }
    );
  }

  /**
   * PATCH /segments/:id/last-computed - Update last computed timestamp
   */
  async updateSegmentLastComputed(
    id: number,
    timestamp?: string
  ): Promise<ApiSuccessResponse<SegmentType>> {
    const body = timestamp
      ? { last_computed_at: timestamp }
      : { last_computed_at: new Date().toISOString() };
    return this.request<ApiSuccessResponse<SegmentType>>(
      `/${id}/last-computed`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );
  }

  /**
   * PATCH /segments/:id/parent - Update segment parent
   */
  async updateSegmentParent(
    id: number,
    parentId: number | null
  ): Promise<ApiSuccessResponse<SegmentType>> {
    return this.request<ApiSuccessResponse<SegmentType>>(`/${id}/parent`, {
      method: "PATCH",
      body: JSON.stringify({ parent_segment: parentId }),
    });
  }

  /**
   * DELETE /segments/:id/tags/:tag - Delete specific tag
   */
  async deleteSegmentTag(
    id: number,
    tag: string
  ): Promise<ApiSuccessResponse<TagManagementResponse>> {
    return this.request<ApiSuccessResponse<TagManagementResponse>>(
      `/${id}/tags/${encodeURIComponent(tag)}`,
      {
        method: "DELETE",
      }
    );
  }

  // ==================== SEGMENT RULES (5 endpoints) ====================

  /**
   * GET /segments/:id/rules - Get segment rules
   */
  async getSegmentRules(
    segmentId: number
  ): Promise<ApiSuccessResponse<SegmentRuleType[]>> {
    return this.request<ApiSuccessResponse<SegmentRuleType[]>>(
      `/${segmentId}/rules`
    );
  }

  /**
   * POST /segments/:id/rules - Create segment rule
   */
  async createSegmentRule(
    segmentId: number,
    request: CreateSegmentRuleRequest
  ): Promise<ApiSuccessResponse<SegmentRuleType>> {
    return this.request<ApiSuccessResponse<SegmentRuleType>>(
      `/${segmentId}/srules`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * PUT /segments/:id/rules/:rule_id - Update segment rule
   */
  async updateSegmentRule(
    segmentId: number,
    ruleId: number,
    request: UpdateSegmentRuleRequest
  ): Promise<ApiSuccessResponse<SegmentRuleType>> {
    return this.request<ApiSuccessResponse<SegmentRuleType>>(
      `/${segmentId}/rules/${ruleId}`,
      {
        method: "PUT",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * DELETE /segments/:id/rules/:rule_id - Delete segment rule
   */
  async deleteSegmentRule(segmentId: number, ruleId: number): Promise<void> {
    return this.request<void>(`/${segmentId}/rules/${ruleId}`, {
      method: "DELETE",
    });
  }

  /**
   * POST /segments/rules/validate - Validate rules
   */
  async validateRules(
    request: ValidateRulesRequest
  ): Promise<ApiSuccessResponse<{ valid: boolean; errors?: string[] }>> {
    return this.request<
      ApiSuccessResponse<{ valid: boolean; errors?: string[] }>
    >("/rules/validate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // ==================== SEGMENT COMPUTATION (3 endpoints) ====================

  /**
   * POST /segments/:id/compute - Compute segment
   */
  async computeSegment(
    id: number,
    request?: ComputeSegmentRequest
  ): Promise<ApiSuccessResponse<ComputationStatusResponse>> {
    return this.request<ApiSuccessResponse<ComputationStatusResponse>>(
      `/${id}/compute`,
      {
        method: "POST",
        body: JSON.stringify(request || {}),
      }
    );
  }

  /**
   * GET /segments/:id/computation-status/:jobid - Get computation status
   */
  async getComputationStatus(
    segmentId: number,
    jobId: string
  ): Promise<ApiSuccessResponse<ComputationStatusResponse>> {
    return this.request<ApiSuccessResponse<ComputationStatusResponse>>(
      `/${segmentId}/computation-status/${jobId}`
    );
  }

  /**
   * POST /segments/batch-compute - Batch compute segments
   */
  async batchCompute(
    request: BatchComputeRequest
  ): Promise<ApiSuccessResponse<ComputationStatusResponse>> {
    return this.request<ApiSuccessResponse<ComputationStatusResponse>>(
      "/batch-compute",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  // ==================== SEGMENT PREVIEW (3 endpoints) ====================

  /**
   * POST /segments/:id/preview - Preview segment
   */
  async previewSegment(
    id: number,
    request?: PreviewSegmentRequest
  ): Promise<ApiSuccessResponse<PreviewResponse>> {
    return this.request<ApiSuccessResponse<PreviewResponse>>(`/${id}/preview`, {
      method: "POST",
      body: JSON.stringify(request || {}),
    });
  }

  /**
   * GET /segments/:id/preview/count - Get preview count
   */
  async getPreviewCount(
    id: number,
    criteriaOverride?: Record<string, any>
  ): Promise<ApiSuccessResponse<{ count: number }>> {
    const queryString = criteriaOverride
      ? this.buildQueryParams({
          criteria_override: JSON.stringify(criteriaOverride),
        })
      : "";
    return this.request<ApiSuccessResponse<{ count: number }>>(
      `/${id}/preview/count${queryString}`
    );
  }

  /**
   * POST /segments/:id/preview/sample/:preview_id - Get preview sample
   */
  async getPreviewSample(
    segmentId: number,
    previewId: string
  ): Promise<ApiSuccessResponse<PreviewSampleResponse>> {
    return this.request<ApiSuccessResponse<PreviewSampleResponse>>(
      `/${segmentId}/preview/sample/${previewId}`,
      {
        method: "POST",
      }
    );
  }

  // ==================== SEGMENT MEMBERS (5 endpoints) ====================

  /**
   * GET /segments/:id/members - Get segment members
   */
  async getSegmentMembers(
    id: number,
    query?: GetSegmentMembersQuery
  ): Promise<PaginatedResponse<SegmentMemberType>> {
    const queryString = this.buildQueryParams({
      page: query?.page,
      pageSize: query?.pageSize,
      sortBy: query?.sortBy,
      sortDirection: query?.sortDirection,
    });
    return this.request<PaginatedResponse<SegmentMemberType>>(
      `/${id}/members${queryString}`
    );
  }

  /**
   * POST /segments/:id/members - Add segment members
   */
  async addSegmentMembers(
    id: number,
    request: AddSegmentMembersRequest
  ): Promise<ApiSuccessResponse<{ added_count: number }>> {
    return this.request<ApiSuccessResponse<{ added_count: number }>>(
      `/${id}/members`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * DELETE /segments/:id/members - Delete segment members
   */
  async deleteSegmentMembers(
    id: number,
    request: DeleteSegmentMembersRequest
  ): Promise<ApiSuccessResponse<{ removed_count: number }>> {
    return this.request<ApiSuccessResponse<{ removed_count: number }>>(
      `/${id}/members`,
      {
        method: "DELETE",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * GET /segments/:id/members/count - Get members count
   */
  async getSegmentMembersCount(
    id: number,
    skipCache: boolean = false
  ): Promise<ApiSuccessResponse<{ count: number }>> {
    const queryString = this.buildQueryParams({ skipCache });
    return this.request<ApiSuccessResponse<{ count: number }>>(
      `/${id}/members/count${queryString}`
    );
  }

  /**
   * POST /segments/:id/members/search - Search segment members
   */
  async searchSegmentMembers(
    id: number,
    request: SearchSegmentMembersRequest
  ): Promise<PaginatedResponse<SegmentMemberType>> {
    return this.request<PaginatedResponse<SegmentMemberType>>(
      `/${id}/members/search`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  // ==================== SEGMENT EXPORT (3 endpoints) ====================

  /**
   * GET /segments/:id/export - Export segment
   */
  async exportSegment(id: number, query?: ExportSegmentQuery): Promise<Blob> {
    const queryString = this.buildQueryParams({ format: query?.format });
    const url = `${BASE_URL}/${id}/export${queryString}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return response.blob();
  }

  /**
   * POST /segments/:id/export/custom - Custom export
   */
  async customExport(
    id: number,
    request: CustomExportRequest
  ): Promise<ApiSuccessResponse<ExportStatusResponse>> {
    return this.request<ApiSuccessResponse<ExportStatusResponse>>(
      `/${id}/export/custom`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * GET /segments/:id/export-status/:jobid - Get export status
   */
  async getExportStatus(
    segmentId: number,
    jobId: string
  ): Promise<ApiSuccessResponse<ExportStatusResponse>> {
    return this.request<ApiSuccessResponse<ExportStatusResponse>>(
      `/${segmentId}/export-status/${jobId}`
    );
  }

  // ==================== HEALTH CHECK (1 endpoint) ====================

  /**
   * GET /segments/health - Health check
   */
  async healthCheck(): Promise<
    ApiSuccessResponse<{ status: string; timestamp: string }>
  > {
    return this.request<
      ApiSuccessResponse<{ status: string; timestamp: string }>
    >("/health");
  }
}

export const segmentService = new SegmentService();
