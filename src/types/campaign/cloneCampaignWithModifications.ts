export interface CloneCampaignModifications {
  name?: string; // optional, 1-128 chars
  description?: string | null; // optional, max 1000 chars, can be null
  objective?: string | null; // optional, max 256 chars, can be null
  category_id?: number | null; // optional, positive integer, can be null
  program_id?: number | null; // optional, positive integer, can be null
  start_date?: string | null; // optional, ISO date format, can be null
  end_date?: string | null; // optional, ISO date format, can be null
  owner_team?: string | null; // optional, max 64 chars, can be null
}

export interface CloneCampaignWithModificationsRequest {
  newName: string; // required, 1-128 chars
  modifications: CloneCampaignModifications;
}

export interface CloneCampaignWithModificationsResponse {
  success: boolean;
  originalCampaignId: number;
  clonedCampaignId: number;
  newName: string;
  modifications: CloneCampaignModifications;
  clonedAt: string;
  clonedBy: number;
  message: string;
}
