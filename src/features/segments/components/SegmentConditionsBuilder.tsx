import { useMemo, useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Search, List as ListIcon } from "lucide-react";
import {
  SegmentCondition,
  SegmentConditionGroup,
  SEGMENT_FIELDS,
  PROFILE_360_FIELDS,
  OPERATOR_LABELS,
  SegmentType,
} from "../types/segment";
import SegmentListModal, { SegmentListFormValues } from "./SegmentListModal";
import { color, tw, button } from "../../../shared/utils/utils";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import { useSegmentationFields } from "../hooks/useSegmentationFields";
import { segmentService } from "../services/segmentService";

interface SegmentConditionsBuilderProps {
  conditions: SegmentConditionGroup[];
  onChange: (conditions: SegmentConditionGroup[]) => void;
}

interface ExistingSegmentList {
  list_id: number;
  name: string;
  description: string;
  subscriber_count: number;
  created_on: string;
  list_type: "seed" | "and" | "standard";
  tags?: string[];
  subscriber_id_col_name?: string;
  file_delimiter?: string;
  list_headers?: string;
  file_text?: string;
  file_name?: string;
  file_size?: number;
}

const DEFAULT_EXISTING_LISTS: ExistingSegmentList[] = [
  {
    list_id: 1,
    name: "High Value Customers",
    description: "Customers with lifetime value > $1000",
    subscriber_count: 2543,
    created_on: "2024-01-15",
    list_type: "standard",
    tags: ["premium", "vip"],
    subscriber_id_col_name: "customer_id",
    file_delimiter: ",",
    list_headers: "customer_id,email,first_name,last_name",
  },
  {
    list_id: 2,
    name: "Engaged App Users",
    description: "Opened the mobile app in the last 7 days",
    subscriber_count: 8420,
    created_on: "2024-02-02",
    list_type: "and",
    tags: ["mobile", "active"],
    subscriber_id_col_name: "msisdn",
    file_delimiter: ",",
    list_headers: "msisdn,last_login,last_purchase",
  },
  {
    list_id: 3,
    name: "Seed List - Internal QA",
    description: "Internal QA accounts for campaign previews",
    subscriber_count: 45,
    created_on: "2024-01-05",
    list_type: "seed",
    tags: ["internal"],
    subscriber_id_col_name: "email",
    file_delimiter: ",",
    list_headers: "email,first_name,last_name",
  },
];

export default function SegmentConditionsBuilder({
  conditions,
  onChange,
}: SegmentConditionsBuilderProps) {
  const [availableLists, setAvailableLists] = useState<ExistingSegmentList[]>(
    DEFAULT_EXISTING_LISTS
  );
  const [listModalConfig, setListModalConfig] = useState<{
    open: boolean;
    groupId?: string;
  }>({ open: false });
  const [listModes, setListModes] = useState<
    Record<string, "existing" | "new">
  >({});
  const [availableSegments, setAvailableSegments] = useState<SegmentType[]>([]);
  const [isLoadingSegments, setIsLoadingSegments] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Fetch segments when needed
  useEffect(() => {
    const hasSegmentsCondition = conditions.some(
      (group) => group.conditionType === "segments"
    );
    if (hasSegmentsCondition && availableSegments.length === 0) {
      setIsLoadingSegments(true);
      segmentService
        .getSegments({ skipCache: true })
        .then((response) => {
          const segments = Array.isArray(response.data)
            ? response.data
            : response.data || [];
          setAvailableSegments(segments);
        })
        .catch((error) => {
          console.error("Failed to fetch segments:", error);
          setAvailableSegments([]);
        })
        .finally(() => {
          setIsLoadingSegments(false);
        });
    }
  }, [conditions, availableSegments.length]);

  // Load segmentation fields from backend
  const {
    allFields,
    isLoading: isLoadingFields,
    error: fieldsError,
    getFieldByValue,
  } = useSegmentationFields();

  const addConditionGroup = () => {
    // Use first field from backend if available, fallback to hardcoded
    const firstField = allFields.length > 0 ? allFields[0] : null;
    const defaultFieldValue = firstField
      ? firstField.field_value
      : SEGMENT_FIELDS[0].key;
    const defaultFieldId = firstField ? firstField.id : undefined;
    const defaultOperatorId = firstField?.operators[0]?.id;

    const newGroup: SegmentConditionGroup = {
      id: generateId(),
      operator: "AND",
      conditionType: "rule",
      conditions: [
        {
          id: generateId(),
          field: defaultFieldValue,
          field_id: defaultFieldId,
          operator: "equals",
          operator_id: defaultOperatorId,
          value: "",
          type: "string",
        },
      ],
    };
    onChange([...conditions, newGroup]);
  };

  const removeConditionGroup = (groupId: string) => {
    onChange(conditions.filter((group) => group.id !== groupId));
  };

  const updateConditionGroup = (
    groupId: string,
    updates: Partial<SegmentConditionGroup>
  ) => {
    onChange(
      conditions.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      )
    );
  };

  const addCondition = (groupId: string) => {
    // Use first field from backend if available, fallback to hardcoded
    const firstField = allFields.length > 0 ? allFields[0] : null;
    const defaultFieldValue = firstField
      ? firstField.field_value
      : SEGMENT_FIELDS[0].key;
    const defaultFieldId = firstField ? firstField.id : undefined;
    const defaultOperatorId = firstField?.operators[0]?.id;

    const newCondition: SegmentCondition = {
      id: generateId(),
      field: defaultFieldValue,
      field_id: defaultFieldId,
      operator: "equals",
      operator_id: defaultOperatorId,
      value: "",
      type: "string",
    };

    onChange(
      conditions.map((group) =>
        group.id === groupId
          ? { ...group, conditions: [...group.conditions, newCondition] }
          : group
      )
    );
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    onChange(
      conditions.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.filter((c) => c.id !== conditionId),
            }
          : group
      )
    );
  };

  const updateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<SegmentCondition>
  ) => {
    onChange(
      conditions.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.map((condition) =>
                condition.id === conditionId
                  ? { ...condition, ...updates }
                  : condition
              ),
            }
          : group
      )
    );
  };

  const estimateSubscriberCount = (
    fileText?: string,
    headersLine?: string
  ): number => {
    if (!fileText) return 0;
    return fileText.split(/\r?\n/).filter((line, index) => {
      if (!line.trim()) return false;
      return headersLine ? index > 0 : true;
    }).length;
  };

  const handleExistingListSelect = (
    groupId: string,
    list: ExistingSegmentList
  ) => {
    updateConditionGroup(groupId, {
      listData: {
        list_id: list.list_id,
        list_label: list.name,
        list_description: list.description,
        list_type: list.list_type,
        list_headers: list.list_headers,
        file_delimiter: list.file_delimiter,
        subscriber_id_col_name: list.subscriber_id_col_name || "",
        file_text: list.file_text,
      },
    });
    setListModes((prev) => ({ ...prev, [groupId]: "existing" }));
  };

  const openListModalForGroup = (groupId: string) => {
    setListModalConfig({ open: true, groupId });
  };

  const closeListModal = () => {
    setListModalConfig({ open: false, groupId: undefined });
  };

  const handleListModalSubmit = (values: SegmentListFormValues) => {
    const newList: ExistingSegmentList = {
      list_id: Date.now(),
      name: values.list_label,
      description: values.list_description,
      list_type: values.list_type,
      subscriber_count: estimateSubscriberCount(
        values.file_text,
        values.list_headers
      ),
      created_on: new Date().toISOString(),
      tags: [],
      subscriber_id_col_name: values.subscriber_id_col_name,
      file_delimiter: values.file_delimiter,
      list_headers: values.list_headers,
      file_text: values.file_text,
      file_name: values.file_name,
      file_size: values.file_size,
    };

    setAvailableLists((prev) => [newList, ...prev]);

    if (listModalConfig.groupId) {
      handleExistingListSelect(listModalConfig.groupId, newList);
    }

    closeListModal();
  };

  const getFieldType = (fieldKey: string, isProfile360 = false) => {
    // Try to get field from backend first
    if (!isProfile360 && allFields.length > 0) {
      const backendField = getFieldByValue(fieldKey);
      if (backendField) {
        // Map backend field types to our internal types
        switch (backendField.field_type) {
          case "numeric":
            return "number";
          case "text":
            return "string";
          case "boolean":
            return "boolean";
          default:
            return "string";
        }
      }
    }

    // Fallback to hardcoded fields for 360 profiles or if backend fields not loaded
    const fields = isProfile360 ? PROFILE_360_FIELDS : SEGMENT_FIELDS;
    const field = fields.find((f) => f.key === fieldKey);
    return field?.type || "string";
  };

  const getAvailableOperators = (fieldKey: string, isProfile360 = false) => {
    // Try to get operators from backend first
    if (!isProfile360 && allFields.length > 0) {
      const backendField = getFieldByValue(fieldKey);
      if (backendField && backendField.operators.length > 0) {
        // Map backend operators to our internal operator labels
        return backendField.operators.map((op) => {
          // Map backend symbols to our internal operator keys
          const symbolMap: Record<string, string> = {
            "=": "equals",
            "!=": "not_equals",
            ">": "greater_than",
            "<": "less_than",
            IN: "in",
            "NOT IN": "not_in",
            LIKE: "contains",
            "NOT LIKE": "not_contains",
          };
          return symbolMap[op.symbol] || op.label;
        });
      }
    }

    // Fallback to hardcoded operators
    const fields = isProfile360 ? PROFILE_360_FIELDS : SEGMENT_FIELDS;
    const field = fields.find((f) => f.key === fieldKey);
    return field?.operators || ["equals"];
  };

  const renderConditionValue = (
    groupId: string,
    condition: SegmentCondition,
    isProfile360 = false
  ) => {
    const fieldType = getFieldType(condition.field, isProfile360);
    const updateFunction = isProfile360
      ? updateProfileCondition
      : updateCondition;

    // Get backend field to check for dropdown component type
    const backendField = !isProfile360
      ? getFieldByValue(condition.field)
      : null;
    const isDropdown = backendField?.ui?.component_type === "dropdown";
    const isMultiSelect = backendField?.ui?.is_multi_select || false;
    const distinctValues = backendField?.validation?.distinct_values || [];

    // If field has dropdown component type with distinct values, render dropdown
    if (isDropdown && distinctValues.length > 0) {
      if (
        isMultiSelect ||
        condition.operator === "in" ||
        condition.operator === "not_in"
      ) {
        // Multi-select dropdown - display as checkboxes
        const selectedValues = Array.isArray(condition.value)
          ? condition.value.map((v) => String(v))
          : condition.value
          ? [String(condition.value)]
          : [];

        return (
          <div className="min-w-[200px]">
            <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto bg-white">
              {distinctValues.map((val, idx) => {
                const isChecked = selectedValues.includes(val);
                return (
                  <label
                    key={idx}
                    className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        let newValues: string[];
                        if (e.target.checked) {
                          newValues = [...selectedValues, val];
                        } else {
                          newValues = selectedValues.filter((v) => v !== val);
                        }
                        updateFunction(groupId, condition.id, {
                          value:
                            newValues.length > 1
                              ? newValues
                              : newValues[0] || "",
                          type: newValues.length > 1 ? "array" : "string",
                        });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{val}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedValues.length} value(s) selected
            </p>
          </div>
        );
      } else {
        // Single-select dropdown
        return (
          <div className="min-w-[200px]">
            <HeadlessSelect
              options={distinctValues.map((val) => ({
                value: val,
                label: val,
              }))}
              value={condition.value as string}
              onChange={(value) => {
                updateFunction(groupId, condition.id, {
                  value: value as string,
                  type: "string",
                });
              }}
              placeholder="Select value"
              className="text-sm"
            />
          </div>
        );
      }
    }

    // Fallback to original input logic for non-dropdown fields
    if (condition.operator === "in" || condition.operator === "not_in") {
      return (
        <input
          type="text"
          value={
            Array.isArray(condition.value)
              ? condition.value.join(", ")
              : condition.value
          }
          onChange={(e) => {
            const values = e.target.value
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v);
            updateFunction(groupId, condition.id, {
              value: values,
              type: "array",
            });
          }}
          placeholder="Enter values separated by commas"
          className={`px-3 py-2 border border-[${tw.borderDefault}] rounded-md focus:outline-none text-sm`}
        />
      );
    }

    return (
      <input
        type={fieldType === "number" ? "number" : "text"}
        value={condition.value as string | number}
        onChange={(e) => {
          const value =
            fieldType === "number"
              ? parseFloat(e.target.value) || 0
              : e.target.value;
          updateFunction(groupId, condition.id, { value, type: fieldType });
        }}
        placeholder="Enter value"
        className={`px-3 py-2 border border-[${tw.borderDefault}] rounded-md focus:outline-none text-sm`}
      />
    );
  };

  const addProfileCondition = (groupId: string) => {
    const newCondition: SegmentCondition = {
      id: generateId(),
      field: PROFILE_360_FIELDS[0].key,
      operator: "equals",
      value: "",
      type: "string",
    };

    onChange(
      conditions.map((group) =>
        group.id === groupId
          ? {
              ...group,
              profileConditions: [
                ...(group.profileConditions || []),
                newCondition,
              ],
            }
          : group
      )
    );
  };

  const removeProfileCondition = (groupId: string, conditionId: string) => {
    onChange(
      conditions.map((group) =>
        group.id === groupId
          ? {
              ...group,
              profileConditions: (group.profileConditions || []).filter(
                (c) => c.id !== conditionId
              ),
            }
          : group
      )
    );
  };

  const updateProfileCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<SegmentCondition>
  ) => {
    onChange(
      conditions.map((group) =>
        group.id === groupId
          ? {
              ...group,
              profileConditions: (group.profileConditions || []).map(
                (condition) =>
                  condition.id === conditionId
                    ? { ...condition, ...updates }
                    : condition
              ),
            }
          : group
      )
    );
  };

  // Show loading state while fields are being fetched
  if (isLoadingFields) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
        <p className="text-gray-500">Loading field configuration...</p>
      </div>
    );
  }

  // Show error if fields failed to load
  if (fieldsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-2">Failed to load field configuration</p>
        <p className="text-sm text-gray-500">{fieldsError}</p>
      </div>
    );
  }

  if (conditions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No conditions defined yet</p>
        <button
          type="button"
          onClick={addConditionGroup}
          className="inline-flex items-center px-4 py-2 text-sm text-white rounded-md transition-colors"
          style={{
            backgroundColor: color.primary.action,
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Condition Group
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conditions.map((group, groupIndex) => {
        const listMode = listModes[group.id] ?? "existing";
        return (
          <div
            key={group.id}
            className="border border-gray-200 rounded-md p-4 bg-gray-50"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {groupIndex > 0 && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded">
                    AND
                  </span>
                )}

                {/* Condition Type Selection */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    Type:
                  </label>
                  <div className="w-48">
                    <HeadlessSelect
                      options={[
                        { value: "rule", label: "Rule" },
                        { value: "list", label: "List" },
                        { value: "segments", label: "Segments" },
                        { value: "360", label: "360 Profile" },
                      ]}
                      value={group.conditionType}
                      onChange={(value) =>
                        updateConditionGroup(group.id, {
                          conditionType: value as
                            | "rule"
                            | "list"
                            | "segments"
                            | "360",
                        })
                      }
                      placeholder="Select type"
                      className="text-sm"
                    />
                  </div>
                </div>

                {group.conditionType === "rule" && (
                  <>
                    <div className="w-20">
                      <HeadlessSelect
                        options={[
                          { value: "AND", label: "AND" },
                          { value: "OR", label: "OR" },
                        ]}
                        value={group.operator}
                        onChange={(value) =>
                          updateConditionGroup(group.id, {
                            operator: value as "AND" | "OR",
                          })
                        }
                        placeholder="AND"
                        className="text-sm"
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {group.conditions.length} condition
                      {group.conditions.length !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeConditionGroup(group.id)}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                title="Remove Group"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Condition Content */}
            {group.conditionType === "rule" && (
              <div className="space-y-3">
                {group.conditions.map((condition, conditionIndex) => (
                  <div
                    key={condition.id}
                    className="flex items-center space-x-3 bg-white p-3 rounded border"
                  >
                    {conditionIndex > 0 && (
                      <span
                        className={`px-2 py-1 bg-[${color.primary.accent}]/10 text-[${color.primary.accent}] text-xs font-medium rounded`}
                      >
                        {group.operator}
                      </span>
                    )}

                    {/* Field Selection */}
                    <div className="min-w-[200px]">
                      <HeadlessSelect
                        options={(allFields.length > 0
                          ? allFields
                          : SEGMENT_FIELDS
                        ).map((field) => ({
                          value:
                            "field_value" in field
                              ? field.field_value
                              : field.key,
                          label:
                            "field_name" in field
                              ? field.field_name
                              : field.label,
                        }))}
                        value={condition.field}
                        onChange={(value) => {
                          const fieldType = getFieldType(value as string);
                          const availableOperators = getAvailableOperators(
                            value as string
                          );

                          // Get backend field to extract IDs
                          const backendField = getFieldByValue(value as string);
                          const firstOperator = backendField?.operators[0];

                          // Map first operator symbol to our internal format
                          const symbolMap: Record<string, string> = {
                            "=": "equals",
                            "!=": "not_equals",
                            ">": "greater_than",
                            "<": "less_than",
                            IN: "in",
                            "NOT IN": "not_in",
                            LIKE: "contains",
                            "NOT LIKE": "not_contains",
                          };
                          const mappedOperator = firstOperator
                            ? symbolMap[firstOperator.symbol] ||
                              firstOperator.label
                            : availableOperators[0];

                          updateCondition(group.id, condition.id, {
                            field: value as string,
                            field_id: backendField?.id,
                            operator: mappedOperator as
                              | "equals"
                              | "not_equals"
                              | "contains"
                              | "not_contains"
                              | "greater_than"
                              | "less_than"
                              | "in"
                              | "not_in",
                            operator_id: firstOperator?.id,
                            type: fieldType,
                            value: fieldType === "number" ? 0 : "",
                          });
                        }}
                        placeholder="Select field"
                        className="text-sm"
                      />
                    </div>

                    {/* Operator Selection */}
                    <div className="min-w-[120px]">
                      <HeadlessSelect
                        options={(() => {
                          const backendField = getFieldByValue(condition.field);
                          if (
                            backendField &&
                            backendField.operators.length > 0
                          ) {
                            return backendField.operators.map((op) => {
                              const symbolMap: Record<string, string> = {
                                "=": "equals",
                                "!=": "not_equals",
                                ">": "greater_than",
                                "<": "less_than",
                                IN: "in",
                                "NOT IN": "not_in",
                                LIKE: "contains",
                                "NOT LIKE": "not_contains",
                              };
                              const mappedOp = symbolMap[op.symbol] || op.label;
                              return {
                                value: `${mappedOp}|${op.id}`, // Store both operator name and ID
                                label:
                                  op.label.charAt(0).toUpperCase() +
                                  op.label.slice(1),
                              };
                            });
                          }
                          // Fallback to hardcoded operators
                          return getAvailableOperators(condition.field).map(
                            (op) => ({
                              value: `${op}|`,
                              label: OPERATOR_LABELS[op],
                            })
                          );
                        })()}
                        value={
                          condition.operator_id
                            ? `${condition.operator}|${condition.operator_id}`
                            : `${condition.operator}|`
                        }
                        onChange={(value) => {
                          const [operator, operatorId] = (
                            value as string
                          ).split("|");
                          updateCondition(group.id, condition.id, {
                            operator: operator as
                              | "equals"
                              | "not_equals"
                              | "contains"
                              | "not_contains"
                              | "greater_than"
                              | "less_than"
                              | "in"
                              | "not_in",
                            operator_id: operatorId
                              ? parseInt(operatorId)
                              : undefined,
                          });
                        }}
                        placeholder="Select operator"
                        className="text-sm"
                      />
                    </div>

                    {/* Value Input */}
                    {renderConditionValue(group.id, condition)}

                    {/* Remove Condition */}
                    <button
                      type="button"
                      onClick={() => removeCondition(group.id, condition.id)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                      title="Remove Condition"
                      disabled={group.conditions.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* List Condition Builder */}
            {group.conditionType === "list" && (
              <div className="space-y-4">
                <div className="rounded-md border border-gray-200 bg-white p-4">
                  {group.listData?.list_label ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                          Selected List
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <ListIcon className="h-5 w-5 text-gray-600" />
                          <h4 className="text-lg font-semibold text-gray-900">
                            {group.listData.list_label}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {group.listData.list_description ||
                            "No description provided."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 font-medium capitalize">
                            {group.listData.list_type || "standard"} list
                          </span>
                          {group.listData.list_headers && (
                            <span>
                              {group.listData.list_headers.split(",").length}{" "}
                              data points
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateConditionGroup(group.id, {
                            listData: undefined,
                          });
                          setListModes((prev) => ({
                            ...prev,
                            [group.id]: "existing",
                          }));
                        }}
                        className="text-sm font-medium text-red-500 hover:text-red-600"
                      >
                        Clear selection
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      No list attached yet. Choose an existing audience file or
                      create a new one to power this condition group.
                    </div>
                  )}
                </div>

                <div className="rounded-md border border-gray-200 bg-white p-4">
                  <h4 className={`font-medium ${tw.textPrimary} mb-4`}>
                    List Configuration
                  </h4>

                  {/* Tab Buttons */}
                  <div className="flex space-x-2 mb-4">
                    <button
                      type="button"
                      onClick={() =>
                        setListModes((prev) => ({
                          ...prev,
                          [group.id]: "existing",
                        }))
                      }
                      className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                        listMode === "existing"
                          ? "text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                      style={
                        listMode === "existing"
                          ? {
                              backgroundColor: button.action.background,
                              color: button.action.color,
                            }
                          : undefined
                      }
                    >
                      <ListIcon className="w-4 h-4 mr-2" />
                      Select Existing List
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setListModes((prev) => ({
                          ...prev,
                          [group.id]: "new",
                        }))
                      }
                      className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                        listMode === "new"
                          ? "text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                      style={
                        listMode === "new"
                          ? {
                              backgroundColor: button.action.background,
                              color: button.action.color,
                            }
                          : undefined
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Upload List
                    </button>
                  </div>

                  {/* Content based on active tab */}
                  {listMode === "existing" ? (
                    <ExistingListPicker
                      lists={availableLists}
                      selectedListId={group.listData?.list_id}
                      onSelect={(list) =>
                        handleExistingListSelect(group.id, list)
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Upload a CSV, TXT, or XLSX file with customer
                        identifiers and immediately link it to this segment
                        condition.
                      </p>
                      <button
                        type="button"
                        onClick={() => openListModalForGroup(group.id)}
                        className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white"
                        style={{ backgroundColor: button.action.background }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Upload List
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Segments Selection */}
            {group.conditionType === "segments" && (
              <div className="p-4 rounded-md border border-gray-200 bg-white">
                <h4 className={`font-medium ${tw.textPrimary} mb-2`}>
                  Select Segments
                </h4>
                <p className={`text-sm ${tw.textSecondary} mb-3`}>
                  Choose existing segments to include in this condition group.
                </p>
                {isLoadingSegments ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">
                      Loading segments...
                    </span>
                  </div>
                ) : (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={
                      group.segmentIds && group.segmentIds.length > 0
                        ? String(group.segmentIds[0])
                        : ""
                    }
                    onChange={(e) => {
                      const segmentId = e.target.value
                        ? parseInt(e.target.value, 10)
                        : undefined;
                      updateConditionGroup(group.id, {
                        segmentIds: segmentId ? [segmentId] : [],
                      });
                    }}
                  >
                    <option value="">Select a segment...</option>
                    {availableSegments.map((segment) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.name}
                        {segment.description ? ` - ${segment.description}` : ""}
                      </option>
                    ))}
                  </select>
                )}
                {availableSegments.length === 0 && !isLoadingSegments && (
                  <p className="text-sm text-gray-500 mt-2">
                    No segments available. Create a segment first.
                  </p>
                )}
              </div>
            )}

            {/* 360 Profile */}
            {group.conditionType === "360" && (
              <div className="p-4 rounded-md border border-gray-200 bg-white">
                <h4 className={`font-medium ${tw.textPrimary} mb-2`}>
                  360 Customer Profile
                </h4>
                <p className={`text-sm ${tw.textSecondary} mb-3`}>
                  Configure conditions based on comprehensive customer profile
                  data.
                </p>

                <div className="space-y-3">
                  {(group.profileConditions || []).length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-3">
                        No profile conditions defined yet
                      </p>
                      <button
                        type="button"
                        onClick={() => addProfileCondition(group.id)}
                        className="inline-flex items-center px-3 py-2 text-sm text-white rounded-md transition-colors"
                        style={{ backgroundColor: color.primary.action }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Profile Condition
                      </button>
                    </div>
                  ) : (
                    <>
                      {group.profileConditions?.map(
                        (condition, conditionIndex) => (
                          <div
                            key={condition.id}
                            className="flex items-center space-x-3 bg-white p-3 rounded border"
                          >
                            {conditionIndex > 0 && (
                              <span
                                className="px-2 py-1 text-xs font-medium rounded"
                                style={{
                                  backgroundColor: `${color.primary.accent}20`,
                                  color: color.primary.accent,
                                }}
                              >
                                AND
                              </span>
                            )}

                            {/* Profile Field Selection */}
                            <select
                              value={condition.field}
                              onChange={(e) => {
                                const fieldType = getFieldType(
                                  e.target.value,
                                  true
                                );
                                const availableOperators =
                                  getAvailableOperators(e.target.value, true);
                                updateProfileCondition(group.id, condition.id, {
                                  field: e.target.value,
                                  operator: availableOperators[0] as
                                    | "equals"
                                    | "not_equals"
                                    | "contains"
                                    | "not_contains"
                                    | "greater_than"
                                    | "less_than"
                                    | "in"
                                    | "not_in",
                                  type: fieldType,
                                  value: fieldType === "number" ? 0 : "",
                                });
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none min-w-[200px]"
                              style={{
                                borderColor: tw.borderDefault,
                              }}
                            >
                              {PROFILE_360_FIELDS.map((field) => (
                                <option key={field.key} value={field.key}>
                                  {field.label}
                                </option>
                              ))}
                            </select>

                            {/* Operator Selection */}
                            <select
                              value={condition.operator}
                              onChange={(e) =>
                                updateProfileCondition(group.id, condition.id, {
                                  operator: e.target.value as
                                    | "equals"
                                    | "not_equals"
                                    | "contains"
                                    | "not_contains"
                                    | "greater_than"
                                    | "less_than"
                                    | "in"
                                    | "not_in",
                                })
                              }
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                              style={{
                                borderColor: tw.borderDefault,
                              }}
                            >
                              {getAvailableOperators(condition.field, true).map(
                                (op) => (
                                  <option key={op} value={op}>
                                    {OPERATOR_LABELS[op]}
                                  </option>
                                )
                              )}
                            </select>

                            {/* Value Input */}
                            {renderConditionValue(group.id, condition, true)}

                            {/* Remove Condition */}
                            <button
                              type="button"
                              onClick={() =>
                                removeProfileCondition(group.id, condition.id)
                              }
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                              title="Remove Condition"
                              disabled={group.profileConditions?.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      )}

                      {/* Add Profile Condition Button */}
                      <button
                        type="button"
                        onClick={() => addProfileCondition(group.id)}
                        className="inline-flex items-center px-3 py-2 text-sm text-white rounded-md transition-colors"
                        style={{
                          backgroundColor: color.primary.action,
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Profile Condition
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Add Condition Button - Only show for rule type */}
            {group.conditionType === "rule" && (
              <button
                type="button"
                onClick={() => addCondition(group.id)}
                className="mt-3 inline-flex items-center px-3 py-2 text-sm text-white rounded-md transition-colors"
                style={{
                  backgroundColor: color.primary.action,
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Condition
              </button>
            )}
          </div>
        );
      })}

      {/* Add Group Button */}
      <button
        type="button"
        onClick={addConditionGroup}
        className="inline-flex items-center px-4 py-2 text-sm text-white rounded-md transition-colors"
        style={{ backgroundColor: color.primary.action }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Condition Group
      </button>

      <SegmentListModal
        isOpen={listModalConfig.open}
        mode="create"
        onClose={closeListModal}
        onSubmit={handleListModalSubmit}
        submitLabel="Create List"
      />
    </div>
  );
}

interface ExistingListPickerProps {
  lists: ExistingSegmentList[];
  selectedListId?: number;
  onSelect: (list: ExistingSegmentList) => void;
}

function ExistingListPicker({
  lists,
  selectedListId,
  onSelect,
}: ExistingListPickerProps) {
  const [query, setQuery] = useState("");

  const filteredLists = useMemo(() => {
    if (!query.trim()) {
      return lists;
    }

    const lower = query.toLowerCase();
    return lists.filter((list) => {
      const haystack = [list.name, list.description, ...(list.tags || [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(lower);
    });
  }, [lists, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lists by name or description..."
          className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
        />
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2">
        {filteredLists.length === 0 && (
          <div className="py-6 text-center text-sm text-gray-500">
            {query ? `No lists match "${query}"` : "No lists available"}
          </div>
        )}
        {filteredLists.map((list) => (
          <button
            type="button"
            key={list.list_id}
            onClick={() => onSelect(list)}
            className={`w-full text-left rounded-md border p-3 transition ${
              selectedListId === list.list_id
                ? "border-gray-800 bg-gray-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{list.name}</p>
                <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>
                    {list.subscriber_count.toLocaleString()} subscribers
                  </span>
                  <span className="capitalize">{list.list_type}</span>
                  <span>
                    Created {new Date(list.created_on).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
