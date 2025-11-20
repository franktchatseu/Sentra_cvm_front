import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  Download,
  MousePointerClick,
  Users2,
} from "lucide-react";
import { colors } from "../../../shared/utils/tokens";

type RangeOption = "7d" | "30d" | "90d";

const rangeOptions: RangeOption[] = ["7d", "30d", "90d"];
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

type CampaignSummary = {
  eligibleAudience: number;
  recipients: number;
  reach: number;
  impressions: number;
  opens: number;
  clickRate: number;
  engagementRate: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  roas: number;
  cac: number;
  leads: number;
  campaignCost: number;
};

type ChannelReachPoint = {
  channel: string;
  reach: number;
  impressions: number;
};

type FunnelPoint = {
  stage: string;
  value: number;
};

type TrendPoint = {
  period: string;
  ctr: number;
  engagement: number;
  revenue: number;
  spend: number;
};

type CampaignRow = {
  id: string;
  name: string;
  segment: string;
  offer: string;
  targetGroup: number;
  controlGroup: number;
  sent: number;
  delivered: number;
  conversions: number;
  messagesGenerated: number;
  lastRunDate: string;
};

const campaignSummary: Record<RangeOption, CampaignSummary> = {
  "7d": {
    eligibleAudience: 210_000,
    recipients: 145_000,
    reach: 132_400,
    impressions: 280_000,
    opens: 56_000,
    clickRate: 8.4,
    engagementRate: 12.1,
    conversions: 9_300,
    conversionRate: 6.4,
    revenue: 415_000,
    roas: 4.6,
    cac: 18.4,
    leads: 3_950,
    campaignCost: 90_000,
  },
  "30d": {
    eligibleAudience: 720_000,
    recipients: 540_000,
    reach: 497_000,
    impressions: 1_180_000,
    opens: 210_000,
    clickRate: 9.2,
    engagementRate: 13.3,
    conversions: 34_400,
    conversionRate: 7.1,
    revenue: 1_620_000,
    roas: 4.9,
    cac: 17.2,
    leads: 15_200,
    campaignCost: 330_000,
  },
  "90d": {
    eligibleAudience: 2_050_000,
    recipients: 1_580_000,
    reach: 1_420_000,
    impressions: 3_420_000,
    opens: 620_000,
    clickRate: 9.8,
    engagementRate: 14.2,
    conversions: 102_000,
    conversionRate: 7.6,
    revenue: 4_950_000,
    roas: 5.1,
    cac: 16.5,
    leads: 45_800,
    campaignCost: 970_000,
  },
};

const channelReachData: Record<RangeOption, ChannelReachPoint[]> = {
  "7d": [
    { channel: "Email", reach: 52_000, impressions: 110_000 },
    { channel: "SMS", reach: 38_000, impressions: 60_000 },
    { channel: "Push", reach: 28_000, impressions: 55_000 },
    { channel: "Social", reach: 14_400, impressions: 55_000 },
  ],
  "30d": [
    { channel: "Email", reach: 185_000, impressions: 420_000 },
    { channel: "SMS", reach: 140_000, impressions: 210_000 },
    { channel: "Push", reach: 110_000, impressions: 190_000 },
    { channel: "Social", reach: 62_000, impressions: 160_000 },
  ],
  "90d": [
    { channel: "Email", reach: 520_000, impressions: 1_200_000 },
    { channel: "SMS", reach: 380_000, impressions: 560_000 },
    { channel: "Push", reach: 320_000, impressions: 540_000 },
    { channel: "Social", reach: 200_000, impressions: 500_000 },
  ],
};

const funnelData: Record<RangeOption, FunnelPoint[]> = {
  "7d": [
    { stage: "Sent", value: 145_000 },
    { stage: "Opens", value: 56_000 },
    { stage: "Clicks", value: 42_000 },
    { stage: "Engagements", value: 33_500 },
    { stage: "Conversions", value: 18_600 },
  ],
  "30d": [
    { stage: "Sent", value: 540_000 },
    { stage: "Opens", value: 210_000 },
    { stage: "Clicks", value: 148_000 },
    { stage: "Engagements", value: 126_000 },
    { stage: "Conversions", value: 65_500 },
  ],
  "90d": [
    { stage: "Sent", value: 1_580_000 },
    { stage: "Opens", value: 620_000 },
    { stage: "Clicks", value: 438_000 },
    { stage: "Engagements", value: 360_000 },
    { stage: "Conversions", value: 198_000 },
  ],
};

const trendData: Record<RangeOption, TrendPoint[]> = {
  "7d": [
    { period: "Mon", ctr: 8.1, engagement: 11.6, revenue: 52, spend: 11 },
    { period: "Tue", ctr: 8.6, engagement: 12.3, revenue: 58, spend: 12 },
    { period: "Wed", ctr: 8.9, engagement: 12.8, revenue: 62, spend: 12.4 },
    { period: "Thu", ctr: 8.4, engagement: 12.1, revenue: 55, spend: 11.5 },
    { period: "Fri", ctr: 8.7, engagement: 12.4, revenue: 60, spend: 11.8 },
    { period: "Sat", ctr: 7.8, engagement: 10.9, revenue: 48, spend: 10.7 },
    { period: "Sun", ctr: 7.4, engagement: 10.2, revenue: 40, spend: 10 },
  ],
  "30d": [
    { period: "Week 1", ctr: 8.5, engagement: 12.1, revenue: 410, spend: 92 },
    { period: "Week 2", ctr: 8.8, engagement: 12.6, revenue: 430, spend: 88 },
    { period: "Week 3", ctr: 9.3, engagement: 13.2, revenue: 450, spend: 87 },
    { period: "Week 4", ctr: 9.1, engagement: 13.4, revenue: 455, spend: 85 },
  ],
  "90d": [
    {
      period: "September",
      ctr: 9.0,
      engagement: 13.2,
      revenue: 1_520,
      spend: 320,
    },
    {
      period: "October",
      ctr: 9.5,
      engagement: 14.1,
      revenue: 1_640,
      spend: 325,
    },
    {
      period: "November",
      ctr: 10.1,
      engagement: 15.1,
      revenue: 1_790,
      spend: 330,
    },
  ],
};

const revenueData: Record<RangeOption, TrendPoint[]> = {
  "7d": [
    { period: "Mon", ctr: 8.1, engagement: 11.6, revenue: 52, spend: 11 },
    { period: "Tue", ctr: 8.6, engagement: 12.3, revenue: 58, spend: 12 },
    { period: "Wed", ctr: 8.9, engagement: 12.8, revenue: 62, spend: 12.4 },
    { period: "Thu", ctr: 8.4, engagement: 12.1, revenue: 55, spend: 11.5 },
    { period: "Fri", ctr: 8.7, engagement: 12.4, revenue: 60, spend: 11.8 },
    { period: "Sat", ctr: 7.8, engagement: 10.9, revenue: 48, spend: 10.7 },
    { period: "Sun", ctr: 7.4, engagement: 10.2, revenue: 40, spend: 10 },
  ],
  "30d": [
    { period: "Week 1", ctr: 8.5, engagement: 12.1, revenue: 410, spend: 92 },
    { period: "Week 2", ctr: 8.8, engagement: 12.6, revenue: 430, spend: 88 },
    { period: "Week 3", ctr: 9.3, engagement: 13.2, revenue: 450, spend: 87 },
    { period: "Week 4", ctr: 9.1, engagement: 13.4, revenue: 455, spend: 85 },
  ],
  "90d": [
    {
      period: "September",
      ctr: 9.0,
      engagement: 13.2,
      revenue: 1_520,
      spend: 320,
    },
    {
      period: "October",
      ctr: 9.5,
      engagement: 14.1,
      revenue: 1_640,
      spend: 325,
    },
    {
      period: "November",
      ctr: 10.1,
      engagement: 15.1,
      revenue: 1_790,
      spend: 330,
    },
  ],
};

const campaignRows: CampaignRow[] = [
  {
    id: "camp-neo",
    name: "Neo Onboarding Journey",
    segment: "New Customers",
    offer: "Cashback Bonus",
    targetGroup: 60_000,
    controlGroup: 10_000,
    sent: 70_000,
    delivered: 66_500,
    conversions: 5_400,
    messagesGenerated: 210_000,
    lastRunDate: "2025-10-01",
  },
  {
    id: "camp-vip",
    name: "VIP Upsell",
    segment: "High Value",
    offer: "Priority Upgrade",
    targetGroup: 32_000,
    controlGroup: 6_000,
    sent: 38_000,
    delivered: 36_200,
    conversions: 4_800,
    messagesGenerated: 120_000,
    lastRunDate: "2025-10-05",
  },
  {
    id: "camp-churn",
    name: "Churn Winback",
    segment: "Churn Risk",
    offer: "Winback Voucher",
    targetGroup: 48_000,
    controlGroup: 8_000,
    sent: 55_000,
    delivered: 49_500,
    conversions: 3_900,
    messagesGenerated: 150_000,
    lastRunDate: "2025-09-28",
  },
  {
    id: "camp-seasonal",
    name: "Seasonal Promotions",
    segment: "Broad Audience",
    offer: "Seasonal Bundles",
    targetGroup: 75_000,
    controlGroup: 12_000,
    sent: 88_000,
    delivered: 80_200,
    conversions: 6_800,
    messagesGenerated: 260_000,
    lastRunDate: "2025-09-20",
  },
];

type ChartTooltipEntry = {
  color?: string;
  name?: string;
  value?: number | string;
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: ChartTooltipEntry[];
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-gray-900">{label}</p>
      {payload.map((entry, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-4 text-sm text-gray-600"
        >
          <span className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-semibold text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const statIcons = {
  audience: Users2,
  engagement: MousePointerClick,
  outcome: Activity,
  growth: ArrowUpRight,
};

export default function CampaignReportsPage() {
  const [tableQuery, setTableQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("All");
  const [selectedRange, setSelectedRange] = useState<RangeOption>("7d");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const customDays = getDaysBetween(customRange.start, customRange.end);
  const activeRangeKey: RangeOption =
    customRange.start && customRange.end
      ? mapDaysToRange(customDays)
      : selectedRange;

  const summary = campaignSummary[activeRangeKey];
  const heroCards = [
    {
      label: "Audience Reached",
      value: summary.reach.toLocaleString("en-US"),
      subtext: `${Math.round(
        (summary.reach / summary.eligibleAudience) * 100
      )}% of ${summary.eligibleAudience.toLocaleString("en-US")} eligible`,
      icon: statIcons.audience,
      trend: { value: "+8.4%", direction: "up" as const },
    },
    {
      label: "Engagement Rate",
      value: `${summary.engagementRate.toFixed(1)}%`,
      subtext: "Opens, clicks & taps vs reach",
      icon: statIcons.engagement,
      trend: { value: "+2.1 pts", direction: "up" as const },
    },
    {
      label: "Conversion Rate",
      value: `${summary.conversionRate.toFixed(1)}%`,
      subtext: `${summary.conversions.toLocaleString("en-US")} conversions`,
      icon: statIcons.outcome,
      trend: { value: "-0.4 pts", direction: "down" as const },
    },
    {
      label: "Revenue Generated",
      value: `$${summary.revenue.toLocaleString("en-US")}`,
      subtext: `Avg $${Math.round(
        summary.revenue / summary.conversions
      ).toLocaleString("en-US")} per conversion`,
      icon: statIcons.outcome,
      trend: { value: "+$84K", direction: "up" as const },
    },
    {
      label: "ROI / ROMI",
      value: `${summary.roas.toFixed(1)}x`,
      subtext: `Spend $${summary.campaignCost.toLocaleString("en-US")}`,
      icon: statIcons.growth,
      trend: { value: "+0.3x", direction: "up" as const },
    },
    {
      label: "Campaign Cost",
      value: `$${summary.campaignCost.toLocaleString("en-US")}`,
      subtext: `CAC $${summary.cac.toFixed(2)}`,
      icon: statIcons.outcome,
      trend: { value: "+$12K", direction: "up" as const },
    },
  ];

  const filteredRows = useMemo(() => {
    const query = tableQuery.trim().toLowerCase();
    const maxDays =
      customRange.start && customRange.end
        ? customDays ?? rangeDays[selectedRange]
        : rangeDays[selectedRange];
    const startMs = customRange.start
      ? new Date(customRange.start).getTime()
      : null;
    const endMs = customRange.end ? new Date(customRange.end).getTime() : null;

    return campaignRows.filter((row) => {
      const matchesSegment =
        segmentFilter === "All" ? true : row.segment === segmentFilter;
      const matchesQuery = query
        ? row.name.toLowerCase().includes(query) ||
          row.segment.toLowerCase().includes(query)
        : true;
      const rowDate = new Date(row.lastRunDate).getTime();
      const now = Date.now();
      const matchesRange =
        customRange.start && customRange.end && startMs && endMs
          ? rowDate >= startMs && rowDate <= endMs
          : now - rowDate <= maxDays * 24 * 60 * 60 * 1000;

      return matchesSegment && matchesQuery && matchesRange;
    });
  }, [segmentFilter, tableQuery, customRange, customDays, selectedRange]);

  const segmentOptions = [
    "All",
    ...new Set(campaignRows.map((row) => row.segment)),
  ];

  const chartPalette = {
    reach: colors.tertiary.tag1,
    impressions: colors.tertiary.tag2,
    funnel: colors.primary.accent,
    ctr: colors.tertiary.tag2,
    engagement: colors.tertiary.tag3,
    revenue: "#6B21A8",
    spend: "#0F5A32",
  };

  const channelData = channelReachData[activeRangeKey];
  const funnelSeries = funnelData[activeRangeKey];
  const trendSeries = trendData[activeRangeKey];
  const revenueSeries = revenueData[activeRangeKey];

  const handleDownloadCsv = () => {
    if (!filteredRows.length) return;

    const headers = [
      "Campaign Name",
      "Segment",
      "Offer",
      "Target Group",
      "Control Group",
      "Messages Generated",
      "Sent",
      "Delivered",
      "Conversions",
      "Last Run",
    ];

    const rows = filteredRows.map((row) => [
      row.name,
      row.segment,
      row.offer,
      row.targetGroup,
      row.controlGroup,
      row.messagesGenerated,
      row.sent,
      row.delivered,
      row.conversions,
      row.lastRunDate,
    ]);

    const csvContent = [headers, ...rows]
      .map((line) => line.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "campaign_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor end-to-end campaign reach, engagement, and revenue impact
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((option) => (
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
                htmlFor="campaign-date-start"
                className="text-sm text-gray-600"
              >
                From
              </label>
              <input
                id="campaign-date-start"
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
                htmlFor="campaign-date-end"
                className="text-sm text-gray-600"
              >
                To
              </label>
              <input
                id="campaign-date-end"
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

      <section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {heroCards.map((card) => {
            const trendColor =
              card.trend.direction === "up"
                ? "text-emerald-600"
                : card.trend.direction === "down"
                ? "text-red-600"
                : "text-gray-500";
            return (
              <div
                key={card.label}
                className="rounded-md border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <card.icon
                      className="h-5 w-5"
                      style={{ color: colors.primary.accent }}
                    />
                    <p className="text-sm font-medium text-gray-600">
                      {card.label}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold ${trendColor}`}>
                    {card.trend.direction === "up"
                      ? "↑"
                      : card.trend.direction === "down"
                      ? "↓"
                      : "•"}{" "}
                    {card.trend.value}
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{card.subtext}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Channel Reach Contribution
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Breakdown of reach and impressions by channel
              </p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} barCategoryGap="20%" barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="channel" tick={{ fill: "#6b7280" }} />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
                <Bar
                  dataKey="reach"
                  name="Reach"
                  fill={chartPalette.reach}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="impressions"
                  name="Impressions"
                  fill={chartPalette.impressions}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Engagement Stages
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Track drop-off from sent to conversion
              </p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelSeries}
                margin={{ top: 20, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="stage" tick={{ fill: "#6b7280" }} />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="value"
                  name="Volume"
                  fill={chartPalette.funnel}
                  maxBarSize={60}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                CTR & Engagement Trends
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Monitor interaction quality across the selected period
              </p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fill: "#6b7280" }} />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fill: "#6b7280" }}
                  domain={[0, 20]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ctr"
                  name="CTR %"
                  stroke={chartPalette.ctr}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="engagement"
                  name="Engagement %"
                  stroke={chartPalette.engagement}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Revenue vs Spend
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Compare generated revenue against campaign spend
              </p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fill: "#6b7280" }} />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue ($k)"
                  stroke={chartPalette.revenue}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="spend"
                  name="Spend ($k)"
                  stroke={chartPalette.spend}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Campaign Performance Table
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Track campaign audiences, delivery counts, and outcome metrics
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              value={tableQuery}
              onChange={(event) => setTableQuery(event.target.value)}
              placeholder="Search campaign"
              className="w-full rounded-md border border-gray-200 px-3 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none md:w-80"
            />
            <select
              value={segmentFilter}
              onChange={(event) => setSegmentFilter(event.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none md:w-48"
            >
              {segmentOptions.map((segment) => (
                <option key={segment} value={segment}>
                  {segment}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: colors.primary.action }}
            >
              <Download className="h-4 w-4" />
              Download CSV
            </button>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm text-gray-900"
              style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
            >
              <thead style={{ background: colors.surface.tableHeader }}>
                <tr className="text-left text-sm font-medium uppercase tracking-wide">
                  {[
                    "Campaign Name",
                    "Segment",
                    "Offer",
                    "Target Group",
                    "Control Group",
                    "Messages Generated",
                    "Sent",
                    "Delivered",
                    "Conversions",
                    "Last Run",
                  ].map((header, idx, arr) => (
                    <th
                      key={header}
                      className="px-6 py-3"
                      style={{
                        color: colors.surface.tableHeaderText,
                        borderTopLeftRadius: idx === 0 ? "0.375rem" : undefined,
                        borderTopRightRadius:
                          idx === arr.length - 1 ? "0.375rem" : undefined,
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((entry) => (
                  <tr key={entry.id} className="transition-colors">
                    <td
                      className="px-6 py-4 font-semibold"
                      style={{
                        backgroundColor: colors.surface.tablebodybg,
                        borderTopLeftRadius: "0.375rem",
                        borderBottomLeftRadius: "0.375rem",
                      }}
                    >
                      <div className="text-gray-900">{entry.name}</div>
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: colors.surface.tablebodybg }}
                    >
                      {entry.segment}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: colors.surface.tablebodybg }}
                    >
                      {entry.offer}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: colors.surface.tablebodybg }}
                    >
                      {entry.targetGroup.toLocaleString("en-US")}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: colors.surface.tablebodybg }}
                    >
                      {entry.controlGroup.toLocaleString("en-US")}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{
                        backgroundColor: colors.surface.tablebodybg,
                      }}
                    >
                      {entry.messagesGenerated.toLocaleString("en-US")}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: colors.surface.tablebodybg }}
                    >
                      {entry.sent.toLocaleString("en-US")}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: colors.surface.tablebodybg }}
                    >
                      {entry.delivered.toLocaleString("en-US")}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: colors.surface.tablebodybg }}
                    >
                      {entry.conversions.toLocaleString("en-US")}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{
                        backgroundColor: colors.surface.tablebodybg,
                        borderTopRightRadius: "0.375rem",
                        borderBottomRightRadius: "0.375rem",
                      }}
                    >
                      {entry.lastRunDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredRows.length && (
              <div className="py-10 text-center text-sm text-gray-500">
                No campaigns match your filters yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
