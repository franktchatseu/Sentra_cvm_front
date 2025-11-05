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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 transition-shadow hover:shadow-md">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all resize-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all resize-none"
                placeholder="Describe the product features and benefits..."
              />
            </div>

            {/* Currency - COMMENTED OUT */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency || "USD"}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="KES">KES</option>
              </select>
            </div> */}
          </div>

          {/* Optional Fields - COMMENTED OUT */}
          {/* 
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Optional Fields
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "cost",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-8"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {formData.currency || "USD"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Product cost for margin calculation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DA ID
                </label>
                <input
                  type="text"
                  value={formData.da_id || ""}
                  onChange={(e) => handleInputChange("da_id", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
                  placeholder="e.g., DA_001"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Data Analytics identifier
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validity (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.validity_days || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "validity_days",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
                  placeholder="e.g., 30"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Product validity in days
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validity (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.validity_hours || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "validity_hours",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
                  placeholder="e.g., 24"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Product validity in hours
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.available_quantity || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "available_quantity",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
                  placeholder="e.g., 100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Stock quantity available
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requires Inventory
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requires_inventory || false}
                    onChange={(e) =>
                      handleInputChange("requires_inventory", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Track inventory for this product
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective From
                </label>
                <input
                  type="datetime-local"
                  value={formData.effective_from || ""}
                  onChange={(e) =>
                    handleInputChange("effective_from", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
                />
                <p className="text-sm text-gray-500 mt-1">
                  When the product becomes available
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective To
                </label>
                <input
                  type="datetime-local"
                  value={formData.effective_to || ""}
                  onChange={(e) =>
                    handleInputChange("effective_to", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b8169] focus:border-transparent transition-all"
                />
                <p className="text-sm text-gray-500 mt-1">
                  When the product expires
                </p>
              </div>
            </div>
          </div>
          */}

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
