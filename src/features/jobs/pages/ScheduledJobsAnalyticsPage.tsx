import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
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
import { scheduledJobService } from "../services/scheduledJobService";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { color, tw } from "../../../shared/utils/utils";

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
                  entry.color || color.charts.scheduledJobs.primary,
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

type GenericRecord = Record<string, unknown>;

export default function ScheduledJobsAnalyticsPage(): JSX.Element {
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [executionStats, setExecutionStats] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [slaCompliance, setSlaCompliance] = useState<{
    within_sla?: number;
    breached?: number;
    breach_rate_percent?: number;
  } | null>(null);
  const [, setFailureAnalysis] = useState<GenericRecord[] | null>(null);
  const [mostFailed, setMostFailed] = useState<Array<GenericRecord>>([]);
  const [longestRunning, setLongestRunning] = useState<Array<GenericRecord>>(
    []
  );
  const [resourceUtilization, setResourceUtilization] = useState<Record<
    string,
    number
  > | null>(null);
  const [highFailureRate, setHighFailureRate] = useState<Array<GenericRecord>>(
    []
  );
  const [statusCounts, setStatusCounts] = useState<
    Array<{ status: string; count: number | string }>
  >([]);
  const [typeCounts, setTypeCounts] = useState<
    Array<{ label: string; count: number }>
  >([]);
  const [ownerCounts, setOwnerCounts] = useState<
    Array<{ label: string; count: number | string }>
  >([]);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        execStats,
        sla,
        failures,
        failed,
        running,
        resources,
        failureRate,
        status,
        types,
        owners,
      ] = await Promise.all([
        scheduledJobService.getExecutionStatistics(true).catch(() => null),
        scheduledJobService.getSlaCompliance(true).catch(() => null),
        scheduledJobService.getFailureAnalysis(true).catch(() => null),
        scheduledJobService.getMostFailed(10, true).catch(() => []),
        scheduledJobService.getLongestRunning(10, true).catch(() => []),
        scheduledJobService.getResourceUtilization(true).catch(() => null),
        scheduledJobService.getHighFailureRate(true).catch(() => []),
        scheduledJobService.getCountByStatus(true).catch(() => []),
        scheduledJobService.getCountByType(true).catch(() => []),
        scheduledJobService.getCountByOwner(true).catch(() => []),
      ]);

      // Normalize execution stats - handle wrapped response
      const execStatsData =
        execStats && typeof execStats === "object" && "data" in execStats
          ? execStats.data
          : execStats;
      setExecutionStats(execStatsData);

      // Normalize SLA compliance - it returns an array, calculate totals
      let slaData = null;
      if (sla && typeof sla === "object") {
        if (Array.isArray(sla)) {
          const totalBreaches = sla.reduce(
            (sum, job) => sum + (parseInt(job.sla_breaches || "0", 10) || 0),
            0
          );
          const totalExecutions = sla.reduce(
            (sum, job) =>
              sum + (parseInt(job.total_executions || "0", 10) || 0),
            0
          );
          const breachRate =
            totalExecutions > 0
              ? ((totalBreaches / totalExecutions) * 100).toFixed(1)
              : "0";
          slaData = {
            within_sla: totalExecutions - totalBreaches,
            breached: totalBreaches,
            breach_rate_percent: parseFloat(breachRate),
          };
        } else if ("data" in sla && Array.isArray(sla.data)) {
          const totalBreaches = sla.data.reduce(
            (sum, job) => sum + (parseInt(job.sla_breaches || "0", 10) || 0),
            0
          );
          const totalExecutions = sla.data.reduce(
            (sum, job) =>
              sum + (parseInt(job.total_executions || "0", 10) || 0),
            0
          );
          const breachRate =
            totalExecutions > 0
              ? ((totalBreaches / totalExecutions) * 100).toFixed(1)
              : "0";
          slaData = {
            within_sla: totalExecutions - totalBreaches,
            breached: totalBreaches,
            breach_rate_percent: parseFloat(breachRate),
          };
        } else {
          slaData = sla;
        }
      }
      setSlaCompliance(slaData);

      // Normalize failure analysis - handle wrapped response
      const failuresData =
        failures && typeof failures === "object" && "data" in failures
          ? failures.data
          : Array.isArray(failures)
          ? failures
          : null;
      setFailureAnalysis(failuresData);

      // Normalize most failed - handle wrapped response
      const failedData =
        failed && typeof failed === "object" && "data" in failed
          ? failed.data
          : Array.isArray(failed)
          ? failed
          : [];
      setMostFailed(failedData);

      // Normalize longest running - handle wrapped response
      const runningData =
        running && typeof running === "object" && "data" in running
          ? running.data
          : Array.isArray(running)
          ? running
          : [];
      setLongestRunning(runningData);

      // Normalize resource utilization - handle wrapped response
      const resourcesData =
        resources && typeof resources === "object" && "data" in resources
          ? resources.data
          : resources;
      setResourceUtilization(resourcesData);

      // Normalize high failure rate - handle wrapped response
      const failureRateData =
        failureRate && typeof failureRate === "object" && "data" in failureRate
          ? failureRate.data
          : Array.isArray(failureRate)
          ? failureRate
          : [];
      setHighFailureRate(failureRateData);

      // Normalize status counts - handle wrapped response and field names
      const statusData =
        status && typeof status === "object" && "data" in status
          ? status.data
          : Array.isArray(status)
          ? status
          : [];
      setStatusCounts(statusData);

      // Normalize type counts - handle wrapped response and field name (job_type vs label)
      const typesData =
        types && typeof types === "object" && "data" in types
          ? types.data
          : Array.isArray(types)
          ? types
          : [];
      // Map job_type to label for consistency
      const normalizedTypes = typesData.map((item: GenericRecord) => ({
        label: (item.job_type as string) || (item.label as string) || "Unknown",
        count:
          typeof item.count === "string"
            ? parseInt(item.count as string, 10) || 0
            : typeof item.count === "number"
            ? (item.count as number)
            : 0,
      }));
      setTypeCounts(normalizedTypes);

      // Normalize owner counts - handle wrapped response and field name (owner vs label)
      const ownersData =
        owners && typeof owners === "object" && "data" in owners
          ? owners.data
          : Array.isArray(owners)
          ? owners
          : [];
      // Map owner to label for consistency, handle null
      const normalizedOwners = ownersData.map((item: GenericRecord) => ({
        label:
          item.owner !== null && item.owner !== undefined
            ? (item.owner as string)
            : (item.label as string) || "Unassigned",
        count:
          typeof item.count === "string"
            ? parseInt(item.count as string, 10) || 0
            : typeof item.count === "number"
            ? (item.count as number)
            : 0,
      }));
      setOwnerCounts(normalizedOwners);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/dashboard/scheduled-jobs")}
          className="rounded-md p-2 text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
            Scheduled Jobs Analytics
          </h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>
            Insights and metrics for scheduled jobs performance
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-6">
          {/* SLA Compliance Metrics */}
          {slaCompliance && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className="h-5 w-5"
                    style={{ color: color.primary.accent }}
                  />
                  <p className="text-sm font-medium text-gray-600">
                    Within SLA
                  </p>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {slaCompliance.within_sla || 0}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className="h-5 w-5"
                    style={{ color: color.primary.accent }}
                  />
                  <p className="text-sm font-medium text-gray-600">
                    SLA Breached
                  </p>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {slaCompliance.breached || 0}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    className="h-5 w-5"
                    style={{ color: color.primary.accent }}
                  />
                  <p className="text-sm font-medium text-gray-600">
                    Breach Rate
                  </p>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {slaCompliance.breach_rate_percent
                    ? `${slaCompliance.breach_rate_percent}%`
                    : "0%"}
                </p>
              </div>
            </div>
          )}

          {/* Tables Section */}
          <div className="space-y-6">
            {/* Most Failed Jobs */}
            {mostFailed.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Most Failed Jobs
                </h3>
                <div className="overflow-x-auto">
                  <table
                    className="w-full"
                    style={{
                      borderCollapse: "separate",
                      borderSpacing: "0 8px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                          style={{
                            color: color.surface.tableHeaderText,
                            backgroundColor: color.surface.tableHeader,
                            borderTopLeftRadius: "0.375rem",
                          }}
                        >
                          Job Name
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                          style={{
                            color: color.surface.tableHeaderText,
                            backgroundColor: color.surface.tableHeader,
                          }}
                        >
                          Failures
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                          style={{
                            color: color.surface.tableHeaderText,
                            backgroundColor: color.surface.tableHeader,
                            borderTopRightRadius: "0.375rem",
                          }}
                        >
                          Failure Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mostFailed.map((job: GenericRecord, index: number) => (
                        <tr
                          key={job.id || index}
                          className="hover:bg-gray-50 transition-colors"
                          style={{
                            backgroundColor: color.surface.tablebodybg,
                          }}
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {job.name || job.job_name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {job.failures || job.total_failures || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {job.failure_rate
                              ? `${job.failure_rate}%`
                              : job.failure_rate_percent
                              ? `${job.failure_rate_percent}%`
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Longest Running Jobs */}
            {longestRunning.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Longest Running Jobs
                </h3>
                <div className="overflow-x-auto">
                  <table
                    className="w-full"
                    style={{
                      borderCollapse: "separate",
                      borderSpacing: "0 8px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                          style={{
                            color: color.surface.tableHeaderText,
                            backgroundColor: color.surface.tableHeader,
                            borderTopLeftRadius: "0.375rem",
                          }}
                        >
                          Job Name
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                          style={{
                            color: color.surface.tableHeaderText,
                            backgroundColor: color.surface.tableHeader,
                          }}
                        >
                          Duration
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                          style={{
                            color: color.surface.tableHeaderText,
                            backgroundColor: color.surface.tableHeader,
                            borderTopRightRadius: "0.375rem",
                          }}
                        >
                          Last Run
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {longestRunning.map(
                        (job: GenericRecord, index: number) => (
                          <tr
                            key={job.id || index}
                            className="hover:bg-gray-50 transition-colors"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {job.name || job.job_name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {job.avg_duration_seconds
                                ? `${parseFloat(
                                    job.avg_duration_seconds
                                  ).toFixed(2)}s`
                                : job.max_duration_seconds
                                ? `${job.max_duration_seconds}s`
                                : job.duration || job.avg_duration || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {job.last_run_at
                                ? new Date(job.last_run_at).toLocaleString()
                                : "Never"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* High Failure Rate Jobs */}
            {highFailureRate.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  High Failure Rate Jobs
                </h3>
                <div className="overflow-x-auto">
                  <table
                    className="w-full"
                    style={{
                      borderCollapse: "separate",
                      borderSpacing: "0 8px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                          style={{
                            color: color.surface.tableHeaderText,
                            backgroundColor: color.surface.tableHeader,
                            borderTopLeftRadius: "0.375rem",
                          }}
                        >
                          Job Name
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                          style={{
                            color: color.surface.tableHeaderText,
                            backgroundColor: color.surface.tableHeader,
                          }}
                        >
                          Failure Rate
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                          style={{
                            color: color.surface.tableHeaderText,
                            backgroundColor: color.surface.tableHeader,
                            borderTopRightRadius: "0.375rem",
                          }}
                        >
                          Total Failures
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {highFailureRate.map(
                        (job: GenericRecord, index: number) => (
                          <tr
                            key={job.id || index}
                            className="hover:bg-gray-50 transition-colors"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {job.name || job.job_name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 text-sm text-red-600 font-medium">
                              {job.failure_rate
                                ? `${job.failure_rate}%`
                                : job.failure_rate_percent
                                ? `${job.failure_rate_percent}%`
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {job.failures || job.total_failures || 0}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Status Distribution Pie Chart */}
              {statusCounts.length > 0 && (
                <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Status Distribution
                  </h3>
                  <div className="h-64 w-full min-h-[256px]">
                    <ResponsiveContainer width="100%" height={256}>
                      <PieChart>
                        <Pie
                          data={statusCounts.map((item) => {
                            const status =
                              "status" in item
                                ? item.status
                                : "label" in item
                                ? item.label
                                : "Unknown";
                            const count =
                              typeof item.count === "string"
                                ? parseInt(item.count, 10) || 0
                                : item.count || 0;
                            return {
                              name:
                                status.charAt(0).toUpperCase() +
                                status.slice(1),
                              value: count,
                            };
                          })}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          isAnimationActive={true}
                          animationDuration={300}
                        >
                          {statusCounts.map((entry, index) => {
                            const pieColors =
                              color.charts.scheduledJobs.pieColors;
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={pieColors[index % pieColors.length]}
                              />
                            );
                          })}
                        </Pie>
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: "transparent" }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => (
                            <span
                              style={{ fontSize: "12px", color: "#000000" }}
                            >
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Job Type Distribution Bar Chart */}
              {typeCounts.length > 0 && (
                <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Job Type Distribution
                  </h3>
                  <div className="h-96 w-full min-h-[384px]">
                    <ResponsiveContainer width="100%" height={384}>
                      <BarChart
                        data={typeCounts.map((item) => {
                          const count =
                            typeof item.count === "string"
                              ? parseInt(item.count, 10) || 0
                              : item.count || 0;
                          return {
                            name: item.label,
                            count: count,
                          };
                        })}
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
                          fill={color.charts.scheduledJobs.primary}
                          radius={[4, 4, 0, 0]}
                          name="Jobs"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Owner Distribution Bar Chart */}
            {ownerCounts.length > 0 && (
              <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Jobs by Owner
                </h3>
                <div className="h-96 w-full min-h-[384px]">
                  <ResponsiveContainer width="100%" height={384}>
                    <BarChart
                      data={ownerCounts.map((item) => {
                        const count =
                          typeof item.count === "string"
                            ? parseInt(item.count, 10) || 0
                            : item.count || 0;
                        return {
                          name: item.label || "Unknown Owner",
                          count: count,
                        };
                      })}
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
                        fill={color.charts.scheduledJobs.accent}
                        radius={[4, 4, 0, 0]}
                        name="Jobs"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Execution Statistics */}
            {executionStats && Object.keys(executionStats).length > 0 && (
              <div className="space-y-6">
                {/* Execution Counts Bar Chart */}
                <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Execution Counts
                  </h3>
                  <div className="h-96 w-full min-h-[384px]">
                    <ResponsiveContainer width="100%" height={384}>
                      <BarChart
                        data={Object.entries(executionStats)
                          .filter(([key]) =>
                            [
                              "total_executions",
                              "successful",
                              "failed",
                              "sla_breached",
                            ].includes(key)
                          )
                          .map(([key, value]) => ({
                            name: key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase()),
                            value:
                              typeof value === "string"
                                ? parseFloat(value) || parseInt(value, 10) || 0
                                : typeof value === "number"
                                ? value
                                : 0,
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
                          dataKey="value"
                          fill={color.charts.scheduledJobs.execution}
                          radius={[4, 4, 0, 0]}
                          name="Count"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Performance Metrics Bar Chart */}
                <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Performance Metrics
                  </h3>
                  <div className="h-96 w-full min-h-[384px]">
                    <ResponsiveContainer width="100%" height={384}>
                      <BarChart
                        data={Object.entries(executionStats)
                          .filter(([key]) =>
                            [
                              "avg_duration_seconds",
                              "min_duration_seconds",
                              "max_duration_seconds",
                              "avg_rows_processed",
                            ].includes(key)
                          )
                          .map(([key, value]) => ({
                            name: key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase()),
                            value:
                              typeof value === "string"
                                ? parseFloat(value) || parseInt(value, 10) || 0
                                : typeof value === "number"
                                ? value
                                : 0,
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
                          dataKey="value"
                          fill={color.charts.scheduledJobs.performance}
                          radius={[4, 4, 0, 0]}
                          name="Value"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Resource Utilization Bar Chart */}
            {resourceUtilization &&
              Object.keys(resourceUtilization).length > 0 && (
                <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Resource Utilization
                  </h3>
                  <div className="h-64 w-full min-h-[256px]">
                    <ResponsiveContainer width="100%" height={256}>
                      <BarChart
                        data={Object.entries(resourceUtilization).map(
                          ([key, value]) => ({
                            name: key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase()),
                            value:
                              typeof value === "string"
                                ? parseFloat(value) || parseInt(value, 10) || 0
                                : typeof value === "number"
                                ? value
                                : 0,
                          })
                        )}
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
                          dataKey="value"
                          fill={color.charts.scheduledJobs.secondary}
                          radius={[4, 4, 0, 0]}
                          name="Value"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
