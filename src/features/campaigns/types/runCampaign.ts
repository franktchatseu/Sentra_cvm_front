export type CampaignChannel = 
  | 'NORMAL_SMS' 
  | 'FLASH_SMS' 
  | 'USSD' 
  | 'EMAIL' 
  | 'PUSH' 
  | 'WHATSAPP' 
  | 'INAPP';

export interface RunCampaignRequest {
  campaignId: number; // required, positive integer
  offerId: number; // required, positive integer
  controlGroupId: number; // required, positive integer
  blackoutPoliciesId: number; // required, positive integer
  calendarId: number; // required, positive integer
  trackingSourcesId: number; // required, positive integer
  segmentId?: number; // optional, positive integer
  sampleSize?: number; // optional, 1-5000, default: 100
  includeDetails?: boolean; // optional, default: false
  validateOnly?: boolean; // optional, default: false
  channel?: CampaignChannel; // optional
  startTime?: string; // optional
}

export interface RunCampaignResponse {
  success: boolean;
  campaignId: number;
  executionId?: string;
  message: string;
  details?: {
    totalRecipients: number;
    estimatedCost: number;
    validationResults?: any;
  };
}
