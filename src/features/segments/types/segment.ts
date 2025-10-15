export interface SegmentCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | string[];
  type: 'string' | 'number' | 'boolean' | 'array';
}

export interface SegmentConditionGroup {
  id: string;
  operator: 'AND' | 'OR';
  conditionType: 'rule' | 'list' | 'segments' | '360';
  conditions: SegmentCondition[];
  listData?: {
    list_id?: number;
    list_description?: string;
    list_type?: 'seed' | 'and' | 'standard';
    subscriber_id_col_name?: string;
    subscriber_count?: number;
    file_delimiter?: string;
    file_text?: string;
    file_path?: string;
    list_label?: string;
    list_headers?: string;
  };
  profileConditions?: SegmentCondition[]; // For 360 profile conditions
}

export type SegmentType = 'static' | 'dynamic' | 'trigger';
export type SegmentVisibility = 'private' | 'public';
export type SortDirection = 'ASC' | 'DESC';
export type ExportFormat = 'csv' | 'json' | 'xml';

export interface Segment {
  id?: number;
  segment_id?: number;
  name: string;
  description?: string;
  type: SegmentType;
  tags?: string[];
  conditions?: SegmentConditionGroup[];
  criteria?: Record<string, unknown>; // Backend segment criteria definition
  definition?: Record<string, unknown>;
  customer_count?: number;
  size_estimate?: number;
  created_on?: string;
  created_at?: string;
  updated_on?: string;
  updated_at?: string;
  created_by?: number;
  is_active?: boolean;
  category?: number;
  category_name?: string;
  business_purpose?: string;
  refresh_frequency?: string;
  version?: string;
  visibility?: SegmentVisibility;
}

export interface CreateSegmentRequest {
  name: string;
  type: SegmentType;
  description?: string;
  definition?: Record<string, unknown>;
  size_estimate?: number;
  category?: number;
  refresh_frequency?: string;
  version?: string;
  tags?: string[];
  visibility?: SegmentVisibility;
  criteria?: Record<string, unknown>;
  conditions?: SegmentConditionGroup[];
}

export interface UpdateSegmentRequest {
  name?: string;
  description?: string;
  definition?: Record<string, unknown>;
  size_estimate?: number;
  category?: number;
  business_purpose?: string;
  refresh_frequency?: string;
  version?: string;
  tags?: string[];
  visibility?: SegmentVisibility;
  conditions?: SegmentConditionGroup[];
  is_active?: boolean;
}

export interface SegmentFilters {
  search?: string;
  categoryId?: number;
  type?: SegmentType;
  page?: number;
  pageSize?: number;
  sortBy?: 'id' | 'name' | 'type' | 'category' | 'created_at' | 'updated_at';
  sortDirection?: SortDirection;
  skipCache?: boolean;
  tags?: string[];
  is_active?: boolean;
}

export interface SegmentSearchFilters {
  q?: string;
  category?: number;
  type?: SegmentType;
  visibility?: SegmentVisibility;
  tags?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'id' | 'name' | 'type' | 'created_at' | 'updated_at';
  sortDirection?: SortDirection;
  skipCache?: boolean;
}

export interface SegmentResponse {
  success: boolean;
  message?: string;
  data: Segment[];
  segments?: Segment[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sortBy?: string;
    sortDirection?: string;
    isCachedResponse?: boolean;
    cacheDurationSec?: number;
  };
  total?: number;
  page?: number;
  limit?: number;
}

export interface DuplicateSegmentRequest {
  newName: string;
}

export interface ValidateCriteriaRequest {
  criteria: Record<string, unknown>;
  segment_type: SegmentType;
}

export interface SegmentRule {
  id?: number;
  segment_id?: number;
  rule_json: Record<string, unknown>;
  rule_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSegmentRuleRequest {
  rule_json: Record<string, unknown>;
  rule_order?: number;
}

export interface UpdateSegmentRuleRequest {
  rule_json?: Record<string, unknown>;
  rule_order?: number;
}

export interface ValidateRulesRequest {
  rules: Array<{
    rule_json: Record<string, unknown>;
    rule_order: number;
  }>;
  segment_type: SegmentType;
}

export interface ComputeSegmentRequest {
  force_recompute?: boolean;
}

export interface BatchComputeRequest {
  segment_ids: number[];
  force_recompute?: boolean;
}

export interface ComputationStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  started_at?: string;
  completed_at?: string;
  error?: string;
}

export interface PreviewSegmentRequest {
  criteria_override?: Record<string, unknown>;
  limit?: number;
}

export interface PreviewCountRequest {
  criteria_override?: Record<string, unknown>;
}

export interface SegmentMember {
  customer_id: string | number;
  joined_at?: string;
  [key: string]: unknown;
}

export interface SegmentMembersResponse {
  success: boolean;
  data: SegmentMember[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface AddSegmentMembersRequest {
  customer_ids: Array<string | number>;
}

export interface DeleteSegmentMembersRequest {
  customer_ids: Array<string | number>;
}

export interface SearchSegmentMembersRequest {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ExportSegmentRequest {
  format?: ExportFormat;
  fields?: string[];
  filters?: Record<string, unknown>;
  include_metadata?: boolean;
}

export interface ExportStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  expires_at?: string;
  error?: string;
}

export interface SegmentCategory {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSegmentCategoryRequest {
  name: string;
  // Note: Backend only accepts 'name' field
}

export interface UpdateSegmentCategoryRequest {
  name?: string;
  // Note: Backend only accepts 'name' field
}

export interface SegmentCategoriesResponse {
  success: boolean;
  data: SegmentCategory[];
  message?: string;
}

// Available fields for segment conditions
export interface SegmentField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  operators: string[];
}

export const SEGMENT_FIELDS: SegmentField[] = [
  {
    key: 'customer_profile.device_category',
    label: 'Device Category',
    type: 'string',
    operators: ['equals', 'not_equals', 'in', 'not_in']
  },
  {
    key: 'customer_profile.age',
    label: 'Age',
    type: 'number',
    operators: ['equals', 'not_equals', 'greater_than', 'less_than']
  },
  {
    key: 'customer_profile.gender',
    label: 'Gender',
    type: 'string',
    operators: ['equals', 'not_equals']
  },
  {
    key: 'customer_profile.location',
    label: 'Location',
    type: 'string',
    operators: ['equals', 'not_equals', 'contains', 'not_contains']
  },
  {
    key: 'customer_profile.subscription_status',
    label: 'Subscription Status',
    type: 'string',
    operators: ['equals', 'not_equals', 'in', 'not_in']
  },
  {
    key: 'customer_profile.total_spent',
    label: 'Total Spent',
    type: 'number',
    operators: ['equals', 'not_equals', 'greater_than', 'less_than']
  },
  {
    key: 'customer_profile.last_activity',
    label: 'Last Activity',
    type: 'string',
    operators: ['equals', 'not_equals', 'greater_than', 'less_than']
  }
];

// 360 Profile specific fields
export const PROFILE_360_FIELDS: SegmentField[] = [
  {
    key: 'engagement_score',
    label: 'Engagement Score',
    type: 'number',
    operators: ['equals', 'not_equals', 'greater_than', 'less_than']
  },
  {
    key: 'lifetime_value',
    label: 'Lifetime Value',
    type: 'number',
    operators: ['equals', 'not_equals', 'greater_than', 'less_than']
  },
  {
    key: 'churn_risk',
    label: 'Churn Risk',
    type: 'string',
    operators: ['equals', 'not_equals', 'in', 'not_in']
  },
  {
    key: 'purchase_frequency',
    label: 'Purchase Frequency',
    type: 'string',
    operators: ['equals', 'not_equals', 'in', 'not_in']
  },
  {
    key: 'preferred_channel',
    label: 'Preferred Channel',
    type: 'string',
    operators: ['equals', 'not_equals', 'in', 'not_in']
  },
  {
    key: 'customer_segment',
    label: 'Customer Segment',
    type: 'string',
    operators: ['equals', 'not_equals', 'in', 'not_in']
  },
  {
    key: 'satisfaction_score',
    label: 'Satisfaction Score',
    type: 'number',
    operators: ['equals', 'not_equals', 'greater_than', 'less_than']
  },
  {
    key: 'recency_score',
    label: 'Recency Score',
    type: 'number',
    operators: ['equals', 'not_equals', 'greater_than', 'less_than']
  }
];

export const OPERATOR_LABELS: Record<string, string> = {
  equals: 'Equals',
  not_equals: 'Not Equals',
  contains: 'Contains',
  not_contains: 'Does Not Contain',
  greater_than: 'Greater Than',
  less_than: 'Less Than',
  in: 'In',
  not_in: 'Not In'
};
