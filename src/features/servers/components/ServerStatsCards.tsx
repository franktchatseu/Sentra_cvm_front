import { Activity, Globe, Layers, ShieldCheck, Signal } from "lucide-react";
import {
  ServerCountByEnvironment,
  ServerCountByProtocol,
  ServerCountByRegion,
  ServerHealthStats,
} from "../types/server";
import { color, tw } from "../../../shared/utils/utils";

type ServerStatsCardsProps = {
  healthStats?: ServerHealthStats | null;
  environmentCounts?: ServerCountByEnvironment;
  protocolCounts?: ServerCountByProtocol;
  regionCounts?: ServerCountByRegion;
  isLoading: boolean;
};

const formatPercent = (value: number, total: number) => {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
};

export default function ServerStatsCards({
  healthStats,
  environmentCounts = [],
  protocolCounts = [],
  regionCounts = [],
  isLoading,
}: ServerStatsCardsProps) {
  const totalServers = healthStats?.total_servers ?? 0;
  const healthy = healthStats?.healthy ?? 0;
  const unhealthy = healthStats?.unhealthy ?? 0;
  const healthEnabled = healthStats?.health_check_enabled ?? 0;
  const regionsCovered = regionCounts.filter((item) => !!item.region).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Servers</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {isLoading ? "—" : totalServers.toLocaleString()}
            </p>
          </div>
          <div
            className="rounded-full p-3"
            style={{ backgroundColor: `${color.primary.accent}22` }}
          >
            <Layers
              size={22}
              style={{ color: color.primary.accent }}
              aria-hidden
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          {environmentCounts.length} environments tracked
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Health Coverage</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {isLoading
                ? "—"
                : `${healthEnabled.toLocaleString()}/${totalServers.toLocaleString()}`}
            </p>
          </div>
          <div
            className="rounded-full p-3"
            style={{ backgroundColor: `${color.status.info}15` }}
          >
            <ShieldCheck
              size={22}
              style={{ color: color.status.info }}
              aria-hidden
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className={`${tw.textSecondary}`}>
            Healthy{" "}
            <span className="font-semibold text-gray-900">
              {healthy.toLocaleString()}
            </span>
          </span>
          <span className="text-gray-400">•</span>
          <span className={`${tw.textSecondary}`}>
            Unhealthy{" "}
            <span className="font-semibold text-gray-900">
              {unhealthy.toLocaleString()}
            </span>
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Protocol Mix</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {protocolCounts.length}
            </p>
          </div>
          <div
            className="rounded-full p-3"
            style={{ backgroundColor: `${color.status.success}15` }}
          >
            <Signal
              size={22}
              style={{ color: color.status.success }}
              aria-hidden
            />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {protocolCounts.slice(0, 4).map((protocol) => (
            <div
              key={protocol.protocol}
              className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
            >
              <span className="font-medium text-gray-600 uppercase">
                {protocol.protocol}
              </span>
              <span className="text-gray-900">
                {formatPercent(protocol.count, totalServers)}
              </span>
            </div>
          ))}
          {protocolCounts.length === 0 && (
            <p className="col-span-2 text-gray-400">No protocol data</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Region Coverage</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {regionsCovered}
            </p>
          </div>
          <div
            className="rounded-full p-3"
            style={{ backgroundColor: `${color.status.warning}15` }}
          >
            <Globe
              size={22}
              style={{ color: color.status.warning }}
              aria-hidden
            />
          </div>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {environmentCounts.slice(0, 3).map((env) => (
            <div
              key={`${env.environment}-stat`}
              className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Activity
                  size={16}
                  style={{ color: color.primary.accent }}
                  aria-hidden
                />
                <span className="font-medium capitalize">
                  {env.environment || "unknown"}
                </span>
              </div>
              <span className="text-gray-900">
                {formatPercent(env.count, totalServers)}
              </span>
            </div>
          ))}
          {environmentCounts.length === 0 && (
            <p className="text-gray-400">No environment data</p>
          )}
        </div>
      </div>
    </div>
  );
}

