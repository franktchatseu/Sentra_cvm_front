import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, Save, AlertCircle } from "lucide-react";
import { Product, UpdateProductRequest } from "../types/product";
import { productService } from "../services/productService";
import CategorySelector from "../../../shared/components/CategorySelector";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { color, tw } from "../../../shared/utils/utils";

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<UpdateProductRequest>({
    product_code: "",
    name: "",
    da_id: "",
    description: "",
    category_id: undefined,
    price: 0,
    currency: "USD",
  });

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProduct = async () => {
    try {
      setIsLoadingProduct(true);
      setError(null);
      const response = await productService.getProductById(Number(id), true);

      if (!response.data) {
        throw new Error("Product not found");
      }

      const productData = response.data;
      setProduct(productData);

      // Populate form with existing data based on API response structure
      setFormData({
        product_code: productData.product_code || "",
        name: productData.name || "",
        da_id: productData.da_id || "",
        description: productData.description || "",
        category_id: productData.category_id,
        price: productData.price || 0,
        currency: productData.currency || "USD",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name?.trim() ||
      !formData.product_code?.trim() ||
      !formData.da_id?.trim()
    ) {
      setError("Product code, name, and DA ID are required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Remove is_active from update payload as backend doesn't accept it
      // Status is controlled via activate/deactivate endpoints, not through update
      const { is_active, ...updateData } = formData;

      // Update product data
      await productService.updateProduct(Number(id), updateData);

      navigate("/dashboard/products");
    } catch (err) {
      // Extract detailed error message from backend response
      let errorMessage = "Failed to update product";

      if (err instanceof Error) {
        // Error from service (already extracted and translated to user-friendly message)
        errorMessage = err.message;
      } else if (err && typeof err === "object") {
        // Fallback for axios-style errors or other error formats
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      console.error("Product update error:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdateProductRequest,
    value: string | number | boolean | undefined
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  if (isLoadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner
          variant="modern"
          size="xl"
          color="primary"
          className="mb-4"
        />
        <p className={`${tw.textMuted} font-medium text-sm`}>
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Product not found
          </h3>
          <p className="text-gray-500 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/dashboard/products")}
            className="bg-[#3b8169] hover:bg-[#2d5f4e] text-white px-4 py-2 rounded-md text-base font-semibold transition-all duration-200"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/dashboard/products")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Edit Product
          </h1>
          <p className="text-gray-600 text-sm">Update product information</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8 transition-shadow hover:shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.product_code}
                onChange={(e) =>
                  handleInputChange("product_code", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
                placeholder="e.g., VOICE_BUNDLE_001"
              />
              <p className="text-sm text-gray-500 mt-1">
                Unique identifier for the product
              </p>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all resize-none"
                placeholder="e.g., Premium Voice Bundle"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.price}
                onChange={(e) =>
                  handleInputChange("price", parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-1">Product price</p>
            </div>

            {/* DA ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DA ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.da_id}
                onChange={(e) => handleInputChange("da_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
                placeholder="Enter DA ID"
              />
              <p className="text-sm text-gray-500 mt-1">
                Digital Asset identifier
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catalog
              </label>
              <CategorySelector
                value={formData.category_id}
                onChange={(categoryId) =>
                  handleInputChange("category_id", categoryId)
                }
                placeholder="Select Catalog"
                allowCreate={true}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all resize-none"
                placeholder="Describe the product features and benefits..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard/products")}
              className="px-3 py-2 text-sm rounded-md flex items-center gap-2 border transition-colors"
              style={{
                borderColor: color.border.default,
                color: color.text.secondary,
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-2 rounded-md text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all"
              style={{ backgroundColor: color.primary.action }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
