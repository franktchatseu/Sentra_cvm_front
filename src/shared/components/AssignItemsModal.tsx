import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  X,
  Check,
  MessageSquare,
  Package,
  Users,
  CheckCircle2,
} from "lucide-react";
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

  // Get icon based on item type
  const getItemIcon = () => {
    switch (itemName.toLowerCase()) {
      case "offer":
      case "offers":
        return <MessageSquare className="w-5 h-5" />;
      case "product":
      case "products":
        return <Package className="w-5 h-5" />;
      case "segment":
      case "segments":
        return <Users className="w-5 h-5" />;
      default:
        return <CheckCircle2 className="w-5 h-5" />;
    }
  };

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
        <div className="relative bg-white rounded-md shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{ backgroundColor: color.primary.accent + "20" }}
              >
                <div style={{ color: color.primary.accent }}>
                  {getItemIcon()}
                </div>
              </div>
              <div>
                <h2 className={`${tw.subHeading} text-gray-900`}>{title}</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {allItems.length} {itemName}s available •{" "}
                  {selectedItemIds.size} selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-6 pt-4 pb-4 border-b border-gray-200 bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color.primary.accent + "10" }}
                >
                  <div style={{ color: color.primary.accent }}>
                    {getItemIcon()}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm
                    ? `No ${itemName}s found`
                    : `No ${itemName}s available`}
                </h3>
                <p className="text-sm text-gray-500">
                  {searchTerm
                    ? `Try adjusting your search terms`
                    : `There are no ${itemName}s to assign at this time`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const isAssigned = assignedItemIds.includes(item.id);
                  const isSelected =
                    !isAssigned && selectedItemIds.has(item.id);

                  // Check for status if available
                  const status =
                    (item as any).status ||
                    (item as any).is_active !== undefined
                      ? (item as any).is_active
                        ? "active"
                        : "inactive"
                      : null;

                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        !isAssigned && handleToggleSelection(item.id)
                      }
                      className={`flex items-center gap-4 p-4 rounded-md border-2 transition-all cursor-pointer ${
                        isAssigned
                          ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "bg-blue-50 border-blue-400 shadow-md shadow-blue-100"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-blue-100"
                            : isAssigned
                            ? "bg-gray-200"
                            : "bg-gray-100"
                        }`}
                      >
                        <div
                          className={
                            isSelected
                              ? "text-blue-600"
                              : isAssigned
                              ? "text-gray-400"
                              : "text-gray-600"
                          }
                        >
                          {getItemIcon()}
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAssigned) handleToggleSelection(item.id);
                          }}
                          disabled={isAssigned}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            isAssigned
                              ? "border-gray-300 bg-gray-200 cursor-not-allowed"
                              : isSelected
                              ? "border-blue-600 bg-blue-600 shadow-sm"
                              : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
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
                            <Check className="w-4 h-4 text-white font-bold" />
                          )}
                        </button>
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {item.name}
                          </h4>
                          {isAssigned && (
                            <span
                              className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"
                              style={{
                                backgroundColor: color.primary.accent + "20",
                                color: color.primary.accent,
                              }}
                            >
                              Already in catalog
                            </span>
                          )}
                          {status && !isAssigned && (
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {status}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              {selectedItemIds.size > 0 ? (
                <>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color.primary.accent + "20" }}
                  >
                    <CheckCircle2
                      className="w-4 h-4"
                      style={{ color: color.primary.accent }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedItemIds.size} {itemName}
                    {selectedItemIds.size !== 1 ? "s" : ""} selected
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">
                  Select {itemName}s to assign
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md font-semibold transition-all hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                disabled={assigning}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSelected}
                disabled={assigning || selectedItemIds.size === 0}
                className="px-5 py-2.5 text-white rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:hover:shadow-md"
                style={{
                  backgroundColor:
                    assigning || selectedItemIds.size === 0
                      ? color.primary.action + "80"
                      : color.primary.action,
                }}
              >
                {assigning ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Assigning...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Assign Selected ({selectedItemIds.size})
                  </span>
                )}
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
