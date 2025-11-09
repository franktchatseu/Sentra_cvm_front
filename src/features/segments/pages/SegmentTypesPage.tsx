import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Layers, Search, Edit, Trash2 } from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import type { SegmentType } from "../types/segment";
import { useToast } from "../../../contexts/ToastContext";
import { useConfirm } from "../../../contexts/ConfirmContext";

type SegmentTypeKey = SegmentType["type"] | "trigger";

type SegmentTypeDefinition = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const SEGMENT_TYPE_DEFINITIONS: SegmentTypeDefinition[] = [
  {
    id: 1,
    name: "Static",
    description:
      "Manually curated member lists that remain fixed until explicitly updated",
    isActive: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Dynamic",
    description:
      "Rule-driven segments that recalculate membership based on the latest customer data",
    isActive: true,
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16",
  },
  {
    id: 3,
    name: "Predictive",
    description:
      "Model-led segments produced by machine learning scoring or propensity models",
    isActive: true,
    createdAt: "2024-01-17",
    updatedAt: "2024-01-17",
  },
  {
    id: 4,
    name: "Behavioral",
    description:
      "Segments based on customer activity signals like recency, frequency, or channel engagement",
    isActive: true,
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18",
  },
  {
    id: 5,
    name: "Demographic",
    description:
      "Grouping built around demographic attributes such as age, region, or income band",
    isActive: true,
    createdAt: "2024-01-19",
    updatedAt: "2024-01-19",
  },
  {
    id: 6,
    name: "Geographic",
    description:
      "Location-based segmentation using country, region, or site-level metadata",
    isActive: true,
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
  },
  {
    id: 7,
    name: "Transactional",
    description:
      "Built using spend, frequency, or specific purchase patterns from billing and POS systems",
    isActive: true,
    createdAt: "2024-01-21",
    updatedAt: "2024-01-21",
  },
];

export default function SegmentTypesPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const [searchTerm, setSearchTerm] = useState("");

  const handleEditSegmentType = (segmentType: SegmentTypeDefinition) => {
    // Placeholder for edit functionality
    success(
      "Edit Segment Type",
      `Edit functionality for "${segmentType.name}" coming soon.`
    );
  };

  const handleDeleteSegmentType = async (
    segmentType: SegmentTypeDefinition
  ) => {
    const confirmed = await confirm({
      title: "Delete Segment Type",
      message: `Are you sure you want to delete "${segmentType.name}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      // Placeholder for delete functionality
      success(
        "Segment Type Deleted",
        `"${segmentType.name}" has been deleted successfully.`
      );
    } catch (err) {
      showError(
        "Error",
        err instanceof Error ? err.message : "Failed to delete segment type"
      );
    }
  };

  const filteredSegmentTypes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return SEGMENT_TYPE_DEFINITIONS;
    }

    return SEGMENT_TYPE_DEFINITIONS.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    });
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/segments")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
              Segment Types
            </h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>
              Manage different types of segments available in your system
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${color.text.muted}]`}
        />
        <input
          type="text"
          placeholder="Search segment types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 text-sm border border-[${color.border.default}] rounded-lg focus:outline-none`}
        />
      </div>

      {/* Segment Types Table */}
      <div
        className={`bg-white rounded-lg border border-[${color.border.default}] overflow-hidden`}
      >
        {filteredSegmentTypes.length === 0 ? (
          <div className="text-center py-12">
            <Layers
              className={`w-16 h-16 text-[${color.primary.accent}] mx-auto mb-4`}
            />
            <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
              {searchTerm ? "No Segment Types Found" : "No Segment Types"}
            </h3>
            <p className={`${tw.textMuted} mb-6`}>
              {searchTerm
                ? "Try adjusting your search terms."
                : "Get started by creating segment types."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`border-b ${tw.borderDefault}`}
                  style={{ background: color.surface.tableHeader }}
                >
                  <tr>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Segment Type
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Description
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Status
                    </th>
                    <th
                      className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider`}
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSegmentTypes.map((segmentType) => (
                    <tr
                      key={segmentType.id}
                      className="hover:bg-[${color.surface.cards}]/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div
                              className={`text-base font-semibold ${tw.textPrimary}`}
                            >
                              {segmentType.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${tw.textSecondary}`}>
                          {segmentType.description || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-base font-medium ${
                            segmentType.isActive
                              ? `bg-[${color.status.success}]/10 text-[${color.status.success}]`
                              : `bg-[${color.interactive.hover[100]}] text-[${color.interactive.hover[800]}]`
                          }`}
                        >
                          {segmentType.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditSegmentType(segmentType)}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              color: color.primary.action,
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = `${color.primary.action}10`;
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = "transparent";
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSegmentType(segmentType)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {filteredSegmentTypes.map((segmentType) => (
                <div
                  key={segmentType.id}
                  className="p-4 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-base font-semibold ${tw.textPrimary} mb-1`}
                      >
                        {segmentType.name}
                      </div>
                      <div className={`text-sm ${tw.textSecondary} mb-2`}>
                        {segmentType.description || "No description"}
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-base font-medium ${
                            segmentType.isActive
                              ? `bg-[${color.status.success}]/10 text-[${color.status.success}]`
                              : `bg-[${color.interactive.hover[100]}] text-[${color.interactive.hover[800]}]`
                          }`}
                        >
                          {segmentType.isActive ? "Active" : "Inactive"}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditSegmentType(segmentType)}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              color: color.primary.action,
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = `${color.primary.action}10`;
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = "transparent";
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSegmentType(segmentType)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
