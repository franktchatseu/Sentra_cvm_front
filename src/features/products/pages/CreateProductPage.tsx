import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { CreateProductRequest } from "../types/product";
import { productService } from "../services/productService";
import ProductForm from "../components/ProductForm";
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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  // Initialize selectedCategoryIds from formData.category_id
  useEffect(() => {
    if (
      formData.category_id &&
      !selectedCategoryIds.includes(formData.category_id)
    ) {
      setSelectedCategoryIds([formData.category_id]);
    } else if (!formData.category_id && selectedCategoryIds.length > 0) {
      setSelectedCategoryIds([]);
    }
  }, [formData.category_id]);

  // Update formData.category_id when selectedCategoryIds changes (use first one)
  useEffect(() => {
    const firstCategoryId =
      selectedCategoryIds.length > 0 ? selectedCategoryIds[0] : undefined;
    if (formData.category_id !== firstCategoryId) {
      setFormData((prev) => ({
        ...prev,
        category_id: firstCategoryId, // Send only first to backend
      }));
    }
  }, [selectedCategoryIds]);

  // Preselect category from URL parameter
  useEffect(() => {
    const categoryIdParam = searchParams.get("categoryId");
    if (categoryIdParam) {
      const categoryId = parseInt(categoryIdParam);
      setSelectedCategoryIds([categoryId]);
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
    setSelectedCategoryIds([categoryId]);
    // Trigger refresh of the MultiCategorySelector
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
      <ProductForm
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryIdsChange={setSelectedCategoryIds}
        showCreateModal={showCreateModal}
        onShowCreateModal={setShowCreateModal}
        refreshTrigger={refreshTrigger}
        onCategoryCreated={handleCategoryCreated}
        submitButtonText="Create Product"
        loadingText="Creating..."
        onCancel={() => navigate("/dashboard/products")}
      />
    </div>
  );
}
