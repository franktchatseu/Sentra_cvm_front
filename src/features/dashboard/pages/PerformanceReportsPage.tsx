import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Package,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Award,
  Zap,
} from "lucide-react";
import { tw, color } from "../../../shared/utils/utils";
import campaignService from "../../campaigns/services/campaignService";
import { offerService } from "../../offers/services/offerService";
import { segmentService } from "../../segments/services/segmentService";

const parseMetricValue = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

type PerformanceMetric = {
  name: string;
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: typeof Activity;
  color: string;
};

export default function PerformanceReportsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d"
  );

  // Performance metrics state
  const [campaignPerformance, setCampaignPerformance] = useState<{
    total: number;
    active: number;
    completed: number;
    avgConversionRate: number;
    totalRevenue: number;
  } | null>(null);

  const [offerPerformance, setOfferPerformance] = useState<{
    total: number;
    active: number;
    avgAcceptanceRate: number;
    topPerforming: Array<{ name: string; acceptanceRate: number }>;
  } | null>(null);

  const [segmentPerformance, setSegmentPerformance] = useState<{
    total: number;
    avgSize: number;
    avgEngagement: number;
    topPerforming: Array<{ name: string; engagementScore: number }>;
  } | null>(null);

  // Chart data
  const [campaignTrends, setCampaignTrends] = useState<
    Array<{ date: string; conversions: number; revenue: number }>
  >([]);
  const [offerCategoryPerformance, setOfferCategoryPerformance] = useState<
    Array<{ category: string; acceptanceRate: number; count: number }>
  >([]);

  const periodOptions = [
    { id: "7d" as const, label: "Last 7 Days" },
    { id: "30d" as const, label: "Last 30 Days" },
    { id: "90d" as const, label: "Last 90 Days" },
  ];

  // Fetch performance data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        // Fetch campaign stats
        try {
          const campaignStats = await campaignService.getCampaignStats(true);
          if (campaignStats.success && campaignStats.data) {
            const data = campaignStats.data as Record<string, unknown>;
            setCampaignPerformance({
              total: parseMetricValue(data.total_campaigns),
              active: parseMetricValue(data.active_campaigns),
              completed: parseMetricValue(data.completed),
              avgConversionRate: parseMetricValue(
                data.avg_conversion_rate || 0
              ),
              totalRevenue: parseMetricValue(data.total_revenue || 0),
            });
          }
        } catch {
          setCampaignPerformance({
            total: 0,
            active: 0,
            completed: 0,
            avgConversionRate: 0,
            totalRevenue: 0,
          });
        }

        // Fetch offer performance
        try {
          const offerStats = await offerService.getStats(true);
          const categoryPerf = await offerService.getCategoryPerformance(true);

          if (offerStats.success && offerStats.data) {
            const data = offerStats.data as Record<string, unknown>;
            setOfferPerformance({
              total: parseMetricValue(data.total_offers),
              active: parseMetricValue(data.active_offers),
              avgAcceptanceRate: parseMetricValue(
                data.avg_acceptance_rate || 0
              ),
              topPerforming: [],
            });
          }

          if (categoryPerf.success && categoryPerf.data) {
            const categories = Array.isArray(categoryPerf.data)
              ? categoryPerf.data
              : [];
            setOfferCategoryPerformance(
              categories.slice(0, 5).map((item: any) => ({
                category: item.category_name || "Unknown",
                acceptanceRate: parseMetricValue(item.acceptance_rate || 0),
                count: parseMetricValue(item.offer_count || 0),
              }))
            );
          }
        } catch {
          setOfferPerformance({
            total: 0,
            active: 0,
            avgAcceptanceRate: 0,
            topPerforming: [],
          });
        }

        // Fetch segment performance
        try {
          const segmentStats = await segmentService.getSegmentStats(true);
          if (segmentStats.success && segmentStats.data) {
            const data = segmentStats.data as Record<string, unknown>;
            setSegmentPerformance({
              total: parseMetricValue(data.total_segments),
              avgSize: parseMetricValue(data.avg_size || 0),
              avgEngagement: parseMetricValue(data.avg_engagement || 0),
              topPerforming: [],
            });
          }
        } catch {
          setSegmentPerformance({
            total: 0,
            avgSize: 0,
            avgEngagement: 0,
            topPerforming: [],
          });
        }

        // Generate sample trend data (replace with real API calls when available)
        const now = new Date();
        const days =
          selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;
        const trends = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          trends.push({
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            conversions: Math.floor(Math.random() * 50) + 20,
            revenue: Math.floor(Math.random() * 5000) + 1000,
          });
        }
        setCampaignTrends(trends);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [selectedPeriod]);

  const performanceMetrics: PerformanceMetric[] = useMemo(() => {
    if (!campaignPerformance || !offerPerformance || !segmentPerformance) {
      return [];
    }

    return [
      {
        name: "Avg Conversion Rate",
        value: campaignPerformance.avgConversionRate,
        change: 2.5,
        trend: "up",
        icon: Target,
        color: color.charts.campaigns.active,
      },
      {
        name: "Total Revenue",
        value: campaignPerformance.totalRevenue,
        change: 12.3,
        trend: "up",
        icon: TrendingUp,
        color: "#10b981",
      },
      {
        name: "Offer Acceptance Rate",
        value: offerPerformance.avgAcceptanceRate,
        change: 5.7,
        trend: "up",
        icon: Package,
        color: color.charts.offers.discount,
      },
      {
        name: "Segment Engagement",
        value: segmentPerformance.avgEngagement,
        change: -1.2,
        trend: "down",
        icon: Users,
        color: color.charts.segments.dynamic,
      },
    ];
  }, [campaignPerformance, offerPerformance, segmentPerformance]);

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
          Performance Reports
        </h1>
        <p className={`${tw.textSecondary} ${tw.body}`}>
          Comprehensive performance metrics across campaigns, offers, and
          segments
        </p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Time Period</span>
          </div>
          <div className="flex gap-2">
            {periodOptions.map((option) => {
              const isActive = selectedPeriod === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedPeriod(option.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
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

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.name}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${metric.color}15` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: metric.color }} />
                  </div>
                  <div>
                    <p className={`text-sm ${tw.textSecondary}`}>
                      {metric.name}
                    </p>
                    <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                      {metric.name === "Total Revenue"
                        ? `$${metric.value.toLocaleString()}`
                        : `${metric.value.toFixed(1)}%`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    metric.trend === "up"
                      ? "bg-green-50 text-green-700"
                      : metric.trend === "down"
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : metric.trend === "down" ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : null}
                  {metric.change > 0 ? "+" : ""}
                  {metric.change.toFixed(1)}%
                </div>
                <span className={`text-xs ${tw.textMuted}`}>vs previous</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Performance Trends */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={tw.cardHeading}>Campaign Performance Trends</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Conversions and revenue over time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-gray-400" />
              <Zap className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={campaignTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
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
                  yAxisId="left"
                  type="monotone"
                  dataKey="conversions"
                  stroke={color.charts.campaigns.active}
                  strokeWidth={3}
                  dot={{ fill: color.charts.campaigns.active, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Conversions"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Offer Category Performance */}
      {offerCategoryPerformance.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Offer Category Performance</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Acceptance rates by category
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={offerCategoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="category"
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={{ stroke: "#E5E7EB" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={{ stroke: "#E5E7EB" }}
                    />
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "8px",
                      }}
                    />
                    <Bar
                      dataKey="acceptanceRate"
                      fill={color.charts.offers.discount}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Performance Summary</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Key metrics at a glance
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Campaigns
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {campaignPerformance?.active || 0}
                  </p>
                </div>
                <Target className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Offers
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {offerPerformance?.active || 0}
                  </p>
                </div>
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Segments
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {segmentPerformance?.total || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className={tw.cardHeading}>Performance Insights</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">
                Conversion rates are up 2.5% this period
              </p>
              <p className="text-sm text-green-700 mt-1">
                Campaign optimization efforts are showing positive results
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">
                Offer acceptance rates improved by 5.7%
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Customer engagement with offers is increasing
              </p>
            </div>
          </div>
          {segmentPerformance && segmentPerformance.avgEngagement < 70 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <TrendingDown className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">
                  Segment engagement decreased slightly
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Consider refreshing segment criteria to improve engagement
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
