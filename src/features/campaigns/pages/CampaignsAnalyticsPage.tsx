import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  ArrowRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { campaignService } from "../services/campaignService";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import CurrencyFormatter from "../../../shared/components/CurrencyFormatter";
import { getCurrencySymbol } from "../../../shared/services/currencyService";
import { color, tw } from "../../../shared/utils/utils";
import { CampaignStatsSummary } from "../types/campaign";

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

const CustomTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
}) => {
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
              style={{
                backgroundColor:
                  entry.color ||
                  color.charts.campaigns?.primary ||
                  color.charts.campaigns.active,
              }}
            />
            {entry.name || "Count"}
          </span>
          <span className="font-semibold text-gray-900">
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function CampaignsAnalyticsPage(): JSX.Element {
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<CampaignStatsSummary | null>(null);
  const [statusBreakdown, setStatusBreakdown] = useState<
    Array<{ status: string; count: number }>
  >([]);
  const [approvalStatusBreakdown, setApprovalStatusBreakdown] = useState<
    Array<{ status: string; count: number }>
  >([]);
  const [activityStatusBreakdown, setActivityStatusBreakdown] = useState<
    Array<{ status: string; count: number }>
  >([]);
  const [budgetDistributionBreakdown, setBudgetDistributionBreakdown] =
    useState<Array<{ range: string; count: number }>>([]);
  const [controlGroupsBreakdown, setControlGroupsBreakdown] = useState<
    Array<{ label: string; value: number }>
  >([]);
  const [organizationBreakdown, setOrganizationBreakdown] = useState<
    Array<{ name: string; count: number }>
  >([]);
  const [participantMetrics, setParticipantMetrics] = useState<
    Array<{ name: string; count: number }>
  >([]);
  const [recentActivityBreakdown, setRecentActivityBreakdown] = useState<
    Array<{ name: string; count: number }>
  >([]);
  const [targetsBreakdown, setTargetsBreakdown] = useState<
    Array<{ label: string; value: number }>
  >([]);
  const [timelineBreakdown, setTimelineBreakdown] = useState<
    Array<{ name: string; count: number }>
  >([]);
  const [topCampaigns, setTopCampaigns] = useState<
    Array<{
      id: number;
      name: string;
      conversionRate?: string;
      status: string;
      participants?: number;
      budget?: number;
    }>
  >([]);
  const [topCampaignsLoading, setTopCampaignsLoading] = useState(true);
  const [topPerformersFilter, setTopPerformersFilter] = useState<
    "participants" | "spend"
  >("participants");
  const [topPerformersData, setTopPerformersData] = useState<{
    by_participants: any[];
    by_spend: any[];
  } | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const statsResponse = await campaignService.getCampaignStats(true);

      if (statsResponse.success && statsResponse.data) {
        // Use the data as-is from API response
        const data = statsResponse.data as any;
        setStats(data as CampaignStatsSummary);

        // Process status breakdown
        if (data.status_breakdown) {
          const statusData = Object.entries(data.status_breakdown).map(
            ([status, count]) => ({
              status:
                status.charAt(0).toUpperCase() +
                status.slice(1).replace(/_/g, " "),
              count:
                typeof count === "string"
                  ? parseInt(count, 10) || 0
                  : typeof count === "number"
                  ? count
                  : 0,
            })
          );
          setStatusBreakdown(statusData);
        }

        // Process approval status breakdown
        if (data.approval_status_breakdown) {
          const approvalData = Object.entries(
            data.approval_status_breakdown
          ).map(([status, count]) => ({
            status:
              status.charAt(0).toUpperCase() +
              status.slice(1).replace(/_/g, " "),
            count:
              typeof count === "string"
                ? parseInt(count, 10) || 0
                : typeof count === "number"
                ? count
                : 0,
          }));
          setApprovalStatusBreakdown(
            approvalData.filter((item) => item.count > 0)
          );
        }

        // Process activity status breakdown
        if (data.activity_status) {
          const activityData = Object.entries(data.activity_status).map(
            ([status, count]) => ({
              status:
                status.charAt(0).toUpperCase() +
                status.slice(1).replace(/_/g, " "),
              count:
                typeof count === "string"
                  ? parseInt(count, 10) || 0
                  : typeof count === "number"
                  ? count
                  : 0,
            })
          );
          setActivityStatusBreakdown(activityData);
        }

        // Process budget distribution breakdown
        if (data.budget_distribution) {
          const currencySymbol = getCurrencySymbol();
          const rangeLabels: Record<string, string> = {
            under_10k: `Under ${currencySymbol}10k`,
            from_10k_to_50k: `${currencySymbol}10k - ${currencySymbol}50k`,
            from_50k_to_100k: `${currencySymbol}50k - ${currencySymbol}100k`,
            over_100k: `Over ${currencySymbol}100k`,
          };

          const budgetData = Object.entries(data.budget_distribution).map(
            ([range, count]) => ({
              range: rangeLabels[range] || range.replace(/_/g, " "),
              count:
                typeof count === "string"
                  ? parseInt(count, 10) || 0
                  : typeof count === "number"
                  ? count
                  : 0,
            })
          );
          setBudgetDistributionBreakdown(budgetData);
        }

        // Process control groups breakdown
        if (data.control_groups) {
          const withControlGroups = parseValue(
            data.control_groups.campaigns_with_control_groups
          );
          const withoutControlGroups = parseValue(
            data.control_groups.campaigns_without_control_groups
          );

          const controlGroupsData = [
            {
              label: "With Control Groups",
              value: withControlGroups,
            },
            {
              label: "Without Control Groups",
              value: withoutControlGroups,
            },
          ];
          setControlGroupsBreakdown(controlGroupsData);
        }

        // Process organization breakdown
        if (data.organization) {
          const orgData = [
            {
              name: "Unique Categories",
              count: parseValue(data.organization.unique_categories_used),
            },
            {
              name: "Unique Programs",
              count: parseValue(data.organization.unique_programs_used),
            },
            {
              name: "Unique Managers",
              count: parseValue(data.organization.unique_managers),
            },
            {
              name: "Without Category",
              count: parseValue(data.organization.campaigns_without_category),
            },
            {
              name: "Without Manager",
              count: parseValue(data.organization.campaigns_without_manager),
            },
            {
              name: "Without Program",
              count: parseValue(data.organization.campaigns_without_program),
            },
          ];
          setOrganizationBreakdown(orgData);
        }

        // Process participant metrics
        if (data.participant_metrics) {
          const participantData = [
            {
              name: "Total Participants",
              count: parseValue(data.participant_metrics.total_participants),
            },
            {
              name: "Total Max Participants",
              count: parseValue(
                data.participant_metrics.total_max_participants
              ),
            },
            {
              name: "Average per Campaign",
              count: parseValue(data.participant_metrics.average_per_campaign),
            },
          ];
          setParticipantMetrics(participantData);
        }

        // Process recent activity breakdown
        if (data.recent_activity) {
          const activityData = [
            {
              name: "Created Last 7 Days",
              count: parseValue(data.recent_activity.created_last_7_days),
            },
            {
              name: "Created Last 30 Days",
              count: parseValue(data.recent_activity.created_last_30_days),
            },
            {
              name: "Updated Last 7 Days",
              count: parseValue(data.recent_activity.updated_last_7_days),
            },
            {
              name: "Updated Last 30 Days",
              count: parseValue(data.recent_activity.updated_last_30_days),
            },
          ];
          setRecentActivityBreakdown(activityData);
        }

        // Process targets breakdown
        if (data.targets) {
          const targetsData = [
            {
              label: "With Target Reach",
              value: parseValue(data.targets.campaigns_with_target_reach),
            },
            {
              label: "With Target Conversion",
              value: parseValue(data.targets.campaigns_with_target_conversion),
            },
            {
              label: "With Target Revenue",
              value: parseValue(data.targets.campaigns_with_target_revenue),
            },
          ];
          setTargetsBreakdown(targetsData);
        }

        // Process timeline breakdown
        if (data.timeline) {
          const timelineData = [
            {
              name: "Starting Next 7 Days",
              count: parseValue(data.timeline.starting_next_7_days),
            },
            {
              name: "Starting Next 30 Days",
              count: parseValue(data.timeline.starting_next_30_days),
            },
            {
              name: "Ending Next 7 Days",
              count: parseValue(data.timeline.ending_next_7_days),
            },
            {
              name: "Ending Next 30 Days",
              count: parseValue(data.timeline.ending_next_30_days),
            },
          ];
          setTimelineBreakdown(timelineData);
        }
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
      showError("Failed to load analytics", "Unable to fetch analytics data");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Helper to format status labels
  const formatStatusLabel = useCallback((status: string): string => {
    if (!status) return "Draft";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  // Process Top Performing Campaigns data from the stats response
  useEffect(() => {
    const processTopPerformersData = async () => {
      setTopCampaignsLoading(true);
      try {
        const statsResponse = await campaignService.getCampaignStats(true);

        if (statsResponse.success && statsResponse.data) {
          const statsData = statsResponse.data as any;
          const topPerformers = statsData.top_performers || {};

          // Store the data directly from API - no need to fetch campaigns separately
          setTopPerformersData({
            by_participants: topPerformers.by_participants || [],
            by_spend: topPerformers.by_spend || [],
          });
        } else {
          setTopPerformersData(null);
        }
      } catch (error) {
        console.error("Failed to fetch top campaigns:", error);
        setTopPerformersData(null);
      } finally {
        setTopCampaignsLoading(false);
      }
    };

    processTopPerformersData();
  }, []);

  // Update displayed campaigns when filter changes
  useEffect(() => {
    if (!topPerformersData) {
      setTopCampaigns([]);
      return;
    }

    // Get campaigns based on selected filter from cached data
    const performersData =
      topPerformersFilter === "participants"
        ? topPerformersData.by_participants
        : topPerformersData.by_spend;

    if (performersData.length === 0) {
      setTopCampaigns([]);
      return;
    }

    // Process top performers - use data directly from API response
    const topCampaignsData = performersData
      .slice(0, 5)
      .map((performer: any) => {
        // Only use conversion rate if it exists in the API response
        let conversionRate: string | undefined = undefined;
        if (performer.conversion_rate != null) {
          const rate =
            typeof performer.conversion_rate === "string"
              ? parseFloat(performer.conversion_rate)
              : performer.conversion_rate;
          if (!isNaN(rate) && rate > 0) {
            conversionRate = `${rate.toFixed(1)}%`;
          }
        }

        return {
          id: performer.id,
          name: performer.name || performer.code || "Unnamed Campaign",
          conversionRate: conversionRate,
          status: performer.status
            ? formatStatusLabel(performer.status)
            : "N/A",
          participants: performer.current_participants || 0,
          budget: performer.budget_allocated || performer.budget_spent || 0,
        };
      });

    setTopCampaigns(topCampaignsData);
  }, [topPerformersFilter, topPerformersData, formatStatusLabel]);

  const parseValue = (value: number | string | undefined | null): number => {
    if (value == null) return 0;
    if (typeof value === "string") {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === "number") {
      return isNaN(value) ? 0 : value;
    }
    return 0;
  };

  // Helper to safely get nested value from stats
  const getNestedValue = (stats: any, ...path: string[]): number => {
    if (!stats) return 0;
    let current = stats;
    for (const key of path) {
      if (current == null || typeof current !== "object") return 0;
      current = current[key];
    }
    return parseValue(current);
  };

  // Helper to get total campaigns from stats (checks overview first, then direct)
  const getTotalCampaigns = (stats: CampaignStatsSummary | null): number => {
    if (!stats) return 0;
    const statsAny = stats as any;
    // API structure: data.overview.total_campaigns = 5
    return (
      getNestedValue(statsAny, "overview", "total_campaigns") ||
      parseValue(statsAny.total_campaigns) ||
      0
    );
  };

  // Helper to get active campaigns from stats
  const getActiveCampaigns = (stats: CampaignStatsSummary | null): number => {
    if (!stats) return 0;
    const statsAny = stats as any;

    // API structure: data.activity_status.is_active_flag_true = 5
    return (
      getNestedValue(statsAny, "activity_status", "is_active_flag_true") ||
      getNestedValue(statsAny, "activity_status", "currently_running") ||
      getNestedValue(statsAny, "status_breakdown", "active") ||
      parseValue(statsAny.active_campaigns) ||
      parseValue(statsAny.currently_active) ||
      0
    );
  };

  // Chart colors from tokens
  const pieColors = color.charts.campaigns.pieColors || [];
  const chartPrimary =
    color.charts.campaigns.primary || color.charts.campaigns.active;
  const chartSecondary =
    color.charts.campaigns.secondary || color.charts.campaigns.pending;
  const chartAccent =
    color.charts.campaigns.accent || color.charts.campaigns.completed;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "paused":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/campaigns")}
          className="rounded-md p-2 text-gray-600 hover:text-gray-800 transition-colors self-start"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold ${tw.textPrimary}`}>
            Campaign Analytics
          </h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>
            Insights and metrics for campaign performance
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {stats && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Target
                    className="h-5 w-5"
                    style={{ color: color.primary.accent }}
                  />
                  <p className="text-sm font-medium text-gray-600">
                    Total Campaigns
                  </p>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {getTotalCampaigns(stats).toLocaleString()}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className="h-5 w-5"
                    style={{ color: color.primary.accent }}
                  />
                  <p className="text-sm font-medium text-gray-600">
                    Active Campaigns
                  </p>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {getActiveCampaigns(stats).toLocaleString()}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    className="h-5 w-5"
                    style={{ color: color.primary.accent }}
                  />
                  <p className="text-sm font-medium text-gray-600">
                    Total Budget Allocated
                  </p>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  <CurrencyFormatter
                    amount={
                      getNestedValue(
                        stats as any,
                        "budget_metrics",
                        "total_allocated"
                      ) || parseValue((stats as any).total_budget_allocated)
                    }
                  />
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className="h-5 w-5"
                    style={{ color: color.primary.accent }}
                  />
                  <p className="text-sm font-medium text-gray-600">
                    Total Budget Spent
                  </p>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  <CurrencyFormatter
                    amount={
                      getNestedValue(
                        stats as any,
                        "budget_metrics",
                        "total_spent"
                      ) || parseValue((stats as any).total_budget_spent)
                    }
                  />
                </p>
              </div>
            </div>
          )}

          {/* Additional Stats Row */}
          {stats && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">In Draft</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {getNestedValue(
                    stats as any,
                    "status_breakdown",
                    "draft"
                  ).toLocaleString()}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">
                  Pending Approval
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {getNestedValue(
                    stats as any,
                    "status_breakdown",
                    "pending_approval"
                  ).toLocaleString()}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {getNestedValue(
                    stats as any,
                    "status_breakdown",
                    "completed"
                  ).toLocaleString()}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">
                  Avg Campaign Budget
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  <CurrencyFormatter
                    amount={getNestedValue(
                      stats as any,
                      "budget_metrics",
                      "average_allocated"
                    )}
                  />
                </p>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {approvalStatusBreakdown.length > 0 && (
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Approval Status Distribution
                </h3>
                <div className="h-64 w-full min-h-[256px]">
                  <ResponsiveContainer width="100%" height={256}>
                    <PieChart>
                      <Pie
                        data={approvalStatusBreakdown.map((item) => ({
                          name: item.status,
                          value: item.count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: { name?: string; percent?: number }) =>
                          `${props.name || ""}: ${(
                            (props.percent || 0) * 100
                          ).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={300}
                      >
                        {approvalStatusBreakdown.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={pieColors[index % pieColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "transparent" }}
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
            )}

            {controlGroupsBreakdown.length > 0 && (
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Control Groups Distribution
                </h3>
                <div className="h-64 w-full min-h-[256px]">
                  <ResponsiveContainer width="100%" height={256}>
                    <PieChart>
                      <Pie
                        data={controlGroupsBreakdown.map((item) => ({
                          name: item.label,
                          value: item.value,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: { name?: string; percent?: number }) =>
                          `${props.name || ""}: ${(
                            (props.percent || 0) * 100
                          ).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={300}
                      >
                        {controlGroupsBreakdown.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={pieColors[index % pieColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "transparent" }}
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
            )}
          </div>

          {/* Bar Charts */}
          {targetsBreakdown.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Targets Distribution
              </h3>
              <div className="h-96 w-full min-h-[384px]">
                <ResponsiveContainer width="100%" height={384}>
                  <BarChart
                    data={targetsBreakdown.map((item) => ({
                      name: item.label,
                      count: item.value,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      dataKey="count"
                      fill={chartSecondary}
                      radius={[4, 4, 0, 0]}
                      name="Campaigns"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {statusBreakdown.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Status Distribution
              </h3>
              <div className="h-96 w-full min-h-[384px]">
                <ResponsiveContainer width="100%" height={384}>
                  <BarChart
                    data={statusBreakdown.map((item) => ({
                      name: item.status,
                      count: item.count,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      dataKey="count"
                      fill={chartPrimary}
                      radius={[4, 4, 0, 0]}
                      name="Campaigns"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activityStatusBreakdown.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activity Status Overview
              </h3>
              <div className="h-96 w-full min-h-[384px]">
                <ResponsiveContainer width="100%" height={384}>
                  <BarChart
                    data={activityStatusBreakdown.map((item) => ({
                      name: item.status,
                      count: item.count,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      dataKey="count"
                      fill={chartAccent}
                      radius={[4, 4, 0, 0]}
                      name="Campaigns"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {budgetDistributionBreakdown.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Budget Distribution
              </h3>
              <div className="h-96 w-full min-h-[384px]">
                <ResponsiveContainer width="100%" height={384}>
                  <BarChart
                    data={budgetDistributionBreakdown.map((item) => ({
                      name: item.range,
                      count: item.count,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      dataKey="count"
                      fill={chartPrimary}
                      radius={[4, 4, 0, 0]}
                      name="Campaigns"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {organizationBreakdown.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Organization Overview
              </h3>
              <div className="h-96 w-full min-h-[384px]">
                <ResponsiveContainer width="100%" height={384}>
                  <BarChart
                    data={organizationBreakdown.map((item) => ({
                      name: item.name,
                      count: item.count,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      dataKey="count"
                      fill={chartSecondary}
                      radius={[4, 4, 0, 0]}
                      name="Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {participantMetrics.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Participant Metrics
              </h3>
              <div className="h-96 w-full min-h-[384px]">
                <ResponsiveContainer width="100%" height={384}>
                  <BarChart
                    data={participantMetrics.map((item) => ({
                      name: item.name,
                      count: item.count,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      dataKey="count"
                      fill={chartAccent}
                      radius={[4, 4, 0, 0]}
                      name="Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {recentActivityBreakdown.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="h-96 w-full min-h-[384px]">
                <ResponsiveContainer width="100%" height={384}>
                  <BarChart
                    data={recentActivityBreakdown.map((item) => ({
                      name: item.name,
                      count: item.count,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      dataKey="count"
                      fill={chartPrimary}
                      radius={[4, 4, 0, 0]}
                      name="Campaigns"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {timelineBreakdown.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Timeline
              </h3>
              <div className="h-96 w-full min-h-[384px]">
                <ResponsiveContainer width="100%" height={384}>
                  <BarChart
                    data={timelineBreakdown.map((item) => ({
                      name: item.name,
                      count: item.count,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      dataKey="count"
                      fill={chartAccent}
                      radius={[4, 4, 0, 0]}
                      name="Campaigns"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Performing Campaigns */}
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Performing Campaigns
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTopPerformersFilter("participants")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      topPerformersFilter === "participants"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Participants
                  </button>
                  <button
                    onClick={() => setTopPerformersFilter("spend")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      topPerformersFilter === "spend"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Spend
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {topPerformersFilter === "participants"
                  ? "Campaigns by participants"
                  : "Campaigns by spend"}
              </p>
            </div>
            <div className="p-6">
              {topCampaignsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                  <span className="ml-3 text-sm text-gray-500">
                    Loading top campaigns...
                  </span>
                </div>
              ) : topCampaigns.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      No campaign performance data available yet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {topCampaigns.map((campaign, index) => (
                    <div
                      key={campaign.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all group"
                      style={{ backgroundColor: color.surface.background }}
                      onClick={() =>
                        navigate(`/dashboard/campaigns/${campaign.id}`)
                      }
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{
                            backgroundColor: color.primary.accent,
                            color: "#FFFFFF",
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-base text-black truncate">
                            {campaign.name}
                          </p>
                          <div className="flex flex-wrap gap-2 text-sm text-black">
                            {campaign.conversionRate && (
                              <span>Conversion: {campaign.conversionRate}</span>
                            )}
                            {topPerformersFilter === "participants" &&
                              campaign.participants !== undefined && (
                                <span>
                                  Participants:{" "}
                                  {campaign.participants.toLocaleString()}
                                </span>
                              )}
                            {topPerformersFilter === "spend" &&
                              campaign.budget !== undefined && (
                                <span>
                                  Budget:{" "}
                                  <CurrencyFormatter amount={campaign.budget} />
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <span
                          className={`px-3 py-1 rounded-full text-sm flex-shrink-0 ${
                            campaign.status.toLowerCase() === "active"
                              ? "text-black bg-transparent border-0 font-normal"
                              : `font-bold border ${getStatusColor(
                                  campaign.status
                                )}`
                          }`}
                        >
                          {campaign.status}
                        </span>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
