export interface EligibilityRules {
  min_spend?: number;
  customer_segment?: string[];
  valid_days?: string[];
  customer_tier?: string;
  min_account_age_days?: number;
  min_purchase_count?: number;
  excluded_products?: number[];
  valid_from?: string;
  valid_to?: string;
  max_usage_per_customer?: number;
  combinable_with_other_offers?: boolean;
  conditions?: {
    all?: Array<{
      fact: string;
      operator: string;
      value: any;
    }>;
  };
  priority_boost?: number;
}

export interface PersonalizationRule {
  name: string;
  definition: Record<string, any>;
  priority: number;
  isActive: boolean;
}

export interface ABTestVariant {
  variant_name: string;
  variant_data: Record<string, any>;
  traffic_percentage: number;
  is_control: boolean;
}

export interface ABTest {
  id?: number;
  test_name: string;
  variants: ABTestVariant[];
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  category?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

export interface TrackingSource {
  id: number;
  name: string;
  type?: string;
}

export type LifecycleStatus = 'draft' | 'active' | 'expired' | 'paused' | 'archived';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Offer {
  id?: number;
  name: string;
  description?: string;
  category_id?: number;
  product_id?: number;
  eligibility_rules?: EligibilityRules;
  lifecycle_status: LifecycleStatus;
  approval_status: ApprovalStatus;
  reusable: boolean;
  multi_language: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Expanded fields for UI
  category?: Category;
  product?: Product;
  products?: Product[];
  personalization_rules?: PersonalizationRule[];
  ab_tests?: ABTest[];
  tracking_sources?: TrackingSource[];
}

export interface OfferFilters {
  search?: string;
  categoryId?: number;
  productId?: number;
  lifecycleStatus?: LifecycleStatus | LifecycleStatus[];
  approvalStatus?: ApprovalStatus | ApprovalStatus[];
  reusable?: boolean;
  multiLanguage?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  skipCache?: boolean;
}

export interface OfferResponse {
  success: boolean;
  data: Offer[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CreateOfferRequest {
  name: string;
  description?: string;
  category_id?: number;
  product_id?: number;
  offer_type?: string;
  eligibility_rules?: EligibilityRules;
  lifecycle_status: LifecycleStatus;
  approval_status: ApprovalStatus;
  reusable: boolean;
  multi_language: boolean;
}

export interface UpdateOfferRequest extends Partial<CreateOfferRequest> {
  id: number;
}
