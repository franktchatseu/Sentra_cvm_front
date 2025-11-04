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
  Plus,
  Package,
  Folder,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { tw, color } from "../../../shared/utils/utils";
import { useState, useEffect } from "react";
import { offerService } from "../../offers/services/offerService";
import { segmentService } from "../../segments/services/segmentService";
import { productService } from "../../products/services/productService";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for distributions
  const [offerTypeDistribution, setOfferTypeDistribution] = useState<
    Array<{
      name: string;
      value: number;
      color: string;
    }>
  >([]);
  const [offerDistributionLoading, setOfferDistributionLoading] =
    useState(true);

  // State for recent activity filter
  const [recentActivityFilter, setRecentActivityFilter] = useState<
    "campaigns" | "offers" | "segments"
  >("campaigns");

  // State for stats
  const [offersStats, setOffersStats] = useState<{
    total: number;
    active: number;
  } | null>(null);
  const [segmentsStats, setSegmentsStats] = useState<{
    total: number;
  } | null>(null);
  const [productsStats, setProductsStats] = useState<{
    total: number;
  } | null>(null);

  // Fetch Offer Type Distribution (using dummy data for now)
  useEffect(() => {
    // Using dummy data for now - will connect to real endpoint later
    const dummyData = [
      { name: "Discount", value: 45, color: color.charts.offers.discount },
      { name: "Cashback", value: 22, color: color.charts.offers.cashback },
      {
        name: "Free Shipping",
        value: 12,
        color: color.charts.offers.freeShipping,
      },
      {
        name: "Buy One Get One",
        value: 8,
        color: color.charts.offers.buyOneGetOne,
      },
      { name: "Voucher", value: 5, color: color.charts.offers.voucher },
    ];
    setOfferTypeDistribution(dummyData);
    setOfferDistributionLoading(false);

    // TODO: Uncomment when ready to use real endpoint
    // const fetchOfferTypeDistribution = async () => {
    //   try {
    //     setOfferDistributionLoading(true);
    //     const response = await offerService.getTypeDistribution();
    //     const data = response.data || response;
    //     const colors = [
    //       "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    //       "#EC4899", "#06B6D4", "#84CC16",
    //     ];
    //     const chartData = [
    //       { name: "Data", value: data.data || 0, color: colors[0] },
    //       { name: "Voice", value: data.voice || 0, color: colors[1] },
    //       { name: "SMS", value: data.sms || 0, color: colors[2] },
    //       { name: "Combo", value: data.combo || 0, color: colors[3] },
    //       { name: "Voucher", value: data.voucher || 0, color: colors[4] },
    //       { name: "Loyalty", value: data.loyalty || 0, color: colors[5] },
    //       { name: "Discount", value: data.discount || 0, color: colors[6] },
    //       { name: "Bundle", value: data.bundle || 0, color: colors[7] },
    //       { name: "Bonus", value: data.bonus || 0, color: colors[0] },
    //       { name: "Other", value: data.other || 0, color: colors[1] },
    //     ].filter((item) => item.value > 0);
    //     setOfferTypeDistribution(chartData.length > 0 ? chartData : dummyData);
    //   } catch (error) {
    //     console.error("Error fetching offer type distribution:", error);
    //     setOfferTypeDistribution(dummyData);
    //   } finally {
    //     setOfferDistributionLoading(false);
    //   }
    // };
    // fetchOfferTypeDistribution();
  }, []);

  // Fetch stats for offers, segments, and products
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch offers stats
        const offersResponse = await offerService.getStats();
        if (offersResponse.success && offersResponse.data) {
          setOffersStats({
            total: offersResponse.data.totalOffers || 0,
            active: offersResponse.data.activeOffers || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching offers stats:", error);
      }

      try {
        // Fetch segments stats
        const segmentsResponse = await segmentService.getSegmentStats();
        if (segmentsResponse.success && segmentsResponse.data) {
          // Try to get total from pagination or stats
          const segmentsList = await segmentService.getSegments({ limit: 1 });
          if (segmentsList.total !== undefined) {
            setSegmentsStats({
              total: segmentsList.total,
            });
          } else if (segmentsResponse.data.total) {
            setSegmentsStats({
              total: segmentsResponse.data.total,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching segments stats:", error);
      }

      try {
        // Fetch products stats
        const productsResponse = await productService.getStats();
        if (productsResponse.success && productsResponse.data) {
          setProductsStats({
            total: productsResponse.data.total_products || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching products stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Stats data - campaigns hardcoded, others use real data
  const stats = [
    {
      name: "Active Campaigns",
      value: "24", // Hardcoded as per user request
      change: "+12%",
      changeType: "positive" as const,
      icon: Target,
    },
    {
      name: "Total Segments",
      value: segmentsStats?.total?.toLocaleString() || "0",
      change: "+8%", // Placeholder - can be calculated from trends later
      changeType: "positive" as const,
      icon: Users,
    },
    {
      name: "Total Offers",
      value: offersStats?.total?.toLocaleString() || "0",
      change: "-3%", // Placeholder - can be calculated from trends later
      changeType: "negative" as const,
      icon: Package,
    },
    {
      name: "Total Products",
      value: productsStats?.total?.toLocaleString() || "0",
      change: "+15%", // Placeholder - can be calculated from trends later
      changeType: "positive" as const,
      icon: ShoppingBag,
    },
    {
      name: "Conversion Rate",
      value: "18.5%",
      change: "+5.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  const campaigns = [
    {
      id: 1,
      name: "Q1 Customer Retention Campaign",
      status: "active",
      segment: "High Value Customers",
      performance: {
        response: 15420,
        delivered: 14500,
        converted: 2680,
      },
      created_at: "2024-01-15",
    },
    {
      id: 2,
      name: "Spring Promotion Campaign",
      status: "active",
      segment: "Premium Members",
      performance: {
        response: 12350,
        delivered: 11800,
        converted: 1890,
      },
      created_at: "2024-02-20",
    },
    {
      id: 3,
      name: "New Customer Onboarding",
      status: "pending",
      segment: "New Signups",
      start_date: "2024-03-10",
      created_at: "2024-02-28",
    },
    {
      id: 4,
      name: "Churn Prevention Initiative",
      status: "paused",
      segment: "At-Risk Customers",
      created_at: "2024-01-10",
    },
  ];

  const recentOffers = [
    {
      id: 1,
      name: "Spring Sale - 20% Off",
      status: "active",
      type: "Discount",
      created: "2 hours ago",
    },
    {
      id: 2,
      name: "Free Shipping Weekend",
      status: "active",
      type: "Free Shipping",
      created: "5 hours ago",
    },
    {
      id: 3,
      name: "Cashback Special",
      status: "pending",
      type: "Cashback",
      created: "1 day ago",
    },
  ];

  const recentSegments = [
    {
      id: 1,
      name: "High Value Customers Q1",
      type: "Dynamic",
      members: 12450,
      created: "3 hours ago",
    },
    {
      id: 2,
      name: "New Product Interest",
      type: "Trigger",
      members: 8900,
      created: "1 day ago",
    },
    {
      id: 3,
      name: "Premium Members List",
      type: "Static",
      members: 5600,
      created: "2 days ago",
    },
  ];

  // CVM-relevant metrics: Top Performing Campaigns
  const topCampaigns = [
    {
      id: 1,
      name: "Q2 Customer Acquisition",
      conversionRate: "12.5%",
      status: "Active",
    },
    {
      id: 2,
      name: "Premium Member Retention",
      conversionRate: "9.8%",
      status: "Active",
    },
    {
      id: 3,
      name: "Spring Promotion Campaign",
      conversionRate: "8.2%",
      status: "Active",
    },
    {
      id: 4,
      name: "New Product Launch",
      conversionRate: "6.5%",
      status: "Active",
    },
  ];

  // CVM-relevant metrics: Top Performing Offers
  const topOffers = [
    {
      id: 1,
      name: "20% Discount - Premium",
      acceptanceRate: "68%",
      engagement: "12,450",
      status: "Active",
    },
    {
      id: 2,
      name: "Cashback Offer Q1",
      acceptanceRate: "54%",
      engagement: "9,820",
      status: "Active",
    },
    {
      id: 3,
      name: "Free Shipping Promo",
      acceptanceRate: "48%",
      engagement: "7,650",
      status: "Active",
    },
    {
      id: 4,
      name: "Buy One Get One",
      acceptanceRate: "42%",
      engagement: "6,230",
      status: "Active",
    },
  ];

  // Dummy data for distributions - using chart token colors
  const campaignStatusDistribution = [
    {
      status: "Active",
      count: 24,
      percentage: 60,
      color: color.charts.campaigns.active,
    },
    {
      status: "Pending",
      count: 8,
      percentage: 20,
      color: color.charts.campaigns.pending,
    },
    {
      status: "Paused",
      count: 5,
      percentage: 12.5,
      color: color.charts.campaigns.paused,
    },
    {
      status: "Completed",
      count: 3,
      percentage: 7.5,
      color: color.charts.campaigns.completed,
    },
  ];

  const segmentTypeDistribution = [
    {
      type: "Dynamic",
      count: 98,
      percentage: 62.8,
      color: color.charts.segments.dynamic,
    },
    {
      type: "Static",
      count: 45,
      percentage: 28.8,
      color: color.charts.segments.static,
    },
    {
      type: "Trigger",
      count: 13,
      percentage: 8.4,
      color: color.charts.segments.trigger,
    },
  ];

  // CVM-relevant: Items requiring attention
  const requiresAttention = [
    {
      id: 1,
      title: "Campaign Expiring Soon",
      description: "Q2 Customer Acquisition ends in 3 days",
      type: "campaign",
      action: "Review & Extend",
      priority: "high",
    },
    {
      id: 2,
      title: "Offer Expiring",
      description: "Spring Sale - 20% Off expires tomorrow",
      type: "offer",
      action: "Review",
      priority: "high",
    },
    {
      id: 3,
      title: "Pending Approval",
      description: "Premium Member Campaign awaiting approval",
      type: "approval",
      action: "Approve",
      priority: "medium",
    },
    {
      id: 4,
      title: "Segment Update Needed",
      description: "High Value Customers segment requires refresh",
      type: "segment",
      action: "Update",
      priority: "medium",
    },
  ];

  const quickActions = [
    {
      name: "Create Campaign",
      href: "/dashboard/campaigns/create",
      icon: Target,
    },
    { name: "New Offer", href: "/dashboard/offers/create", icon: Package },
    { name: "Build Segment", href: "/dashboard/segments/create", icon: Users },
    {
      name: "Create Product",
      href: "/dashboard/products/create",
      icon: ShoppingBag,
    },
    { name: "Configuration", href: "/dashboard/configuration", icon: Folder },
  ];

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "paused":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 pb-8">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="group bg-white rounded-2xl border border-gray-200 p-6 relative overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${color.primary.accent}15` }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: color.primary.accent }}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-3xl font-bold ${tw.textPrimary}`}>
                        {stat.value}
                      </p>
                      <p className={`${tw.cardSubHeading} ${tw.textSecondary}`}>
                        {stat.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      stat.changeType === "positive"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {stat.changeType === "positive" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                  <span className={`text-xs ${tw.textMuted}`}>
                    vs last month
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity and Quick Actions - Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className={tw.cardHeading}>Recent Activity</h2>
                  <p className={`${tw.cardSubHeading} text-black mt-1`}>
                    Latest campaigns, offers, and segments
                  </p>
                </div>
                {/* Filter Tabs */}
                <div className="flex gap-2">
                  {[
                    { key: "campaigns", label: "Campaigns" },
                    { key: "offers", label: "Offers" },
                    { key: "segments", label: "Segments" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() =>
                        setRecentActivityFilter(
                          tab.key as "campaigns" | "offers" | "segments"
                        )
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        recentActivityFilter === tab.key
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* Campaigns */}
                {recentActivityFilter === "campaigns" &&
                  campaigns.slice(0, 3).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all group"
                      onClick={() =>
                        navigate(`/dashboard/campaigns/${campaign.id}`)
                      }
                    >
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${color.primary.accent}15` }}
                      >
                        <Target
                          className="h-5 w-5"
                          style={{ color: color.primary.accent }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base text-gray-900 truncate">
                            {campaign.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-sm font-bold border flex-shrink-0 ${getStatusColor(
                              campaign.status
                            )}`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-black">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {campaign.segment}
                          </span>
                          {campaign.performance && (
                            <>
                              <span>•</span>
                              <span>
                                {campaign.performance.converted.toLocaleString()}{" "}
                                converted
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    </div>
                  ))}

                {/* Offers */}
                {recentActivityFilter === "offers" &&
                  recentOffers.slice(0, 3).map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-center gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all group"
                      onClick={() => navigate(`/dashboard/offers/${offer.id}`)}
                    >
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${color.primary.accent}15` }}
                      >
                        <Package
                          className="h-5 w-5"
                          style={{ color: color.primary.accent }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base text-gray-900 truncate">
                            {offer.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-sm font-bold border flex-shrink-0 ${getStatusColor(
                              offer.status
                            )}`}
                          >
                            {offer.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-black">
                          <span>{offer.type}</span>
                          <span>•</span>
                          <span>{offer.created}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    </div>
                  ))}

                {/* Segments */}
                {recentActivityFilter === "segments" &&
                  recentSegments.slice(0, 3).map((segment) => (
                    <div
                      key={segment.id}
                      className="flex items-center gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all group"
                      onClick={() =>
                        navigate(`/dashboard/segments/${segment.id}`)
                      }
                    >
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${color.primary.accent}15` }}
                      >
                        <Users
                          className="h-5 w-5"
                          style={{ color: color.primary.accent }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base text-gray-900 truncate">
                            {segment.name}
                          </h3>
                          <span className="px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 flex-shrink-0">
                            {segment.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-black">
                          <span>
                            {segment.members.toLocaleString()} members
                          </span>
                          <span>•</span>
                          <span>{segment.created}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    </div>
                  ))}

                {/* Empty State */}
                {((recentActivityFilter === "campaigns" &&
                  campaigns.length === 0) ||
                  (recentActivityFilter === "offers" &&
                    recentOffers.length === 0) ||
                  (recentActivityFilter === "segments" &&
                    recentSegments.length === 0)) && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">
                        No recent {recentActivityFilter} found
                      </p>
                      <button
                        onClick={() => {
                          if (recentActivityFilter === "campaigns") {
                            navigate("/dashboard/campaigns/create");
                          } else if (recentActivityFilter === "offers") {
                            navigate("/dashboard/offers/create");
                          } else if (recentActivityFilter === "segments") {
                            navigate("/dashboard/segments/create");
                          }
                        }}
                        className="text-sm font-medium"
                        style={{ color: color.primary.accent }}
                      >
                        Create your first {recentActivityFilter.slice(0, -1)} →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Quick Actions</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Common tasks and shortcuts
              </p>
            </div>
            <div className="p-6 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.name}
                    onClick={() => navigate(action.href)}
                    className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all"
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: color.primary.accent }}
                    />
                    <span className="font-semibold text-sm text-gray-700">
                      {action.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Offer Type Distribution */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className={tw.cardHeading}>Offer Type Distribution</h2>
                <p className={`${tw.cardSubHeading} text-black mt-1`}>
                  Breakdown by offer type
                </p>
              </div>
              <div className="p-6">
                {offerDistributionLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                      <p className="text-sm text-black">
                        Loading distribution...
                      </p>
                    </div>
                  </div>
                ) : offerTypeDistribution.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-sm text-black">
                        No offer type data available
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={offerTypeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {offerTypeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => value.toLocaleString()}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => (
                            <span
                              style={{ fontSize: "12px", color: "#000000" }}
                            >
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Segment Type Distribution */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className={tw.cardHeading}>Segment Type Distribution</h2>
                <p className={`${tw.cardSubHeading} text-black mt-1`}>
                  Breakdown by segment type
                </p>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={segmentTypeDistribution.map((item) => ({
                          name: item.type,
                          value: item.count,
                          color: item.color,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {segmentTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString()}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "8px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span style={{ fontSize: "12px", color: "#000000" }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers - CVM Focus */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Campaigns */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className={tw.cardHeading}>Top Performing Campaigns</h2>
                <p className={`${tw.cardSubHeading} text-black mt-1`}>
                  Campaigns by conversion rate
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topCampaigns.map((campaign, index) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                          style={{ backgroundColor: color.primary.accent }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-base text-black">
                            {campaign.name}
                          </p>
                          <p className="text-sm text-black">
                            Conversion: {campaign.conversionRate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-black">{campaign.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performing Offers */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className={tw.cardHeading}>Top Performing Offers</h2>
                <p className={`${tw.cardSubHeading} text-black mt-1`}>
                  Offers by acceptance rate
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topOffers.map((offer, index) => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                          style={{ backgroundColor: color.primary.accent }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-base text-black">
                            {offer.name}
                          </p>
                          <p className="text-sm text-black">
                            Acceptance: {offer.acceptanceRate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-blue-600">
                          {offer.engagement.toLocaleString()} engaged
                        </p>
                        <p className="text-sm text-black">{offer.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Campaign Status Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Campaign Status</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Campaign status distribution
              </p>
            </div>
            <div className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={campaignStatusDistribution.map((item) => ({
                        name: item.status,
                        value: item.count,
                        color: item.color,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {campaignStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString()}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "8px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span style={{ fontSize: "12px", color: "#000000" }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Requires Attention */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Requires Attention</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Action items that need your review
              </p>
            </div>
            <div className="p-6 space-y-4">
              {requiresAttention.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl p-5 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-base text-black">
                          {item.title}
                        </p>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            item.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.priority === "high" ? "High" : "Medium"}
                        </span>
                      </div>
                      <p className="text-sm text-black mb-2">
                        {item.description}
                      </p>
                      <button
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        onClick={() => {
                          // Navigate to appropriate page based on type
                          // This will be implemented when routing is ready
                        }}
                      >
                        {item.action} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
