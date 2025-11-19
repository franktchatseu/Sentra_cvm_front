import { useState, useEffect } from "react";
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
  Layers,
  TrendingUp,
  Calendar,
  Users,
  Activity,
  ArrowUpRight,
  Database,
} from "lucide-react";
import { tw, color } from "../../../shared/utils/utils";
import { segmentService } from "../../segments/services/segmentService";
import { useNavigate } from "react-router-dom";

const parseMetricValue = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export default function SegmentLevelReportsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d"
  );

  // Segment stats
  const [segmentStats, setSegmentStats] = useState<{
    total: number;
    byType: Array<{ type: string; count: number; color: string }>;
    byCategory: Array<{ category: string; count: number }>;
    largest: Array<{ name: string; size: number }>;
  } | null>(null);

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    avgSize: number;
    avgEngagement: number;
    totalMembers: number;
    healthScore: number;
  } | null>(null);

  // Trends
  const [segmentTrends, setSegmentTrends] = useState<
    Array<{
      date: string;
      created: number;
      computed: number;
      totalMembers: number;
    }>
  >([]);

  const periodOptions = [
    { id: "7d" as const, label: "Last 7 Days" },
    { id: "30d" as const, label: "Last 30 Days" },
    { id: "90d" as const, label: "Last 90 Days" },
  ];

  const typeColorMap: Record<string, string> = {
    dynamic: color.charts.segments.dynamic,
    static: color.charts.segments.static,
    trigger: color.charts.segments.trigger,
    hybrid: color.charts.segments.hybrid,
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch segment stats
        const [statsResponse, typeResponse, categoryResponse, healthResponse] =
          await Promise.all([
            segmentService.getSegmentStats(true),
            segmentService.getTypeDistribution(true),
            segmentService.getCategoryDistribution(true),
            segmentService.getHealthSummary(),
          ]);

        if (statsResponse.success && statsResponse.data) {
          const data = statsResponse.data as Record<string, unknown>;
          const total = parseMetricValue(data.total_segments || data.total);

          let byType: Array<{ type: string; count: number; color: string }> =
            [];
          if (typeResponse.success && typeResponse.data) {
            const typeData = Array.isArray(typeResponse.data)
              ? typeResponse.data
              : [];
            byType = typeData
              .map((item: any) => {
                const segmentType = (item.type || "").toLowerCase();
                return {
                  type:
                    segmentType.charAt(0).toUpperCase() + segmentType.slice(1),
                  count: parseMetricValue(item.count),
                  color:
                    typeColorMap[segmentType] || color.charts.segments.dynamic,
                };
              })
              .filter((item) => item.count > 0);
          }

          let byCategory: Array<{ category: string; count: number }> = [];
          if (categoryResponse.success && categoryResponse.data) {
            const catData = Array.isArray(categoryResponse.data)
              ? categoryResponse.data
              : [];
            byCategory = catData
              .slice(0, 10)
              .map((item: any) => ({
                category: item.category_name || "Unknown",
                count: parseMetricValue(item.segment_count || item.count || 0),
              }))
              .filter((item) => item.count > 0);
          }

          setSegmentStats({
            total,
            byType,
            byCategory,
            largest: [],
          });

          if (healthResponse.success && healthResponse.data) {
            const healthData = healthResponse.data as Record<string, unknown>;
            setPerformanceMetrics({
              avgSize: parseMetricValue(healthData.avg_size || 0),
              avgEngagement: parseMetricValue(healthData.avg_engagement || 0),
              totalMembers: parseMetricValue(healthData.total_members || 0),
              healthScore: parseMetricValue(healthData.health_score || 0),
            });
          } else {
            setPerformanceMetrics({
              avgSize: 0,
              avgEngagement: 0,
              totalMembers: 0,
              healthScore: 0,
            });
          }
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
            computed: Math.floor(Math.random() * 8) + 2,
            totalMembers: Math.floor(Math.random() * 50000) + 10000,
          });
        }
        setSegmentTrends(trends);
      } catch (error) {
        console.error("Error fetching segment reports:", error);
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
          <p className="text-sm text-gray-600">Loading segment reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
          Segment Level Reports
        </h1>
        <p className={`${tw.textSecondary} ${tw.body}`}>
          Segment health, distribution, and performance analytics
        </p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-md border border-gray-200 p-4">
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
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
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
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-md"
              style={{ backgroundColor: `${color.charts.segments.dynamic}15` }}
            >
              <Layers
                className="h-6 w-6"
                style={{ color: color.charts.segments.dynamic }}
              />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Total Segments</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {segmentStats?.total.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-md"
              style={{ backgroundColor: "#10b98115" }}
            >
              <Users className="h-6 w-6" style={{ color: "#10b981" }} />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Total Members</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {performanceMetrics?.totalMembers.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-md"
              style={{ backgroundColor: `${color.primary.accent}15` }}
            >
              <TrendingUp
                className="h-6 w-6"
                style={{ color: color.primary.accent }}
              />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Avg Engagement</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {performanceMetrics?.avgEngagement.toFixed(1) || "0.0"}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-md"
              style={{ backgroundColor: "#8b5cf615" }}
            >
              <Activity className="h-6 w-6" style={{ color: "#8b5cf6" }} />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Health Score</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {performanceMetrics?.healthScore.toFixed(0) || "0"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Segment Trends */}
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className={tw.cardHeading}>Segment Activity Trends</h2>
          <p className={`${tw.cardSubHeading} text-black mt-1`}>
            Segment creation, computation, and member growth over time
          </p>
        </div>
        <div className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={segmentTrends}>
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
                  stroke={color.charts.segments.dynamic}
                  strokeWidth={3}
                  dot={{ fill: color.charts.segments.dynamic, r: 4 }}
                  name="Created"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="computed"
                  stroke={color.charts.segments.static}
                  strokeWidth={3}
                  dot={{ fill: color.charts.segments.static, r: 4 }}
                  name="Computed"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalMembers"
                  stroke={color.charts.segments.trigger}
                  strokeWidth={3}
                  dot={{ fill: color.charts.segments.trigger, r: 4 }}
                  name="Total Members"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Type Distribution */}
        {segmentStats && segmentStats.byType.length > 0 && (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Segment Type Distribution</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Breakdown by segment type
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentStats.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      dataKey="count"
                    >
                      {segmentStats.byType.map((entry, index) => (
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

        {/* Category Distribution */}
        {segmentStats && segmentStats.byCategory.length > 0 && (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Category Distribution</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Segments by category
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segmentStats.byCategory}>
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
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "8px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill={color.charts.segments.dynamic}
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
      <div className="bg-white rounded-md border border-gray-200 p-6">
        <h2 className={tw.cardHeading}>Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/dashboard/segments")}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                View All Segments
              </span>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => navigate("/dashboard/segments?action=create")}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                Create New Segment
              </span>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => navigate("/dashboard/segment-catalogs")}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                Segment Catalogs
              </span>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

