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
  Package,
  TrendingUp,
  Calendar,
  Award,
  Users,
  ArrowUpRight,
  Gift,
} from "lucide-react";
import { tw, color } from "../../../shared/utils/utils";
import { offerService } from "../../offers/services/offerService";
import { useNavigate } from "react-router-dom";

const parseMetricValue = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export default function OfferPerformanceReportsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d"
  );

  // Offer stats
  const [offerStats, setOfferStats] = useState<{
    total: number;
    active: number;
    pendingApproval: number;
    byType: Array<{ type: string; count: number; color: string }>;
    byCategory: Array<{
      category: string;
      acceptanceRate: number;
      count: number;
    }>;
  } | null>(null);

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    avgAcceptanceRate: number;
    totalEngagements: number;
    topPerforming: Array<{ name: string; acceptanceRate: number }>;
  } | null>(null);

  // Trends
  const [offerTrends, setOfferTrends] = useState<
    Array<{
      date: string;
      created: number;
      accepted: number;
      engagements: number;
    }>
  >([]);

  const periodOptions = [
    { id: "7d" as const, label: "Last 7 Days" },
    { id: "30d" as const, label: "Last 30 Days" },
    { id: "90d" as const, label: "Last 90 Days" },
  ];

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
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch offer stats
        const [statsResponse, typeResponse, categoryResponse] =
          await Promise.all([
            offerService.getStats(true),
            offerService.getTypeDistribution(true),
            offerService.getCategoryPerformance(true),
          ]);

        if (statsResponse.success && statsResponse.data) {
          const data = statsResponse.data as Record<string, unknown>;
          const total = parseMetricValue(data.total_offers || data.total);
          const active = parseMetricValue(data.active_offers || data.active);
          const pendingApproval = parseMetricValue(
            data.in_draft || data.pending_approval
          );

          let byType: Array<{ type: string; count: number; color: string }> =
            [];
          if (typeResponse.success && typeResponse.data) {
            const typeData = Array.isArray(typeResponse.data)
              ? typeResponse.data
              : [];
            byType = typeData
              .map((item: any) => {
                const offerType = (
                  item.offer_type ||
                  item.type ||
                  ""
                ).toLowerCase();
                return {
                  type: offerType.charAt(0).toUpperCase() + offerType.slice(1),
                  count: parseMetricValue(item.count),
                  color:
                    typeColorMap[offerType] || color.charts.offers.discount,
                };
              })
              .filter((item) => item.count > 0);
          }

          let byCategory: Array<{
            category: string;
            acceptanceRate: number;
            count: number;
          }> = [];
          if (categoryResponse.success && categoryResponse.data) {
            const catData = Array.isArray(categoryResponse.data)
              ? categoryResponse.data
              : [];
            byCategory = catData
              .slice(0, 10)
              .map((item: any) => ({
                category: item.category_name || "Unknown",
                acceptanceRate: parseMetricValue(item.acceptance_rate || 0),
                count: parseMetricValue(item.offer_count || item.count || 0),
              }))
              .filter((item) => item.count > 0);
          }

          setOfferStats({
            total,
            active,
            pendingApproval,
            byType,
            byCategory,
          });

          setPerformanceMetrics({
            avgAcceptanceRate: parseMetricValue(data.avg_acceptance_rate || 0),
            totalEngagements: parseMetricValue(data.total_engagements || 0),
            topPerforming: [],
          });
        }

        // Generate sample trends
        const days =
          selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;
        const now = new Date();
        const trends = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          trends.push({
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            created: Math.floor(Math.random() * 8) + 2,
            accepted: Math.floor(Math.random() * 50) + 20,
            engagements: Math.floor(Math.random() * 200) + 100,
          });
        }
        setOfferTrends(trends);
      } catch (error) {
        console.error("Error fetching offer performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">
            Loading offer performance data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
          Offer Performance Reports
        </h1>
        <p className={`${tw.textSecondary} ${tw.body}`}>
          Offer acceptance rates, engagement metrics, and performance analytics
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${color.charts.offers.discount}15` }}
            >
              <Package
                className="h-6 w-6"
                style={{ color: color.charts.offers.discount }}
              />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Total Offers</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {offerStats?.total.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "#10b98115" }}
            >
              <TrendingUp className="h-6 w-6" style={{ color: "#10b981" }} />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>
                Avg Acceptance Rate
              </p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {performanceMetrics?.avgAcceptanceRate.toFixed(1) || "0.0"}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${color.primary.accent}15` }}
            >
              <Users
                className="h-6 w-6"
                style={{ color: color.primary.accent }}
              />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Total Engagements</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {performanceMetrics?.totalEngagements.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${color.charts.offers.cashback}15` }}
            >
              <Gift
                className="h-6 w-6"
                style={{ color: color.charts.offers.cashback }}
              />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Active Offers</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {offerStats?.active.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Trends */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className={tw.cardHeading}>Offer Activity Trends</h2>
          <p className={`${tw.cardSubHeading} text-black mt-1`}>
            Offer creation, acceptance, and engagement over time
          </p>
        </div>
        <div className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={offerTrends}>
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
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke={color.charts.offers.discount}
                  strokeWidth={3}
                  dot={{ fill: color.charts.offers.discount, r: 4 }}
                  name="Created"
                />
                <Line
                  type="monotone"
                  dataKey="accepted"
                  stroke={color.charts.offers.cashback}
                  strokeWidth={3}
                  dot={{ fill: color.charts.offers.cashback, r: 4 }}
                  name="Accepted"
                />
                <Line
                  type="monotone"
                  dataKey="engagements"
                  stroke={color.charts.offers.freeShipping}
                  strokeWidth={3}
                  dot={{ fill: color.charts.offers.freeShipping, r: 4 }}
                  name="Engagements"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offer Type Distribution */}
        {offerStats && offerStats.byType.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Offer Type Distribution</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Breakdown by offer type
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={offerStats.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      dataKey="count"
                    >
                      {offerStats.byType.map((entry, index) => (
                        <Cell key={`type-cell-${index}`} fill={entry.color} />
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
        )}

        {/* Category Performance */}
        {offerStats && offerStats.byCategory.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Category Performance</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Acceptance rates by category
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={offerStats.byCategory}>
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
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className={tw.cardHeading}>Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/dashboard/offers")}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">View All Offers</span>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => navigate("/dashboard/offers/create")}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                Create New Offer
              </span>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() =>
              navigate("/dashboard/offers?status=pending_approval")
            }
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                Pending Approvals ({offerStats?.pendingApproval || 0})
              </span>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
