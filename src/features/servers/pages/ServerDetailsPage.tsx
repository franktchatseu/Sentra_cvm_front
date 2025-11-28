import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Globe,
  Server as ServerIcon,
  Pencil,
  HeartPulse,
  Power,
  Archive,
} from "lucide-react";
import { serverService } from "../services/serverService";
import { ServerType } from "../types/server";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { useToast } from "../../../contexts/ToastContext";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { color, tw } from "../../../shared/utils/utils";

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </span>
    <span className={`text-sm ${tw.textPrimary}`}>
      {value === undefined || value === null || value === "" ? "—" : value}
    </span>
  </div>
);

export default function ServerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error: showError, success } = useToast();
  const { confirm } = useConfirm();

  const [server, setServer] = useState<ServerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionState, setActionState] = useState<
    "activate" | "deactivate" | "health" | "deprecate" | null
  >(null);

  const loadServer = useCallback(async () => {
    if (!id) {
      setErrorMessage("Server id missing from route.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await serverService.getServerById(Number(id));
      setServer(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load server.";
      setErrorMessage(message);
      showError("Unable to load server", message);
    } finally {
      setIsLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    loadServer();
  }, [loadServer]);

  const endpoint = useMemo(() => {
    if (!server) return "";
    return `${server.protocol}://${server.host}${
      server.port ? `:${server.port}` : ""
    }${server.base_path || ""}`.replace(/\/+$/, "");
  }, [server]);

  const handleActivationToggle = async () => {
    if (!server) return;
    const action = server.is_active ? "deactivate" : "activate";

    const confirmed = await confirm({
      title: `${action === "activate" ? "Activate" : "Deactivate"} Server`,
      message: `Are you sure you want to ${action} "${server.name}"?`,
      type: action === "activate" ? "success" : "warning",
      confirmText: action === "activate" ? "Activate" : "Deactivate",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setActionState(action);
    try {
      if (action === "activate") {
        await serverService.activateServer(server.id);
      } else {
        await serverService.deactivateServer(server.id);
      }
      success(
        `Server ${action === "activate" ? "activated" : "deactivated"}`,
        `${server.name} is now ${
          action === "activate" ? "active" : "inactive"
        }.`
      );
      await loadServer();
    } catch (err) {
      showError(
        `Failed to ${action} server`,
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setActionState(null);
    }
  };

  const handleDeprecationToggle = async () => {
    if (!server) return;
    const nextAction = server.is_deprecated ? "undeprecate" : "deprecate";

    const confirmed = await confirm({
      title: `${nextAction === "deprecate" ? "Deprecate" : "Restore"} Server`,
      message: `Are you sure you want to ${nextAction} "${server.name}"?`,
      type: nextAction === "deprecate" ? "warning" : "info",
      confirmText: nextAction === "deprecate" ? "Deprecate" : "Restore",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setActionState("deprecate");
    try {
      if (nextAction === "deprecate") {
        await serverService.deprecateServer(server.id);
      } else {
        await serverService.undeprecateServer(server.id);
      }
      success(
        `Server ${nextAction === "deprecate" ? "deprecated" : "restored"}`,
        nextAction === "deprecate"
          ? `${server.name} will no longer receive new jobs.`
          : `${server.name} is available again.`
      );
      await loadServer();
    } catch (err) {
      showError(
        `Failed to ${nextAction} server`,
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setActionState(null);
    }
  };

  const handleHealthToggle = async () => {
    if (!server) return;
    const action = server.health_check_enabled ? "disable" : "enable";

    const confirmed = await confirm({
      title: `${action === "enable" ? "Enable" : "Disable"} Health Checks`,
      message: `Are you sure you want to ${action} health monitoring for "${server.name}"?`,
      type: action === "enable" ? "success" : "warning",
      confirmText: action === "enable" ? "Enable" : "Disable",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setActionState("health");
    try {
      if (action === "enable") {
        await serverService.enableHealthCheck(server.id, {
          healthCheckUrl: server.health_check_url || undefined,
        });
      } else {
        await serverService.disableHealthCheck(server.id);
      }
      success(
        `Health checks ${action === "enable" ? "enabled" : "disabled"}`,
        action === "enable"
          ? `${server.name} will report health automatically.`
          : `${server.name} will no longer be monitored.`
      );
      await loadServer();
    } catch (err) {
      showError(
        `Failed to ${action} health checks`,
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setActionState(null);
    }
  };

  const isActivationLoading =
    actionState === "activate" || actionState === "deactivate";
  const isHealthLoading = actionState === "health";
  const isDeprecationLoading = actionState === "deprecate";

  const handleEdit = () => {
    if (!id) return;
    navigate(`/dashboard/servers/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <LoadingSpinner variant="modern" size="lg" color="primary" />
        <p className="mt-3 text-sm text-gray-500">Loading server details…</p>
      </div>
    );
  }

  if (errorMessage || !server) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle size={20} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Unable to load server
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {errorMessage || "This server could not be found."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to servers
      </button>

      <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Server
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">
              {server.name}
            </h1>
            <p className="text-sm text-gray-500">Code: {server.code}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  server.is_active
                    ? `${tw.statusSuccess10} ${tw.success}`
                    : `${tw.statusDanger10} ${tw.danger}`
                }`}
              >
                {server.is_active ? "Active" : "Inactive"}
              </span>
              {server.is_deprecated && (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tw.statusWarning10} ${tw.warning}`}
                >
                  Deprecated
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-l border-gray-200 pl-3">
              <button
                onClick={handleHealthToggle}
                disabled={isHealthLoading}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  server.health_check_enabled
                    ? "border-green-200 text-green-700 hover:bg-green-50"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                } ${isHealthLoading ? "opacity-60" : ""}`}
                title={
                  server.health_check_enabled
                    ? "Disable health checks"
                    : "Enable health checks"
                }
              >
                <HeartPulse size={16} />
                {server.health_check_enabled ? "Health On" : "Health Off"}
              </button>
              <button
                onClick={handleActivationToggle}
                disabled={isActivationLoading}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  server.is_active
                    ? "border-red-200 text-red-600 hover:bg-red-50"
                    : "border-green-200 text-green-600 hover:bg-green-50"
                } ${isActivationLoading ? "opacity-60" : ""}`}
                title={
                  server.is_active ? "Deactivate server" : "Activate server"
                }
              >
                <Power size={16} />
                {server.is_active ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={handleDeprecationToggle}
                disabled={isDeprecationLoading}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  server.is_deprecated
                    ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                } ${isDeprecationLoading ? "opacity-60" : ""}`}
                title={
                  server.is_deprecated
                    ? "Undeprecate server"
                    : "Deprecate server"
                }
              >
                <Archive size={16} />
                {server.is_deprecated ? "Restore" : "Deprecate"}
              </button>
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                title="Edit server"
              >
                <Pencil size={16} />
                Edit
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Environment
            </p>
            <div className="mt-2 flex items-center gap-2 text-gray-900">
              <Globe size={18} />
              <span className="font-semibold uppercase">
                {server.environment}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Region: {server.region || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Protocol
            </p>
            <div className="mt-2 flex items-center gap-2 text-gray-900">
              <ServerIcon size={18} />
              <span className="font-semibold uppercase">{server.protocol}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              TLS: {server.tls_enabled ? "Enabled" : "Disabled"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Endpoint
            </p>
            <p className="mt-2 font-mono text-xs text-gray-900 break-all">
              {endpoint}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Activity size={20} style={{ color: color.status.info }} />
            <h2 className="text-base font-semibold text-gray-900">
              Connection & Limits
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Host" value={server.host} />
            <InfoRow label="Port" value={server.port?.toString() ?? "—"} />
            <InfoRow
              label="Timeout (seconds)"
              value={server.timeout_seconds?.toString()}
            />
            <InfoRow
              label="Max retries"
              value={server.max_retries?.toString()}
            />
            <InfoRow
              label="Circuit breaker"
              value={server.circuit_breaker_enabled ? "Enabled" : "Disabled"}
            />
            <InfoRow
              label="Circuit threshold"
              value={server.circuit_breaker_threshold?.toString()}
            />
            <InfoRow label="Base path" value={server.base_path} />
            <InfoRow
              label="Authentication type"
              value={server.authentication_type}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            {server.health_check_enabled ? (
              <ShieldCheck size={20} style={{ color: color.status.success }} />
            ) : (
              <AlertTriangle
                size={20}
                style={{ color: color.status.warning }}
              />
            )}
            <h2 className="text-base font-semibold text-gray-900">
              Health Monitoring
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              label="Health checks"
              value={server.health_check_enabled ? "Enabled" : "Disabled"}
            />
            <InfoRow label="Health URL" value={server.health_check_url} />
            <InfoRow
              label="Interval (seconds)"
              value={server.health_check_interval_seconds?.toString()}
            />
            <InfoRow
              label="Last status"
              value={server.last_health_check_status}
            />
            <InfoRow
              label="Last checked"
              value={
                server.last_health_check_at
                  ? new Date(server.last_health_check_at).toLocaleString()
                  : "Never"
              }
            />
            <InfoRow
              label="Consecutive failures"
              value={server.consecutive_health_failures?.toString()}
            />
          </div>
        </section>
      </div>

      {server.metadata && Object.keys(server.metadata).length > 0 && (
        <section className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Metadata</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {Object.entries(server.metadata).map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {key}
                </p>
                <p className="mt-1 text-gray-900">
                  {typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : String(value)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
