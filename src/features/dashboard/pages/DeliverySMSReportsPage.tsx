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
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";
import { tw, color } from "../../../shared/utils/utils";

const parseMetricValue = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export default function DeliverySMSReportsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d"
  );

  // Delivery stats
  const [deliveryStats, setDeliveryStats] = useState<{
    totalSent: number;
    delivered: number;
    failed: number;
    pending: number;
    deliveryRate: number;
    byChannel: Array<{ channel: string; sent: number; delivered: number }>;
    byStatus: Array<{ status: string; count: number; color: string }>;
  } | null>(null);

  // SMS stats
  const [smsStats, setSmsStats] = useState<{
    totalSent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
    avgDeliveryTime: number;
    byCarrier: Array<{ carrier: string; count: number }>;
  } | null>(null);

  // Trends
  const [deliveryTrends, setDeliveryTrends] = useState<
    Array<{
      date: string;
      sent: number;
      delivered: number;
      failed: number;
    }>
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
        // TODO: Replace with actual delivery/SMS API endpoints when available
        // For now, using sample data structure
        const totalSent = 125000;
        const delivered = 118750;
        const failed = 5000;
        const pending = 1250;

        setDeliveryStats({
          totalSent,
          delivered,
          failed,
          pending,
          deliveryRate: (delivered / totalSent) * 100,
          byChannel: [
            { channel: "SMS", sent: 80000, delivered: 76000 },
            { channel: "Email", sent: 35000, delivered: 33250 },
            { channel: "Push", sent: 10000, delivered: 9500 },
          ],
          byStatus: [
            { status: "Delivered", count: delivered, color: "#10b981" },
            { status: "Failed", count: failed, color: "#ef4444" },
            { status: "Pending", count: pending, color: "#f59e0b" },
          ],
        });

        setSmsStats({
          totalSent: 80000,
          delivered: 76000,
          failed: 3000,
          deliveryRate: 95,
          avgDeliveryTime: 2.5,
          byCarrier: [
            { carrier: "Carrier A", count: 35000 },
            { carrier: "Carrier B", count: 28000 },
            { carrier: "Carrier C", count: 17000 },
          ],
        });

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
            sent: Math.floor(Math.random() * 5000) + 2000,
            delivered: Math.floor(Math.random() * 4500) + 1800,
            failed: Math.floor(Math.random() * 200) + 50,
          });
        }
        setDeliveryTrends(trends);
      } catch (error) {
        console.error("Error fetching delivery/SMS data:", error);
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
            Loading delivery & SMS data...
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
          Delivery & SMS Reports
        </h1>
        <p className={`${tw.textSecondary} ${tw.body}`}>
          Message delivery rates, SMS performance, and channel analytics
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
              style={{ backgroundColor: `${color.primary.accent}15` }}
            >
              <Send
                className="h-6 w-6"
                style={{ color: color.primary.accent }}
              />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Total Sent</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {deliveryStats?.totalSent.toLocaleString() || "0"}
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
              <CheckCircle className="h-6 w-6" style={{ color: "#10b981" }} />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Delivered</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {deliveryStats?.delivered.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-md"
              style={{ backgroundColor: "#ef444415" }}
            >
              <XCircle className="h-6 w-6" style={{ color: "#ef4444" }} />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Failed</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {deliveryStats?.failed.toLocaleString() || "0"}
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
              <TrendingUp className="h-6 w-6" style={{ color: "#8b5cf6" }} />
            </div>
            <div>
              <p className={`text-sm ${tw.textSecondary}`}>Delivery Rate</p>
              <p className={`text-2xl font-bold ${tw.textPrimary} mt-1`}>
                {deliveryStats?.deliveryRate.toFixed(1) || "0.0"}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Trends */}
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className={tw.cardHeading}>Delivery Trends</h2>
          <p className={`${tw.cardSubHeading} text-black mt-1`}>
            Message sending and delivery performance over time
          </p>
        </div>
        <div className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deliveryTrends}>
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
                  dataKey="sent"
                  stroke={color.primary.accent}
                  strokeWidth={3}
                  dot={{ fill: color.primary.accent, r: 4 }}
                  name="Sent"
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Delivered"
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", r: 4 }}
                  name="Failed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Status */}
        {deliveryStats && deliveryStats.byStatus.length > 0 && (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Delivery Status</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Breakdown by delivery status
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deliveryStats.byStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      dataKey="count"
                    >
                      {deliveryStats.byStatus.map((entry, index) => (
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
        )}

        {/* Channel Performance */}
        {deliveryStats && deliveryStats.byChannel.length > 0 && (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Channel Performance</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Delivery by communication channel
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deliveryStats.byChannel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="channel"
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
                    <Legend />
                    <Bar
                      dataKey="sent"
                      fill={color.primary.accent}
                      radius={[8, 8, 0, 0]}
                      name="Sent"
                    />
                    <Bar
                      dataKey="delivered"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                      name="Delivered"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SMS Specific Metrics */}
      {smsStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <h2 className={tw.cardHeading}>SMS Performance</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    SMS Delivery Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {smsStats.deliveryRate.toFixed(1)}%
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Delivery Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {smsStats.avgDeliveryTime.toFixed(1)}s
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>

          {smsStats.byCarrier.length > 0 && (
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className={tw.cardHeading}>SMS by Carrier</h2>
                <p className={`${tw.cardSubHeading} text-black mt-1`}>
                  Distribution by SMS carrier
                </p>
              </div>
              <div className="p-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={smsStats.byCarrier}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="carrier"
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
                        fill="#8b5cf6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This page uses sample data structure. Connect
          to actual delivery and SMS reporting endpoints when available.
        </p>
      </div>
    </div>
  );
}
