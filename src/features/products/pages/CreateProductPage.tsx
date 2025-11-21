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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formData, setFormData] = useState<CreateProductRequest>({
    product_code: "",
    name: "",
    price: 0,
    description: "",
    category_id: undefined,
    currency: "USD",
    da_id: "",
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
      !formData.product_code.trim() ||
      !formData.name.trim() ||
      formData.price <= 0 ||
      !formData.da_id.trim()
    ) {
      setError("Product Code, Name, Price, and DA ID are required");
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

  const handleCategoryCreated = (categoryId: number) => {
    // Auto-select the newly created category
    setFormData({ ...formData, category_id: categoryId });
    // Trigger refresh of the CategorySelector
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/products")}
            className="p-2 rounded-md transition-colors"
            style={{ color: color.text.secondary }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
              Create New Product
            </h1>
            <p className={`${tw.textSecondary} mt-1 text-sm`}>
              Add a new product to your catalog
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="rounded-md p-4 flex items-center gap-3"
          style={{
            backgroundColor: `${color.status.danger}20`,
            borderColor: color.status.danger,
            borderWidth: "1px",
          }}
        >
          <AlertCircle
            className="w-5 h-5 flex-shrink-0"
            style={{ color: color.status.danger }}
          />
          <p style={{ color: color.status.danger }}>{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Information Card */}
        <div
          className="rounded-md border p-6"
          style={{
            borderColor: color.border.default,
            backgroundColor: color.surface.background,
          }}
        >
          <div className="space-y-5">
            {/* Product Code */}
            <div>
              <label
                className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
              >
                Product Code{" "}
                <span style={{ color: color.status.danger }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.product_code}
                onChange={(e) =>
                  handleInputChange("product_code", e.target.value)
                }
                className="w-full px-4 py-2.5 border rounded-md text-sm transition-all"
                style={{
                  borderColor: color.border.default,
                  outline: "none",
                }}
                placeholder="e.g., VOICE_BUNDLE_001"
                onFocus={(e) => {
                  e.target.style.borderColor = color.primary.accent;
                  e.target.style.boxShadow = `0 0 0 3px ${color.primary.accent}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = color.border.default;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Product Name */}
            <div>
              <label
                className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
              >
                Product Name{" "}
                <span style={{ color: color.status.danger }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-4 py-2.5 border rounded-md text-sm transition-all"
                style={{
                  borderColor: color.border.default,
                  outline: "none",
                }}
                placeholder="e.g., Premium Voice Bundle"
                onFocus={(e) => {
                  e.target.style.borderColor = color.primary.accent;
                  e.target.style.boxShadow = `0 0 0 3px ${color.primary.accent}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = color.border.default;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Price */}
            <div>
              <label
                className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
              >
                Price <span style={{ color: color.status.danger }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.price}
                onChange={(e) =>
                  handleInputChange("price", parseFloat(e.target.value) || 0)
                }
                className="w-full px-4 py-2.5 border rounded-md text-sm transition-all"
                style={{
                  borderColor: color.border.default,
                  outline: "none",
                }}
                placeholder="0.00"
                onFocus={(e) => {
                  e.target.style.borderColor = color.primary.accent;
                  e.target.style.boxShadow = `0 0 0 3px ${color.primary.accent}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = color.border.default;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* DA ID */}
            <div>
              <label
                className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
              >
                DA ID <span style={{ color: color.status.danger }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.da_id}
                onChange={(e) => handleInputChange("da_id", e.target.value)}
                className="w-full px-4 py-2.5 border rounded-md text-sm transition-all"
                style={{
                  borderColor: color.border.default,
                  outline: "none",
                }}
                placeholder="Enter DA ID"
                onFocus={(e) => {
                  e.target.style.borderColor = color.primary.accent;
                  e.target.style.boxShadow = `0 0 0 3px ${color.primary.accent}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = color.border.default;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label
                className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
              >
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
                refreshTrigger={refreshTrigger}
              />
            </div>

            {/* Description */}
            <div>
              <label
                className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
              >
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full px-4 py-2.5 border rounded-md text-sm transition-all resize-none"
                style={{
                  borderColor: color.border.default,
                  outline: "none",
                }}
                placeholder="Describe the product features and benefits..."
                onFocus={(e) => {
                  e.target.style.borderColor = color.primary.accent;
                  e.target.style.boxShadow = `0 0 0 3px ${color.primary.accent}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = color.border.default;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate("/dashboard/products")}
              className="px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
              style={{
                borderWidth: "1px",
                borderColor: color.border.default,
                color: color.text.secondary,
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = color.surface.cards;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: color.primary.action,
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Create Catalog Modal */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
}
