import { useState } from "react";
import { X } from "lucide-react";
import { productCategoryService } from "../../features/products/services/productCategoryService";
import { color } from "../utils/utils";
import { useToast } from "../../contexts/ToastContext";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated?: () => void;
}

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onCategoryCreated,
}: CreateCategoryModalProps) {
  const { success, error: showError } = useToast();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setIsCreating(true);
      await productCategoryService.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });

      success(
        "Category Created",
        `"${newCategoryName}" has been created successfully.`
      );
      onClose();
      setNewCategoryName("");
      setNewCategoryDescription("");
      onCategoryCreated?.();
    } catch (err) {
      console.error("Failed to create category:", err);
      showError(
        "Error",
        err instanceof Error ? err.message : "Failed to create category"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    onClose();
    setNewCategoryName("");
    setNewCategoryDescription("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Catalog</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catalog Name *
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
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
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
              placeholder="Catalog description..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || isCreating}
              className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{ backgroundColor: color.primary.action }}
            >
              {isCreating ? "Creating..." : "Create Catalog"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
