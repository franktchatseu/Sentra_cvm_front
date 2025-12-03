export interface CreateCampaignCategoryRequest {
  name: string; // required, 1-64 chars
  description: string; // required
  parent_category_id?: number | null; // optional, can be null
  display_order?: number; // optional
  is_active?: boolean; // optional
  created_by: number; // required, must be a number
}

export interface UpdateCampaignCategoryRequest {
  name?: string; // optional, 1-64 chars
  description?: string | null; // optional, max 500 chars, can be null
}

export interface CampaignCategory {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateCampaignCategoryResponse = CampaignCategory;

export type UpdateCampaignCategoryResponse = CampaignCategory;
