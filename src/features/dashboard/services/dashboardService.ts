import offerService from '../../offers/services/offerService';
import { segmentService } from '../../segments/services/segmentService';
import campaignService from '../../campaigns/services/campaignService';
import { Campaign } from '../../campaigns/types/campaign';

export interface DashboardStats {
  totalOffers: number;
  totalSegments: number;
  activeCampaigns: number;
  conversionRate: number;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [offersResponse, segmentsResponse, campaignsResponse] = await Promise.all([
        offerService.getOffers(), 
        segmentService.getSegments(), 
        campaignService.getAllCampaigns() 
      ]);

      // Calculate conversion rate
      const totalCampaigns = campaignsResponse.meta?.total || 0;
      const campaigns = campaignsResponse.data || [];
      
      // Count successful campaigns 
      const successfulCampaigns = (campaigns as Campaign[]).filter(campaign => 
        campaign.status === 'completed'
      ).length;
      
      const conversionRate = totalCampaigns > 0 
        ? Math.round((successfulCampaigns / totalCampaigns) * 100) 
        : 0;

      return {
        totalOffers: offersResponse.meta?.total || 0,
        totalSegments: segmentsResponse.meta?.total || 0,
        activeCampaigns: totalCampaigns, 
        conversionRate
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalOffers: 0,
        totalSegments: 0,
        activeCampaigns: 0,
        conversionRate: 0
      };
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;