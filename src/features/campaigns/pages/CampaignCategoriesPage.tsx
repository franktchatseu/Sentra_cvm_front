import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MessageSquare,
  ArrowLeft,
  Grid,
  List,
} from "lucide-react";
import CatalogItemsModal from "../../../shared/components/CatalogItemsModal";
import { color, tw } from "../../../shared/utils/utils";
import { useToast } from "../../../contexts/ToastContext";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { campaignService } from "../services/campaignService";
import DeleteConfirmModal from "../../../shared/components/ui/DeleteConfirmModal";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { BackendCampaignType } from "../types/campaign";
import {
  FolderOpen,
  CheckCircle,
  XCircle,
  X,
  Archive,
  Star,
} from "lucide-react";

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
  const { error: showError } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError("Catalog name is required");
      return;
    }

    if (formData.name.length > 64) {
      showError("Catalog name must be 64 characters or less");
      return;
    }

    if (formData.description && formData.description.length > 500) {
      showError("Description must be 500 characters or less");
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    };

    await onSave(categoryData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? "Edit Campaign Catalog" : "Create New Campaign Catalog"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md transition-colors"
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter campaign catalog description"
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
  const { success: showToast, error: showError } = useToast();
  const { confirm } = useConfirm();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<CampaignCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [campaignCategories, setCampaignCategories] = useState<
    CampaignCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
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
  // Note: allCampaigns state removed - not used here anymore
  // getAllCampaigns is only used in AssignItemsPage for campaigns

  // Campaign assignment state

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadStats = async (skipCache = false) => {
    try {
      // Use backend endpoint for stats instead of calculating manually
      const statsResponse = await campaignService.getCampaignCategoryStats(
        skipCache
      );

      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data as {
          total_categories?: string | number;
          active_categories?: string | number;
          inactive_categories?: string | number;
          root_categories?: string | number;
          categories_with_children?: string | number;
          categories_with_campaigns?: string | number;
          categories_without_campaigns?: string | number;
          avg_display_order?: string | number;
          most_used_category?: {
            id: number;
            name: string;
            campaign_count: number;
          };
        };

        // Parse string values to numbers
        const totalCategories = Number(data.total_categories) || 0;
        const activeCategories = Number(data.active_categories) || 0;
        const inactiveCategories = Number(data.inactive_categories) || 0;
        const categoriesWithCampaigns =
          Number(data.categories_with_campaigns) || 0;

        setStats({
          totalCategories,
          activeCategories,
          inactiveCategories:
            inactiveCategories || totalCategories - activeCategories,
          categoriesWithCampaigns,
        });

        // Set unused count from backend (categories without campaigns)
        const unusedCount = Number(data.categories_without_campaigns) || 0;
        setUnusedCount(unusedCount);

        // Set popular category from backend if available
        if (
          data.most_used_category &&
          data.most_used_category.campaign_count > 0
        ) {
          setPopularCategory({
            name: data.most_used_category.name,
            count: data.most_used_category.campaign_count,
          });
        } else {
          // Fallback: find popular category from loaded categories
          const sorted = [...campaignCategories].sort(
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
        }
      }
    } catch (err) {
      console.error("Failed to load campaign category stats:", err);
      setStats(null);
      setUnusedCount(0);
      setPopularCategory(null);
    }
  };

  // Helper function to count campaigns for a category (checking both category_id AND tags)
  // Same logic as segments - supports multi-catalog assignment via tags
  const getCampaignCountForCategory = (
    categoryId: number,
    campaigns: BackendCampaignType[]
  ) => {
    const catalogTag = buildCatalogTag(categoryId);
    return campaigns.filter((campaign) => {
      // Check if category_id matches (handle string/number conversion like segments)
      const campaignCategoryId =
        typeof campaign.category_id === "string"
          ? parseInt(campaign.category_id, 10)
          : campaign.category_id;
      const matchesPrimary =
        campaignCategoryId !== null &&
        campaignCategoryId !== undefined &&
        !isNaN(campaignCategoryId) &&
        Number(campaignCategoryId) === categoryId;

      // Check if tags include the catalog tag
      const tags = Array.isArray(campaign.tags) ? campaign.tags : [];
      const matchesTag = tags.includes(catalogTag);

      return matchesPrimary || matchesTag;
    }).length;
  };

  const loadCategories = async (skipCache = false) => {
    try {
      setLoading(true);

      // Use searchCampaignCategories endpoint when there's a search term,
      // otherwise use getCampaignCategories
      let response;
      if (debouncedSearchTerm.trim()) {
        response = await campaignService.searchCampaignCategories(
          debouncedSearchTerm,
          {
            skipCache: skipCache,
          }
        );
      } else {
        response = await campaignService.getCampaignCategories({
          skipCache: skipCache,
        });
      }

      // Handle new response structure with success and data properties
      const categoriesData =
        response.success && response.data ? response.data : [];

      // Fetch all campaigns once to calculate counts (checking both category_id AND tags)
      // This ensures campaigns assigned via tags are counted correctly
      let allCampaigns: BackendCampaignType[] = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const campaignsResponse = await campaignService.getCampaigns({
          limit: limit,
          offset: offset,
          skipCache: skipCache,
        });

        const campaigns = (campaignsResponse.data ||
          []) as BackendCampaignType[];
        allCampaigns = [...allCampaigns, ...campaigns];

        const total = campaignsResponse.pagination?.total || 0;
        hasMore = allCampaigns.length < total && campaigns.length === limit;
        offset += limit;
      }

      // Calculate count for each category by checking both category_id AND tags
      // (same logic as offers/segments - supports multi-catalog assignment)
      const categoriesWithCounts = (categoriesData as CampaignCategory[]).map(
        (category: CampaignCategory) => {
          const count = getCampaignCountForCategory(category.id, allCampaigns);
          return {
            ...category,
            campaign_count: count,
          };
        }
      );

      setCampaignCategories(categoriesWithCounts);

      // Load stats from backend endpoint (not from categories data)
      await loadStats(skipCache);
    } catch (err) {
      console.error("Failed to load Campaigns catalogs:", err);
      showError("Failed to load Campaigns catalogs", "Please try again later.");
      setCampaignCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(true);
  }, [debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when page becomes visible (e.g., when navigating back from assign page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadCategories(true);
      }
    };

    const handleFocus = () => {
      loadCategories(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: CampaignCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category: CampaignCategory) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await campaignService.deleteCampaignCategory(categoryToDelete.id);
      // Refresh from server to ensure cache is cleared
      await loadCategories(true); // skipCache = true
      showToast(
        "Category Deleted",
        `"${categoryToDelete.name}" has been deleted successfully.`
      );
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Failed to delete category:", err);
      showError("Failed to delete category", "Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
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
    } catch {
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

      // Fetch all campaigns and filter by category_id OR tags (same logic as count)
      // This ensures campaigns assigned via tags are shown correctly
      let allCampaigns: BackendCampaignType[] = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await campaignService.getCampaigns({
          limit: limit,
          offset: offset,
          skipCache: true,
        });

        const campaigns = (response.data || []) as BackendCampaignType[];
        allCampaigns = [...allCampaigns, ...campaigns];

        const total = response.pagination?.total || 0;
        hasMore = allCampaigns.length < total && campaigns.length === limit;
        offset += limit;
      }

      // Filter campaigns by category_id OR tags (same logic as getCampaignCountForCategory)
      // Same logic as segments - supports multi-catalog assignment via tags
      const catalogTag = buildCatalogTag(categoryId);
      const categoryCampaigns = allCampaigns.filter((campaign) => {
        // Check if category_id matches (handle string/number conversion like segments)
        const campaignCategoryId =
          typeof campaign.category_id === "string"
            ? parseInt(campaign.category_id, 10)
            : campaign.category_id;
        const matchesPrimary =
          campaignCategoryId !== null &&
          campaignCategoryId !== undefined &&
          !isNaN(campaignCategoryId) &&
          Number(campaignCategoryId) === categoryId;

        // Check if tags include the catalog tag
        const tags = Array.isArray(campaign.tags) ? campaign.tags : [];
        const matchesTag = tags.includes(catalogTag);

        return matchesPrimary || matchesTag;
      });

      const formattedCampaigns = categoryCampaigns.map((campaign) => ({
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
    } catch {
      showError("Failed to load campaigns", "Please try again later.");
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleRemoveCampaign = async (campaignId: number | string) => {
    if (!selectedCategory) return;

    const confirmed = await confirm({
      title: "Remove Campaign",
      message: `Are you sure you want to remove this campaign from "${selectedCategory.name}"?`,
      type: "warning",
      confirmText: "Remove",
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    try {
      setRemovingCampaignId(campaignId);

      const campaignResponse = await campaignService.getCampaignById(
        Number(campaignId),
        true
      );

      if (!campaignResponse) {
        showError("Failed to load campaign details", "Please try again later.");
        setRemovingCampaignId(null);
        return;
      }

      // Cast to BackendCampaignType to access tags property
      const campaign = campaignResponse as unknown as BackendCampaignType;

      const primaryCategoryId = Number(campaign.category_id);
      if (
        Number.isFinite(primaryCategoryId) &&
        primaryCategoryId === Number(selectedCategory.id)
      ) {
        await confirm({
          title: "Primary Category",
          message:
            "This catalog is the campaign's primary category. Change the campaign's primary category before removing it from this catalog.",
          type: "info",
          confirmText: "Got it",
          cancelText: "Close",
        });
        setRemovingCampaignId(null);
        return;
      }

      const catalogTag = buildCatalogTag(selectedCategory.id);
      const hasCatalogTag =
        Array.isArray(campaign.tags) && campaign.tags.includes(catalogTag);

      if (!hasCatalogTag) {
        showError("Campaign is not tagged to this catalog.");
        setRemovingCampaignId(null);
        return;
      }

      const updatedTags = (campaign.tags || []).filter(
        (tag: string) => tag !== catalogTag
      );

      await campaignService.updateCampaign(Number(campaignId), {
        tags: updatedTags,
      });

      showToast("Campaign removed from catalog successfully");
      // Refresh the modal campaigns list
      if (selectedCategory) {
        await handleViewCampaigns(selectedCategory);
      }
      // Also refresh the categories list to update counts on cards
      await loadCategories(true);
    } catch (err) {
      showError(
        "Failed to remove campaign",
        err instanceof Error ? err.message : "Please try again later."
      );
    } finally {
      setRemovingCampaignId(null);
    }
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
            className="p-2 text-gray-600 hover:text-gray-800 rounded-md transition-colors"
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
            className="px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
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
                className="rounded-md border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-5 w-5"
                    style={{ color: color.primary.accent }}
                  />
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                </div>
                <p
                  className={`mt-2 ${valueClass} font-bold text-gray-900`}
                  title={stat.title}
                >
                  {displayValue}
                </p>
                {stat.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {stat.description}
                  </p>
                )}
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
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
      ) : filteredCampaignCategories.length === 0 ? (
        <div
          className="rounded-md shadow-sm border border-gray-200 text-center py-16 px-4"
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
              className="inline-flex items-center px-4 py-2 text-white rounded-md transition-all"
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
              className="border border-gray-200 rounded-md p-6 hover:shadow-md transition-all"
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
                    className="p-2 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-2 rounded-md transition-colors"
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
                  className="text-sm font-medium text-gray-700 hover:underline transition-colors"
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
              className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-all flex items-center justify-between"
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
                  className="text-sm font-medium text-gray-700 hover:underline transition-colors"
                  title="View & Assign Campaigns"
                >
                  View Campaigns
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-2 rounded-md transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="p-2 rounded-md transition-colors"
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
      <CatalogItemsModal
        isOpen={isCampaignsModalOpen}
        onClose={() => {
          setIsCampaignsModalOpen(false);
          setSelectedCategory(null);
          setCampaigns([]);
        }}
        category={selectedCategory}
        items={campaigns}
        loading={campaignsLoading}
        entityName="campaign"
        entityNamePlural="campaigns"
        assignRoute={`/dashboard/campaign-catalogs/${selectedCategory?.id}/assign`}
        viewRoute={(id) => `/dashboard/campaigns/${id}`}
        onRemove={async (id) => {
          await handleRemoveCampaign(id);
        }}
        removingId={removingCampaignId}
        onRefresh={async () => {
          if (selectedCategory) {
            await handleViewCampaigns(selectedCategory);
            // Also refresh the categories list to update counts on cards
            await loadCategories(true);
          }
        }}
        renderStatus={(campaign) => (
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
        )}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        itemName={categoryToDelete?.name || ""}
        isLoading={isDeleting}
        confirmText="Delete Category"
        cancelText="Cancel"
      />
    </div>
  );
}
