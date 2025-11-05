import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Users,
  ArrowLeft,
  Grid,
  List,
} from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useToast } from "../../../contexts/ToastContext";
import { segmentService } from "../services/segmentService";
import {
  SegmentCategory,
  CreateSegmentCategoryRequest,
  UpdateSegmentCategoryRequest,
} from "../types/segment";
import { Segment } from "../types/segment";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: SegmentCategory;
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

      await onSave(categoryData);
      onClose();
    } catch (err) {
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
                {category
                  ? "Edit Segment Catalog"
                  : "Create New Segment Catalog"}
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
                    Segment Catalog Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
                    placeholder="e.g., Marketing Segments, Retention Campaigns"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
                    placeholder="Optional description for this segment catalog"
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
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        color.primary.action;
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      color.primary.action;
                  }}
                >
                  {isLoading
                    ? "Saving..."
                    : category
                    ? "Update Catalog"
                    : "Create Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;
}

interface SegmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: SegmentCategory | null;
  onRefreshCounts: () => void;
}

function SegmentsModal({
  isOpen,
  onClose,
  category,
  onRefreshCounts,
}: SegmentsModalProps) {
  const navigate = useNavigate();
  const { success: showToast, error: showError } = useToast();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [filteredSegments, setFilteredSegments] = useState<Segment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allSegments, setAllSegments] = useState<Segment[]>([]);
  const [loadingAllSegments, setLoadingAllSegments] = useState(false);

  const loadCategorySegments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await segmentService.getSegments({ skipCache: true });
      const segmentsData = (response as { data?: Segment[] }).data || [];

      // Filter segments that belong to this category
      const categorySegments = segmentsData.filter(
        (s: Segment) =>
          s.category && String(s.category) === String(category?.id)
      );

      setSegments(categorySegments);
      setFilteredSegments(categorySegments);
    } catch (err) {
      console.error("Failed to load segments:", err);
      setSegments([]);
      setFilteredSegments([]);
    } finally {
      setIsLoading(false);
    }
  }, [category?.id]);

  useEffect(() => {
    if (isOpen && category) {
      loadCategorySegments();
    }
  }, [isOpen, category, loadCategorySegments]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = segments.filter(
        (segment) =>
          segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (segment.description &&
            segment.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
      setFilteredSegments(filtered);
    } else {
      setFilteredSegments(segments);
    }
  }, [searchTerm, segments]);

  // Load all segments for assignment modal
  const loadAllSegments = async () => {
    try {
      setLoadingAllSegments(true);
      const response = await segmentService.getSegments({
        limit: 1000,
        skipCache: true,
      });
      const segmentsData = (response.data || []) as Segment[];
      setAllSegments(segmentsData);
    } catch (err) {
      console.error("Failed to load all segments:", err);
      setAllSegments([]);
    } finally {
      setLoadingAllSegments(false);
    }
  };

  // Get assigned segment IDs (segments in this category)
  const assignedSegmentIds = segments
    .map((segment) => segment.id)
    .filter((id): id is number | string => id !== undefined);

  // Handle assignment
  const handleAssignSegments = async (
    segmentIds: (number | string)[]
  ): Promise<{ success: number; failed: number; errors?: string[] }> => {
    if (!category) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Assign each segment individually
    for (const segmentId of segmentIds) {
      try {
        await segmentService.updateSegment(Number(segmentId), {
          category: category.id,
        });
        success++;
      } catch (err) {
        failed++;
        const errorMsg =
          err instanceof Error
            ? err.message
            : `Failed to assign segment ${segmentId}`;
        errors.push(errorMsg);
        console.error(`Failed to assign segment ${segmentId}:`, err);
      }
    }

    // Refresh segments list and counts
    loadCategorySegments();
    onRefreshCounts();

    return { success, failed, errors };
  };

  return (
    <>
      {isOpen && category && (
        <>
          {/* Main Segments Modal */}
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className={`${tw.subHeading} text-gray-900`}>
                    Segments in {category?.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {segments.length} segment{segments.length !== 1 ? "s" : ""}{" "}
                    in this catalog
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Search and Assign Button */}
              <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search segments..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      navigate(
                        `/dashboard/segment-catalogs/${category.id}/assign`
                      );
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add segments to this catalog
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner
                      variant="modern"
                      size="lg"
                      color="primary"
                    />
                    <p className="text-gray-500 mt-4">Loading segments...</p>
                  </div>
                ) : filteredSegments.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchTerm
                        ? "No segments match your search"
                        : "No segments in this catalog"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSegments.map((segment) => (
                      <div
                        key={segment.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className={`${tw.subHeading} text-gray-900`}>
                            {segment.name}
                          </h3>
                          {segment.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {segment.description}
                            </p>
                          )}
                          {segment.customer_count !== undefined && (
                            <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>
                                {typeof segment.customer_count === "number"
                                  ? segment.customer_count.toLocaleString()
                                  : typeof segment.customer_count === "string"
                                  ? parseInt(
                                      segment.customer_count,
                                      10
                                    ).toLocaleString()
                                  : "0"}
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (segment.id) {
                                navigate(`/dashboard/segments/${segment.id}`);
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

          {/* Assign Segments Modal */}
        </>
      )}
    </>
  );
}

export default function SegmentCategoriesPage() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success, error: showError } = useToast();

  const [categories, setCategories] = useState<SegmentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<SegmentCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSegmentsModalOpen, setIsSegmentsModalOpen] = useState(false);
  const [segmentCounts, setSegmentCounts] = useState<Record<number, number>>(
    {}
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await segmentService.getSegmentCategories(
        undefined,
        true
      );
      console.log("Raw response:", response);
      const categoriesData = response.data || [];
      console.log("Categories data:", categoriesData);

      // Ensure all category IDs are numbers
      const validCategoriesData = categoriesData.map(
        (cat: SegmentCategory & { id: number | string }) => ({
          ...cat,
          id: typeof cat.id === "string" ? parseInt(cat.id, 10) : cat.id,
        })
      );

      console.log(
        "Valid categories data (after ID conversion):",
        validCategoriesData
      );
      setCategories(validCategoriesData);

      // Load segment counts for each category
      await loadSegmentCounts(validCategoriesData);
    } catch (err) {
      showError(
        "Error loading categories",
        (err as Error).message || "Failed to load segment catalogs"
      );
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const loadSegmentCounts = async (cats: SegmentCategory[]) => {
    try {
      console.log("Loading segments for counts...");
      const response = await segmentService.getSegments({ skipCache: true });
      console.log("Segments API response:", response);
      const segmentsData = ((response as { data?: Segment[] }).data ||
        []) as Segment[];
      console.log("Segments data:", segmentsData);

      const counts: Record<number, number> = {};
      cats.forEach((cat) => {
        const catId =
          typeof cat.id === "string" ? parseInt(cat.id, 10) : cat.id;
        counts[catId] = segmentsData.filter((s) => {
          const segmentCategory =
            typeof s.category === "string"
              ? parseInt(s.category, 10)
              : s.category;
          return segmentCategory === catId;
        }).length;
      });

      setSegmentCounts(counts);
    } catch (err) {
      console.error("Failed to load segment counts:", err);
    }
  };

  const handleCreateCategory = async (categoryData: {
    name: string;
    description?: string;
  }) => {
    try {
      const request: CreateSegmentCategoryRequest = {
        name: categoryData.name,
        description: categoryData.description,
      };

      await segmentService.createSegmentCategory(request);
      success(
        "Catalog created",
        `Segment catalog "${categoryData.name}" has been created successfully`
      );
      await loadCategories();
    } catch (err) {
      throw new Error(
        (err as Error).message || "Failed to create segment catalog"
      );
    }
  };

  const handleUpdateCategory = async (categoryData: {
    name: string;
    description?: string;
  }) => {
    if (!selectedCategory) return;

    try {
      const request: UpdateSegmentCategoryRequest = {
        name: categoryData.name,
        description: categoryData.description,
      };

      await segmentService.updateSegmentCategory(selectedCategory.id, request);
      success(
        "Catalog updated",
        `Segment catalog "${categoryData.name}" has been updated successfully`
      );
      await loadCategories();
    } catch (err) {
      throw new Error(
        (err as Error).message || "Failed to update segment catalog"
      );
    }
  };

  const handleDeleteCategory = async (category: SegmentCategory) => {
    const segmentCount = segmentCounts[category.id] || 0;

    const confirmed = await confirm({
      title: "Delete Segment Catalog",
      message:
        segmentCount > 0
          ? `This catalog contains ${segmentCount} segment(s). Deleting it will unassign all segments. Are you sure you want to continue?`
          : `Are you sure you want to delete "${category.name}"?`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await segmentService.deleteSegmentCategory(category.id);
      success(
        "Catalog deleted",
        `Segment catalog "${category.name}" has been deleted successfully`
      );
      await loadCategories();
    } catch (err) {
      showError(
        "Error deleting catalog",
        (err as Error).message || "Failed to delete segment catalog"
      );
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/segments")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
              Segment Catalogs
            </h1>
            <p className={`${tw.subHeading} ${tw.textSecondary} mt-1`}>
              Organize your segments into catalogs
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsCategoryModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all"
          style={{ backgroundColor: color.primary.action }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor =
              color.primary.action;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor =
              color.primary.action;
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Catalog
        </button>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-2  p-1">
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
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner
            variant="modern"
            size="xl"
            color="primary"
            className="mb-4"
          />
          <p className={`${tw.textMuted} font-medium`}>Loading catalogs...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16 px-4">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className={`${tw.subHeading} text-gray-900 mb-2`}>
            {searchTerm ? "No catalogs found" : "No catalogs yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first segment catalog to organize your segments"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setIsCategoryModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all"
              style={{ backgroundColor: color.primary.action }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  color.primary.action;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  color.primary.action;
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Catalog
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${tw.subHeading} text-gray-900`}>
                  {category.name}
                </h3>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsCategoryModalOpen(true);
                    }}
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
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  {segmentCounts[category.id] || 0} segment
                  {segmentCounts[category.id] !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsSegmentsModalOpen(true);
                  }}
                  className="text-sm font-medium transition-colors"
                  style={{ color: color.primary.accent }}
                  title="View Segments"
                >
                  View Segments
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1">
                  <h3 className={`${tw.subHeading} text-gray-900`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {segmentCounts[category.id] || 0} segment
                    {segmentCounts[category.id] !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsSegmentsModalOpen(true);
                  }}
                  className="text-sm font-medium transition-colors"
                  style={{ color: color.primary.accent }}
                  title="View Segments"
                >
                  View Segments
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsCategoryModalOpen(true);
                  }}
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

      {/* Modals */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory || undefined}
        onSave={selectedCategory ? handleUpdateCategory : handleCreateCategory}
      />

      <SegmentsModal
        isOpen={isSegmentsModalOpen}
        onClose={() => {
          setIsSegmentsModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onRefreshCounts={() => loadSegmentCounts(categories)}
      />
    </div>
  );
}
