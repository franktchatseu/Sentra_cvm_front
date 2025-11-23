import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  FileText,
  Activity,
  BarChart3,
  Megaphone,
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

// Generate realistic related data
const generateCustomerRelatedData = (customer: CustomerRow) => {
  const segments: CustomerSegment[] = [
    {
      id: `SEG-${customer.id.slice(-3)}`,
      name: customer.segment,
      type:
        customer.segment === "Champions" || customer.segment === "Loyalists"
          ? "Dynamic"
          : "Static",
      addedDate: (() => {
        const date = new Date(customer.lastInteractionDate);
        return isNaN(date.getTime())
          ? new Date().toISOString().split("T")[0]
          : date.toISOString().split("T")[0];
      })(),
    },
  ];

  const offers: CustomerOffer[] = [];
  if (customer.lifetimeValue > 2000) {
    offers.push({
      id: `OFF-${customer.id.slice(-3)}-1`,
      name: "VIP Exclusive Offer",
      type: "Discount",
      status: "Redeemed",
      redeemedDate: (() => {
        const date = new Date(customer.lastInteractionDate);
        return isNaN(date.getTime())
          ? new Date().toISOString().split("T")[0]
          : date.toISOString().split("T")[0];
      })(),
      value: Math.round(customer.aov * 0.2),
    });
  }
  if (customer.orders > 5) {
    offers.push({
      id: `OFF-${customer.id.slice(-3)}-2`,
      name: "Loyalty Reward",
      type: "Cashback",
      status: "Active",
      redeemedDate: (() => {
        const date = new Date(customer.lastInteractionDate);
        return isNaN(date.getTime())
          ? new Date().toISOString().split("T")[0]
          : date.toISOString().split("T")[0];
      })(),
      value: Math.round(customer.aov * 0.1),
    });
  }

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
          title: i % 3 === 0 ? "New Products" : "Cart Reminder",
          description:
            i % 3 === 0
              ? "Check out our latest arrivals"
              : "You have items waiting in your cart",
          date: eventDate.toISOString(),
          status: "Sent",
        });
      }
    }
  }

  const lists: SubscribedList[] = [
    {
      id: `LIST-${customer.id.slice(-3)}-1`,
      name: "Newsletter",
      subscribedDate: (() => {
        const date = new Date(customer.lastInteractionDate);
        return isNaN(date.getTime())
          ? new Date().toISOString().split("T")[0]
          : date.toISOString().split("T")[0];
      })(),
      status: "active",
    },
    {
      id: `LIST-${customer.id.slice(-3)}-2`,
      name: "Promotions",
      subscribedDate: (() => {
        const date = new Date(customer.lastInteractionDate);
        return isNaN(date.getTime())
          ? new Date().toISOString().split("T")[0]
          : date.toISOString().split("T")[0];
      })(),
      status: customer.engagementScore > 70 ? "active" : "unsubscribed",
    },
  ];

  return { segments, offers, events, lists };
};

type TabType = "overview" | "activity" | "engagement" | "marketing";

export default function CustomerSearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const customer = location.state?.customer as CustomerRow | undefined;

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [eventSearchTerm, setEventSearchTerm] = useState<string>("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");

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
      return matchesSearch && matchesType;
    });
  }, [events, eventSearchTerm, eventTypeFilter]);

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
          { id: "overview", label: "Overview", icon: FileText },
          { id: "activity", label: "Activity", icon: Activity },
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
              {/* Left Column */}
              <div className="space-y-6">
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
                      <span className="text-sm text-gray-600">
                        Last Purchase
                      </span>
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

              {/* Right Column */}
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                    <p className="text-xs text-gray-500">Lifetime Value</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${(customer.lifetimeValue / 1000).toFixed(1)}K
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                    <p className="text-xs text-gray-500">Total Transactions</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {customer.orders}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                    <p className="text-xs text-gray-500">Engagement Score</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {customer.engagementScore}
                    </p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Recent Activity
                  </h3>
                  <div className="space-y-2">
                    {filteredEvents.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="text-sm text-gray-600">
                          {event.title}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div>
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={eventSearchTerm}
                onChange={(e) => setEventSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
            </select>
          </div>

          <div className="space-y-1">
            {filteredEvents.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-12">
                No events found
              </p>
            ) : (
              filteredEvents.map((event, index) => {
                const currentDate = new Date(event.date).toDateString();
                const prevDate =
                  index > 0
                    ? new Date(filteredEvents[index - 1].date).toDateString()
                    : null;
                const showDateHeader = currentDate !== prevDate;

                return (
                  <div key={event.id}>
                    {showDateHeader && (
                      <div className="text-xs font-medium text-gray-500 mt-6 mb-3 first:mt-0">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-4 py-2.5 px-3 hover:bg-gray-50 rounded-lg text-sm">
                      <span className="text-gray-400 text-xs w-20">
                        {new Date(event.date).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {event.description}
                        </p>
                      </div>
                      <span className="text-gray-500 text-xs capitalize w-20">
                        {event.type}
                      </span>
                      <span className="text-gray-400 text-xs w-20 text-right">
                        {event.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === "engagement" && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Event Distribution
              </h3>
              {eventDistributionData.length === 0 ? (
                <p className="text-gray-400 text-sm">No data available</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: { name?: string; percent?: number }) =>
                          `${entry.name || ""}: ${(
                            (entry.percent || 0) * 100
                          ).toFixed(0)}%`
                        }
                        outerRadius={70}
                        innerRadius={25}
                        dataKey="value"
                      >
                        {eventDistributionData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

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
                      <Tooltip />
                      <Bar
                        dataKey="events"
                        fill={colors.reportCharts.palette.color1}
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
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Segments
              </h3>
              {segments.length === 0 ? (
                <p className="text-gray-400 text-sm">No segments assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {segments.map((segment) => (
                    <span
                      key={segment.id}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md"
                    >
                      {segment.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Offers
              </h3>
              {offers.length === 0 ? (
                <p className="text-gray-400 text-sm">No offers available</p>
              ) : (
                <div className="space-y-2">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {offer.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {offer.type} • {offer.status}
                        </p>
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        ${offer.value.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Subscribed Lists
              </h3>
              {lists.length === 0 ? (
                <p className="text-gray-400 text-sm">No subscriptions found</p>
              ) : (
                <div className="space-y-2">
                  {lists.map((list) => (
                    <div
                      key={list.id}
                      className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-lg text-sm"
                    >
                      <span className="text-gray-900 font-medium">
                        {list.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {list.status === "active" ? "Active" : "Unsubscribed"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
