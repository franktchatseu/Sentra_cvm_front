import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Target,
  Package,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
} from "lucide-react";
import { tw, color } from "../../../shared/utils/utils";
import CategoryDistributionChart, {
  CategoryView,
  CategoryChartPoint,
} from "../components/CategoryDistributionChart";
import { offerService } from "../../offers/services/offerService";
import { segmentService } from "../../segments/services/segmentService";
import { productService } from "../../products/services/productService";
import { campaignService } from "../../campaigns/services/campaignService";
import type { CampaignStatsSummary } from "../../campaigns/types/campaign";
import { sessionService } from "../../sessions/services/sessionService";
import { quicklistService } from "../../quicklists/services/quicklistService";
import dashboardService from "../services/dashboardService";

type SessionStatDatum = {
  session_type?: string;
  type?: string;
  key?: string;
  device_type?: string;
  device?: string;
  count?: number | string;
};

type SegmentCategoryDistributionItem = {
  category_name?: string;
  category_id?: number;
  segment_count?: number | string;
  count?: number | string;
};

type ProductCategoryStat = {
  category_name?: string;
  product_count?: number | string;
};

type OfferCategoryPerformanceItem = {
  category_name?: string;
  offer_count?: number | string;
  count?: number | string;
};

const parseMetricValue = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export default function OverallDashboardPerformancePage() {
  const [loading, setLoading] = useState(true);
  const [categoryView, setCategoryView] = useState<CategoryView>("segments");
  const [categoryChartData, setCategoryChartData] = useState<
    CategoryChartPoint[]
  >([]);
  const [categoryChartLoading, setCategoryChartLoading] = useState(false);

  // Stats state
  const [dashboardStats, setDashboardStats] = useState<{
    totalOffers: number;
    totalSegments: number;
    activeCampaigns: number;
    conversionRate: number;
  } | null>(null);

  const [offersStats, setOffersStats] = useState<{
    total: number;
    active: number;
    pendingApproval: number;
  } | null>(null);

  const [campaignsStats, setCampaignsStats] = useState<{
    total: number;
    active: number;
    completed: number;
  } | null>(null);

  const [sessionsStats, setSessionsStats] = useState<{
    active: number;
    byType: Array<{ type: string; count: number }>;
    byDevice: Array<{ device: string; count: number }>;
  } | null>(null);

  const [quicklistStats, setQuicklistStats] = useState<{
    total: number;
    recent: number;
  } | null>(null);

  // Time series data for trends
  const [trendData, setTrendData] = useState<
    Array<{
      date: string;
      campaigns: number;
      offers: number;
      segments: number;
      products: number;
    }>
  >([]);
  const [offerTypeDistribution, setOfferTypeDistribution] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [offerDistributionLoading, setOfferDistributionLoading] =
    useState(true);
  const [segmentTypeDistribution, setSegmentTypeDistribution] = useState<
    Array<{
      type: string;
      count: number;
      percentage: number;
      color: string;
    }>
  >([]);
  const [selectedTrendRange, setSelectedTrendRange] = useState("7d");
  const trendRangeOptions = [
    { id: "7d", label: "7 days" },
    { id: "14d", label: "14 days" },
    { id: "30d", label: "30 days" },
    { id: "90d", label: "90 days" },
  ];

  const parseCountValue = useCallback(
    (value: unknown): number => Math.max(0, parseMetricValue(value)),
    []
  );

  const accentColor = color.primary.accent;
  const trendColorTokens = useMemo(
    () => ({
      campaigns: color.charts.campaigns.active,
      offers: color.charts.offers.discount,
      segments: color.charts.segments.dynamic,
      products: color.charts.products.color1,
    }),
    []
  );
  const getDayCountForRange = useCallback((rangeId: string) => {
    const numeric = parseInt(rangeId.replace("d", ""), 10);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
    return 7;
  }, []);
  const isTrendDataMock = true;

  const categoryViewMeta = useMemo<
    Record<CategoryView, { title: string; subtitle: string }>
  >(
    () => ({
      segments: {
        title: "Segment Categories",
        subtitle: "Segment count per category",
      },
      offers: {
        title: "Offer Categories",
        subtitle: "Offer count per category",
      },
      campaigns: {
        title: "Campaign Categories",
        subtitle: "Category utilization",
      },
      products: {
        title: "Product Categories",
        subtitle: "Product count per category",
      },
    }),
    []
  );

  // Fetch all dashboard data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch main dashboard stats
        const stats = await dashboardService.getDashboardStats();
        setDashboardStats(stats);

        // Fetch offers stats
        try {
          const offersResponse = await offerService.getStats(true);
          const parseMetric = (value: unknown): number => {
            if (typeof value === "number") return value;
            if (typeof value === "string") {
              const parsed = parseInt(value, 10);
              return Number.isNaN(parsed) ? 0 : parsed;
            }
            return 0;
          };

          let total = 0;
          let active = 0;
          let pendingApproval = 0;

          if (offersResponse.success && offersResponse.data) {
            const data = offersResponse.data as Record<string, unknown>;
            total = parseMetric(
              data.totalOffers ?? data.total_offers ?? data.total
            );
            active = parseMetric(
              data.activeOffers ?? data.active_offers ?? data.active
            );
            pendingApproval = parseMetric(
              data.in_draft ?? data.inDraft ?? data.draft
            );
          }

          setOffersStats({ total, active, pendingApproval });
        } catch {
          setOffersStats({ total: 0, active: 0, pendingApproval: 0 });
        }

        // Fetch campaigns stats
        try {
          const campaignsStatsResponse = await campaignService.getCampaignStats(
            true
          );
          if (campaignsStatsResponse.success && campaignsStatsResponse.data) {
            const statsData =
              campaignsStatsResponse.data as CampaignStatsSummary;
            const total = parseMetricValue(statsData.total_campaigns);
            const active = parseMetricValue(
              statsData.active_campaigns ?? statsData.currently_active
            );
            const completed = parseMetricValue(statsData.completed);

            setCampaignsStats({ total, active, completed });
          }
        } catch {
          setCampaignsStats({ total: 0, active: 0, completed: 0 });
        }

        // Fetch sessions stats
        try {
          const [activeCount, byType, byDevice] = await Promise.all([
            sessionService.getActiveCount(),
            sessionService.getStatsBySessionType(),
            sessionService.getStatsByDeviceType(),
          ]);

          setSessionsStats({
            active:
              activeCount.success && activeCount.data
                ? parseMetricValue(activeCount.data.count)
                : 0,
            byType:
              byType.success && Array.isArray(byType.data)
                ? byType.data.map((item) => {
                    const datum = item as SessionStatDatum;
                    return {
                      type:
                        datum.session_type ||
                        datum.type ||
                        datum.key ||
                        "Unknown",
                      count: parseMetricValue(datum.count),
                    };
                  })
                : [],
            byDevice:
              byDevice.success && Array.isArray(byDevice.data)
                ? byDevice.data.map((item) => {
                    const datum = item as SessionStatDatum;
                    return {
                      device:
                        datum.device_type || datum.device || datum.key || "N/A",
                      count: parseMetricValue(datum.count),
                    };
                  })
                : [],
          });
        } catch {
          setSessionsStats({ active: 0, byType: [], byDevice: [] });
        }

        // Fetch quicklist stats
        try {
          const quicklistResponse = await quicklistService.getStats({
            skipCache: true,
          });
          if (quicklistResponse.success && quicklistResponse.data) {
            const data = quicklistResponse.data as {
              total?: number | string;
              total_quicklists?: number | string;
              recent?: number | string;
            };
            setQuicklistStats({
              total: parseMetricValue(data.total || data.total_quicklists),
              recent: parseMetricValue(data.recent || 0),
            });
          }
        } catch {
          setQuicklistStats({ total: 0, recent: 0 });
        }
      } catch (error) {
        console.error("Error fetching dashboard performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const dayCount = getDayCountForRange(selectedTrendRange);
    const now = new Date();
    const generated: Array<{
      date: string;
      campaigns: number;
      offers: number;
      segments: number;
      products: number;
    }> = [];

    for (let i = dayCount - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      generated.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        campaigns: Math.floor(Math.random() * 20) + 10,
        offers: Math.floor(Math.random() * 30) + 15,
        segments: Math.floor(Math.random() * 15) + 8,
        products: Math.floor(Math.random() * 25) + 12,
      });
    }

    setTrendData(generated);
  }, [selectedTrendRange, getDayCountForRange]);

  // Fetch category chart data
  useEffect(() => {
    let isMounted = true;

    const fetchCategoryChartData = async () => {
      try {
        setCategoryChartLoading(true);
        let dataset: CategoryChartPoint[] = [];

        if (categoryView === "segments") {
          const response = await segmentService.getCategoryDistribution(true);
          if (response.success && response.data) {
            const raw: SegmentCategoryDistributionItem[] = Array.isArray(
              response.data
            )
              ? (response.data as SegmentCategoryDistributionItem[])
              : [];
            dataset = raw
              .map((item, index) => ({
                label:
                  item.category_name ||
                  `Category ${item.category_id ?? index + 1}`,
                value: parseCountValue(item.segment_count ?? item.count ?? 0),
              }))
              .filter((item) => item.value > 0);
          }
        } else if (categoryView === "products") {
          const response = await productService.getStats(true);
          if (response.success && response.data) {
            const productStatsData = response.data as {
              products_by_category?: ProductCategoryStat[];
            };
            const raw = Array.isArray(productStatsData.products_by_category)
              ? productStatsData.products_by_category
              : [];
            dataset = raw
              .map((item, index) => ({
                label: item.category_name || `Category ${index + 1}`,
                value: parseCountValue(item.product_count ?? 0),
              }))
              .filter((item) => item.value > 0);
          }
        } else if (categoryView === "campaigns") {
          const response = await campaignService.getCampaignCategoryStats(true);
          if (response.success && response.data) {
            const data = response.data as {
              categories_with_campaigns?: unknown;
              categories_without_campaigns?: unknown;
            };
            dataset = [
              {
                label: "With Campaigns",
                value: parseCountValue(data.categories_with_campaigns),
              },
              {
                label: "Without Campaigns",
                value: parseCountValue(data.categories_without_campaigns),
              },
            ].filter((item) => item.value > 0);
          }
        } else if (categoryView === "offers") {
          const response = await offerService.getCategoryPerformance(true);
          if (response.success && response.data) {
            const raw: OfferCategoryPerformanceItem[] = Array.isArray(
              response.data
            )
              ? (response.data as OfferCategoryPerformanceItem[])
              : [];
            dataset = raw
              .map((item, index: number) => ({
                label: item.category_name || `Category ${index + 1}`,
                value: parseCountValue(item.offer_count ?? item.count ?? 0),
              }))
              .filter((item) => item.value > 0);
          }
        }

        if (isMounted) {
          setCategoryChartData(dataset);
        }
      } catch (error) {
        console.error("Failed to load category distribution:", error);
        if (isMounted) {
          setCategoryChartData([]);
        }
      } finally {
        if (isMounted) {
          setCategoryChartLoading(false);
        }
      }
    };

    fetchCategoryChartData();

    return () => {
      isMounted = false;
    };
  }, [categoryView, parseCountValue]);

  // Fetch Offer Type Distribution
  useEffect(() => {
    const fetchOfferTypeDistribution = async () => {
      try {
        setOfferDistributionLoading(true);
        const response = await offerService.getTypeDistribution();

        if (response.success && response.data) {
          const data = response.data;
          const typeColorMap: Record<string, string> = {
            discount: color.charts.offers.discount,
            cashback: color.charts.offers.cashback,
            freeShipping: color.charts.offers.freeShipping,
            buyOneGetOne: color.charts.offers.buyOneGetOne,
            voucher: color.charts.offers.voucher,
            data: color.charts.offers.discount,
            voice: color.charts.offers.cashback,
            sms: color.charts.offers.freeShipping,
            combo: color.charts.offers.buyOneGetOne,
            loyalty: color.charts.offers.voucher,
            bundle: color.charts.offers.discount,
            bonus: color.charts.offers.cashback,
          };

          let chartData: Array<{ name: string; value: number; color: string }> =
            [];

          if (Array.isArray(data)) {
            chartData = data
              .filter((item: { count?: string }) => {
                const count = parseInt(item.count || "0", 10);
                return count > 0;
              })
              .map((item: { offer_type?: string; count?: string }) => {
                const offerType = (item.offer_type || "").toLowerCase();
                const count = parseInt(item.count || "0", 10);
                return {
                  name: offerType.charAt(0).toUpperCase() + offerType.slice(1),
                  value: count,
                  color:
                    typeColorMap[offerType] || color.charts.offers.discount,
                };
              });
          } else if (data && typeof data === "object") {
            chartData = Object.entries(data)
              .filter(([, value]) => {
                const numValue =
                  typeof value === "number"
                    ? value
                    : parseInt(String(value), 10);
                return numValue > 0;
              })
              .map(([type, value]) => {
                const numValue =
                  typeof value === "number"
                    ? value
                    : parseInt(String(value), 10);
                return {
                  name: type.charAt(0).toUpperCase() + type.slice(1),
                  value: numValue,
                  color:
                    typeColorMap[type.toLowerCase()] ||
                    color.charts.offers.discount,
                };
              });
          }

          setOfferTypeDistribution(chartData.length > 0 ? chartData : []);
        } else {
          setOfferTypeDistribution([]);
        }
      } catch {
        setOfferTypeDistribution([]);
      } finally {
        setOfferDistributionLoading(false);
      }
    };

    fetchOfferTypeDistribution();
  }, []);

  // Fetch Segment Type Distribution
  useEffect(() => {
    const fetchSegmentTypeDistribution = async () => {
      try {
        const response = await segmentService.getTypeDistribution();

        if (response.success && response.data) {
          const data = response.data;
          let distribution: Array<{
            type: string;
            count: number;
            percentage: number;
            color: string;
          }> = [];

          if (Array.isArray(data)) {
            const total = data.reduce((sum, item) => {
              return sum + parseInt(item.count || "0", 10);
            }, 0);

            distribution = data
              .map((item) => {
                const segmentType = (item.type || "").toLowerCase();
                const count = parseInt(item.count || "0", 10);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const typeColorMap: Record<string, string> = {
                  dynamic: color.charts.segments.dynamic,
                  static: color.charts.segments.static,
                  trigger: color.charts.segments.trigger,
                  hybrid: color.charts.segments.hybrid,
                };

                return {
                  type:
                    segmentType.charAt(0).toUpperCase() + segmentType.slice(1),
                  count,
                  percentage,
                  color:
                    typeColorMap[segmentType] || color.charts.segments.dynamic,
                };
              })
              .filter((item) => item.count > 0);
          } else if (data && typeof data === "object") {
            const total =
              data.total || data.dynamic + data.static + data.trigger || 0;

            distribution = [
              {
                type: "Dynamic",
                count: parseInt(String(data.dynamic || 0), 10),
                percentage:
                  total > 0
                    ? (parseInt(String(data.dynamic || 0), 10) / total) * 100
                    : 0,
                color: color.charts.segments.dynamic,
              },
              {
                type: "Static",
                count: parseInt(String(data.static || 0), 10),
                percentage:
                  total > 0
                    ? (parseInt(String(data.static || 0), 10) / total) * 100
                    : 0,
                color: color.charts.segments.static,
              },
              {
                type: "Trigger",
                count: parseInt(String(data.trigger || 0), 10),
                percentage:
                  total > 0
                    ? (parseInt(String(data.trigger || 0), 10) / total) * 100
                    : 0,
                color: color.charts.segments.trigger,
              },
            ].filter((item) => item.count > 0);
          }

          setSegmentTypeDistribution(distribution);
        } else {
          setSegmentTypeDistribution([]);
        }
      } catch {
        setSegmentTypeDistribution([]);
      }
    };

    fetchSegmentTypeDistribution();
  }, []);

  const kpiCards = useMemo(() => {
    if (!dashboardStats) return [];
    return [
      {
        name: "Total Campaigns",
        value: campaignsStats?.total?.toLocaleString() || "0",
        icon: Target,
        trend: "+12.5%",
        trendUp: true,
      },
      {
        name: "Total Offers",
        value: offersStats?.total?.toLocaleString() || "0",
        icon: Package,
        trend: "+8.3%",
        trendUp: true,
      },
      {
        name: "Total Segments",
        value: dashboardStats.totalSegments.toLocaleString(),
        icon: Users,
        trend: "+15.2%",
        trendUp: true,
      },
      {
        name: "Active Sessions",
        value: sessionsStats?.active?.toLocaleString() || "0",
        icon: Activity,
        trend: "+5.7%",
        trendUp: true,
      },
      {
        name: "Conversion Rate",
        value: `${dashboardStats.conversionRate.toFixed(1)}%`,
        icon: TrendingUp,
        trend: "+2.1%",
        trendUp: true,
      },
      {
        name: "Quicklists",
        value: quicklistStats?.total?.toLocaleString() || "0",
        icon: BarChart3,
        trend: "+3.4%",
        trendUp: true,
      },
    ];
  }, [
    dashboardStats,
    campaignsStats,
    offersStats,
    sessionsStats,
    quicklistStats,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
          Overall Dashboard Performance
        </h1>
        <p className={`${tw.textSecondary} ${tw.body}`}>
          Comprehensive analytics and insights across all platform modules
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.name}
              className="group bg-white rounded-md border border-gray-200 p-6 relative overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <Icon className="w-full h-full" style={{ color: "#d1d5db" }} />
              </div>
              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-md flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: color.surface.background }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: accentColor }}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-3xl font-bold ${tw.textPrimary}`}>
                        {kpi.value}
                      </p>
                      <p className={`${tw.cardSubHeading} ${tw.textSecondary}`}>
                        {kpi.name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      kpi.trendUp
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {kpi.trendUp ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {kpi.trend}
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

      {/* Category Distribution Chart - Enhanced */}
      <div className="mb-6">
        <CategoryDistributionChart
          title={categoryViewMeta[categoryView].title}
          subtitle={categoryViewMeta[categoryView].subtitle}
          data={categoryChartData}
          loading={categoryChartLoading}
          selectedView={categoryView}
          onViewChange={setCategoryView}
        />
      </div>

      {/* Offer & Segment Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
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
                  <p className="text-sm text-black">Loading distribution...</p>
                </div>
              </div>
            ) : offerTypeDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-black">
                  No offer type data available
                </p>
              </div>
            ) : (
              <div className="h-64 w-full min-h-[256px]">
                <ResponsiveContainer width="100%" height={256}>
                  <PieChart>
                    <Pie
                      data={offerTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      dataKey="value"
                      isAnimationActive={true}
                      animationDuration={300}
                    >
                      {offerTypeDistribution.map((entry, index) => (
                        <Cell key={`offer-cell-${index}`} fill={entry.color} />
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
            )}
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className={tw.cardHeading}>Segment Type Distribution</h2>
            <p className={`${tw.cardSubHeading} text-black mt-1`}>
              Breakdown by segment type
            </p>
          </div>
          <div className="p-6">
            {segmentTypeDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-black">
                  No segment type data available
                </p>
              </div>
            ) : (
              <div className="h-64 w-full min-h-[256px]">
                <ResponsiveContainer width="100%" height={256}>
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
                      dataKey="value"
                      isAnimationActive={true}
                      animationDuration={300}
                    >
                      {segmentTypeDistribution.map((entry, index) => (
                        <Cell
                          key={`segment-cell-${index}`}
                          fill={entry.color}
                        />
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
            )}
          </div>
        </div>
      </div>

      {/* Trends Over Time - Line Chart */}
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className={tw.cardHeading}>Performance Trends</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Activity over selectable time ranges
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {
                    trendRangeOptions.find(
                      (option) => option.id === selectedTrendRange
                    )?.label
                  }
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendRangeOptions.map((option) => {
                  const isActive = selectedTrendRange === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedTrendRange(option.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        isActive
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
                <Line
                  type="monotone"
                  dataKey="campaigns"
                  stroke={trendColorTokens.campaigns}
                  strokeWidth={3}
                  dot={{ fill: trendColorTokens.campaigns, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Campaigns"
                />
                <Line
                  type="monotone"
                  dataKey="offers"
                  stroke={trendColorTokens.offers}
                  strokeWidth={3}
                  dot={{ fill: trendColorTokens.offers, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Offers"
                />
                <Line
                  type="monotone"
                  dataKey="segments"
                  stroke={trendColorTokens.segments}
                  strokeWidth={3}
                  dot={{ fill: trendColorTokens.segments, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Segments"
                />
                <Line
                  type="monotone"
                  dataKey="products"
                  stroke={trendColorTokens.products}
                  strokeWidth={3}
                  dot={{ fill: trendColorTokens.products, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Products"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            {isTrendDataMock
              ? "Using sample data until time-series APIs are wired up. Planned sources: campaignService.getCampaignsByDateRange, offerService.getOffersByDateRange, segmentService.getSegments, productService.getStats."
              : "Powered by live campaign, offer, segment, and product activity APIs."}
          </p>
        </div>
      </div>

      {/* Additional Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Types Distribution */}
        {sessionsStats && sessionsStats.byType.length > 0 && (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Session Types</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Distribution by session type
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionsStats.byType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="type"
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={{ stroke: "#E5E7EB" }}
                    />
                    <YAxis
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={{ stroke: "#E5E7EB" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "8px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill={color.primary.accent}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Device Types Distribution */}
        {sessionsStats && sessionsStats.byDevice.length > 0 && (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Device Types</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Distribution by device type
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionsStats.byDevice}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="device"
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={{ stroke: "#E5E7EB" }}
                    />
                    <YAxis
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={{ stroke: "#E5E7EB" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "8px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill={accentColor}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2 rounded-md"
              style={{ backgroundColor: color.surface.background }}
            >
              <Target className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Campaigns
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {campaignsStats?.active?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {campaignsStats?.completed || 0} completed this month
          </p>
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2 rounded-md"
              style={{ backgroundColor: color.surface.background }}
            >
              <Package className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Offers</p>
              <p className="text-2xl font-bold text-gray-900">
                {offersStats?.active?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {offersStats?.pendingApproval || 0} pending approval
          </p>
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2 rounded-md"
              style={{ backgroundColor: color.surface.background }}
            >
              <Activity className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Sessions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {sessionsStats?.active?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Real-time user activity</p>
        </div>
      </div>
    </div>
  );
}
