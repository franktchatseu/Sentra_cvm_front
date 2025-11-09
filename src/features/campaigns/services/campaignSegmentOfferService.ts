import { API_CONFIG, getAuthHeaders } from '../../../shared/services/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/campaign-segment-offers`;

export interface CampaignSegmentOfferMapping {
  campaign_id: number;
  segment_id: string;
  offer_id: number;
  created_by: number;
}

export interface CampaignSegmentOfferResponse {
  success: boolean;
  data: {
    id: number;
    campaign_id: number;
    segment_id: string;
    offer_id: number;
    offer_creative_id: null | number;
    created_at: string;
    updated_at: string;
    created_by: number;
    updated_by: number;
  };
}

export interface GetSegmentMappingsResponse {
  success: boolean;
  data: Array<{
    id: number;
    campaign_id: number;
    segment_id: string;
    offer_id: number;
    offer_creative_id: null | number;
    created_at: string;
    updated_at: string;
    created_by: number;
    updated_by: number;
  }>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  source: string;
}

class CampaignSegmentOfferService {
  /**
   * Map a campaign with a segment and an offer
   */
  async createMapping(
    mapping: CampaignSegmentOfferMapping
  ): Promise<CampaignSegmentOfferResponse> {
    console.log('Creating campaign-segment-offer mapping:', { mapping, url: BASE_URL });

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(mapping),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: BASE_URL,
        mapping,
      });
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
    }

    const result = await response.json();
    console.log('Mapping created:', result);
    return result;
  }

  /**
   * Create multiple mappings at once (batch)
   */
  async createBatchMappings(
    mappings: CampaignSegmentOfferMapping[]
  ): Promise<CampaignSegmentOfferResponse[]> {
    console.log('Creating batch mappings:', { count: mappings.length });

    const results: CampaignSegmentOfferResponse[] = [];

    for (const mapping of mappings) {
      try {
        const result = await this.createMapping(mapping);
        results.push(result);
      } catch (error) {
        console.error('Error creating mapping:', { mapping, error });
        throw error;
      }
    }

    console.log('Batch mappings created successfully:', results.length);
    return results;
  }

  /**
   * Get all mappings for a specific segment
   */
  async getMappingsBySegment(segmentId: string | number): Promise<GetSegmentMappingsResponse> {
    const url = `${BASE_URL}/segment/${segmentId}`;
    console.log('Fetching mappings for segment:', { segmentId, url });

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
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

  /**
   * Get all mappings for a specific campaign
   */
  async getMappingsByCampaign(campaignId: string | number): Promise<GetSegmentMappingsResponse> {
    const url = `${BASE_URL}/campaign/${campaignId}`;
    console.log('Fetching mappings for campaign:', { campaignId, url });

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
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

  /**
   * Delete a mapping
   */
  async deleteMapping(id: number): Promise<void> {
    const url = `${BASE_URL}/${id}`;
    console.log('Deleting mapping:', { id, url });

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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
  }
}

export const campaignSegmentOfferService = new CampaignSegmentOfferService();
export default campaignSegmentOfferService;
