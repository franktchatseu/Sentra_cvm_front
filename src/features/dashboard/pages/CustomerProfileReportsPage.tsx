import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Crown,
  DollarSign,
  Repeat,
  Users,
} from "lucide-react";
import { colors } from "../../../shared/utils/tokens";
import { color } from "../../../shared/utils/utils";

type RangeOption = "7d" | "30d" | "90d";

type HeroMetric = {
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type SecondaryMetric = {
  label: string;
  value: string;
  description: string;
};

type ValueMatrixPoint = {
  segment: string;
  recency: number;
  valueScore: number;
  customers: number;
  lifecycle: "New" | "Active" | "At-Risk" | "Churned";
};

type LifecyclePoint = {
  month: string;
  new: number;
  active: number;
  atRisk: number;
  dormant: number;
  churned: number;
  reactivated: number;
};

type ClvBucket = {
  range: string;
  customers: number;
  revenueShare: number;
};

type CohortPoint = {
  month: number;
  cohort: string;
  retention: number;
};

type HeatmapCell = {
  day: string;
  hourBlock: string;
  volume: number;
};

type CustomerRow = {
  id: string;
  name: string;
  segment: string;
  lifetimeValue: number;
  clv: number;
  orders: number;
  aov: number;
  lastPurchase: string;
  lastInteractionDate: string;
  engagementScore: number;
  churnRisk: number;
  preferredChannel: "Email" | "SMS" | "Push";
  location: string;
};

const formatNumber = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 0 });

const heroBase = {
  activeCustomers: 1_284_200,
  avgClv: 1_540,
  avgOrderValue: 128,
  purchaseFrequency: 3.4,
  engagementScore: 72,
  churnRate: 8.3,
};

const secondaryMetricBase = {
  newCustomers: 42_500,
  reactivationRate: 14.2,
  nps: 47,
  multiChannel: 0.61,
  topSegmentShare: 0.22,
};

const baseValueMatrixData: ValueMatrixPoint[] = [
  {
    segment: "Champions",
    recency: 10,
    valueScore: 92,
    customers: 2400,
    lifecycle: "Active",
  },
  {
    segment: "Loyalists",
    recency: 22,
    valueScore: 78,
    customers: 4800,
    lifecycle: "Active",
  },
  {
    segment: "Potential Loyalists",
    recency: 35,
    valueScore: 55,
    customers: 6400,
    lifecycle: "New",
  },
  {
    segment: "At-Risk",
    recency: 60,
    valueScore: 48,
    customers: 3100,
    lifecycle: "At-Risk",
  },
  {
    segment: "Churned",
    recency: 120,
    valueScore: 22,
    customers: 2100,
    lifecycle: "Churned",
  },
  {
    segment: "Reactivated",
    recency: 28,
    valueScore: 64,
    customers: 1800,
    lifecycle: "Active",
  },
];

const baseLifecycleData: LifecyclePoint[] = [
  {
    month: "Jun",
    new: 38,
    active: 420,
    atRisk: 85,
    dormant: 55,
    churned: 32,
    reactivated: 18,
  },
  {
    month: "Jul",
    new: 40,
    active: 432,
    atRisk: 90,
    dormant: 60,
    churned: 34,
    reactivated: 22,
  },
  {
    month: "Aug",
    new: 44,
    active: 448,
    atRisk: 94,
    dormant: 63,
    churned: 35,
    reactivated: 20,
  },
  {
    month: "Sep",
    new: 48,
    active: 460,
    atRisk: 97,
    dormant: 67,
    churned: 36,
    reactivated: 24,
  },
  {
    month: "Oct",
    new: 52,
    active: 474,
    atRisk: 101,
    dormant: 70,
    churned: 38,
    reactivated: 26,
  },
  {
    month: "Nov",
    new: 55,
    active: 486,
    atRisk: 105,
    dormant: 72,
    churned: 39,
    reactivated: 28,
  },
];

const baseClvDistribution: ClvBucket[] = [
  { range: "< $250", customers: 420_000, revenueShare: 12 },
  { range: "$250 - $500", customers: 310_000, revenueShare: 18 },
  { range: "$500 - $1k", customers: 220_000, revenueShare: 23 },
  { range: "$1k - $2k", customers: 160_000, revenueShare: 25 },
  { range: "$2k - $5k", customers: 110_000, revenueShare: 16 },
  { range: ">$5k", customers: 64_000, revenueShare: 6 },
];

const baseCohortRetention: CohortPoint[] = [
  { month: 1, cohort: "Jan", retention: 100 },
  { month: 2, cohort: "Jan", retention: 72 },
  { month: 3, cohort: "Jan", retention: 58 },
  { month: 4, cohort: "Jan", retention: 49 },
  { month: 5, cohort: "Jan", retention: 45 },
  { month: 1, cohort: "Apr", retention: 100 },
  { month: 2, cohort: "Apr", retention: 76 },
  { month: 3, cohort: "Apr", retention: 63 },
  { month: 4, cohort: "Apr", retention: 54 },
  { month: 5, cohort: "Apr", retention: 50 },
  { month: 1, cohort: "Jul", retention: 100 },
  { month: 2, cohort: "Jul", retention: 79 },
  { month: 3, cohort: "Jul", retention: 66 },
  { month: 4, cohort: "Jul", retention: 57 },
  { month: 5, cohort: "Jul", retention: 52 },
];

const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatmapSlots = ["8-11", "11-14", "14-17", "17-20", "20-23"];

const basePurchaseHeatmap: HeatmapCell[] = heatmapDays
  .map((day) =>
    heatmapSlots.map((slot) => ({
      day,
      hourBlock: slot,
      volume:
        Math.floor(Math.random() * 80) +
        (["Fri", "Sat"].includes(day)
          ? 60
          : ["Mon", "Tue"].includes(day)
          ? 40
          : 50) +
        (slot === "17-20" ? 40 : 0),
    }))
  )
  .flat();

const customerRows: CustomerRow[] = [
  {
    id: "CUST-34218",
    name: "Sophia K.",
    segment: "Champions",
    lifetimeValue: 12_400,
    clv: 14_200,
    orders: 42,
    aov: 296,
    lastPurchase: "3 days ago",
    lastInteractionDate: "2025-10-05",
    engagementScore: 94,
    churnRisk: 8,
    preferredChannel: "Email",
    location: "Nairobi, KE",
  },
  {
    id: "CUST-44105",
    name: "Michael O.",
    segment: "Loyalists",
    lifetimeValue: 8_120,
    clv: 9_500,
    orders: 28,
    aov: 254,
    lastPurchase: "8 days ago",
    lastInteractionDate: "2025-09-30",
    engagementScore: 86,
    churnRisk: 14,
    preferredChannel: "SMS",
    location: "Kampala, UG",
  },
  {
    id: "CUST-55142",
    name: "Amy T.",
    segment: "Potential Loyalist",
    lifetimeValue: 2_340,
    clv: 4_200,
    orders: 9,
    aov: 182,
    lastPurchase: "21 days ago",
    lastInteractionDate: "2025-09-17",
    engagementScore: 68,
    churnRisk: 28,
    preferredChannel: "Push",
    location: "Lagos, NG",
  },
  {
    id: "CUST-66201",
    name: "David R.",
    segment: "At-Risk",
    lifetimeValue: 5_420,
    clv: 5_600,
    orders: 18,
    aov: 201,
    lastPurchase: "58 days ago",
    lastInteractionDate: "2025-08-11",
    engagementScore: 44,
    churnRisk: 62,
    preferredChannel: "Email",
    location: "Accra, GH",
  },
  {
    id: "CUST-77114",
    name: "Grace I.",
    segment: "Reactivated",
    lifetimeValue: 3_840,
    clv: 6_200,
    orders: 14,
    aov: 205,
    lastPurchase: "11 days ago",
    lastInteractionDate: "2025-09-27",
    engagementScore: 74,
    churnRisk: 24,
    preferredChannel: "SMS",
    location: "Dar es Salaam, TZ",
  },
];

const valueMatrixColors: Record<ValueMatrixPoint["lifecycle"], string> = {
  New: colors.tertiary.tag2,
  Active: colors.tertiary.tag4,
  "At-Risk": colors.status.warning,
  Churned: colors.status.danger,
};

const segmentOptions = [
  "All Customers",
  "Champions",
  "Loyalists",
  "At-Risk",
  "Churned",
  "Reactivated",
];

const rangeOptions: RangeOption[] = ["7d", "30d", "90d"];
const rangeDays: Record<RangeOption, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};
const rangeMultipliers: Record<RangeOption, number> = {
  "7d": 0.38,
  "30d": 0.74,
  "90d": 1,
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

export default function CustomerProfileReportsPage() {
  const [selectedSegment, setSelectedSegment] =
    useState<string>("All Customers");
  const [selectedRange, setSelectedRange] = useState<RangeOption>("90d");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [tableQuery, setTableQuery] = useState("");
  const [tableSegment, setTableSegment] = useState("All");
  const [tableRiskFilter, setTableRiskFilter] = useState("All");

  const customDays = getDaysBetween(customRange.start, customRange.end);
  const activeRangeKey: RangeOption =
    customRange.start && customRange.end
      ? mapDaysToRange(customDays)
      : selectedRange;

  const valueMatrixSeries = useMemo(() => {
    const multiplier = rangeMultipliers[activeRangeKey];
    return baseValueMatrixData.map((point) => ({
      ...point,
      customers: Math.max(200, Math.round(point.customers * multiplier)),
      recency: Math.round(
        point.recency *
          (activeRangeKey === "7d" ? 0.6 : activeRangeKey === "30d" ? 0.85 : 1)
      ),
      valueScore: Math.min(
        100,
        Math.round(
          point.valueScore *
            (activeRangeKey === "7d"
              ? 0.95
              : activeRangeKey === "30d"
              ? 0.98
              : 1)
        )
      ),
    }));
  }, [activeRangeKey]);

  const lifecycleSeries = useMemo(() => {
    const multiplier = rangeMultipliers[activeRangeKey];
    return baseLifecycleData.map((point) => ({
      month: point.month,
      new: Math.round(point.new * multiplier),
      active: Math.round(point.active * multiplier),
      atRisk: Math.round(point.atRisk * multiplier),
      dormant: Math.round(point.dormant * multiplier),
      churned: Math.round(point.churned * multiplier),
      reactivated: Math.round(point.reactivated * multiplier),
    }));
  }, [activeRangeKey]);

  const clvDistributionSeries = useMemo(() => {
    const multiplier = rangeMultipliers[activeRangeKey];
    return baseClvDistribution.map((bucket) => ({
      ...bucket,
      customers: Math.round(bucket.customers * multiplier),
    }));
  }, [activeRangeKey]);

  const cohortSeries = useMemo(() => {
    const adjustment =
      activeRangeKey === "7d" ? 3 : activeRangeKey === "30d" ? 1 : 0;
    return baseCohortRetention.map((point) => ({
      ...point,
      retention: Math.min(100, point.retention + adjustment),
    }));
  }, [activeRangeKey]);

  const purchaseHeatmapSeries = useMemo(() => {
    const multiplier = rangeMultipliers[activeRangeKey];
    return basePurchaseHeatmap.map((cell) => ({
      ...cell,
      volume: Math.round(cell.volume * multiplier),
    }));
  }, [activeRangeKey]);

  const secondaryMetrics: SecondaryMetric[] = [
    {
      label: "New Customers",
      value: formatNumber(
        Math.round(
          secondaryMetricBase.newCustomers * rangeMultipliers[activeRangeKey]
        )
      ),
      description: "Customers acquired in range",
    },
    {
      label: "Reactivation Rate",
      value: `${(
        secondaryMetricBase.reactivationRate *
        (activeRangeKey === "7d" ? 0.9 : activeRangeKey === "30d" ? 0.97 : 1)
      ).toFixed(1)}%`,
      description: "Dormant to active in 60 days",
    },
    {
      label: "Net Promoter Score",
      value: `${Math.round(
        secondaryMetricBase.nps +
          (activeRangeKey === "7d" ? 1 : activeRangeKey === "30d" ? 0.5 : 0)
      )}`,
      description: "Rolling 90-day NPS",
    },
    {
      label: "Multi-Channel Usage",
      value: `${Math.round(
        secondaryMetricBase.multiChannel *
          (activeRangeKey === "7d"
            ? 0.95
            : activeRangeKey === "30d"
            ? 0.98
            : 1) *
          100
      )}%`,
      description: "Customers active on 2+ channels",
    },
    {
      label: "Top Segment",
      value: `Loyal Enthusiasts (${Math.round(
        secondaryMetricBase.topSegmentShare *
          (activeRangeKey === "7d"
            ? 0.92
            : activeRangeKey === "30d"
            ? 0.97
            : 1) *
          100
      )}%)`,
      description: "Largest share of base",
    },
  ];

  const filteredCustomers = useMemo(() => {
    const query = tableQuery.trim().toLowerCase();
    const maxDays =
      customRange.start && customRange.end
        ? customDays ?? rangeDays[activeRangeKey]
        : rangeDays[activeRangeKey];
    const startMs = customRange.start
      ? new Date(customRange.start).getTime()
      : null;
    const endMs = customRange.end ? new Date(customRange.end).getTime() : null;

    return customerRows.filter((row) => {
      const matchesQuery = query
        ? row.id.toLowerCase().includes(query) ||
          row.name.toLowerCase().includes(query)
        : true;
      const matchesSegment =
        tableSegment === "All" ? true : row.segment === tableSegment;
      const matchesRisk =
        tableRiskFilter === "All"
          ? true
          : tableRiskFilter === "High"
          ? row.churnRisk >= 60
          : tableRiskFilter === "Medium"
          ? row.churnRisk >= 30 && row.churnRisk < 60
          : row.churnRisk < 30;
      const rowDate = new Date(row.lastInteractionDate).getTime();
      const now = Date.now();
      const matchesRange =
        customRange.start && customRange.end && startMs && endMs
          ? rowDate >= startMs && rowDate <= endMs
          : now - rowDate <= maxDays * 24 * 60 * 60 * 1000;
      return matchesQuery && matchesSegment && matchesRisk && matchesRange;
    });
  }, [
    tableQuery,
    tableSegment,
    tableRiskFilter,
    customRange,
    customDays,
    activeRangeKey,
  ]);

  const handleDownloadCsv = () => {
    if (!filteredCustomers.length) return;

    const headers = [
      "Rank",
      "Customer ID",
      "Name",
      "Segment",
      "Lifetime Revenue",
      "CLV",
      "Orders",
      "AOV",
      "Last Purchase",
      "Engagement Score",
      "Churn Risk",
      "Preferred Channel",
      "Location",
    ];

    const rows = filteredCustomers.map((row, index) => [
      index + 1,
      row.id,
      row.name,
      row.segment,
      row.lifetimeValue,
      row.clv,
      row.orders,
      row.aov,
      row.lastPurchase,
      row.engagementScore,
      `${row.churnRisk}%`,
      row.preferredChannel,
      row.location,
    ]);

    const csvContent = [headers, ...rows]
      .map((line) => line.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customer_profile_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Profile Reports
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Understand portfolio health, customer value distribution, and
            engagement signals
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <select
            value={selectedSegment}
            onChange={(event) => setSelectedSegment(event.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none md:w-64"
          >
            {segmentOptions.map((segment) => (
              <option key={segment} value={segment}>
                {segment}
              </option>
            ))}
          </select>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
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
                  htmlFor="customer-date-start"
                  className="text-sm text-gray-600"
                >
                  From
                </label>
                <input
                  id="customer-date-start"
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
                  htmlFor="customer-date-end"
                  className="text-sm text-gray-600"
                >
                  To
                </label>
                <input
                  id="customer-date-end"
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
        </div>
      </header>

      <section>
        {(() => {
          const scaleMap: Record<RangeOption, number> = {
            "7d": 0.38,
            "30d": 0.72,
            "90d": 1,
          };
          const valueScale = scaleMap[activeRangeKey];
          const clvAdjust =
            activeRangeKey === "7d"
              ? 0.96
              : activeRangeKey === "30d"
              ? 0.99
              : 1;
          const engagementAdjust =
            activeRangeKey === "7d" ? -3 : activeRangeKey === "30d" ? -1 : 0;
          const churnAdjust =
            activeRangeKey === "7d"
              ? -0.4
              : activeRangeKey === "30d"
              ? -0.2
              : 0;

          const heroMetrics: HeroMetric[] = [
            {
              label: "Active Customers",
              value: formatNumber(
                Math.round(heroBase.activeCustomers * valueScale)
              ),
              trend: "+4.2% vs last 90d",
              trendDirection: "up",
              description: "Activity in the selected period",
              icon: Users,
            },
            {
              label: "Avg Customer Lifetime Value",
              value: `$${Math.round(heroBase.avgClv * clvAdjust).toLocaleString(
                "en-US"
              )}`,
              trend: "+3.1% vs last quarter",
              trendDirection: "up",
              description: "Mean realized + predicted CLV",
              icon: DollarSign,
            },
            {
              label: "Avg Order Value",
              value: `$${Math.round(
                heroBase.avgOrderValue * clvAdjust
              ).toLocaleString("en-US")}`,
              trend: "+1.6% vs prior period",
              trendDirection: "up",
              description: "Mean transaction size",
              icon: Crown,
            },
            {
              label: "Purchase Frequency",
              value: `${(heroBase.purchaseFrequency * clvAdjust).toFixed(
                1
              )} / yr`,
              trend: "+0.2 YoY",
              trendDirection: "up",
              description: "Orders per customer annually",
              icon: Repeat,
            },
            {
              label: "Engagement Score",
              value: `${Math.max(
                0,
                heroBase.engagementScore + engagementAdjust
              ).toFixed(0)} / 100`,
              trend: "-2 pts vs last 30d",
              trendDirection: engagementAdjust < 0 ? "down" : "up",
              description: "Multi-channel composite score",
              icon: Activity,
            },
            {
              label: "Churn Rate",
              value: `${Math.max(0, heroBase.churnRate + churnAdjust).toFixed(
                1
              )}%`,
              trend: "-0.6 pts vs last quarter",
              trendDirection: "down",
              description: "No purchase in 120 days",
              icon: BarChart3,
            },
          ];

          return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {heroMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-md border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {metric.label}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {metric.value}
                      </p>
                    </div>
                    <metric.icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                        metric.trendDirection === "up"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <ArrowUpRight
                        className={`h-3.5 w-3.5 ${
                          metric.trendDirection === "down" ? "rotate-90" : ""
                        }`}
                      />
                      {metric.trend}
                    </span>
                    <span className="text-gray-500">{metric.description}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {secondaryMetrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-md border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-gray-500">{metric.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Customer Value Matrix
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Recency vs value to spot Champions and At-Risk cohorts
              </p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 10, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  type="number"
                  dataKey="recency"
                  name="Days Since Purchase"
                  domain={[0, 140]}
                  tick={{ fill: "#6b7280" }}
                  label={{ value: "Recency (days)", position: "bottom" }}
                />
                <YAxis
                  type="number"
                  dataKey="valueScore"
                  name="Value Score"
                  domain={[0, 100]}
                  tick={{ fill: "#6b7280" }}
                  label={{
                    value: "Frequency × Monetary score",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <ZAxis dataKey="customers" range={[80, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: "4 4" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0].payload as ValueMatrixPoint;
                    return (
                      <div className="rounded-md border border-gray-200 bg-white p-3 shadow-lg text-sm text-gray-900">
                        <p className="font-semibold">{point.segment}</p>
                        <p className="text-gray-600">
                          {formatNumber(point.customers)} customers
                        </p>
                        <p className="text-gray-600">
                          Recency: {point.recency}d · Value Score:{" "}
                          {point.valueScore}
                        </p>
                        <p className="text-gray-600">
                          Lifecycle: {point.lifecycle}
                        </p>
                      </div>
                    );
                  }}
                />
                {(["New", "Active", "At-Risk", "Churned"] as const).map(
                  (stage) => (
                    <Scatter
                      key={stage}
                      name={stage}
                      data={valueMatrixSeries.filter(
                        (point) => point.lifecycle === stage
                      )}
                      fill={valueMatrixColors[stage]}
                    />
                  )
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Lifecycle Distribution
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Monthly composition of customer lifecycle stages
              </p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={lifecycleSeries}
                margin={{ top: 20, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280" }} />
                <YAxis
                  tick={{ fill: "#6b7280" }}
                  tickFormatter={(value) => `${value}k`}
                  label={{
                    value: "Customers (000s)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="active"
                  stackId="1"
                  stroke={colors.tertiary.tag4}
                  fill={`${colors.tertiary.tag4}CC`}
                  name="Active"
                />
                <Area
                  type="monotone"
                  dataKey="new"
                  stackId="1"
                  stroke={colors.tertiary.tag2}
                  fill={`${colors.tertiary.tag2}B3`}
                  name="New"
                />
                <Area
                  type="monotone"
                  dataKey="reactivated"
                  stackId="1"
                  stroke={colors.charts.offers.voucher}
                  fill={`${colors.charts.offers.voucher}B3`}
                  name="Reactivated"
                />
                <Area
                  type="monotone"
                  dataKey="atRisk"
                  stackId="1"
                  stroke={colors.status.warning}
                  fill={`${colors.status.warning}B3`}
                  name="At-Risk"
                />
                <Area
                  type="monotone"
                  dataKey="dormant"
                  stackId="1"
                  stroke="#94a3b8"
                  fill="#94a3b866"
                  name="Dormant"
                />
                <Area
                  type="monotone"
                  dataKey="churned"
                  stackId="1"
                  stroke={colors.status.danger}
                  fill={`${colors.status.danger}B3`}
                  name="Churned"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                CLV Distribution
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Customer count by CLV bucket and cumulative revenue share
              </p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clvDistributionSeries}
                margin={{ top: 20, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="range" tick={{ fill: "#6b7280" }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#6b7280" }}
                  tickFormatter={(value) => `${value / 1000}k`}
                  label={{
                    value: "Customers",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#6b7280" }}
                  tickFormatter={(value) => `${value}%`}
                  label={{
                    value: "Revenue share",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="customers"
                  name="Customers"
                  fill={colors.primary.accent}
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenueShare"
                  name="Revenue Share"
                  stroke={colors.tertiary.tag4}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Cohort Retention Curves
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Percent of customers still active by months since acquisition
              </p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cohortSeries}
                margin={{ top: 20, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280" }}
                  label={{
                    value: "Months since acquisition",
                    position: "bottom",
                  }}
                />
                <YAxis
                  tick={{ fill: "#6b7280" }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  label={{
                    value: "Retention %",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                {["Jan", "Apr", "Jul"].map((cohort, index) => (
                  <Line
                    key={cohort}
                    type="monotone"
                    dataKey="retention"
                    data={cohortSeries.filter(
                      (point) => point.cohort === cohort
                    )}
                    name={`${cohort} Cohort`}
                    stroke={
                      [
                        colors.tertiary.tag4,
                        colors.primary.accent,
                        colors.tertiary.tag2,
                      ][index]
                    }
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Purchase Behavior Heatmap
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Most active shopping windows by day and time block
            </p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead>
              <tr>
                <th className="py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Day
                </th>
                {heatmapSlots.map((slot) => (
                  <th
                    key={slot}
                    className="px-4 py-2 text-center text-xs font-medium uppercase text-gray-500"
                  >
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {heatmapDays.map((day) => (
                <tr key={day}>
                  <td className="py-2 text-sm font-medium text-gray-700">
                    {day}
                  </td>
                  {heatmapSlots.map((slot) => {
                    const cell = purchaseHeatmapSeries.find(
                      (entry) => entry.day === day && entry.hourBlock === slot
                    );
                    const intensity = cell ? Math.min(cell.volume / 150, 1) : 0;
                    const background = `rgba(0, 187, 204, ${
                      0.15 + intensity * 0.6
                    })`;
                    return (
                      <td key={slot} className="px-4 py-2">
                        <div
                          className="rounded-md py-3 text-center text-xs font-semibold text-gray-700"
                          style={{ background }}
                        >
                          {cell?.volume ?? 0}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Customer Detail Table
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Explore high-value, at-risk, and emerging customers in one view
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              value={tableQuery}
              onChange={(event) => setTableQuery(event.target.value)}
              placeholder="Search customer"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none md:w-64"
            />
            <select
              value={tableSegment}
              onChange={(event) => setTableSegment(event.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none md:w-40"
            >
              {[
                "All",
                "Champions",
                "Loyalists",
                "Potential Loyalist",
                "At-Risk",
                "Reactivated",
              ].map((segment) => (
                <option key={segment} value={segment}>
                  {segment}
                </option>
              ))}
            </select>
            <select
              value={tableRiskFilter}
              onChange={(event) => setTableRiskFilter(event.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none md:w-40"
            >
              {["All", "High", "Medium", "Low"].map((option) => (
                <option key={option} value={option}>
                  {option} Risk
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: colors.primary.action }}
            >
              Download CSV
            </button>
          </div>
        </div>

        <div
          className={` rounded-md border border-[${color.border.default}] overflow-hidden`}
        >
          <div className="hidden lg:block overflow-x-auto">
            <table
              className="w-full"
              style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
            >
              <thead style={{ background: color.surface.tableHeader }}>
                <tr className="text-left text-sm font-medium uppercase tracking-wider">
                  {[
                    "Rank",
                    "Customer ID",
                    "Name",
                    "Segment",
                    "Lifetime Revenue",
                    "CLV",
                    "Orders",
                    "AOV",
                    "Last Purchase",
                    "Engagement",
                    "Churn Risk",
                    "Preferred Channel",
                    "Location",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3"
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.id} className="transition-colors">
                    <td
                      className="px-6 py-4 font-semibold"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      <div className="text-lg text-gray-900">{index + 1}</div>
                    </td>
                    <td
                      className="px-6 py-4 text-gray-900"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      {customer.id}
                    </td>
                    <td
                      className="px-6 py-4 text-gray-900"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      {customer.name}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      <span className="rounded-full border border-gray-200 px-3 py-1 text-sm font-medium text-gray-900">
                        {customer.segment}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 font-semibold text-gray-900"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      ${formatNumber(customer.lifetimeValue)}
                    </td>
                    <td
                      className="px-6 py-4 text-gray-900"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      ${formatNumber(customer.clv)}
                    </td>
                    <td
                      className="px-6 py-4 text-gray-900"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      {customer.orders}
                    </td>
                    <td
                      className="px-6 py-4 text-gray-900"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      ${customer.aov}
                    </td>
                    <td
                      className="px-6 py-4 text-gray-900"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      {customer.lastPurchase}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      <span className="font-semibold text-gray-900">
                        {customer.engagementScore}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          customer.churnRisk >= 60
                            ? "bg-rose-50 text-rose-700"
                            : customer.churnRisk >= 30
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {customer.churnRisk}%
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-gray-900"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      {customer.preferredChannel}
                    </td>
                    <td
                      className="px-6 py-4 text-gray-900"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      {customer.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredCustomers.length && (
              <div className="py-10 text-center text-sm text-gray-500">
                No customers match your filters yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
