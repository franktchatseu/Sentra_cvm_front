import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, Search, Plus } from "lucide-react";
import { color } from "../utils/utils";
import LoadingSpinner from "./ui/LoadingSpinner";
import AssignItemsModal from "./AssignItemsModal";

export interface CatalogItem {
  id: number | string;
  name: string;
  description?: string;
  status?: string;
  [key: string]: any; // Allow additional properties
}

interface CatalogItemsModalProps<T extends CatalogItem> {
  isOpen: boolean;
  onClose: () => void;
  category: {
    id: number | string;
    name: string;
  } | null;
  items: T[];
  loading?: boolean;
  error?: string | null;
  entityName: string; // "product", "offer", "segment", "campaign"
  entityNamePlural: string; // "products", "offers", "segments", "campaigns"
  assignRoute: string; // Route to assignment page (kept for backward compatibility, not used)
  viewRoute: (id: number | string) => string; // Function to generate view route
  onRemove: (id: number | string) => Promise<void>;
  removingId?: number | string | null;
  renderItem?: (item: T) => React.ReactNode; // Custom item renderer
  renderStatus?: (item: T) => React.ReactNode; // Custom status renderer
  onRefresh?: () => void | Promise<void>; // Callback to refresh items after assignment
}

export default function CatalogItemsModal<T extends CatalogItem>({
  isOpen,
  onClose,
  category,
  items,
  loading = false,
  error = null,
  entityName,
  entityNamePlural,
  assignRoute: _assignRoute,
  viewRoute,
  onRemove,
  removingId = null,
  renderItem,
  renderStatus,
  onRefresh,
}: CatalogItemsModalProps<T>) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Map entity names to itemType for AssignItemsModal
  const getItemType = (): "offers" | "products" | "segments" | "campaigns" => {
    if (entityNamePlural === "products") return "products";
    if (entityNamePlural === "offers") return "offers";
    if (entityNamePlural === "segments") return "segments";
    if (entityNamePlural === "campaigns") return "campaigns";
    return "products"; // default
  };

  useEffect(() => {
    if (isOpen && category) {
      setSearchTerm("");
    }
  }, [isOpen, category]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items]);

  if (!isOpen || !category) return null;

  const displayItems = filteredItems;
  const itemCount = items.length;
  const displayCount = displayItems.length;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-md shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {entityNamePlural.charAt(0).toUpperCase() +
                  entityNamePlural.slice(1)}{" "}
                in "{category.name}"
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {itemCount} {entityName}
                {itemCount !== 1 ? "s" : ""} found
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${entityNamePlural}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner />
              </div>
            ) : displayCount === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {searchTerm
                    ? `No ${entityNamePlural} found`
                    : `No ${entityNamePlural} in this catalog`}
                </h3>
                <p className="text-sm text-gray-600">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : `Create a new ${entityName} or assign an existing one to this catalog`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      {renderItem ? (
                        renderItem(item)
                      ) : (
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.name || `Unknown ${entityName}`}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.description || "No description"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStatus ? (
                        renderStatus(item)
                      ) : item.status ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === "active"
                              ? "bg-green-100 text-green-800"
                              : item.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      ) : null}
                      <button
                        onClick={() => {
                          navigate(viewRoute(item.id));
                        }}
                        className="px-3 py-1 text-white rounded-md text-sm font-medium transition-colors"
                        style={{ backgroundColor: color.primary.action }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        disabled={removingId === item.id}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {removingId === item.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Add Button */}
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-md transition-all"
              style={{ backgroundColor: color.primary.action }}
            >
              <Plus className="w-4 h-4" />
              Add {entityNamePlural} to this catalog
            </button>
          </div>
        </div>
      </div>

      {/* Assign Items Modal */}
      {category && (
        <AssignItemsModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          catalogId={category.id}
          itemType={getItemType()}
          onAssignComplete={async () => {
            setIsAssignModalOpen(false);
            if (onRefresh) {
              await onRefresh();
            }
          }}
        />
      )}
    </div>,
    document.body
  );
}
