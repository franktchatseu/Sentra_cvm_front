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
  Target,
  TrendingUp,
  Calendar,
  Award,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { tw, color } from "../../../shared/utils/utils";
import campaignService from "../../campaigns/services/campaignService";
import { useNavigate } from "react-router-dom";

const parseMetricValue = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export default function CampaignReportsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d"
  );

  // Campaign stats
  const [campaignStats, setCampaignStats] = useState<{
    total: number;
    active: number;
    completed: number;
    pendingApproval: number;
    byStatus: Array<{ status: string; count: number; color: string }>;
    byCategory: Array<{ category: string; count: number }>;
  } | null>(null);

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    avgConversionRate: number;
    totalRevenue: number;
    totalParticipants: number;
    avgBudgetUtilization: number;
  } | null>(null);

  // Trends
  const [campaignTrends, setCampaignTrends] = useState<
    Array<{
      date: string;
      created: number;
      completed: number;
      revenue: number;
    }>
  >([]);

  const periodOptions = [
    { id: "7d" as const, label: "Last 7 Days" },
    { id: "30d" as const, label: "Last 30 Days" },
    { id: "90d" as const, label: "Last 90 Days" },
  ];

  const statusColorMap: Record<string, string> = {
    active: color.charts.campaigns.active,
    completed: color.charts.campaigns.completed,
    pending_approval: color.charts.campaigns.pending,
    draft: color.charts.campaigns.draft,
    paused: color.charts.campaigns.paused,
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch campaign stats
        const statsResponse = await campaignService.getCampaignStats(true);
        if (statsResponse.success && statsResponse.data) {
          const data = statsResponse.data as Record<string, unknown>;

          const total = parseMetricValue(data.total_campaigns);
          const active = parseMetricValue(data.active_campaigns);
          const completed = parseMetricValue(data.completed);
          const pendingApproval = parseMetricValue(data.pending_approval);

          // Build status distribution
          const byStatus = [
            {
              status: "Active",
              count: active,
              color: statusColorMap.active,
            },
            {
              status: "Completed",
              count: completed,
              color: statusColorMap.completed,
            },
            {
              status: "Pending Approval",
              count: pendingApproval,
              color: statusColorMap.pending_approval,
            },
            {
              status: "Draft",
              count: parseMetricValue(data.in_draft),
              color: statusColorMap.draft,
            },
          ].filter((item) => item.count > 0);

          setCampaignStats({
            total,
            active,
            completed,
            pendingApproval,
            byStatus,
            byCategory: [], // Would need category stats endpoint
          });

          setPerformanceMetrics({
            avgConversionRate: parseMetricValue(data.avg_conversion_rate || 0),
            totalRevenue: parseMetricValue(data.total_revenue || 0),
            totalParticipants: parseMetricValue(data.total_participants || 0),
            avgBudgetUtilization: parseMetricValue(
              data.avg_budget_utilization || 0
            ),
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
            created: Math.floor(Math.random() * 5) + 1,
            completed: Math.floor(Math.random() * 3),
            revenue: Math.floor(Math.random() * 3000) + 500,
          });
        }
        setCampaignTrends(trends);
      } catch (error) {
        console.error("Error fetching campaign reports:", error);
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
          <p className="text-sm text-gray-600">Loading campaign reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
          Campaign Reports
        </h1>
        <p className={`${tw.textSecondary} ${tw.body}`}>
          Comprehensive campaign performance, status, and analytics
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
              style={{ backgroundColor: `${color.charts.campaigns.active}15` }}
            >
              <Target
                className="h-6 w-6"
                style={{ color: color.charts.campaigns.active }}
              />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Total Campaigns</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {campaignStats?.total.toLocaleString() || "0"}
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
              <p className={`text-sm ${tw.textSecondary}`}>Avg Conversion</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {performanceMetrics?.avgConversionRate.toFixed(1) || "0.0"}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "#8b5cf615" }}
            >
              <DollarSign className="h-6 w-6" style={{ color: "#8b5cf6" }} />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Total Revenue</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                ${performanceMetrics?.totalRevenue.toLocaleString() || "0"}
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
              <p className={`text-sm ${tw.textSecondary}`}>Participants</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {performanceMetrics?.totalParticipants.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Trends */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className={tw.cardHeading}>Campaign Activity Trends</h2>
          <p className={`${tw.cardSubHeading} text-black mt-1`}>
            Campaign creation, completion, and revenue over time
          </p>
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
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="created"
                  stroke={color.charts.campaigns.active}
                  strokeWidth={3}
                  dot={{ fill: color.charts.campaigns.active, r: 4 }}
                  name="Created"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="completed"
                  stroke={color.charts.campaigns.completed}
                  strokeWidth={3}
                  dot={{ fill: color.charts.campaigns.completed, r: 4 }}
                  name="Completed"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      {campaignStats && campaignStats.byStatus.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Campaign Status Distribution</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Breakdown by status
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={campaignStats.byStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      dataKey="count"
                    >
                      {campaignStats.byStatus.map((entry, index) => (
                        <Cell key={`status-cell-${index}`} fill={entry.color} />
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

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className={tw.cardHeading}>Quick Actions</h2>
            <div className="mt-4 space-y-3">
              <button
                onClick={() => navigate("/dashboard/campaigns")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    View All Campaigns
                  </span>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={() => navigate("/dashboard/campaigns/create")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    Create New Campaign
                  </span>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={() =>
                  navigate("/dashboard/campaigns?status=pending_approval")
                }
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    Pending Approvals ({campaignStats.pendingApproval})
                  </span>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
