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
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import type { TooltipProps } from "recharts";
import { Eye, MousePointerClick, Target, TrendingUp } from "lucide-react";
import { colors } from "../../../shared/utils/tokens";

type RangeOption = "7d" | "30d" | "90d" | "3m";
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

const timeRangeOptions: RangeOption[] = ["7d", "30d", "90d", "3m"];

const channelOptions: ChannelFilter[] = [
  "All Channels",
  "SMS",
  "Email",
  "Push",
  "Social",
];

const channelColors: Record<string, string> = {
  SMS: "#3b82f6",
  Email: "#8b5cf6",
  Push: "#10b981",
  Social: "#f59e0b",
};

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
        reach: 45_000,
        clicks: 4_500,
        opens: 31_500,
        conversions: 360,
        revenue: 28_800,
        spend: 6_750,
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
        reach: 35_000,
        clicks: 3_500,
        opens: 23_100,
        conversions: 262,
        revenue: 20_960,
        spend: 5_250,
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
        reach: 25_000,
        clicks: 2_500,
        opens: 17_500,
        conversions: 180,
        revenue: 14_400,
        spend: 3_750,
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
        reach: 20_000,
        clicks: 2_000,
        opens: 0,
        conversions: 114,
        revenue: 9_120,
        spend: 1_600,
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
        conversions: 133,
        revenue: 10_640,
      },
      {
        date: "Day 2",
        reach: 17_500,
        clicks: 1_750,
        conversions: 130,
        revenue: 10_400,
      },
      {
        date: "Day 3",
        reach: 18_500,
        clicks: 1_850,
        conversions: 137,
        revenue: 10_960,
      },
      {
        date: "Day 4",
        reach: 18_200,
        clicks: 1_820,
        conversions: 135,
        revenue: 10_800,
      },
      {
        date: "Day 5",
        reach: 18_800,
        clicks: 1_880,
        conversions: 139,
        revenue: 11_120,
      },
      {
        date: "Day 6",
        reach: 17_800,
        clicks: 1_780,
        conversions: 132,
        revenue: 10_560,
      },
      {
        date: "Day 7",
        reach: 18_000,
        clicks: 1_800,
        conversions: 133,
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
        reach: 195_000,
        clicks: 19_500,
        opens: 136_500,
        conversions: 1_560,
        revenue: 124_800,
        spend: 29_250,
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
        reach: 150_000,
        clicks: 15_000,
        opens: 99_000,
        conversions: 1_125,
        revenue: 90_000,
        spend: 22_500,
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
        reach: 105_000,
        clicks: 10_500,
        opens: 73_500,
        conversions: 756,
        revenue: 60_480,
        spend: 15_750,
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
        reach: 90_000,
        clicks: 9_000,
        opens: 0,
        conversions: 513,
        revenue: 41_040,
        spend: 7_200,
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
        date: "Week 1",
        sent: 52_000,
        delivered: 49_000,
        converted: 3_920,
      },
      {
        date: "Week 2",
        sent: 54_000,
        delivered: 51_000,
        converted: 4_080,
      },
      {
        date: "Week 3",
        sent: 53_000,
        delivered: 50_000,
        converted: 4_000,
      },
      {
        date: "Week 4",
        sent: 55_000,
        delivered: 52_000,
        converted: 4_160,
      },
    ],
    timeSeries: [
      {
        date: "Week 1",
        reach: 135_000,
        clicks: 13_500,
        conversions: 999,
        revenue: 79_920,
      },
      {
        date: "Week 2",
        reach: 135_000,
        clicks: 13_500,
        conversions: 999,
        revenue: 79_920,
      },
      {
        date: "Week 3",
        reach: 135_000,
        clicks: 13_500,
        conversions: 999,
        revenue: 79_920,
      },
      {
        date: "Week 4",
        reach: 135_000,
        clicks: 13_500,
        conversions: 999,
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
        reach: 585_000,
        clicks: 58_500,
        opens: 409_500,
        conversions: 4_680,
        revenue: 374_400,
        spend: 87_750,
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
        reach: 450_000,
        clicks: 45_000,
        opens: 297_000,
        conversions: 3_375,
        revenue: 270_000,
        spend: 67_500,
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
        reach: 315_000,
        clicks: 31_500,
        opens: 220_500,
        conversions: 2_268,
        revenue: 181_440,
        spend: 47_250,
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
        reach: 270_000,
        clicks: 27_000,
        opens: 0,
        conversions: 1_539,
        revenue: 123_120,
        spend: 21_600,
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
        date: "Month 1",
        sent: 156_000,
        delivered: 147_000,
        converted: 11_760,
      },
      {
        date: "Month 2",
        sent: 162_000,
        delivered: 153_000,
        converted: 12_240,
      },
      {
        date: "Month 3",
        sent: 159_000,
        delivered: 150_000,
        converted: 12_000,
      },
    ],
    timeSeries: [
      {
        date: "Month 1",
        reach: 405_000,
        clicks: 40_500,
        conversions: 2_997,
        revenue: 239_760,
      },
      {
        date: "Month 2",
        reach: 405_000,
        clicks: 40_500,
        conversions: 2_997,
        revenue: 239_760,
      },
      {
        date: "Month 3",
        reach: 405_000,
        clicks: 40_500,
        conversions: 2_997,
        revenue: 239_760,
      },
    ],
  },
  "3m": {
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
        reach: 585_000,
        clicks: 58_500,
        opens: 409_500,
        conversions: 4_680,
        revenue: 374_400,
        spend: 87_750,
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
        reach: 450_000,
        clicks: 45_000,
        opens: 297_000,
        conversions: 3_375,
        revenue: 270_000,
        spend: 67_500,
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
        reach: 315_000,
        clicks: 31_500,
        opens: 220_500,
        conversions: 2_268,
        revenue: 181_440,
        spend: 47_250,
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
        reach: 270_000,
        clicks: 27_000,
        opens: 0,
        conversions: 1_539,
        revenue: 123_120,
        spend: 21_600,
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
        date: "Month 1",
        sent: 156_000,
        delivered: 147_000,
        converted: 11_760,
      },
      {
        date: "Month 2",
        sent: 162_000,
        delivered: 153_000,
        converted: 12_240,
      },
      {
        date: "Month 3",
        sent: 159_000,
        delivered: 150_000,
        converted: 12_000,
      },
    ],
    timeSeries: [
      {
        date: "Month 1",
        reach: 405_000,
        clicks: 40_500,
        conversions: 2_997,
        revenue: 239_760,
      },
      {
        date: "Month 2",
        reach: 405_000,
        clicks: 40_500,
        conversions: 2_997,
        revenue: 239_760,
      },
      {
        date: "Month 3",
        reach: 405_000,
        clicks: 40_500,
        conversions: 2_997,
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
  clicks: colors.status.info,
  conversions: colors.status.success,
  ctr: colors.status.warning,
  cvr: colors.status.danger,
  sent: colors.primary.accent,
  delivered: colors.status.info,
  converted: colors.status.success,
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
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
  // Independent filter states for each chart
  const [channelChartRange, setChannelChartRange] =
    useState<RangeOption>("30d");
  const [channelFilter, setChannelFilter] =
    useState<ChannelFilter>("All Channels");
  const [smsDeliveryChartRange, setSmsDeliveryChartRange] =
    useState<RangeOption>("30d");
  const [timeSeriesChartRange, setTimeSeriesChartRange] =
    useState<RangeOption>("30d");

  // Stat cards always use 30d snapshot (fixed)
  const kpiSnapshot = mockPerformanceSnapshots["30d"];
  // Each chart uses its own range
  const channelSnapshot = mockPerformanceSnapshots[channelChartRange];
  const smsDeliverySnapshot = mockPerformanceSnapshots[smsDeliveryChartRange];
  const timeSeriesSnapshot = mockPerformanceSnapshots[timeSeriesChartRange];

  const filteredChannels = useMemo(() => {
    if (channelFilter === "All Channels") {
      return channelSnapshot.channels;
    }
    return channelSnapshot.channels.filter(
      (channel) => channel.channel === channelFilter
    );
  }, [channelFilter, channelSnapshot.channels]);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Overall Dashboard Performance
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          System-wide performance metrics and analytics
        </p>
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
            <p className="mt-1 text-xs text-gray-500">
              Number of unique users who received your message
            </p>
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
              Total number of users who clicked on links in your campaigns
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
              Percentage of messages that resulted in clicks
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
              Percentage of recipients who opened your email or SMS message
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
              Total number of users who completed a desired action (purchase,
              sign-up, download, etc.)
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
              Percentage of clicks that resulted in conversions - measures
              campaign effectiveness
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
          <div className="flex flex-wrap gap-2">
            {timeRangeOptions.map((option) => (
              <button
                key={option}
                onClick={() => setChannelChartRange(option)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  channelChartRange === option
                    ? "border-[#252829] bg-[#252829] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
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
                label={{ value: "Volume", angle: -90, position: "insideLeft" }}
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
          <div className="flex flex-wrap gap-2">
            {timeRangeOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSmsDeliveryChartRange(option)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  smsDeliveryChartRange === option
                    ? "border-[#252829] bg-[#252829] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
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
                label={{ value: "Volume", angle: -90, position: "insideLeft" }}
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
          <div className="flex flex-wrap gap-2">
            {timeRangeOptions.map((option) => (
              <button
                key={option}
                onClick={() => setTimeSeriesChartRange(option)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeSeriesChartRange === option
                    ? "border-[#252829] bg-[#252829] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
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
                label={{ value: "Volume", angle: -90, position: "insideLeft" }}
                width={90}
                tickFormatter={(value) => formatNumber(value)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                label={{
                  value: "Revenue ($)",
                  angle: 90,
                  position: "insideRight",
                }}
                width={60}
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
                fill={chartColors.clicks}
                name="Reach"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
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
                dataKey="revenue"
                stroke={chartColors.cvr}
                strokeWidth={2.5}
                name="Revenue"
                dot={{ fill: chartColors.cvr, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
