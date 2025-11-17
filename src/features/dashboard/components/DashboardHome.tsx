const parseMetricValue = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

type RecentCampaign = {
  id: number;
  name: string;
  status: string;
  statusDisplay: string;
  objective: string;
  performance?: {
    response: number;
    delivered: number;
    converted: number;
  };
  created_at?: string;
};

import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ArrowRight,
  Users,
  Target,
  Package,
  Folder,
  ShoppingBag,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { tw, color } from "../../../shared/utils/utils";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { offerService } from "../../offers/services/offerService";
import { segmentService } from "../../segments/services/segmentService";
import { productService } from "../../products/services/productService";
import { campaignService } from "../../campaigns/services/campaignService";
// import { buildApiUrl } from "../../../shared/services/api";
import type {
  CampaignStatus,
  CampaignStatsSummary,
  BackendCampaignType,
} from "../../campaigns/types/campaign";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import CategoryDistributionChart, {
  CategoryView,
  CategoryChartPoint,
} from "./CategoryDistributionChart";

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const extractCampaignTotal = useCallback((response?: unknown): number => {
    if (!response || typeof response !== "object") return 0;
    const maybeError = response as { success?: boolean };
    if ("success" in maybeError && maybeError.success === false) {
      return 0;
    }

    const withPagination = response as {
      pagination?: { total?: number };
    };
    if (withPagination.pagination?.total != null) {
      return parseMetricValue(withPagination.pagination.total);
    }

    const withMeta = response as { meta?: { total?: number } };
    if (withMeta.meta?.total != null) {
      return parseMetricValue(withMeta.meta.total);
    }

    const withData = response as { data?: unknown[] };
    if (Array.isArray(withData.data)) {
      return withData.data.length;
    }

    return 0;
  }, []);

  // State for distributions
  const [offerTypeDistribution, setOfferTypeDistribution] = useState<
    Array<{
      name: string;
      value: number;
      color: string;
    }>
  >([]);
  const [offerDistributionLoading, setOfferDistributionLoading] =
    useState(true);

  // State for latest items filter
  const [latestItemsFilter, setLatestItemsFilter] = useState<
    "campaigns" | "offers" | "segments" | "products"
  >("campaigns");

  // State for dropdown (mobile)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => setIsFilterDropdownOpen(false));

  // State for latest items data
  const [recentCampaigns, setRecentCampaigns] = useState<RecentCampaign[]>([]);
  const [recentOffers, setRecentOffers] = useState<
    Array<{
      id: number;
      name: string;
      status: string;
      type: string;
      created: string;
      created_at?: string;
    }>
  >([]);
  const [recentSegments, setRecentSegments] = useState<
    Array<{
      id: number;
      name: string;
      type: string;
      members: number;
      created: string;
      created_at?: string;
    }>
  >([]);
  const [recentProducts, setRecentProducts] = useState<
    Array<{
      id: number;
      name: string;
      code: string;
      status: string;
      created: string;
      created_at?: string;
    }>
  >([]);
  const [recentItemsLoading, setRecentItemsLoading] = useState(true);

  // State for stats
  const [offersStats, setOffersStats] = useState<{
    total: number;
    active: number;
    pendingApproval: number;
  } | null>(null);
  const [segmentsStats, setSegmentsStats] = useState<{
    total: number;
  } | null>(null);
  const [productsStats, setProductsStats] = useState<{
    total: number;
  } | null>(null);
  const [campaignsStats, setCampaignsStats] = useState<{
    total: number;
    active: number;
    completed: number;
  } | null>(null);
  const [campaignStatusDistribution, setCampaignStatusDistribution] = useState<
    Array<{ status: string; count: number; percentage: number; color: string }>
  >([]);

  const statusColorMap = useMemo<Record<string, string>>(
    () => ({
      draft: color.charts.campaigns.draft,
      pending_approval: color.charts.campaigns.pending,
      approved: color.charts.campaigns.completed,
      scheduled: color.charts.campaigns.pending,
      active: color.charts.campaigns.active,
      paused: color.charts.campaigns.paused,
      completed: color.charts.campaigns.completed,
      cancelled: color.charts.campaigns.pending,
      archived: color.charts.campaigns.draft,
      rejected: color.charts.campaigns.pending,
    }),
    []
  );

  const formatStatusLabel = useCallback((status: string) => {
    return status
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, []);

  // State for percentage changes
  const [percentageChanges, setPercentageChanges] = useState<{
    offers: number | null;
    segments: number | null;
    products: number | null;
    campaigns: number | null;
  }>({
    offers: null,
    segments: null,
    products: null,
    campaigns: null,
  });

  // State for segment type distribution
  const [segmentTypeDistribution, setSegmentTypeDistribution] = useState<
    Array<{
      type: string;
      count: number;
      percentage: number;
      color: string;
    }>
  >([]);
  const [categoryView, setCategoryView] = useState<CategoryView>("segments");
  const [categoryChartData, setCategoryChartData] = useState<
    CategoryChartPoint[]
  >([]);
  const [categoryChartLoading, setCategoryChartLoading] = useState(false);
  const parseCountValue = useCallback(
    (value: unknown): number => Math.max(0, parseMetricValue(value)),
    []
  );
  const categoryViewMeta = useMemo<
    Record<CategoryView, { title: string; subtitle: string }>
  >(
    () => ({
      segments: {
        title: "Segment Categories",
        subtitle: "Segment count per category",
      },
      offers: {
        title: "Offer Categories",
        subtitle: "Offer count per category",
      },
      campaigns: {
        title: "Campaign Categories",
        subtitle: "Category utilization",
      },
      products: {
        title: "Product Categories",
        subtitle: "Product count per category",
      },
    }),
    []
  );

  // State for top performing offers
  // const [topOffers, setTopOffers] = useState<
  //   Array<{
  //     id: number;
  //     name: string;
  //     status: string;
  //   }>
  // >([]);

  // Fetch Offer Type Distribution
  useEffect(() => {
    const fetchOfferTypeDistribution = async () => {
      try {
        setOfferDistributionLoading(true);
        const response = await offerService.getTypeDistribution();

        if (response.success && response.data) {
          const data = response.data;

          // Map API response to chart format using token colors
          const typeColorMap: Record<string, string> = {
            discount: color.charts.offers.discount,
            cashback: color.charts.offers.cashback,
            freeShipping: color.charts.offers.freeShipping,
            buyOneGetOne: color.charts.offers.buyOneGetOne,
            voucher: color.charts.offers.voucher,
            data: color.charts.offers.discount, // Fallback color
            voice: color.charts.offers.cashback,
            sms: color.charts.offers.freeShipping,
            combo: color.charts.offers.buyOneGetOne,
            loyalty: color.charts.offers.voucher,
            bundle: color.charts.offers.discount,
            bonus: color.charts.offers.cashback,
          };

          // Handle array format: [{ offer_type: "data", count: "5" }]
          let chartData: Array<{ name: string; value: number; color: string }> =
            [];

          if (Array.isArray(data)) {
            chartData = data
              .filter((item: { count?: string }) => {
                const count = parseInt(item.count || "0", 10);
                return count > 0;
              })
              .map((item: { offer_type?: string; count?: string }) => {
                const offerType = (item.offer_type || "").toLowerCase();
                const count = parseInt(item.count || "0", 10);
                return {
                  name: offerType.charAt(0).toUpperCase() + offerType.slice(1),
                  value: count,
                  color:
                    typeColorMap[offerType] || color.charts.offers.discount,
                };
              });
          } else {
            // Fallback: Handle object format if API changes
            chartData = Object.entries(data)
              .filter(([, value]) => {
                const numValue =
                  typeof value === "number"
                    ? value
                    : parseInt(String(value), 10);
                return numValue > 0;
              })
              .map(([type, value]) => {
                const numValue =
                  typeof value === "number"
                    ? value
                    : parseInt(String(value), 10);
                return {
                  name: type.charAt(0).toUpperCase() + type.slice(1),
                  value: numValue,
                  color:
                    typeColorMap[type.toLowerCase()] ||
                    color.charts.offers.discount,
                };
              });
          }

          setOfferTypeDistribution(chartData.length > 0 ? chartData : []);
        } else {
          setOfferTypeDistribution([]);
        }
      } catch {
        // Fallback to empty state
        setOfferTypeDistribution([]);
      } finally {
        setOfferDistributionLoading(false);
      }
    };

    fetchOfferTypeDistribution();
  }, []);

  // Fetch stats for offers, segments, and products
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch offers stats - try getStats first, fallback to searchOffers for total count
        const offersResponse = await offerService.getStats();
        const parseMetric = (value: unknown): number => {
          if (typeof value === "number") return value;
          if (typeof value === "string") {
            const parsed = parseInt(value, 10);
            return Number.isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        };

        let total = 0;
        let active = 0;
        let pendingApproval = 0;

        if (offersResponse.success && offersResponse.data) {
          const data = offersResponse.data as Record<string, unknown>;
          total = parseMetric(
            data.totalOffers ?? data.total_offers ?? data.total
          );
          active = parseMetric(
            data.activeOffers ?? data.active_offers ?? data.active
          );
          // Use in_draft as the pending approval count (offers awaiting review)
          pendingApproval = parseMetric(
            data.in_draft ?? data.inDraft ?? data.draft
          );
        }

        // If stats don't have total, get from pagination
        if (total === 0) {
          const offersList = await offerService.searchOffers({ limit: 1 });
          if (offersList.pagination?.total !== undefined) {
            total = offersList.pagination.total;
          }
        }

        setOffersStats({ total, active, pendingApproval });
      } catch {
        // Final fallback: try to get total from pagination
        try {
          const offersList = await offerService.searchOffers({ limit: 1 });
          if (offersList.pagination?.total !== undefined) {
            setOffersStats({
              total: offersList.pagination.total,
              active: 0,
              pendingApproval: 0,
            });
          } else {
            setOffersStats({ total: 0, active: 0, pendingApproval: 0 });
          }
        } catch {
          setOffersStats({ total: 0, active: 0, pendingApproval: 0 });
        }
      }

      try {
        // Fetch segments stats - use getSegmentStats
        const segmentsResponse = await segmentService.getSegmentStats();
        if (segmentsResponse.success && segmentsResponse.data) {
          const data = segmentsResponse.data as Record<string, unknown>;
          const total =
            (typeof data.total_segments === "number"
              ? data.total_segments
              : typeof data.total_segments === "string"
              ? parseInt(data.total_segments, 10)
              : 0) ||
            (typeof data.total === "number"
              ? data.total
              : typeof data.total === "string"
              ? parseInt(data.total, 10)
              : 0) ||
            0;
          setSegmentsStats({ total });
        } else {
          setSegmentsStats({ total: 0 });
        }
      } catch {
        setSegmentsStats({ total: 0 });
      }

      try {
        // Fetch products stats
        const productsResponse = await productService.getStats();
        if (productsResponse.success && productsResponse.data) {
          setProductsStats({
            total: productsResponse.data.total_products || 0,
          });
        }
      } catch {
        setProductsStats({ total: 0 });
      }

      try {
        const campaignsStatsResponse = await campaignService.getCampaignStats(
          true
        );

        if (campaignsStatsResponse.success && campaignsStatsResponse.data) {
          const statsData = campaignsStatsResponse.data as CampaignStatsSummary;
          const total = parseMetricValue(statsData.total_campaigns);
          const active = parseMetricValue(
            statsData.active_campaigns ?? statsData.currently_active
          );
          const completed = parseMetricValue(statsData.completed);

          setCampaignsStats({ total, active, completed });

          const initialStatusCounts: Record<string, number> = {
            draft: parseMetricValue(statsData.in_draft ?? 0),
            pending_approval: parseMetricValue(statsData.pending_approval ?? 0),
            active,
            completed: parseMetricValue(statsData.completed ?? 0),
            archived: parseMetricValue(statsData.archived ?? 0),
            rejected: parseMetricValue(statsData.rejected ?? 0),
          };

          const supplementaryStatuses: CampaignStatus[] = [
            "paused",
            "cancelled",
          ];

          const supplementary = await Promise.all(
            supplementaryStatuses.map(async (status) => {
              try {
                const response = await campaignService.getCampaignsByStatus(
                  status,
                  {
                    limit: 1,
                    skipCache: true,
                  }
                );
                return {
                  status,
                  count: extractCampaignTotal(response),
                };
              } catch {
                return { status, count: 0 };
              }
            })
          );

          supplementary.forEach(({ status, count }) => {
            if (count > 0) {
              initialStatusCounts[status] =
                (initialStatusCounts[status] ?? 0) + count;
            }
          });

          const statusEntries = Object.entries(initialStatusCounts).filter(
            ([, count]) => count > 0
          );

          const totalForDistribution =
            statusEntries.reduce((sum, [, count]) => sum + count, 0) || total;

          setCampaignStatusDistribution(
            statusEntries.map(([statusKey, count]) => ({
              status: formatStatusLabel(statusKey),
              count,
              percentage:
                totalForDistribution > 0
                  ? (count / totalForDistribution) * 100
                  : 0,
              color:
                statusColorMap[statusKey] ?? color.charts.campaigns.pending,
            }))
          );
        }
      } catch {
        // Error fetching campaign stats
      }
    };

    fetchStats();
  }, [extractCampaignTotal, formatStatusLabel, statusColorMap]);

  // Fetch latest items (offers, segments, products)
  useEffect(() => {
    const fetchLatestItems = async () => {
      setRecentItemsLoading(true);
      try {
        // Fetch latest offers
        const offersResponse = await offerService.searchOffers({ limit: 3 });
        if (
          offersResponse.success &&
          offersResponse.data &&
          offersResponse.data.length > 0
        ) {
          const formattedOffers = offersResponse.data
            .slice(0, 3)
            .map(
              (offer: {
                id: number;
                name: string;
                status?: string;
                offer_type?: string;
                created_at?: string;
              }) => {
                return {
                  id: offer.id,
                  name: offer.name,
                  status: offer.status?.toLowerCase() || "draft",
                  type: offer.offer_type || "Unknown",
                  created: offer.created_at
                    ? new Date(offer.created_at).toLocaleDateString()
                    : "Unknown",
                  created_at: offer.created_at,
                };
              }
            );
          setRecentOffers(formattedOffers);
        } else {
          setRecentOffers([]);
        }
      } catch {
        // Error fetching offers
        setRecentOffers([]);
      }

      try {
        // Fetch latest segments
        const segmentsResponse = await segmentService.getSegments({});
        if (
          segmentsResponse.data &&
          Array.isArray(segmentsResponse.data) &&
          segmentsResponse.data.length > 0
        ) {
          const formattedSegments = segmentsResponse.data
            .slice(0, 3)
            .map(
              (segment: {
                id: number;
                name: string;
                type?: string;
                size_estimate?: number | null;
                created_at?: string;
              }) => {
                return {
                  id: segment.id,
                  name: segment.name,
                  type: segment.type || "Unknown",
                  members: segment.size_estimate ?? 0,
                  created: segment.created_at
                    ? new Date(segment.created_at).toLocaleDateString()
                    : "Unknown",
                  created_at: segment.created_at,
                };
              }
            );
          setRecentSegments(formattedSegments);
        } else {
          setRecentSegments([]);
        }
      } catch {
        // Error fetching segments
        setRecentSegments([]);
      }

      try {
        // Fetch latest products
        const productsResponse = await productService.getAllProducts({
          limit: 3,
        });
        if (
          productsResponse.data &&
          Array.isArray(productsResponse.data) &&
          productsResponse.data.length > 0
        ) {
          const formattedProducts = productsResponse.data
            .slice(0, 3)
            .map(
              (product: {
                id: number;
                name: string;
                product_code?: string;
                is_active?: boolean;
                created_at?: string;
              }) => {
                return {
                  id: product.id,
                  name: product.name,
                  code: product.product_code || "N/A",
                  status: product.is_active ? "active" : "inactive",
                  created: product.created_at
                    ? new Date(product.created_at).toLocaleDateString()
                    : "Unknown",
                  created_at: product.created_at,
                };
              }
            );
          setRecentProducts(formattedProducts);
        } else {
          setRecentProducts([]);
        }
      } catch {
        setRecentProducts([]);
      }

      try {
        // Fetch latest campaigns
        const campaignsResponse = await campaignService.getCampaigns({
          limit: 3,
          skipCache: true,
        });
        if (
          campaignsResponse.success &&
          campaignsResponse.data &&
          campaignsResponse.data.length > 0
        ) {
          const formattedCampaigns = campaignsResponse.data
            .slice(0, 3)
            .map((campaign: BackendCampaignType) => {
              const participants = parseMetricValue(
                campaign.current_participants ?? 0
              );
              // Extract objective from campaign
              const objective = campaign.objective || "N/A";

              return {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                statusDisplay: formatStatusLabel(campaign.status),
                objective,
                performance: {
                  response: participants,
                  delivered: participants,
                  converted: Math.floor(participants * 0.15),
                },
                created_at: campaign.created_at ?? undefined,
              };
            });
          setRecentCampaigns(formattedCampaigns);
        } else {
          setRecentCampaigns([]);
        }
      } catch {
        setRecentCampaigns([]);
      } finally {
        setRecentItemsLoading(false);
      }
    };

    fetchLatestItems();
  }, [formatStatusLabel]);

  // Fetch Top Performing Offers
  // useEffect(() => {
  //   const fetchTopOffers = async () => {
  //     try {
  //       // Fetch active offers, then sort by most recently created/updated
  //       const response = await offerService.getActiveOffers({ limit: 20 });
  //       if (
  //         response.data &&
  //         Array.isArray(response.data) &&
  //         response.data.length > 0
  //       ) {
  //         // Sort by created_at (newest first) to show most recently active offers
  //         const sortedOffers = [...response.data].sort((a: any, b: any) => {
  //           const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
  //           const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
  //           return dateB - dateA; // Newest first
  //         });

  //         // Take top 4 most recent active offers
  //         const offers = sortedOffers.slice(0, 4).map((offer: any) => ({
  //           id: offer.id,
  //           name: offer.name || offer.offer_name || "Unnamed Offer",
  //           status: offer.status || "Unknown",
  //           created_at: offer.created_at,
  //         }));
  //         setTopOffers(offers);
  //       } else {
  //         // Fallback to empty array
  //         setTopOffers([]);
  //       }
  //     } catch (error) {
  //       // On error, keep empty array
  //       setTopOffers([]);
  //     }
  //   };

  //   fetchTopOffers();
  // }, []);

  // Fetch Segment Type Distribution
  useEffect(() => {
    const fetchSegmentTypeDistribution = async () => {
      try {
        const response = await segmentService.getTypeDistribution();

        if (response.success && response.data) {
          const data = response.data;

          // Handle array format: [{ type: "dynamic", count: "1" }]
          let distribution: Array<{
            type: string;
            count: number;
            percentage: number;
            color: string;
          }> = [];

          if (Array.isArray(data)) {
            // Calculate total from array
            const total = data.reduce((sum, item) => {
              return sum + parseInt(item.count || "0", 10);
            }, 0);

            distribution = data
              .map((item) => {
                const segmentType = (item.type || "").toLowerCase();
                const count = parseInt(item.count || "0", 10);
                const percentage = total > 0 ? (count / total) * 100 : 0;

                // Map type to color
                const typeColorMap: Record<string, string> = {
                  dynamic: color.charts.segments.dynamic,
                  static: color.charts.segments.static,
                  trigger: color.charts.segments.trigger,
                  hybrid: color.charts.segments.hybrid,
                };

                return {
                  type:
                    segmentType.charAt(0).toUpperCase() + segmentType.slice(1),
                  count,
                  percentage,
                  color:
                    typeColorMap[segmentType] || color.charts.segments.dynamic,
                };
              })
              .filter((item) => item.count > 0);
          } else {
            // Fallback: Handle object format if API changes
            const total =
              data.total || data.dynamic + data.static + data.trigger || 0;

            distribution = [
              {
                type: "Dynamic",
                count: parseInt(String(data.dynamic || 0), 10),
                percentage:
                  total > 0
                    ? (parseInt(String(data.dynamic || 0), 10) / total) * 100
                    : 0,
                color: color.charts.segments.dynamic,
              },
              {
                type: "Static",
                count: parseInt(String(data.static || 0), 10),
                percentage:
                  total > 0
                    ? (parseInt(String(data.static || 0), 10) / total) * 100
                    : 0,
                color: color.charts.segments.static,
              },
              {
                type: "Trigger",
                count: parseInt(String(data.trigger || 0), 10),
                percentage:
                  total > 0
                    ? (parseInt(String(data.trigger || 0), 10) / total) * 100
                    : 0,
                color: color.charts.segments.trigger,
              },
            ].filter((item) => item.count > 0);
          }

          setSegmentTypeDistribution(distribution);
        } else {
          setSegmentTypeDistribution([]);
        }
      } catch {
        setSegmentTypeDistribution([]);
      }
    };

    fetchSegmentTypeDistribution();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchCategoryChartData = async () => {
      try {
        setCategoryChartLoading(true);
        let dataset: CategoryChartPoint[] = [];

        if (categoryView === "segments") {
          const response = await segmentService.getCategoryDistribution(true);
          if (response.success && response.data) {
            const raw = Array.isArray(response.data) ? response.data : [];
            dataset = raw
              .map((item, index) => ({
                label:
                  item.category_name ||
                  `Category ${item.category_id ?? index + 1}`,
                value: parseCountValue(item.segment_count ?? item.count ?? 0),
              }))
              .filter((item) => item.value > 0);
          }
        } else if (categoryView === "offers") {
          const response = await offerService.getCategoryPerformance(true);
          if (response.success && Array.isArray(response.data)) {
            dataset = response.data
              .map((item, index) => ({
                label: item.categoryName || `Category ${index + 1}`,
                value: parseCountValue(item.offerCount ?? 0),
              }))
              .filter((item) => item.value > 0);
          }
        } else if (categoryView === "products") {
          const response = await productService.getStats(true);
          if (response.success && response.data) {
            const raw = Array.isArray(response.data.products_by_category)
              ? response.data.products_by_category
              : [];
            dataset = raw
              .map((item, index) => ({
                label: item.category_name || `Category ${index + 1}`,
                value: parseCountValue(item.product_count),
              }))
              .filter((item) => item.value > 0);
          }
        } else if (categoryView === "campaigns") {
          const response = await campaignService.getCampaignCategoryStats(true);
          if (response.success && response.data) {
            const data = response.data as {
              categories_with_campaigns?: unknown;
              categories_without_campaigns?: unknown;
            };
            dataset = [
              {
                label: "With Campaigns",
                value: parseCountValue(data.categories_with_campaigns),
              },
              {
                label: "Without Campaigns",
                value: parseCountValue(data.categories_without_campaigns),
              },
            ].filter((item) => item.value > 0);
          }
        }

        if (isMounted) {
          setCategoryChartData(dataset);
        }
      } catch (error) {
        console.error("Failed to load category distribution:", error);
        if (isMounted) {
          setCategoryChartData([]);
        }
      } finally {
        if (isMounted) {
          setCategoryChartLoading(false);
        }
      }
    };

    fetchCategoryChartData();

    return () => {
      isMounted = false;
    };
  }, [categoryView, parseCountValue]);

  // Calculate percentage changes (vs last month)
  useEffect(() => {
    const calculatePercentageChanges = async () => {
      try {
        // Calculate date ranges for current month vs previous month
        const now = new Date();
        const currentMonthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        const currentMonthEnd = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        const previousMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const previousMonthEnd = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999
        );

        // Calculate Offers percentage change using date range
        try {
          const currentOffers = await offerService.getOffersByDateRange({
            startDate: currentMonthStart.toISOString(),
            endDate: currentMonthEnd.toISOString(),
            limit: 1,
          });
          const previousOffers = await offerService.getOffersByDateRange({
            startDate: previousMonthStart.toISOString(),
            endDate: previousMonthEnd.toISOString(),
            limit: 1,
          });

          const currentCount = currentOffers.pagination?.total || 0;
          const previousCount = previousOffers.pagination?.total || 0;

          const offersChange =
            previousCount > 0
              ? ((currentCount - previousCount) / previousCount) * 100
              : currentCount > 0
              ? 100
              : 0;

          setPercentageChanges((prev) => ({
            ...prev,
            offers: offersChange,
          }));
        } catch {
          // Error calculating offers change
        }

        // Calculate Campaigns percentage change using date range
        // This endpoint is used to get campaign counts for current vs previous month
        // to calculate the percentage change shown in the "Total Campaigns" stat card
        try {
          const currentCampaigns =
            await campaignService.getCampaignsByDateRange({
              startDate: currentMonthStart.toISOString(),
              endDate: currentMonthEnd.toISOString(),
              limit: 1,
              offset: 0,
              skipCache: true,
            });

          const previousCampaigns =
            await campaignService.getCampaignsByDateRange({
              startDate: previousMonthStart.toISOString(),
              endDate: previousMonthEnd.toISOString(),
              limit: 1,
              offset: 0,
              skipCache: true,
            });

          const currentCount = extractCampaignTotal(currentCampaigns);
          const previousCount = extractCampaignTotal(previousCampaigns);

          const campaignsChange =
            previousCount > 0
              ? ((currentCount - previousCount) / previousCount) * 100
              : currentCount > 0
              ? 100
              : 0;

          setPercentageChanges((prev) => ({
            ...prev,
            campaigns: campaignsChange,
          }));
        } catch {
          // Error calculating campaigns percentage change
        }

        // Calculate Segments percentage change using date-based filtering
        // Get all segments and filter by created_at date
        try {
          // Get all segments (we'll filter by created_at client-side)
          const allSegments = await segmentService.getSegments({});

          if (allSegments.data && Array.isArray(allSegments.data)) {
            const currentMonthSegments = allSegments.data.filter((segment) => {
              if (!segment.created_at) return false;
              const createdDate = new Date(segment.created_at);
              return (
                createdDate >= currentMonthStart &&
                createdDate <= currentMonthEnd
              );
            });

            const previousMonthSegments = allSegments.data.filter((segment) => {
              if (!segment.created_at) return false;
              const createdDate = new Date(segment.created_at);
              return (
                createdDate >= previousMonthStart &&
                createdDate <= previousMonthEnd
              );
            });

            const currentCount = currentMonthSegments.length;
            const previousCount = previousMonthSegments.length;

            const segmentsChange =
              previousCount > 0
                ? ((currentCount - previousCount) / previousCount) * 100
                : currentCount > 0
                ? 100
                : 0;

            setPercentageChanges((prev) => ({
              ...prev,
              segments: segmentsChange,
            }));
          }
        } catch {
          // Error calculating segments change
        }

        // Calculate Products percentage change using date-based filtering
        // Get all products and filter by created_at date
        try {
          // Get all products (we'll filter by created_at client-side)
          const allProducts = await productService.getAllProducts({
            limit: 1000,
          });

          if (allProducts.data && Array.isArray(allProducts.data)) {
            const currentMonthProducts = allProducts.data.filter((product) => {
              if (!product.created_at) return false;
              const createdDate = new Date(product.created_at);
              return (
                createdDate >= currentMonthStart &&
                createdDate <= currentMonthEnd
              );
            });

            const previousMonthProducts = allProducts.data.filter((product) => {
              if (!product.created_at) return false;
              const createdDate = new Date(product.created_at);
              return (
                createdDate >= previousMonthStart &&
                createdDate <= previousMonthEnd
              );
            });

            const currentCount = currentMonthProducts.length;
            const previousCount = previousMonthProducts.length;

            const productsChange =
              previousCount > 0
                ? ((currentCount - previousCount) / previousCount) * 100
                : currentCount > 0
                ? 100
                : 0;

            setPercentageChanges((prev) => ({
              ...prev,
              products: productsChange,
            }));
          }
        } catch {
          // Error calculating segments change
        }
      } catch {
        // Error calculating percentage changes
      }
    };

    // Only calculate if we have current stats
    if (
      offersStats !== null ||
      segmentsStats !== null ||
      productsStats !== null ||
      campaignsStats !== null
    ) {
      calculatePercentageChanges();
    }
  }, [
    offersStats,
    segmentsStats,
    productsStats,
    campaignsStats,
    extractCampaignTotal,
  ]);

  // Calculate conversion rate from campaign stats
  const conversionRate = useMemo(() => {
    if (!campaignsStats || campaignsStats.total === 0) return null;
    return (campaignsStats.completed / campaignsStats.total) * 100;
  }, [campaignsStats]);

  // Stats data - using real data from API
  const stats = [
    {
      name: "Total Campaigns",
      value: campaignsStats?.total?.toLocaleString() ?? "",
      change:
        percentageChanges.campaigns !== null
          ? `${
              percentageChanges.campaigns >= 0 ? "+" : ""
            }${percentageChanges.campaigns.toFixed(1)}%`
          : "N/A",
      changeType:
        percentageChanges.campaigns !== null
          ? percentageChanges.campaigns >= 0
            ? "positive"
            : "negative"
          : "positive",
      icon: Target,
    },
    {
      name: "Total Offers",
      value: offersStats?.total?.toLocaleString() || "0",
      change:
        percentageChanges.offers !== null
          ? `${
              percentageChanges.offers >= 0 ? "+" : ""
            }${percentageChanges.offers.toFixed(1)}%`
          : "N/A",
      changeType:
        percentageChanges.offers !== null
          ? percentageChanges.offers >= 0
            ? "positive"
            : "negative"
          : "positive",
      icon: Package,
    },
    {
      name: "Total Segments",
      value: segmentsStats?.total?.toLocaleString() || "0",
      change:
        percentageChanges.segments !== null
          ? `${
              percentageChanges.segments >= 0 ? "+" : ""
            }${percentageChanges.segments.toFixed(1)}%`
          : "N/A",
      changeType:
        percentageChanges.segments !== null
          ? percentageChanges.segments >= 0
            ? "positive"
            : "negative"
          : "positive",
      icon: Users,
    },
    {
      name: "Total Products",
      value: productsStats?.total?.toLocaleString() || "0",
      change:
        percentageChanges.products !== null
          ? `${
              percentageChanges.products >= 0 ? "+" : ""
            }${percentageChanges.products.toFixed(1)}%`
          : "N/A",
      changeType:
        percentageChanges.products !== null
          ? percentageChanges.products >= 0
            ? "positive"
            : "negative"
          : "positive",
      icon: ShoppingBag,
    },
    {
      name: "Conversion Rate",
      value: conversionRate !== null ? `${conversionRate.toFixed(1)}%` : "",
      change: "N/A",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  const quickInsights = useMemo(() => {
    const pendingApprovalCount = offersStats?.pendingApproval ?? 0;
    const productTotal = productsStats?.total ?? 0;
    const activeCampaignsCount = campaignsStats?.active ?? 0;
    const pendingApprovalCampaigns =
      campaignStatusDistribution.find(
        (item) => item.status === formatStatusLabel("pending_approval")
      )?.count ?? 0;

    return [
      {
        label: "Offers in draft",
        value: pendingApprovalCount.toLocaleString(),
        description:
          pendingApprovalCount > 0
            ? "Draft offers ready for review and activation"
            : "All offers are published or archived",
        icon: Clock,
        valueColor: color.primary.accent,
      },
      {
        label: "Active campaigns",
        value: activeCampaignsCount.toLocaleString(),
        description:
          activeCampaignsCount > 0
            ? "Currently running customer engagement campaigns"
            : "No campaigns are running right now",
        icon: Target,
        valueColor: color.primary.accent,
      },
      {
        label: "Pending approvals",
        value: pendingApprovalCampaigns.toLocaleString(),
        description:
          pendingApprovalCampaigns > 0
            ? "Campaigns awaiting approval decisions"
            : "No campaigns are pending approval",
        icon: Users,
        valueColor: color.primary.accent,
      },
      {
        label: "Product catalog",
        value: productTotal.toLocaleString(),
        description:
          productTotal > 0
            ? `Total products ready for offer creation`
            : "No products synced yet",
        icon: Package,
        valueColor: color.primary.accent,
      },
    ];
  }, [
    offersStats,
    productsStats,
    campaignsStats,
    campaignStatusDistribution,
    formatStatusLabel,
  ]);

  // CVM-relevant metrics: Top Performing Campaigns
  const topCampaigns = [
    {
      id: 1,
      name: "Q2 Customer Acquisition",
      conversionRate: "12.5%",
      status: "Active",
    },
    {
      id: 2,
      name: "Premium Member Retention",
      conversionRate: "9.8%",
      status: "Active",
    },
    {
      id: 3,
      name: "Spring Promotion Campaign",
      conversionRate: "8.2%",
      status: "Active",
    },
    {
      id: 4,
      name: "New Product Launch",
      conversionRate: "6.5%",
      status: "Active",
    },
  ];

  // Dummy data for top performing offers
  const topOffers = [
    {
      id: 1,
      name: "20% Discount - Premium",
      acceptanceRate: "68%",
      engagement: "12,450",
      status: "Active",
    },
    {
      id: 2,
      name: "Cashback Offer Q1",
      acceptanceRate: "54%",
      engagement: "9,820",
      status: "Active",
    },
    {
      id: 3,
      name: "Free Shipping Promo",
      acceptanceRate: "48%",
      engagement: "7,650",
      status: "Active",
    },
    {
      id: 4,
      name: "Buy One Get One",
      acceptanceRate: "42%",
      engagement: "6,230",
      status: "Active",
    },
  ];

  // CVM-relevant: Items requiring attention
  const requiresAttention = [
    {
      id: 1,
      title: "Campaign Expiring Soon",
      description: "Q2 Customer Acquisition ends in 3 days",
      type: "campaign",
      action: "Review & Extend",
      priority: "high",
    },
    {
      id: 2,
      title: "Offer Expiring",
      description: "Spring Sale - 20% Off expires tomorrow",
      type: "offer",
      action: "Review",
      priority: "high",
    },
    {
      id: 3,
      title: "Pending Approval",
      description: "Premium Member Campaign awaiting approval",
      type: "approval",
      action: "Approve",
      priority: "medium",
    },
    {
      id: 4,
      title: "Segment Update Needed",
      description: "High Value Customers segment requires refresh",
      type: "segment",
      action: "Update",
      priority: "medium",
    },
  ];

  const quickActions = [
    {
      name: "Create Campaign",
      href: "/dashboard/campaigns/create",
      icon: Target,
    },
    { name: "New Offer", href: "/dashboard/offers/create", icon: Package },
    { name: "Build Segment", href: "/dashboard/segments", icon: Users },
    {
      name: "Create Product",
      href: "/dashboard/products/create",
      icon: ShoppingBag,
    },
    { name: "Configuration", href: "/dashboard/configuration", icon: Folder },
  ];

  const getFirstName = () => {
    if (
      user &&
      "email" in user &&
      user.email &&
      typeof user.email === "string"
    ) {
      const emailName = user.email.split("@")[0];
      const nameWithoutNumbers = emailName.replace(/\d+/g, "");
      return (
        nameWithoutNumbers.charAt(0).toUpperCase() +
        nameWithoutNumbers.slice(1).toLowerCase()
      );
    }
    return "user";
  };

  // Helper function to convert hex to rgba
  // const hexToRgba = (hex: string, alpha: number) => {
  //   const r = parseInt(hex.slice(1, 3), 16);
  //   const g = parseInt(hex.slice(3, 5), 16);
  //   const b = parseInt(hex.slice(5, 7), 16);
  //   return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  // };

  const getStatusColor = (status: string) => {
    // Map status to standard Tailwind color classes
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "paused":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1
          className={`${tw.mainHeading} ${tw.textPrimary} flex items-center gap-3`}
        >
          Welcome back, {getFirstName()}
          <span className="text-3xl">👋</span>
        </h1>
        <p className={`${tw.textSecondary} ${tw.body}`}>
          Here's what's happening with your campaigns today. Your performance is
          looking great!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="group bg-white rounded-2xl border border-gray-200 p-6 relative overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: color.primary.accent,
                      }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-3xl font-bold ${tw.textPrimary}`}>
                        {stat.value}
                      </p>
                      <p className={`${tw.cardSubHeading} ${tw.textSecondary}`}>
                        {stat.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      stat.changeType === "positive"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {stat.changeType === "positive" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                  <span className={`text-xs ${tw.textMuted}`}>
                    vs last month
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick insights */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Insights
            </h2>
            <p className={`${tw.textSecondary} text-sm`}>
              Instant highlights from offers, segments, products, and campaigns.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickInsights.map((insight) => {
            const InsightIcon = insight.icon;
            return (
              <div
                key={insight.label}
                className="rounded-xl border border-gray-200 p-5 transition-colors flex flex-col gap-4"
                style={{ backgroundColor: color.surface.background }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-white shadow-sm">
                    <InsightIcon className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-black font-medium mb-1">
                      {insight.label}
                    </p>
                    <p
                      className={`text-base font-semibold leading-tight ${
                        insight.valueColor ? "" : "text-gray-900"
                      }`}
                      style={
                        insight.valueColor
                          ? { color: insight.valueColor }
                          : undefined
                      }
                    >
                      {insight.value}
                    </p>
                  </div>
                </div>
                <p className={`${tw.textSecondary} text-xs leading-relaxed`}>
                  {insight.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Added and Quick Actions - Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recently Added - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className={tw.cardHeading}>Recently Added</h2>
                  <p className={`${tw.cardSubHeading} text-black mt-1`}>
                    Newly created campaigns, offers, segments, and products
                  </p>
                </div>

                {/* Filter Dropdown - Mobile/Tablet */}
                <div
                  className="xl:hidden relative w-full sm:w-auto"
                  ref={dropdownRef}
                >
                  <button
                    onClick={() =>
                      setIsFilterDropdownOpen(!isFilterDropdownOpen)
                    }
                    className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all border border-gray-200"
                  >
                    <span>
                      {[
                        { key: "campaigns", label: "Campaigns" },
                        { key: "offers", label: "Offers" },
                        { key: "segments", label: "Segments" },
                        { key: "products", label: "Products" },
                      ].find((tab) => tab.key === latestItemsFilter)?.label ||
                        "Campaigns"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isFilterDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isFilterDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {[
                        { key: "campaigns", label: "Campaigns" },
                        { key: "offers", label: "Offers" },
                        { key: "segments", label: "Segments" },
                        { key: "products", label: "Products" },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => {
                            setLatestItemsFilter(
                              tab.key as
                                | "campaigns"
                                | "offers"
                                | "segments"
                                | "products"
                            );
                            setIsFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                            latestItemsFilter === tab.key
                              ? "bg-gray-900 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          } ${
                            tab.key !== "products"
                              ? "border-b border-gray-100"
                              : ""
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filter Tabs - Desktop (xl and above) */}
                <div className="hidden xl:flex gap-2">
                  {[
                    { key: "campaigns", label: "Campaigns" },
                    { key: "offers", label: "Offers" },
                    { key: "segments", label: "Segments" },
                    { key: "products", label: "Products" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() =>
                        setLatestItemsFilter(
                          tab.key as
                            | "campaigns"
                            | "offers"
                            | "segments"
                            | "products"
                        )
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        latestItemsFilter === tab.key
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* Loading State */}
                {recentItemsLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                    <span className="ml-3 text-sm text-gray-500">
                      Loading {latestItemsFilter}...
                    </span>
                  </div>
                )}

                {/* Campaigns */}
                {!recentItemsLoading &&
                  latestItemsFilter === "campaigns" &&
                  recentCampaigns.slice(0, 3).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center gap-4 p-5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all group"
                      style={{ backgroundColor: color.surface.background }}
                      onClick={() =>
                        navigate(`/dashboard/campaigns/${campaign.id}`)
                      }
                    >
                      <div
                        className="p-2 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: color.primary.accent,
                        }}
                      >
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base text-gray-900 truncate">
                            {campaign.name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold border flex-shrink-0 ${getStatusColor(
                              campaign.status
                            )}`}
                          >
                            {campaign.statusDisplay}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-black">
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {campaign.objective}
                          </span>
                          {campaign.performance && (
                            <>
                              <span>•</span>
                              <span>
                                {campaign.performance.converted.toLocaleString()}{" "}
                                converted
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    </div>
                  ))}

                {/* Offers */}
                {!recentItemsLoading &&
                  latestItemsFilter === "offers" &&
                  recentOffers.slice(0, 3).map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-center gap-4 p-5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all group"
                      style={{ backgroundColor: color.surface.background }}
                      onClick={() => navigate(`/dashboard/offers/${offer.id}`)}
                    >
                      <div
                        className="p-2 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: color.primary.accent,
                        }}
                      >
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base text-gray-900 truncate">
                            {offer.name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold border flex-shrink-0 ${getStatusColor(
                              offer.status
                            )}`}
                          >
                            {offer.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-black">
                          <span>{offer.type}</span>
                          <span>•</span>
                          <span>{offer.created}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    </div>
                  ))}

                {/* Segments */}
                {!recentItemsLoading &&
                  latestItemsFilter === "segments" &&
                  recentSegments.slice(0, 3).map((segment) => (
                    <div
                      key={segment.id}
                      className="flex items-center gap-4 p-5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all group"
                      style={{ backgroundColor: color.surface.background }}
                      onClick={() =>
                        navigate(`/dashboard/segments/${segment.id}`)
                      }
                    >
                      <div
                        className="p-2 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: color.primary.accent,
                        }}
                      >
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base text-gray-900 truncate">
                            {segment.name}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 flex-shrink-0">
                            {segment.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-black">
                          <span>
                            {segment.members.toLocaleString()} members
                          </span>
                          <span>•</span>
                          <span>{segment.created}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    </div>
                  ))}

                {/* Products */}
                {!recentItemsLoading &&
                  latestItemsFilter === "products" &&
                  recentProducts.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all group"
                      style={{ backgroundColor: color.surface.background }}
                      onClick={() =>
                        navigate(`/dashboard/products/${product.id}`)
                      }
                    >
                      <div
                        className="p-2 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: color.primary.accent,
                        }}
                      >
                        <ShoppingBag className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold border flex-shrink-0 ${getStatusColor(
                              product.status
                            )}`}
                          >
                            {product.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-black">
                          <span>Code: {product.code}</span>
                          <span>•</span>
                          <span>{product.created}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    </div>
                  ))}

                {/* Empty State */}
                {!recentItemsLoading &&
                  ((latestItemsFilter === "campaigns" &&
                    recentCampaigns.length === 0) ||
                    (latestItemsFilter === "offers" &&
                      recentOffers.length === 0) ||
                    (latestItemsFilter === "segments" &&
                      recentSegments.length === 0) ||
                    (latestItemsFilter === "products" &&
                      recentProducts.length === 0)) && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                          No {latestItemsFilter} found
                        </p>
                        <button
                          onClick={() => {
                            if (latestItemsFilter === "campaigns") {
                              navigate("/dashboard/campaigns/create");
                            } else if (latestItemsFilter === "offers") {
                              navigate("/dashboard/offers/create");
                            } else if (latestItemsFilter === "segments") {
                              navigate("/dashboard/segments/create");
                            } else if (latestItemsFilter === "products") {
                              navigate("/dashboard/products/create");
                            }
                          }}
                          className="text-sm font-medium text-black hover:text-gray-700"
                        >
                          Create your first {latestItemsFilter.slice(0, -1)} →
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Quick Actions</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Common tasks and shortcuts
              </p>
            </div>
            <div className="p-6 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.name}
                    onClick={() => navigate(action.href)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all"
                    style={{ backgroundColor: color.surface.background }}
                  >
                    <div
                      className="p-2 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: color.primary.accent,
                      }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm text-gray-700">
                      {action.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div className="mb-6">
        <CategoryDistributionChart
          title={categoryViewMeta[categoryView].title}
          subtitle={categoryViewMeta[categoryView].subtitle}
          data={categoryChartData}
          loading={categoryChartLoading}
          selectedView={categoryView}
          onViewChange={setCategoryView}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Offer Type Distribution */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className={tw.cardHeading}>Offer Type Distribution</h2>
                <p className={`${tw.cardSubHeading} text-black mt-1`}>
                  Breakdown by offer type
                </p>
              </div>
              <div className="p-6">
                {offerDistributionLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                      <p className="text-sm text-black">
                        Loading distribution...
                      </p>
                    </div>
                  </div>
                ) : offerTypeDistribution.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-sm text-black">
                        No offer type data available
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 w-full min-h-[256px]">
                    <ResponsiveContainer width="100%" height={256}>
                      <PieChart>
                        <Pie
                          data={offerTypeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          isAnimationActive={true}
                          animationDuration={300}
                        >
                          {offerTypeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => value.toLocaleString()}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => (
                            <span
                              style={{ fontSize: "12px", color: "#000000" }}
                            >
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Segment Type Distribution */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className={tw.cardHeading}>Segment Type Distribution</h2>
                <p className={`${tw.cardSubHeading} text-black mt-1`}>
                  Breakdown by segment type
                </p>
              </div>
              <div className="p-6">
                {segmentTypeDistribution.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-sm text-black">
                        No segment type data available
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 w-full min-h-[256px]">
                    <ResponsiveContainer width="100%" height={256}>
                      <PieChart>
                        <Pie
                          data={segmentTypeDistribution.map((item) => ({
                            name: item.type,
                            value: item.count,
                            color: item.color,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          isAnimationActive={true}
                          animationDuration={300}
                        >
                          {segmentTypeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => value.toLocaleString()}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => (
                            <span
                              style={{ fontSize: "12px", color: "#000000" }}
                            >
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Performers - CVM Focus */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Campaigns */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className={tw.cardHeading}>Top Performing Campaigns</h2>
                <p className={`${tw.cardSubHeading} text-black mt-1`}>
                  Campaigns by conversion rate
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topCampaigns.map((campaign, index) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all group"
                      style={{ backgroundColor: color.surface.background }}
                      onClick={() =>
                        navigate(`/dashboard/campaigns/${campaign.id}`)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{
                            backgroundColor: color.primary.accent,
                            color: "#FFFFFF",
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-base text-black">
                            {campaign.name}
                          </p>
                          <p className="text-sm text-black">
                            Conversion: {campaign.conversionRate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-sm flex-shrink-0 ${
                              campaign.status.toLowerCase() === "active"
                                ? "text-black bg-transparent border-0 font-normal"
                                : `font-bold border ${getStatusColor(
                                    campaign.status
                                  )}`
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performing Offers */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className={tw.cardHeading}>Top Performing Offers</h2>
                <p className={`${tw.cardSubHeading} text-black mt-1`}>
                  Offers by acceptance rate
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topOffers.map((offer, index) => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between p-5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all group"
                      style={{ backgroundColor: color.surface.background }}
                      onClick={() => navigate(`/dashboard/offers/${offer.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{
                            backgroundColor: color.primary.accent,
                            color: "#FFFFFF",
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-base text-black">
                            {offer.name}
                          </p>
                          <p className="text-sm text-black">
                            Acceptance: {offer.acceptanceRate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p
                            className="font-bold text-sm"
                            style={{ color: "#2563eb" }}
                          >
                            {offer.engagement.toLocaleString()} engaged
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-sm flex-shrink-0 ${
                              offer.status.toLowerCase() === "active"
                                ? "text-black bg-transparent border-0 font-normal"
                                : `font-bold border ${getStatusColor(
                                    offer.status
                                  )}`
                            }`}
                          >
                            {offer.status}
                          </span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Campaign Status Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Campaign Status</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Campaign status distribution
              </p>
            </div>
            <div className="p-6">
              {campaignStatusDistribution.length === 0 ? (
                <div className="h-64 w-full min-h-[256px] flex items-center justify-center">
                  <p className={`${tw.textSecondary} text-sm`}>
                    No campaign status data available yet.
                  </p>
                </div>
              ) : (
                <div className="h-64 w-full min-h-[256px]">
                  <ResponsiveContainer width="100%" height={256}>
                    <PieChart>
                      <Pie
                        data={campaignStatusDistribution.map((item) => ({
                          name: item.status,
                          value: item.count,
                          color: item.color,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={300}
                      >
                        {campaignStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString()}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "8px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span style={{ fontSize: "12px", color: "#000000" }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Requires Attention */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className={tw.cardHeading}>Requires Attention</h2>
              <p className={`${tw.cardSubHeading} text-black mt-1`}>
                Action items that need your review
              </p>
            </div>
            <div className="p-6 space-y-4">
              {requiresAttention.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl p-5 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-base text-black">
                          {item.title}
                        </p>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            item.priority === "high"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {item.priority === "high" ? "High" : "Medium"}
                        </span>
                      </div>
                      <p className="text-sm text-black mb-2">
                        {item.description}
                      </p>
                      <button
                        className="text-sm font-medium hover:opacity-80 transition-opacity"
                        style={{ color: "#2563eb" }}
                        onClick={() => {
                          // Navigate to appropriate page based on type
                          // This will be implemented when routing is ready
                        }}
                      >
                        {item.action} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
