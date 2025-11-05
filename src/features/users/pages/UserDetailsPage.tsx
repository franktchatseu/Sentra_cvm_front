import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Building2,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Eye,
  EyeOff,
  Key,
  ChevronRight,
} from "lucide-react";
import { userService } from "../services/userService";
import { UserType } from "../types/user";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { color, tw } from "../../../shared/utils/utils";

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    "overview" | "permissions" | "reports"
  >("overview");

  // Additional data
  const [directReports, setDirectReports] = useState<UserType[]>([]);
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
  const [canLogin, setCanLogin] = useState<{
    can_login: boolean;
    reason?: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
        const [reports, chain, perms, login] = await Promise.all([
          userService
            .getDirectReports(userId)
            .catch(() => ({ success: false, data: [] })),
          userService
            .getManagerChain(userId)
            .catch(() => ({ success: false, data: [] })),
          userService.getUserPermissions(userId).catch(() => null),
          userService.canUserLogin(userId).catch(() => null),
        ]);

        if (reports.success) setDirectReports(reports.data || []);
        if (chain.success) setManagerChain(chain.data || []);
        if (perms) setPermissions(perms);
        if (login && login.success) setCanLogin(login.data);
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
            onClick={() => navigate("/dashboard/user-management")}
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/user-management")}
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
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            user.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.status === "active" ? (
            <CheckCircle className="w-3.5 h-3.5" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          {user.status === "active" ? "Active" : "Inactive"}
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
                    {user.employee_id && (
                      <div className="flex justify-between items-start py-2">
                        <span className="text-sm text-gray-600">
                          Employee ID
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {user.employee_id}
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
                    {user.job_title && (
                      <div className="flex justify-between items-start py-2 ">
                        <span className="text-sm text-gray-600">Job Title</span>
                        <span className="text-sm font-medium text-gray-900">
                          {user.job_title}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-start py-2 ">
                      <span className="text-sm text-gray-600">Role</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.role_name ||
                          (user.primary_role_id
                            ? `Role ID: ${user.primary_role_id}`
                            : "N/A")}
                      </span>
                    </div>
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
                      <div className="flex items-center gap-2">
                        {user.status === "active" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {user.status || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 ">
                      <span className="text-sm text-gray-600">MFA</span>
                      <div className="flex items-center gap-2">
                        {user.mfa_enabled ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {user.mfa_enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                    {canLogin && (
                      <div className="flex justify-between items-center py-2 ">
                        <span className="text-sm text-gray-600">Can Login</span>
                        <div className="flex items-center gap-2">
                          {canLogin.can_login ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {canLogin.can_login ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    )}
                    {user.can_access_pii !== undefined && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">
                          PII Access
                        </span>
                        <div className="flex items-center gap-2">
                          {user.can_access_pii ? (
                            <Key
                              className="w-4 h-4"
                              style={{ color: color.primary.accent }}
                            />
                          ) : (
                            <Key className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {user.can_access_pii ? "Allowed" : "Restricted"}
                          </span>
                        </div>
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
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(user.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
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
                    {permissions.total_permissions !== undefined && (
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
                              {permissions.total_permissions}
                            </p>
                          </div>
                          <Shield className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>
                    )}
                    {hasCategories && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Permissions by Category
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {permissions.permissions_by_category &&
                            Object.entries(
                              permissions.permissions_by_category
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
                    {hasRoles && permissions.data?.roles && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Assigned Roles
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {permissions.data.roles.map(
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
                        navigate(`/dashboard/user-management/${report.id}`)
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
                        navigate(`/dashboard/user-management/${manager.id}`)
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
