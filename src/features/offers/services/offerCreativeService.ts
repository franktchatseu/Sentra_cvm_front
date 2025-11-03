import {
  OfferCreative,
  CreateOfferCreativeRequest,
  UpdateOfferCreativeRequest,
  UpdateContentRequest,
  UpdateVariablesRequest,
  CloneCreativeRequest,
  CreateVersionRequest,
  RenderCreativeRequest,
  RenderCreativeResponseType,
  SearchCreativeParams,
  SuperSearchCreativeParams,
  CreativeStatsResponse,
  ChannelCoverageResponse,
  OfferCreativeResponse,
  OfferCreativesResponse,
  CreativeChannel,
  BaseResponse,
} from "../types/offerCreative";
import {
  API_CONFIG,
  buildApiUrl,
  getAuthHeaders,
} from "../../../shared/services/api";

const BASE_URL = buildApiUrl(API_CONFIG.ENDPOINTS.OFFER_CREATIVES);

class OfferCreativeService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`[OfferCreativeService] Making request to: ${url}`);
    console.log(
      `[OfferCreativeService] Request method: ${options.method || "GET"}`
    );
    if (options.body) {
      console.log(`[OfferCreativeService] Request body:`, options.body);
    }

    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    console.log(
      `[OfferCreativeService] Response status: ${response.status} ${response.statusText}`
    );
    console.log(`[OfferCreativeService] Response URL: ${response.url}`);

    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error(`[OfferCreativeService] API Error Response:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
          url: url,
        });

        if (errorData.error) {
          throw new Error(errorData.error);
        }
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        if (errorData.details) {
          throw new Error(errorData.details);
        }
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${JSON.stringify(
            errorData
          )}`
        );
      } catch (parseError: any) {
        console.error(
          `[OfferCreativeService] Failed to parse error response:`,
          parseError
        );
        throw new Error(
          `HTTP error! status: ${response.status}, statusText: ${response.statusText}`
        );
      }
    }

    const result = await response.json();
    console.log(`[OfferCreativeService] Response data:`, result);
    return result;
  }

  // ============================================
  // GET ENDPOINTS (Read)
  // ============================================

  // GET /offer-creatives/stats
  async getStats(skipCache: boolean = false): Promise<CreativeStatsResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    console.log(`[OfferCreativeService] getStats - skipCache: ${skipCache}`);
    const result = await this.request<CreativeStatsResponse>(`/stats${params}`);
    console.log(`[OfferCreativeService] getStats response:`, result);
    return result;
  }

  // GET /offer-creatives/most-revised
  async getMostRevised(
    limit: number = 10,
    skipCache: boolean = false
  ): Promise<OfferCreativesResponse> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (skipCache) params.append("skipCache", "true");
    const queryString = params.toString();
    console.log(`[OfferCreativeService] getMostRevised - limit: ${limit}`);
    const result = await this.request<OfferCreativesResponse>(
      `/most-revised${queryString ? `?${queryString}` : ""}`
    );
    console.log(`[OfferCreativeService] getMostRevised response:`, result);
    return result;
  }

  // GET /offer-creatives/search
  async search(params: SearchCreativeParams): Promise<OfferCreativesResponse> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append("query", params.query);
    if (params.offer_id)
      queryParams.append("offer_id", params.offer_id.toString());
    if (params.channel) queryParams.append("channel", params.channel);
    if (params.locale) queryParams.append("locale", params.locale);
    if (params.template_type_id)
      queryParams.append(
        "template_type_id",
        params.template_type_id.toString()
      );
    if (params.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const queryString = queryParams.toString();
    console.log(`[OfferCreativeService] search - params:`, params);
    const result = await this.request<OfferCreativesResponse>(
      `/search${queryString ? `?${queryString}` : ""}`
    );
    console.log(`[OfferCreativeService] search response:`, result);
    return result;
  }

  // GET /offer-creatives/super-search
  async superSearch(
    params: SuperSearchCreativeParams
  ): Promise<OfferCreativesResponse> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append("query", params.query);
    if (params.offer_id)
      queryParams.append("offer_id", params.offer_id.toString());
    if (params.channel) queryParams.append("channel", params.channel);
    if (params.locale) queryParams.append("locale", params.locale);
    if (params.template_type_id)
      queryParams.append(
        "template_type_id",
        params.template_type_id.toString()
      );
    if (params.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());
    if (params.version)
      queryParams.append("version", params.version.toString());
    if (params.created_by)
      queryParams.append("created_by", params.created_by.toString());
    if (params.updated_by)
      queryParams.append("updated_by", params.updated_by.toString());
    if (params.created_from)
      queryParams.append("created_from", params.created_from);
    if (params.created_to) queryParams.append("created_to", params.created_to);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.skipCache) queryParams.append("skipCache", "true");

    const queryString = queryParams.toString();
    console.log(`[OfferCreativeService] superSearch - params:`, params);
    const result = await this.request<OfferCreativesResponse>(
      `/super-search${queryString ? `?${queryString}` : ""}`
    );
    console.log(`[OfferCreativeService] superSearch response:`, result);
    return result;
  }

  // GET /offer-creatives/template-type/:templateTypeId
  async getByTemplateType(
    templateTypeId: number,
    params?: { limit?: number; offset?: number; skipCache?: boolean }
  ): Promise<OfferCreativesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.skipCache) queryParams.append("skipCache", "true");
    const queryString = queryParams.toString();
    console.log(
      `[OfferCreativeService] getByTemplateType - templateTypeId: ${templateTypeId}`
    );
    const result = await this.request<OfferCreativesResponse>(
      `/template-type/${templateTypeId}${queryString ? `?${queryString}` : ""}`
    );
    console.log(`[OfferCreativeService] getByTemplateType response:`, result);
    return result;
  }

  // GET /offer-creatives/channel/:channel
  async getByChannel(
    channel: CreativeChannel,
    params?: { limit?: number; offset?: number; skipCache?: boolean }
  ): Promise<OfferCreativesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.skipCache) queryParams.append("skipCache", "true");
    const queryString = queryParams.toString();
    console.log(`[OfferCreativeService] getByChannel - channel: ${channel}`);
    const result = await this.request<OfferCreativesResponse>(
      `/channel/${channel}${queryString ? `?${queryString}` : ""}`
    );
    console.log(`[OfferCreativeService] getByChannel response:`, result);
    return result;
  }

  // GET /offer-creatives/locale/:locale
  async getByLocale(
    locale: string,
    params?: { limit?: number; offset?: number; skipCache?: boolean }
  ): Promise<OfferCreativesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.skipCache) queryParams.append("skipCache", "true");
    const queryString = queryParams.toString();
    console.log(`[OfferCreativeService] getByLocale - locale: ${locale}`);
    const result = await this.request<OfferCreativesResponse>(
      `/locale/${encodeURIComponent(locale)}${
        queryString ? `?${queryString}` : ""
      }`
    );
    console.log(`[OfferCreativeService] getByLocale response:`, result);
    return result;
  }

  // GET /offer-creatives/offer/:offerId/channels
  async getChannelsByOffer(
    offerId: number,
    skipCache: boolean = false
  ): Promise<BaseResponse<CreativeChannel[]>> {
    const params = skipCache ? "?skipCache=true" : "";
    console.log(
      `[OfferCreativeService] getChannelsByOffer - offerId: ${offerId}`
    );
    const result = await this.request<BaseResponse<CreativeChannel[]>>(
      `/offer/${offerId}/channels${params}`
    );
    console.log(`[OfferCreativeService] getChannelsByOffer response:`, result);
    return result;
  }

  // GET /offer-creatives/offer/:offerId/channel-coverage
  async getChannelCoverage(
    offerId: number,
    skipCache: boolean = false
  ): Promise<ChannelCoverageResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    console.log(
      `[OfferCreativeService] getChannelCoverage - offerId: ${offerId}`
    );
    const result = await this.request<ChannelCoverageResponse>(
      `/offer/${offerId}/channel-coverage${params}`
    );
    console.log(`[OfferCreativeService] getChannelCoverage response:`, result);
    return result;
  }

  // GET /offer-creatives/offer/:offerId/channel/:channel/locales
  async getLocalesByOfferAndChannel(
    offerId: number,
    channel: CreativeChannel,
    skipCache: boolean = false
  ): Promise<BaseResponse<string[]>> {
    const params = skipCache ? "?skipCache=true" : "";
    console.log(
      `[OfferCreativeService] getLocalesByOfferAndChannel - offerId: ${offerId}, channel: ${channel}`
    );
    const result = await this.request<BaseResponse<string[]>>(
      `/offer/${offerId}/channel/${channel}/locales${params}`
    );
    console.log(
      `[OfferCreativeService] getLocalesByOfferAndChannel response:`,
      result
    );
    return result;
  }

  // GET /offer-creatives/offer/:offerId/channel/:channel/latest
  async getLatestByOfferAndChannel(
    offerId: number,
    channel: CreativeChannel,
    skipCache: boolean = false
  ): Promise<OfferCreativeResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    console.log(
      `[OfferCreativeService] getLatestByOfferAndChannel - offerId: ${offerId}, channel: ${channel}`
    );
    const result = await this.request<OfferCreativeResponse>(
      `/offer/${offerId}/channel/${channel}/latest${params}`
    );
    console.log(
      `[OfferCreativeService] getLatestByOfferAndChannel response:`,
      result
    );
    return result;
  }

  // GET /offer-creatives/offer/:offerId/channel/:channel/versions
  async getVersionsByOfferAndChannel(
    offerId: number,
    channel: CreativeChannel,
    params?: { limit?: number; offset?: number; skipCache?: boolean }
  ): Promise<OfferCreativesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.skipCache) queryParams.append("skipCache", "true");
    const queryString = queryParams.toString();
    console.log(
      `[OfferCreativeService] getVersionsByOfferAndChannel - offerId: ${offerId}, channel: ${channel}`
    );
    const result = await this.request<OfferCreativesResponse>(
      `/offer/${offerId}/channel/${channel}/versions${
        queryString ? `?${queryString}` : ""
      }`
    );
    console.log(
      `[OfferCreativeService] getVersionsByOfferAndChannel response:`,
      result
    );
    return result;
  }

  // GET /offer-creatives/offer/:offerId/channel/:channel
  async getByOfferAndChannel(
    offerId: number,
    channel: CreativeChannel,
    skipCache: boolean = false
  ): Promise<OfferCreativeResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    console.log(
      `[OfferCreativeService] getByOfferAndChannel - offerId: ${offerId}, channel: ${channel}`
    );
    const result = await this.request<OfferCreativeResponse>(
      `/offer/${offerId}/channel/${channel}${params}`
    );
    console.log(
      `[OfferCreativeService] getByOfferAndChannel response:`,
      result
    );
    return result;
  }

  // GET /offer-creatives/offer/:offerId
  async getByOffer(
    offerId: number,
    params?: { limit?: number; offset?: number; skipCache?: boolean }
  ): Promise<OfferCreativesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.skipCache) queryParams.append("skipCache", "true");
    const queryString = queryParams.toString();
    console.log(`[OfferCreativeService] getByOffer - offerId: ${offerId}`);
    const result = await this.request<OfferCreativesResponse>(
      `/offer/${offerId}${queryString ? `?${queryString}` : ""}`
    );
    console.log(`[OfferCreativeService] getByOffer response:`, result);
    return result;
  }

  // GET /offer-creatives/:id/render
  async render(
    id: number,
    request: RenderCreativeRequest,
    skipCache: boolean = false
  ): Promise<RenderCreativeResponseType> {
    const params = skipCache ? "&skipCache=true" : "";
    console.log(`[OfferCreativeService] render - id: ${id}, request:`, request);
    const result = await this.request<RenderCreativeResponseType>(
      `/${id}/render${params ? `?${params}` : ""}`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    console.log(`[OfferCreativeService] render response:`, result);
    return result;
  }

  // GET /offer-creatives/:id
  async getById(
    id: number,
    skipCache: boolean = false
  ): Promise<OfferCreativeResponse> {
    const params = skipCache ? "?skipCache=true" : "";
    console.log(`[OfferCreativeService] getById - id: ${id}`);
    const result = await this.request<OfferCreativeResponse>(`/${id}${params}`);
    console.log(`[OfferCreativeService] getById response:`, result);
    return result;
  }

  // ============================================
  // POST ENDPOINTS (Create)
  // ============================================

  // POST /offer-creatives/
  async create(
    request: CreateOfferCreativeRequest
  ): Promise<OfferCreativeResponse> {
    console.log(
      `[OfferCreativeService] create - incoming request:`,
      JSON.stringify(request, null, 2)
    );
    console.log(`[OfferCreativeService] create - request details:`, {
      offer_id: request.offer_id,
      channel: request.channel,
      locale: request.locale,
      has_title: !!request.title,
      has_text_body: !!request.text_body,
      has_html_body: !!request.html_body,
      has_variables:
        !!request.variables && Object.keys(request.variables).length > 0,
      created_by: request.created_by,
    });

    try {
      const result = await this.request<OfferCreativeResponse>(`/`, {
        method: "POST",
        body: JSON.stringify(request),
      });
      console.log(`[OfferCreativeService] create - SUCCESS response:`, result);
      return result;
    } catch (error: any) {
      console.error(`[OfferCreativeService] create - ERROR:`, {
        message: error?.message,
        error: error,
        requestPayload: request,
      });
      throw error;
    }
  }

  // POST /offer-creatives/offer/:offerId/channel/:channel/new-version
  async createNewVersion(
    offerId: number,
    channel: CreativeChannel,
    request: CreateVersionRequest = {}
  ): Promise<OfferCreativeResponse> {
    console.log(
      `[OfferCreativeService] createNewVersion - offerId: ${offerId}, channel: ${channel}`
    );
    const result = await this.request<OfferCreativeResponse>(
      `/offer/${offerId}/channel/${channel}/new-version`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    console.log(`[OfferCreativeService] createNewVersion response:`, result);
    return result;
  }

  // POST /offer-creatives/:id/clone-locale
  async cloneToLocale(
    id: number,
    request: CloneCreativeRequest
  ): Promise<OfferCreativeResponse> {
    console.log(`[OfferCreativeService] cloneToLocale - id: ${id}`);
    const result = await this.request<OfferCreativeResponse>(
      `/${id}/clone-locale`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    console.log(`[OfferCreativeService] cloneToLocale response:`, result);
    return result;
  }

  // POST /offer-creatives/:id/clone-channel
  async cloneToChannel(
    id: number,
    request: CloneCreativeRequest
  ): Promise<OfferCreativeResponse> {
    console.log(`[OfferCreativeService] cloneToChannel - id: ${id}`);
    const result = await this.request<OfferCreativeResponse>(
      `/${id}/clone-channel`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    console.log(`[OfferCreativeService] cloneToChannel response:`, result);
    return result;
  }

  // ============================================
  // PATCH ENDPOINTS (Update)
  // ============================================

  // PATCH /offer-creatives/:id/activate
  async activate(id: number): Promise<OfferCreativeResponse> {
    console.log(`[OfferCreativeService] activate - id: ${id}`);
    const result = await this.request<OfferCreativeResponse>(
      `/${id}/activate`,
      {
        method: "PATCH",
      }
    );
    console.log(`[OfferCreativeService] activate response:`, result);
    return result;
  }

  // PATCH /offer-creatives/:id/deactivate
  async deactivate(id: number): Promise<OfferCreativeResponse> {
    console.log(`[OfferCreativeService] deactivate - id: ${id}`);
    const result = await this.request<OfferCreativeResponse>(
      `/${id}/deactivate`,
      {
        method: "PATCH",
      }
    );
    console.log(`[OfferCreativeService] deactivate response:`, result);
    return result;
  }

  // PATCH /offer-creatives/:id/rollback
  async rollback(id: number): Promise<OfferCreativeResponse> {
    console.log(`[OfferCreativeService] rollback - id: ${id}`);
    const result = await this.request<OfferCreativeResponse>(
      `/${id}/rollback`,
      {
        method: "PATCH",
      }
    );
    console.log(`[OfferCreativeService] rollback response:`, result);
    return result;
  }

  // PATCH /offer-creatives/:id/content
  async updateContent(
    id: number,
    request: UpdateContentRequest
  ): Promise<OfferCreativeResponse> {
    console.log(`[OfferCreativeService] updateContent - id: ${id}`);
    const result = await this.request<OfferCreativeResponse>(`/${id}/content`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
    console.log(`[OfferCreativeService] updateContent response:`, result);
    return result;
  }

  // PATCH /offer-creatives/:id/variables
  async updateVariables(
    id: number,
    request: UpdateVariablesRequest
  ): Promise<OfferCreativeResponse> {
    console.log(`[OfferCreativeService] updateVariables - id: ${id}`);
    const result = await this.request<OfferCreativeResponse>(
      `/${id}/variables`,
      {
        method: "PATCH",
        body: JSON.stringify(request),
      }
    );
    console.log(`[OfferCreativeService] updateVariables response:`, result);
    return result;
  }

  // PATCH /offer-creatives/:id
  async update(
    id: number,
    request: UpdateOfferCreativeRequest
  ): Promise<OfferCreativeResponse> {
    console.log(`[OfferCreativeService] update - id: ${id}`);
    const result = await this.request<OfferCreativeResponse>(`/${id}`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
    console.log(`[OfferCreativeService] update response:`, result);
    return result;
  }

  // ============================================
  // DELETE ENDPOINTS
  // ============================================

  // DELETE /offer-creatives/:id
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    console.log(`[OfferCreativeService] delete - id: ${id}`);
    const result = await this.request<{ success: boolean; message: string }>(
      `/${id}`,
      {
        method: "DELETE",
      }
    );
    console.log(`[OfferCreativeService] delete response:`, result);
    return result;
  }
}

export const offerCreativeService = new OfferCreativeService();
export default offerCreativeService;
