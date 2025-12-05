import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  AlertTriangle,
  Link2,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import DeleteConfirmModal from "../../../shared/components/ui/DeleteConfirmModal";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import DateFormatter from "../../../shared/components/DateFormatter";
import { color, tw } from "../../../shared/utils/utils";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useAuth } from "../../../contexts/AuthContext";
import { jobDependencyService } from "../services/jobDependencyService";
import { scheduledJobService } from "../services/scheduledJobService";
import {
  JobDependency,
  CreateJobDependencyPayload,
  UpdateJobDependencyPayload,
  DependencyType,
  WaitForStatus,
} from "../types/jobDependency";
import { ScheduledJob } from "../types/scheduledJob";

interface JobDependencyModalProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (values: CreateJobDependencyPayload) => Promise<void>;
  initialData?: JobDependency | null;
}

function JobDependencyModal({
  isOpen,
  isSaving,
  onClose,
  onSubmit,
  initialData,
}: JobDependencyModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [jobId, setJobId] = useState<number | "">("");
  const [dependsOnJobId, setDependsOnJobId] = useState<number | "">("");
  const [dependencyType, setDependencyType] =
    useState<DependencyType>("blocking");
  const [waitForStatus, setWaitForStatus] = useState<WaitForStatus>("success");
  const [maxWaitMinutes, setMaxWaitMinutes] = useState<string>("");
  const [lookbackDays, setLookbackDays] = useState<string>("0");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setJobId(initialData.job_id);
      setDependsOnJobId(initialData.depends_on_job_id);
      setDependencyType(initialData.dependency_type);
      setWaitForStatus(initialData.wait_for_status);
      setMaxWaitMinutes(initialData.max_wait_minutes?.toString() || "");
      setLookbackDays(initialData.lookback_days.toString());
      setIsActive(initialData.is_active);
    } else {
      setJobId("");
      setDependsOnJobId("");
      setDependencyType("blocking");
      setWaitForStatus("success");
      setMaxWaitMinutes("");
      setLookbackDays("0");
      setIsActive(true);
    }
    setError(null);
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const loadJobs = async () => {
      setIsLoadingJobs(true);
      try {
        const response = await scheduledJobService.listScheduledJobs({
          limit: 100,
          skipCache: true,
        });
        setJobs(response.data || []);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    loadJobs();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!jobId || jobId === "") {
      setError("Job ID is required");
      return;
    }

    if (!dependsOnJobId || dependsOnJobId === "") {
      setError("Depends on Job ID is required");
      return;
    }

    if (jobId === dependsOnJobId) {
      setError("A job cannot depend on itself");
      return;
    }

    if (
      maxWaitMinutes &&
      (isNaN(Number(maxWaitMinutes)) ||
        Number(maxWaitMinutes) < 0 ||
        Number(maxWaitMinutes) > 1440)
    ) {
      setError("Max wait minutes must be between 0 and 1440");
      return;
    }

    if (
      isNaN(Number(lookbackDays)) ||
      Number(lookbackDays) < 0 ||
      Number(lookbackDays) > 30
    ) {
      setError("Lookback days must be between 0 and 30");
      return;
    }

    if (!user?.id) {
      setError("User ID is required");
      return;
    }

    setError(null);

    try {
      await onSubmit({
        job_id: Number(jobId),
        depends_on_job_id: Number(dependsOnJobId),
        dependency_type: dependencyType,
        wait_for_status: waitForStatus,
        max_wait_minutes: maxWaitMinutes ? Number(maxWaitMinutes) : null,
        lookback_days: Number(lookbackDays),
        is_active: isActive,
        userId: user.id,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save job dependency";
      setError(message);
    }
  };

  const jobOptions = jobs.map((job) => ({
    value: job.id.toString(),
    label: `${job.name} (ID: ${job.id})`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData ? "Edit Job Dependency" : "Create Job Dependency"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {initialData
                ? "Update the job dependency relationship"
                : "Define a relationship between two scheduled jobs"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Job ID (Dependent Job)
            </label>
            {isLoadingJobs ? (
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <LoadingSpinner size="sm" />
                Loading jobs...
              </div>
            ) : (
              <HeadlessSelect
                options={jobOptions}
                value={jobId ? jobId.toString() : ""}
                onChange={(value) => setJobId(value ? Number(value) : "")}
                placeholder="Select a job"
                className="mt-1"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Depends On Job ID
            </label>
            {isLoadingJobs ? (
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <LoadingSpinner size="sm" />
                Loading jobs...
              </div>
            ) : (
              <HeadlessSelect
                options={jobOptions}
                value={dependsOnJobId ? dependsOnJobId.toString() : ""}
                onChange={(value) =>
                  setDependsOnJobId(value ? Number(value) : "")
                }
                placeholder="Select a job this depends on"
                className="mt-1"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dependency Type
            </label>
            <HeadlessSelect
              options={[
                { value: "blocking", label: "Blocking" },
                { value: "optional", label: "Optional" },
                { value: "cross_day", label: "Cross Day" },
                { value: "conditional", label: "Conditional" },
              ]}
              value={dependencyType}
              onChange={(value) => setDependencyType(value as DependencyType)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wait For Status
            </label>
            <HeadlessSelect
              options={[
                { value: "success", label: "Success" },
                { value: "completed", label: "Completed" },
                { value: "failed", label: "Failed" },
                { value: "any", label: "Any" },
              ]}
              value={waitForStatus}
              onChange={(value) => setWaitForStatus(value as WaitForStatus)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Wait Minutes (0-1440, optional)
            </label>
            <input
              type="number"
              value={maxWaitMinutes}
              onChange={(e) => setMaxWaitMinutes(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#3b8169] focus:outline-none focus:ring-1 focus:ring-[#3b8169]"
              placeholder="e.g. 60 (leave empty for no limit)"
              min="0"
              max="1440"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lookback Days (0-30)
            </label>
            <input
              type="number"
              value={lookbackDays}
              onChange={(e) => setLookbackDays(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#3b8169] focus:outline-none focus:ring-1 focus:ring-[#3b8169]"
              placeholder="0"
              min="0"
              max="30"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#3b8169] focus:ring-[#3b8169]"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t.genericConfig.cancel}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: color.primary.action }}
            >
              {isSaving
                ? t.profile.saving
                : initialData
                ? "Update Dependency"
                : "Create Dependency"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface JobDependencyViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dependency: JobDependency | null;
  isLoading: boolean;
}

function JobDependencyViewModal({
  isOpen,
  onClose,
  dependency,
  isLoading,
}: JobDependencyViewModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Job Dependency Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : dependency ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Dependency #{dependency.id}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                {dependency.is_active ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <XCircle className="w-3 h-3" />
                    Inactive
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job ID
                  </label>
                  <p className="text-sm text-gray-900">{dependency.job_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Depends On Job ID
                  </label>
                  <p className="text-sm text-gray-900">
                    {dependency.depends_on_job_id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dependency Type
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {dependency.dependency_type}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wait For Status
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {dependency.wait_for_status}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Wait Minutes
                  </label>
                  <p className="text-sm text-gray-900">
                    {dependency.max_wait_minutes ?? "No limit"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lookback Days
                  </label>
                  <p className="text-sm text-gray-900">
                    {dependency.lookback_days}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900">
                  <DateFormatter
                    date={dependency.created_at}
                    includeTime
                    useLocale
                    year="numeric"
                    month="short"
                    day="numeric"
                  />
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            No dependency data available
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobDependenciesPage() {
  const navigate = useNavigate();
  const { success: showToast, error: showError } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [dependencies, setDependencies] = useState<JobDependency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDependency, setEditingDependency] =
    useState<JobDependency | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDependency, setDeletingDependency] =
    useState<JobDependency | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalDependencies: 0,
    activeDependencies: 0,
    inactiveDependencies: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDependency, setViewingDependency] =
    useState<JobDependency | null>(null);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [dependencyTypeFilter, setDependencyTypeFilter] =
    useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Additional state for advanced features
  const [selectedJobId, setSelectedJobId] = useState<number | "">("");
  const [showChainModal, setShowChainModal] = useState(false);
  const [chainData, setChainData] = useState<any[]>([]);
  const [isLoadingChain, setIsLoadingChain] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [showSatisfiedModal, setShowSatisfiedModal] = useState(false);
  const [satisfiedData, setSatisfiedData] = useState<any>(null);
  const [isLoadingSatisfied, setIsLoadingSatisfied] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState<Set<number>>(
    new Set()
  );
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [mostDependedJobs, setMostDependedJobs] = useState<any[]>([]);
  const [orphanedJobs, setOrphanedJobs] = useState<any[]>([]);
  const [complexDependencies, setComplexDependencies] = useState<
    JobDependency[]
  >([]);

  const fetchDependencies = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await jobDependencyService.listJobDependencies({
        limit: 100,
        skipCache: true,
        activeOnly: false,
      });
      setDependencies(response.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load job dependencies";
      setLoadError(message);
      showError("Unable to load job dependencies", message);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const searchDependencies = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        await fetchDependencies();
        return;
      }

      setIsSearching(true);
      setLoadError(null);
      try {
        const response = await jobDependencyService.searchJobDependencies({
          limit: 100,
          skipCache: true,
        });
        // Client-side filtering for search term
        const filtered = (response.data || []).filter(
          (dep) =>
            dep.job_id.toString().includes(term) ||
            dep.depends_on_job_id.toString().includes(term) ||
            dep.dependency_type.toLowerCase().includes(term.toLowerCase()) ||
            dep.wait_for_status.toLowerCase().includes(term.toLowerCase())
        );
        setDependencies(filtered);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to search job dependencies";
        setLoadError(message);
        showError("Unable to search job dependencies", message);
      } finally {
        setIsSearching(false);
      }
    },
    [fetchDependencies, showError]
  );

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const statsResponse = await jobDependencyService.getDependencyStatistics(
        true
      );
      if (statsResponse.success && statsResponse.data) {
        setStats({
          totalDependencies: statsResponse.data.total_dependencies,
          activeDependencies: statsResponse.data.active_dependencies,
          inactiveDependencies: statsResponse.data.inactive_dependencies,
        });
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDependencies();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDependencies]);

  useEffect(() => {
    if (dependencies.length > 0) {
      fetchStats();
    }
  }, [dependencies.length, fetchStats]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchTerm.trim()) {
      fetchDependencies();
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchDependencies(searchTerm);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchDependencies, searchDependencies]);

  const filteredDependencies = useMemo(() => {
    let filtered = [...dependencies];

    if (dependencyTypeFilter !== "all") {
      filtered = filtered.filter(
        (dep) => dep.dependency_type === dependencyTypeFilter
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((dep) => dep.is_active);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((dep) => !dep.is_active);
    }

    // Sort by created_at descending (newest first), then by ID descending as fallback
    return filtered.sort((a, b) => {
      if (a.created_at && b.created_at) {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return b.id - a.id;
    });
  }, [dependencies, dependencyTypeFilter, statusFilter]);

  const handleCreate = () => {
    setEditingDependency(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (dependency: JobDependency) => {
    setEditingDependency(dependency);
    setIsModalOpen(true);

    try {
      const freshDependency = await jobDependencyService.getJobDependencyById(
        dependency.id,
        true
      );
      setEditingDependency(freshDependency);
    } catch (err) {
      console.error("Failed to fetch dependency details:", err);
    }
  };

  const handleView = async (dependency: JobDependency) => {
    setViewingDependency(dependency);
    setIsViewModalOpen(true);
    setIsLoadingView(true);

    try {
      const freshDependency = await jobDependencyService.getJobDependencyById(
        dependency.id,
        true
      );
      setViewingDependency(freshDependency);
    } catch (err) {
      console.error("Failed to fetch dependency details:", err);
    } finally {
      setIsLoadingView(false);
    }
  };

  const handleDeleteClick = (dependency: JobDependency) => {
    setDeletingDependency(dependency);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDependency) return;

    try {
      setIsDeleting(true);
      await jobDependencyService.deleteJobDependency(deletingDependency.id);
      showToast(
        "Job dependency deleted",
        `Dependency #${deletingDependency.id} has been deleted`
      );
      setShowDeleteModal(false);
      setDeletingDependency(null);
      await fetchDependencies();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete job dependency";
      showError("Unable to delete job dependency", message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalSubmit = async (values: CreateJobDependencyPayload) => {
    try {
      setIsSaving(true);
      if (editingDependency) {
        const updatePayload: UpdateJobDependencyPayload = {
          dependency_type: values.dependency_type,
          wait_for_status: values.wait_for_status,
          max_wait_minutes: values.max_wait_minutes,
          lookback_days: values.lookback_days,
          is_active: values.is_active,
          userId: values.userId,
        };
        await jobDependencyService.updateJobDependency(
          editingDependency.id,
          updatePayload
        );
        showToast(
          "Job dependency updated",
          `Dependency #${editingDependency.id} has been updated successfully`
        );
      } else {
        await jobDependencyService.createJobDependency(values);
        showToast(
          "Job dependency created",
          "Job dependency has been created successfully"
        );
      }
      setIsModalOpen(false);
      setEditingDependency(null);
      await fetchDependencies();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save job dependency";
      showError("Unable to save job dependency", message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (dependency: JobDependency) => {
    try {
      if (dependency.is_active) {
        await jobDependencyService.deactivateDependency(dependency.id);
        showToast(
          "Dependency deactivated",
          `Dependency #${dependency.id} has been deactivated`
        );
      } else {
        await jobDependencyService.activateDependency(dependency.id);
        showToast(
          "Dependency activated",
          `Dependency #${dependency.id} has been activated`
        );
      }
      await fetchDependencies();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to toggle dependency status";
      showError("Unable to toggle dependency", message);
    }
  };

  // Handler for getDependenciesForJob
  const handleGetDependenciesForJob = async (jobId: number) => {
    try {
      const response = await jobDependencyService.getDependenciesForJob(jobId, {
        limit: 100,
        skipCache: true,
        activeOnly: false,
      });
      setDependencies(response.data || []);
      showToast("Dependencies loaded", `Loaded dependencies for Job #${jobId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dependencies";
      showError("Unable to load dependencies", message);
    }
  };

  // Handler for getJobsDependingOn
  const handleGetJobsDependingOn = async (dependsOnJobId: number) => {
    try {
      const response = await jobDependencyService.getJobsDependingOn(
        dependsOnJobId,
        {
          limit: 100,
          skipCache: true,
          activeOnly: false,
        }
      );
      setDependencies(response.data || []);
      showToast(
        "Dependencies loaded",
        `Loaded jobs depending on Job #${dependsOnJobId}`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dependencies";
      showError("Unable to load dependencies", message);
    }
  };

  // Handler for getSpecificDependency
  const handleGetSpecificDependency = async (
    jobId: number,
    dependsOnJobId: number
  ) => {
    try {
      const dependency = await jobDependencyService.getSpecificDependency(
        jobId,
        dependsOnJobId,
        true
      );
      setViewingDependency(dependency);
      setIsViewModalOpen(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dependency";
      showError("Unable to load dependency", message);
    }
  };

  // Handler for getBlockingDependencies
  const handleGetBlockingDependencies = async (jobId: number) => {
    try {
      const response = await jobDependencyService.getBlockingDependencies(
        jobId,
        {
          limit: 100,
          skipCache: true,
        }
      );
      setDependencies(response.data || []);
      showToast(
        "Blocking dependencies loaded",
        `Loaded blocking dependencies for Job #${jobId}`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load blocking dependencies";
      showError("Unable to load blocking dependencies", message);
    }
  };

  // Handler for getDependencyChain
  const handleGetDependencyChain = async (jobId: number) => {
    setIsLoadingChain(true);
    setShowChainModal(true);
    try {
      const response = await jobDependencyService.getDependencyChain(
        jobId,
        true
      );
      setChainData(response.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dependency chain";
      showError("Unable to load dependency chain", message);
      setShowChainModal(false);
    } finally {
      setIsLoadingChain(false);
    }
  };

  // Handler for getCriticalPath
  const handleGetCriticalPath = async (jobId: number) => {
    setIsLoadingChain(true);
    setShowChainModal(true);
    try {
      const response = await jobDependencyService.getCriticalPath(jobId, true);
      setChainData(response.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load critical path";
      showError("Unable to load critical path", message);
      setShowChainModal(false);
    } finally {
      setIsLoadingChain(false);
    }
  };

  // Handler for getImmediateDependencies
  const handleGetImmediateDependencies = async (jobId: number) => {
    try {
      const response = await jobDependencyService.getImmediateDependencies(
        jobId,
        true
      );
      setDependencies(response.data || []);
      showToast(
        "Immediate dependencies loaded",
        `Loaded immediate dependencies for Job #${jobId}`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load immediate dependencies";
      showError("Unable to load immediate dependencies", message);
    }
  };

  // Handler for getAllDependents
  const handleGetAllDependents = async (jobId: number) => {
    try {
      const response = await jobDependencyService.getAllDependents(jobId, true);
      showToast(
        "Dependents loaded",
        `Job #${jobId} has ${response.data?.jobIds?.length || 0} dependent jobs`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dependents";
      showError("Unable to load dependents", message);
    }
  };

  // Handler for checkDependenciesSatisfied
  const handleCheckDependenciesSatisfied = async (jobId: number) => {
    setIsLoadingSatisfied(true);
    setShowSatisfiedModal(true);
    try {
      const response = await jobDependencyService.checkDependenciesSatisfied(
        jobId,
        true
      );
      setSatisfiedData(response.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to check dependencies";
      showError("Unable to check dependencies", message);
      setShowSatisfiedModal(false);
    } finally {
      setIsLoadingSatisfied(false);
    }
  };

  // Handler for getUnsatisfiedDependencies
  const handleGetUnsatisfiedDependencies = async (jobId: number) => {
    setIsLoadingStatus(true);
    setShowStatusModal(true);
    try {
      const response = await jobDependencyService.getUnsatisfiedDependencies(
        jobId,
        true
      );
      setStatusData(response.data || []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load unsatisfied dependencies";
      showError("Unable to load unsatisfied dependencies", message);
      setShowStatusModal(false);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Handler for getDependencyStatus
  const handleGetDependencyStatus = async (jobId: number) => {
    setIsLoadingStatus(true);
    setShowStatusModal(true);
    try {
      const response = await jobDependencyService.getDependencyStatus(
        jobId,
        true
      );
      setStatusData(response.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dependency status";
      showError("Unable to load dependency status", message);
      setShowStatusModal(false);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Handler for getDependencyGraph
  const handleGetDependencyGraph = async () => {
    setIsLoadingGraph(true);
    setShowGraphModal(true);
    try {
      const response = await jobDependencyService.getDependencyGraph(true);
      setGraphData(response.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dependency graph";
      showError("Unable to load dependency graph", message);
      setShowGraphModal(false);
    } finally {
      setIsLoadingGraph(false);
    }
  };

  // Handler for getOrphanedJobs
  const handleGetOrphanedJobs = async () => {
    try {
      const response = await jobDependencyService.getOrphanedJobs(true);
      setOrphanedJobs(response.data || []);
      showToast(
        "Orphaned jobs loaded",
        `Found ${response.data?.length || 0} orphaned jobs`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load orphaned jobs";
      showError("Unable to load orphaned jobs", message);
    }
  };

  // Handler for getMostDependedOnJobs
  const handleGetMostDependedOnJobs = async () => {
    try {
      const response = await jobDependencyService.getMostDependedOnJobs(
        10,
        true
      );
      setMostDependedJobs(response.data || []);
      showToast(
        "Most depended jobs loaded",
        "Loaded top 10 most depended-on jobs"
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load most depended jobs";
      showError("Unable to load most depended jobs", message);
    }
  };

  // Handler for getComplexDependencies
  const handleGetComplexDependencies = async () => {
    try {
      const response = await jobDependencyService.getComplexDependencies(true);
      setComplexDependencies(response.data || []);
      setDependencies(response.data || []);
      showToast(
        "Complex dependencies loaded",
        "Loaded dependencies with complex structures"
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load complex dependencies";
      showError("Unable to load complex dependencies", message);
    }
  };

  // Handler for batchActivateDependencies
  const handleBatchActivate = async () => {
    if (selectedDependencies.size === 0) {
      showError("No selection", "Please select dependencies to activate");
      return;
    }
    setIsBulkProcessing(true);
    try {
      const response = await jobDependencyService.batchActivateDependencies({
        dependency_ids: Array.from(selectedDependencies),
      });
      showToast(
        "Dependencies activated",
        `${response.data?.activated || 0} dependencies activated`
      );
      setSelectedDependencies(new Set());
      setShowBulkModal(false);
      await fetchDependencies();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to activate dependencies";
      showError("Unable to activate dependencies", message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Handler for batchDeactivateDependencies
  const handleBatchDeactivate = async () => {
    if (selectedDependencies.size === 0) {
      showError("No selection", "Please select dependencies to deactivate");
      return;
    }
    setIsBulkProcessing(true);
    try {
      const response = await jobDependencyService.batchDeactivateDependencies({
        dependency_ids: Array.from(selectedDependencies),
      });
      showToast(
        "Dependencies deactivated",
        `${response.data?.deactivated || 0} dependencies deactivated`
      );
      setSelectedDependencies(new Set());
      setShowBulkModal(false);
      await fetchDependencies();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to deactivate dependencies";
      showError("Unable to deactivate dependencies", message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Handler for deleteAllDependenciesForJob
  const handleDeleteAllForJob = async (jobId: number) => {
    if (
      !window.confirm(
        `Are you sure you want to delete all dependencies for Job #${jobId}?`
      )
    ) {
      return;
    }
    try {
      const response = await jobDependencyService.deleteAllDependenciesForJob(
        jobId
      );
      showToast(
        "Dependencies deleted",
        `${response.data?.removed || 0} dependencies removed for Job #${jobId}`
      );
      await fetchDependencies();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete dependencies";
      showError("Unable to delete dependencies", message);
    }
  };

  const IconComponent = Link2;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
            Job Dependencies
          </h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>
            Manage relationships between scheduled jobs to control execution
            order.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-md font-semibold flex items-center gap-2 text-sm text-white"
            style={{ backgroundColor: color.primary.action }}
          >
            <Plus className="w-4 h-4" />
            Create Dependency
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Link2
              className="h-5 w-5"
              style={{ color: color.primary.accent }}
            />
            <p className="text-sm font-medium text-gray-600">
              Total Dependencies
            </p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isLoadingStats ? "..." : stats.totalDependencies}
          </p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle
              className="h-5 w-5"
              style={{ color: color.primary.accent }}
            />
            <p className="text-sm font-medium text-gray-600">
              Active Dependencies
            </p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isLoadingStats ? "..." : stats.activeDependencies}
          </p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle
              className="h-5 w-5"
              style={{ color: color.primary.accent }}
            />
            <p className="text-sm font-medium text-gray-600">
              Inactive Dependencies
            </p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isLoadingStats ? "..." : stats.inactiveDependencies}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by job ID, dependency type, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#3b8169]"></div>
            </div>
          )}
        </div>
        <HeadlessSelect
          options={[
            { value: "all", label: "All Types" },
            { value: "blocking", label: "Blocking" },
            { value: "optional", label: "Optional" },
            { value: "cross_day", label: "Cross Day" },
            { value: "conditional", label: "Conditional" },
          ]}
          value={dependencyTypeFilter}
          onChange={setDependencyTypeFilter}
          placeholder="Filter by type"
        />
        <HeadlessSelect
          options={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
        />
      </div>

      {/* Advanced Actions Toolbar */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-md border border-gray-200">
        <span className="text-sm font-medium text-gray-700 self-center">
          Advanced Operations:
        </span>
        <button
          onClick={handleGetDependencyGraph}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          View Graph
        </button>
        <button
          onClick={handleGetOrphanedJobs}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          Orphaned Jobs
        </button>
        <button
          onClick={handleGetMostDependedOnJobs}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          Most Depended
        </button>
        <button
          onClick={handleGetComplexDependencies}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          Complex Dependencies
        </button>
        <button
          onClick={() => setShowBulkModal(true)}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          Bulk Operations
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="number"
            placeholder="Job ID"
            value={selectedJobId}
            onChange={(e) =>
              setSelectedJobId(e.target.value ? Number(e.target.value) : "")
            }
            className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
          />
          <button
            onClick={() =>
              selectedJobId &&
              handleGetDependenciesForJob(Number(selectedJobId))
            }
            disabled={!selectedJobId}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Get Dependencies
          </button>
        </div>
      </div>

      <div className="rounded-md">
        {loadError && (
          <div className="border-b border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : filteredDependencies.length === 0 ? (
          <div className="text-center py-12">
            <IconComponent className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
              {searchTerm ? "No Dependencies Found" : "No Job Dependencies"}
            </h3>
            <p className={`${tw.textSecondary} mb-6`}>
              {searchTerm
                ? "Try adjusting your search terms."
                : "Create your first job dependency to get started."}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-md font-semibold flex items-center gap-2 mx-auto text-sm text-white"
                style={{ backgroundColor: color.primary.action }}
              >
                <Plus className="w-4 h-4" />
                Create Dependency
              </button>
            )}
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
                    Job ID
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: color.surface.tableHeaderText,
                      backgroundColor: color.surface.tableHeader,
                    }}
                  >
                    Depends On
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
                    Wait For
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
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: color.surface.tableHeaderText,
                      backgroundColor: color.surface.tableHeader,
                    }}
                  >
                    Created
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
                {filteredDependencies.map((dependency) => (
                  <tr key={dependency.id} className="transition-colors">
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
                            Job #{dependency.job_id}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            ID: {dependency.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      <span className="text-sm text-gray-900 font-medium">
                        Job #{dependency.depends_on_job_id}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      <span className="text-sm text-gray-900 capitalize">
                        {dependency.dependency_type}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      <span className="text-sm text-gray-900 capitalize">
                        {dependency.wait_for_status}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      {dependency.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4"
                      style={{ backgroundColor: color.surface.tablebodybg }}
                    >
                      <span className="text-sm text-gray-600">
                        <DateFormatter date={dependency.created_at} />
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
                          onClick={() => handleView(dependency)}
                          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          aria-label="View dependency"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(dependency)}
                          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          aria-label="Edit dependency"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(dependency)}
                          className={`p-2 rounded-md transition-colors ${
                            dependency.is_active
                              ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          }`}
                          aria-label={
                            dependency.is_active
                              ? "Deactivate dependency"
                              : "Activate dependency"
                          }
                          title={
                            dependency.is_active ? "Deactivate" : "Activate"
                          }
                        >
                          {dependency.is_active ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(dependency)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          aria-label="Delete dependency"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleGetDependencyChain(dependency.job_id)
                          }
                          className="p-2 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          aria-label="View dependency chain"
                          title="View Chain"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleCheckDependenciesSatisfied(dependency.job_id)
                          }
                          className="p-2 rounded-md text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                          aria-label="Check if satisfied"
                          title="Check Satisfied"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleGetDependencyStatus(dependency.job_id)
                          }
                          className="p-2 rounded-md text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                          aria-label="View dependency status"
                          title="View Status"
                        >
                          <Filter className="w-4 h-4" />
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

      {/* Chain/Path Modal */}
      {showChainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Dependency Chain
              </h2>
              <button
                onClick={() => setShowChainModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {isLoadingChain ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-2">
                {chainData.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-md">
                    <div className="font-medium">
                      Job #{item.job_id} {item.job_name && `- ${item.job_name}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      Level: {item.level}
                    </div>
                    {item.depends_on && (
                      <div className="text-sm text-gray-600">
                        Depends on: Job #{item.depends_on}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Dependency Status
              </h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {isLoadingStatus ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-2">
                {statusData.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-md ${
                      item.status === "satisfied" ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <div className="font-medium">
                      Depends on Job #{item.depends_on_job_id}
                    </div>
                    <div className="text-sm">Status: {item.status}</div>
                    <div className="text-sm">
                      Required: {item.required_status}
                    </div>
                    {item.current_status && (
                      <div className="text-sm">
                        Current: {item.current_status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Satisfied Check Modal */}
      {showSatisfiedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Dependencies Satisfied
              </h2>
              <button
                onClick={() => setShowSatisfiedModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {isLoadingSatisfied ? (
              <LoadingSpinner />
            ) : (
              <div
                className={`p-4 rounded-md ${
                  satisfiedData?.satisfied
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                <div className="font-medium text-lg">
                  {satisfiedData?.satisfied
                    ? "✓ All dependencies are satisfied"
                    : "✗ Dependencies are not satisfied"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Graph Modal */}
      {showGraphModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Dependency Graph
              </h2>
              <button
                onClick={() => setShowGraphModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {isLoadingGraph ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-3">
                {graphData.map((node: any, idx: number) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-md">
                    <div className="font-medium">
                      Job #{node.job_id} {node.job_name && `- ${node.job_name}`}
                    </div>
                    {node.dependencies?.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        Depends on: {node.dependencies.join(", ")}
                      </div>
                    )}
                    {node.dependents?.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        Dependents: {node.dependents.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Bulk Operations
              </h2>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Dependencies (IDs, comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1, 2, 3"
                  onChange={(e) => {
                    const ids = e.target.value
                      .split(",")
                      .map((id) => parseInt(id.trim()))
                      .filter((id) => !isNaN(id));
                    setSelectedDependencies(new Set(ids));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Selected: {selectedDependencies.size} dependencies
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBatchActivate}
                  disabled={isBulkProcessing || selectedDependencies.size === 0}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isBulkProcessing ? "Processing..." : "Activate Selected"}
                </button>
                <button
                  onClick={handleBatchDeactivate}
                  disabled={isBulkProcessing || selectedDependencies.size === 0}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
                >
                  {isBulkProcessing ? "Processing..." : "Deactivate Selected"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <JobDependencyModal
        isOpen={isModalOpen}
        isSaving={isSaving}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDependency(null);
        }}
        onSubmit={async (values) => {
          await handleModalSubmit(values);
        }}
        initialData={editingDependency}
      />

      <JobDependencyViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingDependency(null);
        }}
        dependency={viewingDependency}
        isLoading={isLoadingView}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingDependency(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Dependency"
        description="Are you sure you want to delete this job dependency? This action cannot be undone."
        itemName={`Dependency #${deletingDependency?.id || ""}`}
        isLoading={isDeleting}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
