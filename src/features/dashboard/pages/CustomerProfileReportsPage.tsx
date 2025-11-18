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
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  MapPin,
  Activity,
} from "lucide-react";
import { tw, color } from "../../../shared/utils/utils";
import { userService } from "../../users/services/userService";
import { sessionService } from "../../sessions/services/sessionService";

const parseMetricValue = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export default function CustomerProfileReportsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d"
  );

  // User stats
  const [userStats, setUserStats] = useState<{
    total: number;
    active: number;
    inactive: number;
    byDepartment: Array<{ department: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  } | null>(null);

  // Session stats
  const [sessionStats, setSessionStats] = useState<{
    active: number;
    total: number;
    byType: Array<{ type: string; count: number }>;
    byCountry: Array<{ country: string; count: number }>;
    avgDuration: number;
  } | null>(null);

  // Activity trends
  const [activityTrends, setActivityTrends] = useState<
    Array<{ date: string; logins: number; sessions: number }>
  >([]);

  const periodOptions = [
    { id: "7d" as const, label: "Last 7 Days" },
    { id: "30d" as const, label: "Last 30 Days" },
    { id: "90d" as const, label: "Last 90 Days" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user status counts
        try {
          const statusCounts = await userService.getStatusCounts({
            skipCache: true,
          });
          const deptCounts = await userService.getDepartmentCounts({
            skipCache: true,
          });

          if (statusCounts.success && statusCounts.data) {
            const statusData = statusCounts.data as Record<string, number>;
            const byStatus = Object.entries(statusData).map(
              ([status, count]) => ({
                status: status.charAt(0).toUpperCase() + status.slice(1),
                count: parseMetricValue(count),
              })
            );

            const total = byStatus.reduce((sum, item) => sum + item.count, 0);
            const active = parseMetricValue(statusData.active || 0);
            const inactive = parseMetricValue(statusData.inactive || 0);

            let byDepartment: Array<{ department: string; count: number }> = [];
            if (deptCounts.success && deptCounts.data) {
              const deptData = deptCounts.data as Record<string, number>;
              byDepartment = Object.entries(deptData).map(([dept, count]) => ({
                department: dept || "Unassigned",
                count: parseMetricValue(count),
              }));
            }

            setUserStats({
              total,
              active,
              inactive,
              byDepartment,
              byStatus,
            });
          }
        } catch {
          setUserStats({
            total: 0,
            active: 0,
            inactive: 0,
            byDepartment: [],
            byStatus: [],
          });
        }

        // Fetch session stats
        try {
          const [activeCount, byType, byCountry, avgDuration] =
            await Promise.all([
              sessionService.getActiveCount(),
              sessionService.getStatsBySessionType(),
              sessionService.getStatsByCountry(),
              sessionService.getAverageDuration(),
            ]);

          setSessionStats({
            active:
              activeCount.success && activeCount.data
                ? parseMetricValue(activeCount.data.count)
                : 0,
            total: 0, // Would need separate endpoint
            byType:
              byType.success && Array.isArray(byType.data)
                ? (
                    byType.data as Array<{
                      session_type?: string;
                      type?: string;
                      count?: number;
                    }>
                  ).map((item) => ({
                    type: item.session_type || item.type || "Unknown",
                    count: parseMetricValue(item.count),
                  }))
                : [],
            byCountry:
              byCountry.success && Array.isArray(byCountry.data)
                ? (
                    byCountry.data as Array<{
                      country?: string;
                      count?: number;
                    }>
                  ).map((item) => ({
                    country: item.country || "Unknown",
                    count: parseMetricValue(item.count),
                  }))
                : [],
            avgDuration:
              avgDuration.success && avgDuration.data
                ? parseMetricValue(avgDuration.data.avg_duration_seconds)
                : 0,
          });
        } catch {
          setSessionStats({
            active: 0,
            total: 0,
            byType: [],
            byCountry: [],
            avgDuration: 0,
          });
        }

        // Generate sample activity trends
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
            logins: Math.floor(Math.random() * 100) + 50,
            sessions: Math.floor(Math.random() * 150) + 80,
          });
        }
        setActivityTrends(trends);
      } catch (error) {
        console.error("Error fetching customer profile data:", error);
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
            Loading customer profile data...
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
          Customer Profile Reports
        </h1>
        <p className={`${tw.textSecondary} ${tw.body}`}>
          User activity, session analytics, and profile distribution insights
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
              style={{ backgroundColor: `${color.primary.accent}15` }}
            >
              <Users
                className="h-6 w-6"
                style={{ color: color.primary.accent }}
              />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Total Users</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {userStats?.total.toLocaleString() || "0"}
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
              <UserCheck className="h-6 w-6" style={{ color: "#10b981" }} />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Active Users</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {userStats?.active.toLocaleString() || "0"}
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
              <Activity
                className="h-6 w-6"
                style={{ color: color.primary.accent }}
              />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Active Sessions</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {sessionStats?.active.toLocaleString() || "0"}
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
              <TrendingUp className="h-6 w-6" style={{ color: "#8b5cf6" }} />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>
                Avg Session Duration
              </p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {sessionStats?.avgDuration
                  ? `${Math.round(sessionStats.avgDuration / 60)}m`
                  : "0m"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Trends */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className={tw.cardHeading}>User Activity Trends</h2>
          <p className={`${tw.cardSubHeading} text-black mt-1`}>
            Login and session activity over time
          </p>
        </div>
        <div className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityTrends}>
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
                  dataKey="logins"
                  stroke={color.primary.accent}
                  strokeWidth={3}
                  dot={{ fill: color.primary.accent, r: 4 }}
                  name="Logins"
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                  name="Sessions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Status Distribution */}
        {userStats && userStats.byStatus.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>User Status Distribution</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Breakdown by user status
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userStats.byStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      dataKey="count"
                    >
                      {userStats.byStatus.map((entry, index) => {
                        const colors = [
                          color.charts.campaigns.active,
                          color.charts.campaigns.pending,
                          color.charts.campaigns.completed,
                          "#6b7280",
                        ];
                        return (
                          <Cell
                            key={`status-cell-${index}`}
                            fill={colors[index % colors.length]}
                          />
                        );
                      })}
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

        {/* Department Distribution */}
        {userStats && userStats.byDepartment.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Department Distribution</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Users by department
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userStats.byDepartment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="department"
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
                      fill={color.primary.accent}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Types */}
        {sessionStats && sessionStats.byType.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Session Types</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Distribution by session type
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionStats.byType}>
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
                      fill={color.charts.offers.discount}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Sessions by Country */}
        {sessionStats && sessionStats.byCountry.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Sessions by Country</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Geographic distribution
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionStats.byCountry.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="country"
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
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
