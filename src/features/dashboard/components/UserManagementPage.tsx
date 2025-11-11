import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  Ban,
  CheckCircle,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Users,
  Eye,
  UserPlus,
  BarChart3,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../users/services/userService";
import { accountService } from "../../account/services/accountService";
import { UserType, PaginatedResponse } from "../../users/types/user";
import { useToast } from "../../../contexts/ToastContext";
import { useConfirm } from "../../../contexts/ConfirmContext";
import UserModal from "./UserModal";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { color, tw, components } from "../../../shared/utils/utils";
import { useAuth } from "../../../contexts/AuthContext";
import { roleService } from "../../roles/services/roleService";
import { Role } from "../../roles/types/role";

type AccountRequestListItem = {
  id?: number;
  requestId?: number;
  user_id?: number;
  first_name?: string;
  last_name?: string;
  email_address?: string;
  email?: string;
  private_email_address?: string;
  force_password_reset?: boolean;
  roleId?: number;
  roleName?: string;
  created_at?: string;
  created_on?: string;
  department?: string;
};

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [accountRequests, setAccountRequests] = useState<
    AccountRequestListItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "users" | "requests" | "analytics"
  >("users");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [userSummary, setUserSummary] = useState<{
    total: number;
    cached: boolean;
  }>({
    total: 0,
    cached: false,
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const hasInitializedDebounce = useRef(false);

  // Loading states for individual actions
  const [loadingActions, setLoadingActions] = useState<{
    approving: Set<number>;
    rejecting: Set<number>;
    deleting: Set<number>;
    toggling: Set<number>;
  }>({
    approving: new Set(),
    rejecting: new Set(),
    deleting: new Set(),
    toggling: new Set(),
  });

  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const { user: authUser } = useAuth();
  const [roleLookup, setRoleLookup] = useState<Record<number, Role>>({});
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [departmentCounts, setDepartmentCounts] = useState<
    Record<string, number>
  >({});
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [reportsLoading, setReportsLoading] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  const activateColor = color.tertiary.tag4;
  const deactivateColor = color.configStatus.inactive;

  const buildSearchQuery = useCallback(
    ({
      skipCache = false,
      searchTermOverride,
    }: {
      skipCache?: boolean;
      searchTermOverride?: string;
    } = {}) => {
      const query: Record<string, unknown> = {};

      const term = (searchTermOverride ?? searchTerm)?.trim();
      if (term) {
        query.q = term;
      }

      if (skipCache) {
        query.skipCache = true;
      }

      return query;
    },
    [searchTerm]
  );

  const fetchUsers = useCallback(
    async ({
      skipCache = false,
      searchTermOverride,
    }: {
      skipCache?: boolean;
      searchTermOverride?: string;
    } = {}): Promise<PaginatedResponse<UserType>> => {
      const term = (searchTermOverride ?? searchTerm)?.trim();
      if (term) {
        return userService.searchUsers(
          buildSearchQuery({ skipCache, searchTermOverride: term })
        );
      }

      const baseQuery: Record<string, unknown> = {};
      if (skipCache) {
        baseQuery.skipCache = true;
      }

      return userService.getUsers(baseQuery);
    },
    [buildSearchQuery, searchTerm]
  );

  const loadData = useCallback(
    async ({
      skipCache = false,
      searchTermOverride,
    }: {
      skipCache?: boolean;
      searchTermOverride?: string;
    } = {}) => {
      try {
        setIsLoading(true);
        setErrorState("");

        const usersResponse = await fetchUsers({
          skipCache,
          searchTermOverride,
        });

        if (usersResponse.success) {
          const pendingActivationUsers = usersResponse.data.filter(
            (candidate) => {
              const candidateStatus = (
                candidate as unknown as { account_status?: string }
              )?.account_status;
              return (
                typeof candidateStatus === "string" &&
                candidateStatus.toLowerCase() === "pending_activation"
              );
            }
          );

          const activeUsers = usersResponse.data.filter((candidate) => {
            const candidateStatus = (
              candidate as unknown as { account_status?: string }
            )?.account_status;
            return !(
              typeof candidateStatus === "string" &&
              candidateStatus.toLowerCase() === "pending_activation"
            );
          });

          setUsers(activeUsers);
          setAccountRequests(
            pendingActivationUsers.map((pending) => {
              const primaryRoleId = (
                pending as unknown as {
                  primary_role_id?: number;
                }
              )?.primary_role_id;
              const fallbackRoleName = (
                pending as unknown as {
                  role_name?: string;
                }
              )?.role_name;
              const resolvedRoleName =
                (primaryRoleId != null
                  ? roleLookup[primaryRoleId]?.name
                  : undefined) ?? fallbackRoleName;

              return {
                id: pending.id,
                requestId: (
                  pending as unknown as { onboarding_request_id?: number }
                )?.onboarding_request_id,
                first_name: pending.first_name,
                last_name: pending.last_name,
                email_address:
                  pending.email_address ||
                  (pending as { email?: string }).email,
                department: pending.department || undefined,
                roleId: primaryRoleId ?? undefined,
                roleName: resolvedRoleName,
                created_at: pending.created_at,
              };
            })
          );
          const totalFromResponse =
            (usersResponse.meta?.total as number | undefined) ??
            usersResponse.data.length;

          setUserSummary({
            total: totalFromResponse,
            cached: Boolean(usersResponse.meta?.isCachedResponse),
          });
        }

        // Account requests derived from pending activation users above
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load data";
        setErrorState(message);
        showError("Error loading users", message);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUsers, showError, roleLookup]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Load reports after roles are loaded (needed for role name resolution)
    if (Object.keys(roleLookup).length > 0 || isLoading === false) {
      loadReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLookup]);

  const loadReports = async () => {
    try {
      setReportsLoading(true);
      const [status, dept, role] = await Promise.all([
        userService
          .getStatusCounts()
          .catch(() => ({ success: false, data: {} })),
        userService
          .getDepartmentCounts()
          .catch(() => ({ success: false, data: {} })),
        userService.getRoleCounts().catch(() => ({ success: false, data: {} })),
      ]);

      // Transform array format to object format if needed
      const transformToObject = (
        data:
          | Record<string, number>
          | Array<{ [key: string]: unknown; count: number }>,
        isRoleCount = false
      ): Record<string, number> => {
        if (Array.isArray(data)) {
          const result: Record<string, number> = {};
          data.forEach((item) => {
            if (item.count === undefined) return;

            if (isRoleCount && item.role_id !== undefined) {
              // For role counts, resolve role_id to role name
              const roleId = item.role_id as number;
              const roleName = roleLookup[roleId]?.name || `Role ID: ${roleId}`;
              result[roleName] = item.count;
            } else {
              // Find the key (could be department, status, etc.)
              const key = Object.keys(item).find(
                (k) =>
                  k !== "count" &&
                  (typeof item[k] === "string" || typeof item[k] === "number")
              );
              if (key) {
                const value = item[key];
                const displayKey =
                  typeof value === "string" ? value : String(value);
                result[displayKey] = item.count;
              }
            }
          });
          return result;
        }
        return data;
      };

      if (status.success) setStatusCounts(transformToObject(status.data || {}));
      if (dept.success) setDepartmentCounts(transformToObject(dept.data || {}));
      if (role.success) setRoleCounts(transformToObject(role.data || {}, true));
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadRoles = async () => {
      try {
        const { roles } = await roleService.listRoles({
          limit: 100,
          offset: 0,
          skipCache: true,
        });

        if (cancelled) return;

        const mappedRoles: Record<number, Role> = {};
        roles.forEach((role) => {
          mappedRoles[role.id] = role;
        });
        setRoleLookup(mappedRoles);
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    };

    loadRoles();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (!hasInitializedDebounce.current) {
      hasInitializedDebounce.current = true;
      return;
    }

    loadData({ skipCache: true, searchTermOverride: debouncedSearchTerm });
  }, [debouncedSearchTerm, loadData]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }

    try {
      setIsLoading(true);
      const trimmedTerm = searchTerm.trim();
      const searchResponse = await fetchUsers({
        skipCache: true,
        searchTermOverride: trimmedTerm,
      });

      if (searchResponse.success) {
        const pendingActivationUsers = searchResponse.data.filter(
          (candidate) => {
            const candidateStatus = (
              candidate as unknown as { account_status?: string }
            )?.account_status;
            return (
              typeof candidateStatus === "string" &&
              candidateStatus.toLowerCase() === "pending_activation"
            );
          }
        );

        const activeUsers = searchResponse.data.filter((candidate) => {
          const candidateStatus = (
            candidate as unknown as { account_status?: string }
          )?.account_status;
          return !(
            typeof candidateStatus === "string" &&
            candidateStatus.toLowerCase() === "pending_activation"
          );
        });

        setUsers(activeUsers);
        setAccountRequests(
          pendingActivationUsers.map((pending) => ({
            id: pending.id,
            requestId: (
              pending as unknown as { onboarding_request_id?: number }
            )?.onboarding_request_id,
            first_name: pending.first_name,
            last_name: pending.last_name,
            email_address:
              pending.email_address || (pending as { email?: string }).email,
            department: pending.department || undefined,
            role: (pending as unknown as { role_name?: string }).role_name,
            created_at: pending.created_at,
          }))
        );

        const totalFromResponse =
          (searchResponse.meta?.total as number | undefined) ??
          searchResponse.data.length;
        setUserSummary({
          total: totalFromResponse,
          cached: Boolean(searchResponse.meta?.isCachedResponse),
        });
      }
    } catch (err) {
      showError(
        "Search Error",
        err instanceof Error ? err.message : "Failed to search users"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = (user: UserType) => {
    navigate(`/dashboard/user-management/${user.id}`);
  };

  const resolveAccountRequestId = (
    request: AccountRequestListItem
  ): number | null => {
    const identifier = request.id ?? request.requestId;
    return typeof identifier === "number" ? identifier : null;
  };

  const handleApproveRequest = async (request: AccountRequestListItem) => {
    const requestId = resolveAccountRequestId(request);
    if (!requestId) {
      showError(
        "Unable to approve request",
        "Missing identifier for the selected request."
      );
      return;
    }

    const onboardingRequestId =
      typeof request.requestId === "number" ? request.requestId : null;
    const userId = request.id ?? request.user_id ?? null;

    const confirmed = await confirm({
      title: "Approve Request",
      message: `Are you sure you want to approve the account request for ${request.first_name} ${request.last_name}?`,
      type: "success",
      confirmText: "Approve",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    // Set loading state
    setLoadingActions((prev) => ({
      ...prev,
      approving: new Set([...prev.approving, requestId]),
    }));

    try {
      if (onboardingRequestId) {
        await accountService.approveAccountRequest(onboardingRequestId);
      } else if (userId) {
        await userService.activateUser(userId, {
          updated_by: authUser?.user_id ?? undefined,
        });
      }

      await loadData({ skipCache: true }); // Skip cache to get fresh data
      success(
        "Request approved",
        `Account approved for ${request.first_name} ${request.last_name}`
      );
    } catch (err) {
      showError(
        "Error approving request",
        err instanceof Error ? err.message : "Error approving request"
      );
    } finally {
      // Clear loading state
      setLoadingActions((prev) => ({
        ...prev,
        approving: new Set(
          [...prev.approving].filter((id) => id !== requestId)
        ),
      }));
    }
  };

  const handleRejectRequest = async (request: AccountRequestListItem) => {
    const requestId = resolveAccountRequestId(request);
    if (!requestId) {
      showError(
        "Unable to reject request",
        "Missing identifier for the selected request."
      );
      return;
    }

    const onboardingRequestId =
      typeof request.requestId === "number" ? request.requestId : null;
    const userId = request.id ?? request.user_id ?? null;

    const confirmed = await confirm({
      title: "Reject Request",
      message: `Are you sure you want to reject ${request.first_name} ${request.last_name}'s request?`,
      type: "danger",
      confirmText: "Reject",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    // Set loading state
    setLoadingActions((prev) => ({
      ...prev,
      rejecting: new Set([...prev.rejecting, requestId]),
    }));

    try {
      if (onboardingRequestId) {
        await accountService.rejectAccountRequest(onboardingRequestId);
      } else if (userId) {
        await userService.deactivateUser(userId, {
          updated_by: authUser?.user_id ?? undefined,
        });
      }

      await loadData({ skipCache: true }); // Skip cache to get fresh data
      success(
        "Request rejected",
        `Request from ${request.first_name} ${request.last_name} rejected`
      );
    } catch (err) {
      showError(
        "Error rejecting request",
        err instanceof Error ? err.message : "Error rejecting request"
      );
    } finally {
      // Clear loading state
      setLoadingActions((prev) => ({
        ...prev,
        rejecting: new Set(
          [...prev.rejecting].filter((id) => id !== requestId)
        ),
      }));
    }
  };

  const handleToggleStatus = async (user: UserType) => {
    // Set loading state
    setLoadingActions((prev) => ({
      ...prev,
      toggling: new Set([...prev.toggling, user.id]),
    }));

    try {
      const isActive = isUserActive(user);
      if (isActive) {
        await userService.deactivateUser(user.id);
        success(
          "User deactivated",
          `User ${user.first_name} ${user.last_name} deactivated successfully`
        );
      } else {
        await userService.activateUser(user.id);
        success(
          "User activated",
          `User ${user.first_name} ${user.last_name} activated successfully`
        );
      }
      await loadData({ skipCache: true }); // Skip cache to get fresh data
    } catch (err) {
      showError(
        "Error updating status",
        err instanceof Error ? err.message : "Error toggling user status"
      );
    } finally {
      // Clear loading state
      setLoadingActions((prev) => ({
        ...prev,
        toggling: new Set([...prev.toggling].filter((id) => id !== user.id)),
      }));
    }
  };

  const handleDeleteUser = async (user: UserType) => {
    if (!authUser?.user_id) {
      showError("Unable to delete user", "Your session is missing a user id.");
      return;
    }

    const confirmed = await confirm({
      title: "Delete User",
      message: `Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    // Set loading state
    setLoadingActions((prev) => ({
      ...prev,
      deleting: new Set([...prev.deleting, user.id]),
    }));

    try {
      await userService.deleteUser(user.id, authUser.user_id);
      await loadData({ skipCache: true }); // Skip cache to get fresh data
      success(
        "User deleted",
        `${user.first_name} ${user.last_name} deleted successfully`
      );
    } catch (err) {
      showError(
        "Error deleting user",
        err instanceof Error ? err.message : "Error deleting user"
      );
    } finally {
      // Clear loading state
      setLoadingActions((prev) => ({
        ...prev,
        deleting: new Set([...prev.deleting].filter((id) => id !== user.id)),
      }));
    }
  };

  // Derived analytics helpers
  const normalizeStatus = (user: UserType) => {
    const accountStatus = (user as unknown as { account_status?: string })
      ?.account_status;
    if (accountStatus && accountStatus.trim() !== "") {
      return accountStatus.toLowerCase();
    }
    if (user.status && user.status.trim() !== "") {
      return user.status.toLowerCase();
    }
    const isSuspended = Boolean(
      (user as unknown as { is_suspended?: boolean })?.is_suspended
    );
    if (isSuspended) return "suspended";
    const isActive = Boolean(
      (user as unknown as { is_active?: boolean })?.is_active ??
        (user as unknown as { is_activated?: boolean })?.is_activated
    );
    return isActive ? "active" : "inactive";
  };

  const formatStatusLabel = (status: string) =>
    status
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "Unknown";

  const getStatusColorToken = (status: string) => {
    if (status === "active") return color.status.success;
    if (status === "suspended" || status === "locked") {
      return color.status.warning;
    }
    return color.status.danger;
  };

  const isUserActive = (user: UserType) => {
    const status = normalizeStatus(user);
    if (status === "active") return true;
    if (status === "inactive") return false;
    return Boolean(
      (user as unknown as { is_active?: boolean })?.is_active ??
        (user as unknown as { is_activated?: boolean })?.is_activated
    );
  };

  // Get unique departments from users
  const uniqueDepartments = Array.from(
    new Set(
      users
        .map((user) => user.department)
        .filter((dept): dept is string => Boolean(dept && dept.trim() !== ""))
    )
  ).sort((a, b) => a.localeCompare(b));

  // Get unique roles from users
  const getUserRoleName = useCallback(
    (user: UserType): string => {
      const primaryRoleId = user.primary_role_id ?? user.role_id;
      if (primaryRoleId != null) {
        const resolvedRole = roleLookup[primaryRoleId];
        if (resolvedRole?.name) {
          return resolvedRole.name;
        }
      }
      return user.role_name || "N/A";
    },
    [roleLookup]
  );

  const uniqueRoles = Array.from(
    new Set(
      users
        .map((user) => getUserRoleName(user))
        .filter((role): role is string => Boolean(role && role !== "N/A"))
    )
  ).sort((a, b) => a.localeCompare(b));

  const aggregateCounts = users.reduce(
    (acc, user) => {
      const status = normalizeStatus(user);
      if (status === "active") {
        acc.active += 1;
      } else {
        acc.inactive += 1;
      }

      if (status.includes("lock")) {
        acc.locked += 1;
      }

      return acc;
    },
    { active: 0, inactive: 0, locked: 0 }
  );

  const totalUsersValue =
    userSummary.total > 0
      ? userSummary.total
      : aggregateCounts.active + aggregateCounts.inactive;
  const activeUsersValue = aggregateCounts.active;
  const pendingActivationValue = accountRequests.length;
  const highRiskUsersValue = aggregateCounts.locked;

  const statsLoadingIndicator = isLoading;

  const userStatsCards = [
    {
      name: "Total Users",
      value: statsLoadingIndicator ? "..." : totalUsersValue.toLocaleString(),
      icon: Users,
      color: color.tertiary.tag1,
      badge: userSummary.cached ? "Cached" : undefined,
    },
    {
      name: "Active Users",
      value: statsLoadingIndicator ? "..." : activeUsersValue.toLocaleString(),
      icon: UserCheck,
      color: color.tertiary.tag4,
    },
    {
      name: "Pending Activation",
      value: statsLoadingIndicator
        ? "..."
        : pendingActivationValue.toLocaleString(),
      icon: UserPlus,
      color: color.tertiary.tag2,
    },
    {
      name: "Locked Users",
      value: statsLoadingIndicator
        ? "..."
        : highRiskUsersValue.toLocaleString(),
      icon: UserX,
      color: color.tertiary.tag3,
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email_address || user.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const normalizedStatus = normalizeStatus(user);

    const matchesDepartment =
      filterDepartment === "all" ||
      (user.department || "").toLowerCase() === filterDepartment.toLowerCase();
    const matchesRole =
      filterRole === "all" ||
      getUserRoleName(user).toLowerCase() === filterRole.toLowerCase();
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && normalizedStatus === "active") ||
      (filterStatus === "inactive" && normalizedStatus !== "active");

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const filteredRequests = accountRequests.filter((request) => {
    const firstName = (request.first_name ?? "").toLowerCase();
    const lastName = (request.last_name ?? "").toLowerCase();
    const email = (request.email_address ?? request.email ?? "").toLowerCase();
    const needle = searchTerm.toLowerCase();

    return (
      firstName.includes(needle) ||
      lastName.includes(needle) ||
      email.includes(needle)
    );
  });

  const getPendingRequestRole = useCallback(
    (request: AccountRequestListItem) => {
      if (request.roleName && request.roleName.trim() !== "") {
        return request.roleName;
      }

      if (request.roleId != null) {
        const resolvedRole = roleLookup[request.roleId];
        if (resolvedRole?.name) {
          return resolvedRole.name;
        }
        return `Role ID: ${request.roleId}`;
      }

      return "N/A";
    },
    [roleLookup]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
            User Management
          </h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>
            Manage users and account requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAnalyticsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </button>
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className={`${tw.button} flex items-center gap-2`}
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStatsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="group bg-white rounded-2xl border border-gray-200 p-6 relative overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: stat.color }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-black">
                        {stat.value}
                      </p>
                      <p className={`${tw.cardSubHeading} ${tw.textSecondary}`}>
                        {stat.name}
                      </p>
                    </div>
                  </div>
                  {stat.badge && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-800">
                      {stat.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 relative ${
            activeTab === "users"
              ? "text-black"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users</span>
          <span
            className="px-2 py-0.5 rounded-full text-xs text-white"
            style={{
              backgroundColor:
                activeTab === "users" ? color.primary.accent : color.text.muted,
            }}
          >
            {users.length}
          </span>
          {activeTab === "users" && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: color.primary.accent }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 relative ${
            activeTab === "requests"
              ? "text-black"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Pending Requests</span>
          <span
            className="px-2 py-0.5 rounded-full text-xs text-white"
            style={{
              backgroundColor:
                activeTab === "requests"
                  ? color.primary.accent
                  : color.text.muted,
            }}
          >
            {accountRequests.length}
          </span>
          {activeTab === "requests" && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: color.primary.accent }}
            />
          )}
        </button>
      </div>

      {/* Search and Filters - Only show on Users tab */}
      {activeTab === "users" && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tw.textMuted}`}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className={`w-full pl-10 pr-4 py-3 text-sm ${components.input.default}`}
            />
          </div>

          <div className="flex gap-3">
            <HeadlessSelect
              options={[
                { value: "all", label: "All Departments" },
                ...uniqueDepartments.map((dept) => ({
                  value: dept.toLowerCase(),
                  label: dept,
                })),
              ]}
              value={filterDepartment}
              onChange={(value) => setFilterDepartment(value as string)}
              placeholder="Select department"
              className="min-w-[160px]"
            />

            <HeadlessSelect
              options={[
                { value: "all", label: "All Roles" },
                ...uniqueRoles.map((role) => ({
                  value: role.toLowerCase(),
                  label: role,
                })),
              ]}
              value={filterRole}
              onChange={(value) => setFilterRole(value as string)}
              placeholder="Select role"
              className="min-w-[160px]"
            />

            <HeadlessSelect
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              value={filterStatus}
              onChange={(value) =>
                setFilterStatus(value as "all" | "active" | "inactive")
              }
              placeholder="Select status"
              className="min-w-[140px]"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={`bg-white border border-gray-200 rounded-lg p-6 overflow-hidden`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner
              variant="modern"
              size="lg"
              color="primary"
              className="mr-3"
            />
            <span className={`${tw.textSecondary}`}>
              Loading {activeTab}...
            </span>
          </div>
        ) : errorState ? (
          <div className="p-8 text-center">
            <div
              className={`bg-[${color.status.danger}]/10 border border-[${color.status.danger}]/20 text-[${color.status.danger}] rounded-xl p-6`}
            >
              <p className="font-medium mb-3">{errorState}</p>
              <button
                onClick={() => loadData({ skipCache: true })}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
                style={{ backgroundColor: color.status.danger }}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : activeTab === "users" ? (
          filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No Users Found" : "No Users"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Create your first user to get started."}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto text-sm text-white"
                  style={{ backgroundColor: color.primary.action }}
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="max-md:hidden overflow-x-auto -mx-6 -mt-6">
                <table className="w-full">
                  <thead
                    className={`border-b ${tw.borderDefault}`}
                    style={{ background: color.surface.tableHeader }}
                  >
                    <tr>
                      <th
                        className={`px-6 py-4 text-left text-sm font-medium uppercase tracking-wider`}
                        style={{ color: color.surface.tableHeaderText }}
                      >
                        User
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-sm font-medium uppercase tracking-wider`}
                        style={{ color: color.surface.tableHeaderText }}
                      >
                        Department
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-sm font-medium uppercase tracking-wider`}
                        style={{ color: color.surface.tableHeaderText }}
                      >
                        Role
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-sm font-medium uppercase tracking-wider`}
                        style={{ color: color.surface.tableHeaderText }}
                      >
                        Status
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-sm font-medium uppercase tracking-wider`}
                        style={{ color: color.surface.tableHeaderText }}
                      >
                        Created
                      </th>
                      <th
                        className={`px-6 py-4 text-right text-sm font-medium uppercase tracking-wider`}
                        style={{ color: color.surface.tableHeaderText }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => {
                      const normalizedStatus = normalizeStatus(user);
                      const userIsActive = normalizedStatus === "active";
                      const statusLabel = formatStatusLabel(normalizedStatus);
                      const statusColor = getStatusColorToken(normalizedStatus);

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <button
                                type="button"
                                onClick={() => handleViewUser(user)}
                                className="text-base font-semibold text-black transition-colors hover:underline"
                              >
                                {user.first_name} {user.last_name}
                              </button>
                              <div className={`text-sm ${tw.textMuted}`}>
                                {user.email_address || user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700`}
                            >
                              {user.department || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700`}
                            >
                              {getUserRoleName(user)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                                userIsActive
                                  ? `bg-[${color.status.success}]/10 text-[${color.status.success}]`
                                  : `bg-[${statusColor}]/10 text-[${statusColor}]`
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm ${tw.textSecondary}`}>
                              {new Date(user.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleToggleStatus(user)}
                                disabled={loadingActions.toggling.has(user.id)}
                                className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  color: userIsActive
                                    ? deactivateColor
                                    : activateColor,
                                }}
                                title={
                                  loadingActions.toggling.has(user.id)
                                    ? "Updating..."
                                    : userIsActive
                                    ? "Deactivate user"
                                    : "Activate user"
                                }
                              >
                                {loadingActions.toggling.has(user.id) ? (
                                  <LoadingSpinner
                                    variant="modern"
                                    size="sm"
                                    color="primary"
                                  />
                                ) : userIsActive ? (
                                  <Ban className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleViewUser(user)}
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  color: color.primary.action,
                                  backgroundColor: "transparent",
                                }}
                                title="View user details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsModalOpen(true);
                                }}
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  color: color.primary.action,
                                  backgroundColor: "transparent",
                                }}
                                title="Edit user"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                disabled={loadingActions.deleting.has(user.id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={
                                  loadingActions.deleting.has(user.id)
                                    ? "Deleting..."
                                    : "Delete user"
                                }
                              >
                                {loadingActions.deleting.has(user.id) ? (
                                  <LoadingSpinner
                                    variant="modern"
                                    size="sm"
                                    color="primary"
                                  />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {filteredUsers.map((user) => {
                  const normalizedStatus = normalizeStatus(user);
                  const userIsActive = normalizedStatus === "active";
                  const statusLabel = formatStatusLabel(normalizedStatus);
                  const statusColor = getStatusColorToken(normalizedStatus);

                  return (
                    <div
                      key={user.id}
                      className="p-4 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-black mb-1">
                          <button
                            type="button"
                            onClick={() => handleViewUser(user)}
                            className="text-black hover:underline"
                          >
                            {user.first_name} {user.last_name}
                          </button>
                        </div>
                        <div className={`text-sm ${tw.textSecondary} mb-2`}>
                          {user.email_address || user.email}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700`}
                          >
                            {user.department || "N/A"}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700`}
                          >
                            {getUserRoleName(user)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                              userIsActive
                                ? `bg-[${color.status.success}]/10 text-[${color.status.success}]`
                                : `bg-[${statusColor}]/10 text-[${statusColor}]`
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={loadingActions.toggling.has(user.id)}
                            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              color: userIsActive
                                ? deactivateColor
                                : activateColor,
                            }}
                            title={
                              loadingActions.toggling.has(user.id)
                                ? "Updating..."
                                : userIsActive
                                ? "Deactivate user"
                                : "Activate user"
                            }
                          >
                            {loadingActions.toggling.has(user.id) ? (
                              <LoadingSpinner
                                variant="modern"
                                size="sm"
                                color="primary"
                              />
                            ) : userIsActive ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              color: color.primary.action,
                              backgroundColor: "transparent",
                            }}
                            title="View user details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              color: color.primary.action,
                              backgroundColor: "transparent",
                            }}
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={loadingActions.deleting.has(user.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              loadingActions.deleting.has(user.id)
                                ? "Deleting..."
                                : "Delete user"
                            }
                          >
                            {loadingActions.deleting.has(user.id) ? (
                              <LoadingSpinner
                                variant="modern"
                                size="sm"
                                color="primary"
                              />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )
        ) : // Account Requests Tab
        filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Pending Requests
            </h3>
            <p className={`${tw.textMuted}`}>
              All account requests have been processed.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto -mx-6 -mt-6">
              <table className="w-full">
                <thead
                  className={`border-b ${tw.borderDefault} rounded-t-2xl`}
                  style={{ background: color.surface.tableHeader }}
                >
                  <tr>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Applicant
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Requested Role
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Requested
                    </th>
                    <th
                      className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request, index) => {
                    const requestId = resolveAccountRequestId(request);
                    const requestKey =
                      requestId ??
                      request.user_id ??
                      `${
                        request.email ?? request.email_address ?? "request"
                      }-${index}`;
                    const approvingLoading =
                      typeof requestId === "number" &&
                      loadingActions.approving.has(requestId);
                    const rejectingLoading =
                      typeof requestId === "number" &&
                      loadingActions.rejecting.has(requestId);
                    const actionDisabled = typeof requestId !== "number";
                    const fullName =
                      [request.first_name, request.last_name]
                        .filter(Boolean)
                        .join(" ")
                        .trim() || "Unknown";
                    const requestEmail =
                      request.email_address ??
                      request.email ??
                      request.private_email_address ??
                      "N/A";
                    const requestDate =
                      request.created_at ?? request.created_on;
                    const formattedDate = requestDate
                      ? new Date(requestDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A";
                    const requestRole = getPendingRequestRole(request);

                    return (
                      <tr
                        key={requestKey}
                        className="hover:bg-gray-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div
                              className={`text-base font-semibold ${tw.textPrimary}`}
                            >
                              {fullName}
                            </div>
                            <div className={`text-sm ${tw.textMuted}`}>
                              {requestEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700`}
                          >
                            {requestRole}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${tw.textSecondary}`}>
                            {formattedDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleApproveRequest(request)}
                              disabled={actionDisabled || approvingLoading}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                actionDisabled
                                  ? "Missing request identifier"
                                  : approvingLoading
                                  ? "Approving..."
                                  : "Approve request"
                              }
                            >
                              {approvingLoading ? (
                                <LoadingSpinner
                                  variant="modern"
                                  size="sm"
                                  color="primary"
                                />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request)}
                              disabled={actionDisabled || rejectingLoading}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                actionDisabled
                                  ? "Missing request identifier"
                                  : rejectingLoading
                                  ? "Rejecting..."
                                  : "Reject request"
                              }
                            >
                              {rejectingLoading ? (
                                <LoadingSpinner
                                  variant="modern"
                                  size="sm"
                                  color="primary"
                                />
                              ) : (
                                <UserX className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {filteredRequests.map((request, index) => {
                const requestId = resolveAccountRequestId(request);
                const requestKey =
                  requestId ??
                  request.user_id ??
                  `${
                    request.email ?? request.email_address ?? "request"
                  }-${index}`;
                const approvingLoading =
                  typeof requestId === "number" &&
                  loadingActions.approving.has(requestId);
                const rejectingLoading =
                  typeof requestId === "number" &&
                  loadingActions.rejecting.has(requestId);
                const actionDisabled = typeof requestId !== "number";
                const fullName =
                  [request.first_name, request.last_name]
                    .filter(Boolean)
                    .join(" ")
                    .trim() || "Unknown";
                const requestEmail =
                  request.email_address ??
                  request.email ??
                  request.private_email_address ??
                  "N/A";
                const requestRole = getPendingRequestRole(request);

                return (
                  <div
                    key={requestKey}
                    className="p-4 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-base font-semibold ${tw.textPrimary} mb-1`}
                      >
                        {fullName}
                      </div>
                      <div className={`text-sm ${tw.textSecondary} mb-2`}>
                        {requestEmail}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700`}
                        >
                          {requestRole}
                        </span>
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleApproveRequest(request)}
                          disabled={actionDisabled || approvingLoading}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {approvingLoading ? (
                            <>
                              <LoadingSpinner
                                variant="modern"
                                size="sm"
                                color="primary"
                                className="mr-1"
                              />
                              Approving...
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request)}
                          disabled={actionDisabled || rejectingLoading}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {rejectingLoading ? (
                            <>
                              <LoadingSpinner
                                variant="modern"
                                size="sm"
                                color="primary"
                                className="mr-1"
                              />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <UserX className="w-4 h-4 mr-1" />
                              Reject
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUserSaved={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          loadData({ skipCache: true }); // Skip cache to get fresh data
        }}
      />

      {/* Analytics Modal */}
      {isAnalyticsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                User Analytics
              </h2>
              <button
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              {reportsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner
                    variant="modern"
                    size="lg"
                    color="primary"
                    className="mr-3"
                  />
                  <span className={`${tw.textSecondary}`}>
                    Loading analytics...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.keys(statusCounts).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Users by Status
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(statusCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([status, count]) => (
                            <div
                              key={status}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <span className="text-sm text-gray-600 capitalize">
                                {status.replace(/_/g, " ")}
                              </span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: color.primary.accent }}
                              >
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(departmentCounts).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Users by Department
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {Object.entries(departmentCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([dept, count]) => (
                            <div
                              key={dept}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <span className="text-sm text-gray-600">
                                {dept}
                              </span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: color.primary.accent }}
                              >
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(roleCounts).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Users by Role
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {Object.entries(roleCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([role, count]) => (
                            <div
                              key={role}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <span className="text-sm text-gray-600">
                                {role}
                              </span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: color.primary.accent }}
                              >
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(statusCounts).length === 0 &&
                    Object.keys(departmentCounts).length === 0 &&
                    Object.keys(roleCounts).length === 0 && (
                      <div className="col-span-3 text-center py-12">
                        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-base font-medium text-gray-900 mb-1">
                          No Analytics Data
                        </p>
                        <p className="text-sm text-gray-500">
                          Analytics data will appear here once available.
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
