export type CampaignType = 'multiple_target_group' | 'champion_challenger' | 'ab_test' | 'round_robin' | 'multiple_level';

// Backend Campaign Response Types
export interface BackendCampaignType {
  id: number;
  campaign_uuid: string;
  name: string;
  code: string;
  description: string | null;
  objective: string;
  category_id: number | null;
  program_id: number | null;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'scheduled';
  approval_status: 'pending' | 'approved' | 'rejected';
  start_date: string | null;
  end_date: string | null;
  timezone: string | null;
  budget_allocated: string | null;
  budget_spent: string | null;
  max_participants: number | null;
  current_participants: number | null;
  target_reach: number | null;
  target_conversion_rate: string | null;
  target_revenue: string | null;
  owner_team: string | null;
  campaign_manager_id: number | null;
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;
  control_group_enabled: boolean;
  control_group_percentage: string | null;
  tenant_id: number | null;
  client_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  deleted_at: string | null;
  deleted_by: number | null;
  metadata: Record<string, any> | null;
  tags: string[];
  attribution_model_id: number | null;
}

export interface GetCampaignsResponse {
  success: boolean;
  data: BackendCampaignType[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  source: string;
}

// Campaign Category Types
export interface CampaignCategory {
  id: number;
  name: string;
  description: string | null;
  parent_category_id: number | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface GetCampaignCategoriesResponse {
  success: boolean;
  data: CampaignCategory[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  source: string;
}

// Base Campaign Interface
interface CampaignBase {
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
  scheduling: CampaignScheduling;
  approval_workflow?: ApprovalWorkflow;
  is_definitive?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  priority_rank?: number;
  performance?: {
    delivered: number;
    response: number;
    converted: number;
    revenue: number;
    last_updated?: string;
  };
}

// Multiple Target Group Campaign
export interface MultipleTargetGroupCampaign extends CampaignBase {
  campaign_type: 'multiple_target_group';
  config: {
    segments: CampaignSegment[];
    offer_mappings: CampaignOfferMapping[];
    mutually_exclusive?: boolean;
  };
}

// Champion-Challenger Campaign
export interface ChampionChallengerCampaign extends CampaignBase {
  campaign_type: 'champion_challenger';
  config: {
    champion: CampaignSegment;
    challengers: CampaignSegment[];
    offer_mappings: CampaignOfferMapping[];
  };
}

// A/B Test Campaign
export interface ABTestCampaign extends CampaignBase {
  campaign_type: 'ab_test';
  config: {
    variant_a: CampaignSegment;
    variant_b: CampaignSegment;
    offer_mappings: CampaignOfferMapping[];
  };
}

// Round Robin Campaign
export interface RoundRobinCampaign extends CampaignBase {
  campaign_type: 'round_robin';
  config: {
    segment: CampaignSegment;
    offer_sequence: SequentialOfferMapping[];
  };
}

// Multiple Level Campaign
export interface MultipleLevelCampaign extends CampaignBase {
  campaign_type: 'multiple_level';
  config: {
    segment: CampaignSegment;
    offer_sequence: SequentialOfferMapping[];
  };
}

// Discriminated Union Type
export type Campaign = 
  | MultipleTargetGroupCampaign 
  | ChampionChallengerCampaign 
  | ABTestCampaign 
  | RoundRobinCampaign 
  | MultipleLevelCampaign;

export interface CampaignSegment {
  id: string;
  name: string;
  description?: string;
  customer_count: number;
  criteria: SegmentCriteria;
  created_at: string;
  control_group_config?: SegmentControlGroupConfig;
  priority?: number;
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
  start_date?: string;
  end_date?: string;
  tag?: string;
  business?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  priority_rank?: number;
  is_definitive?: boolean;
  campaign_type?: 'multiple_target_group' | 'champion_challenger' | 'ab_test' | 'round_robin' | 'multiple_level'; // frontend-only field
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

// Round Robin Configuration
export interface IntervalConfig {
  interval_type: 'hours' | 'days' | 'weeks';
  interval_value: number;
  description?: string;
}

// Multiple Level Configuration
export interface ConditionConfig {
  condition_type: 'customer_attribute' | 'behavior' | 'transaction' | 'custom';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  field: string;
  value: string | number | boolean;
  description?: string;
}

// Offer Mapping for Round Robin and Multiple Level
export interface SequentialOfferMapping {
  offer_id: string;
  segment_id: string;
  sequence_order: number;
  interval_config?: IntervalConfig; // For Round Robin
  condition_config?: ConditionConfig; // For Multiple Level
}
