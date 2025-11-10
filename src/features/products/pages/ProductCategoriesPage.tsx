import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  Grid,
  List,
  X,
  Filter,
  XCircle,
  FolderOpen,
  CheckCircle,
  Archive,
  Star,
} from "lucide-react";
import {
  CategoryStats,
  ProductCategory,
  ProductCountByCategory,
} from "../types/productCategory";
import { Product } from "../types/product";
import { productCategoryService } from "../services/productCategoryService";
import { productService } from "../services/productService";
import { color, tw } from "../../../shared/utils/utils";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import CreateCategoryModal from "../../../shared/components/CreateCategoryModal";

interface ProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategory | null;
  onRefreshCategories: () => void;
  onRefreshProductCounts: () => void;
  allProducts: Product[];
  refreshAllProducts: () => Promise<Product[]>;
}

const fetchAllProductsByCategory = async (
  categoryId: number
): Promise<Product[]> => {
  const pageSize = 100;
  let offset = 0;
  const collected: Product[] = [];

  while (true) {
    const response = await productService.getProductsByCategory(categoryId, {
      limit: pageSize,
      offset,
      skipCache: true,
    });

    const batch = (response.data || []) as Product[];
    collected.push(...batch);

    const hasMore =
      batch.length === pageSize &&
      (response.pagination?.hasMore ?? batch.length === pageSize);

    if (!hasMore) {
      break;
    }

    offset += pageSize;
  }

  return collected;
};

function ProductsModal({
  isOpen,
  onClose,
  category,
  onRefreshCategories,
  onRefreshProductCounts,
  allProducts,
  refreshAllProducts,
}: ProductsModalProps) {
  const navigate = useNavigate();
  const { success: showToast, error: showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [removingProductId, setRemovingProductId] = useState<
    number | string | null
  >(null);

  useEffect(() => {
    if (isOpen && category) {
      // Make sure we fetch a fresh snapshot before deriving modal data
      const ensureDataAndLoad = async () => {
        await refreshAllProducts();
        loadProducts();
        setSearchTerm("");
      };
      ensureDataAndLoad();
    }
  }, [isOpen, category, refreshAllProducts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const loadProducts = async () => {
    if (!category) return;

    try {
      setLoading(true);
      setError(null);

      const snapshot = allProducts.length
        ? allProducts
        : await refreshAllProducts();

      const categoryId = Number(category.id);
      const productsForCategory = snapshot.filter(
        (product: Product) => Number(product.category_id) === categoryId
      );

      console.log(
        "[ProductsModal] Products derived from all-products snapshot:",
        productsForCategory.length,
        productsForCategory
      );

      setProducts(productsForCategory);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // const handleCreateProduct = () => {
  //   if (category) {
  //     navigate(`/dashboard/products/create?categoryId=${category.id}`);
  //   }
  // };

  // Get assigned product IDs (products in this category)
  const assignedProductIds = products
    .map((product) => product.id)
    .filter((id): id is number | string => id !== undefined);

  // Handle assignment
  const handleAssignProducts = async (
    productIds: (number | string)[]
  ): Promise<{ success: number; failed: number; errors?: string[] }> => {
    if (!category) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Assign each product individually
    for (const productId of productIds) {
      try {
        await productService.updateProduct(Number(productId), {
          category_id: Number(category.id),
        });
        success++;
      } catch (err) {
        failed++;
        const errorMsg =
          err instanceof Error
            ? err.message
            : `Failed to assign product ${productId}`;
        errors.push(errorMsg);
        console.error(`Failed to assign product ${productId}:`, err);
      }
    }

    // Refresh products list and counts
    loadProducts();
    onRefreshProductCounts();

    return { success, failed, errors };
  };

  const handleRemoveProduct = async (productId: number | string) => {
    if (!category) return;

    try {
      setRemovingProductId(productId);
      const productResponse = await productService.getProductById(
        Number(productId),
        true
      );
      const productData = productResponse.data;

      if (!productData) {
        showError("Product details not found");
        return;
      }

      const primaryCategoryId = Number(productData.category_id);
      if (
        !Number.isNaN(primaryCategoryId) &&
        primaryCategoryId === Number(category.id)
      ) {
        showError(
          "Cannot remove this product because this catalog is its primary category"
        );
        return;
      }

      await productService.updateProduct(Number(productId), {
        category_id: null,
      });
      showToast("Product removed from catalog");
      onRefreshCategories();
      onRefreshProductCounts();
      await loadProducts();
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to remove product from catalog"
      );
    } finally {
      setRemovingProductId(null);
    }
  };

  return (
    <>
      {isOpen && category && (
        <>
          {/* Main Products Modal */}
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
                    <h2 className="text-xl font-semibold text-gray-900">
                      Products in "{category.name}"
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {products.length} product
                      {products.length !== 1 ? "s" : ""} found
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search and Actions */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`}
                      />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigate(
                            `/dashboard/products/catalogs/${category.id}/assign`
                          );
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap hover:bg-gray-50"
                      >
                        Add products to this catalog
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
                      <button onClick={loadProducts} className={tw.button}>
                        Try Again
                      </button>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <h3 className={`${tw.cardHeading} text-gray-900 mb-1`}>
                        {searchTerm
                          ? "No products found"
                          : "No products in this category"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "Create a new product or assign an existing one to this category"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {product.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </span>
                            <button
                              onClick={() => {
                                if (product.id) {
                                  navigate(`/dashboard/products/${product.id}`);
                                }
                              }}
                              className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleRemoveProduct(product.id)}
                              disabled={removingProductId === product.id}
                              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              {removingProductId === product.id
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
          </div>

          {/* Assign Products Modal */}
        </>
      )}
    </>
  );
}

export default function ProductCatalogsPage() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success, error: showError } = useToast();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [editingCatalog, setEditingCatalog] = useState<ProductCategory | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoryProductCounts, setCategoryProductCounts] = useState<
    Record<
      number,
      {
        total_products: number;
        active_products: number;
        inactive_products: number;
      }
    >
  >({});
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filter states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [filterType, setFilterType] = useState<
    "all" | "active" | "inactive" | "with_products" | "empty"
  >("all");

  // Advanced search states
  const [advancedSearch, setAdvancedSearch] = useState({
    exactName: "",
    isActive: null as boolean | null,
    createdAfter: "",
    createdBefore: "",
    productCountMin: "",
    productCountMax: "",
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Check if advanced search has any active filters
  const hasAdvancedFilters = () => {
    return (
      advancedSearch.exactName.trim() !== "" ||
      advancedSearch.isActive !== null ||
      advancedSearch.createdAfter !== "" ||
      advancedSearch.createdBefore !== "" ||
      advancedSearch.productCountMin !== "" ||
      advancedSearch.productCountMax !== ""
    );
  };

  // Clear all advanced search filters
  const clearAdvancedSearch = () => {
    setAdvancedSearch({
      exactName: "",
      isActive: null,
      createdAfter: "",
      createdBefore: "",
      productCountMin: "",
      productCountMax: "",
    });
  };

  const formatNumber = (value?: number | null) =>
    typeof value === "number" && !Number.isNaN(value)
      ? value.toLocaleString()
      : "...";

  const loadCategoryProductCounts = async () => {
    try {
      console.log(
        "[ProductCatalogs] Fetching counts from /product-categories/analytics/product-count?skipCache=true"
      );
      const response = await productCategoryService.getProductCountByCategory({
        limit: 100,
        skipCache: true,
      });

      const countsMap: Record<
        number,
        {
          total_products: number;
          active_products: number;
          inactive_products: number;
        }
      > = {};

      (response.data || []).forEach((item: ProductCountByCategory) => {
        countsMap[item.category_id] = {
          total_products: item.product_count || 0,
          active_products: 0, // This endpoint doesn't provide active/inactive breakdown
          inactive_products: 0,
        };
      });

      setCategoryProductCounts(countsMap);
    } catch (err) {
      console.error("Failed to load category product counts:", err);
    }
  };

  const loadStats = async (skipCache = false) => {
    try {
      setStatsLoading(true);
      console.log(
        "[ProductCatalogs] Fetching stats from /product-categories/stats",
        { skipCache }
      );
      const response = await productCategoryService.getStats(skipCache);
      const data = response.data as CategoryStats | undefined;

      if (data) {
        const parsed: CategoryStats = {
          total_categories: Number(data.total_categories) || 0,
          active_categories: Number(data.active_categories) || 0,
          inactive_categories: Number(data.inactive_categories) || 0,
          root_categories: Number(data.root_categories) || 0,
          max_depth: Number(data.max_depth) || 0,
          categories_with_products: Number(data.categories_with_products) || 0,
          empty_categories: Number(data.empty_categories) || 0,
          average_products_per_category:
            Number(data.average_products_per_category) || 0,
        };
        setStats(parsed);
      } else {
        setStats(null);
      }
    } catch (err) {
      console.error("Failed to load product catalog stats:", err);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadCategories = async (skipCache = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "[ProductCatalogs] Fetching categories from /product-categories",
        { skipCache }
      );
      // Always load all categories for client-side filtering
      const response = await productCategoryService.getAllCategories({
        limit: 100,
        skipCache: skipCache,
      });

      setCategories(response.data || []);

      // Load product counts separately
      await loadCategoryProductCounts();
    } catch (err) {
      console.error("Failed to load categories:", err);
      const message =
        err instanceof Error ? err.message : "Failed to load categories";
      showError("Failed to load categories", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadStats(true), loadCategories(true)]); // Always skip cache for fresh data
      await loadAllProducts(); // Still load products for assignment modal
    };
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllProducts = async () => {
    try {
      const response = await productService.getAllProducts({
        limit: 100,
        skipCache: true,
      });
      const products = response.data || [];
      setAllProducts(products);

      const aggregatedCounts: Record<
        number,
        {
          total_products: number;
          active_products: number;
          inactive_products: number;
        }
      > = {};

      products.forEach((product: Product) => {
        const categoryId = Number(product.category_id);
        if (Number.isNaN(categoryId)) {
          return;
        }
        if (!aggregatedCounts[categoryId]) {
          aggregatedCounts[categoryId] = {
            total_products: 0,
            active_products: 0,
            inactive_products: 0,
          };
        }
        aggregatedCounts[categoryId].total_products += 1;
        if (product.is_active) {
          aggregatedCounts[categoryId].active_products += 1;
        } else {
          aggregatedCounts[categoryId].inactive_products += 1;
        }
      });

      setCategoryProductCounts((prev) => ({ ...prev, ...aggregatedCounts }));
      return products;
    } catch (err) {
      console.error("Failed to load products for assignment:", err);
      setAllProducts([]);
      return [];
    }
  };

  const handleCategoryCreated = () => {
    loadCategories();
    loadStats(true);
  };

  const handleEditCatalog = (category: ProductCategory) => {
    setEditingCatalog(category);
    setEditName(category.name);
    setEditDescription(category.description || "");
  };

  const handleViewProducts = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsProductsModalOpen(true);
  };

  const handleUpdateCatalog = async () => {
    if (!editingCatalog || !editName.trim()) return;

    try {
      setIsUpdating(true);
      await productCategoryService.updateCategory(editingCatalog.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });

      success(
        "Catalog Updated",
        `"${editName}" has been updated successfully.`
      );
      setEditingCatalog(null);
      setEditName("");
      setEditDescription("");
      await Promise.all([loadCategories(), loadStats(true)]);
    } catch (err) {
      console.error("Failed to update category:", err);
      showError(
        "Error",
        err instanceof Error ? err.message : "Failed to update category"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCatalog = async (category: ProductCategory) => {
    const confirmed = await confirm({
      title: "Delete Catalog",
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await productCategoryService.deleteCategory(category.id);
      success(
        "Catalog Deleted",
        `"${category.name}" has been deleted successfully.`
      );
      await Promise.all([loadCategories(true), loadStats(true)]);
    } catch (err) {
      console.error("Failed to delete category:", err);
      showError(
        "Error",
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  // Apply client-side search filter
  const filteredCatalogs = categories.filter((category) => {
    // Apply search term filter
    const matchesSearch =
      debouncedSearchTerm === "" ||
      category.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (category.description &&
        category.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()));

    // Apply advanced search filters
    let matchesAdvancedSearch = true;
    if (advancedSearch.exactName.trim() !== "") {
      matchesAdvancedSearch =
        matchesAdvancedSearch &&
        category.name
          .toLowerCase()
          .includes(advancedSearch.exactName.toLowerCase());
    }
    if (advancedSearch.isActive !== null) {
      matchesAdvancedSearch =
        matchesAdvancedSearch && category.is_active === advancedSearch.isActive;
    }
    if (advancedSearch.createdAfter !== "") {
      const createdDate = new Date(category.created_at);
      const afterDate = new Date(advancedSearch.createdAfter);
      matchesAdvancedSearch = matchesAdvancedSearch && createdDate >= afterDate;
    }
    if (advancedSearch.createdBefore !== "") {
      const createdDate = new Date(category.created_at);
      const beforeDate = new Date(advancedSearch.createdBefore);
      matchesAdvancedSearch =
        matchesAdvancedSearch && createdDate <= beforeDate;
    }

    // Apply product count filters (client-side since API doesn't support it)
    let matchesProductCount = true;
    if (advancedSearch.productCountMin !== "") {
      const minCount = parseInt(advancedSearch.productCountMin);
      const categoryCount =
        categoryProductCounts[category.id]?.total_products || 0;
      matchesProductCount = matchesProductCount && categoryCount >= minCount;
    }
    if (advancedSearch.productCountMax !== "") {
      const maxCount = parseInt(advancedSearch.productCountMax);
      const categoryCount =
        categoryProductCounts[category.id]?.total_products || 0;
      matchesProductCount = matchesProductCount && categoryCount <= maxCount;
    }

    // Apply filter type
    let matchesFilterType = true;
    if (filterType === "active") {
      matchesFilterType = category.is_active === true;
    } else if (filterType === "inactive") {
      matchesFilterType = category.is_active === false;
    } else if (filterType === "with_products") {
      const categoryCount =
        categoryProductCounts[category.id]?.total_products || 0;
      matchesFilterType = categoryCount > 0;
    } else if (filterType === "empty") {
      const categoryCount =
        categoryProductCounts[category.id]?.total_products || 0;
      matchesFilterType = categoryCount === 0;
    }

    return (
      matchesSearch &&
      matchesAdvancedSearch &&
      matchesProductCount &&
      matchesFilterType
    );
  });

  const totalCatalogs = stats?.total_categories ?? categories.length;
  const activeCatalogs =
    stats?.active_categories ??
    categories.filter((cat) => cat.is_active).length;
  const inactiveCatalogs =
    stats?.inactive_categories ?? Math.max(0, totalCatalogs - activeCatalogs);
  const unusedCatalogs =
    stats?.empty_categories ??
    categories.filter(
      (cat) => (categoryProductCounts[cat.id]?.total_products || 0) === 0
    ).length;

  const mostPopulatedCategoryRaw = categories.reduce<{
    name: string;
    count: number;
  } | null>((acc, category) => {
    const count = categoryProductCounts[category.id]?.total_products || 0;
    if (!acc || count > acc.count) {
      return {
        name: category.name,
        count,
      };
    }
    return acc;
  }, null);

  const mostPopulatedCategory =
    mostPopulatedCategoryRaw && mostPopulatedCategoryRaw.count > 0
      ? mostPopulatedCategoryRaw
      : null;

  const catalogStatsCards = [
    {
      name: "Total Catalogs",
      value: formatNumber(totalCatalogs),
      icon: FolderOpen,
      color: color.tertiary.tag1,
    },
    {
      name: "Active Catalogs",
      value: formatNumber(activeCatalogs),
      icon: CheckCircle,
      color: color.tertiary.tag4,
    },
    {
      name: "Inactive Catalogs",
      value: formatNumber(inactiveCatalogs),
      icon: XCircle,
      color: color.tertiary.tag3,
    },
    {
      name: "Unused Catalogs",
      value: formatNumber(unusedCatalogs),
      icon: Archive,
      color: color.tertiary.tag2,
    },
    {
      name: "Most Popular",
      value: mostPopulatedCategory?.name || "None",
      icon: Star,
      color: color.primary.accent,
      description: `${formatNumber(
        mostPopulatedCategory?.count ?? 0
      )} products`,
      title: mostPopulatedCategory?.name || undefined,
      valueClass: "text-xl",
      loading: false,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" variant="default" color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/products")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
              Product Catalogs
            </h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>
              Manage product catalogs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
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
            Create Catalog
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {catalogStatsCards.map((stat) => {
          const Icon = stat.icon;
          const valueClass = stat.valueClass ?? "text-3xl";
          const shouldMask = stat.loading ?? true;
          const displayValue =
            statsLoading && shouldMask ? "..." : stat.value ?? "...";

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
                      <p className={`${tw.cardSubHeading} ${tw.textSecondary}`}>
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

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${tw.textMuted}]`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search catalogs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
          />
        </div>

        <button
          onClick={() => setShowAdvancedFilters(true)}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm border"
          style={{
            borderColor: color.border.default,
            color: color.text.primary,
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor =
              color.interactive.hover;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor =
              "transparent";
          }}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>

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

      {/* Active Filters - Below Search Bar */}
      {hasAdvancedFilters() && (
        <div className="flex flex-wrap gap-2">
          {advancedSearch.exactName.trim() && (
            <span
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full border"
              style={{
                color: color.primary.accent,
                borderColor: color.primary.accent,
              }}
            >
              Name: "{advancedSearch.exactName}"
              <button
                onClick={() =>
                  setAdvancedSearch((prev) => ({ ...prev, exactName: "" }))
                }
                className="ml-2 hover:bg-gray-100 rounded-full p-0.5"
              >
                <XCircle className="w-3 h-3" />
              </button>
            </span>
          )}

          {advancedSearch.isActive !== null && (
            <span
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full border"
              style={{
                color: color.primary.accent,
                borderColor: color.primary.accent,
              }}
            >
              Status: {advancedSearch.isActive ? "Active" : "Inactive"}
              <button
                onClick={() =>
                  setAdvancedSearch((prev) => ({ ...prev, isActive: null }))
                }
                className="ml-2 hover:bg-gray-100 rounded-full p-0.5"
              >
                <XCircle className="w-3 h-3" />
              </button>
            </span>
          )}

          {(advancedSearch.createdAfter || advancedSearch.createdBefore) && (
            <span
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full border"
              style={{
                color: color.primary.accent,
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
                className="ml-2 hover:bg-gray-100 rounded-full p-0.5"
              >
                <XCircle className="w-3 h-3" />
              </button>
            </span>
          )}

          {(advancedSearch.productCountMin ||
            advancedSearch.productCountMax) && (
            <span
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full border"
              style={{
                color: color.primary.accent,
                borderColor: color.primary.accent,
              }}
            >
              Products: {advancedSearch.productCountMin || "0"} to{" "}
              {advancedSearch.productCountMax || "∞"}
              <button
                onClick={() =>
                  setAdvancedSearch((prev) => ({
                    ...prev,
                    productCountMin: "",
                    productCountMax: "",
                  }))
                }
                className="ml-2 hover:bg-gray-100 rounded-full p-0.5"
              >
                <XCircle className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearAdvancedSearch}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className={`bg-[${color.status.danger}]/10 border border-[${color.status.danger}]/20 rounded-xl p-4 flex items-center justify-end`}
        >
          <button
            onClick={() => loadCategories(true)}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: color.status.danger }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Catalogs */}
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
      ) : filteredCatalogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16 px-4">
          <h3 className={`${tw.cardHeading} text-gray-900 mb-1`}>
            {searchTerm ? "No catalogs found" : "No catalogs yet"}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first product catalog to organize your products"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
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
              Create Your First Catalog
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalogs.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className={`${tw.cardHeading} text-gray-900 flex-1`}>
                  {category.name}
                </h3>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditCatalog(category)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCatalog(category)}
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
                <div className="text-sm text-gray-600">
                  <div className="font-medium">
                    {categoryProductCounts[category.id]?.total_products || 0}{" "}
                    products
                  </div>
                </div>
                <button
                  onClick={() => handleViewProducts(category)}
                  className="px-3 py-1 rounded-lg text-sm font-medium"
                  style={{
                    color: color.primary.accent,
                    backgroundColor: "transparent",
                  }}
                  title="View & Assign Products"
                >
                  View Products
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCatalogs.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <div className="text-sm text-gray-600 mt-0.5">
                    <div className="font-medium">
                      {categoryProductCounts[category.id]?.total_products || 0}{" "}
                      products
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewProducts(category)}
                  className="px-3 py-1 rounded-lg text-sm font-medium"
                  style={{
                    color: color.primary.accent,
                    backgroundColor: "transparent",
                  }}
                  title="View & Assign Products"
                >
                  View Products
                </button>
                <button
                  onClick={() => handleEditCatalog(category)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCatalog(category)}
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

      {/* Create Catalog Modal */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCategoryCreated={handleCategoryCreated}
      />

      {/* Edit Catalog Modal */}
      {editingCatalog &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999] backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 border border-gray-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Catalog
                </h2>
                <button
                  onClick={() => {
                    setEditingCatalog(null);
                    setEditName("");
                    setEditDescription("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catalog Name *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                    placeholder="e.g., Data, Voice, SMS..."
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                    placeholder="Catalog description..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatalog(null);
                      setEditName("");
                      setEditDescription("");
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCatalog}
                    disabled={!editName.trim() || isUpdating}
                    className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
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
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>Update Catalog</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      <ProductsModal
        isOpen={isProductsModalOpen}
        onClose={() => {
          setIsProductsModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onRefreshCategories={loadCategories}
        onRefreshProductCounts={loadCategoryProductCounts}
        allProducts={allProducts}
        refreshAllProducts={loadAllProducts}
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
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => {
                setIsClosingModal(true);
                setTimeout(() => {
                  setShowAdvancedFilters(false);
                  setIsClosingModal(false);
                }, 300);
              }}
            />
            <div
              className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ${
                isClosingModal ? "translate-x-full" : "translate-x-0"
              }`}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Filter Catalogs
                </h2>
                <button
                  onClick={() => {
                    setIsClosingModal(true);
                    setTimeout(() => {
                      setShowAdvancedFilters(false);
                      setIsClosingModal(false);
                    }, 300);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Filter Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Filter Type
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Categories" },
                      { value: "active", label: "Active Only" },
                      { value: "with_products", label: "With Products" },
                      { value: "empty", label: "Empty Categories" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="filterType"
                          value={option.value}
                          checked={filterType === option.value}
                          onChange={(e) =>
                            setFilterType(
                              e.target.value as
                                | "all"
                                | "active"
                                | "with_products"
                                | "empty"
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Advanced Search */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Advanced Filters
                  </h3>

                  {/* Exact Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exact Name
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by exact name..."
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={
                        advancedSearch.isActive === null
                          ? ""
                          : String(advancedSearch.isActive)
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Product Count Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Products
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={advancedSearch.productCountMin}
                        onChange={(e) =>
                          setAdvancedSearch((prev) => ({
                            ...prev,
                            productCountMin: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Products
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={advancedSearch.productCountMax}
                        onChange={(e) =>
                          setAdvancedSearch((prev) => ({
                            ...prev,
                            productCountMax: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="∞"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={clearAdvancedSearch}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      setIsClosingModal(true);
                      setTimeout(() => {
                        setShowAdvancedFilters(false);
                        setIsClosingModal(false);
                      }, 300);
                    }}
                    className="px-4 py-2 text-white rounded-lg transition-all text-sm"
                    style={{ backgroundColor: color.primary.action }}
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
