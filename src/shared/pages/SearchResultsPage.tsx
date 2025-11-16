import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Target,
  Gift,
  Package,
  Users,
  FolderKanban,
} from "lucide-react";
import { campaignService } from "../../features/campaigns/services/campaignService";
import { offerService } from "../../features/offers/services/offerService";
import { productService } from "../../features/products/services/productService";
import { segmentService } from "../../features/segments/services/segmentService";
import { programService } from "../../features/campaigns/services/programService";
import { color, tw } from "../utils/utils";
import LoadingSpinner from "../components/ui/LoadingSpinner";

interface SearchResult {
  id: string | number;
  type: "campaign" | "offer" | "product" | "segment" | "program";
  name: string;
  description?: string;
  url: string;
  metadata?: Record<string, unknown>;
}

interface SearchResults {
  campaigns: SearchResult[];
  offers: SearchResult[];
  products: SearchResult[];
  segments: SearchResult[];
  programs: SearchResult[];
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResults>({
    campaigns: [],
    offers: [],
    products: [],
    segments: [],
    programs: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({
        campaigns: [],
        offers: [],
        products: [],
        segments: [],
        programs: [],
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [campaignsRes, offersRes, productsRes, segmentsRes, programsRes] =
        await Promise.allSettled([
          campaignService.getCampaigns({
            limit: 50,
            offset: 0,
            skipCache: true,
          }),
          offerService.searchOffers({
            search: searchQuery,
            limit: 50,
            offset: 0,
            skipCache: true,
          }),
          productService.searchProducts({
            name: searchQuery,
            limit: 50,
            offset: 0,
            skipCache: true,
          }),
          segmentService.searchSegments({
            search: searchQuery,
            limit: 50,
            offset: 0,
            skipCache: true,
          }),
          programService.getAllPrograms({
            limit: 50,
            offset: 0,
            skipCache: true,
          }),
        ]);

      const searchResults: SearchResults = {
        campaigns: [],
        offers: [],
        products: [],
        segments: [],
        programs: [],
      };

      // Process campaigns
      if (campaignsRes.status === "fulfilled" && campaignsRes.value.data) {
        searchResults.campaigns = campaignsRes.value.data
          .filter((c) =>
            c.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((campaign) => ({
            id: campaign.id,
            type: "campaign" as const,
            name: campaign.name || "Unnamed Campaign",
            description: campaign.description || undefined,
            url: `/dashboard/campaigns/${campaign.id}`,
            metadata: {
              status: campaign.status,
              approval_status: campaign.approval_status,
            },
          }));
      }

      // Process offers
      if (offersRes.status === "fulfilled" && offersRes.value.data) {
        searchResults.offers = offersRes.value.data.map((offer) => ({
          id: offer.id,
          type: "offer" as const,
          name: offer.name || "Unnamed Offer",
          description: offer.description || undefined,
          url: `/dashboard/offers/${offer.id}`,
          metadata: {
            status: offer.status,
            offer_type: offer.offer_type,
          },
        }));
      }

      // Process products
      if (productsRes.status === "fulfilled" && productsRes.value.data) {
        searchResults.products = productsRes.value.data.map((product) => ({
          id: product.id,
          type: "product" as const,
          name: product.name || "Unnamed Product",
          description: product.description || undefined,
          url: `/dashboard/products/${product.id}`,
          metadata: {
            is_active: product.is_active,
          },
        }));
      }

      // Process segments
      if (segmentsRes.status === "fulfilled" && segmentsRes.value.data) {
        searchResults.segments = segmentsRes.value.data.map((segment) => ({
          id: segment.id,
          type: "segment" as const,
          name: segment.name || "Unnamed Segment",
          description: segment.description || undefined,
          url: `/dashboard/segments/${segment.id}`,
          metadata: {
            type: segment.type,
            customer_count: segment.customer_count,
          },
        }));
      }

      // Process programs
      if (programsRes.status === "fulfilled" && programsRes.value.data) {
        searchResults.programs = programsRes.value.data
          .filter((p) =>
            p.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((program) => ({
            id: program.id,
            type: "program" as const,
            name: program.name || "Unnamed Program",
            description: program.description || undefined,
            url: `/dashboard/programs/${program.id}`,
            metadata: {
              is_active: program.is_active,
            },
          }));
      }

      setResults(searchResults);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to perform search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  const getTypeInfo = (type: SearchResult["type"]) => {
    const types = {
      campaign: {
        label: "Campaign",
        icon: Target,
      },
      offer: {
        label: "Offer",
        icon: Gift,
      },
      product: {
        label: "Product",
        icon: Package,
      },
      segment: {
        label: "Segment",
        icon: Users,
      },
      program: {
        label: "Program",
        icon: FolderKanban,
      },
    };
    return types[type];
  };

  const totalResults =
    results.campaigns.length +
    results.offers.length +
    results.products.length +
    results.segments.length +
    results.programs.length;

  const renderResultsSection = (
    title: string,
    items: SearchResult[],
    type: SearchResult["type"]
  ) => {
    if (items.length === 0) return null;

    const typeInfo = getTypeInfo(type);
    const Icon = typeInfo.icon;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon className="h-5 w-5 text-gray-600" />
          <h3 className={`text-lg font-semibold ${tw.textPrimary}`}>
            {title} ({items.length})
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => navigate(item.url)}
              className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              style={{ backgroundColor: color.surface.cards }}
            >
              <div className="flex items-start gap-3 mb-2">
                <Icon className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 line-clamp-2">
                    {item.name}
                  </h4>
                  <span className="text-xs text-gray-500 mt-1 inline-block">
                    {typeInfo.label}
                  </span>
                </div>
              </div>
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2 ml-7">
                  {item.description}
                </p>
              )}
              {item.metadata && (
                <div className="flex flex-wrap gap-2 mt-2 ml-7">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <span
                      key={key}
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
            Search Results
          </h1>
          {query && (
            <p className={`${tw.textSecondary} mt-1`}>
              {isLoading
                ? "Searching..."
                : totalResults > 0
                ? `Found ${totalResults} result${
                    totalResults !== 1 ? "s" : ""
                  } for "${query}"`
                : `No results found for "${query}"`}
            </p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner variant="modern" size="xl" color="primary" />
          <p className={`${tw.textMuted} mt-4`}>Searching...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-900">{error}</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <>
          {totalResults === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
                No results found
              </h3>
              <p className={`${tw.textSecondary} mb-4`}>
                Try adjusting your search terms or search for something else.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {renderResultsSection("Campaigns", results.campaigns, "campaign")}
              {renderResultsSection("Offers", results.offers, "offer")}
              {renderResultsSection("Products", results.products, "product")}
              {renderResultsSection("Segments", results.segments, "segment")}
              {renderResultsSection("Programs", results.programs, "program")}
            </div>
          )}
        </>
      )}
    </div>
  );
}
