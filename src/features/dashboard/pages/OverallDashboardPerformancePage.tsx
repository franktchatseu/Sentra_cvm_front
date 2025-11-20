import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  // LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { Eye, MousePointerClick, Target, TrendingUp } from "lucide-react";
import { colors } from "../../../shared/utils/tokens";

type RangeOption = "7d" | "30d" | "90d";
type ChannelFilter = "All Channels" | "SMS" | "Email" | "Push" | "Social";

type ReachMetrics = {
  reach: number;
};

type EngagementMetrics = {
  clicks: number;
  ctr: number; // Click-Through Rate
  openRate: number; // Email/SMS Open Rate
  engagementRate: number; // Social Media Engagement
};

type ConversionMetrics = {
  conversions: number;
  cvr: number; // Conversion Rate
  cpc: number; // Cost Per Click
  cpl: number; // Cost Per Lead
  cpa: number; // Cost Per Acquisition
  roas: number; // Return on Ad Spend
  revenue: number;
  spend: number;
};

type ChannelData = {
  channel: string;
  reach: number;
  clicks: number;
  opens: number;
  conversions: number;
  revenue: number;
  spend: number;
  ctr: number;
  openRate: number;
  cvr: number;
  cpc: number;
  cpl: number;
  cpa: number;
  roas: number;
  engagementRate: number;
};

type SMSDeliveryData = {
  date: string;
  sent: number;
  delivered: number;
  converted: number;
};

type PerformanceSnapshot = {
  reach: ReachMetrics;
  engagement: EngagementMetrics;
  conversion: ConversionMetrics;
  channels: ChannelData[];
  smsDelivery: SMSDeliveryData[];
  timeSeries: {
    date: string;
    reach: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }[];
};

const timeRangeOptions: RangeOption[] = ["7d", "30d", "90d"];
const rangeDays: Record<RangeOption, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const getDaysBetween = (start: string, end: string) => {
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  if (
    !startDate ||
    !endDate ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return null;
  }
  const diff = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const mapDaysToRange = (days: number | null): RangeOption => {
  if (days === null) return "7d";
  if (days <= 7) return "7d";
  if (days <= 30) return "30d";
  return "90d";
};

const channelOptions: ChannelFilter[] = [
  "All Channels",
  "SMS",
  "Email",
  "Push",
  "Social",
];

const mockPerformanceSnapshots: Record<RangeOption, PerformanceSnapshot> = {
  "7d": {
    reach: {
      reach: 125_000,
    },
    engagement: {
      clicks: 12_500,
      ctr: 10.0,
      openRate: 68.5,
      engagementRate: 12.3,
    },
    conversion: {
      conversions: 925,
      cvr: 7.4,
      cpc: 0.45,
      cpl: 6.2,
      cpa: 18.5,
      roas: 4.2,
      revenue: 74_000,
      spend: 17_625,
    },
    channels: [
      {
        channel: "SMS",
        reach: 450_000,
        clicks: 45_000,
        opens: 315_000,
        conversions: 36_000,
        revenue: 288_000,
        spend: 67_500,
        ctr: 10.0,
        openRate: 70.0,
        cvr: 8.0,
        cpc: 0.5,
        cpl: 6.25,
        cpa: 18.75,
        roas: 4.3,
        engagementRate: 0,
      },
      {
        channel: "Email",
        reach: 350_000,
        clicks: 35_000,
        opens: 231_000,
        conversions: 26_250,
        revenue: 210_000,
        spend: 52_500,
        ctr: 10.0,
        openRate: 66.0,
        cvr: 7.5,
        cpc: 0.4,
        cpl: 6.0,
        cpa: 20.0,
        roas: 4.0,
        engagementRate: 0,
      },
      {
        channel: "Push",
        reach: 250_000,
        clicks: 25_000,
        opens: 175_000,
        conversions: 18_000,
        revenue: 144_000,
        spend: 37_500,
        ctr: 10.0,
        openRate: 70.0,
        cvr: 7.2,
        cpc: 0.5,
        cpl: 6.5,
        cpa: 20.83,
        roas: 3.8,
        engagementRate: 0,
      },
      {
        channel: "Social",
        reach: 200_000,
        clicks: 20_000,
        opens: 0,
        conversions: 11_400,
        revenue: 91_200,
        spend: 16_000,
        ctr: 10.0,
        openRate: 0,
        cvr: 5.7,
        cpc: 0.8,
        cpl: 7.0,
        cpa: 13.95,
        roas: 5.7,
        engagementRate: 15.0,
      },
    ],
    smsDelivery: [
      {
        date: "Day 1",
        sent: 12_500,
        delivered: 11_800,
        converted: 945,
      },
      {
        date: "Day 2",
        sent: 12_200,
        delivered: 11_500,
        converted: 920,
      },
      {
        date: "Day 3",
        sent: 12_800,
        delivered: 12_100,
        converted: 968,
      },
      {
        date: "Day 4",
        sent: 12_400,
        delivered: 11_700,
        converted: 936,
      },
      {
        date: "Day 5",
        sent: 12_600,
        delivered: 11_900,
        converted: 952,
      },
      {
        date: "Day 6",
        sent: 12_100,
        delivered: 11_400,
        converted: 912,
      },
      {
        date: "Day 7",
        sent: 12_300,
        delivered: 11_600,
        converted: 928,
      },
    ],
    timeSeries: [
      {
        date: "Day 1",
        reach: 18_000,
        clicks: 1_800,
        conversions: 1_330,
        revenue: 10_640,
      },
      {
        date: "Day 2",
        reach: 17_500,
        clicks: 1_750,
        conversions: 1_300,
        revenue: 10_400,
      },
      {
        date: "Day 3",
        reach: 18_500,
        clicks: 1_850,
        conversions: 1_370,
        revenue: 10_960,
      },
      {
        date: "Day 4",
        reach: 18_200,
        clicks: 1_820,
        conversions: 1_350,
        revenue: 10_800,
      },
      {
        date: "Day 5",
        reach: 18_800,
        clicks: 1_880,
        conversions: 1_390,
        revenue: 11_120,
      },
      {
        date: "Day 6",
        reach: 17_800,
        clicks: 1_780,
        conversions: 1_320,
        revenue: 10_560,
      },
      {
        date: "Day 7",
        reach: 18_000,
        clicks: 1_800,
        conversions: 1_330,
        revenue: 10_640,
      },
    ],
  },
  "30d": {
    reach: {
      reach: 540_000,
    },
    engagement: {
      clicks: 54_000,
      ctr: 10.0,
      openRate: 68.2,
      engagementRate: 12.5,
    },
    conversion: {
      conversions: 3_996,
      cvr: 7.4,
      cpc: 0.44,
      cpl: 6.15,
      cpa: 18.3,
      roas: 4.3,
      revenue: 319_680,
      spend: 74_250,
    },
    channels: [
      {
        channel: "SMS",
        reach: 1_950_000,
        clicks: 195_000,
        opens: 1_365_000,
        conversions: 156_000,
        revenue: 1_248_000,
        spend: 292_500,
        ctr: 10.0,
        openRate: 70.0,
        cvr: 8.0,
        cpc: 0.5,
        cpl: 6.25,
        cpa: 18.75,
        roas: 4.3,
        engagementRate: 0,
      },
      {
        channel: "Email",
        reach: 1_500_000,
        clicks: 150_000,
        opens: 990_000,
        conversions: 112_500,
        revenue: 900_000,
        spend: 225_000,
        ctr: 10.0,
        openRate: 66.0,
        cvr: 7.5,
        cpc: 0.4,
        cpl: 6.0,
        cpa: 20.0,
        roas: 4.0,
        engagementRate: 0,
      },
      {
        channel: "Push",
        reach: 1_050_000,
        clicks: 105_000,
        opens: 735_000,
        conversions: 75_600,
        revenue: 604_800,
        spend: 157_500,
        ctr: 10.0,
        openRate: 70.0,
        cvr: 7.2,
        cpc: 0.5,
        cpl: 6.5,
        cpa: 20.83,
        roas: 3.8,
        engagementRate: 0,
      },
      {
        channel: "Social",
        reach: 900_000,
        clicks: 90_000,
        opens: 0,
        conversions: 51_300,
        revenue: 410_400,
        spend: 72_000,
        ctr: 10.0,
        openRate: 0,
        cvr: 5.7,
        cpc: 0.8,
        cpl: 7.0,
        cpa: 13.95,
        roas: 5.7,
        engagementRate: 15.2,
      },
    ],
    smsDelivery: [
      {
        date: "Oct 1-7",
        sent: 52_000,
        delivered: 49_000,
        converted: 3_920,
      },
      {
        date: "Oct 8-14",
        sent: 54_000,
        delivered: 51_000,
        converted: 4_080,
      },
      {
        date: "Oct 15-21",
        sent: 53_000,
        delivered: 50_000,
        converted: 4_000,
      },
      {
        date: "Oct 22-28",
        sent: 55_000,
        delivered: 52_000,
        converted: 4_160,
      },
    ],
    timeSeries: [
      {
        date: "Oct 1-7",
        reach: 135_000,
        clicks: 13_500,
        conversions: 9_990,
        revenue: 79_920,
      },
      {
        date: "Oct 8-14",
        reach: 135_000,
        clicks: 13_500,
        conversions: 9_990,
        revenue: 79_920,
      },
      {
        date: "Oct 15-21",
        reach: 135_000,
        clicks: 13_500,
        conversions: 9_990,
        revenue: 79_920,
      },
      {
        date: "Oct 22-28",
        reach: 135_000,
        clicks: 13_500,
        conversions: 9_990,
        revenue: 79_920,
      },
    ],
  },
  "90d": {
    reach: {
      reach: 1_620_000,
    },
    engagement: {
      clicks: 162_000,
      ctr: 10.0,
      openRate: 68.0,
      engagementRate: 12.7,
    },
    conversion: {
      conversions: 11_988,
      cvr: 7.4,
      cpc: 0.43,
      cpl: 6.1,
      cpa: 18.0,
      roas: 4.4,
      revenue: 959_040,
      spend: 222_750,
    },
    channels: [
      {
        channel: "SMS",
        reach: 5_850_000,
        clicks: 585_000,
        opens: 4_095_000,
        conversions: 468_000,
        revenue: 3_744_000,
        spend: 877_500,
        ctr: 10.0,
        openRate: 70.0,
        cvr: 8.0,
        cpc: 0.5,
        cpl: 6.25,
        cpa: 18.75,
        roas: 4.3,
        engagementRate: 0,
      },
      {
        channel: "Email",
        reach: 4_500_000,
        clicks: 450_000,
        opens: 2_970_000,
        conversions: 337_500,
        revenue: 2_700_000,
        spend: 675_000,
        ctr: 10.0,
        openRate: 66.0,
        cvr: 7.5,
        cpc: 0.4,
        cpl: 6.0,
        cpa: 20.0,
        roas: 4.0,
        engagementRate: 0,
      },
      {
        channel: "Push",
        reach: 3_150_000,
        clicks: 315_000,
        opens: 2_205_000,
        conversions: 226_800,
        revenue: 1_814_400,
        spend: 472_500,
        ctr: 10.0,
        openRate: 70.0,
        cvr: 7.2,
        cpc: 0.5,
        cpl: 6.5,
        cpa: 20.83,
        roas: 3.8,
        engagementRate: 0,
      },
      {
        channel: "Social",
        reach: 2_700_000,
        clicks: 270_000,
        opens: 0,
        conversions: 153_900,
        revenue: 1_231_200,
        spend: 216_000,
        ctr: 10.0,
        openRate: 0,
        cvr: 5.7,
        cpc: 0.8,
        cpl: 7.0,
        cpa: 13.95,
        roas: 5.7,
        engagementRate: 15.5,
      },
    ],
    smsDelivery: [
      {
        date: "September",
        sent: 156_000,
        delivered: 147_000,
        converted: 11_760,
      },
      {
        date: "October",
        sent: 162_000,
        delivered: 153_000,
        converted: 12_240,
      },
      {
        date: "November",
        sent: 159_000,
        delivered: 150_000,
        converted: 12_000,
      },
    ],
    timeSeries: [
      {
        date: "September",
        reach: 405_000,
        clicks: 40_500,
        conversions: 29_970,
        revenue: 239_760,
      },
      {
        date: "October",
        reach: 405_000,
        clicks: 40_500,
        conversions: 29_970,
        revenue: 239_760,
      },
      {
        date: "November",
        reach: 405_000,
        clicks: 40_500,
        conversions: 29_970,
        revenue: 239_760,
      },
    ],
  },
};

const formatNumber = (value: number) => {
  return value.toLocaleString("en-US");
};

const formatCurrency = (value: number) => {
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
};

const chartColors = {
  // Channel Performance
  clicks: "#3b82f6", // Blue
  conversions: "#10b981", // Green
  ctr: "#f59e0b", // Orange
  cvr: "#ef4444", // Red
  // SMS Delivery
  sent: colors.tertiary.tag1, // Purple - initial send
  delivered: "#3b82f6", // Blue - successful delivery
  converted: "#15803d", // Dark Green - final conversion success
  // Time Series
  reach: "#6366f1", // Indigo
  timeClicks: colors.tertiary.tag1, // Purple for time series clicks
  timeConversions: colors.tertiary.tag3, // Yellow/Orange for conversions
  revenue: colors.status.success, // Green for revenue
};

type ChartTooltipEntry = {
  color?: string;
  name?: string;
  value?: number | string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-gray-900">{label}</p>
      {payload.map((entry, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-4 text-sm"
        >
          <span className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}</span>
          </span>
          <span className="font-semibold text-gray-900">
            {typeof entry.value === "number"
              ? formatNumber(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function OverallDashboardPerformancePage() {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("7d");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [channelFilter, setChannelFilter] =
    useState<ChannelFilter>("All Channels");

  const customDays = getDaysBetween(customRange.start, customRange.end);
  const activeRangeKey: RangeOption =
    customRange.start && customRange.end
      ? mapDaysToRange(customDays)
      : selectedRange;

  const kpiSnapshot = mockPerformanceSnapshots[activeRangeKey];
  const channelSnapshot = mockPerformanceSnapshots[activeRangeKey];
  const smsDeliverySnapshot = mockPerformanceSnapshots[activeRangeKey];
  const timeSeriesSnapshot = mockPerformanceSnapshots[activeRangeKey];

  const filteredChannels = useMemo(() => {
    if (channelFilter === "All Channels") {
      return channelSnapshot.channels;
    }
    return channelSnapshot.channels.filter(
      (channel) => channel.channel === channelFilter
    );
  }, [channelFilter, channelSnapshot]);

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Overall Dashboard Performance
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            System-wide performance metrics and analytics
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {timeRangeOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSelectedRange(option);
                  setCustomRange({ start: "", end: "" });
                }}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  !(customRange.start && customRange.end) &&
                  selectedRange === option
                    ? "border-[#252829] bg-[#252829] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="overall-date-start"
                className="text-sm text-gray-600"
              >
                From
              </label>
              <input
                id="overall-date-start"
                type="date"
                value={customRange.start}
                onChange={(event) =>
                  setCustomRange((prev) => ({
                    ...prev,
                    start: event.target.value,
                  }))
                }
                className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="overall-date-end"
                className="text-sm text-gray-600"
              >
                To
              </label>
              <input
                id="overall-date-end"
                type="date"
                value={customRange.end}
                onChange={(event) =>
                  setCustomRange((prev) => ({
                    ...prev,
                    end: event.target.value,
                  }))
                }
                className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setCustomRange({ start: "", end: "" })}
              className="text-sm font-medium text-gray-600 underline"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Performance Metrics */}
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Eye
                className="h-5 w-5"
                style={{ color: colors.primary.accent }}
              />
              <p className="text-sm font-medium text-gray-600">Reach</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatNumber(kpiSnapshot.reach.reach)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Users reached</p>
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MousePointerClick
                className="h-5 w-5"
                style={{ color: colors.primary.accent }}
              />
              <p className="text-sm font-medium text-gray-600">Clicks</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatNumber(kpiSnapshot.engagement.clicks)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Total clicks on campaign links
            </p>
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp
                className="h-5 w-5"
                style={{ color: colors.primary.accent }}
              />
              <p className="text-sm font-medium text-gray-600">
                Click-Through Rate (CTR)
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {kpiSnapshot.engagement.ctr.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Messages clicked vs sent
            </p>
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MousePointerClick
                className="h-5 w-5"
                style={{ color: colors.primary.accent }}
              />
              <p className="text-sm font-medium text-gray-600">Open Rate</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {kpiSnapshot.engagement.openRate.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Messages opened vs sent
            </p>
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Target
                className="h-5 w-5"
                style={{ color: colors.primary.accent }}
              />
              <p className="text-sm font-medium text-gray-600">Conversions</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatNumber(kpiSnapshot.conversion.conversions)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Total completed actions
            </p>
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp
                className="h-5 w-5"
                style={{ color: colors.primary.accent }}
              />
              <p className="text-sm font-medium text-gray-600">
                Conversion Rate (CVR)
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {kpiSnapshot.conversion.cvr.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Clicks converted to actions
            </p>
          </div>
        </div>
      </section>

      {/* Channel Performance Comparison */}
      <section className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Performance by Channel
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Compare metrics across SMS, Email, Push, and Social channels
            </p>
          </div>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {channelOptions.map((option) => (
            <button
              key={option}
              onClick={() => setChannelFilter(option)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                channelFilter === option
                  ? "border-[#252829] bg-[#252829] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredChannels}
              margin={{ top: 20, right: 30, left: 24, bottom: 0 }}
              barCategoryGap="25%"
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="channel"
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                label={{
                  value: "Interactions",
                  angle: -90,
                  position: "insideLeft",
                }}
                width={90}
                tickFormatter={(value) => formatNumber(value)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                label={{
                  value: "Rate (%)",
                  angle: 90,
                  position: "insideRight",
                }}
                width={60}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px", gap: "20px" }}
                iconType="circle"
              />
              <Bar
                yAxisId="left"
                dataKey="clicks"
                fill={chartColors.clicks}
                name="Clicks"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                yAxisId="left"
                dataKey="conversions"
                fill={chartColors.conversions}
                name="Conversions"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ctr"
                stroke={chartColors.ctr}
                strokeWidth={2.5}
                name="CTR (%)"
                dot={{ fill: chartColors.ctr, r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cvr"
                stroke={chartColors.cvr}
                strokeWidth={2.5}
                name="CVR (%)"
                dot={{ fill: chartColors.cvr, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* SMS Delivery */}
      <section className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              SMS Delivery Performance
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Track SMS sent, delivered, and conversion metrics
            </p>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={smsDeliverySnapshot.smsDelivery}
              margin={{ top: 20, right: 30, left: 24, bottom: 0 }}
              barCategoryGap="25%"
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                label={{
                  value: "Message Count",
                  angle: -90,
                  position: "insideLeft",
                }}
                width={90}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px", gap: "20px" }}
                iconType="circle"
              />
              <Bar
                dataKey="sent"
                fill={chartColors.sent}
                name="Sent"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="delivered"
                fill={chartColors.delivered}
                name="Delivered"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="converted"
                fill={chartColors.converted}
                name="Converted"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Time Series Trend */}
      <section className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Performance Trends Over Time
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Track key metrics across the selected time period
            </p>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={timeSeriesSnapshot.timeSeries}
              margin={{ top: 20, right: 30, left: 24, bottom: 0 }}
              barCategoryGap="25%"
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                label={{ value: "Users", angle: -90, position: "insideLeft" }}
                width={90}
                tickFormatter={(value) => formatNumber(value)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                label={{
                  value: "Revenue",
                  angle: 90,
                  position: "insideRight",
                  offset: 10,
                }}
                width={80}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px", gap: "20px" }}
                iconType="circle"
              />
              <Bar
                yAxisId="left"
                dataKey="reach"
                fill={chartColors.reach}
                name="Reach"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                yAxisId="left"
                dataKey="clicks"
                fill={chartColors.timeClicks}
                name="Clicks"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                yAxisId="left"
                dataKey="conversions"
                fill={chartColors.timeConversions}
                name="Conversions"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke={chartColors.revenue}
                strokeWidth={2.5}
                name="Revenue"
                dot={{ fill: chartColors.revenue, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
