import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  Settings,
  Trash2,
  Play,
  Pause,
  XCircle,
  Package,
  TrendingUp,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { Product } from "../types/product";
import { ProductCategory } from "../types/productCategory";
import { productService } from "../services/productService";
import { productCategoryService } from "../services/productCategoryService";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import { color, tw } from "../../../shared/utils/utils";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useToast } from "../../../contexts/ToastContext";

interface ProductFilters {
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    pageSize: 10,
    sortBy: "created_at",
    sortDirection: "DESC",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<{
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    averagePrice: number;
  } | null>(null);
  const [topSelling, setTopSelling] = useState<Product[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const { confirm } = useConfirm();
  const { success: showToast, error: showError } = useToast();

  const loadCategories = async () => {
    try {
      const response = await productCategoryService.getAllCategories({
        limit: 100,
        skipCache: true,
      });
      setCategories(response.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const limit = filters.pageSize || 10;
      const offset = ((filters.page || 1) - 1) * limit;

      let response;
      let productsList: Product[] = [];

      // Use superSearch if we have filters or need inactive products
      if (
        filters.search ||
        filters.categoryId ||
        filters.isActive !== undefined
      ) {
        response = await productService.superSearch({
          ...(filters.search && { name: filters.search }),
          ...(filters.categoryId && { category_id: filters.categoryId }),
          ...(filters.isActive !== undefined && {
            is_active: filters.isActive,
          }),
          limit,
          offset,
          skipCache: true,
        });
        productsList = response.data || [];
      } else {
        response = await productService.getAllProducts({
          limit,
          offset,
          skipCache: true,
        });
        productsList = response.data || [];
      }

      // Client-side sorting if sortBy and sortDirection are provided
      if (filters.sortBy && filters.sortDirection) {
        productsList = [...productsList].sort((a, b) => {
          let aValue: any;
          let bValue: any;

          switch (filters.sortBy) {
            case "created_at":
              aValue = new Date(a.created_at).getTime();
              bValue = new Date(b.created_at).getTime();
              break;
            case "name":
              aValue = (a.name || "").toLowerCase();
              bValue = (b.name || "").toLowerCase();
              break;
            case "product_id":
              aValue = (a.product_code || a.id || "").toString().toLowerCase();
              bValue = (b.product_code || b.id || "").toString().toLowerCase();
              break;
            default:
              aValue = a[filters.sortBy as keyof Product];
              bValue = b[filters.sortBy as keyof Product];
          }

          if (aValue < bValue) {
            return filters.sortDirection === "ASC" ? -1 : 1;
          }
          if (aValue > bValue) {
            return filters.sortDirection === "ASC" ? 1 : -1;
          }
          return 0;
        });
      }

      setProducts(productsList);
      const totalCount = response.pagination?.total || 0;
      setTotal(totalCount);
      setTotalPages(Math.ceil(totalCount / limit) || 1);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load products";
      showError("Failed to load products", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadStats();
  }, [loadProducts]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);

      // Get product stats
      const statsResponse = await productService.getStats(true);
      if (statsResponse.success && statsResponse.data) {
        setStats({
          totalProducts: statsResponse.data.total_products || 0,
          activeProducts: statsResponse.data.active_products || 0,
          inactiveProducts: statsResponse.data.inactive_products || 0,
          averagePrice: statsResponse.data.average_price || 0,
        });
      }

      // Get top selling products
      const topSellingResponse = await productService.getTopSelling({
        limit: 5,
        skipCache: true,
      });
      if (topSellingResponse.data) {
        setTopSelling(topSellingResponse.data);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleFilterChange = (
    key: keyof ProductFilters,
    value: string | number | boolean | undefined
  ) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      if (product.is_active) {
        await productService.deactivateProduct(Number(product.id));
        showToast(
          "Product Deactivated",
          `"${product.name}" has been deactivated successfully.`
        );
      } else {
        await productService.activateProduct(Number(product.id));
        showToast(
          "Product Activated",
          `"${product.name}" has been activated successfully.`
        );
      }
      loadProducts();
    } catch (err) {
      console.error("Failed to update product status:", err);
      showError("Failed to update product status", "Please try again later.");
    }
  };

  const handleDelete = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const productName = product?.name || "this product";

    const confirmed = await confirm({
      title: "Delete Product",
      message: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await productService.deleteProduct(Number(productId));
      showToast(
        "Product Deleted",
        `"${productName}" has been deleted successfully.`
      );
      loadProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
      showError("Error", "Failed to delete product. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
            Products Management
          </h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>
            Manage your product catalog
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/dashboard/products/create")}
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
            <Plus className="w-4 h-4" />
            Create Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Products Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Products
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  stats?.totalProducts || 0
                )}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${color.tertiary.tag1}20` }}
            >
              <Package
                className="w-6 h-6"
                style={{ color: color.tertiary.tag1 }}
              />
            </div>
          </div>
        </div>

        {/* Active Products Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Active Products
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  stats?.activeProducts || 0
                )}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${color.tertiary.tag4}20` }}
            >
              <TrendingUp
                className="w-6 h-6"
                style={{ color: color.tertiary.tag4 }}
              />
            </div>
          </div>
        </div>

        {/* Inactive Products Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Inactive Products
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  stats?.inactiveProducts || 0
                )}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${color.tertiary.tag3}20` }}
            >
              <XCircle
                className="w-6 h-6"
                style={{ color: color.tertiary.tag3 }}
              />
            </div>
          </div>
        </div>

        {/* Average Price Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Average Price
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="text-gray-400">...</span>
                ) : stats?.averagePrice ? (
                  `$${stats.averagePrice.toFixed(2)}`
                ) : (
                  "$0.00"
                )}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${color.tertiary.tag2}20` }}
            >
              <DollarSign
                className="w-6 h-6"
                style={{ color: color.tertiary.tag2 }}
              />
            </div>
          </div>
        </div>

        {/* Top Selling Products Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Top Selling
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  topSelling.length || 0
                )}
              </p>
              {topSelling.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {topSelling[0]?.name || "Products"}
                </p>
              )}
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${color.tertiary.tag1}20` }}
            >
              <BarChart3
                className="w-6 h-6"
                style={{ color: color.tertiary.tag1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${tw.textMuted}]`}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search || ""}
              onChange={(e) => handleSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 text-sm  border border-[${tw.borderDefault}] rounded-lg focus:outline-none`}
            />
          </div>

          {/* Category Filter */}
          <HeadlessSelect
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((category) => ({
                value: category.id.toString(),
                label: category.name,
              })),
            ]}
            value={filters.categoryId?.toString() || ""}
            onChange={(value) =>
              handleFilterChange(
                "categoryId",
                value ? Number(value) : undefined
              )
            }
            placeholder="All Categories"
            className="min-w-[160px] text-sm"
          />

          {/* Status Filter */}
          <HeadlessSelect
            options={[
              { value: "", label: "All Status" },
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
            value={
              filters.isActive === undefined ? "" : filters.isActive.toString()
            }
            onChange={(value) =>
              handleFilterChange(
                "isActive",
                value === "" ? undefined : value === "true"
              )
            }
            placeholder="All Status"
            className="min-w-[120px] text-sm"
          />

          {/* Sort */}
          <HeadlessSelect
            options={[
              { value: "created_at-DESC", label: "Newest First" },
              { value: "created_at-ASC", label: "Oldest First" },
              { value: "name-ASC", label: "Name A-Z" },
              { value: "name-DESC", label: "Name Z-A" },
              { value: "product_id-ASC", label: "Product ID A-Z" },
            ]}
            value={`${filters.sortBy}-${filters.sortDirection}`}
            onChange={(value) => {
              const [sortBy, sortDirection] = value.toString().split("-");
              setFilters({
                ...filters,
                sortBy,
                sortDirection: sortDirection as "ASC" | "DESC",
              });
            }}
            placeholder="Sort by"
            className="min-w-[140px] text-sm"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className={`bg-[${color.status.danger}]/10 border border-[${color.status.danger}]/20 rounded-xl p-4 mb-6 flex items-center justify-end`}
        >
          <button
            onClick={() => loadProducts()}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: color.status.danger }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Products Table */}
      <div
        className={`bg-white rounded-lg shadow-sm border border-[${tw.borderDefault}] overflow-hidden`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className={`animate-spin rounded-full h-8 w-8 border-b-2 border-[${color.primary.action}]`}
            ></div>
            <span className={`ml-3 ${tw.textSecondary}`}>
              Loading products...
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            {/* Icon removed */}
            <h3 className={`${tw.cardHeading} ${tw.textPrimary} mb-1`}>
              No products found
            </h3>
            <p className={`text-sm ${tw.textMuted} mb-6`}>
              Get started by creating your first product.
            </p>
            <button
              onClick={() => navigate("/dashboard/products/create")}
              className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto text-base text-white"
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
              <Plus className="w-5 h-5" />
              Create Product
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`border-b ${tw.borderDefault}`}
                  style={{ background: color.surface.tableHeader }}
                >
                  <tr>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Product
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Product ID
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      DA ID
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Category
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Status
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Created
                    </th>
                    <th
                      className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-[${tw.borderDefault}]`}>
                  {products.map((product) => {
                    const categoryName =
                      categories.find(
                        (cat) => cat.id === parseInt(product.category_id)
                      )?.name || "Uncategorized";
                    const status = product.is_active ? "Active" : "Inactive";
                    const statusBadge = product.is_active
                      ? `bg-[${color.status.success}] text-[${color.status.success}]`
                      : `bg-[${color.surface.cards}] text-[${color.text.primary}]`;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div
                            className={`text-base font-semibold ${tw.textPrimary}`}
                          >
                            {product.name}
                          </div>
                          <div
                            className={`text-sm ${tw.textMuted} truncate max-w-xs`}
                          >
                            {product.description || "No description"}
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${tw.textPrimary}`}>
                          {product.product_id || product.id || "N/A"}
                        </td>
                        <td className={`px-6 py-4 text-sm ${tw.textPrimary}`}>
                          {product.da_id || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-base">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-[${color.primary.accent}]/10 text-[${color.primary.accent}]`}
                          >
                            {categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-base">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${statusBadge}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm ${tw.textMuted}`}>
                          {new Date(product.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                navigate(`/dashboard/products/${product.id}`)
                              }
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/products/${product.id}/edit`
                                )
                              }
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(product)}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                              title={
                                product.is_active ? "Deactivate" : "Activate"
                              }
                            >
                              {product.is_active ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && (products.length > 0 || total > 0) && (
        <div
          className={`bg-white rounded-xl shadow-sm border ${tw.borderDefault} px-4 sm:px-6 py-4`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div
              className={`text-base ${tw.textSecondary} text-center sm:text-left`}
            >
              {products.length === 0 ? (
                "No products on this page"
              ) : (
                <>
                  Showing{" "}
                  {((filters.page || 1) - 1) * (filters.pageSize || 10) + 1} to{" "}
                  {Math.min(
                    (filters.page || 1) * (filters.pageSize || 10),
                    total
                  )}{" "}
                  of {total} products
                </>
              )}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange((filters.page || 1) - 1)}
                disabled={filters.page === 1}
                className={`p-2 border ${tw.borderDefault} rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-base whitespace-nowrap`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`text-base ${tw.textSecondary} px-2`}>
                Page {filters.page || 1} of {totalPages || 1}
              </span>
              <button
                onClick={() => handlePageChange((filters.page || 1) + 1)}
                disabled={(filters.page || 1) >= (totalPages || 1)}
                className={`p-2 border ${tw.borderDefault} rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-base whitespace-nowrap`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
