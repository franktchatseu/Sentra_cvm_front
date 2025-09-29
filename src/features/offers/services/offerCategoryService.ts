import { 
  OfferCategory,
  GetOfferCategoriesQuery,
  GetOfferCategoryByIdentifierQuery,
  CreateOfferCategoryRequest,
  UpdateOfferCategoryRequest,
  GetCategoryOffersQuery,
  OfferCategoriesResponse,
  CategoryOffersResponse
} from '../types/offerCategory';
import { buildApiUrl, getAuthHeaders } from '../../../shared/services/api';

const BASE_URL = buildApiUrl('/offers/categories');

class OfferCategoryService {
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

  // GET /offers/categories/all - Get all offer categories
  async getOfferCategories(query?: GetOfferCategoriesQuery): Promise<OfferCategoriesResponse> {
    const params = new URLSearchParams();
    
    if (query?.search) params.append('search', query.search);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortDirection) params.append('sortDirection', query.sortDirection);
    if (query?.skipCache) params.append('skipCache', query.skipCache);

    const queryString = params.toString();
    const endpoint = queryString ? `/all?${queryString}` : '/all';
    
    return this.request<OfferCategoriesResponse>(endpoint);
  }

  // GET /offers/categories/:identifier - Get offer category by ID or name
  async getOfferCategoryByIdentifier(
    identifier: string | number,
    query: GetOfferCategoryByIdentifierQuery
  ): Promise<OfferCategory> {
    const params = new URLSearchParams();
    params.append('searchBy', query.searchBy);
    if (query.includeOfferCount !== undefined) {
      params.append('includeOfferCount', query.includeOfferCount.toString());
    }
    if (query.skipCache) params.append('skipCache', query.skipCache);

    const queryString = params.toString();
    const endpoint = `/${identifier}?${queryString}`;
    
    return this.request<OfferCategory>(endpoint);
  }

  // POST /offers/categories/create - Create new offer category
  async createOfferCategory(category: CreateOfferCategoryRequest): Promise<OfferCategory> {
    return this.request<OfferCategory>('/create', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  // PUT /offers/categories/update/:id - Update offer category
  async updateOfferCategory(id: number, category: UpdateOfferCategoryRequest): Promise<OfferCategory> {
    return this.request<OfferCategory>(`/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  // DELETE /offers/categories/delete/:id - Delete offer category
  async deleteOfferCategory(id: number): Promise<void> {
    return this.request<void>(`/delete/${id}`, {
      method: 'DELETE',
    });
  }

  // GET /offers/categories/:id/offers - Get offers in a category
  async getCategoryOffers(id: number, query?: GetCategoryOffersQuery): Promise<CategoryOffersResponse> {
    const params = new URLSearchParams();
    
    if (query?.search) params.append('search', query.search);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortDirection) params.append('sortDirection', query.sortDirection);
    if (query?.lifecycleStatus) params.append('lifecycleStatus', query.lifecycleStatus);
    if (query?.approvalStatus) params.append('approvalStatus', query.approvalStatus);
    if (query?.reusable !== undefined) params.append('reusable', query.reusable.toString());
    if (query?.multiLanguage !== undefined) params.append('multiLanguage', query.multiLanguage.toString());
    if (query?.skipCache) params.append('skipCache', query.skipCache);

    const queryString = params.toString();
    const endpoint = queryString ? `/${id}/offers?${queryString}` : `/${id}/offers`;
    
    return this.request<CategoryOffersResponse>(endpoint);
  }
}

export const offerCategoryService = new OfferCategoryService();
