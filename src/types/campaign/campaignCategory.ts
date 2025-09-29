export interface CreateCampaignCategoryRequest {
  name: string; // required, 1-64 chars
  description?: string | null; // optional, max 500 chars, can be null
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

export interface CreateCampaignCategoryResponse extends CampaignCategory {}

export interface UpdateCampaignCategoryResponse extends CampaignCategory {}
