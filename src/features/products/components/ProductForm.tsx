import { Save } from "lucide-react";
import { CreateProductRequest, UpdateProductRequest } from "../types/product";
import MultiCategorySelector from "../../../shared/components/MultiCategorySelector";
import CreateCategoryModal from "../../../shared/components/CreateCategoryModal";
import { tw, color } from "../../../shared/utils/utils";

interface ProductFormProps {
  formData: CreateProductRequest | UpdateProductRequest;
  onInputChange: (
    field: keyof (CreateProductRequest | UpdateProductRequest),
    value: string | number | boolean | undefined
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  selectedCategoryIds: number[];
  onCategoryIdsChange: (ids: number[]) => void;
  showCreateModal: boolean;
  onShowCreateModal: (show: boolean) => void;
  refreshTrigger: number;
  onCategoryCreated: (categoryId: number) => void;
  submitButtonText?: string;
  loadingText?: string;
  onCancel?: () => void;
}

export default function ProductForm({
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  selectedCategoryIds,
  onCategoryIdsChange,
  showCreateModal,
  onShowCreateModal,
  refreshTrigger,
  onCategoryCreated,
  submitButtonText = "Save Product",
  loadingText = "Saving...",
  onCancel,
}: ProductFormProps) {
  return (
    <>
      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
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
                value={formData.product_code || ""}
                onChange={(e) => onInputChange("product_code", e.target.value)}
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
                value={formData.name || ""}
                onChange={(e) => onInputChange("name", e.target.value)}
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
                value={formData.price || 0}
                onChange={(e) =>
                  onInputChange("price", parseFloat(e.target.value) || 0)
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
                value={formData.da_id || ""}
                onChange={(e) => onInputChange("da_id", e.target.value)}
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
              <MultiCategorySelector
                value={selectedCategoryIds}
                onChange={onCategoryIdsChange}
                placeholder="Select catalog(s)"
                entityType="product"
                allowCreate={true}
                onCreateCategory={() => onShowCreateModal(true)}
                refreshTrigger={refreshTrigger}
                className="w-full"
              />
              {/* <p className="text-xs text-gray-500 mt-1">
                You can select multiple catalogs. Only the first one will be
                saved to the backend.
              </p> */}
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
                value={formData.description || ""}
                onChange={(e) => onInputChange("description", e.target.value)}
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
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
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
            )}
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
                  {loadingText}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {submitButtonText}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Create Catalog Modal */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => onShowCreateModal(false)}
        onCategoryCreated={onCategoryCreated}
      />
    </>
  );
}
