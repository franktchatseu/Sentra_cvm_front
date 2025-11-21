import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Crown,
  DollarSign,
  Download,
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
    new: 120,
    active: 420,
    atRisk: 180,
    dormant: 140,
    churned: 95,
    reactivated: 65,
  },
  {
    month: "Jul",
    new: 125,
    active: 432,
    atRisk: 190,
    dormant: 150,
    churned: 100,
    reactivated: 70,
  },
  {
    month: "Aug",
    new: 130,
    active: 448,
    atRisk: 200,
    dormant: 160,
    churned: 105,
    reactivated: 75,
  },
  {
    month: "Sep",
    new: 135,
    active: 460,
    atRisk: 210,
    dormant: 170,
    churned: 110,
    reactivated: 80,
  },
  {
    month: "Oct",
    new: 140,
    active: 474,
    atRisk: 220,
    dormant: 180,
    churned: 115,
    reactivated: 85,
  },
  {
    month: "Nov",
    new: 145,
    active: 486,
    atRisk: 230,
    dormant: 190,
    churned: 120,
    reactivated: 90,
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

// Generate comprehensive dummy data that covers all filter combinations
const generateCustomerRows = (): CustomerRow[] => {
  const segments = [
    "Champions",
    "Loyalists",
    "Potential Loyalist",
    "At-Risk",
    "Reactivated",
  ];
  const channels = ["Email", "SMS", "Push"];
  const locations = [
    "Nairobi, KE",
    "Kampala, UG",
    "Lagos, NG",
    "Accra, GH",
    "Dar es Salaam, TZ",
    "Kigali, RW",
    "Addis Ababa, ET",
  ];
  const names = [
    "Sophia K.",
    "Michael O.",
    "Amy T.",
    "David R.",
    "Grace I.",
    "James M.",
    "Emma L.",
    "Robert N.",
    "Olivia P.",
    "William Q.",
    "Isabella S.",
    "Benjamin T.",
    "Mia U.",
    "Daniel V.",
    "Charlotte W.",
    "Matthew X.",
    "Amelia Y.",
    "Joseph Z.",
    "Harper A.",
    "Samuel B.",
    "Evelyn C.",
    "Henry D.",
    "Abigail E.",
    "Alexander F.",
    "Emily G.",
  ];

  const rows: CustomerRow[] = [];
  const today = new Date();

  // Generate customers across all segments, risk levels, and date ranges
  segments.forEach((segment, segIdx) => {
    for (let i = 0; i < 5; i++) {
      const baseIdx = segIdx * 5 + i;
      const daysAgo = i * 15 + Math.floor(Math.random() * 10); // Spread across date ranges
      const interactionDate = new Date(today);
      interactionDate.setDate(today.getDate() - daysAgo);

      // Calculate churn risk based on segment and recency
      let churnRisk = 15;
      if (segment === "At-Risk")
        churnRisk = 65 + Math.floor(Math.random() * 20);
      else if (segment === "Potential Loyalist")
        churnRisk = 25 + Math.floor(Math.random() * 10);
      else if (segment === "Reactivated")
        churnRisk = 20 + Math.floor(Math.random() * 15);
      else if (daysAgo > 30) churnRisk = 30 + Math.floor(Math.random() * 20);

      // Calculate engagement score inversely related to churn risk
      const engagementScore = Math.max(
        30,
        100 - churnRisk + Math.floor(Math.random() * 20)
      );

      // Calculate values based on segment
      let lifetimeValue = 2000 + Math.floor(Math.random() * 3000);
      let clv = lifetimeValue * 1.2;
      let orders = 5 + Math.floor(Math.random() * 20);
      let aov = 150 + Math.floor(Math.random() * 150);

      if (segment === "Champions") {
        lifetimeValue = 8000 + Math.floor(Math.random() * 6000);
        clv = lifetimeValue * 1.15;
        orders = 30 + Math.floor(Math.random() * 25);
        aov = 250 + Math.floor(Math.random() * 100);
      } else if (segment === "Loyalists") {
        lifetimeValue = 5000 + Math.floor(Math.random() * 4000);
        clv = lifetimeValue * 1.18;
        orders = 20 + Math.floor(Math.random() * 15);
        aov = 200 + Math.floor(Math.random() * 80);
      }

      const lastPurchaseText =
        daysAgo === 0
          ? "Today"
          : daysAgo === 1
          ? "1 day ago"
          : `${daysAgo} days ago`;

      rows.push({
        id: `CUST-${String(34000 + baseIdx).padStart(5, "0")}`,
        name: names[baseIdx % names.length],
        segment,
        lifetimeValue,
        clv: Math.round(clv),
        orders,
        aov: Math.round(aov),
        lastPurchase: lastPurchaseText,
        lastInteractionDate: interactionDate.toISOString().split("T")[0],
        engagementScore,
        churnRisk,
        preferredChannel: channels[baseIdx % channels.length] as
          | "Email"
          | "SMS"
          | "Push",
        location: locations[baseIdx % locations.length],
      });
    }
  });

  return rows;
};

const customerRows: CustomerRow[] = generateCustomerRows();

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

const getRangeLabel = (option: RangeOption): string => {
  const labels: Record<RangeOption, string> = {
    "7d": "Daily",
    "30d": "Weekly",
    "90d": "Monthly",
  };
  return labels[option];
};

// Calculate scale factor based on actual custom days vs base range
const getCustomScaleFactor = (
  customDays: number | null,
  baseRange: RangeOption
): number => {
  if (!customDays) return rangeMultipliers[baseRange];
  const baseDays = rangeDays[baseRange];
  const baseMultiplier = rangeMultipliers[baseRange];
  // Scale proportionally: if 7d has multiplier 0.38, and user selects 14 days (2x), scale to 0.76
  return (customDays / baseDays) * baseMultiplier;
};

// Get date constraints for date inputs
const getDateConstraints = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = today.toISOString().split("T")[0]; // Today (no future dates)

  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 2); // 2 years ago max
  const minDateStr = minDate.toISOString().split("T")[0];

  return { minDate: minDateStr, maxDate };
};

export default function CustomerProfileReportsPage() {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("7d");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [tableSegment, setTableSegment] = useState("All");
  const [tableRiskFilter, setTableRiskFilter] = useState("All");

  const customDays = getDaysBetween(customRange.start, customRange.end);
  const activeRangeKey: RangeOption =
    customRange.start && customRange.end
      ? mapDaysToRange(customDays)
      : selectedRange;

  // Calculate actual scale factor based on custom days
  const actualMultiplier = useMemo(() => {
    if (customRange.start && customRange.end && customDays) {
      return getCustomScaleFactor(customDays, activeRangeKey);
    }
    return rangeMultipliers[activeRangeKey];
  }, [customRange.start, customRange.end, customDays, activeRangeKey]);

  const valueMatrixSeries = useMemo(() => {
    const multiplier = actualMultiplier;
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
  }, [actualMultiplier, activeRangeKey]);

  const lifecycleSeries = useMemo(() => {
    const multiplier = actualMultiplier;
    return baseLifecycleData.map((point) => ({
      month: point.month,
      new: Math.round(point.new * multiplier),
      active: Math.round(point.active * multiplier),
      atRisk: Math.round(point.atRisk * multiplier),
      dormant: Math.round(point.dormant * multiplier),
      churned: Math.round(point.churned * multiplier),
      reactivated: Math.round(point.reactivated * multiplier),
    }));
  }, [actualMultiplier]);

  const clvDistributionSeries = useMemo(() => {
    const multiplier = actualMultiplier;
    return baseClvDistribution.map((bucket) => ({
      ...bucket,
      customers: Math.round(bucket.customers * multiplier),
    }));
  }, [actualMultiplier]);

  const cohortSeries = useMemo(() => {
    const adjustment =
      activeRangeKey === "7d" ? 3 : activeRangeKey === "30d" ? 1 : 0;
    return baseCohortRetention.map((point) => ({
      ...point,
      retention: Math.min(100, point.retention + adjustment),
    }));
  }, [activeRangeKey]);

  const cohortComparisonSeries = useMemo(() => {
    const months = Array.from(
      new Set(cohortSeries.map((entry) => entry.month))
    ).sort((a, b) => a - b);

    const cohorts = ["Jan", "Apr", "Jul"];

    return months.map((month) => {
      const row: Record<string, string | number> = {
        month: `Month ${month}`,
      };

      cohorts.forEach((cohort) => {
        const dataPoint = cohortSeries.find(
          (entry) => entry.month === month && entry.cohort === cohort
        );
        row[cohort] = dataPoint?.retention ?? 0;
      });

      return row;
    });
  }, [cohortSeries]);

  const filteredCustomers = useMemo(() => {
    const maxDays =
      customRange.start && customRange.end
        ? customDays ?? rangeDays[activeRangeKey]
        : rangeDays[activeRangeKey];
    const startMs = customRange.start
      ? new Date(customRange.start).getTime()
      : null;
    const endMs = customRange.end ? new Date(customRange.end).getTime() : null;

    return customerRows.filter((row) => {
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
      return matchesSegment && matchesRisk && matchesRange;
    });
  }, [tableSegment, tableRiskFilter, customRange, customDays, activeRangeKey]);

  const handleDownloadCsv = () => {
    if (!filteredCustomers.length) return;

    const headers = [
      "Customer ID",
      "Name",
      "Segment",
      "Lifetime Revenue",
      "Orders",
      "Last Purchase",
      "Churn Risk",
    ];

    const rows = filteredCustomers.map((row) => [
      row.id,
      row.name,
      row.segment,
      row.lifetimeValue,
      row.orders,
      row.lastPurchase,
      `${row.churnRisk}%`,
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                {getRangeLabel(option)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="customer-date-start"
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
              >
                From:
              </label>
              <input
                id="customer-date-start"
                type="date"
                value={customRange.start}
                min={getDateConstraints().minDate}
                max={getDateConstraints().maxDate}
                onChange={(event) =>
                  setCustomRange((prev) => ({
                    ...prev,
                    start: event.target.value,
                  }))
                }
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-[#252829] focus:outline-none focus:ring-1 focus:ring-[#252829]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="customer-date-end"
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
              >
                To:
              </label>
              <input
                id="customer-date-end"
                type="date"
                value={customRange.end}
                min={customRange.start || getDateConstraints().minDate}
                max={getDateConstraints().maxDate}
                onChange={(event) =>
                  setCustomRange((prev) => ({
                    ...prev,
                    end: event.target.value,
                  }))
                }
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-[#252829] focus:outline-none focus:ring-1 focus:ring-[#252829]"
              />
            </div>
            {(customRange.start || customRange.end) && (
              <button
                type="button"
                onClick={() => setCustomRange({ start: "", end: "" })}
                className="ml-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      <section>
        {(() => {
          // Use actual multiplier for custom dates, otherwise use preset scale
          const valueScale = actualMultiplier;
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

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Customer Value Matrix
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Customer segments by value score and recency
              </p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={valueMatrixSeries}
                margin={{ top: 20, right: 24, left: 0, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="segment"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  interval={0}
                />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="customers"
                  name="Customers"
                  fill={colors.primary.accent}
                  maxBarSize={60}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Customer Lifetime Value Distribution
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
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
      </section>

      <section className="space-y-6">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Lifecycle Distribution
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Customer count by lifecycle stage over time
              </p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lifecycleSeries}
                margin={{ top: 20, right: 24, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
                <Bar
                  dataKey="active"
                  name="Active"
                  fill={colors.tertiary.tag4}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="new"
                  name="New"
                  fill={colors.tertiary.tag2}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="reactivated"
                  name="Reactivated"
                  fill={colors.charts.offers.voucher}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="atRisk"
                  name="At-Risk"
                  fill={colors.status.warning}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="dormant"
                  name="Dormant"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="churned"
                  name="Churned"
                  fill={colors.status.danger}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Cohort Retention Comparison
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Compare how each acquisition cohort retains month over month
              </p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cohortComparisonSeries}
                margin={{ top: 20, right: 24, left: 0, bottom: 40 }}
                barCategoryGap="30%"
                barGap={12}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280" }}
                  label={{
                    value: "Months since acquisition",
                    position: "bottom",
                    style: { marginTop: 8, marginBottom: 8 },
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
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
                <Bar
                  dataKey="Jan"
                  name="Jan Cohort"
                  fill="#9333ea"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Apr"
                  name="Apr Cohort"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Jul"
                  name="Jul Cohort"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
            <select
              value={tableSegment}
              onChange={(event) => setTableSegment(event.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none md:w-48"
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
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none md:w-48"
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
              className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: colors.primary.action }}
            >
              <Download className="h-4 w-4" />
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
                    "Customer ID",
                    "Name",
                    "Segment",
                    "Lifetime Revenue",
                    "Orders",
                    "Last Purchase",
                    "Churn Risk",
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
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="transition-colors">
                    <td
                      className="px-6 py-4 font-semibold text-gray-900"
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
                      {customer.orders}
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
