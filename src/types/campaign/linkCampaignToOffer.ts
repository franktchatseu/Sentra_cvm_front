export interface LinkCampaignToOfferRequest {
  offer_id: number; // required, positive integer
  created_by: number; // required, positive integer
}

export interface LinkCampaignToOfferResponse {
  success: boolean;
  campaignId: number;
  offerId: number;
  linkedAt: string;
  linkedBy: number;
  message: string;
}
