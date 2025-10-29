import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Edit, Trash2, Grid, List } from "lucide-react";
import { ProductCategory } from "../types/productCategory";
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
}

function ProductsModal({
  isOpen,
  onClose,
  category,
  onRefreshCategories,
}: ProductsModalProps) {
  // const navigate = useNavigate();
  const { success: showToast, error: showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [allProductsList, setAllProductsList] = useState<Product[]>([]);
  const [assigningProduct, setAssigningProduct] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      loadProducts();
      setSearchTerm("");
    }
  }, [isOpen, category]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const response = await productService.getProducts({
        categoryId: Number(category.id),
        pageSize: 100,
        skipCache: true,
      });
      setProducts(response.data || []);
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

  const loadUnassignedProducts = async () => {
    try {
      const response = await productService.getProducts({
        pageSize: 100,
        skipCache: true,
      });
      // Get products not in this category or with no category
      const unassigned = (response.data || []).filter(
        (p: Product) =>
          !p.category_id || Number(p.category_id) !== Number(category?.id)
      );
      setAllProductsList(unassigned);
    } catch (err) {
      console.error("Failed to load unassigned products:", err);
      setAllProductsList([]);
    }
  };

  const handleAssignProduct = async (productId: string) => {
    if (!category) return;

    try {
      setAssigningProduct(true);
      await productService.updateProduct(Number(productId), {
        category_id: Number(category.id),
      });
      showToast("Product assigned successfully");
      setShowAssignDropdown(false);
      loadProducts(); // Refresh the products in this category
      loadUnassignedProducts(); // Refresh unassigned list
      onRefreshCategories(); // Refresh parent categories list with updated counts
    } catch (err) {
      console.error("Failed to assign product:", err);
      showError(
        err instanceof Error ? err.message : "Failed to assign product"
      );
    } finally {
      setAssigningProduct(false);
    }
  };

  if (!isOpen || !category) return null;

  return createPortal(
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
                Products in {category.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                found
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>

          {/* Search and Actions */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${tw.textMuted}]`}
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
                <div className="relative">
                  <button
                    onClick={() => {
                      if (!showAssignDropdown) {
                        loadUnassignedProducts();
                      }
                      setShowAssignDropdown(!showAssignDropdown);
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap hover:bg-gray-50"
                    disabled={assigningProduct}
                  >
                    Assign Existing Product
                  </button>

                  {/* Dropdown for available products */}
                  {showAssignDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                      {allProductsList.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No available products to assign
                        </div>
                      ) : (
                        <div className="py-2">
                          {allProductsList.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleAssignProduct(product.id!)}
                              disabled={assigningProduct}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 border-b border-gray-100 last:border-0"
                            >
                              <div className="font-medium text-gray-900 text-sm">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {product.description || "No description"}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* <button
                  onClick={handleCreateProduct}
                  className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap"
                  style={{ backgroundColor: color.primary.action }}
                >
                  Create New Product
                </button> */}
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
                  onClick={loadProducts}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                {/* Icon removed */}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm
                    ? "No products found"
                    : "No products in this category"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Create a new product in this category"}
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

  useEffect(() => {
    const loadData = async () => {
      // Load products first, then categories (to avoid race condition)
      const products = await loadAllProducts();
      await loadCategories(products);
    };
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllProducts = async () => {
    try {
      const response = await productService.getProducts({
        pageSize: 100, // Get products to count by category (reduced from 1000)
        skipCache: true,
      });
      const products = response.data || [];
      setAllProducts(products);
      return products;
    } catch (err) {
      console.error("Failed to load products for counting:", err);
      setAllProducts([]);
      return [];
    }
  };

  const getProductCountForCategory = (
    categoryId: number,
    products: Product[]
  ) => {
    return products.filter(
      (product) => Number(product.category_id) === categoryId
    ).length;
  };

  const loadCategories = async (productsData?: Product[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productCategoryService.getAllCategories({
        limit: 100,
        skipCache: true, // Always get fresh data
      });

      // Use provided products data or fall back to state
      const productsToUse = productsData || allProducts;

      // Add product count to each category by counting from products
      const categoriesWithCounts = (response.data || []).map(
        (category: ProductCategory) => ({
          ...category,
          productCount: getProductCountForCategory(category.id, productsToUse),
        })
      );

      setCategories(categoriesWithCounts);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCreated = () => {
    loadCategories();
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
      loadCategories();
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
      loadCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      showError(
        "Error",
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  const filteredCatalogs = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
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

      {/* Search */}
      {/* Search and View Toggle */}
      <div className=" flex items-center gap-4">
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
        <div className="flex items-center gap-2p-1">
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

      {/* Error Message */}
      {error && (
        <div
          className={`bg-[${color.status.danger}]/10 border border-[${color.status.danger}]/20 text-[${color.status.danger}] rounded-xl p-4`}
        >
          <p>{error}</p>
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
          {/* Icon removed */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? "No catalogs found" : "No catalogs yet"}
          </h3>
          <p className="text-gray-500 mb-6">
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
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
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
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  {category.productCount || 0} product
                  {category.productCount !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => handleViewProducts(category)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View & Assign Products"
                >
                  View
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
                  <p className="text-sm text-gray-600 mt-0.5">
                    {category.productCount || 0} product
                    {category.productCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewProducts(category)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View & Assign Products"
                >
                  View
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
        onRefreshCategories={async () => {
          const products = await loadAllProducts();
          await loadCategories(products);
        }}
      />
    </div>
  );
}
