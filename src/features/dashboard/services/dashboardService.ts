import offerService from '../../offers/services/offerService';
import { segmentService } from '../../segments/services/segmentService';
import campaignService from '../../campaigns/services/campaignService';

export interface DashboardStats {
  totalOffers: number;
  totalSegments: number;
  activeCampaigns: number;
  conversionRate: number;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [totalOffers, totalSegments, activeCampaignsCount] = await Promise.all([
        offerService.getTotalOffers(),
        segmentService.getTotalSegments(),
        campaignService.getActiveCampaignsCount()
      ]);

      return {
        totalOffers,
        totalSegments,
        activeCampaigns: activeCampaignsCount,
        conversionRate: 0 // Placeholder for now
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