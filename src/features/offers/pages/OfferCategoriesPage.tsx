import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  MessageSquare,
  ArrowLeft,
  Grid,
  List,
  FolderOpen,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useToast } from "../../../contexts/ToastContext";
import { offerCategoryService } from "../services/offerCategoryService";
import {
  OfferCategoryType,
  CreateOfferCategoryRequest,
  UpdateOfferCategoryRequest,
} from "../types/offerCategory";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";

interface OfferCategoryWithCount extends OfferCategoryType {
  offer_count?: number;
}

interface BasicOffer {
  id?: string | number;
  name?: string;
  description?: string;
  status?: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: OfferCategoryType;
  onSave: (category: { name: string; description?: string }) => Promise<void>;
}

function CategoryModal({
  isOpen,
  onClose,
  category,
  onSave,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
    setError("");
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Catalog name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      await onSave(categoryData); // Wait for save to complete
      onClose(); // Only close after save succeeds
    } catch {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  return isOpen
    ? createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className={`${tw.subHeading} text-gray-900`}>
                {category ? "Edit Offer Catalog" : "Create New Offer Catalog"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Catalog Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    placeholder="Enter offer catalog name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    placeholder="Enter offer catalog description"
                    rows={3}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: color.primary.action }}
                >
                  {isLoading
                    ? "Saving..."
                    : category
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;
}

interface OffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: OfferCategoryType | null;
}

function OffersModal({ isOpen, onClose, category }: OffersModalProps) {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<BasicOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOffers, setFilteredOffers] = useState<BasicOffer[]>([]);

  useEffect(() => {
    if (isOpen && category) {
      loadOffers();
      setSearchTerm("");
    }
  }, [isOpen, category]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchTerm) {
      const filtered = offers.filter(
        (offer: BasicOffer) =>
          offer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOffers(filtered);
    } else {
      setFilteredOffers(offers);
    }
  }, [searchTerm, offers]);

  const loadOffers = async () => {
    if (!category) return;

    try {
      setLoading(true);
      setError(null);
      const response = await offerCategoryService.getCategoryOffers(
        category.id,
        {
          limit: 100,
          skipCache: true,
        }
      );
      // Backend returns offers in response.data
      const offersData = (response.data || []) as BasicOffer[];
      setOffers(offersData);
    } catch {
      // Failed to load offers
      setError(err instanceof Error ? err.message : "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  // const handleCreateOffer = () => {
  //   if (category) {
  //     navigate(`/dashboard/offers/create?categoryId=${category.id}`);
  //   }
  // };

  return (
    <>
      {isOpen && category && (
        <>
          {/* Main Offers Modal */}
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
            ></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className={`${tw.subHeading} text-gray-900`}>
                      Offers in "{category.name}"
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {offers.length} offer{offers.length !== 1 ? "s" : ""}{" "}
                      found
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Search and Actions */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search offers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigate(
                            `/dashboard/offer-catalogs/${category.id}/assign`
                          );
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                        Add offers to this catalog
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-4">{error}</p>
                      <button
                        onClick={loadOffers}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : filteredOffers.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className={`${tw.subHeading} text-gray-900 mb-2`}>
                        {searchTerm
                          ? "No offers found"
                          : "No offers in this category"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "Create a new offer or assign an existing one to this category"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOffers.map((offer: BasicOffer, index) => (
                        <div
                          key={offer?.id || index}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                style={{
                                  backgroundColor: color.primary.accent,
                                }}
                              >
                                <MessageSquare className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {offer?.name || "Unknown Offer"}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {offer?.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                offer?.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : offer?.status === "draft"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {offer?.status || "unknown"}
                            </span>
                            <button
                              onClick={() => {
                                if (offer?.id) {
                                  navigate(`/dashboard/offers/${offer.id}`);
                                }
                              }}
                              className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function OfferCategoriesPage() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success, error: showError } = useToast();

  const [offerCategories, setOfferCategories] = useState<
    OfferCategoryWithCount[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryOfferCounts, setCategoryOfferCounts] = useState<
    Record<
      number,
      {
        totalOffers: number;
        activeOffers: number;
        expiredOffers: number;
        draftOffers: number;
        pendingOffers: number;
      }
    >
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    OfferCategoryType | undefined
  >();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<OfferCategoryType | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [stats, setStats] = useState<{
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    categoriesWithOffers: number;
  } | null>(null);

  // Analytics data for stat cards
  const [unusedCount, setUnusedCount] = useState<number>(0);
  const [popularCategory, setPopularCategory] = useState<{
    name: string;
    count: number;
  } | null>(null);

  // Filter states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [filterType, setFilterType] = useState<
    "all" | "unused" | "popular" | "active" | "inactive"
  >("all");

  // Advanced search states
  const [advancedSearch, setAdvancedSearch] = useState({
    exactName: "",
    isActive: null as boolean | null,
    createdAfter: "",
    createdBefore: "",
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter handlers
  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowAdvancedFilters(false);
      setIsClosingModal(false);
    }, 300); // Match the transition duration
  };

  const handleFilterChange = (
    type: "all" | "unused" | "popular" | "active" | "inactive"
  ) => {
    setFilterType(type);
  };

  // Check if advanced search has any active filters
  const hasAdvancedFilters = () => {
    return (
      advancedSearch.exactName.trim() !== "" ||
      advancedSearch.isActive !== null ||
      advancedSearch.createdAfter !== "" ||
      advancedSearch.createdBefore !== ""
    );
  };

  // Clear all advanced search filters
  const clearAdvancedSearch = () => {
    setAdvancedSearch({
      exactName: "",
      isActive: null,
      createdAfter: "",
      createdBefore: "",
    });
  };

  useEffect(() => {
    const loadData = async () => {
      // Load stats first
      await loadStats();
      // Load analytics data
      await loadUnusedCategories();
      await loadPopularCategory();
      // Load offers first, then categories (to avoid race condition)
      await loadAllOffers();
      await loadCategories(true); // Always skip cache for fresh data
    };
    loadData();
  }, [debouncedSearchTerm, filterType, advancedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllOffers = async () => {
    try {
      // TODO: Update to use new offer service endpoints when we update OffersPage
      // For now, just return empty array to avoid errors
      return [];
    } catch {
      // Failed to load offers for counting
      return [];
    }
  };

  const loadStats = async () => {
    try {
      const response = await offerCategoryService.getStats(true); // skipCache = true
      const data = response.data as unknown as Record<string, string>; // Backend returns snake_case, types expect camelCase
      setStats({
        totalCategories: parseInt(data.total_categories) || 0,
        activeCategories: parseInt(data.active_categories) || 0,
        inactiveCategories:
          parseInt(data.total_categories) - parseInt(data.active_categories) ||
          0,
        categoriesWithOffers: parseInt(data.categories_with_description) || 0, // Using categories_with_description as proxy
      });
    } catch {
      // Failed to load stats
      setStats(null);
    }
  };

  const loadUnusedCategories = async () => {
    try {
      const response = await offerCategoryService.getUnusedCategories({
        limit: 50,
        skipCache: true,
      });
      if (response.success && response.data) {
        setUnusedCount(response.data.length);
      }
    } catch {
      // Failed to load unused categories
      setUnusedCount(0);
    }
  };

  const loadPopularCategory = async () => {
    try {
      const response = await offerCategoryService.getPopularCategories({
        limit: 1, // Just get the top one
        skipCache: true,
      });
      if (response.success && response.data && response.data.length > 0) {
        const topCategory = response.data[0];
        setPopularCategory({
          name: topCategory.name,
          count: topCategory.offerCount || 0,
        });
      }
    } catch {
      // Failed to load popular category
      setPopularCategory(null);
    }
  };

  const getOfferCountForCategory = () => {
    // TODO: Update when we fix offer service - for now return 0
    return 0;
  };

  // Load offer counts for all categories at once
  const loadAllOfferCounts = async (categories?: OfferCategoryWithCount[]) => {
    try {
      const response = await offerCategoryService.getOfferCounts(true);

      if (response.success && response.data) {
        // Use provided categories or fall back to state
        const categoriesToMatch = categories || offerCategories;

        // Backend returns: { category_name: string, offer_count: string }
        // We need to match by category name to get the category ID
        const countsMap: Record<
          number,
          {
            totalOffers: number;
            activeOffers: number;
            expiredOffers: number;
            draftOffers: number;
            pendingOffers: number;
          }
        > = {};

        response.data.forEach(
          (item: { category_name: string; offer_count: string | number }) => {
            // Find the category by name to get its ID
            const matchingCategory = categoriesToMatch.find(
              (cat) => cat.name === item.category_name
            );

            if (matchingCategory) {
              const categoryId =
                typeof matchingCategory.id === "string"
                  ? parseInt(matchingCategory.id, 10)
                  : matchingCategory.id;
              const offerCount =
                typeof item.offer_count === "string"
                  ? parseInt(item.offer_count, 10)
                  : item.offer_count || 0;

              countsMap[categoryId] = {
                totalOffers: offerCount,
                activeOffers: 0, // Backend doesn't provide this breakdown
                expiredOffers: 0,
                draftOffers: 0,
                pendingOffers: 0,
              };
            }
          }
        );

        setCategoryOfferCounts(countsMap);
      }
    } catch {
      // Failed to load all offer counts
    }
  };

  const loadCategories = async (skipCache = false) => {
    try {
      setLoading(true);

      let response;

      // Choose endpoint based on filter type and advanced search
      if (hasAdvancedFilters()) {
        // Use advanced search when advanced filters are set
        response = await offerCategoryService.advancedSearch({
          name: advancedSearch.exactName.trim() || undefined,
          is_active: advancedSearch.isActive ?? undefined,
          created_after: advancedSearch.createdAfter || undefined,
          created_before: advancedSearch.createdBefore || undefined,
          limit: 50,
          skipCache: skipCache,
        });
      } else if (debouncedSearchTerm) {
        // Use search endpoint when there's a search term
        response = await offerCategoryService.searchCategories({
          q: debouncedSearchTerm,
          limit: 50,
          skipCache: skipCache,
        });
      } else {
        // Use different endpoints based on filter type
        switch (filterType) {
          case "unused":
            response = await offerCategoryService.getUnusedCategories({
              limit: 50,
              skipCache: skipCache,
            });
            break;
          case "popular":
            response = await offerCategoryService.getPopularCategories({
              limit: 50,
              skipCache: skipCache,
            });
            break;
          case "active":
            response = await offerCategoryService.getActiveCategories({
              limit: 50,
              skipCache: skipCache,
            });
            break;
          case "inactive":
            // For inactive, we'll get all and filter client-side
            response = await offerCategoryService.getAllCategories({
              limit: 50,
              skipCache: skipCache,
            });
            break;
          default: // 'all'
            response = await offerCategoryService.getAllCategories({
              limit: 50,
              skipCache: skipCache,
            });
            break;
        }
      }

      const categoriesData = response.data || [];

      // Use provided offers data or fall back to state
      // Add offer count to each category by counting from offers
      let categoriesWithCounts = categoriesData.map((category) => {
        const categoryId =
          typeof category.id === "string"
            ? parseInt(category.id, 10)
            : category.id;
        return {
          ...category,
          id: categoryId, // Ensure ID is a number
          offer_count: getOfferCountForCategory(),
        };
      });

      // Apply client-side filtering for inactive categories
      if (filterType === "inactive" && !debouncedSearchTerm) {
        categoriesWithCounts = categoriesWithCounts.filter(
          (category) => !category.is_active
        );
      }

      setOfferCategories(categoriesWithCounts);
      setError("");

      // Load offer counts for all categories at once
      // Note: loadAllOfferCounts needs offerCategories to match by name,
      // so we need to call it after setting the state, but we'll use the local variable
      // We'll pass categoriesWithCounts to loadAllOfferCounts
      await loadAllOfferCounts(categoriesWithCounts);
    } catch {
      // Failed to load categories
      setError("Error loading categories");
      setOfferCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: OfferCategoryType) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (category: OfferCategoryType) => {
    const confirmed = await confirm({
      title: "Delete Category",
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await offerCategoryService.deleteCategory(category.id);

      // Refresh from server to ensure cache is cleared
      await loadAllOffers();
      await loadCategories(true); // skipCache = true
      await loadStats(); // Refresh stats too

      success(
        "Category Deleted",
        `"${category.name}" has been deleted successfully.`
      );
    } catch {
      // Error"Error deleting category:", err);
      showError(
        "Error",
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  const handleViewOffers = (category: OfferCategoryType) => {
    setSelectedCategory(category);
    setIsOffersModalOpen(true);
  };

  const handleCategorySaved = async (categoryData: {
    name: string;
    description?: string;
  }) => {
    try {
      if (editingCategory) {
        // Update existing category
        await offerCategoryService.updateCategory(
          editingCategory.id,
          categoryData as UpdateOfferCategoryRequest
        );
        success("Category updated successfully");
      } else {
        // Create new category
        await offerCategoryService.createCategory(
          categoryData as CreateOfferCategoryRequest
        );
        success("Category created successfully");
      }

      // Refresh both offers and categories to get updated counts
      await loadAllOffers();
      await loadCategories(true);
      await loadStats(); // Refresh stats too

      setIsModalOpen(false);
      setEditingCategory(undefined);
    } catch {
      // Error"Failed to save category:", err);
      showError("Failed to save category", "Please try again later.");
    }
  };

  const filteredOfferCategories = (offerCategories || []).filter(
    (category) =>
      category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category?.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/offers")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
              Offer Catalogs
            </h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>
              Organize and manage your offer catalogs with ease
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateCategory}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
            style={{ backgroundColor: color.primary.action }}
          >
            <Plus className="w-4 h-4" />
            Create Offer Catalog
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div
            className="rounded-xl border border-gray-200 p-4"
            style={{ backgroundColor: color.surface.cards }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Catalogs
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCategories}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-gray-900" />
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border border-gray-200 p-4"
            style={{ backgroundColor: color.surface.cards }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Catalogs
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeCategories}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-gray-900" />
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border border-gray-200 p-4"
            style={{ backgroundColor: color.surface.cards }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Inactive Catalogs
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactiveCategories}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-gray-900" />
              </div>
            </div>
          </div>

          {/* <div
            className="rounded-xl border border-gray-200 p-4"
            style={{ backgroundColor: color.surface.cards }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Catalogs with Description
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.categoriesWithOffers}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-900" />
              </div>
            </div>
          </div> */}

          {/* Unused Categories Stat Card */}
          <div
            className="rounded-xl border border-gray-200 p-4"
            style={{ backgroundColor: color.surface.cards }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Unused Categories
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {unusedCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-gray-900" />
              </div>
            </div>
          </div>

          {/* Most Popular Category Stat Card */}
          <div
            className="rounded-xl border border-gray-200 p-4"
            style={{ backgroundColor: color.surface.cards }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Most Popular
                </p>
                <p
                  className="text-lg font-bold text-gray-900 truncate"
                  title={popularCategory?.name || "None"}
                >
                  {popularCategory?.name || "None"}
                </p>
                <p className="text-sm text-gray-500">
                  {popularCategory?.count || 0} offers
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-gray-900" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and View Toggle */}
      <div className=" flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search catalogs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 p-1">
          <button
            onClick={() => setShowAdvancedFilters(true)}
            className="flex items-center px-4 py-2 rounded-lg bg-gray-50 transition-colors text-sm font-medium"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded transition-colors ${
              viewMode === "grid"
                ? "bg-gray-200 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded transition-colors ${
              viewMode === "list"
                ? "bg-gray-200 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filterType !== "all" || hasAdvancedFilters()) && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className={`text-sm font-medium ${tw.textPrimary} py-2`}>
            Active filters:
          </span>

          {/* Basic filter type */}
          {filterType !== "all" && (
            <span
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full border"
              style={{
                backgroundColor: `${color.primary.accent}20`, // 20% opacity
                color: color.text.primary, // Black text
                borderColor: color.primary.accent,
              }}
            >
              {filterType === "unused" && "Unused Categories"}
              {filterType === "popular" && "Popular Categories"}
              {filterType === "active" && "Active Categories"}
              {filterType === "inactive" && "Inactive Categories"}
              <button
                onClick={() => setFilterType("all")}
                className="ml-2 hover:opacity-70 transition-opacity"
              >
                ×
              </button>
            </span>
          )}

          {/* Advanced search filters */}
          {hasAdvancedFilters() && (
            <>
              {advancedSearch.exactName.trim() && (
                <span
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded-full border"
                  style={{
                    backgroundColor: `${color.primary.accent}20`,
                    color: color.text.primary,
                    borderColor: color.primary.accent,
                  }}
                >
                  Name: "{advancedSearch.exactName}"
                  <button
                    onClick={() =>
                      setAdvancedSearch((prev) => ({ ...prev, exactName: "" }))
                    }
                    className="ml-2 hover:opacity-70 transition-opacity"
                  >
                    ×
                  </button>
                </span>
              )}

              {advancedSearch.isActive !== null && (
                <span
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded-full border"
                  style={{
                    backgroundColor: `${color.primary.accent}20`,
                    color: color.text.primary,
                    borderColor: color.primary.accent,
                  }}
                >
                  Status: {advancedSearch.isActive ? "Active" : "Inactive"}
                  <button
                    onClick={() =>
                      setAdvancedSearch((prev) => ({ ...prev, isActive: null }))
                    }
                    className="ml-2 hover:opacity-70 transition-opacity"
                  >
                    ×
                  </button>
                </span>
              )}

              {(advancedSearch.createdAfter ||
                advancedSearch.createdBefore) && (
                <span
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded-full border"
                  style={{
                    backgroundColor: `${color.primary.accent}20`,
                    color: color.text.primary,
                    borderColor: color.primary.accent,
                  }}
                >
                  Date: {advancedSearch.createdAfter || "Any"} to{" "}
                  {advancedSearch.createdBefore || "Any"}
                  <button
                    onClick={() =>
                      setAdvancedSearch((prev) => ({
                        ...prev,
                        createdAfter: "",
                        createdBefore: "",
                      }))
                    }
                    className="ml-2 hover:opacity-70 transition-opacity"
                  >
                    ×
                  </button>
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Categories */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner
            variant="modern"
            size="xl"
            color="primary"
            className="mb-4"
          />
          <p className={`${tw.textMuted} font-medium`}>Loading catalogs...</p>
        </div>
      ) : error ? (
        <div
          className="rounded-xl shadow-sm border border-gray-200 p-8 text-center"
          style={{ backgroundColor: color.surface.cards }}
        >
          <div
            className={`bg-red-50 border border-red-200 text-red-700 rounded-xl p-6`}
          >
            <p className="font-medium mb-3">{error}</p>
            <button
              onClick={() => loadCategories()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredOfferCategories.length === 0 ? (
        <div
          className="rounded-xl shadow-sm border border-gray-200 text-center py-16 px-4"
          style={{ backgroundColor: color.surface.cards }}
        >
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className={`${tw.subHeading} text-gray-900 mb-2`}>
            {searchTerm ? "No catalogs found" : "No catalogs yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first offer catalog to organize your offers"}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateCategory}
              className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all"
              style={{ backgroundColor: color.primary.action }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Catalog
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOfferCategories.map((category) => (
            <div
              key={category.id}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
              style={{ backgroundColor: color.surface.cards }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3
                  className={`${tw.cardHeading} text-gray-900 flex-1 truncate`}
                >
                  {category.name}
                </h3>
                <div className="flex items-center space-x-1">
                  {/* <button
                    onClick={() => handleViewDetails(category)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button> */}
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              {category.description && (
                <p
                  className={`${tw.cardSubHeading} text-gray-500 mb-4 line-clamp-2`}
                >
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  {(() => {
                    const categoryId =
                      typeof category.id === "string"
                        ? parseInt(category.id, 10)
                        : category.id;
                    const count = categoryOfferCounts[categoryId];
                    return count ? (
                      <>
                        {count.totalOffers} offer
                        {count.totalOffers !== 1 ? "s" : ""}
                        {count.activeOffers > 0 && (
                          <span className="text-green-600 ml-1">
                            ({count.activeOffers} active)
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {category.offer_count || 0} offer
                        {category.offer_count !== 1 ? "s" : ""}
                      </>
                    );
                  })()}
                </span>
                <button
                  onClick={() => handleViewOffers(category)}
                  className="px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{ color: color.primary.accent }}
                  title="View & Assign Offers"
                >
                  View Offers
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOfferCategories.map((category) => (
            <div
              key={category.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center justify-between"
              style={{ backgroundColor: color.surface.cards }}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1">
                  <h3 className={`${tw.subHeading} text-gray-900 truncate`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {(() => {
                      const categoryId =
                        typeof category.id === "string"
                          ? parseInt(category.id, 10)
                          : category.id;
                      const count = categoryOfferCounts[categoryId];
                      return count ? (
                        <>
                          {count.totalOffers} offer
                          {count.totalOffers !== 1 ? "s" : ""}
                          {count.activeOffers > 0 && (
                            <span className="text-green-600 ml-1">
                              ({count.activeOffers} active)
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {category.offer_count || 0} offer
                          {category.offer_count !== 1 ? "s" : ""}
                        </>
                      );
                    })()}
                  </p>
                </div>
                <button
                  onClick={() => handleViewOffers(category)}
                  className="px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{ color: color.primary.accent }}
                  title="View & Assign Offers"
                >
                  View Offers
                </button>
              </div>
              <div className="flex items-center gap-2">
                {/* <button
                  onClick={() => handleViewDetails(category)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button> */}
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSave={handleCategorySaved}
      />

      <OffersModal
        isOpen={isOffersModalOpen}
        onClose={() => {
          setIsOffersModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onRefreshCategories={async () => {
          await loadAllOfferCounts();
          await loadCategories(true);
        }}
        onRefreshCounts={loadAllOfferCounts}
      />

      {/* Advanced Filters Side Modal */}
      {(showAdvancedFilters || isClosingModal) &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] overflow-hidden ${
              isClosingModal
                ? "animate-out fade-out duration-300"
                : "animate-in fade-in duration-300"
            }`}
          >
            <div
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={handleCloseModal}
            ></div>
            <div
              className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                isClosingModal ? "translate-x-full" : "translate-x-0"
              }`}
            >
              <div className={`p-6 border-b ${tw.borderDefault}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`${tw.subHeading} ${tw.textPrimary}`}>
                    Filter Categories
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className={`p-2 ${tw.textMuted} hover:bg-gray-50 rounded-lg transition-colors`}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                {/* Filter Type */}
                <div>
                  <label
                    className={`block text-sm font-medium ${tw.textPrimary} mb-3`}
                  >
                    Category Type
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Categories" },
                      { value: "unused", label: "Unused Categories" },
                      { value: "popular", label: "Popular Categories" },
                      { value: "active", label: "Active Categories" },
                      { value: "inactive", label: "Inactive Categories" },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="filterType"
                          value={option.value}
                          checked={filterType === option.value}
                          onChange={() =>
                            handleFilterChange(
                              option.value as
                                | "all"
                                | "unused"
                                | "popular"
                                | "active"
                                | "inactive"
                            )
                          }
                          className={`mr-3 text-[${color.primary.action}] focus:ring-[${color.primary.action}]`}
                        />
                        <span className={`text-sm ${tw.textSecondary}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Advanced Search Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className={`${tw.subHeading} ${tw.textPrimary} mb-4`}>
                    Advanced Search
                  </h3>

                  <div className="space-y-4">
                    {/* Exact Name Search */}
                    <div>
                      <label
                        className={`block text-sm font-medium ${tw.textSecondary} mb-2`}
                      >
                        Exact Name Match
                      </label>
                      <input
                        type="text"
                        value={advancedSearch.exactName}
                        onChange={(e) =>
                          setAdvancedSearch((prev) => ({
                            ...prev,
                            exactName: e.target.value,
                          }))
                        }
                        placeholder="Enter exact category name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label
                        className={`block text-sm font-medium ${tw.textSecondary} mb-2`}
                      >
                        Status
                      </label>
                      <select
                        value={
                          advancedSearch.isActive === null
                            ? ""
                            : advancedSearch.isActive.toString()
                        }
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? null
                              : e.target.value === "true";
                          setAdvancedSearch((prev) => ({
                            ...prev,
                            isActive: value,
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Status</option>
                        <option value="true">Active Only</option>
                        <option value="false">Inactive Only</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium ${tw.textSecondary} mb-2`}
                        >
                          Created After
                        </label>
                        <input
                          type="date"
                          value={advancedSearch.createdAfter}
                          onChange={(e) =>
                            setAdvancedSearch((prev) => ({
                              ...prev,
                              createdAfter: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium ${tw.textSecondary} mb-2`}
                        >
                          Created Before
                        </label>
                        <input
                          type="date"
                          value={advancedSearch.createdBefore}
                          onChange={(e) =>
                            setAdvancedSearch((prev) => ({
                              ...prev,
                              createdBefore: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setFilterType("all");
                      clearAdvancedSearch();
                    }}
                    className={`flex-1 px-4 py-2 text-sm border border-gray-300 ${tw.textSecondary} rounded-lg hover:bg-gray-50 transition-colors`}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      handleCloseModal();
                    }}
                    className={`${tw.button} flex-1 px-4 py-2 text-sm`}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default OfferCategoriesPage;
