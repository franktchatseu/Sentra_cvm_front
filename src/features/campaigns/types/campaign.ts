export interface Campaign {
  id: string;
  name: string;
  description?: string;
  objective: 'acquisition' | 'retention' | 'churn_prevention' | 'upsell_cross_sell' | 'reactivation';
  category_id?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled';
  approval_status?: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  created_by: string;
  start_date?: string;
  end_date?: string;
  segments: CampaignSegment[];
  offers: CampaignOffer[];
  scheduling: CampaignScheduling;
  control_group?: ControlGroup;
  approval_workflow?: ApprovalWorkflow;
  is_definitive?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  performance?: {
    delivered: number;
    response: number;
    converted: number;
    revenue: number;
    last_updated?: string;
  };
}

export interface CampaignSegment {
  id: string;
  name: string;
  description?: string;
  customer_count: number;
  criteria: SegmentCriteria;
  created_at: string;
  control_group_config?: SegmentControlGroupConfig;
  priority?: number;
  is_mutually_exclusive?: boolean;
}

export interface SegmentCriteria {
  age_range?: { min: number; max: number };
  customer_tier?: string[];
  spending_range?: { min: number; max: number };
  account_age_days?: { min: number; max: number };
  purchase_behavior?: string[];
  location?: string[];
  channel_preference?: string[];
  custom_attributes?: Record<string, string | number | boolean>;
}

export interface CampaignOffer {
  id: string;
  name: string;
  description?: string;
  offer_type: string;
  reward_type: 'bundle' | 'points' | 'discount' | 'cashback' | 'free_service';
  reward_value: string;
  validity_period: number;
  terms_conditions?: string;
  personalization?: OfferPersonalization;
  segments: string[]; // Segment IDs this offer is mapped to
}

export interface OfferPersonalization {
  dynamic_variables: Record<string, string>;
  segment_adapted_content: Record<string, string>;
  localization: Record<string, string>;
}

export interface CampaignScheduling {
  type: 'immediate' | 'scheduled' | 'recurring' | 'trigger_based';
  start_date?: string;
  end_date?: string;
  time_zone: string;
  delivery_times?: string[];
  frequency?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    days_of_week?: number[];
    days_of_month?: number[];
  };
  frequency_capping?: {
    max_per_day?: number;
    max_per_week?: number;
    max_per_month?: number;
  };
  throttling?: {
    max_per_hour: number;
    max_per_day: number;
  };
  blackout_windows?: BlackoutWindow[];
  trigger_conditions?: TriggerCondition[];
}

export interface BlackoutWindow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface TriggerCondition {
  id: string;
  name: string;
  event_type: string;
  conditions: Record<string, string | number | boolean>;
  delay_minutes?: number;
}

export interface ControlGroup {
  enabled: boolean;
  percentage: number;
  type: 'standard' | 'universal';
  universal_frequency?: 'monthly' | 'quarterly';
  exclusion_criteria?: Record<string, string | number | boolean>;
}

export interface SegmentControlGroupConfig {
  type: 'none' | 'with_control_group' | 'multiple_control_group';
  // Sub-types for 'with_control_group'
  control_group_method?: 'fixed_percentage' | 'fixed_number' | 'advanced_parameters';
  percentage?: number; // For 'fixed_percentage' method (0.1 - 50%)
  set_limits?: boolean; // Enable limits for percentage type
  lower_limit?: number; // Lower limit for control group
  upper_limit?: number; // Upper limit for control group
  fixed_number?: number; // For 'fixed_number' method
  confidence_level?: number; // For 'advanced_parameters' method (90-99%)
  margin_of_error?: number; // For 'advanced_parameters' method (1-10%)
  selected_control_group_id?: string; // For 'multiple_control_group' type
}

export interface AvailableControlGroup {
  id: string;
  name: string;
  description: string;
  percentage: number;
  created_at: string;
}

export interface ApprovalWorkflow {
  required: boolean;
  approvers: string[];
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface CreateCampaignRequest {
  name: string; // Required field
  description?: string;
  objective?: 'acquisition' | 'retention' | 'churn_prevention' | 'upsell_cross_sell' | 'reactivation';
  category_id?: number;
  program_id?: number;
  owner_team?: string;
  start_date?: string;
  end_date?: string;
}

export interface CampaignOfferMapping {
  offer_id: string;
  segment_ids: string[];
  priority: number;
  personalization?: OfferPersonalization;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  primary_objective: Campaign['objective'];
  default_segments: string[];
  default_offers: string[];
  default_scheduling: Partial<CampaignScheduling>;
}

export interface CampaignPreview {
  estimated_reach: number;
  segment_breakdown: { segment_name: string; count: number }[];
  offer_mapping: { offer_name: string; segments: string[]; estimated_reach: number }[];
  estimated_cost: number;
  estimated_revenue: number;
  roi_projection: number;
  delivery_schedule: { date: string; estimated_sends: number }[];
}
