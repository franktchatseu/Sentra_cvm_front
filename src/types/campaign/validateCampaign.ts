import { CampaignChannel } from './runCampaign';

export interface ValidateCampaignRequest {
  campaignId: number; // required, positive integer
  segmentId?: number; // optional, positive integer
  sampleSize?: number; // optional, 1-5000, default: 100
  includeDetails?: boolean; // optional, default: false
  channel?: CampaignChannel; // optional
}

export interface ValidateCampaignResponse {
  success: boolean;
  campaignId: number;
  validationResults: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    estimatedRecipients: number;
    estimatedCost: number;
    channelCompatibility: boolean;
    segmentValidation: {
      isValid: boolean;
      totalSegments: number;
      activeSegments: number;
    };
    offerValidation: {
      isValid: boolean;
      offerExists: boolean;
      offerActive: boolean;
    };
    blackoutPoliciesValidation: {
      isValid: boolean;
      conflicts: string[];
    };
    calendarValidation: {
      isValid: boolean;
      availableSlots: number;
    };
    trackingValidation: {
      isValid: boolean;
      trackingSourcesActive: boolean;
    };
  };
}
