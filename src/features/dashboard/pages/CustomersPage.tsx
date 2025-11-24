import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Activity,
  Target,
  AlertTriangle,
  Filter as FilterIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import type { CustomerRow } from "../types/ReportsAPI";
import {
  generateMockCustomers,
  CUSTOMER_SEGMENTS,
} from "../utils/mockCustomers";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { color, tw } from "../../../shared/utils/utils";

const pageSize = 10;

export default function CustomersPage() {
  const navigate = useNavigate();
  const mockCustomers = useMemo(() => generateMockCustomers(), []);

  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [lastActiveFilter, setLastActiveFilter] = useState<
    "any" | "7" | "30" | "90"
  >("any");

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [isClosingAdvancedFilters, setIsClosingAdvancedFilters] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  // Simulate async loading when inputs change (placeholder until API wiring exists)
  useEffect(() => {
    setIsLoading(true);
    setError("");
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [
    searchTerm,
    segmentFilter,
    channelFilter,
    riskFilter,
    regionFilter,
    lastActiveFilter,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    segmentFilter,
    channelFilter,
    riskFilter,
    regionFilter,
    lastActiveFilter,
  ]);

  const channelOptions: Array<"all" | "email" | "sms" | "push"> = [
    "all",
    "email",
    "sms",
    "push",
  ];

  const filteredCustomers = useMemo(() => {
    let results = mockCustomers;

    if (searchTerm.trim()) {
      const normalizedTerm = searchTerm.toLowerCase();
      const numericTerm = searchTerm.replace(/\D/g, "");

      results = results.filter((customer) => {
        const matchesId = customer.id.toLowerCase().includes(normalizedTerm);
        const matchesName = customer.name
          .toLowerCase()
          .includes(normalizedTerm);
        const matchesEmail = customer.email
          .toLowerCase()
          .includes(normalizedTerm);
        const matchesPhone =
          numericTerm.length > 0 &&
          customer.phone.replace(/\D/g, "").includes(numericTerm);

        return matchesId || matchesName || matchesEmail || matchesPhone;
      });
    }

    if (segmentFilter !== "all") {
      results = results.filter(
        (customer) => customer.segment === segmentFilter
      );
    }

    if (channelFilter !== "all") {
      results = results.filter(
        (customer) =>
          customer.preferredChannel.toLowerCase() ===
          channelFilter.toLowerCase()
      );
    }

    if (riskFilter !== "all") {
      results = results.filter((customer) => {
        if (riskFilter === "low") return customer.churnRisk < 30;
        if (riskFilter === "medium")
          return customer.churnRisk >= 30 && customer.churnRisk < 60;
        return customer.churnRisk >= 60;
      });
    }

    if (regionFilter !== "all") {
      results = results.filter((customer) =>
        customer.location.toLowerCase().includes(regionFilter.toLowerCase())
      );
    }

    if (lastActiveFilter !== "any") {
      results = results.filter((customer) => {
        const last = new Date(customer.lastInteractionDate);
        if (Number.isNaN(last.getTime())) return false;
        const diffDays = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= Number(lastActiveFilter);
      });
    }

    return results;
  }, [
    mockCustomers,
    searchTerm,
    segmentFilter,
    channelFilter,
    riskFilter,
    regionFilter,
    lastActiveFilter,
  ]);

  const totalResults = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const paginatedResults = useMemo(
    () =>
      filteredCustomers.slice((page - 1) * pageSize, page * pageSize) as
        | CustomerRow[]
        | [],
    [filteredCustomers, page]
  );

  const hasSearchFilters =
    searchTerm.trim().length > 0 ||
    segmentFilter !== "all" ||
    channelFilter !== "all" ||
    riskFilter !== "all" ||
    regionFilter !== "all" ||
    lastActiveFilter !== "any";

  const formatNumber = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const formatCurrency = (value: number) =>
    value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toFixed(0)}`;

  const customerStats = useMemo(() => {
    const total = mockCustomers.length;
    if (!total) {
      return {
        total: 0,
        active: 0,
        highRisk: 0,
        avgLifetime: 0,
        avgEngagement: 0,
        newThisWeek: 0,
      };
    }

    const active = mockCustomers.filter(
      (customer) => customer.churnRisk < 30
    ).length;
    const highRisk = mockCustomers.filter(
      (customer) => customer.churnRisk >= 60
    ).length;
    const lifetimeSum = mockCustomers.reduce(
      (sum, customer) => sum + customer.lifetimeValue,
      0
    );
    const engagementSum = mockCustomers.reduce(
      (sum, customer) => sum + customer.engagementScore,
      0
    );
    const newThisWeek = mockCustomers.filter((customer) => {
      const last = new Date(customer.lastInteractionDate);
      if (Number.isNaN(last.getTime())) return false;
      const diff = Date.now() - last.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      total,
      active,
      highRisk,
      avgLifetime: lifetimeSum / total,
      avgEngagement: engagementSum / total,
      newThisWeek,
    };
  }, [mockCustomers]);

  const statCards = useMemo(
    () => [
      {
        title: "Total Customers",
        value: formatNumber(customerStats.total),
        helper: "+3.2% vs last week",
        icon: Users,
      },
      {
        title: "New (7 days)",
        value: formatNumber(customerStats.newThisWeek),
        helper:
          customerStats.total > 0
            ? `${Math.round(
                (customerStats.newThisWeek / customerStats.total) * 100
              )}% of total`
            : "—",
        icon: Activity,
      },
      {
        title: "High Risk Customers",
        value: formatNumber(customerStats.highRisk),
        helper:
          customerStats.total > 0
            ? `${Math.round(
                (customerStats.highRisk / customerStats.total) * 100
              )}% of base`
            : "—",
        icon: AlertTriangle,
      },
      {
        title: "Avg Lifetime Value",
        value: formatCurrency(customerStats.avgLifetime),
        helper: `Engagement ${Math.round(customerStats.avgEngagement)} / 100`,
        icon: Target,
      },
    ],
    [customerStats]
  );

  const handleSelectCustomer = (customerToSelect: CustomerRow) => {
    navigate(
      `/dashboard/reports/customer-profiles/search?customerId=${customerToSelect.id}&source=customers`,
      {
        state: { customer: customerToSelect, source: "customers" as const },
      }
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSegmentFilter("all");
    setChannelFilter("all");
    setRiskFilter("all");
    setRegionFilter("all");
    setLastActiveFilter("any");
  };

  const handleCloseAdvancedFilters = () => {
    setIsClosingAdvancedFilters(true);
    setTimeout(() => {
      setIsAdvancedFiltersOpen(false);
      setIsClosingAdvancedFilters(false);
    }, 250);
  };

  const cellBackground: CSSProperties = {
    backgroundColor: color.surface.tablebodybg,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className={`${tw.mainHeading} mt-2`}>Customer Management</h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>
            Manage all customers from a single workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className={`${tw.button} flex items-center gap-2`}>
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ title, value, helper, icon: Icon }) => (
          <div
            key={title}
            className="rounded-md border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className={`${tw.textMuted} text-xs font-semibold uppercase`}>
                {title}
              </p>
              <div
                className="rounded-full p-2"
                style={{ backgroundColor: `${color.primary.accent}20` }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: color.primary.accent }}
                />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
            <p className={`${tw.textSecondary} mt-1 text-xs`}>{helper}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers..."
              className="w-full rounded-md border border-gray-200 py-3 pl-10 pr-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[--accent-color]"
              style={
                {
                  "--accent-color": `${color.primary.accent}33`,
                } as CSSProperties
              }
            />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 lg:justify-end">
          <div className="min-w-[160px] pt-1">
            <HeadlessSelect
              options={[
                { value: "all", label: "All segments" },
                ...CUSTOMER_SEGMENTS.map((segment) => ({
                  value: segment,
                  label: segment,
                })),
              ]}
              value={segmentFilter}
              onChange={(value) => setSegmentFilter((value as string) || "all")}
            />
          </div>
          <div className="min-w-[160px] pt-1">
            <HeadlessSelect
              options={channelOptions.map((option) => ({
                value: option,
                label: option === "all" ? "All channels" : option.toUpperCase(),
              }))}
              value={channelFilter}
              onChange={(value) => setChannelFilter((value as string) || "all")}
            />
          </div>
        </div>
      </div>

      {/* Table card */}
      <div>
        {error ? (
          <div className="px-6 py-10 text-center text-sm text-red-500">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <LoadingSpinner variant="modern" size="lg" />
            <p className={`${tw.textMuted} mt-4 text-sm`}>
              Preparing customer data...
            </p>
          </div>
        ) : paginatedResults.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            {hasSearchFilters
              ? "No customers match your filters. Try adjusting the search criteria."
              : "Start by searching for a customer above."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              style={{ borderCollapse: "separate", borderSpacing: "0 12px" }}
            >
              <thead
                className="text-xs uppercase tracking-wide"
                style={{ background: color.surface.tableHeader }}
              >
                <tr>
                  {[
                    "Customer",
                    "Segment",
                    "Transactions",
                    "Last Interaction",
                    "Preferred Channel",
                    "Location",
                    "Churn Risk",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-gray-900 font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map((row) => {
                  const rowSegments =
                    row.segments && row.segments.length > 0
                      ? row.segments
                      : row.segment
                      ? [row.segment]
                      : [];
                  return (
                    <tr key={row.id}>
                      <td
                        className="rounded-l-md px-6 py-5"
                        style={cellBackground}
                      >
                        <p className="font-semibold text-gray-900">
                          {row.name}
                        </p>
                      </td>
                      <td className="px-6 py-5" style={cellBackground}>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-900">
                          {rowSegments.slice(0, 3).map((segment, index) => (
                            <span key={`${row.id}-segment-${segment}-${index}`}>
                              {segment}
                            </span>
                          ))}
                          {rowSegments.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{rowSegments.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-6 py-5 font-semibold text-gray-900"
                        style={cellBackground}
                      >
                        {row.orders}
                      </td>
                      <td
                        className="px-6 py-5 text-gray-900"
                        style={cellBackground}
                      >
                        {row.lastPurchase}
                      </td>
                      <td
                        className="px-6 py-5 text-gray-900"
                        style={cellBackground}
                      >
                        {row.preferredChannel}
                      </td>
                      <td
                        className="px-6 py-5 text-gray-900"
                        style={cellBackground}
                      >
                        {row.location}
                      </td>
                      <td className="px-6 py-5" style={cellBackground}>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                            row.churnRisk >= 60
                              ? "bg-red-50 text-red-700"
                              : row.churnRisk >= 30
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {row.churnRisk >= 60
                            ? "High"
                            : row.churnRisk >= 30
                            ? "Medium"
                            : "Low"}
                        </span>
                      </td>
                      <td
                        className="rounded-r-md px-6 py-5 text-right"
                        style={cellBackground}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectCustomer(row)}
                          className="inline-flex items-center justify-center p-2 text-gray-700 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && paginatedResults.length > 0 && (
          <div className="rounded-md border border-gray-100 bg-white px-4 py-3 shadow-sm sm:flex sm:items-center sm:justify-between">
            <p className={`${tw.textSecondary} text-sm`}>
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page >= totalPages}
                className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced filters modal */}
    </div>
  );
}
