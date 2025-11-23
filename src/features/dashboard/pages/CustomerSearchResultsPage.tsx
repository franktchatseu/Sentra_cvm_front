import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  FileText,
  Activity,
  BarChart3,
  Megaphone,
  Calendar,
  X,
  List,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { colors } from "../../../shared/utils/tokens";
import { color, tw } from "../../../shared/utils/utils";
import type {
  CustomerRow,
  CustomerSearchResultsResponse,
} from "../types/ReportsAPI";

// Extract types from API response
type CustomerSegment = CustomerSearchResultsResponse["segments"][number];
type CustomerOffer = CustomerSearchResultsResponse["offers"][number];
type CustomerEvent = CustomerSearchResultsResponse["events"][number];
type SubscribedList = CustomerSearchResultsResponse["subscribedLists"][number];

// Custom Tooltip Component
type ChartTooltipEntry = {
  color?: string;
  name?: string;
  value?: number | string;
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: ChartTooltipEntry[];
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-gray-900">{label}</p>
      {payload.map((entry, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-4 text-sm text-gray-600"
        >
          <span className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-semibold text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Generate realistic related data
const generateCustomerRelatedData = (customer: CustomerRow) => {
  const segmentNames = [
    customer.segment,
    "High Value Customers",
    "Frequent Buyers",
    "Email Subscribers",
    "VIP Members",
  ];

  const segments: CustomerSegment[] = segmentNames.map((name, index) => {
    const baseDate = new Date(customer.lastInteractionDate);
    const addedDate = new Date(baseDate);
    addedDate.setDate(addedDate.getDate() - index * 15);

    return {
      id: `SEG-${customer.id.slice(-3)}-${index + 1}`,
      name,
      type: index < 2 ? "Dynamic" : "Static",
      addedDate: isNaN(addedDate.getTime())
        ? new Date().toISOString().split("T")[0]
        : addedDate.toISOString().split("T")[0],
    };
  });

  const offerNames = [
    "VIP Exclusive Offer",
    "Loyalty Reward",
    "Welcome Bonus",
    "Seasonal Discount",
    "Referral Bonus",
  ];

  const offerTypes = [
    "Discount",
    "Cashback",
    "Voucher",
    "Discount",
    "Cashback",
  ];
  const offerStatuses = ["Redeemed", "Active", "Expired", "Active", "Redeemed"];

  const offers: CustomerOffer[] = offerNames.map((name, index) => {
    const baseDate = new Date(customer.lastInteractionDate);
    const redeemedDate = new Date(baseDate);
    redeemedDate.setDate(redeemedDate.getDate() - index * 20);

    return {
      id: `OFF-${customer.id.slice(-3)}-${index + 1}`,
      name,
      type: offerTypes[index],
      status: offerStatuses[index],
      redeemedDate: isNaN(redeemedDate.getTime())
        ? new Date().toISOString().split("T")[0]
        : redeemedDate.toISOString().split("T")[0],
      value: Math.round(customer.aov * (0.1 + index * 0.05)),
    };
  });

  const events: CustomerEvent[] = [];
  const interactionDate = new Date(customer.lastInteractionDate);
  if (!isNaN(interactionDate.getTime())) {
    const baseDate = new Date(interactionDate);
    for (let i = 0; i < 8; i++) {
      const eventDate = new Date(baseDate);
      eventDate.setDate(eventDate.getDate() - i * 10);
      const channelTypes: Array<"email" | "sms" | "push" | "other"> = [
        "email",
        "sms",
        "push",
      ];
      const channelType = channelTypes[i % channelTypes.length];

      if (channelType === "email") {
        events.push({
          id: `EVT-${customer.id.slice(-3)}-E${i}`,
          type: "email",
          title:
            i === 0
              ? "Welcome Email"
              : i % 3 === 0
              ? "Newsletter"
              : "Promotional Email",
          description:
            i === 0
              ? "Welcome to our community"
              : i % 3 === 0
              ? "Monthly updates and news"
              : "Special offers just for you",
          date: eventDate.toISOString(),
          status: i % 2 === 0 ? "Opened" : "Clicked",
        });
      } else if (channelType === "sms") {
        events.push({
          id: `EVT-${customer.id.slice(-3)}-S${i}`,
          type: "sms",
          title: i % 2 === 0 ? "Transaction Update" : "Promotional SMS",
          description:
            i % 2 === 0
              ? "Your transaction has been processed"
              : "Flash sale - 24 hours only",
          date: eventDate.toISOString(),
          status: "Delivered",
        });
      } else if (channelType === "push") {
        events.push({
          id: `EVT-${customer.id.slice(-3)}-P${i}`,
          type: "push",
          title: "New Products",
          description: "Check out our latest arrivals",
          date: eventDate.toISOString(),
          status: "Sent",
        });
      }
    }
  }

  const listNames = [
    "Newsletter",
    "Promotions",
    "Product Updates",
    "Special Offers",
  ];

  const lists: SubscribedList[] = listNames.map((name, index) => {
    const baseDate = new Date(customer.lastInteractionDate);
    const subscribedDate = new Date(baseDate);
    subscribedDate.setDate(subscribedDate.getDate() - index * 30); // Spread dates

    return {
      id: `LIST-${customer.id.slice(-3)}-${index + 1}`,
      name,
      subscribedDate: isNaN(subscribedDate.getTime())
        ? new Date().toISOString().split("T")[0]
        : subscribedDate.toISOString().split("T")[0],
      status:
        index < 3
          ? "active"
          : customer.engagementScore > 70
          ? "active"
          : "unsubscribed",
    };
  });

  return { segments, offers, events, lists };
};

type TabType =
  | "overview"
  | "activity"
  | "engagement"
  | "marketing"
  | "subscribedLists";

export default function CustomerSearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const customer = location.state?.customer as CustomerRow | undefined;

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [eventSearchTerm, setEventSearchTerm] = useState<string>("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [eventDateFrom, setEventDateFrom] = useState<string>("");
  const [eventDateTo, setEventDateTo] = useState<string>("");
  const [eventStatusFilter, setEventStatusFilter] = useState<string>("all");

  const { segments, offers, events, lists } = useMemo(() => {
    if (!customer) return { segments: [], offers: [], events: [], lists: [] };
    return generateCustomerRelatedData(customer);
  }, [customer]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        eventSearchTerm.trim() === "" ||
        event.title.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(eventSearchTerm.toLowerCase());
      const matchesType =
        eventTypeFilter === "all" || event.type === eventTypeFilter;
      const matchesStatus =
        eventStatusFilter === "all" || event.status === eventStatusFilter;

      let matchesDate = true;
      if (eventDateFrom) {
        const eventDate = new Date(event.date);
        const fromDate = new Date(eventDateFrom);
        matchesDate = matchesDate && eventDate >= fromDate;
      }
      if (eventDateTo) {
        const eventDate = new Date(event.date);
        const toDate = new Date(eventDateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && eventDate <= toDate;
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [
    events,
    eventSearchTerm,
    eventTypeFilter,
    eventStatusFilter,
    eventDateFrom,
    eventDateTo,
  ]);

  const eventDistributionData = useMemo(() => {
    const distribution: Record<string, number> = {};
    events.forEach((event) => {
      distribution[event.type] = (distribution[event.type] || 0) + 1;
    });
    return Object.entries(distribution).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }));
  }, [events]);

  const activityTimelineData = useMemo(() => {
    const monthlyActivity: Record<string, number> = {};
    events.forEach((event) => {
      const date = new Date(event.date);
      const monthKey = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyActivity[monthKey] = (monthlyActivity[monthKey] || 0) + 1;
    });
    return Object.entries(monthlyActivity).map(([month, count]) => ({
      month,
      events: count,
    }));
  }, [events]);

  const statusDistributionData = useMemo(() => {
    const distribution: Record<string, number> = {};
    events.forEach((event) => {
      distribution[event.status] = (distribution[event.status] || 0) + 1;
    });
    return Object.entries(distribution).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [events]);

  const engagementByChannelData = useMemo(() => {
    const channelStats: Record<string, { total: number; engaged: number }> = {
      email: { total: 0, engaged: 0 },
      sms: { total: 0, engaged: 0 },
      push: { total: 0, engaged: 0 },
    };

    events.forEach((event) => {
      const channel = event.type.toLowerCase();
      if (channelStats[channel]) {
        channelStats[channel].total++;
        // Count engaged events (opened, clicked, read)
        if (
          ["opened", "clicked", "read"].includes(event.status.toLowerCase())
        ) {
          channelStats[channel].engaged++;
        }
      }
    });

    return Object.entries(channelStats).map(([channel, stats]) => ({
      name: channel.charAt(0).toUpperCase() + channel.slice(1),
      total: stats.total,
      engaged: stats.engaged,
      engagementRate:
        stats.total > 0 ? Math.round((stats.engaged / stats.total) * 100) : 0,
    }));
  }, [events]);

  const CHART_COLORS = [
    colors.reportCharts.palette.color1,
    colors.reportCharts.palette.color2,
    colors.reportCharts.palette.color3,
    colors.reportCharts.palette.color4,
  ];

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/reports/customer-profiles")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Customer Not Found
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              The customer you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const email = `${customer.name
    .toLowerCase()
    .replace(/\s+/g, ".")}@example.com`;
  const phone = `+254${Math.floor(Math.random() * 900000000 + 100000000)}`;

  const getStatusConfig = () => {
    if (customer.churnRisk < 30) {
      return {
        label: "Active",
        className: "bg-green-100 text-green-800",
      };
    } else if (customer.churnRisk < 60) {
      return {
        label: "At Risk",
        className: "bg-yellow-100 text-yellow-800",
      };
    } else {
      return {
        label: "High Risk",
        className: "bg-red-100 text-red-800",
      };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/reports/customer-profiles")}
            className="p-2 text-gray-600 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
              {customer.name}
            </h1>
            <p className={`${tw.textSecondary} text-sm mt-1`}>{customer.id}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: "overview", label: "Customer Information", icon: FileText },
          { id: "activity", label: "Events", icon: Activity },
          { id: "subscribedLists", label: "Subscribed Lists", icon: List },
          { id: "engagement", label: "Analytics", icon: BarChart3 },
          { id: "marketing", label: "Marketing", icon: Megaphone },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 relative ${
              activeTab === tab.id
                ? "text-black"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: color.primary.accent }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">Customer ID</span>
                    <span className="text-sm font-medium text-gray-900 text-right font-mono">
                      {customer.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">Email</span>
                    <span className="text-sm font-medium text-gray-900 text-right">
                      {email}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">Phone</span>
                    <span className="text-sm font-medium text-gray-900 text-right">
                      {phone}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">Location</span>
                    <span className="text-sm font-medium text-gray-900 text-right">
                      {customer.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">Segment</span>
                    <span className="text-sm font-medium text-gray-900">
                      {customer.segment}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">
                      Preferred Channel
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {customer.preferredChannel}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">Device Type</span>
                    <span className="text-sm font-medium text-gray-900">
                      Mobile
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Financial Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">
                      Lifetime Value
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ${(customer.lifetimeValue / 1000).toFixed(1)}K
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">
                      Total Transactions
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {customer.orders}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">
                      Average Transaction Value
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ${customer.aov.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">
                      Engagement Score
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {customer.engagementScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">Last Purchase</span>
                    <span className="text-sm font-medium text-gray-900">
                      {customer.lastPurchase}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Customer Events
            </h3>
            <p className="text-sm text-gray-500">
              Track all customer interactions including emails, SMS, push
              notifications, purchases, and more
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={eventSearchTerm}
                onChange={(e) => setEventSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-4 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
            </select>
            <select
              value={eventStatusFilter}
              onChange={(e) => setEventStatusFilter(e.target.value)}
              className="px-4 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Sent">Sent</option>
              <option value="Delivered">Delivered</option>
              <option value="Opened">Opened</option>
              <option value="Clicked">Clicked</option>
              <option value="Read">Read</option>
            </select>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={eventDateFrom}
                onChange={(e) => setEventDateFrom(e.target.value)}
                placeholder="From Date"
                className="w-full pl-10 pr-10 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
                onClick={(e) =>
                  (e.currentTarget as HTMLInputElement).showPicker()
                }
              />
              {eventDateFrom && (
                <button
                  onClick={() => setEventDateFrom("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={eventDateTo}
                onChange={(e) => setEventDateTo(e.target.value)}
                placeholder="To Date"
                className="w-full pl-10 pr-10 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
                onClick={(e) =>
                  (e.currentTarget as HTMLInputElement).showPicker()
                }
              />
              {eventDateTo && (
                <button
                  onClick={() => setEventDateTo("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div
            className={`rounded-md border border-[${color.border.default}] overflow-hidden`}
          >
            <div className="hidden lg:block overflow-x-auto">
              <table
                className="w-full"
                style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
              >
                <thead style={{ background: color.surface.tableHeader }}>
                  <tr className="text-left text-sm font-medium uppercase tracking-wider">
                    {["Event Type", "Description", "Channel", "Status"].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-6 py-3"
                          style={{ color: color.surface.tableHeaderText }}
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-sm text-gray-500"
                        style={{ backgroundColor: color.surface.tablebodybg }}
                      >
                        No events found
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => {
                      return (
                        <tr key={event.id} className="transition-colors">
                          <td
                            className="px-6 py-4 font-semibold text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            {event.title}
                          </td>
                          <td
                            className="px-6 py-4 text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            {event.description}
                          </td>
                          <td
                            className="px-6 py-4 text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            {event.type.toUpperCase()}
                          </td>
                          <td
                            className="px-6 py-4 text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            {event.status}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "engagement" && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Distribution by Channel - Bar Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Event Distribution by Channel
              </h3>
              {eventDistributionData.length === 0 ? (
                <p className="text-gray-400 text-sm">No data available</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="value"
                        fill={colors.reportCharts.palette.color1}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activity Timeline
              </h3>
              {activityTimelineData.length === 0 ? (
                <p className="text-gray-400 text-sm">No data available</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="events"
                        fill={colors.reportCharts.palette.color2}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Status Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status Distribution
              </h3>
              {statusDistributionData.length === 0 ? (
                <p className="text-gray-400 text-sm">No data available</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="value"
                        fill={colors.reportCharts.palette.color3}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Engagement Rate by Channel */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Engagement Rate by Channel
              </h3>
              {engagementByChannelData.length === 0 ? (
                <p className="text-gray-400 text-sm">No data available</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementByChannelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        label={{
                          value: "Engagement Rate (%)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        formatter={(value: number) => `${value}%`}
                      />
                      <Bar
                        dataKey="engagementRate"
                        fill={colors.reportCharts.palette.color4}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "marketing" && (
        <div className="space-y-6">
          {/* Segments Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Segments
            </h3>
            <div
              className={`rounded-md border border-[${color.border.default}] overflow-hidden`}
            >
              <div className="hidden lg:block overflow-x-auto">
                <table
                  className="w-full"
                  style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
                >
                  <thead style={{ background: color.surface.tableHeader }}>
                    <tr className="text-left text-sm font-medium uppercase tracking-wider">
                      {["Segment Name", "Type", "Added Date"].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3"
                          style={{ color: color.surface.tableHeaderText }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {segments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-10 text-center text-sm text-gray-500"
                          style={{ backgroundColor: color.surface.tablebodybg }}
                        >
                          No segments assigned
                        </td>
                      </tr>
                    ) : (
                      segments.map((segment) => (
                        <tr key={segment.id} className="transition-colors">
                          <td
                            className="px-6 py-4 font-semibold text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            {segment.name}
                          </td>
                          <td
                            className="px-6 py-4 text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            {segment.type}
                          </td>
                          <td
                            className="px-6 py-4 text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            {new Date(segment.addedDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Offers Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Offers</h3>
            <div
              className={`rounded-md border border-[${color.border.default}] overflow-hidden`}
            >
              <div className="hidden lg:block overflow-x-auto">
                <table
                  className="w-full"
                  style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
                >
                  <thead style={{ background: color.surface.tableHeader }}>
                    <tr className="text-left text-sm font-medium uppercase tracking-wider">
                      {[
                        "Offer Name",
                        "Type",
                        "Status",
                        "Value",
                        "Redeemed Date",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3"
                          style={{ color: color.surface.tableHeaderText }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {offers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-10 text-center text-sm text-gray-500"
                          style={{ backgroundColor: color.surface.tablebodybg }}
                        >
                          No offers available
                        </td>
                      </tr>
                    ) : (
                      offers.map((offer) => (
                        <tr key={offer.id} className="transition-colors">
                          <td
                            className="px-6 py-4 font-semibold text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            {offer.name}
                          </td>
                          <td
                            className="px-6 py-4 text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            {offer.type}
                          </td>
                          <td
                            className="px-6 py-4 text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            {offer.status}
                          </td>
                          <td
                            className="px-6 py-4 text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            ${offer.value.toFixed(2)}
                          </td>
                          <td
                            className="px-6 py-4 text-sm text-gray-900"
                            style={{
                              backgroundColor: color.surface.tablebodybg,
                            }}
                          >
                            {new Date(offer.redeemedDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "subscribedLists" && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Subscribed Lists
            </h3>
            <p className="text-sm text-gray-500">
              View all mailing lists and subscriptions for this customer
            </p>
          </div>

          {/* Table */}
          <div
            className={`rounded-md border border-[${color.border.default}] overflow-hidden`}
          >
            <div className="hidden lg:block overflow-x-auto">
              <table
                className="w-full"
                style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
              >
                <thead style={{ background: color.surface.tableHeader }}>
                  <tr className="text-left text-sm font-medium uppercase tracking-wider">
                    {["List Name", "Subscribed Date", "Status"].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-6 py-3"
                          style={{ color: color.surface.tableHeaderText }}
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {lists.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-10 text-center text-sm text-gray-500"
                        style={{ backgroundColor: color.surface.tablebodybg }}
                      >
                        No subscriptions found
                      </td>
                    </tr>
                  ) : (
                    lists.map((list) => (
                      <tr key={list.id} className="transition-colors">
                        <td
                          className="px-6 py-4 font-semibold text-sm text-gray-900"
                          style={{
                            backgroundColor: color.surface.tablebodybg,
                          }}
                        >
                          {list.name}
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-gray-900"
                          style={{
                            backgroundColor: color.surface.tablebodybg,
                          }}
                        >
                          {new Date(list.subscribedDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-gray-900"
                          style={{
                            backgroundColor: color.surface.tablebodybg,
                          }}
                        >
                          {list.status === "active" ? "Active" : "Unsubscribed"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
