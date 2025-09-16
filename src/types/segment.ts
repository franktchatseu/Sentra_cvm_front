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
}

export interface Segment {
  segment_id: number;
  name: string;
  description: string;
  tags: string[];
  conditions: SegmentConditionGroup[];
  customer_count?: number;
  created_on: string;
  updated_on: string;
  created_by: number;
  is_active: boolean;
}

export interface CreateSegmentRequest {
  name: string;
  description: string;
  tags: string[];
  conditions: SegmentConditionGroup[];
}

export interface UpdateSegmentRequest {
  name?: string;
  description?: string;
  tags?: string[];
  conditions?: SegmentConditionGroup[];
  is_active?: boolean;
}

export interface SegmentFilters {
  search?: string;
  tags?: string[];
  is_active?: boolean;
}

export interface SegmentResponse {
  segments: Segment[];
  total: number;
  page: number;
  limit: number;
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
