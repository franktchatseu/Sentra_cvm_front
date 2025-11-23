import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Mail, MessageSquare, ArrowLeft } from "lucide-react";
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
  Legend,
} from "recharts";
import { colors } from "../../../shared/utils/tokens";
import type {
  CustomerSearchResultsResponse,
  CustomerRow,
} from "../types/ReportsAPI";

// Extract types from API response type
type CustomerSegment = CustomerSearchResultsResponse["segments"][number];
type CustomerOffer = CustomerSearchResultsResponse["offers"][number];
type CustomerEvent = CustomerSearchResultsResponse["events"][number];
type SubscribedList = CustomerSearchResultsResponse["subscribedLists"][number];

// Generate realistic related data based on customer
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

  // Generate events based on customer activity - across MULTIPLE channels
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
          title: i % 2 === 0 ? "Order Update" : "Promotional SMS",
          description:
            i % 2 === 0
              ? "Your order has been shipped"
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

// Removed unused getDateConstraints function

export default function CustomerSearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const customer = location.state?.customer as CustomerRow | undefined;

  type TabType = "overview" | "activity" | "engagement" | "marketing";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Customer Data
          </h1>
          <button
            onClick={() => navigate("/dashboard/reports/customer-profiles")}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Customer Reports
          </button>
        </div>
      </div>
    );
  }

  const email = `${customer.name
    .toLowerCase()
    .replace(/\s+/g, ".")}@example.com`;
  const phone = `+254${Math.floor(Math.random() * 900000000 + 100000000)}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Minimal Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <button
            onClick={() => navigate("/dashboard/reports/customer-profiles")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Clean Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {customer.name}
              </h1>
              <p className="text-gray-500 mt-2 text-lg">{customer.id}</p>
            </div>
            <div
              className={`px-6 py-3 rounded-full text-sm font-semibold ${
                customer.churnRisk < 30
                  ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                  : customer.churnRisk < 60
                  ? "bg-amber-50 text-amber-700 border-2 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-2 border-rose-200"
              }`}
            >
              {customer.churnRisk < 30
                ? "Active"
                : customer.churnRisk < 60
                ? "At Risk"
                : "High Risk"}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Lifetime Value
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ${(customer.lifetimeValue / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Orders
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {customer.orders}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Avg Order
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ${customer.aov.toFixed(0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Engagement
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {customer.engagementScore}
              </p>
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-3 gap-12">
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-gray-900 font-medium">{email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="text-gray-900 font-medium">{phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="text-gray-900 font-medium">{customer.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Segment</p>
              <p className="text-gray-900 font-medium">{customer.segment}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Channel</p>
              <p className="text-gray-900 font-medium">
                {customer.preferredChannel}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Last Purchase</p>
              <p className="text-gray-900 font-medium">
                {customer.lastPurchase}
              </p>
            </div>
          </div>
        </div>

        {/* Minimal Tabs */}
        <div className="mb-8">
          <div className="flex gap-8 border-b border-gray-200">
            {(
              [
                { id: "overview" as const, label: "Overview" },
                { id: "activity" as const, label: "Activity" },
                { id: "engagement" as const, label: "Analytics" },
                { id: "marketing" as const, label: "Marketing" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 font-medium text-sm transition-colors relative ${
                  activeTab === tab.id
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">
                Recent Activity
              </h2>
              <div className="space-y-6">
                {filteredEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {event.type === "email" && (
                        <Mail className="h-5 w-5 text-gray-600" />
                      )}
                      {event.type === "sms" && (
                        <MessageSquare className="h-5 w-5 text-gray-600" />
                      )}
                      {event.type === "push" && (
                        <div className="h-5 w-5 rounded-full bg-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {event.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <p className="text-sm text-gray-500 mb-2">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">
                  {events.length}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <p className="text-sm text-gray-500 mb-2">Segments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {segments.length}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <p className="text-sm text-gray-500 mb-2">Active Lists</p>
                <p className="text-3xl font-bold text-gray-900">
                  {lists.filter((l) => l.status === "active").length}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10">
            <div className="flex gap-3 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={eventSearchTerm}
                  onChange={(e) => setEventSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="px-6 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
            </div>

            <div className="space-y-8">
              {filteredEvents.length === 0 ? (
                <p className="text-center text-gray-500 py-16">
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
                        <h3 className="text-sm font-semibold text-gray-900 mb-6 mt-10 first:mt-0">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </h3>
                      )}
                      <div className="flex items-start gap-4 pl-8 border-l-2 border-gray-200 hover:border-gray-900 transition-colors py-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 -ml-[21px]">
                          {event.type === "email" && (
                            <Mail className="h-4 w-4 text-gray-600" />
                          )}
                          {event.type === "sms" && (
                            <MessageSquare className="h-4 w-4 text-gray-600" />
                          )}
                          {event.type === "push" && (
                            <div className="h-4 w-4 rounded-full bg-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {event.title}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {event.description}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400 ml-4">
                              {new Date(event.date).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "engagement" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-8">
                Distribution
              </h3>
              {eventDistributionData.length === 0 ? (
                <p className="text-center text-gray-500 py-16">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label
                      outerRadius={90}
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
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-8">
                Timeline
              </h3>
              {activityTimelineData.length === 0 ? (
                <p className="text-center text-gray-500 py-16">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar
                      dataKey="events"
                      fill={colors.reportCharts.palette.color1}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {activeTab === "marketing" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Segments
              </h2>
              <div className="flex flex-wrap gap-3">
                {segments.map((segment) => (
                  <span
                    key={segment.id}
                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {segment.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">
                Offers
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-8 border border-gray-200 rounded-2xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <p className="font-semibold text-gray-900 text-lg">
                        {offer.name}
                      </p>
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-medium ${
                          offer.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {offer.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{offer.type}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${offer.value.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">
                Lists
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className="p-8 border border-gray-200 rounded-2xl"
                  >
                    <p className="font-medium text-gray-900 text-lg mb-2">
                      {list.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {list.subscribedDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
