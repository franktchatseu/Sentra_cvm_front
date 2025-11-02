import {
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  ArrowRight,
  Users,
  MessageSquare,
  TrendingUp,
  Target,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { dashboardService, DashboardStats } from "../services/dashboardService";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tw, color } from "../../../shared/utils/utils";
import { campaignService } from "../../campaigns/services/campaignService";
import { Campaign } from "../../campaigns/types/campaign";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalOffers: 0,
    totalSegments: 0,
    activeCampaigns: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const stats = await dashboardService.getDashboardStats();
        setDashboardStats(stats);
      } catch {
        setDashboardStats({
          totalOffers: 0,
          totalSegments: 0,
          activeCampaigns: 0,
          conversionRate: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setCampaignsLoading(true);
        const response = await campaignService.getAllCampaigns({
          pageSize: 10,
          sortBy: "created_at",
          sortDirection: "DESC",
        });
        const filteredCampaigns = (response.data as Campaign[])
          .filter(
            (campaign) => (campaign as { status: string }).status !== "archived"
          )
          .slice(0, 3);
        setCampaigns(filteredCampaigns);
      } catch {
        setCampaigns([]);
      } finally {
        setCampaignsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const getFirstName = () => {
    if (
      user &&
      "email" in user &&
      user.email &&
      typeof user.email === "string"
    ) {
      const emailName = user.email.split("@")[0];
      const nameWithoutNumbers = emailName.replace(/\d+/g, "");
      return (
        nameWithoutNumbers.charAt(0).toUpperCase() +
        nameWithoutNumbers.slice(1).toLowerCase()
      );
    }
    return "user";
  };

  const getSegmentName = (campaign: Campaign): string => {
    if (campaign.campaign_type === "multiple_target_group") {
      return campaign.config.segments[0]?.name || "Multiple Segments";
    } else if (campaign.campaign_type === "champion_challenger") {
      return campaign.config.champion?.name || "Champion Segment";
    } else if (campaign.campaign_type === "ab_test") {
      return campaign.config.variant_a?.name || "A/B Test Segments";
    } else if (
      campaign.campaign_type === "round_robin" ||
      campaign.campaign_type === "multiple_level"
    ) {
      return campaign.config.segment?.name || "Single Segment";
    }
    return "High Value Customers";
  };

  const quickActions = [
    { name: "Create Campaign", href: "/dashboard/campaigns/create" },
    { name: "New Offer", href: "/dashboard/offers/create" },
    { name: "Build Segment", href: "/dashboard/segments/create" },
    { name: "Configuration", href: "/dashboard/configuration" },
  ];

  const stats = [
    {
      name: "Active Campaigns",
      value: loading
        ? "..."
        : (dashboardStats?.activeCampaigns ?? 0).toString(),
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Total Segments",
      value: loading ? "..." : (dashboardStats?.totalSegments ?? 0).toString(),
      change: "+8%",
      changeType: "positive",
    },
    {
      name: "Total Offers",
      value: loading ? "..." : (dashboardStats?.totalOffers ?? 0).toString(),
      change: "-3%",
      changeType: "negative",
    },
    {
      name: "Conversion Rate",
      value: loading ? "..." : `${dashboardStats?.conversionRate ?? 0}%`,
      change: "+5.2%",
      changeType: "positive",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1
          className={`${tw.mainHeading} ${tw.textPrimary} flex items-center gap-3`}
        >
          Welcome back, {getFirstName()}
          <span className="text-3xl">👋</span>
        </h1>
        <p className={`${tw.textSecondary} ${tw.body}`}>
          Here's what's happening with your campaigns today. Your performance is
          looking great!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          return (
            <div
              key={stat.name}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
            >
              <div className="space-y-6">
                {/* Header with Change Badge */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className={`text-4xl font-bold ${tw.textPrimary}`}>
                      {stat.value}
                    </p>
                    <p
                      className={`${tw.caption} font-medium ${tw.textSecondary}`}
                    >
                      {stat.name}
                    </p>
                  </div>

                  <div
                    className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 text-white border"
                    style={{
                      backgroundColor: color.primary.accent,
                      borderColor: color.primary.accent,
                    }}
                  >
                    {stat.changeType === "positive" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>

                {/* Footer indicator */}
                <div
                  className={`text-xs ${tw.textMuted} pt-3 border-t border-gray-100`}
                >
                  vs last month
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Campaigns - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className={tw.subHeading}>Recent Campaigns</h2>
                <p className="text-sm text-black mt-1">
                  Monitor your active and scheduled campaigns
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/campaigns")}
                className={`${tw.button} flex items-center gap-2 hover:scale-105`}
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Campaigns List */}
            <div className="p-6">
              {campaignsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className={tw.textSecondary}>No campaigns found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="bg-gray-50 rounded-xl p-5 border border-gray-200 cursor-pointer"
                      onClick={() =>
                        navigate(`/dashboard/campaigns/${campaign.id}`)
                      }
                    >
                      {/* Campaign Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`${tw.subHeading} ${tw.textPrimary} mb-2`}
                          >
                            {campaign.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Users className={`h-4 w-4 ${tw.textMuted}`} />
                            <p
                              className={`text-sm ${tw.textSecondary} font-medium`}
                            >
                              {getSegmentName(campaign)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                              campaign.status === "active"
                                ? `bg-[${color.status.success}]/10 text-[${color.status.success}] border border-[${color.status.success}]/20`
                                : `bg-[${color.status.warning}]/10 text-[${color.status.warning}] border border-[${color.status.warning}]/20`
                            }`}
                          >
                            {campaign.status}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/campaigns/${campaign.id}`);
                            }}
                            className="p-2 rounded-lg"
                            style={{ color: color.text.muted }}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Performance Metrics or Schedule Info */}
                      {campaign.status === "active" && campaign.performance ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            {
                              label: "Response",
                              value: campaign.performance.response,
                              icon: MessageSquare,
                            },
                            {
                              label: "Delivered",
                              value: campaign.performance.delivered,
                              icon: TrendingUp,
                            },
                            {
                              label: "Converted",
                              value: campaign.performance.converted,
                              icon: Target,
                            },
                          ].map((metric) => {
                            const MetricIcon = metric.icon;
                            return (
                              <div
                                key={metric.label}
                                className="bg-white rounded-lg p-4 border border-gray-200"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <MetricIcon
                                    className="h-4 w-4"
                                    style={{ color: color.primary.accent }}
                                  />
                                </div>
                                <p
                                  className={`text-2xl font-bold ${tw.textPrimary}`}
                                >
                                  {metric.value.toLocaleString()}
                                </p>
                                <p
                                  className={`text-xs ${tw.textSecondary} font-medium mt-1`}
                                >
                                  {metric.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-lg p-4 border border-gray-200 bg-white">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-600">
                              {campaign.start_date
                                ? `Scheduled to start on ${new Date(
                                    campaign.start_date
                                  ).toLocaleDateString()}`
                                : `Created on ${new Date(
                                    campaign.created_at
                                  ).toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Takes 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.subHeading}>Quick Actions</h2>
              <p className="text-sm text-black mt-1">
                Common tasks and shortcuts
              </p>
            </div>
            <div className="p-6 space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={() => navigate(action.href)}
                  className="w-full flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <span className="font-semibold text-sm text-gray-700">
                    {action.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.subHeading}>Upcoming</h2>
              <p className="text-sm text-black mt-1">
                Scheduled events and meetings
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl p-4 border border-gray-200 bg-gray-50">
                <p className="font-bold text-sm text-gray-900 mb-1">
                  Campaign Launch
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Churn Prevention - Q1
                </p>
                <div className="inline-block px-3 py-1.5 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                  Tomorrow at 9:00 AM
                </div>
              </div>

              <div className="rounded-xl p-4 border border-gray-200 bg-gray-50">
                <p className="font-bold text-sm text-gray-900 mb-1">
                  Review Meeting
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Q1 Campaign Performance
                </p>
                <div className="inline-block px-3 py-1.5 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                  Friday at 2:00 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
