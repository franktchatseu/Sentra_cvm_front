import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Building2,
  Shield,
  CheckCircle,
  XCircle,
  Users,
  ChevronRight,
} from "lucide-react";
import { userService } from "../services/userService";
import { UserType } from "../types/user";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { color, tw } from "../../../shared/utils/utils";
import { roleService } from "../../roles/services/roleService";
import { Role } from "../../roles/types/role";

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { error: showError } = useToast();

  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    "overview" | "permissions" | "reports"
  >("overview");

  // Additional data
  const [directReports, setDirectReports] = useState<UserType[]>([]);
  const [allReports, setAllReports] = useState<UserType[]>([]);
  const [managerChain, setManagerChain] = useState<UserType[]>([]);
  const [permissions, setPermissions] = useState<{
    success?: boolean;
    data?: {
      permissions?: string[];
      roles?: Array<string | { name?: string; code?: string; id?: number }>;
    };
    total_permissions?: number;
    permissions_by_category?: Record<string, number>;
    roles?: string[];
  } | null>(null);
  const [permissionsSummary, setPermissionsSummary] = useState<{
    total_permissions?: number;
    permissions_by_category?: Record<string, number>;
    roles?: string[];
    data_access_level?: string;
  } | null>(null);
  const [canLogin, setCanLogin] = useState<{
    can_login: boolean;
    reason?: string;
  } | null>(null);
  const [roleLookup, setRoleLookup] = useState<Record<number, Role>>({});

  useEffect(() => {
    if (id) {
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const { roles } = await roleService.listRoles({
        limit: 100,
      });
      const lookup: Record<number, Role> = {};
      roles.forEach((role) => {
        if (role.id != null) {
          lookup[role.id] = role;
        }
      });
      setRoleLookup(lookup);
    } catch (err) {
      console.error("Error loading roles:", err);
    }
  };

  const loadUserData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const userId = parseInt(id);

      // Load user details
      const userResponse = await userService.getUserById(userId);

      if (userResponse.success) {
        setUser(userResponse.data);
      }

      // Load additional data in parallel
      try {
        const [reports, allReportsData, chain, perms, permsSummary, login] =
          await Promise.all([
            userService
              .getDirectReports(userId)
              .catch(() => ({ success: false, data: [] })),
            userService
              .getAllReports(userId)
              .catch(() => ({ success: false, data: [] })),
            userService
              .getManagerChain(userId)
              .catch(() => ({ success: false, data: [] })),
            userService.getUserPermissions(userId).catch(() => null),
            userService.getUserPermissionsSummary(userId).catch(() => null),
            userService.canUserLogin(userId).catch(() => null),
          ]);

        if (reports.success) setDirectReports(reports.data || []);
        if (allReportsData.success) setAllReports(allReportsData.data || []);
        if (chain.success) setManagerChain(chain.data || []);
        if (perms) setPermissions(perms);
        if (permsSummary && permsSummary.success) {
          setPermissionsSummary({
            total_permissions: permsSummary.total_permissions,
            permissions_by_category: permsSummary.permissions_by_category,
            roles: permsSummary.roles,
            data_access_level: permsSummary.data_access_level,
          });
        }
        if (login && login.success) {
          // Normalize canLogin response - handle both camelCase and snake_case
          const loginData = login.data as {
            canLogin?: boolean;
            can_login?: boolean;
            reason?: string;
          };
          setCanLogin({
            can_login: loginData.canLogin ?? loginData.can_login ?? false,
            reason: loginData.reason,
          });
        }
      } catch (err) {
        console.error("Error loading additional user data:", err);
      }
    } catch (err) {
      showError(
        "Error loading user",
        err instanceof Error ? err.message : "Failed to load user details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const returnTo = (
    location.state as { returnTo?: { pathname: string; state?: unknown } }
  )?.returnTo;

  const navigateBack = () => {
    if (returnTo) {
      navigate(returnTo.pathname, {
        replace: true,
        state: returnTo.state,
      });
    } else {
      navigate("/dashboard/user-management");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner variant="modern" size="lg" color="primary" />
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">User not found</p>
          <button
            onClick={navigateBack}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to User Management
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner variant="modern" size="lg" color="primary" />
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const normalizeStatus = (userRecord: UserType): string => {
    const accountStatus = (userRecord as unknown as { account_status?: string })
      ?.account_status;
    if (accountStatus && accountStatus.trim() !== "") {
      return accountStatus.toLowerCase();
    }
    if (userRecord.status && userRecord.status.trim() !== "") {
      return userRecord.status.toLowerCase();
    }
    const isSuspended = Boolean(
      (userRecord as unknown as { is_suspended?: boolean })?.is_suspended
    );
    if (isSuspended) return "suspended";
    const isActive = Boolean(
      (userRecord as unknown as { is_active?: boolean })?.is_active ??
        (userRecord as unknown as { is_activated?: boolean })?.is_activated
    );
    return isActive ? "active" : "inactive";
  };

  const formatStatusLabel = (status: string) =>
    status
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "Unknown";

  const getStatusColors = (status: string) => {
    if (status === "active") {
      return {
        background: color.tertiary.active.background,
        text: color.tertiary.active.text,
      };
    }
    if (status === "suspended" || status === "locked") {
      return {
        background: `${color.status.warning}20`,
        text: color.status.warning,
      };
    }
    return {
      background: `${color.status.danger}20`,
      text: color.status.danger,
    };
  };

  const getUserRoleName = (user: UserType): string => {
    const primaryRoleId = user.primary_role_id ?? user.role_id;
    if (primaryRoleId != null) {
      const resolvedRole = roleLookup[primaryRoleId];
      if (resolvedRole?.name) {
        return resolvedRole.name;
      }
    }
    return user.role_name || "N/A";
  };

  const normalizedStatus = normalizeStatus(user);
  const statusLabel = formatStatusLabel(normalizedStatus);
  const statusColors = getStatusColors(normalizedStatus);
  const userIsActive = normalizedStatus === "active";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={navigateBack}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
              {user.display_name || `${user.first_name} ${user.last_name}`}
            </h1>
            <p className={`${tw.textSecondary} text-sm mt-1`}>
              {user.email_address || user.email}
            </p>
          </div>
        </div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: statusColors.background,
            color: statusColors.text,
          }}
        >
          {userIsActive ? (
            <CheckCircle
              className="w-3.5 h-3.5"
              style={{ color: statusColors.text }}
            />
          ) : (
            <XCircle
              className="w-3.5 h-3.5"
              style={{ color: statusColors.text }}
            />
          )}
          {statusLabel}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: "overview", label: "Overview", icon: User },
          { id: "permissions", label: "Permissions", icon: Shield },
          { id: "reports", label: "Reports", icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveSection(tab.id as "overview" | "permissions" | "reports")
            }
            className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 relative ${
              activeSection === tab.id
                ? "text-black"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeSection === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: color.primary.accent }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {activeSection === "overview" && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start py-2 ">
                      <span className="text-sm text-gray-600">Full Name</span>
                      <span className="text-sm font-medium text-gray-900 text-right">
                        {`${user.first_name} ${user.middle_name || ""} ${
                          user.last_name
                        }`.trim()}
                      </span>
                    </div>
                    <div className="flex justify-between items-start py-2 ">
                      <span className="text-sm text-gray-600">Username</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.username || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-start py-2 ">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-medium text-gray-900 text-right">
                        {user.email_address || user.email || "N/A"}
                      </span>
                    </div>
                    {user.phone_number && (
                      <div className="flex justify-between items-start py-2 ">
                        <span className="text-sm text-gray-600">Phone</span>
                        <span className="text-sm font-medium text-gray-900">
                          {user.phone_number}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Work Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Work Information
                  </h3>
                  <div className="space-y-3">
                    {user.department && (
                      <div className="flex justify-between items-start py-2 ">
                        <span className="text-sm text-gray-600">
                          Department
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {user.department}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-start py-2 ">
                      <span className="text-sm text-gray-600">Role</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getUserRoleName(user)}
                      </span>
                    </div>
                    {user.job_title &&
                      user.job_title.toLowerCase() !==
                        getUserRoleName(user).toLowerCase() && (
                        <div className="flex justify-between items-start py-2 ">
                          <span className="text-sm text-gray-600">
                            Job Title
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {user.job_title}
                          </span>
                        </div>
                      )}
                    {user.data_access_level && (
                      <div className="flex justify-between items-start py-2">
                        <span className="text-sm text-gray-600">
                          Data Access
                        </span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {user.data_access_level}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Security & Access */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Security & Access
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 ">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 ">
                      <span className="text-sm text-gray-600">MFA</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.mfa_enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    {canLogin && (
                      <div className="flex justify-between items-center py-2 ">
                        <span className="text-sm text-gray-600">Can Login</span>
                        <span className="text-sm font-medium text-gray-900">
                          {canLogin.can_login ? "Yes" : "No"}
                        </span>
                      </div>
                    )}
                    {user.can_access_pii !== undefined && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">
                          PII Access
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {user.can_access_pii ? "Allowed" : "Restricted"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Activity Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 ">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 ">
                      <span className="text-sm text-gray-600">Updated</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(user.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {user.last_login && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">
                          Last Login
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(user.last_login).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "permissions" && (
          <div className="p-6">
            {permissions && permissions.data ? (
              (() => {
                const hasPermissions =
                  permissions.data.permissions &&
                  permissions.data.permissions.length > 0;
                const hasRoles =
                  permissions.data.roles && permissions.data.roles.length > 0;
                const hasCategories =
                  permissions.permissions_by_category &&
                  Object.keys(permissions.permissions_by_category).length > 0;

                if (!hasPermissions && !hasRoles && !hasCategories) {
                  return (
                    <div className="text-center py-12">
                      <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-base font-medium text-gray-900 mb-1">
                        No Permissions
                      </p>
                      <p className="text-sm text-gray-500">
                        No permissions or roles assigned.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* Use permissions summary if available, otherwise fall back to permissions data */}
                    {(permissionsSummary?.total_permissions !== undefined ||
                      permissions.total_permissions !== undefined) && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Total Permissions
                            </p>
                            <p
                              className="text-3xl font-bold"
                              style={{ color: color.primary.accent }}
                            >
                              {permissionsSummary?.total_permissions ??
                                permissions.total_permissions}
                            </p>
                          </div>
                          <Shield className="w-8 h-8 text-gray-400" />
                        </div>
                        {permissionsSummary?.data_access_level && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">
                              Data Access Level
                            </p>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {permissionsSummary.data_access_level}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {(hasCategories ||
                      (permissionsSummary?.permissions_by_category &&
                        Object.keys(permissionsSummary.permissions_by_category)
                          .length > 0)) && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Permissions by Category
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {(permissionsSummary?.permissions_by_category ||
                            permissions.permissions_by_category ||
                            {}) &&
                            Object.entries(
                              permissionsSummary?.permissions_by_category ||
                                permissions.permissions_by_category ||
                                {}
                            ).map(([category, count]) => (
                              <div
                                key={category}
                                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                              >
                                <p className="text-xs text-gray-600 mb-1 capitalize">
                                  {category.replace(/_/g, " ")}
                                </p>
                                <p
                                  className="text-xl font-bold"
                                  style={{ color: color.primary.accent }}
                                >
                                  {count as number}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {((hasRoles && permissions.data?.roles) ||
                      (permissionsSummary?.roles &&
                        permissionsSummary.roles.length > 0)) && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Assigned Roles
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(
                            permissionsSummary?.roles ||
                            permissions.data?.roles ||
                            []
                          ).map(
                            (
                              role:
                                | string
                                | { name?: string; code?: string; id?: number },
                              idx: number
                            ) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 rounded-md text-sm font-medium"
                                style={{
                                  backgroundColor: `${color.primary.accent}15`,
                                  color: color.primary.accent,
                                }}
                              >
                                {typeof role === "string"
                                  ? role
                                  : role.name || role.code || `Role ${idx + 1}`}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-base font-medium text-gray-900 mb-1">
                  No Permissions Data
                </p>
                <p className="text-sm text-gray-500">
                  Permission information is not available for this user.
                </p>
              </div>
            )}
          </div>
        )}

        {activeSection === "reports" && (
          <div className="p-6">
            {directReports.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Direct Reports ({directReports.length})
                </h3>
                <div className="space-y-2">
                  {directReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/dashboard/user-management/${report.id}`, {
                          state: { returnTo },
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: color.primary.accent }}
                        >
                          {getInitials(report.first_name, report.last_name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {report.first_name} {report.last_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {report.email_address || report.email}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {allReports.length > directReports.length && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  All Reports - Full Hierarchy ({allReports.length})
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Includes direct reports and all indirect reports in the
                  hierarchy
                </p>
                <div className="space-y-2">
                  {allReports.map((report) => {
                    const isDirectReport = directReports.some(
                      (dr) => dr.id === report.id
                    );
                    return (
                      <div
                        key={report.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                          isDirectReport
                            ? "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                        }`}
                        onClick={() =>
                          navigate(`/dashboard/user-management/${report.id}`, {
                            state: { returnTo },
                          })
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: color.primary.accent }}
                          >
                            {getInitials(report.first_name, report.last_name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                {report.first_name} {report.last_name}
                              </p>
                              {isDirectReport && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                                  Direct
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">
                              {report.email_address || report.email}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {managerChain.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Manager Chain ({managerChain.length})
                </h3>
                <div className="space-y-2">
                  {managerChain.map((manager) => (
                    <div
                      key={manager.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/dashboard/user-management/${manager.id}`, {
                          state: { returnTo },
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: color.primary.accent }}
                        >
                          {getInitials(manager.first_name, manager.last_name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {manager.first_name} {manager.last_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {manager.email_address || manager.email}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {directReports.length === 0 && managerChain.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-base font-medium text-gray-900 mb-1">
                  No Reports or Managers
                </p>
                <p className="text-sm text-gray-500">No direct reports yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
