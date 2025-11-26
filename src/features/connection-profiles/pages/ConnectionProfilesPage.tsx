import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CheckCircle,
  Database,
  Edit,
  Eye,
  Filter,
  Globe,
  Grid,
  List,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Server,
  Shield,
} from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { color, tw } from "../../../shared/utils/utils";
import { connectionProfileService } from "../services/connectionProfileService";
import {
  ConnectionProfileEnvironmentStatsItem,
  ConnectionProfileSearchQuery,
  ConnectionProfileType,
  ConnectionProfileTypeStatsItem,
} from "../types/connectionProfile";

type StatusFilter = "all" | "active" | "inactive" | "expired";
type PiiFilter = "all" | "with" | "without";
type HealthFilter = "all" | "enabled" | "disabled";

const DEFAULT_FETCH_LIMIT = 100;

const CLASSIFICATION_OPTIONS = [
  "public",
  "internal",
  "confidential",
  "restricted",
];

const ENVIRONMENT_FALLBACKS = ["development", "staging", "uat", "production"];

export default function ConnectionProfilesPage() {
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();

  const [profiles, setProfiles] = useState<ConnectionProfileType[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<
    ConnectionProfileType[]
  >([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const [connectionTypeStats, setConnectionTypeStats] = useState<
    ConnectionProfileTypeStatsItem[]
  >([]);
  const [environmentStats, setEnvironmentStats] = useState<
    ConnectionProfileEnvironmentStatsItem[]
  >([]);
  const [statsSummary, setStatsSummary] = useState({
    total: 0,
    active: 0,
    withPii: 0,
    healthEnabled: 0,
  });
  const [mostUsedProfiles, setMostUsedProfiles] = useState<
    ConnectionProfileType[]
  >([]);
  const [expiredProfiles, setExpiredProfiles] = useState<
    ConnectionProfileType[]
  >([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [serverFilter, setServerFilter] = useState("");
  const [debouncedServerFilter, setDebouncedServerFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProfileIds, setSelectedProfileIds] = useState<Set<number>>(
    new Set()
  );
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<
    "activate" | "auto" | null
  >(null);

  const [filters, setFilters] = useState({
    connectionType: "all",
    environment: "all",
    classification: "all",
    status: "all" as StatusFilter,
    pii: "all" as PiiFilter,
    health: "all" as HealthFilter,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedServerFilter(serverFilter.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [serverFilter]);

  const reloadProfiles = useCallback(async () => {
    try {
      setLoadingProfiles(true);
      let data: ConnectionProfileType[] = [];
      const serverId = debouncedServerFilter
        ? Number(debouncedServerFilter)
        : null;
      const shouldUseSearch = Boolean(
        debouncedSearchTerm ||
          filters.status === "inactive" ||
          filters.status === "active" ||
          filters.pii !== "all" ||
          filters.health !== "all"
      );

      if (filters.connectionType !== "all") {
        data =
          (await connectionProfileService.getProfilesByConnectionType(
            filters.connectionType,
            { limit: DEFAULT_FETCH_LIMIT, skipCache: true }
          )) || [];
      } else if (filters.environment !== "all") {
        data =
          (await connectionProfileService.getProfilesByEnvironment(
            filters.environment,
            { limit: DEFAULT_FETCH_LIMIT, skipCache: true }
          )) || [];
      } else if (filters.classification !== "all") {
        data =
          (await connectionProfileService.getProfilesByClassification(
            filters.classification,
            { limit: DEFAULT_FETCH_LIMIT, skipCache: true }
          )) || [];
      } else if (serverId) {
        data =
          (await connectionProfileService.getProfilesByServer(serverId, {
            limit: DEFAULT_FETCH_LIMIT,
            skipCache: true,
          })) || [];
      } else if (filters.status === "expired") {
        data = (await connectionProfileService.getExpiredProfiles(true)) || [];
      } else if (shouldUseSearch) {
        const searchPayload: ConnectionProfileSearchQuery = {
          limit: DEFAULT_FETCH_LIMIT,
          skipCache: true,
        };
        if (debouncedSearchTerm) {
          searchPayload.profile_name = debouncedSearchTerm;
          searchPayload.profile_code = debouncedSearchTerm;
        }
        if (filters.connectionType !== "all") {
          searchPayload.connection_type = filters.connectionType;
        }
        if (filters.environment !== "all") {
          searchPayload.environment = filters.environment;
        }
        if (filters.classification !== "all") {
          searchPayload.data_classification = filters.classification;
        }
        if (filters.status === "active") {
          searchPayload.is_active = true;
        }
        if (filters.status === "inactive") {
          searchPayload.is_active = false;
        }
        if (filters.pii === "with") {
          searchPayload.contains_pii = true;
        }
        if (filters.pii === "without") {
          searchPayload.contains_pii = false;
        }
        if (filters.health === "enabled") {
          searchPayload.health_check_enabled = true;
        }
        if (filters.health === "disabled") {
          searchPayload.health_check_enabled = false;
        }
        const response = await connectionProfileService.searchProfiles(
          searchPayload
        );
        data = response.data || [];
      } else {
        const response = await connectionProfileService.listProfiles({
          limit: DEFAULT_FETCH_LIMIT,
          skipCache: true,
        });
        data = response.data || [];
      }

      setProfiles(data);
      setStatsSummary((prev) => ({
        ...prev,
        total: data.length,
        active: data.filter((profile) => profile.is_active).length,
      }));
      setSelectedProfileIds(new Set());
    } catch (err) {
      console.error("Failed to load connection profiles", err);
      showError(
        "Failed to load connection profiles",
        err instanceof Error ? err.message : "Please try again later."
      );
      setProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  }, [
    debouncedSearchTerm,
    debouncedServerFilter,
    filters.connectionType,
    filters.environment,
    filters.classification,
    filters.status,
    filters.pii,
    filters.health,
    showError,
  ]);

  useEffect(() => {
    reloadProfiles();
  }, [reloadProfiles]);

  useEffect(() => {
    loadStats();
    loadInsights();
  }, []);

  useEffect(() => {
    if (!profiles.length) {
      setFilteredProfiles([]);
      return;
    }

    const now = new Date();
    const matchesFilters = (profile: ConnectionProfileType) => {
      const searchHaystack = `${profile.profile_name ?? ""} ${
        profile.profile_code ?? ""
      } ${profile.connection_type ?? ""}`.toLowerCase();
      if (
        debouncedSearchTerm &&
        !searchHaystack.includes(debouncedSearchTerm)
      ) {
        return false;
      }

      if (
        filters.connectionType !== "all" &&
        profile.connection_type !== filters.connectionType
      ) {
        return false;
      }

      if (
        filters.environment !== "all" &&
        profile.environment !== filters.environment
      ) {
        return false;
      }

      if (
        filters.classification !== "all" &&
        profile.data_classification !== filters.classification
      ) {
        return false;
      }

      const validTo = profile.valid_to ? new Date(profile.valid_to) : null;
      const isExpired = validTo ? validTo < now : false;

      if (filters.status === "active" && (!profile.is_active || isExpired)) {
        return false;
      }
      if (filters.status === "inactive" && profile.is_active) {
        return false;
      }
      if (filters.status === "expired" && !isExpired) {
        return false;
      }

      if (filters.pii === "with" && !profile.contains_pii) {
        return false;
      }
      if (filters.pii === "without" && profile.contains_pii) {
        return false;
      }

      if (filters.health === "enabled" && !profile.health_check_enabled) {
        return false;
      }
      if (filters.health === "disabled" && profile.health_check_enabled) {
        return false;
      }

      return true;
    };

    setFilteredProfiles(profiles.filter(matchesFilters));
  }, [profiles, debouncedSearchTerm, filters]);

  const loadProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const { data = [] } = await connectionProfileService.listProfiles({
        limit: DEFAULT_FETCH_LIMIT,
        skipCache: true,
      });
      setProfiles(data);
      setStatsSummary((prev) => ({
        ...prev,
        total: data.length,
        active: data.filter((profile) => profile.is_active).length,
      }));
    } catch (err) {
      console.error("Failed to load connection profiles", err);
      showError(
        "Failed to load connection profiles",
        err instanceof Error ? err.message : "Please try again later."
      );
      setProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const [
        connectionTypes,
        environments,
        governance,
        activeProfiles,
        piiProfiles,
        healthProfiles,
      ] = await Promise.all([
        connectionProfileService.getConnectionTypeStats(),
        connectionProfileService.getEnvironmentStats(),
        connectionProfileService.getDataGovernanceStats(),
        connectionProfileService.getActiveProfiles(true),
        connectionProfileService.getProfilesWithPii(true),
        connectionProfileService.getHealthCheckEnabledProfiles(true),
      ]);

      setConnectionTypeStats(connectionTypes || []);
      setEnvironmentStats(environments || []);
      setStatsSummary((prev) => ({
        ...prev,
        total:
          governance?.total ??
          prev.total ??
          (governance?.classificationCounts
            ? Object.values(governance.classificationCounts).reduce(
                (sum, count) => sum + (Number(count) || 0),
                0
              )
            : prev.total),
        active: activeProfiles?.length ?? prev.active,
        withPii: piiProfiles?.length ?? prev.withPii,
        healthEnabled: healthProfiles?.length ?? prev.healthEnabled,
      }));
    } catch (err) {
      console.error("Failed to load connection profile stats", err);
      showError(
        "Failed to load connection profile stats",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setLoadingStats(false);
    }
  };

  const loadInsights = async () => {
    try {
      setInsightsLoading(true);
      const [mostUsed, expired] = await Promise.all([
        connectionProfileService.getMostUsedProfiles(true),
        connectionProfileService.getExpiredProfiles(true),
      ]);
      setMostUsedProfiles((mostUsed || []).slice(0, 5));
      setExpiredProfiles((expired || []).slice(0, 5));
    } catch (err) {
      console.error("Failed to load connection profile insights", err);
      showError(
        "Failed to load connection profile insights",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/dashboard/connection-profiles/new");
  };

  const handleView = (id: number) => {
    navigate(`/dashboard/connection-profiles/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/dashboard/connection-profiles/${id}/edit`);
  };

  const selectedCount = selectedProfileIds.size;

  const toggleProfileSelection = (id: number) => {
    setSelectedProfileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllVisible = () => {
    if (!filteredProfiles.length) {
      return;
    }
    if (selectedProfileIds.size === filteredProfiles.length) {
      setSelectedProfileIds(new Set());
    } else {
      setSelectedProfileIds(
        new Set(filteredProfiles.map((profile) => profile.id))
      );
    }
  };

  const handleBulkActivateSelected = async () => {
    if (!selectedProfileIds.size) {
      return;
    }
    setBulkActionType("activate");
    setBulkActionLoading(true);
    try {
      await connectionProfileService.bulkActivateProfiles({
        profile_ids: Array.from(selectedProfileIds).slice(0, 50),
      });
      showSuccess("Selected profiles activated");
      await reloadProfiles();
      await loadStats();
      await loadInsights();
    } catch (err) {
      showError(
        "Failed to activate selected profiles",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setBulkActionType(null);
      setBulkActionLoading(false);
    }
  };

  const handleAutoDeactivateExpired = async () => {
    setBulkActionType("auto");
    setBulkActionLoading(true);
    try {
      await connectionProfileService.autoDeactivateExpired();
      showSuccess("Expired profiles queued for deactivation");
      await reloadProfiles();
      await loadStats();
      await loadInsights();
    } catch (err) {
      showError(
        "Failed to auto-deactivate expired profiles",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setBulkActionType(null);
      setBulkActionLoading(false);
    }
  };

  const handleRefreshInsights = () => {
    loadInsights();
  };

  const formatNumber = (value?: number | null) =>
    typeof value === "number" ? value.toLocaleString() : "--";

  const connectionTypeOptions = useMemo(() => {
    const typesFromStats = connectionTypeStats.map(
      (item) => item.connection_type
    );
    const typesFromProfiles = Array.from(
      new Set(profiles.map((profile) => profile.connection_type))
    );
    return Array.from(
      new Set([...typesFromStats, ...typesFromProfiles])
    ).filter(Boolean);
  }, [connectionTypeStats, profiles]);

  const environmentOptions = useMemo(() => {
    const fromStats = environmentStats.map((item) => item.environment);
    const fromProfiles = Array.from(
      new Set(profiles.map((profile) => profile.environment))
    );
    const combined = Array.from(new Set([...fromStats, ...fromProfiles]));
    return combined.length ? combined : ENVIRONMENT_FALLBACKS;
  }, [environmentStats, profiles]);

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case "database":
        return Database;
      case "api":
        return Activity;
      case "sftp":
      case "ftp":
        return Server;
      default:
        return Server;
    }
  };

  const getStatusBadge = (profile: ConnectionProfileType) => {
    const now = new Date();
    const validTo = profile.valid_to ? new Date(profile.valid_to) : null;
    const expired = validTo ? validTo < now : false;

    if (!profile.is_active) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    }

    if (expired) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      );
    }

    if (profile.last_health_check_status === "unhealthy") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Unhealthy
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  const statsCards = [
    {
      name: "Total Profiles",
      value: formatNumber(statsSummary.total),
      icon: Database,
      color: color.primary.accent,
    },
    {
      name: "Active Profiles",
      value: formatNumber(statsSummary.active),
      icon: CheckCircle,
      color: color.tertiary.tag4,
    },
    {
      name: "Profiles with PII",
      value: formatNumber(statsSummary.withPii),
      icon: Shield,
      color: color.tertiary.tag2,
    },
    {
      name: "Health Check Enabled",
      value: formatNumber(statsSummary.healthEnabled),
      icon: Activity,
      color: color.tertiary.tag1,
    },
    {
      name: "Environments Covered",
      value: formatNumber(environmentOptions.length),
      icon: Globe,
      color: color.tertiary.tag3,
    },
  ];

  const renderGridCard = (profile: ConnectionProfileType) => {
    const Icon = getConnectionTypeIcon(profile.connection_type);
    const isSelected = selectedProfileIds.has(profile.id);
    return (
      <div
        key={profile.id}
        className="border border-gray-200 rounded-md p-6 hover:shadow-md transition-all"
        style={{ backgroundColor: color.surface.cards }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-md"
              style={{ backgroundColor: `${color.primary.accent}20` }}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: color.primary.accent }}
              />
            </div>
            <div>
              <h3 className={`${tw.cardHeading} text-gray-900 truncate`}>
                {profile.profile_name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {profile.profile_code}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleProfileSelection(profile.id)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            {getStatusBadge(profile)}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Type</span>
            <span className="font-medium text-gray-900">
              {profile.connection_type}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Environment</span>
            <span className="font-medium text-gray-900">
              {profile.environment}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Classification</span>
            <span className="font-medium text-gray-900">
              {profile.data_classification}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Load Strategy</span>
            <span className="font-medium text-gray-900">
              {profile.load_strategy}
            </span>
          </div>
          {profile.contains_pii && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <Shield className="w-3 h-3" />
              Contains PII
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleView(profile.id)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleEdit(profile.id)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderListRow = (profile: ConnectionProfileType) => {
    const isSelected = selectedProfileIds.has(profile.id);
    return (
      <div
        key={profile.id}
        className="border border-gray-200 rounded-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition-all"
        style={{ backgroundColor: color.surface.cards }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleProfileSelection(profile.id)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <h3 className={`${tw.cardHeading} text-gray-900`}>
              {profile.profile_name}
            </h3>
            {getStatusBadge(profile)}
          </div>
          <p className="text-sm text-gray-500">{profile.profile_code}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div>
            <p className="text-xs uppercase text-gray-400">Type</p>
            <p className="font-medium text-gray-900">
              {profile.connection_type}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Environment</p>
            <p className="font-medium text-gray-900">{profile.environment}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Classification</p>
            <p className="font-medium text-gray-900">
              {profile.data_classification}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Batch Size</p>
            <p className="font-medium text-gray-900">{profile.batch_size}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(profile.id)}
            className="px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            View
          </button>
          <button
            onClick={() => handleEdit(profile.id)}
            className="px-3 py-2 text-sm text-white rounded-md transition-colors"
            style={{ backgroundColor: color.primary.action }}
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div
      className="rounded-md shadow-sm border border-gray-200 text-center py-16 px-4"
      style={{ backgroundColor: color.surface.cards }}
    >
      <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className={`${tw.cardHeading} text-gray-900 mb-1`}>
        No connection profiles found
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        {profiles.length
          ? "Try adjusting your filters"
          : "Create your first connection profile to get started"}
      </p>
      {!profiles.length && (
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 text-white rounded-md transition-all"
          style={{ backgroundColor: color.primary.action }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Connection Profile
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
            Connection Profiles
          </h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>
            Manage secure connections, performance tuning, and governance
            controls for every integration endpoint
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
          style={{ backgroundColor: color.primary.action }}
        >
          <Plus className="w-4 h-4" />
          Create Connection Profile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {(loadingStats ? Array(5).fill(null) : statsCards).map(
          (card, index) => {
            if (loadingStats) {
              return (
                <div
                  key={`stats-skeleton-${index}`}
                  className="rounded-md border border-gray-200 bg-white p-6 shadow-sm animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-2/3" />
                </div>
              );
            }

            const Icon = card.icon;
            return (
              <div
                key={card.name}
                className="rounded-md border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" style={{ color: card.color }} />
                  <p className="text-sm font-medium text-gray-600">
                    {card.name}
                  </p>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
            );
          }
        )}
      </div>

      {filteredProfiles.length > 0 && (
        <div className="rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <button
              type="button"
              onClick={selectAllVisible}
              className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {selectedProfileIds.size === filteredProfiles.length
                ? "Clear Selection"
                : "Select All"}
            </button>
            <span>
              {selectedCount} selected / {filteredProfiles.length} visible
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              onClick={handleBulkActivateSelected}
              disabled={!selectedCount || bulkActionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: color.primary.action }}
            >
              {bulkActionLoading && bulkActionType === "activate" && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Activate Selected
            </button>
            <button
              type="button"
              onClick={handleAutoDeactivateExpired}
              disabled={bulkActionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {bulkActionLoading && bulkActionType === "auto" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Auto Deactivate Expired
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-md border border-gray-200 bg-white p-5 shadow-sm"
          style={{ backgroundColor: color.surface.cards }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Most Used Profiles
              </p>
              <p className="text-xs text-gray-500">
                Top 5 profiles by recent usage
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefreshInsights}
              className="p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  insightsLoading ? "animate-spin text-gray-400" : ""
                }`}
              />
            </button>
          </div>
          {insightsLoading ? (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner variant="modern" size="lg" color="primary" />
            </div>
          ) : mostUsedProfiles.length === 0 ? (
            <p className="text-sm text-gray-500">No usage data available.</p>
          ) : (
            <ul className="space-y-3">
              {mostUsedProfiles.map((profile) => (
                <li
                  key={`most-used-${profile.id}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {profile.profile_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last used:{" "}
                      {profile.last_used_at
                        ? new Date(profile.last_used_at).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleView(profile.id)}
                    className="text-xs text-gray-700 hover:underline"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          className="rounded-md border border-gray-200 bg-white p-5 shadow-sm"
          style={{ backgroundColor: color.surface.cards }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Expired Profiles
              </p>
              <p className="text-xs text-gray-500">
                Profiles past their validity date
              </p>
            </div>
          </div>
          {insightsLoading ? (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner variant="modern" size="lg" color="primary" />
            </div>
          ) : expiredProfiles.length === 0 ? (
            <p className="text-sm text-gray-500">No expired profiles found.</p>
          ) : (
            <ul className="space-y-3">
              {expiredProfiles.map((profile) => (
                <li
                  key={`expired-${profile.id}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {profile.profile_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expired on:{" "}
                      {profile.valid_to
                        ? new Date(profile.valid_to).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(profile.id)}
                    className="text-xs text-gray-700 hover:underline"
                  >
                    Update
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by profile name, code, or type..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filters.connectionType}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  connectionType: e.target.value,
                }))
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
            >
              <option value="all">All Connection Types</option>
              {connectionTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <select
            value={filters.environment}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                environment: e.target.value,
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
          >
            <option value="all">All Environments</option>
            {environmentOptions.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
          <select
            value={filters.classification}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                classification: e.target.value,
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
          >
            <option value="all">All Classifications</option>
            {CLASSIFICATION_OPTIONS.map((classification) => (
              <option key={classification} value={classification}>
                {classification}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={serverFilter}
            onChange={(e) => setServerFilter(e.target.value)}
            placeholder="Server ID"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
          />
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value as StatusFilter,
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
          >
            <option value="all">Any Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <div className="grid grid-cols-2 gap-3 md:col-span-2 lg:col-span-1">
            <select
              value={filters.pii}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  pii: e.target.value as PiiFilter,
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
            >
              <option value="all">PII (Any)</option>
              <option value="with">Contains PII</option>
              <option value="without">No PII</option>
            </select>
            <select
              value={filters.health}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  health: e.target.value as HealthFilter,
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
            >
              <option value="all">Health (Any)</option>
              <option value="enabled">Health Enabled</option>
              <option value="disabled">Health Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Profiles */}
      {loadingProfiles ? (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner
            variant="modern"
            size="xl"
            color="primary"
            className="mb-4"
          />
          <p className={`${tw.textMuted} font-medium`}>
            Loading connection profiles...
          </p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        renderEmptyState()
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map(renderGridCard)}
        </div>
      ) : (
        <div className="space-y-3">{filteredProfiles.map(renderListRow)}</div>
      )}
    </div>
  );
}
