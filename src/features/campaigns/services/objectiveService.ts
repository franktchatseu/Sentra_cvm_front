import {
  API_CONFIG,
  buildApiUrl,
  getAuthHeaders,
} from "../../../shared/services/api";
import {
  CampaignObjective,
  CreateObjectiveRequest,
  ObjectiveResponse,
} from "../types/objective";

const BASE_URL = buildApiUrl(API_CONFIG.ENDPOINTS.CAMPAIGNS);

class ObjectiveService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url,
        params: options.body,
      });
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorBody}`
      );
    }

    return response.json();
  }

  async createObjective(
    request: CreateObjectiveRequest
  ): Promise<CampaignObjective> {
    return this.request<CampaignObjective>("/objectives", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async updateObjective(
    id: number,
    request: Partial<CreateObjectiveRequest>
  ): Promise<CampaignObjective> {
    return this.request<CampaignObjective>(`/objectives/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  }

  async deleteObjective(id: number): Promise<void> {
    return this.request<void>(`/objectives/${id}`, {
      method: "DELETE",
    });
  }

  async getObjectiveById(id: number): Promise<CampaignObjective> {
    return this.request<CampaignObjective>(`/objectives/${id}`);
  }

  async getAllObjectives(params?: {
    search?: string;
    status?: "active" | "inactive" | "all";
    priority_level?: "low" | "medium" | "high" | "critical" | "all";
    sortBy?: string;
    sortDirection?: "ASC" | "DESC";
    page?: number;
    pageSize?: number;
  }): Promise<ObjectiveResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "all") {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return this.request<ObjectiveResponse>(`/objectives/all${query}`);
  }

  // Mock data for development - remove when backend is ready
  async getMockObjectives(): Promise<ObjectiveResponse> {
    const mockObjectives: CampaignObjective[] = [
      {
        id: 1,
        name: "Customer Acquisition",
        description: "Attract new customers through targeted campaigns",
        icon: "target",
        status: "active",
        priority_level: "high",
        rank: 5,
        tags: ["acquisition", "new-customers", "growth"],
        business_rules: "Focus on customers with high lifetime value potential",
        associated_campaigns_count: 12,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
        created_by: "admin",
      },
      {
        id: 2,
        name: "Customer Retention",
        description: "Keep existing customers engaged and satisfied",
        icon: "heart",
        status: "active",
        priority_level: "critical",
        rank: 5,
        tags: ["retention", "loyalty", "engagement"],
        business_rules: "Target customers showing signs of churn",
        associated_campaigns_count: 8,
        created_at: "2024-01-10T09:15:00Z",
        updated_at: "2024-01-18T16:20:00Z",
        created_by: "admin",
      },
      {
        id: 3,
        name: "Revenue Growth",
        description: "Increase revenue through upselling and cross-selling",
        icon: "trending-up",
        status: "active",
        priority_level: "high",
        rank: 4,
        tags: ["revenue", "upselling", "cross-selling"],
        business_rules: "Focus on high-value customer segments",
        associated_campaigns_count: 15,
        created_at: "2024-01-12T11:00:00Z",
        updated_at: "2024-01-19T13:30:00Z",
        created_by: "admin",
      },
      {
        id: 4,
        name: "Brand Awareness",
        description: "Increase brand visibility and market presence",
        icon: "megaphone",
        status: "inactive",
        priority_level: "medium",
        rank: 3,
        tags: ["brand", "awareness", "marketing"],
        business_rules: "Target broad audience segments",
        associated_campaigns_count: 3,
        created_at: "2024-01-08T08:45:00Z",
        updated_at: "2024-01-15T12:00:00Z",
        created_by: "admin",
      },
      {
        id: 5,
        name: "Customer Engagement",
        description: "Boost customer interaction and satisfaction",
        icon: "users",
        status: "active",
        priority_level: "medium",
        rank: 4,
        tags: ["engagement", "satisfaction", "interaction"],
        business_rules: "Focus on active customer segments",
        associated_campaigns_count: 6,
        created_at: "2024-01-14T15:30:00Z",
        updated_at: "2024-01-21T10:15:00Z",
        created_by: "admin",
      },
    ];

    return {
      success: true,
      data: mockObjectives,
      meta: {
        total: mockObjectives.length,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };
  }
}

export const objectiveService = new ObjectiveService();
export default objectiveService;
