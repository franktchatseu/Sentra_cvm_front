import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { CreateProductRequest } from "../types/product";
import { productService } from "../services/productService";
import CategorySelector from "../../../shared/components/CategorySelector";
import CreateCategoryModal from "../../../shared/components/CreateCategoryModal";
import { tw, color } from "../../../shared/utils/utils";
import { useToast } from "../../../contexts/ToastContext";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateProductRequest>({
    product_id: "",
    name: "",
    da_id: "",
    description: "",
    category_id: undefined,
    is_active: true,
  });

  // Preselect category from URL parameter
  useEffect(() => {
    const categoryIdParam = searchParams.get("categoryId");
    if (categoryIdParam) {
      setFormData((prev) => ({
        ...prev,
        category_id: parseInt(categoryIdParam),
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.product_id.trim() ||
      !formData.name.trim() ||
      !formData?.da_id?.trim()
    ) {
      setError("Product ID, Name, and DA ID are required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await productService.createProduct(formData);
      success(
        "Product Created",
        `"${formData.name}" has been created successfully.`
      );
      navigate("/dashboard/products");
    } catch (err) {
      // Extract detailed error message from backend response
      let errorMessage = "Failed to create product";

      if (err && typeof err === "object") {
        // Check for response.data.error or response.data.message
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

      console.error("Product creation error:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateProductRequest,
    value: string | number | boolean | undefined
  ) => {
    setFormData({ ...formData, [field]: value });
  };

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
            Create New Product
          </h1>
          <p className="text-gray-600 text-sm">
            Add a new product to your catalog
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.product_id}
                onChange={(e) =>
                  handleInputChange("product_id", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm  "
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm  "
                placeholder="e.g., Premium Voice Bundle"
              />
            </div>

            {/* DA ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DA ID *
              </label>
              <input
                type="text"
                required
                value={formData.da_id}
                onChange={(e) => handleInputChange("da_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm  "
                placeholder="e.g., DA_001"
              />
              <p className="text-sm text-gray-500 mt-1">
                Data Analytics identifier
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
                onCreateCategory={() => setShowCreateModal(true)}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm  "
                placeholder="Describe the product features and benefits..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_active"
                    checked={formData.is_active === true}
                    onChange={() => handleInputChange("is_active", true)}
                    className="w-4 h-4 text-blue-600 border-gray-300 "
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_active"
                    checked={formData.is_active === false}
                    onChange={() => handleInputChange("is_active", false)}
                    className="w-4 h-4 text-blue-600 border-gray-300 "
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard/products")}
              className="px-3 py-2 text-sm rounded-lg flex items-center gap-2 border transition-colors"
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
              className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all"
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
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Create Catalog Modal */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
