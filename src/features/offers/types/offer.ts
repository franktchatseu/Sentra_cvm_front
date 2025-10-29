
// Available offer statuses
export enum OfferStatusEnum {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  ACTIVE = "active",
  EXPIRED = "expired",
  PAUSED = "paused",
  ARCHIVED = "archived",
  REJECTED = "rejected"
}

// Available offer types
export enum OfferTypeEnum {
  DATA = "data",
  VOICE = "voice",
  SMS = "sms",
  COMBO = "combo",
  VOUCHER = "voucher",
  LOYALTY = "loyalty",
  DISCOUNT = "discount",
  BUNDLE = "bundle",
  BONUS = "bonus",
  OTHER = "other"
}

// Main offer data structure
export interface Offer {
  id: number;
  name: string;
  code: string;
  description?: string;
  offer_type: OfferTypeEnum;
  category_id?: number;
  primary_product_id?: number;
  discount_percentage?: number;
  discount_amount?: number;
  bonus_value?: number;
  eligibility_rules?: object;
  min_spend?: number;
  max_usage_per_customer: number;
  valid_from?: string;
  valid_to?: string;
  is_reusable: boolean;
  supports_multi_language: boolean;
  metadata?: object;
  tags?: string[];
  status: OfferStatusEnum;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

// creating a new offer
export interface CreateOfferRequest {
  name: string;
  code: string;
  description?: string;
  offer_type: OfferTypeEnum;
  category_id?: number;
  primary_product_id?: number;
  discount_percentage?: number;
  discount_amount?: number;
  bonus_value?: number;
  eligibility_rules?: object;
  min_spend?: number;
  max_usage_per_customer: number;
  valid_from?: string;
  valid_to?: string;
  is_reusable?: boolean;
  supports_multi_language?: boolean;
  metadata?: object;
  tags?: string[];
  created_by?: number;
}

//  updating an existing offer
export interface UpdateOfferRequest {
  name?: string;
  code?: string;
  description?: string;
  offer_type?: OfferTypeEnum;
  category_id?: number;
  primary_product_id?: number;
  discount_percentage?: number;
  discount_amount?: number;
  bonus_value?: number;
  eligibility_rules?: object;
  min_spend?: number;
  max_usage_per_customer?: number;
  valid_from?: string;
  valid_to?: string;
  is_reusable?: boolean;
  supports_multi_language?: boolean;
  metadata?: object;
  tags?: string[];
  updated_by?: number;
}

// updating offer status
export interface UpdateStatusRequest {
  status: OfferStatusEnum;
  updated_by?: number;
}

// submitting offer for approval
export interface SubmitApprovalRequest {
  updated_by?: number;
}

// approving an offer
export interface ApproveOfferRequest {
  approved_by: number;
  approved_at?: string;
}

// Base response structure from backend
export interface BaseResponse<T> {
  success: boolean;
  data: T;
  source?: "cache" | "database" | "database-forced";
}

// Response structure for paginated data
export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

// Response for single offer
export type OfferResponse = BaseResponse<Offer>;

// Response for multiple offers
export type OffersResponse = PaginatedResponse<Offer>;

// Response when creating an offer
export interface CreateOfferResponse extends BaseResponse<Offer> {
  insertId: number;
}

// Response for offer statistics
export type OfferStatsResponse = BaseResponse<{
  totalOffers: number;
  activeOffers: number;
  expiredOffers: number;
  pendingApproval: number;
  approvedOffers: number;
  rejectedOffers: number;
}>;

// Response for offer type distribution
export type TypeDistributionResponse = BaseResponse<{
  data: number;
  voice: number;
  sms: number;
  combo: number;
  voucher: number;
  loyalty: number;
  discount: number;
  bundle: number;
  bonus: number;
  other: number;
}>;

// Response for category performance metrics
export type CategoryPerformanceResponse = BaseResponse<Array<{
  categoryId: number;
  categoryName: string;
  offerCount: number;
  totalRevenue: number;
  conversionRate: number;
}>>;

// Parameters for searching offers
export interface SearchParams {
  searchTerm: string;
  limit?: number;
  offset?: number;
  skipCache?: boolean;
}

// Parameters for filtering offers
export interface FilterParams {
  limit?: number;
  offset?: number;
  skipCache?: boolean;
}

// Parameters for date range queries
export interface DateRangeParams {
  startDate: string;
  endDate: string;
  limit?: number;
  offset?: number;
  skipCache?: boolean;
}

// Response for offer products
export type OfferProductsResponse = BaseResponse<Array<{
  id: number;
  offer_id: number;
  product_id: number;
  is_primary: boolean;
  created_at: string;
  created_by: string;
}>>;