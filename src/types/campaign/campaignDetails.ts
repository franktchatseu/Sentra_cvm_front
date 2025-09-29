export interface CampaignPerformance {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
    conversionRate: number;
    openRate: number;
    clickRate: number;
}

export interface CampaignDetails {
    id: string;
    name: string;
    description: string;
    type: string;
    category: string;
    segment: string;
    offer: string;
    status: string;
    startDate: string;
    endDate: string;
    createdDate: string;
    lastModified: string;
    performance: CampaignPerformance;
}
