import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Clock,
  Target,
  Gift,
  Package,
  Users,
  FolderKanban,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { campaignService } from "../../features/campaigns/services/campaignService";
import { offerService } from "../../features/offers/services/offerService";
import { productService } from "../../features/products/services/productService";
import { segmentService } from "../../features/segments/services/segmentService";
import { programService } from "../../features/campaigns/services/programService";
import { color, tw } from "../utils/utils";

interface SearchSuggestion {
  id: string | number;
  type: "campaign" | "offer" | "product" | "segment" | "program";
  name: string;
  description?: string;
  url: string;
}

interface GlobalSearchProps {
  onClose?: () => void;
}

const QUICK_SEARCHES = [
  {
    label: "Campaigns",
    icon: Target,
    url: "/dashboard/campaigns",
  },
  {
    label: "Offers",
    icon: Gift,
    url: "/dashboard/offers",
  },
  {
    label: "Products",
    icon: Package,
    url: "/dashboard/products",
  },
  {
    label: "Segments",
    icon: Users,
    url: "/dashboard/segments",
  },
  {
    label: "Programs",
    icon: FolderKanban,
    url: "/dashboard/programs",
  },
];

export default function GlobalSearch({ onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const stored = localStorage.getItem("recentSearches");
    return stored ? JSON.parse(stored) : [];
  });

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const [campaignsRes, offersRes, productsRes, segmentsRes, programsRes] =
        await Promise.allSettled([
          campaignService.getCampaigns({
            limit: 5,
            offset: 0,
            skipCache: true,
          }),
          offerService.searchOffers({
            search: query,
            limit: 5,
            offset: 0,
            skipCache: true,
          }),
          productService.searchProducts({
            name: query,
            limit: 5,
            offset: 0,
            skipCache: true,
          }),
          segmentService.searchSegments({
            search: query,
            limit: 5,
            offset: 0,
            skipCache: true,
          }),
          programService.getAllPrograms({
            limit: 5,
            offset: 0,
            skipCache: true,
          }),
        ]);

      const allSuggestions: SearchSuggestion[] = [];

      // Process campaigns
      if (campaignsRes.status === "fulfilled" && campaignsRes.value.data) {
        campaignsRes.value.data
          .filter((c) => c.name?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .forEach((campaign) => {
            allSuggestions.push({
              id: campaign.id,
              type: "campaign",
              name: campaign.name || "Unnamed Campaign",
              description: campaign.description || undefined,
              url: `/dashboard/campaigns/${campaign.id}`,
            });
          });
      }

      // Process offers
      if (offersRes.status === "fulfilled" && offersRes.value.data) {
        offersRes.value.data.slice(0, 3).forEach((offer) => {
          allSuggestions.push({
            id: offer.id,
            type: "offer",
            name: offer.name || "Unnamed Offer",
            description: offer.description || undefined,
            url: `/dashboard/offers/${offer.id}`,
          });
        });
      }

      // Process products
      if (productsRes.status === "fulfilled" && productsRes.value.data) {
        productsRes.value.data.slice(0, 3).forEach((product) => {
          allSuggestions.push({
            id: product.id,
            type: "product",
            name: product.name || "Unnamed Product",
            description: product.description || undefined,
            url: `/dashboard/products/${product.id}`,
          });
        });
      }

      // Process segments
      if (segmentsRes.status === "fulfilled" && segmentsRes.value.data) {
        segmentsRes.value.data.slice(0, 3).forEach((segment) => {
          allSuggestions.push({
            id: segment.id,
            type: "segment",
            name: segment.name || "Unnamed Segment",
            description: segment.description || undefined,
            url: `/dashboard/segments/${segment.id}`,
          });
        });
      }

      // Process programs
      if (programsRes.status === "fulfilled" && programsRes.value.data) {
        programsRes.value.data
          .filter((p) => p.name?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .forEach((program) => {
            allSuggestions.push({
              id: program.id,
              type: "program",
              name: program.name || "Unnamed Program",
              description: program.description || undefined,
              url: `/dashboard/programs/${program.id}`,
            });
          });
      }

      setSuggestions(allSuggestions.slice(0, 8));
    } catch (error) {
      console.error("Failed to fetch search suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, fetchSuggestions]);

  // Show dropdown on hover or focus
  useEffect(() => {
    if (isHovered || inputRef.current === document.activeElement) {
      setShowSuggestions(true);
    }
  }, [isHovered]);

  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowSuggestions(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Don't hide if input is focused
    if (inputRef.current !== document.activeElement) {
      setTimeout(() => {
        setShowSuggestions(false);
      }, 200);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setShowSuggestions(true);
  };

  // Handle input blur
  const handleBlur = () => {
    setTimeout(() => {
      if (!isHovered) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  // Handle search submission
  const handleSearch = (query?: string) => {
    const searchQuery = query || searchTerm.trim();
    if (!searchQuery) return;

    // Save to recent searches
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    // Navigate to search results
    navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
    onClose?.();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        navigate(suggestions[selectedIndex].url);
        setShowSuggestions(false);
        onClose?.();
      } else {
        handleSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      onClose?.();
    }
  };

  // Get type label and icon
  const getTypeInfo = (type: SearchSuggestion["type"]) => {
    const types = {
      campaign: { label: "Campaign", icon: Target },
      offer: { label: "Offer", icon: Gift },
      product: { label: "Product", icon: Package },
      segment: { label: "Segment", icon: Users },
      program: { label: "Program", icon: FolderKanban },
    };
    return types[type];
  };

  const hasSearchResults =
    searchTerm.trim().length >= 2 && suggestions.length > 0;
  const showQuickSearches = !searchTerm.trim() || searchTerm.trim().length < 2;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 max-w-xs sm:max-w-md"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
        <input
          ref={inputRef}
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search campaigns, offers, products..."
          className="w-full pl-11 pr-10 py-2.5 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-white/70 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg border border-gray-200 max-h-[600px] overflow-y-auto z-50 w-[500px]"
          style={{ maxWidth: "calc(100vw - 2rem)" }}
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
              <p className="mt-3 text-sm text-gray-600">Searching...</p>
            </div>
          ) : hasSearchResults ? (
            <>
              {/* Search Results */}
              <div className="py-2">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Results
                  </h3>
                </div>
                <div>
                  {suggestions.map((suggestion, index) => {
                    const typeInfo = getTypeInfo(suggestion.type);
                    const Icon = typeInfo.icon;
                    return (
                      <button
                        key={`${suggestion.type}-${suggestion.id}`}
                        onClick={() => {
                          navigate(suggestion.url);
                          setShowSuggestions(false);
                          onClose?.();
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                          selectedIndex === index ? "bg-gray-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {suggestion.name}
                            </p>
                            {suggestion.description && (
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {suggestion.description}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {typeInfo.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* View All Results */}
              <div className="border-t border-gray-200 p-2">
                <button
                  onClick={() => handleSearch()}
                  className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 rounded transition-colors"
                >
                  View all results for "{searchTerm}"
                </button>
              </div>
            </>
          ) : showQuickSearches ? (
            <div className="py-4">
              {/* Quick Searches Section */}
              <div className="px-4 py-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Quick Access
                </h3>
              </div>
              <div>
                {QUICK_SEARCHES.map((quickSearch) => {
                  const Icon = quickSearch.icon;
                  return (
                    <button
                      key={quickSearch.label}
                      onClick={() => {
                        navigate(quickSearch.url);
                        setShowSuggestions(false);
                        onClose?.();
                      }}
                      className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <Icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm">
                        {quickSearch.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="border-t border-gray-200 mt-2">
                  <div className="px-4 py-2 mt-2">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Recent Searches
                    </h3>
                  </div>
                  <div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(search);
                          handleSearch(search);
                        }}
                        className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <Clock className="h-4 w-4 text-gray-600 flex-shrink-0" />
                        <span className="text-gray-900 text-sm">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                No results found
              </p>
              <p className="text-xs text-gray-600 mb-4">
                Try adjusting your search terms
              </p>
              <button
                onClick={() => handleSearch()}
                className="text-sm text-gray-900 hover:text-gray-700 transition-colors"
              >
                View all results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
