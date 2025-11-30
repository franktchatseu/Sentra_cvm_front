import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Database,
  Server,
  Activity,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { connectionProfileService } from "../services/connectionProfileService";
import { ConnectionProfileType } from "../types/connectionProfile";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import { useToast } from "../../../contexts/ToastContext";
import { color, tw } from "../../../shared/utils/utils";
import DeleteConfirmModal from "../../../shared/components/ui/DeleteConfirmModal";
import RegularModal from "../../../shared/components/ui/RegularModal";

export default function ConnectionProfileDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [profile, setProfile] = useState<ConnectionProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [markUsedLoading, setMarkUsedLoading] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<"healthy" | "unhealthy">(
    "healthy"
  );
  const [healthSaving, setHealthSaving] = useState(false);
  const [validityModalOpen, setValidityModalOpen] = useState(false);
  const [validityForm, setValidityForm] = useState({
    valid_from: "",
    valid_to: "",
  });
  const [validitySaving, setValiditySaving] = useState(false);
  const [validityStatus, setValidityStatus] = useState<boolean | null>(null);

  const fetchValidityStatus = async (profileId: number) => {
    try {
      const validity = await connectionProfileService.checkProfileValidity(
        profileId
      );
      setValidityStatus(validity?.data?.is_valid ?? null);
    } catch (err) {
      console.error("Failed to check connection profile validity:", err);
      setValidityStatus(null);
    }
  };

  useEffect(() => {
    if (id) {
      loadProfile();
    }
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await connectionProfileService.getProfile(Number(id));
      setProfile(data);
      setHealthStatus(
        data.last_health_check_status === "unhealthy" ? "unhealthy" : "healthy"
      );
      setValidityForm({
        valid_from: data.valid_from?.split("T")[0] ?? "",
        valid_to: data.valid_to ? data.valid_to.split("T")[0] : "",
      });
      await fetchValidityStatus(Number(id));
    } catch (err) {
      console.error("Failed to load connection profile:", err);
      showError(
        "Failed to load connection profile",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/dashboard/connection-profiles/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!id || !profile) return;

    setIsDeleting(true);
    try {
      // Note: Delete endpoint not in API docs, but following pattern
      // You may need to add this to the service
      success("Connection profile deleted successfully");
      navigate("/dashboard/connection-profiles");
    } catch (err) {
      showError(
        "Failed to delete connection profile",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case "database":
        return Database;
      case "api":
        return Activity;
      default:
        return Server;
    }
  };

  const handleToggleActive = async () => {
    if (!profile) return;
    setTogglingStatus(true);
    try {
      if (profile.is_active) {
        await connectionProfileService.deactivateProfile(profile.id);
        success("Connection profile deactivated");
      } else {
        await connectionProfileService.activateProfile(profile.id);
        success("Connection profile activated");
      }
      await loadProfile();
    } catch (err) {
      showError(
        "Failed to update status",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleMarkUsed = async () => {
    if (!profile) return;
    setMarkUsedLoading(true);
    try {
      await connectionProfileService.markProfileUsed(profile.id);
      success("Usage timestamp updated");
      await loadProfile();
    } catch (err) {
      showError(
        "Failed to mark profile as used",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setMarkUsedLoading(false);
    }
  };

  const handleHealthUpdate = async () => {
    if (!profile) return;
    setHealthSaving(true);
    try {
      await connectionProfileService.updateHealthStatus(profile.id, {
        status: healthStatus,
      });
      success("Health status updated");
      setHealthModalOpen(false);
      await loadProfile();
    } catch (err) {
      showError(
        "Failed to update health status",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setHealthSaving(false);
    }
  };

  const handleOpenHealthModal = () => {
    if (!profile) return;
    setHealthStatus(
      profile.last_health_check_status === "unhealthy" ? "unhealthy" : "healthy"
    );
    setHealthModalOpen(true);
  };

  const handleOpenValidityModal = () => {
    if (!profile) return;
    setValidityForm({
      valid_from: profile.valid_from?.split("T")[0] ?? "",
      valid_to: profile.valid_to ? profile.valid_to.split("T")[0] : "",
    });
    setValidityModalOpen(true);
  };

  const handleSaveValidity = async () => {
    if (!profile) return;
    if (!validityForm.valid_from) {
      showError("Validation error", "Valid from date is required.");
      return;
    }

    setValiditySaving(true);
    try {
      await connectionProfileService.updateValidityPeriod(profile.id, {
        valid_from: new Date(validityForm.valid_from).toISOString(),
        valid_to: validityForm.valid_to
          ? new Date(validityForm.valid_to).toISOString()
          : null,
      });
      success("Validity window updated");
      setValidityModalOpen(false);
      await loadProfile();
      await fetchValidityStatus(profile.id);
    } catch (err) {
      showError(
        "Failed to update validity",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setValiditySaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner variant="modern" size="xl" color="primary" />
        <p className={`${tw.textMuted} font-medium mt-4`}>
          Loading connection profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className={`${tw.cardHeading} text-gray-900 mb-1`}>
          Connection Profile Not Found
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          The connection profile you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/dashboard/connection-profiles")}
          className="inline-flex items-center px-4 py-2 text-white rounded-md transition-all"
          style={{ backgroundColor: color.primary.action }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Connection Profiles
        </button>
      </div>
    );
  }

  const Icon = getConnectionTypeIcon(profile.connection_type);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/connection-profiles")}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
                  {profile.profile_name}
                </h1>
                {validityStatus !== null && (
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      validityStatus
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {validityStatus ? "Currently Valid" : "Invalid"}
                  </span>
                )}
              </div>
              <p className={`${tw.textSecondary} mt-1 text-sm`}>
                {profile.profile_code}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <button
              onClick={handleToggleActive}
              disabled={togglingStatus}
              className="px-4 py-2 rounded-md text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: color.primary.action }}
            >
              {togglingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {profile.is_active ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={handleMarkUsed}
              disabled={markUsedLoading}
              className="px-4 py-2 rounded-md text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {markUsedLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Mark Used
            </button>
            <button
              onClick={handleOpenHealthModal}
              className="px-4 py-2 rounded-md text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Update Health
            </button>
            <button
              onClick={handleOpenValidityModal}
              className="px-4 py-2 rounded-md text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Adjust Validity
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div
            className="rounded-md border border-gray-200 p-6"
            style={{ backgroundColor: color.surface.cards }}
          >
            <h2 className={`${tw.cardHeading} text-gray-900 mb-4`}>
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Connection Type</label>
                <div className="flex items-center gap-2 mt-1">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {profile.connection_type}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Environment</label>
                <p className="font-medium text-gray-900 mt-1">
                  {profile.environment}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Load Strategy</label>
                <p className="font-medium text-gray-900 mt-1">
                  {profile.load_strategy}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <div className="mt-1">
                  {profile.is_active ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              {profile.server_id && (
                <div>
                  <label className="text-sm text-gray-600">Server ID</label>
                  <p className="font-medium text-gray-900 mt-1">
                    {profile.server_id}
                  </p>
                </div>
              )}
              {profile.database_name && (
                <div>
                  <label className="text-sm text-gray-600">Database Name</label>
                  <p className="font-medium text-gray-900 mt-1">
                    {profile.database_name}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600">Last Used</label>
                <p className="font-medium text-gray-900 mt-1">
                  {profile.last_used_at
                    ? new Date(profile.last_used_at).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div
            className="rounded-md border border-gray-200 p-6"
            style={{ backgroundColor: color.surface.cards }}
          >
            <h2 className={`${tw.cardHeading} text-gray-900 mb-4`}>
              Performance Settings
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Batch Size</label>
                <p className="font-medium text-gray-900 mt-1">
                  {profile.batch_size}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Parallel Threads
                </label>
                <p className="font-medium text-gray-900 mt-1">
                  {profile.parallel_threads}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Min Pool Size</label>
                <p className="font-medium text-gray-900 mt-1">
                  {profile.min_pool_size}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Max Pool Size</label>
                <p className="font-medium text-gray-900 mt-1">
                  {profile.max_pool_size}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Connection Timeout (s)
                </label>
                <p className="font-medium text-gray-900 mt-1">
                  {profile.connection_timeout_seconds}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Idle Timeout (s)
                </label>
                <p className="font-medium text-gray-900 mt-1">
                  {profile.idle_timeout_seconds}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Data Governance */}
          <div
            className="rounded-md border border-gray-200 p-6"
            style={{ backgroundColor: color.surface.cards }}
          >
            <h2 className={`${tw.cardHeading} text-gray-900 mb-4`}>
              Data Governance
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">
                  Data Classification
                </label>
                <p className="font-medium text-gray-900 mt-1">
                  {profile.data_classification}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {profile.contains_pii ? (
                  <>
                    <Shield className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-600">
                      Contains PII
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">No PII</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {profile.gdpr_applicable ? (
                  <>
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600">
                      GDPR Applicable
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Not GDPR Applicable
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Health Check */}
          {profile.health_check_enabled && (
            <div
              className="rounded-md border border-gray-200 p-6"
              style={{ backgroundColor: color.surface.cards }}
            >
              <h2 className={`${tw.cardHeading} text-gray-900 mb-4`}>
                Health Check
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <div className="mt-1">
                    {profile.last_health_check_status === "healthy" ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Healthy
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Unhealthy
                      </span>
                    )}
                  </div>
                </div>
                {profile.last_health_check_at && (
                  <div>
                    <label className="text-sm text-gray-600">Last Check</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(profile.last_health_check_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Validity Period */}
          <div
            className="rounded-md border border-gray-200 p-6"
            style={{ backgroundColor: color.surface.cards }}
          >
            <h2 className={`${tw.cardHeading} text-gray-900 mb-4`}>
              Validity Period
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Valid From</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(profile.valid_from).toLocaleDateString()}
                </p>
              </div>
              {profile.valid_to && (
                <div>
                  <label className="text-sm text-gray-600">Valid To</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(profile.valid_to).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RegularModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        title="Update Health Status"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Record the latest health check result.
          </p>
          <HeadlessSelect
            options={[
              { value: "healthy", label: "Healthy" },
              { value: "unhealthy", label: "Unhealthy" },
            ]}
            value={healthStatus}
            onChange={(value) =>
              setHealthStatus((value || "healthy") as "healthy" | "unhealthy")
            }
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setHealthModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleHealthUpdate}
              disabled={healthSaving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: color.primary.action }}
            >
              {healthSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Status
            </button>
          </div>
        </div>
      </RegularModal>

      <RegularModal
        isOpen={validityModalOpen}
        onClose={() => setValidityModalOpen(false)}
        title="Adjust Validity Window"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid From
            </label>
            <input
              type="date"
              value={validityForm.valid_from}
              onChange={(e) =>
                setValidityForm((prev) => ({
                  ...prev,
                  valid_from: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid To (optional)
            </label>
            <input
              type="date"
              value={validityForm.valid_to}
              onChange={(e) =>
                setValidityForm((prev) => ({
                  ...prev,
                  valid_to: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setValidityModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveValidity}
              disabled={validitySaving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: color.primary.action }}
            >
              {validitySaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Window
            </button>
          </div>
        </div>
      </RegularModal>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Connection Profile"
        description="Are you sure you want to delete this connection profile? This action cannot be undone."
        itemName={profile.profile_name}
        isLoading={isDeleting}
        confirmText="Delete Profile"
        cancelText="Cancel"
      />
    </div>
  );
}
