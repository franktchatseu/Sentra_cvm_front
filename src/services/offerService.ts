import { 
  Offer, 
  OfferFilters, 
  OfferResponse, 
  CreateOfferRequest, 
  UpdateOfferRequest,
  Category,
  Product,
  PersonalizationRule,
  ABTest,
  TrackingSource
} from '../types/offer';
import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api';

const BASE_URL = buildApiUrl(API_CONFIG.ENDPOINTS.OFFERS);

class OfferService {
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

  // Get all offers with filtering and pagination
  async getOffers(filters: OfferFilters = {}): Promise<OfferResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.productId) params.append('productId', filters.productId.toString());
    if (filters.lifecycleStatus) {
      if (Array.isArray(filters.lifecycleStatus)) {
        params.append('lifecycleStatus', filters.lifecycleStatus.join(','));
      } else {
        params.append('lifecycleStatus', filters.lifecycleStatus);
      }
    }
    if (filters.approvalStatus) {
      if (Array.isArray(filters.approvalStatus)) {
        params.append('approvalStatus', filters.approvalStatus.join(','));
      } else {
        params.append('approvalStatus', filters.approvalStatus);
      }
    }
    if (filters.reusable !== undefined) params.append('reusable', filters.reusable.toString());
    if (filters.multiLanguage !== undefined) params.append('multiLanguage', filters.multiLanguage.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
    if (filters.skipCache !== undefined) params.append('skipCache', filters.skipCache.toString());

    const queryString = params.toString();
    const endpoint = `/all${queryString ? `?${queryString}` : ''}`;
    
    return this.request<OfferResponse>(endpoint);
  }

  // Get offer by ID
  async getOfferById(id: number): Promise<Offer> {
    return this.request<Offer>(`/${id}?searchBy=id`);
  }

  // Get offer by name
  async getOfferByName(name: string): Promise<Offer> {
    return this.request<Offer>(`/${encodeURIComponent(name)}?searchBy=name`);
  }

  // Create new offer
  async createOffer(offer: CreateOfferRequest): Promise<Offer> {
    return this.request<Offer>('/create', {
      method: 'POST',
      body: JSON.stringify(offer),
    });
  }

  // Update existing offer
  async updateOffer(id: number, offer: Partial<UpdateOfferRequest>): Promise<Offer> {
    return this.request<Offer>(`/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(offer),
    });
  }

  // Delete offer
  async deleteOffer(id: number): Promise<void> {
    return this.request<void>(`/delete/${id}`, {
      method: 'DELETE',
    });
  }

  // Approval actions
  async approveOffer(id: number): Promise<Offer> {
    return this.request<Offer>(`/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectOffer(id: number): Promise<Offer> {
    return this.request<Offer>(`/${id}/reject`, {
      method: 'PUT',
    });
  }

  async requestApproval(id: number, comments?: string): Promise<void> {
    return this.request<void>(`/${id}/request-approval`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  // Lifecycle actions
  async activateOffer(id: number): Promise<Offer> {
    return this.request<Offer>(`/${id}/activate`, {
      method: 'PUT',
    });
  }

  async deactivateOffer(id: number): Promise<Offer> {
    return this.request<Offer>(`/${id}/deactivate`, {
      method: 'PUT',
    });
  }

  async expireOffer(id: number): Promise<Offer> {
    return this.request<Offer>(`/${id}/expire`, {
      method: 'PUT',
    });
  }

  async pauseOffer(id: number): Promise<Offer> {
    return this.request<Offer>(`/${id}/pause`, {
      method: 'PUT',
    });
  }

  async archiveOffer(id: number): Promise<Offer> {
    return this.request<Offer>(`/${id}/archive`, {
      method: 'PUT',
    });
  }

  // Product management
  async getOfferProducts(id: number): Promise<Product[]> {
    return this.request<Product[]>(`/${id}/products?skipCache=true`);
  }

  async linkProducts(id: number, productIds: number[]): Promise<void> {
    return this.request<void>(`/${id}/products`, {
      method: 'POST',
      body: JSON.stringify({ product_ids: productIds }),
    });
  }

  // Personalization
  async getPersonalizationRules(id: number): Promise<PersonalizationRule[]> {
    return this.request<PersonalizationRule[]>(`/${id}/personalization?skipCache=true`);
  }

  async setPersonalizationRules(id: number, rules: PersonalizationRule[]): Promise<void> {
    return this.request<void>(`/${id}/personalization`, {
      method: 'POST',
      body: JSON.stringify({ rules }),
    });
  }

  async getPersonalizedOffers(customerId: string): Promise<Offer[]> {
    return this.request<Offer[]>(`/personalized/${customerId}?skipCache=true`);
  }

  // A/B Testing
  async getABTests(id: number): Promise<ABTest[]> {
    return this.request<ABTest[]>(`/${id}/ab-tests?skipCache=true`);
  }

  async createABTest(id: number, test: Omit<ABTest, 'id' | 'created_at' | 'updated_at'>): Promise<ABTest> {
    return this.request<ABTest>(`/${id}/ab-tests`, {
      method: 'POST',
      body: JSON.stringify(test),
    });
  }

  async getABTestResults(offerId: number, testId: number): Promise<any> {
    return this.request<any>(`/${offerId}/ab-tests/${testId}/results?skipCache=true`);
  }

  // Tracking Sources
  async getTrackingSources(id: number): Promise<TrackingSource[]> {
    return this.request<TrackingSource[]>(`/${id}/tracking-sources?skipCache=true`);
  }

  async addTrackingSource(id: number, trackingSourceId: number): Promise<void> {
    return this.request<void>(`/${id}/tracking-sources`, {
      method: 'POST',
      body: JSON.stringify({ tracking_source_id: trackingSourceId }),
    });
  }

  // History
  async getApprovalHistory(id: number): Promise<any[]> {
    return this.request<any[]>(`/${id}/approval-history?skipCache=true`);
  }

  async getLifecycleHistory(id: number): Promise<any[]> {
    return this.request<any[]>(`/${id}/lifecycle-history?skipCache=true`);
  }
}

export const offerService = new OfferService();
export default offerService;
