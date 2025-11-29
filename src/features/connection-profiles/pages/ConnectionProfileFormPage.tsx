import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { connectionProfileService } from "../services/connectionProfileService";
import {
  ConnectionProfileType,
  CreateConnectionProfilePayload,
  UpdateConnectionProfilePayload,
} from "../types/connectionProfile";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { useToast } from "../../../contexts/ToastContext";
import { color, tw } from "../../../shared/utils/utils";

interface ConnectionProfileFormPageProps {
  mode: "create" | "edit";
}

export default function ConnectionProfileFormPage({
  mode,
}: ConnectionProfileFormPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ConnectionProfileType | null>(null);

  const [formData, setFormData] = useState<CreateConnectionProfilePayload>({
    profile_name: "",
    profile_code: "",
    connection_type: "database",
    load_strategy: "full",
    environment: "development",
    batch_size: 1000,
    parallel_threads: 4,
    min_pool_size: 2,
    max_pool_size: 10,
    connection_timeout_seconds: 30,
    idle_timeout_seconds: 600,
    max_retries: 3,
    retry_backoff_multiplier: 2,
    circuit_breaker_threshold: 5,
    data_classification: "internal",
    contains_pii: false,
    gdpr_applicable: false,
    valid_from: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      loadProfile();
    }
  }, [mode, id]);

  const isLookupNotFoundError = (error: unknown) => {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    return message.includes("not found") || message.includes("404");
  };

  const ensureUniqueIdentifiers = async () => {
    const normalizedName = formData.profile_name.trim();
    const normalizedCode = formData.profile_code.trim();
    const currentId = id ? Number(id) : null;

    if (normalizedName) {
      try {
        const existingByName = await connectionProfileService.getProfileByName(
          normalizedName
        );
        if (
          existingByName &&
          (mode === "create" || existingByName.id !== currentId)
        ) {
          throw new Error("A profile with this name already exists.");
        }
      } catch (err) {
        if (!isLookupNotFoundError(err)) {
          throw err;
        }
      }
    }

    if (normalizedCode) {
      try {
        const existingByCode = await connectionProfileService.getProfileByCode(
          normalizedCode
        );
        if (
          existingByCode &&
          (mode === "create" || existingByCode.id !== currentId)
        ) {
          throw new Error("A profile with this code already exists.");
        }
      } catch (err) {
        if (!isLookupNotFoundError(err)) {
          throw err;
        }
      }
    }
  };

  const loadProfile = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await connectionProfileService.getProfile(Number(id));
      setProfile(data);
      setFormData({
        profile_name: data.profile_name,
        profile_code: data.profile_code,
        connection_type: data.connection_type,
        load_strategy: data.load_strategy,
        environment: data.environment,
        batch_size: data.batch_size,
        parallel_threads: data.parallel_threads,
        min_pool_size: data.min_pool_size,
        max_pool_size: data.max_pool_size,
        connection_timeout_seconds: data.connection_timeout_seconds,
        idle_timeout_seconds: data.idle_timeout_seconds,
        max_retries: data.max_retries,
        retry_backoff_multiplier: data.retry_backoff_multiplier,
        circuit_breaker_threshold: data.circuit_breaker_threshold,
        data_classification: data.data_classification,
        contains_pii: data.contains_pii,
        gdpr_applicable: data.gdpr_applicable,
        valid_from: data.valid_from.split("T")[0],
        valid_to: data.valid_to ? data.valid_to.split("T")[0] : null,
        server_id: data.server_id || undefined,
        database_name: data.database_name || undefined,
        database_type: data.database_type || undefined,
        sync_column_name: data.sync_column_name || undefined,
        sync_column_type: data.sync_column_type || undefined,
        health_check_enabled: data.health_check_enabled,
        health_check_query: data.health_check_query || undefined,
        encryption_key_version: data.encryption_key_version,
        metadata: data.metadata || undefined,
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await ensureUniqueIdentifiers();
      if (mode === "create") {
        const payload: CreateConnectionProfilePayload = {
          ...formData,
          valid_from: new Date(formData.valid_from).toISOString(),
        };
        await connectionProfileService.createProfile(payload);
        success("Connection profile created successfully");
      } else if (id) {
        const payload: UpdateConnectionProfilePayload = {
          ...formData,
          valid_from: new Date(formData.valid_from).toISOString(),
          valid_to: formData.valid_to
            ? new Date(formData.valid_to).toISOString()
            : null,
        };
        await connectionProfileService.updateProfile(Number(id), payload);
        success("Connection profile updated successfully");
      }

      navigate("/dashboard/connection-profiles");
    } catch (err) {
      showError(
        `Failed to ${
          mode === "create" ? "create" : "update"
        } connection profile`,
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/connection-profiles")}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
              {mode === "create"
                ? "Create Connection Profile"
                : "Edit Connection Profile"}
            </h1>
            <p className={`${tw.textSecondary} mt-1 text-sm`}>
              {mode === "create"
                ? "Configure a new connection profile"
                : `Editing: ${profile?.profile_name || ""}`}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="rounded-md border border-gray-200 p-6"
          style={{ backgroundColor: color.surface.cards }}
        >
          <h2 className={`${tw.cardHeading} text-gray-900 mb-4`}>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Name *
              </label>
              <input
                type="text"
                value={formData.profile_name}
                onChange={(e) =>
                  setFormData({ ...formData, profile_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Code *
              </label>
              <input
                type="text"
                value={formData.profile_code}
                onChange={(e) =>
                  setFormData({ ...formData, profile_code: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection Type *
              </label>
              <select
                value={formData.connection_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    connection_type: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              >
                <option value="database">Database</option>
                <option value="api">API</option>
                <option value="sftp">SFTP</option>
                <option value="ftp">FTP</option>
                <option value="s3">S3</option>
                <option value="azure_blob">Azure Blob</option>
                <option value="kafka">Kafka</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment *
              </label>
              <select
                value={formData.environment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    environment: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
                <option value="uat">UAT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Load Strategy *
              </label>
              <select
                value={formData.load_strategy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    load_strategy: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              >
                <option value="full">Full</option>
                <option value="incremental">Incremental</option>
                <option value="delta">Delta</option>
                <option value="cdc">CDC</option>
                <option value="merge">Merge</option>
                <option value="append">Append</option>
                <option value="upsert">Upsert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Server ID
              </label>
              <input
                type="number"
                value={formData.server_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    server_id: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div
          className="rounded-md border border-gray-200 p-6"
          style={{ backgroundColor: color.surface.cards }}
        >
          <h2 className={`${tw.cardHeading} text-gray-900 mb-4`}>
            Performance Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Size *
              </label>
              <input
                type="number"
                value={formData.batch_size}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    batch_size: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parallel Threads *
              </label>
              <input
                type="number"
                value={formData.parallel_threads}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parallel_threads: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
                min={1}
                max={32}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Pool Size *
              </label>
              <input
                type="number"
                value={formData.min_pool_size}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_pool_size: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Pool Size *
              </label>
              <input
                type="number"
                value={formData.max_pool_size}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_pool_size: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
                min={formData.min_pool_size}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection Timeout (seconds) *
              </label>
              <input
                type="number"
                value={formData.connection_timeout_seconds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    connection_timeout_seconds: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idle Timeout (seconds) *
              </label>
              <input
                type="number"
                value={formData.idle_timeout_seconds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    idle_timeout_seconds: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
                min={1}
              />
            </div>
          </div>
        </div>

        <div
          className="rounded-md border border-gray-200 p-6"
          style={{ backgroundColor: color.surface.cards }}
        >
          <h2 className={`${tw.cardHeading} text-gray-900 mb-4`}>
            Data Governance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Classification *
              </label>
              <select
                value={formData.data_classification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data_classification: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              >
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="confidential">Confidential</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.contains_pii}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contains_pii: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">
                  Contains PII
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.gdpr_applicable}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gdpr_applicable: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">
                  GDPR Applicable
                </span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid From *
              </label>
              <input
                type="date"
                value={formData.valid_from}
                onChange={(e) =>
                  setFormData({ ...formData, valid_from: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid To
              </label>
              <input
                type="date"
                value={formData.valid_to || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    valid_to: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard/connection-profiles")}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: color.primary.action }}
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {mode === "create" ? "Create Profile" : "Update Profile"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
