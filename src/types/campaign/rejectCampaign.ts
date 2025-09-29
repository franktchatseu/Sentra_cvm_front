export interface RejectCampaignRequest {
  comments: string; // required, max 500 chars
}

export interface RejectCampaignResponse {
  success: boolean;
  campaignId: number;
  approvalStatus: 'rejected';
  rejectedAt: string;
  rejectedBy: number;
  comments: string;
  message: string;
}
