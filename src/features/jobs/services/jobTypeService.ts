import { buildApiUrl, getAuthHeaders } from "../../../shared/services/api";
import {
  CreateJobTypePayload,
  JobType,
  JobTypeListResponse,
  JobTypeSearchResponse,
  UpdateJobTypePayload,
} from "../types/job";

const BASE_URL = buildApiUrl("/job-types");

export interface JobTypeListParams {
  limit?: number;
  offset?: number;
  skipCache?: boolean;
}

export interface JobTypeSearchParams extends JobTypeListParams {
  name?: string;
  code?: string;
  description?: string;
  skipCache?: boolean;
}

class JobTypeService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `Failed to call job types API (status ${response.status})`;

      try {
        const parsed = JSON.parse(errorBody);
        errorMessage =
          parsed?.message || parsed?.error || parsed?.details || errorMessage;
      } catch {
        if (errorBody) {
          errorMessage = errorBody;
        }
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private buildQueryString(
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    if (!params) return "";

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      searchParams.append(key, String(value));
    });

    const query = searchParams.toString();
    return query ? `?${query}` : "";
  }

  private normalizeListResponse(
    response:
      | JobTypeListResponse
      | JobType[]
      | {
          success: boolean;
          data: JobType[];
          pagination?: {
            limit: number;
            offset: number;
            total: number;
            hasMore: boolean;
          };
          source?: string;
        }
  ): JobTypeListResponse {
    if (Array.isArray(response)) {
      return {
        data: response,
        count: response.length,
      };
    }
    // Handle new response structure with success, data, pagination, source
    if ("success" in response && "data" in response) {
      return {
        data: response.data,
        count: response.pagination?.total ?? response.data.length,
        success: response.success,
      };
    }
    return response;
  }

  async listJobTypes(
    params: JobTypeListParams = {}
  ): Promise<JobTypeListResponse> {
    const safeLimit = Math.min(Math.max(params.limit ?? 100, 1), 100);
    const query = this.buildQueryString({
      limit: safeLimit,
      offset: params.offset ?? 0,
      skipCache: params.skipCache ?? false,
    });

    const response = await this.request<
      | JobTypeListResponse
      | JobType[]
      | {
          success: boolean;
          data: JobType[];
          pagination?: {
            limit: number;
            offset: number;
            total: number;
            hasMore: boolean;
          };
          source?: string;
        }
    >(query);
    return this.normalizeListResponse(response);
  }

  async searchJobTypes(
    params: JobTypeSearchParams = {}
  ): Promise<JobTypeSearchResponse> {
    const query = this.buildQueryString(params);
    const response = await this.request<JobTypeSearchResponse | JobType[]>(
      `/search${query}`
    );

    if (Array.isArray(response)) {
      return {
        success: true,
        data: response,
        pagination: {
          limit: params.limit ?? response.length,
          offset: params.offset ?? 0,
          total: response.length,
          hasMore: false,
        },
      };
    }

    return response;
  }

  async getJobTypeById(id: number): Promise<JobType> {
    return this.request<JobType>(`/${id}`);
  }

  async createJobType(payload: CreateJobTypePayload): Promise<JobType> {
    return this.request<JobType>("", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async updateJobType(
    id: number,
    payload: UpdateJobTypePayload
  ): Promise<JobType> {
    return this.request<JobType>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async deleteJobType(id: number): Promise<void> {
    await this.request<{ success: boolean }>(`/${id}`, {
      method: "DELETE",
    });
  }

  async getCountByType(skipCache = false): Promise<{
    data: Array<{
      job_type_id: number;
      job_type_name: string;
      job_count: number | string;
    }>;
    total: number;
  }> {
    const query = this.buildQueryString({ skipCache });
    const response = await this.request<{
      success: boolean;
      data: Array<{
        job_type_id: number;
        job_type_name: string;
        job_count: number | string;
      }>;
      source?: string;
      total?: number;
    }>(`/analytics/count-by-type${query}`);
    return {
      data: response.data || [],
      total: response.total ?? 0,
    };
  }

  async getUsageStatistics(skipCache = false): Promise<{
    data: Array<{
      id: number;
      name: string;
      code: string;
      job_count: number | string;
      last_used: string | null;
    }>;
    total: number;
  }> {
    const query = this.buildQueryString({ skipCache });
    const response = await this.request<{
      success: boolean;
      data: Array<{
        id: number;
        name: string;
        code: string;
        job_count: number | string;
        last_used: string | null;
      }>;
      source?: string;
      total?: number;
    }>(`/analytics/usage-statistics${query}`);
    return {
      data: response.data || [],
      total: response.total ?? 0,
    };
  }

  async getUnusedJobTypes(skipCache = false): Promise<JobType[]> {
    const query = this.buildQueryString({ skipCache });
    const response = await this.request<{
      success: boolean;
      data: JobType[];
      source?: string;
      total?: number;
    }>(`/analytics/unused${query}`);
    return response.data || [];
  }

  async checkCodeExists(code: string): Promise<{ exists: boolean }> {
    return this.request<{ exists: boolean }>(
      `/exists/${encodeURIComponent(code)}`
    );
  }

  async getJobTypeByName(name: string): Promise<JobType> {
    return this.request<JobType>(`/by-name/${encodeURIComponent(name)}`);
  }

  async getJobTypeByCode(code: string): Promise<JobType> {
    return this.request<JobType>(`/by-code/${encodeURIComponent(code)}`);
  }
}

export const jobTypeService = new JobTypeService();
