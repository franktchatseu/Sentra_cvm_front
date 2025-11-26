import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  Clock,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  // Play,
  // Pause,
  // Archive,
  // Power,
  // X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import DeleteConfirmModal from "../../../shared/components/ui/DeleteConfirmModal";
import { color, tw } from "../../../shared/utils/utils";
import { useToast } from "../../../contexts/ToastContext";
import { scheduledJobService } from "../services/scheduledJobService";
import { jobTypeService } from "../services/jobTypeService";
import type {
  ScheduledJob,
  ScheduledJobSearchParams,
} from "../types/scheduledJob";
import { JobType } from "../types/job";
// import { useAuth } from "../../../contexts/AuthContext";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const getStatusColors = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-50 text-green-700";
    case "paused":
      return "bg-amber-50 text-amber-700";
    case "archived":
      return "bg-gray-100 text-gray-600";
    case "draft":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function ScheduledJobsPage() {
  const navigate = useNavigate();
  const { error: showError, success: showToast } = useToast();
  // const { user } = useAuth();

  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    draftJobs: 0,
    jobsByType: 0,
    jobsByOwner: 0,
    slaBreached: 0,
    staleJobs: 0,
    dueForExecution: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingJob, setDeletingJob] = useState<ScheduledJob | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobTypeMap, setJobTypeMap] = useState<Record<number, string>>({});
  // Bulk selection and batch operations - commented out for now
  // const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());
  // const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const fetchJobs = useCallback(
    async (overrideParams?: Partial<ScheduledJobSearchParams>) => {
      setErrorMessage(null);
      const trimmedSearchTerm = searchTerm.trim();
      const hasSearchTerm = !!trimmedSearchTerm;

      setIsLoading(true);

      try {
        let response;
        if (hasSearchTerm) {
          // Use search endpoint when there's a search term
          const params: ScheduledJobSearchParams = {
            limit: 50,
            offset: 0,
            searchTerm: trimmedSearchTerm,
            ...overrideParams,
          };
          if (statusFilter) {
            params.status = statusFilter as ScheduledJobSearchParams["status"];
          }
          response = await scheduledJobService.searchScheduledJobs({
            ...params,
            skipCache: true,
          });
        } else {
          // Use list endpoint when there's no search term
          const params = {
            limit: 50,
            offset: 0,
            ...overrideParams,
          };
          if (statusFilter) {
            params.status = statusFilter;
          }
          response = await scheduledJobService.listScheduledJobs({
            ...params,
            skipCache: true,
          });
        }
        const jobList = response.data || [];
        const sortedJobs = [...jobList].sort((a, b) => {
          const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
          const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
          if (createdB === createdA) {
            return (b.id || 0) - (a.id || 0);
          }
          return createdB - createdA;
        });
        setJobs(sortedJobs);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load scheduled jobs";
        setErrorMessage(message);
        showError("Scheduled Jobs", message);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, statusFilter, showError]
  );

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const [
        statusCounts,
        typeCounts,
        ownerCounts,
        slaBreachResponse,
        staleResponse,
        dueResponse,
      ] = await Promise.all([
        scheduledJobService.getCountByStatus(true),
        scheduledJobService.getCountByType(true).catch(() => []),
        scheduledJobService.getCountByOwner(true).catch(() => []),
        scheduledJobService.getSlaBreachJobs(true).catch(() => ({ data: [] })),
        scheduledJobService.getStaleJobs(true).catch(() => ({ data: [] })),
        scheduledJobService
          .getDueForExecutionJobs(true)
          .catch(() => ({ data: [] })),
      ]);

      const totalJobs = statusCounts.reduce((sum, item) => {
        const count =
          typeof item.count === "string"
            ? parseInt(item.count, 10) || 0
            : item.count || 0;
        return sum + count;
      }, 0);

      const getCountByStatus = (status: string) => {
        const item = statusCounts.find((item) => {
          const itemStatus =
            "status" in item ? item.status : "label" in item ? item.label : "";
          return itemStatus.toLowerCase() === status.toLowerCase();
        });
        if (!item) return 0;
        return typeof item.count === "string"
          ? parseInt(item.count, 10) || 0
          : item.count || 0;
      };

      const activeJobs = getCountByStatus("active");
      const draftJobs = getCountByStatus("draft");

      // Sum up jobs by type
      const jobsByType = Array.isArray(typeCounts)
        ? typeCounts.reduce((sum, item) => {
            const count =
              typeof item.count === "string"
                ? parseInt(item.count, 10) || 0
                : item.count || 0;
            return sum + count;
          }, 0)
        : 0;

      // Sum up jobs by owner
      const jobsByOwner = Array.isArray(ownerCounts)
        ? ownerCounts.reduce((sum, item) => {
            const count =
              typeof item.count === "string"
                ? parseInt(item.count, 10) || 0
                : item.count || 0;
            return sum + count;
          }, 0)
        : 0;

      // Get counts from list responses
      const slaBreached =
        slaBreachResponse && "data" in slaBreachResponse
          ? slaBreachResponse.data.length
          : 0;
      const staleJobs =
        staleResponse && "data" in staleResponse
          ? staleResponse.data.length
          : 0;
      const dueForExecution =
        dueResponse && "data" in dueResponse ? dueResponse.data.length : 0;

      setStats({
        totalJobs,
        activeJobs,
        draftJobs,
        jobsByType,
        jobsByOwner,
        slaBreached,
        staleJobs,
        dueForExecution,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchJobs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const loadJobTypes = async () => {
      try {
        const response = await jobTypeService.listJobTypes({
          limit: 100,
          skipCache: true,
        });
        setJobTypes(response.data || []);
        // Create a map of job_type_id -> job_type_name
        const map: Record<number, string> = {};
        (response.data || []).forEach((jobType) => {
          map[jobType.id] = jobType.name;
        });
        setJobTypeMap(map);
      } catch (err) {
        console.error("Failed to load job types:", err);
      }
    };
    loadJobTypes();
  }, []);

  const filteredJobs = useMemo(() => jobs, [jobs]);

  // Bulk selection and batch operations - commented out for now
  // const handleSelectJob = (jobId: number) => {
  //   setSelectedJobs((prev) => {
  //     const newSet = new Set(prev);
  //     if (newSet.has(jobId)) {
  //       newSet.delete(jobId);
  //     } else {
  //       newSet.add(jobId);
  //     }
  //     return newSet;
  //   });
  // };

  // const handleSelectAll = () => {
  //   if (selectedJobs.size === filteredJobs.length) {
  //     setSelectedJobs(new Set());
  //   } else {
  //     setSelectedJobs(new Set(filteredJobs.map((job) => job.id)));
  //   }
  // };

  // const handleBatchAction = async (
  //   action: "activate" | "deactivate" | "pause" | "archive" | "delete"
  // ) => {
  //   if (selectedJobs.size === 0) return;

  //   const jobIds = Array.from(selectedJobs);
  //   setIsBatchProcessing(true);

  //   try {
  //     let result;
  //     switch (action) {
  //       case "activate":
  //         result = await scheduledJobService.batchActivate(
  //           jobIds,
  //           user?.user_id
  //         );
  //         break;
  //       case "deactivate":
  //         result = await scheduledJobService.batchDeactivate(
  //           jobIds,
  //           user?.user_id
  //         );
  //         break;
  //       case "pause":
  //         result = await scheduledJobService.batchPause(jobIds, user?.user_id);
  //         break;
  //       case "archive":
  //         result = await scheduledJobService.batchArchive(
  //           jobIds,
  //           user?.user_id
  //         );
  //         break;
  //       case "delete":
  //         if (
  //           !window.confirm(
  //             `Are you sure you want to delete ${jobIds.length} job(s)? This action cannot be undone.`
  //           )
  //         ) {
  //           setIsBatchProcessing(false);
  //           return;
  //         }
  //         result = await scheduledJobService.batchDelete(jobIds, user?.user_id);
  //         break;
  //     }

  //     showToast(
  //       `Batch ${action} completed`,
  //       `${result.success} job(s) ${action}d successfully${
  //         result.failed > 0 ? `, ${result.failed} failed` : ""
  //       }`
  //     );

  //     setSelectedJobs(new Set());
  //     fetchJobs(); // Refresh the list
  //   } catch (err) {
  //     showError(
  //       `Batch ${action} failed`,
  //       err instanceof Error ? err.message : "Unknown error"
  //     );
  //   } finally {
  //     setIsBatchProcessing(false);
  //   }
  // };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
            Scheduled Jobs
          </h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>
            View and manage all scheduled jobs configured in the system.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard/scheduled-jobs/create")}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: color.primary.action }}
          >
            <Plus className="h-4 w-4" />
            Create Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Briefcase
              className="h-5 w-5"
              style={{ color: color.primary.accent }}
            />
            <p className="text-sm font-medium text-gray-600">
              Total Scheduled Jobs
            </p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isLoadingStats ? "..." : stats.totalJobs}
          </p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle
              className="h-5 w-5"
              style={{ color: color.primary.accent }}
            />
            <p className="text-sm font-medium text-gray-600">Active Jobs</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isLoadingStats ? "..." : stats.activeJobs}
          </p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Briefcase
              className="h-5 w-5"
              style={{ color: color.primary.accent }}
            />
            <p className="text-sm font-medium text-gray-600">Draft Jobs</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isLoadingStats ? "..." : stats.draftJobs}
          </p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="h-5 w-5"
              style={{ color: color.primary.accent }}
            />
            <p className="text-sm font-medium text-gray-600">SLA Breached</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isLoadingStats ? "..." : stats.slaBreached}
          </p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock
              className="h-5 w-5"
              style={{ color: color.primary.accent }}
            />
            <p className="text-sm font-medium text-gray-600">Stale Jobs</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isLoadingStats ? "..." : stats.staleJobs}
          </p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle
              className="h-5 w-5"
              style={{ color: color.primary.accent }}
            />
            <p className="text-sm font-medium text-gray-600">
              Due for Execution
            </p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isLoadingStats ? "..." : stats.dueForExecution}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full rounded-md border border-gray-200 py-3 pl-10 pr-4 text-sm shadow-sm focus:border-[#3b8169] focus:outline-none focus:ring-1 focus:ring-[#3b8169]"
            placeholder="Search by name or code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#3b8169] focus:outline-none focus:ring-1 focus:ring-[#3b8169] w-auto min-w-[180px]"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Batch Actions Toolbar - Commented out for now */}
      {/* {selectedJobs.size > 0 && (
        <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedJobs.size} job(s) selected
            </span>
            <button
              onClick={() => setSelectedJobs(new Set())}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchAction("activate")}
              disabled={isBatchProcessing}
              className="inline-flex items-center gap-2 rounded-md border border-green-200 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Activate
            </button>
            <button
              onClick={() => handleBatchAction("pause")}
              disabled={isBatchProcessing}
              className="inline-flex items-center gap-2 rounded-md border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
            <button
              onClick={() => handleBatchAction("archive")}
              disabled={isBatchProcessing}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Archive className="h-4 w-4" />
              Archive
            </button>
            <button
              onClick={() => handleBatchAction("delete")}
              disabled={isBatchProcessing}
              className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )} */}

      <div>
        {errorMessage && (
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 mb-4">
            <AlertTriangle className="h-4 w-4" />
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className={`text-lg font-semibold ${tw.textPrimary}`}>
              No scheduled jobs found
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try updating your search filters or create a new job
              configuration.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full"
              style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
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
                    Type
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: color.surface.tableHeaderText,
                      backgroundColor: color.surface.tableHeader,
                    }}
                  >
                    Schedule
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: color.surface.tableHeaderText,
                      backgroundColor: color.surface.tableHeader,
                    }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: color.surface.tableHeaderText,
                      backgroundColor: color.surface.tableHeader,
                      borderTopRightRadius: "0.375rem",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="transition-colors">
                    <td
                      className="px-6 py-4"
                      style={{
                        backgroundColor: color.surface.tablebodybg,
                        borderTopLeftRadius: "0.375rem",
                        borderBottomLeftRadius: "0.375rem",
                      }}
                    >
                      <div className="flex items-center">
                        <div>
                          <div
                            className={`text-base font-semibold ${tw.textPrimary}`}
                          >
                            {job.name}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            Code: {job.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      <div className={`text-sm ${tw.textSecondary}`}>
                        {job.job_type_id && jobTypeMap[job.job_type_id]
                          ? jobTypeMap[job.job_type_id]
                          : job.job_type_id
                          ? `Type #${job.job_type_id}`
                          : "—"}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      <div className={`text-sm ${tw.textSecondary} capitalize`}>
                        {job.schedule_type.replace("_", " ")}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      <span className="text-sm text-gray-900 font-medium">
                        {job.status}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-right"
                      style={{
                        backgroundColor: color.surface.tablebodybg,
                        borderTopRightRadius: "0.375rem",
                        borderBottomRightRadius: "0.375rem",
                      }}
                    >
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/scheduled-jobs/${job.id}`)
                          }
                          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          aria-label="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/dashboard/scheduled-jobs/${job.id}/edit`)
                          }
                          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          aria-label="Edit job"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingJob(job);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          aria-label="Delete job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deletingJob && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingJob(null);
          }}
          onConfirm={async () => {
            if (!deletingJob) return;
            try {
              setIsDeleting(true);
              await scheduledJobService.deleteScheduledJob(deletingJob.id);
              showToast(
                "Scheduled job deleted",
                `"${deletingJob.name}" has been deleted successfully.`
              );
              setShowDeleteModal(false);
              setDeletingJob(null);
              await fetchJobs();
            } catch (err) {
              const message =
                err instanceof Error
                  ? err.message
                  : "Failed to delete scheduled job";
              showError("Unable to delete scheduled job", message);
            } finally {
              setIsDeleting(false);
            }
          }}
          title="Delete Scheduled Job"
          description={`Are you sure you want to delete the scheduled job "${deletingJob.name}"? This action cannot be undone.`}
          itemName={deletingJob.name}
          isLoading={isDeleting}
          confirmText="Delete"
          cancelText="Cancel"
          variant="delete"
        />
      )}
    </div>
  );
}
