import { CampaignChannel } from './runCampaign';

export interface CommunicationPolicy {
    id: number | string;
    name: string;
    description?: string;
    frequency_capping: {
        max_per_day: number;
        max_per_week: number;
        max_per_month: number;
    };
    throttling: {
        max_per_hour: number;
        max_per_day: number;
    };
    channels: CampaignChannel[];
    blackout_windows?: {
        start_time: string; // e.g., "22:00"
        end_time: string;   // e.g., "08:00"
        days?: string[];    // e.g., ["Saturday", "Sunday"]
    }[];
    created_at?: string;
    updated_at?: string;
}

export interface CreateCommunicationPolicyRequest {
    name: string;
    description?: string;
    frequency_capping: {
        max_per_day: number;
        max_per_week: number;
        max_per_month: number;
    };
    throttling: {
        max_per_hour: number;
        max_per_day: number;
    };
    channels: CampaignChannel[];
    blackout_windows?: {
        start_time: string;
        end_time: string;
        days?: string[];
    }[];
}

