// Campaign Objective Types
export interface CampaignObjective {
  id: number;
  name: string;
  description?: string;
  icon: ObjectiveIcon;
  status: 'active' | 'inactive';
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  rank: number; // 1-5
  tags: string[];
  business_rules?: string;
  associated_campaigns_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateObjectiveRequest {
  name: string;
  description?: string;
  icon: ObjectiveIcon;
  status: 'active' | 'inactive';
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  rank: number;
  tags: string[];
  business_rules?: string;
}

export interface UpdateObjectiveRequest extends Partial<CreateObjectiveRequest> {
  id: number;
}

export interface ObjectiveResponse {
  success: boolean;
  data: CampaignObjective[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Icon options for objectives
export type ObjectiveIcon = 
  | 'target' 
  | 'users' 
  | 'trending-up' 
  | 'heart' 
  | 'zap' 
  | 'shield' 
  | 'star' 
  | 'flag' 
  | 'trophy' 
  | 'gift' 
  | 'megaphone' 
  | 'chart-bar' 
  | 'lightbulb' 
  | 'rocket' 
  | 'clock' 
  | 'check-circle';

export interface ObjectiveIconOption {
  value: ObjectiveIcon;
  label: string;
  description: string;
  icon: string; // Lucide icon name
}

// Priority level options
export interface PriorityLevelOption {
  value: 'low' | 'medium' | 'high' | 'critical';
  label: string;
  description: string;
  color: string;
}

// Rank options (1-5)
export interface RankOption {
  value: number;
  label: string;
  description: string;
}

// Status options
export interface StatusOption {
  value: 'active' | 'inactive';
  label: string;
  description: string;
  color: string;
}
