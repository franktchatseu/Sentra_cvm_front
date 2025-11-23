import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  Segment,
  CreateSegmentRequest,
  SegmentConditionGroup,
} from "../types/segment";
import SegmentConditionsBuilder from "./SegmentConditionsBuilder";
import { segmentService } from "../services/segmentService";
import { color, tw } from "../../../shared/utils/utils";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import MultiCategorySelector from "../../../shared/components/MultiCategorySelector";

interface SegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (segment: Segment) => void;
  segment?: Segment | null;
}

export default function SegmentModal({
  isOpen,
  onClose,
  onSave,
  segment,
}: SegmentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: [] as string[],
    conditions: [] as SegmentConditionGroup[],
    type: "dynamic",
    category: undefined as number | undefined,
  });
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewQuery, setPreviewQuery] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  // Initialize selectedCategoryIds from formData.category
  useEffect(() => {
    if (formData.category && !selectedCategoryIds.includes(formData.category)) {
      setSelectedCategoryIds([formData.category]);
    } else if (!formData.category && selectedCategoryIds.length > 0) {
      setSelectedCategoryIds([]);
    }
  }, [formData.category]);

  // Update formData.category when selectedCategoryIds changes (use first one)
  useEffect(() => {
    const firstCategoryId =
      selectedCategoryIds.length > 0 ? selectedCategoryIds[0] : undefined;
    if (formData.category !== firstCategoryId) {
      setFormData((prev) => ({
        ...prev,
        category: firstCategoryId, // Send only first to backend
      }));
    }
  }, [selectedCategoryIds]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await segmentService.getSegmentCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    const loadSegmentData = async () => {
      if (isOpen) {
        if (segment) {
          // NOTE: With the new implementation, segments are created with SQL queries directly
          // We cannot reconstruct UI conditions from the SQL query
          // When editing, user will need to rebuild conditions from scratch
          setFormData({
            name: segment.name,
            description: segment.description || "",
            tags: segment.tags || [],
            conditions: [], // Cannot reconstruct from query - user must rebuild
            type: "dynamic",
            category: segment.category ?? undefined,
          });
        } else {
          setFormData({
            name: "",
            description: "",
            tags: [],
            type: "dynamic",
            conditions: [],
            category: undefined,
          });
        }
      }
    };

    loadSegmentData();
  }, [isOpen, segment]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        const updatedTags = [...formData.tags, newTag];
        setFormData((prev) => ({
          ...prev,
          tags: updatedTags,
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = formData.tags.filter((tag) => tag !== tagToRemove);
    setFormData((prev) => ({
      ...prev,
      tags: updatedTags,
    }));
  };

  const handlePreview = async () => {
    if (formData.conditions.length === 0) {
      setPreviewCount(0);
      setPreviewQuery(null);
      return;
    }

    setIsPreviewLoading(true);
    setError("");

    try {
      // Extract all unique field IDs from conditions
      const fieldIds = new Set<number>();
      const queryConditions: Array<{
        field_id: number;
        operator_id: number;
        value: string | number | string[];
      }> = [];

      // Process each condition group
      for (const group of formData.conditions) {
        if (group.conditionType !== "rule") {
          continue; // Skip non-rule condition types for now
        }

        for (const condition of group.conditions) {
          if (condition.field_id && condition.operator_id) {
            fieldIds.add(condition.field_id);
            queryConditions.push({
              field_id: condition.field_id,
              operator_id: condition.operator_id,
              value: condition.value,
            });
          } else {
            throw new Error(
              `Missing field_id or operator_id for condition. Please reload the page.`
            );
          }
        }
      }

      if (queryConditions.length === 0) {
        setError("No valid conditions to preview");
        setPreviewCount(null);
        setPreviewQuery(null);
        return;
      }

      // Build the request for query generation
      const queryRequest = {
        fields: Array.from(fieldIds), // Fields to select in the query
        filters: {
          logic: "AND" as const,
          groups: formData.conditions
            .filter((group) => group.conditionType === "rule")
            .map((group) => ({
              logic: group.operator,
              conditions: group.conditions
                .filter((c) => c.field_id && c.operator_id)
                .map((c) => ({
                  field_id: c.field_id!,
                  operator_id: c.operator_id!,
                  value: c.value,
                })),
            })),
        },
        limit: 100, // Preview limit
      };

      // Call the query generation preview API
      const response = await segmentService.generateSegmentQueryPreview(
        queryRequest
      );

      if (response.success && response.data) {
        setPreviewQuery(response.data.segment_query);
        // Note: The backend doesn't return count in preview yet
        // You could parse the SQL or make a separate count call
        setPreviewCount(null); // Set to null for now, or implement count extraction
        setError("");
      } else {
        throw new Error("Failed to generate query preview");
      }
    } catch (err) {
      console.error("Preview failed:", err);
      setError((err as Error).message || "Failed to preview segment");
      setPreviewCount(null);
      setPreviewQuery(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  /**
   * Generate a unique code from segment name
   */
  const generateSegmentCode = (name: string): string => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50); // Limit to 50 chars
  };

  /**
   * Generate SQL query from conditions
   */
  const generateQueryFromConditions = async (): Promise<{
    segment_query: string;
    count_query: string;
  } | null> => {
    if (formData.conditions.length === 0) {
      return null;
    }

    try {
      // Extract all unique field IDs from conditions
      const fieldIds = new Set<number>();

      // Process each condition group
      for (const group of formData.conditions) {
        if (group.conditionType !== "rule") {
          continue; // Skip non-rule condition types for now
        }

        for (const condition of group.conditions) {
          if (condition.field_id && condition.operator_id) {
            fieldIds.add(condition.field_id);
          } else {
            throw new Error(
              `Missing field_id or operator_id for condition. Please reload the page.`
            );
          }
        }
      }

      if (fieldIds.size === 0) {
        throw new Error("No valid conditions to generate query");
      }

      // Build the request for query generation (without limit for production)
      const queryRequest = {
        fields: Array.from(fieldIds),
        filters: {
          logic: "AND" as const,
          groups: formData.conditions
            .filter((group) => group.conditionType === "rule")
            .map((group) => ({
              logic: group.operator,
              conditions: group.conditions
                .filter((c) => c.field_id && c.operator_id)
                .map((c) => ({
                  field_id: c.field_id!,
                  operator_id: c.operator_id!,
                  value: c.value,
                })),
            })),
        },
        // Don't set limit for production query
      };

      // Call the query generation API
      const response = await segmentService.generateSegmentQueryPreview(
        queryRequest
      );

      if (response.success && response.data) {
        return {
          segment_query: response.data.segment_query,
          count_query: response.data.count_query,
        };
      } else {
        throw new Error("Failed to generate query");
      }
    } catch (err) {
      throw new Error(
        (err as Error).message || "Failed to generate query from conditions"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Segment name is required");
      return;
    }

    if (formData.conditions.length === 0) {
      setError("Please add at least one condition");
      return;
    }

    setIsLoading(true);
    try {
      // Generate SQL query from conditions
      const queries = await generateQueryFromConditions();

      if (!queries) {
        setError("Failed to generate query from conditions");
        return;
      }

      // Generate unique code
      const code = generateSegmentCode(formData.name);

      let savedSegment: Segment;

      if (segment) {
        // Update existing segment with new query
        const segmentId = segment.id!;

        const updateResponse = await segmentService.updateSegment(segmentId, {
          name: formData.name,
          description: formData.description,
          tags: formData.tags,
          category: formData.category,
          query: queries.segment_query,
          count_query: queries.count_query,
        });

        // Extract segment from response
        const updateResult = updateResponse as { data?: Segment } | Segment;
        savedSegment =
          (typeof updateResult === "object" &&
            "data" in updateResult &&
            updateResult.data) ||
          (updateResult as Segment);
      } else {
        // Create new segment with query
        const createRequest: CreateSegmentRequest = {
          name: formData.name,
          code: code,
          description: formData.description,
          tags: formData.tags,
          type: "dynamic",
          category: formData.category,
          query: queries.segment_query,
          count_query: queries.count_query,
          is_active: true,
          visibility: "private",
        };

        const createResponse = await segmentService.createSegment(
          createRequest
        );

        // Extract segment from response - backend returns {success: true, data: [segment]}
        const response = createResponse as
          | { success: boolean; data?: Segment[] | Segment }
          | Segment;
        if (
          typeof response === "object" &&
          "success" in response &&
          response.success &&
          Array.isArray(response.data)
        ) {
          savedSegment = response.data[0];
        } else if (
          typeof response === "object" &&
          "data" in response &&
          response.data
        ) {
          savedSegment = Array.isArray(response.data)
            ? response.data[0]
            : (response.data as Segment);
        } else {
          savedSegment = response as Segment;
        }
      }

      onSave(savedSegment);
      onClose();
    } catch (err: unknown) {
      console.error("Failed to save segment:", err);
      setError((err as Error).message || "Failed to save segment");
    } finally {
      setIsLoading(false);
    }
  };

  return isOpen
    ? createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={onClose}
            />

            <div className="relative bg-white rounded-md shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div
                className={`flex items-center justify-between p-6 border-b border-[${tw.borderDefault}] bg-gradient-to-r from-[${color.primary.accent}]/5 to-[${color.primary.accent}]/10 flex-shrink-0`}
              >
                <div>
                  <h2 className={`text-2xl font-bold ${tw.textPrimary}`}>
                    {segment ? "Edit Segment" : "Create New Segment"}
                  </h2>
                  <p className={`${tw.textSecondary} mt-1`}>
                    Define customer segments using rules and filters
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <form
                  id="segment-form"
                  onSubmit={handleSubmit}
                  className="p-6 space-y-6"
                >
                  {/* Error Message */}
                  {error && (
                    <div
                      className="p-4 bg-red-50 border border-red-300 rounded-md"
                      style={{
                        borderColor: "#ef4444",
                      }}
                    >
                      <p className="text-sm font-medium text-red-600">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
                      >
                        Segment Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter segment name"
                        className={`w-full px-4 py-3 border border-[${tw.borderDefault}] rounded-md focus:outline-none text-sm`}
                        required
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
                      >
                        Segment Catalog
                      </label>
                      <MultiCategorySelector
                        value={selectedCategoryIds}
                        onChange={setSelectedCategoryIds}
                        placeholder="Select catalog(s)"
                        entityType="segment"
                        className="w-full"
                      />
                      {/* <p className="text-xs text-gray-500 mt-1">
                        You can select multiple catalogs. Only the first one
                        will be saved to the backend.
                      </p> */}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
                      >
                        Tags
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => {
                              const value = e.target.value;
                              setTagInput(value);

                              // Auto-add tag when comma is typed
                              if (value.includes(",")) {
                                const tag = value.replace(",", "").trim();
                                if (
                                  tag &&
                                  !formData.tags.includes(tag.toLowerCase())
                                ) {
                                  const updatedTags = [
                                    ...formData.tags,
                                    tag.toLowerCase(),
                                  ];
                                  setFormData((prev) => ({
                                    ...prev,
                                    tags: updatedTags,
                                  }));
                                  setTagInput("");
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              handleAddTag(e);
                            }}
                            placeholder="Type tags separated by commas (e.g., premium, high-value)"
                            className={`flex-1 px-4 py-3 border border-[${tw.borderDefault}] rounded-md focus:outline-none text-sm`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (tagInput.trim()) {
                                const newTag = tagInput.trim().toLowerCase();
                                if (!formData.tags.includes(newTag)) {
                                  const updatedTags = [
                                    ...formData.tags,
                                    newTag,
                                  ];
                                  setFormData((prev) => ({
                                    ...prev,
                                    tags: updatedTags,
                                  }));
                                  setTagInput("");
                                }
                              }
                            }}
                            className="inline-flex items-center px-4  text-sm text-white rounded-md transition-colors"
                            style={{
                              backgroundColor: color.primary.action,
                            }}
                          >
                            Add
                          </button>
                        </div>
                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`inline-flex items-center px-3 py-1 bg-[${color.primary.accent}]/10 text-[${color.primary.accent}] text-sm font-medium rounded-full`}
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className={`ml-2 text-[${color.primary.accent}] hover:text-[${color.primary.accent}]/80`}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
                    >
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe this segment..."
                      rows={3}
                      className={`w-full px-4 py-3 border border-[${tw.borderDefault}] rounded-md text-sm`}
                    />
                  </div>

                  {/* Segment Conditions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label
                        className={`block text-sm font-medium ${tw.textPrimary}`}
                      >
                        Segment Conditions *
                      </label>
                      <div className="flex items-center space-x-3">
                        {previewCount !== null && (
                          <span className={`text-sm ${tw.textSecondary}`}>
                            {previewCount.toLocaleString()} customers
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={handlePreview}
                          disabled={
                            isPreviewLoading || formData.conditions.length === 0
                          }
                          className="inline-flex items-center px-4 py-2 text-sm text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: color.primary.action,
                          }}
                        >
                          {isPreviewLoading ? "Loading..." : "Preview"}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`border border-[${tw.borderDefault}] rounded-md p-4 bg-[${color.surface.cards}]`}
                    >
                      <SegmentConditionsBuilder
                        conditions={formData.conditions}
                        onChange={(conditions) =>
                          setFormData((prev) => ({ ...prev, conditions }))
                        }
                      />
                    </div>

                    {/* Query Preview Section */}
                    {previewQuery && (
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700">
                            Generated SQL Query
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(previewQuery);
                            }}
                            className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="text-xs bg-white p-3 rounded border border-gray-300 overflow-x-auto">
                          <code className="text-gray-800">{previewQuery}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer - Sticky */}
              <div
                className={`flex items-center justify-end space-x-4 p-6 border-t border-[${tw.borderDefault}]  flex-shrink-0`}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-6 py-2 ${tw.textSecondary} bg-white border border-[${tw.borderDefault}] rounded-md hover:bg-[${color.surface.cards}] transition-colors text-sm`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="segment-form"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-2 text-white rounded-md transition-colors text-sm"
                  style={{
                    backgroundColor: isLoading
                      ? color.text.muted
                      : color.primary.action,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        color.primary.action;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        color.primary.action;
                    }
                  }}
                >
                  {isLoading
                    ? "Saving..."
                    : segment
                    ? "Update Segment"
                    : "Create Segment"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
}
