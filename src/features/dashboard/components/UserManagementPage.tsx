import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Ban,
  CheckCircle,
  Edit,
  Trash2,
  UserX,
  UserCheck,
} from "lucide-react";
import { userService } from "../../users/services/userService";
import { accountService } from "../../account/services/accountService";
import { UserType } from "../../users/types/user";
import { useToast } from "../../../contexts/ToastContext";
import { useConfirm } from "../../../contexts/ConfirmContext";
import UserModal from "./UserModal";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { color, tw, components } from "../../../shared/utils/utils";

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [accountRequests, setAccountRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "requests">("users");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorState("");

      // Load users using new userService
      const usersResponse = await userService.getUsers();

      if (usersResponse.success) {
        console.log("Users data:", usersResponse.data);
        setUsers(usersResponse.data);
      }

      // TODO: Load account requests when endpoint is available
      // For now, set empty array
      setAccountRequests([]);
    } catch (err) {
      setErrorState(err instanceof Error ? err.message : "Failed to load data");
      showError(
        "Error loading users",
        err instanceof Error ? err.message : "Failed to load data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (request: any) => {
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
      approving: new Set([...prev.approving, request.id || request.requestId]),
    }));

    try {
      await accountService.approveAccountRequest(
        request.id || request.requestId
      );
      await loadData();
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
          [...prev.approving].filter(
            (id) => id !== (request.id || request.requestId)
          )
        ),
      }));
    }
  };

  const handleRejectRequest = async (request: any) => {
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
      rejecting: new Set([...prev.rejecting, request.id || request.requestId]),
    }));

    try {
      await accountService.rejectAccountRequest(
        request.id || request.requestId,
        {
          reason: "Rejected by administrator",
        }
      );
      await loadData();
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
          [...prev.rejecting].filter(
            (id) => id !== (request.id || request.requestId)
          )
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
      const isActive = user.status === "active";
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
      await loadData();
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
      await userService.deleteUser(user.id);
      await loadData();
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email_address || user.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.role_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "all" ||
      (user.role_name || "").toLowerCase() === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.status === "active") ||
      (filterStatus === "inactive" && user.status !== "active");

    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredRequests = accountRequests.filter((request: any) => {
    const matchesSearch =
      (request.first_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request.last_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request.email_address || request.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request.role || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "all" || (request.role || "").toLowerCase() === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
            User Management
          </h1>
          <p className={`${tw.subHeading} ${tw.textSecondary} mt-2`}>
            Manage users and account requests
          </p>
        </div>
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

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-3 text-base font-medium border-b-2 transition-colors text-black`}
          style={{
            borderBottomColor:
              activeTab === "users" ? color.primary.accent : "#92A6B0",
          }}
        >
          <div className="flex items-center gap-2">
            <span>Users</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor:
                  activeTab === "users"
                    ? color.primary.accent
                    : color.text.muted,
                color: activeTab === "users" ? "white" : "black",
              }}
            >
              {users.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors text-black`}
          style={{
            borderBottomColor:
              activeTab === "requests" ? color.primary.accent : "#92A6B0",
          }}
        >
          <div className="flex items-center gap-2">
            <span>Pending Requests</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor:
                  activeTab === "requests"
                    ? color.primary.accent
                    : color.text.muted,
                color: activeTab === "requests" ? "white" : "black",
              }}
            >
              {accountRequests.filter((r) => r.force_password_reset).length}
            </span>
          </div>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tw.textMuted}`}
          />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-sm ${components.input.default}`}
          />
        </div>

        {activeTab === "users" && (
          <div className="flex gap-3">
            <HeadlessSelect
              options={[
                { value: "all", label: "All Roles" },
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
              ]}
              value={filterRole}
              onChange={(value) =>
                setFilterRole(value as "all" | "admin" | "user")
              }
              placeholder="Select role"
              className="min-w-[140px]"
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
        )}
      </div>

      {/* Content */}
      <div
        className={`bg-white border border-gray-200 rounded-2xl p-6 overflow-hidden`}
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
                onClick={loadData}
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
              <h3 className={`${tw.subHeading} ${tw.textPrimary} mb-2`}>
                {searchTerm ? "No Users Found" : "No Users"}
              </h3>
              <p className={`${tw.textMuted} mb-6`}>
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
                    className={`border-b ${tw.borderDefault} rounded-t-2xl`}
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
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div
                              className={`text-base font-semibold ${tw.textPrimary}`}
                            >
                              {user.first_name} {user.last_name}
                            </div>
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
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                              user.status === "active"
                                ? `bg-[${color.status.success}]/10 text-[${color.status.success}]`
                                : `bg-[${color.status.danger}]/10 text-[${color.status.danger}]`
                            }`}
                          >
                            {user.status === "active" ? (
                              <>Active</>
                            ) : (
                              <>Inactive</>
                            )}
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
                                color:
                                  user.status === "active"
                                    ? color.status.danger
                                    : color.status.success,
                                backgroundColor: "transparent",
                              }}
                              title={
                                loadingActions.toggling.has(user.id)
                                  ? "Updating..."
                                  : user.status === "active"
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
                              ) : user.status === "active" ? (
                                <Ban className="w-4 h-4 text-black" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-black" />
                              )}
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
                            >
                              <Edit className="w-4 h-4 text-black" />
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
                                <Trash2 className="w-4 h-4 text-black" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-base font-semibold ${tw.textPrimary} mb-1`}
                      >
                        {user.first_name} {user.last_name}
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
                          className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                            user.status === "active"
                              ? `bg-[${color.status.success}]/10 text-[${color.status.success}]`
                              : `bg-[${color.status.danger}]/10 text-[${color.status.danger}]`
                          }`}
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={loadingActions.toggling.has(user.id)}
                          className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            color:
                              user.status === "active"
                                ? color.status.danger
                                : color.status.success,
                            backgroundColor: "transparent",
                          }}
                          title={
                            loadingActions.toggling.has(user.id)
                              ? "Updating..."
                              : user.status === "active"
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
                          ) : user.status === "active" ? (
                            <Ban className="w-4 h-4 text-black" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-black" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            color: color.text.muted,
                            backgroundColor: "transparent",
                          }}
                        >
                          <Edit className="w-4 h-4 text-black" />
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
                            <Trash2 className="w-4 h-4 text-black" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        ) : // Account Requests Tab
        filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <h3 className={`${tw.subHeading} ${tw.textPrimary} mb-2`}>
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
                      className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}
                    >
                      Applicant
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}
                    >
                      Requested Role
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}
                    >
                      Requested
                    </th>
                    <th
                      className={`px-6 py-4 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request: any) => (
                    <tr
                      key={request.id || request.requestId || request.user_id}
                      className="hover:bg-gray-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div
                            className={`text-base font-semibold ${tw.textPrimary}`}
                          >
                            {request.first_name} {request.last_name}
                          </div>
                          <div className={`text-sm ${tw.textMuted}`}>
                            {request.email_address ||
                              request.email ||
                              request.private_email_address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700`}
                        >
                          {request.role || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${tw.textSecondary}`}>
                          {request.created_at || request.created_on
                            ? new Date(
                                request.created_at || request.created_on
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleApproveRequest(request)}
                            disabled={loadingActions.approving.has(
                              request.id || request.requestId || request.user_id
                            )}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              loadingActions.approving.has(
                                request.id ||
                                  request.requestId ||
                                  request.user_id
                              )
                                ? "Approving..."
                                : "Approve request"
                            }
                          >
                            {loadingActions.approving.has(
                              request.id || request.requestId || request.user_id
                            ) ? (
                              <LoadingSpinner
                                variant="modern"
                                size="sm"
                                color="primary"
                              />
                            ) : (
                              <UserCheck className="w-4 h-4 text-black" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request)}
                            disabled={loadingActions.rejecting.has(
                              request.id || request.requestId || request.user_id
                            )}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              loadingActions.rejecting.has(
                                request.id ||
                                  request.requestId ||
                                  request.user_id
                              )
                                ? "Rejecting..."
                                : "Reject request"
                            }
                          >
                            {loadingActions.rejecting.has(
                              request.id || request.requestId || request.user_id
                            ) ? (
                              <LoadingSpinner
                                variant="modern"
                                size="sm"
                                color="primary"
                              />
                            ) : (
                              <UserX className="w-4 h-4 text-black" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {filteredRequests.map((request: any) => (
                <div
                  key={request.id || request.requestId || request.user_id}
                  className="p-4 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-base font-semibold ${tw.textPrimary} mb-1`}
                    >
                      {request.first_name} {request.last_name}
                    </div>
                    <div className={`text-sm ${tw.textSecondary} mb-2`}>
                      {request.email_address ||
                        request.email ||
                        request.private_email_address}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700`}
                      >
                        {request.role || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleApproveRequest(request)}
                        disabled={loadingActions.approving.has(
                          request.id || request.requestId || request.user_id
                        )}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingActions.approving.has(
                          request.id || request.requestId || request.user_id
                        ) ? (
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
                            <UserCheck className="w-4 h-4 mr-1 text-black" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request)}
                        disabled={loadingActions.rejecting.has(
                          request.id || request.requestId || request.user_id
                        )}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingActions.rejecting.has(
                          request.id || request.requestId || request.user_id
                        ) ? (
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
                            <UserX className="w-4 h-4 mr-1 text-black" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
          loadData();
        }}
      />
    </div>
  );
}
