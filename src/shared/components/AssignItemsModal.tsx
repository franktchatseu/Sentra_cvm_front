import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, X, Check } from "lucide-react";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useToast } from "../../contexts/ToastContext";
import { color, tw } from "../utils/utils";

interface Item {
  id: number | string;
  name: string;
  description?: string;
  [key: string]: any;
}

interface AssignItemsModalProps<T extends Item> {
  isOpen: boolean;
  onClose: () => void;
  title: string; // e.g., "Assign Offers to Catalog"
  itemName: string; // e.g., "offer", "product", "segment"
  allItems: T[];
  assignedItemIds: (number | string)[]; // IDs of items already in catalog
  onAssign: (
    itemIds: (number | string)[]
  ) => Promise<{ success: number; failed: number; errors?: string[] }>;
  onRefresh?: () => void; // Callback to refresh counts after assignment
  loading?: boolean;
  searchPlaceholder?: string;
}

function AssignItemsModal<T extends Item>({
  isOpen,
  onClose,
  title,
  itemName,
  allItems,
  assignedItemIds,
  onAssign,
  onRefresh,
  loading = false,
  searchPlaceholder = `Search ${itemName}s...`,
}: AssignItemsModalProps<T>) {
  const { success: showSuccess, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number | string>>(
    new Set()
  );
  const [assigning, setAssigning] = useState(false);
  const [filteredItems, setFilteredItems] = useState<T[]>(allItems);

  // Filter items based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(allItems);
      return;
    }

    const filtered = allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredItems(filtered);
  }, [searchTerm, allItems]);

  // Reset selection when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedItemIds(new Set());
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleToggleSelection = (itemId: number | string) => {
    if (assignedItemIds.includes(itemId)) {
      return; // Don't allow selection of already assigned items
    }

    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleAssignSelected = async () => {
    if (selectedItemIds.size === 0) {
      showError("Please select at least one item to assign");
      return;
    }

    try {
      setAssigning(true);
      const itemIdsArray = Array.from(selectedItemIds);
      const result = await onAssign(itemIdsArray);

      if (result.success > 0) {
        if (result.failed > 0) {
          // Mixed results
          showError(
            `${result.success} ${itemName}(s) assigned successfully, ${result.failed} failed.`
          );
        } else {
          // All success
          showSuccess(`${result.success} ${itemName}(s) assigned successfully`);
        }

        // Refresh counts if callback provided
        if (onRefresh) {
          onRefresh();
        }

        // Close modal on success
        onClose();
      } else {
        // All failed
        showError(`Failed to assign ${itemName}s. Please try again.`);
      }
    } catch (err) {
      console.error(`Failed to assign ${itemName}s:`, err);
      showError(
        err instanceof Error
          ? err.message
          : `Failed to assign ${itemName}s. Please try again.`
      );
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className={`${tw.subHeading} text-gray-900`}>{title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Select {itemName}s to assign to this catalog
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm
                    ? `No ${itemName}s found matching "${searchTerm}"`
                    : `No ${itemName}s available`}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => {
                  const isAssigned = assignedItemIds.includes(item.id);
                  const isSelected =
                    !isAssigned && selectedItemIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                        isAssigned
                          ? "bg-gray-50 border-gray-200 opacity-60"
                          : isSelected
                          ? "bg-blue-50 border-blue-300"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* Checkbox */}
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleToggleSelection(item.id)}
                            disabled={isAssigned}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isAssigned
                                ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                                : isSelected
                                ? "border-blue-600 bg-blue-600"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            title={
                              isAssigned
                                ? "Already in catalog"
                                : isSelected
                                ? "Deselect"
                                : "Select"
                            }
                          >
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white" />
                            )}
                          </button>
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {item.name}
                            </h4>
                            {isAssigned && (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                                style={{
                                  backgroundColor: color.primary.accent + "20",
                                  color: color.primary.accent,
                                }}
                              >
                                Already in catalog
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {selectedItemIds.size > 0
                ? `${selectedItemIds.size} ${itemName}(s) selected`
                : `Select ${itemName}s to assign`}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold transition-colors hover:bg-gray-50"
                disabled={assigning}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSelected}
                disabled={assigning || selectedItemIds.size === 0}
                className="px-4 py-2 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor:
                    assigning || selectedItemIds.size === 0
                      ? color.primary.action + "80"
                      : color.primary.action,
                }}
              >
                {assigning ? "Assigning..." : "Assign Selected"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AssignItemsModal;
