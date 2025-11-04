import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Calendar,
  Tag,
  Power,
  PowerOff,
  Eye,
  EyeOff,
} from "lucide-react";
import { Product } from "../types/product";
import { ProductCategory } from "../types/productCategory";
import { productService } from "../services/productService";
import { productCategoryService } from "../services/productCategoryService";
import { color, tw, button } from "../../../shared/utils/utils";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success, error: showError } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productResponse, categoriesResponse] = await Promise.all([
        productService.getProductById(Number(id), true),
        productCategoryService.getAllCategories({
          limit: 100,
          skipCache: true,
        }),
      ]);

      if (!productResponse.success || !productResponse.data) {
        throw new Error("Product not found");
      }

      const productData = productResponse.data;
      console.log("Backend response for single product:", productResponse);
      console.log("Product data:", productData);
      setProduct(productData);

      // Find the category for this product
      const productCategory = (categoriesResponse.data || []).find(
        (cat) => cat.id === productData.category_id
      );
      setCategory(productCategory || null);
    } catch (err) {
      console.error("Failed to load product:", err);
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);

  const handleToggleStatus = async () => {
    if (!product) return;

    const confirmed = await confirm({
      title: product.is_active ? "Deactivate Product" : "Activate Product",
      message: `Are you sure you want to ${
        product.is_active ? "deactivate" : "activate"
      } "${product.name}"?`,
      type: product.is_active ? "warning" : "success",
      confirmText: product.is_active ? "Deactivate" : "Activate",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      if (product.is_active) {
        await productService.deactivateProduct(Number(id));
        success(
          "Product Deactivated",
          `"${product.name}" has been deactivated successfully.`
        );
      } else {
        await productService.activateProduct(Number(id));
        success(
          "Product Activated",
          `"${product.name}" has been activated successfully.`
        );
      }
      loadProduct(); // Reload to get updated status
    } catch (err) {
      console.error("Failed to toggle product status:", err);
      showError(
        "Error",
        err instanceof Error ? err.message : "Failed to update product status"
      );
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = await confirm({
      title: "Delete Product",
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await productService.deleteProduct(Number(id));
      success(
        "Product Deleted",
        `"${product.name}" has been deleted successfully.`
      );
      navigate("/dashboard/products");
    } catch (err) {
      console.error("Failed to delete product:", err);
      showError(
        "Error",
        err instanceof Error ? err.message : "Failed to delete product"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner
          variant="modern"
          size="xl"
          color="primary"
          className="mb-4"
        />
        <p className={`${tw.textMuted} font-medium text-sm`}>
          Loading product details...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Package
            className={`w-16 h-16 text-[${color.primary.accent}] mx-auto mb-4`}
          />
          <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
            {error ? "Error Loading Product" : "Product Not Found"}
          </h3>
          <p className={`${tw.textMuted} mb-6`}>
            {error || "The product you are looking for does not exist."}
          </p>
          <button
            onClick={() => navigate("/dashboard/products")}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto text-base text-white"
            style={{ backgroundColor: color.primary.action }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
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
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
              Product Details
            </h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>
              View and manage product information
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row xl:flex-row lg:flex-col gap-3">
          <button
            onClick={handleToggleStatus}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm w-fit text-white"
            style={{
              backgroundColor: button.secondaryAction.background,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.opacity = "1";
            }}
          >
            {product.is_active ? (
              <>
                <PowerOff className="w-4 h-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="w-4 h-4" />
                Activate
              </>
            )}
          </button>
          <button
            onClick={() => navigate(`/dashboard/products/${id}/edit`)}
            className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm w-fit"
            style={{ backgroundColor: button.action.background }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.opacity = "1";
            }}
          >
            <Edit className="w-4 h-4" />
            Edit Product
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-red-700 flex items-center gap-2 text-sm w-fit"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="space-y-6">
        {/* Main Product Info */}
        <div className="space-y-6">
          <div
            className={`bg-white rounded-xl border border-[${tw.borderDefault}] p-6`}
          >
            <div className="flex items-start space-x-4">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: color.primary.accent }}
              >
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${tw.textPrimary} mb-2`}>
                  {product.name}
                </h2>
                <p className={`${tw.textSecondary} mb-4`}>
                  {product.description || "No description available"}
                </p>
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      product.is_active
                        ? `bg-[${color.status.success}]/10 text-[${color.status.success}]`
                        : `bg-[${color.surface.cards}] text-[${color.text.primary}]`
                    }`}
                  >
                    {product.is_active ? (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                  {category && (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[${color.primary.accent}]/10 text-[${color.primary.accent}]`}
                    >
                      <Tag className="w-4 h-4 mr-1" />
                      {category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div
            className={`bg-white rounded-xl border border-[${tw.borderDefault}] p-6`}
          >
            <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>
              Product Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`text-sm font-medium ${tw.textMuted} block mb-1`}
                >
                  Product Code
                </label>
                <p className={`text-base ${tw.textPrimary} font-mono`}>
                  {product.product_code || product.id || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className={`text-sm font-medium ${tw.textMuted} block mb-1`}
                >
                  DA ID
                </label>
                <p className={`text-base ${tw.textPrimary} font-mono`}>
                  {product.da_id || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className={`text-sm font-medium ${tw.textMuted} block mb-1`}
                >
                  Price
                </label>
                <p className={`text-base ${tw.textPrimary} font-semibold`}>
                  $
                  {typeof product.price === "number"
                    ? product.price.toFixed(2)
                    : parseFloat(String(product.price || 0)).toFixed(2)}{" "}
                  {product.currency || "USD"}
                </p>
              </div>
              <div>
                <label
                  className={`text-sm font-medium ${tw.textMuted} block mb-1`}
                >
                  Category
                </label>
                <p className={`text-base ${tw.textPrimary}`}>
                  {category?.name || "No category assigned"}
                </p>
              </div>
              <div>
                <label
                  className={`text-sm font-medium ${tw.textMuted} block mb-1`}
                >
                  Created Date
                </label>
                <p className={`text-base ${tw.textPrimary} flex items-center`}>
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(product.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <label
                  className={`text-sm font-medium ${tw.textMuted} block mb-1`}
                >
                  Last Updated
                </label>
                <p className={`text-base ${tw.textPrimary} flex items-center`}>
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {product.updated_at
                    ? new Date(product.updated_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Never"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
