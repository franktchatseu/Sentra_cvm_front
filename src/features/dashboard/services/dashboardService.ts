import offerService from "../../offers/services/offerService";
import { segmentService } from "../../segments/services/segmentService";
import campaignService from "../../campaigns/services/campaignService";
import { Campaign } from "../../campaigns/types/campaign";

export interface DashboardStats {
  totalOffers: number;
  totalSegments: number;
  activeCampaigns: number;
  conversionRate: number;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch offers and segments stats
      const offersStatsResponse = await offerService.getStats(true);
      const segmentsStatsResponse = await segmentService.getSegmentStats(true);

      // Extract total offers from stats response (backend uses snake_case)
      const offersData = offersStatsResponse.data as
        | Record<string, unknown>
        | undefined;
      const totalOffersRaw = offersData?.total_offers;
      const totalOffers =
        typeof totalOffersRaw === "string"
          ? parseInt(totalOffersRaw, 10) || 0
          : (totalOffersRaw as number) || 0;

      // Extract total segments from stats response (backend uses snake_case and returns strings)
      const segmentsData = segmentsStatsResponse.data as
        | Record<string, unknown>
        | undefined;
      const totalSegmentsRaw = segmentsData?.total_segments;
      const totalSegments =
        typeof totalSegmentsRaw === "string"
          ? parseInt(totalSegmentsRaw, 10) || 0
          : (totalSegmentsRaw as number) || 0;

      // Temporarily skip campaigns due to API error
      let activeCampaigns = 0;
      let conversionRate = 0;

      try {
        const [allCampaignsResponse, activeCampaignsResponse] =
          await Promise.all([
            campaignService.getAllCampaigns(),
            campaignService.getAllCampaigns({ status: "active" }),
          ]);

        activeCampaigns = activeCampaignsResponse.meta?.total || 0;

        // Calculate conversion rate from all campaigns
        const totalCampaigns = allCampaignsResponse.meta?.total || 0;
        const campaigns = allCampaignsResponse.data || [];

        // Count successful campaigns
        const successfulCampaigns = (campaigns as Campaign[]).filter(
          (campaign) => campaign.status === "completed"
        ).length;

        conversionRate =
          totalCampaigns > 0
            ? Math.round((successfulCampaigns / totalCampaigns) * 100)
            : 0;
      } catch {
        // Continue with offers and segments stats
      }

      return {
        totalOffers,
        totalSegments,
        activeCampaigns,
        conversionRate,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalOffers: 0,
        totalSegments: 0,
        activeCampaigns: 0,
        conversionRate: 0,
      };
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
