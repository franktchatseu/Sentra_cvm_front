export interface CloneCampaignRequest {
  newName: string; // required, 1-128 chars
}

export interface CloneCampaignResponse {
  success: boolean;
  originalCampaignId: number;
  clonedCampaignId: number;
  newName: string;
  clonedAt: string;
  clonedBy: number;
  message: string;
}
