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
} from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useToast } from "../../../contexts/ToastContext";
import { campaignService } from "../services/campaignService";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { BackendCampaignType } from "../types/campaign";
import { FolderOpen, CheckCircle, XCircle, Archive, Star } from "lucide-react";

const CATALOG_TAG_PREFIX = "catalog:";

const buildCatalogTag = (categoryId: number | string) =>
  `${CATALOG_TAG_PREFIX}${categoryId}`;

interface CampaignCategory {
  id: number;
  name: string;
  description: string | null;
  parent_category_id: number | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  campaign_count?: number;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CampaignCategory;
  onSave: (category: { name: string; description?: string }) => Promise<void>;
  isSaving?: boolean;
}

function CategoryModal({
  isOpen,
  onClose,
  category,
  onSave,
  isSaving = false,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
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

    if (formData.name.length > 64) {
      setError("Catalog name must be 64 characters or less");
      return;
    }

    if (formData.description && formData.description.length > 500) {
      setError("Description must be 500 characters or less");
      return;
    }

    setError("");

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    };

    await onSave(categoryData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? "Edit Campaign Catalog" : "Create New Campaign Catalog"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Catalog Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter campaign catalog name"
                maxLength={64}
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter campaign catalog description"
                rows={3}
                maxLength={500}
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
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: color.primary.action }}
            >
              {isSaving
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
  );
}

export default function CampaignCategoriesPage() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success: showToast, error: showError } = useToast();

  const [campaignCategories, setCampaignCategories] = useState<
    CampaignCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    CampaignCategory | undefined
  >();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<{
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    categoriesWithCampaigns: number;
  } | null>(null);

  // Analytics data for stat cards
  const [unusedCount, setUnusedCount] = useState<number>(0);
  const [popularCategory, setPopularCategory] = useState<{
    name: string;
    count: number;
  } | null>(null);

  // Campaigns modal state
  const [isCampaignsModalOpen, setIsCampaignsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CampaignCategory | null>(null);
  const [campaigns, setCampaigns] = useState<
    Array<{
      id: string;
      name: string;
      description?: string;
      status?: string;
      approval_status?: string;
      start_date?: string;
      end_date?: string;
      category_id?: number;
      tags?: string[];
    }>
  >([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [removingCampaignId, setRemovingCampaignId] = useState<
    number | string | null
  >(null);
  const [campaignSearchTerm, setCampaignSearchTerm] = useState("");
  const [allCampaigns, setAllCampaigns] = useState<
    Array<{
      id: string;
      name: string;
      description?: string;
      status?: string;
      approval_status?: string;
      start_date?: string;
      end_date?: string;
      category_id?: number;
    }>
  >([]);

  // Campaign assignment state

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadStats = async (categories?: CampaignCategory[]) => {
    try {
      const cats = categories || campaignCategories;
      // Calculate stats from categories
      const totalCategories = cats.length;
      const activeCategories = cats.filter((c) => c.is_active).length;
      const inactiveCategories = totalCategories - activeCategories;
      const categoriesWithCampaigns = cats.filter(
        (c) => (c.campaign_count || 0) > 0
      ).length;

      setStats({
        totalCategories,
        activeCategories,
        inactiveCategories,
        categoriesWithCampaigns,
      });
    } catch (err) {
      setStats(null);
    }
  };

  const loadUnusedCategories = async (categories?: CampaignCategory[]) => {
    try {
      const cats = categories || campaignCategories;
      // Count categories with no campaigns
      const unused = cats.filter(
        (c) => !c.campaign_count || c.campaign_count === 0
      ).length;
      setUnusedCount(unused);
    } catch (err) {
      setUnusedCount(0);
    }
  };

  const loadPopularCategory = async (categories?: CampaignCategory[]) => {
    try {
      const cats = categories || campaignCategories;
      // Find category with most campaigns
      const sorted = [...cats].sort(
        (a, b) => (b.campaign_count || 0) - (a.campaign_count || 0)
      );
      if (sorted.length > 0 && (sorted[0].campaign_count || 0) > 0) {
        setPopularCategory({
          name: sorted[0].name,
          count: sorted[0].campaign_count || 0,
        });
      } else {
        setPopularCategory(null);
      }
    } catch (err) {
      setPopularCategory(null);
    }
  };

  const loadAllCampaigns = async () => {
    try {
      // Fetch all campaigns in batches (backend limit is 100)
      let allCampaigns: BackendCampaignType[] = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await campaignService.getAllCampaigns({
          page: page,
          pageSize: limit,
          skipCache: true,
        });

        const campaigns = (response.data as BackendCampaignType[]) || [];
        allCampaigns = [...allCampaigns, ...campaigns];

        const total = response.meta?.total || 0;
        hasMore = allCampaigns.length < total && campaigns.length === limit;
        page += 1;
      }

      const transformedCampaigns = allCampaigns.map((campaign) => ({
        id: String(campaign.id),
        name: campaign.name,
        description: campaign.description || undefined,
        status: campaign.status,
        approval_status: campaign.approval_status,
        start_date: campaign.start_date || undefined,
        end_date: campaign.end_date || undefined,
        category_id: campaign.category_id || undefined,
        tags: campaign.tags || [],
      }));

      setAllCampaigns(transformedCampaigns);
      return transformedCampaigns;
    } catch (err) {
      setAllCampaigns([]);
      return [];
    }
  };

  const getCampaignCountForCategory = (
    categoryId: number,
    campaigns: Array<{
      id: string;
      name: string;
      description?: string;
      status?: string;
      approval_status?: string;
      start_date?: string;
      end_date?: string;
      category_id?: number;
      tags?: string[];
    }>
  ) => {
    const catalogTag = buildCatalogTag(categoryId);
    const matchingCampaigns = campaigns.filter((campaign) => {
      const campaignCategoryId = (campaign as { category_id?: number | string })
        .category_id;
      const matchesPrimary =
        campaignCategoryId === categoryId ||
        campaignCategoryId === String(categoryId) ||
        Number(campaignCategoryId) === categoryId;

      const tags = Array.isArray(campaign.tags) ? campaign.tags : [];
      const matchesTag = tags.includes(catalogTag);

      return matchesPrimary || matchesTag;
    });

    return matchingCampaigns.length;
  };

  const loadCategories = async (skipCache = false) => {
    try {
      setLoading(true);
      const response = await campaignService.getCampaignCategories({
        search: debouncedSearchTerm || undefined,
        skipCache: skipCache,
      });

      // Handle new response structure with success and data properties
      const categoriesData =
        response.success && response.data ? response.data : [];

      // Fetch campaign count for each category using the same endpoint as the modal
      // This ensures consistency between the count on cards and campaigns in modal
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            // Use getCampaignsByCategory with limit: 1 to get just the total count
            const countResponse = await campaignService.getCampaignsByCategory(
              category.id,
              {
                limit: 1,
                offset: 0,
                skipCache: skipCache,
              }
            );

            // Extract total from pagination (same endpoint used in handleViewCampaigns)
            const count =
              countResponse.success && countResponse.pagination
                ? countResponse.pagination.total
                : 0;

            return {
              ...category,
              campaign_count: count,
            };
          } catch (err) {
            // If fetching count fails, default to 0
            console.error(
              `Failed to fetch count for category ${category.id}:`,
              err
            );
            return {
              ...category,
              campaign_count: 0,
            };
          }
        })
      );

      setCampaignCategories(categoriesWithCounts);
      setError("");

      // Load stats and analytics after categories are loaded
      await loadStats(categoriesWithCounts);
      await loadUnusedCategories(categoriesWithCounts);
      await loadPopularCategory(categoriesWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading categories");
      showError(
        "Failed to load campaign categories",
        "Please try again later."
      );
      setCampaignCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(true);
  }, [debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: CampaignCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (category: CampaignCategory) => {
    const confirmed = await confirm({
      title: "Delete Category",
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await campaignService.deleteCampaignCategory(category.id);
      // Refresh from server to ensure cache is cleared
      await loadCategories(true); // skipCache = true
      showToast(
        "Category Deleted",
        `"${category.name}" has been deleted successfully.`
      );
    } catch (err) {
      showError(
        "Error",
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  const handleCategorySaved = async (categoryData: {
    name: string;
    description?: string;
  }) => {
    try {
      setIsSaving(true);
      if (editingCategory) {
        // Update existing category
        await campaignService.updateCampaignCategory(
          editingCategory.id,
          categoryData
        );
        await loadCategories(true);
        showToast("Category updated successfully");
      } else {
        // Create new category
        await campaignService.createCampaignCategory(categoryData);
        await loadCategories(true);
        showToast("Category created successfully");
      }
      setIsModalOpen(false);
      setEditingCategory(undefined);
    } catch (err) {
      showError("Failed to save category", "Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewCampaigns = async (category: CampaignCategory) => {
    try {
      const categoryId = Number(category.id);
      if (isNaN(categoryId)) {
        showError("Invalid category", "Category ID must be a number");
        return;
      }

      setSelectedCategory(category);
      setIsCampaignsModalOpen(true);
      setCampaignsLoading(true);

      // Use the same endpoint as loadCategories for consistency
      // Fetch campaigns for this category using getCampaignsByCategory
      let allCampaigns: BackendCampaignType[] = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await campaignService.getCampaignsByCategory(
          categoryId,
          {
            limit: limit,
            offset: offset,
            skipCache: true,
          }
        );

        if (response.success && response.data) {
          const campaigns = response.data as BackendCampaignType[];
          allCampaigns = [...allCampaigns, ...campaigns];

          const total = response.pagination?.total || 0;
          hasMore = allCampaigns.length < total && campaigns.length === limit;
          offset += limit;
        } else {
          hasMore = false;
        }
      }

      const formattedCampaigns = allCampaigns.map((campaign) => ({
        id: String(campaign.id),
        name: campaign.name,
        description: campaign.description || undefined,
        status: campaign.status,
        approval_status: campaign.approval_status,
        start_date: campaign.start_date || undefined,
        end_date: campaign.end_date || undefined,
        category_id: campaign.category_id || undefined,
        tags: campaign.tags || [],
      }));

      setCampaigns(formattedCampaigns);
    } catch (err) {
      showError("Failed to load campaigns", "Please try again later.");
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleRemoveCampaign = async (campaignId: number | string) => {
    showToast("info", "Can't access this action");
  };

  const filteredCampaignCategories = (campaignCategories || []).filter(
    (category) =>
      category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category?.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatNumber = (value?: number | null) =>
    typeof value === "number" ? value.toLocaleString() : "...";

  const catalogStatsCards = [
    {
      name: "Total Catalogs",
      value: formatNumber(stats?.totalCategories),
      icon: FolderOpen,
      color: color.tertiary.tag1,
    },
    {
      name: "Active Catalogs",
      value: formatNumber(stats?.activeCategories),
      icon: CheckCircle,
      color: color.tertiary.tag4,
    },
    {
      name: "Inactive Catalogs",
      value: formatNumber(stats?.inactiveCategories),
      icon: XCircle,
      color: color.tertiary.tag3,
    },
    {
      name: "Unused Categories",
      value: formatNumber(unusedCount),
      icon: Archive,
      color: color.tertiary.tag2,
    },
    {
      name: "Most Popular",
      value: popularCategory?.name || "None",
      icon: Star,
      color: color.primary.accent,
      description: `${formatNumber(popularCategory?.count ?? 0)} campaigns`,
      title: popularCategory?.name || undefined,
      valueClass: "text-xl",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/campaigns")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
              Campaign Catalogs
            </h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>
              Organize and manage your campaign catalogs with ease
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
            Create Campaign Catalog
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {catalogStatsCards.map((stat) => {
            const Icon = stat.icon;
            const valueClass = stat.valueClass ?? "text-3xl";
            const displayValue = stat.value ?? "...";

            return (
              <div
                key={stat.name}
                className="group bg-white rounded-2xl border border-gray-200 p-6 relative overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: stat.color || color.primary.accent,
                        }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="space-y-1">
                        <p
                          className={`${valueClass} font-bold ${tw.textPrimary}`}
                          title={stat.title}
                        >
                          {displayValue}
                        </p>
                        <p
                          className={`${tw.cardSubHeading} ${tw.textSecondary}`}
                        >
                          {stat.name}
                        </p>
                        {stat.description && (
                          <p className={`text-sm ${tw.textSecondary}`}>
                            {stat.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
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
      ) : filteredCampaignCategories.length === 0 ? (
        <div
          className="rounded-xl shadow-sm border border-gray-200 text-center py-16 px-4"
          style={{ backgroundColor: color.surface.cards }}
        >
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className={`${tw.cardHeading} text-gray-900 mb-1`}>
            {searchTerm ? "No catalogs found" : "No catalogs yet"}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first campaign catalog to organize your campaigns"}
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
          {filteredCampaignCategories.map((category) => (
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
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-2 rounded-lg transition-colors"
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
                    // Use campaign_count from backend (already calculated correctly)
                    const count = category.campaign_count || 0;
                    return (
                      <>
                        {count} campaign
                        {count !== 1 ? "s" : ""}
                      </>
                    );
                  })()}
                </span>
                <button
                  onClick={() => handleViewCampaigns(category)}
                  className="px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{ color: color.primary.accent }}
                  title="View & Assign Campaigns"
                >
                  View Campaigns
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCampaignCategories.map((category) => (
            <div
              key={category.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center justify-between"
              style={{ backgroundColor: color.surface.cards }}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1">
                  <h3 className={`${tw.cardHeading} text-gray-900 truncate`}>
                    {category.name}
                  </h3>
                  <p className={`${tw.cardSubHeading} text-gray-600 mt-0.5`}>
                    {(() => {
                      // Use campaign_count from backend (already calculated correctly)
                      const count = category.campaign_count || 0;
                      return (
                        <>
                          {count} campaign
                          {count !== 1 ? "s" : ""}
                        </>
                      );
                    })()}
                  </p>
                </div>
                <button
                  onClick={() => handleViewCampaigns(category)}
                  className="px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{ color: color.primary.accent }}
                  title="View & Assign Campaigns"
                >
                  View Campaigns
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-2 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="p-2 rounded-lg transition-colors"
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(undefined);
        }}
        category={editingCategory}
        onSave={handleCategorySaved}
        isSaving={isSaving}
      />

      {/* Campaigns Modal */}
      {isCampaignsModalOpen &&
        selectedCategory &&
        createPortal(
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => {
                setIsCampaignsModalOpen(false);
                setSelectedCategory(null);
                setCampaigns([]);
                setCampaignSearchTerm("");
              }}
            ></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Campaigns in "{selectedCategory.name}"
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {campaigns.length} campaign
                      {campaigns.length !== 1 ? "s" : ""} found
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCampaignsModalOpen(false);
                      setSelectedCategory(null);
                      setCampaigns([]);
                      setCampaignSearchTerm("");
                    }}
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
                        placeholder="Search campaigns..."
                        value={campaignSearchTerm}
                        onChange={(e) => setCampaignSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigate(
                            `/dashboard/campaign-catalogs/${selectedCategory.id}/assign`
                          );
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                        Add campaigns to this catalog
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  {campaignsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {campaignSearchTerm
                          ? "No campaigns found"
                          : "No campaigns in this category"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {campaignSearchTerm
                          ? "Try adjusting your search terms"
                          : "Create a new campaign or assign an existing one to this category"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {campaigns
                        .filter((campaign) => {
                          if (!campaignSearchTerm) return true;
                          const searchLower = campaignSearchTerm.toLowerCase();
                          return (
                            campaign.name
                              ?.toLowerCase()
                              .includes(searchLower) ||
                            campaign.description
                              ?.toLowerCase()
                              .includes(searchLower)
                          );
                        })
                        .map((campaign, index) => (
                          <div
                            key={campaign.id || index}
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
                                    {campaign.name || "Unknown Campaign"}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {campaign.description || "No description"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  campaign.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : campaign.status === "draft"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {campaign.status || "unknown"}
                              </span>
                              <button
                                onClick={() => {
                                  setIsCampaignsModalOpen(false);
                                  navigate(
                                    `/dashboard/campaigns/${campaign.id}`
                                  );
                                }}
                                className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  campaign?.id &&
                                  handleRemoveCampaign(campaign.id)
                                }
                                disabled={removingCampaignId === campaign?.id}
                                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                              >
                                {removingCampaignId === campaign?.id
                                  ? "Removing..."
                                  : "Remove"}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
