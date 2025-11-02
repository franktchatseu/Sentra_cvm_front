import {
  API_CONFIG,
  buildApiUrl,
  getAuthHeaders,
} from "../../../shared/services/api";
import {
  CreateAccountRequestRequest,
  RecordConsentsRequest,
  SubmitAccountRequestRequest,
  AssignApproverRequest,
  ApproveAccountRequestRequest,
  RejectAccountRequestRequest,
  CreateDirectAccountRequest,
  HashPasswordRequest,
  ApiSuccessResponse,
  AccountRequestType,
} from "../types/account";

const BASE_URL = buildApiUrl("/account");

class AccountService {
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

  // ==================== ACCOUNT REQUEST ENDPOINTS (8 endpoints) ====================

  /**
   * POST /account/request - Create account request
   */
  async createAccountRequest(
    request: CreateAccountRequestRequest
  ): Promise<ApiSuccessResponse<AccountRequestType>> {
    return this.request<ApiSuccessResponse<AccountRequestType>>("/request", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * POST /account/request/:id/consents - Record request consents
   */
  async recordConsents(
    id: number,
    request: RecordConsentsRequest
  ): Promise<ApiSuccessResponse<AccountRequestType>> {
    return this.request<ApiSuccessResponse<AccountRequestType>>(
      `/request/${id}/consents`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * POST /account/request/:id/submit - Submit account request for approval
   */
  async submitAccountRequest(
    id: number,
    request?: SubmitAccountRequestRequest
  ): Promise<ApiSuccessResponse<AccountRequestType>> {
    return this.request<ApiSuccessResponse<AccountRequestType>>(
      `/request/${id}/submit`,
      {
        method: "POST",
        body: request ? JSON.stringify(request) : undefined,
      }
    );
  }

  /**
   * POST /account/request/:id/assign-approver - Assign approver to request
   */
  async assignApprover(
    id: number,
    request: AssignApproverRequest
  ): Promise<ApiSuccessResponse<AccountRequestType>> {
    return this.request<ApiSuccessResponse<AccountRequestType>>(
      `/request/${id}/assign-approver`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * POST /account/request/:id/approve - Approve account request
   */
  async approveAccountRequest(
    id: number,
    request?: ApproveAccountRequestRequest
  ): Promise<ApiSuccessResponse<AccountRequestType>> {
    return this.request<ApiSuccessResponse<AccountRequestType>>(
      `/request/${id}/approve`,
      {
        method: "POST",
        body: request ? JSON.stringify(request) : undefined,
      }
    );
  }

  /**
   * POST /account/request/:id/reject - Reject account request
   */
  async rejectAccountRequest(
    id: number,
    request?: RejectAccountRequestRequest
  ): Promise<ApiSuccessResponse<AccountRequestType>> {
    return this.request<ApiSuccessResponse<AccountRequestType>>(
      `/request/${id}/reject`,
      {
        method: "POST",
        body: request ? JSON.stringify(request) : undefined,
      }
    );
  }

  /**
   * POST /account/create-direct - Create account directly (admin only)
   */
  async createDirectAccount(
    request: CreateDirectAccountRequest
  ): Promise<ApiSuccessResponse<AccountRequestType>> {
    return this.request<ApiSuccessResponse<AccountRequestType>>(
      "/create-direct",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * POST /account/dev/hash-password - Hash password (dev only)
   */
  async hashPassword(
    request: HashPasswordRequest
  ): Promise<ApiSuccessResponse<{ hash: string }>> {
    return this.request<ApiSuccessResponse<{ hash: string }>>(
      "/dev/hash-password",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }
}

export const accountService = new AccountService();
