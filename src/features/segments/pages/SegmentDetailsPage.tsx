import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Tag,
  Activity,
  Download,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  X,
  Search,
} from "lucide-react";
import { Segment } from "../types/segment";
import { segmentService } from "../services/segmentService";
import { useToast } from "../../../contexts/ToastContext";
import { useConfirm } from "../../../contexts/ConfirmContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { color, tw } from "../../../shared/utils/utils";

// Mock data for testing
const MOCK_SEGMENT: Segment = {
  id: 1,
  segment_id: 1,
  name: "High Value Customers",
  description: "Customers with ARPU > $50 and active for 6+ months",
  type: "dynamic",
  tags: ["vip", "high-value", "premium"],
  customer_count: 15420,
  size_estimate: 15420,
  created_at: "2025-01-15T10:30:00Z",
  created_on: "2025-01-15T10:30:00Z",
  updated_at: "2025-01-18T14:22:00Z",
  updated_on: "2025-01-18T14:22:00Z",
  created_by: 1,
  is_active: true,
  category: 1,
  visibility: "private",
  refresh_frequency: "daily",
  criteria: {
    conditions: [
      { field: "ARPU", operator: ">", value: 50 },
      { field: "tenure_months", operator: ">=", value: 6 },
      { field: "status", operator: "=", value: "active" },
    ],
  },
};

const USE_MOCK_DATA = false; // Toggle this to switch between mock and real data

export default function SegmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();

  const [segment, setSegment] = useState<Segment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [categoryName, setCategoryName] = useState<string>("Uncategorized");

  // Members state
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [members, setMembers] = useState<
    Array<{ customer_id: string | number; [key: string]: unknown }>
  >([]);
  const [membersPage, setMembersPage] = useState(1);
  const [membersTotalPages, setMembersTotalPages] = useState(1);
  const [isLoadingMembersList, setIsLoadingMembersList] = useState(false);
  const [customerIdsInput, setCustomerIdsInput] = useState("");
  const [membersSearchTerm, setMembersSearchTerm] = useState("");
  const [debouncedMembersSearchTerm, setDebouncedMembersSearchTerm] =
    useState("");

  // Mock customer data for testing
  const MOCK_CUSTOMERS = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      total_spent: 1250,
      last_purchase: "2024-01-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567891",
      total_spent: 890,
      last_purchase: "2024-01-10",
    },
    {
      id: "3",
      name: "Bob Wilson",
      email: "bob@example.com",
      phone: "+1234567892",
      total_spent: 2100,
      last_purchase: "2024-01-12",
    },
    {
      id: "4",
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "+1234567893",
      total_spent: 450,
      last_purchase: "2024-01-08",
    },
    {
      id: "5",
      name: "Charlie Brown",
      email: "charlie@example.com",
      phone: "+1234567894",
      total_spent: 3200,
      last_purchase: "2024-01-14",
    },
    {
      id: "6",
      name: "Diana Prince",
      email: "diana@example.com",
      phone: "+1234567895",
      total_spent: 1800,
      last_purchase: "2024-01-11",
    },
    {
      id: "7",
      name: "Eve Adams",
      email: "eve@example.com",
      phone: "+1234567896",
      total_spent: 750,
      last_purchase: "2024-01-09",
    },
    {
      id: "8",
      name: "Frank Miller",
      email: "frank@example.com",
      phone: "+1234567897",
      total_spent: 950,
      last_purchase: "2024-01-13",
    },
  ];

  // Customer selection state
  const [showCustomerSelection, setShowCustomerSelection] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

  const loadCategoryName = useCallback(async (categoryId: number | string) => {
    try {
      const response = await segmentService.getSegmentCategories();
      const categories = response.data || [];

      // Handle both string and number IDs
      const category = categories.find(
        (cat: { id: number | string; name: string }) =>
          String(cat.id) === String(categoryId)
      );

      const name = category?.name || "Uncategorized";
      setCategoryName(name);
    } catch {
      setCategoryName("Uncategorized");
    }
  }, []);

  const loadSegment = useCallback(async () => {
    try {
      setIsLoading(true);

      if (USE_MOCK_DATA) {
        // Use mock data for testing
        setTimeout(() => {
          setSegment(MOCK_SEGMENT);
          setIsLoading(false);
        }, 500); // Simulate API delay
        return;
      }

      const response = await segmentService.getSegmentById(Number(id));

      // Extract data from response (backend wraps it in data object)
      const segmentData =
        (response as { data?: Segment }).data || (response as Segment);
      setSegment(segmentData as Segment);

      // Load category name if category exists
      if ((segmentData as Segment).category) {
        loadCategoryName((segmentData as Segment).category!);
      } else {
        setCategoryName("Uncategorized");
      }
    } catch (err) {
      showError(
        "Error loading segment",
        (err as Error).message || "Failed to load segment details"
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, showError, loadCategoryName]);

  const loadMembersCount = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingMembers(true);

      if (USE_MOCK_DATA) {
        // Use mock data for testing
        setTimeout(() => {
          setMembersCount(5); // Match the dummy members count
          setIsLoadingMembers(false);
        }, 300); // Simulate API delay
        return;
      }

      const response = await segmentService.getSegmentMembersCount(Number(id));
      const count = response.data?.count ?? 0;
      setMembersCount(count);
    } catch (err) {
      // Silently fail for members count - don't show error to avoid loops
      console.warn("Failed to load members count:", err);
      setMembersCount(0);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [id]);

  // Debounce members search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMembersSearchTerm(membersSearchTerm);
      setMembersPage(1); // Reset to first page when searching
    }, 300);
    return () => clearTimeout(timer);
  }, [membersSearchTerm]);

  const loadMembers = useCallback(async () => {
    if (!id) return;

    setIsLoadingMembersList(true);
    try {
      if (USE_MOCK_DATA) {
        // Use dummy data for testing
        setTimeout(() => {
          const dummyMembers = [
            {
              customer_id: "1",
              joined_at: "2024-01-15T10:30:00Z",
              name: "John Doe",
              email: "john@example.com",
              total_spent: 1250,
            },
            {
              customer_id: "2",
              joined_at: "2024-01-14T14:20:00Z",
              name: "Jane Smith",
              email: "jane@example.com",
              total_spent: 890,
            },
            {
              customer_id: "3",
              joined_at: "2024-01-13T09:15:00Z",
              name: "Bob Wilson",
              email: "bob@example.com",
              total_spent: 2100,
            },
            {
              customer_id: "4",
              joined_at: "2024-01-12T16:45:00Z",
              name: "Alice Johnson",
              email: "alice@example.com",
              total_spent: 450,
            },
            {
              customer_id: "5",
              joined_at: "2024-01-11T11:30:00Z",
              name: "Charlie Brown",
              email: "charlie@example.com",
              total_spent: 3200,
            },
          ];

          setMembers(dummyMembers);
          setMembersTotalPages(1);
          setIsLoadingMembersList(false);
        }, 500); // Simulate API delay
        return;
      }

      // Use search endpoint if there's a search term, otherwise use getSegmentMembers
      let response;
      if (debouncedMembersSearchTerm) {
        response = await segmentService.searchSegmentMembers(Number(id), {
          query: debouncedMembersSearchTerm,
          page: membersPage,
          pageSize: 10,
        });
      } else {
        response = await segmentService.getSegmentMembers(Number(id), {
          page: membersPage,
          pageSize: 10,
        });
      }

      setMembers(response.data || []);
      if (response.meta) {
        setMembersTotalPages(response.meta.totalPages || 1);
      } else {
        // Default to 1 page if no meta info
        setMembersTotalPages(1);
      }
    } catch (err) {
      // Only show error if it's not a 404 (endpoint might not exist)
      const error = err as Error & { status?: number };
      if (error.status !== 404) {
        showError(
          "Error loading members",
          error.message || "Failed to load segment members"
        );
      }
      setMembers([]);
      setMembersTotalPages(1);
    } finally {
      setIsLoadingMembersList(false);
    }
  }, [id, membersPage, debouncedMembersSearchTerm, showError]);

  useEffect(() => {
    if (id) {
      loadSegment();
      loadMembersCount();
    }
  }, [id, loadSegment, loadMembersCount]);

  // Separate effect for members to avoid loops
  useEffect(() => {
    if (id) {
      loadMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, membersPage, debouncedMembersSearchTerm]);

  const handleEdit = () => {
    navigate(`/dashboard/segments/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!segment) return;

    const confirmed = await confirm({
      title: "Delete Segment",
      message: `Are you sure you want to delete "${segment.name}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await segmentService.deleteSegment(Number(id));
      success(
        "Segment deleted",
        `Segment "${segment.name}" has been deleted successfully`
      );
      navigate("/dashboard/segments");
    } catch (err) {
      showError(
        "Error deleting segment",
        (err as Error).message || "Failed to delete segment"
      );
    }
  };

  const handleCustomExport = async () => {
    if (!segment) return;

    setIsExporting(true);
    try {
      const blob = await segmentService.exportSegment(Number(id), {
        format: exportFormat,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `segment-${segment.name}-${
        new Date().toISOString().split("T")[0]
      }.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success(
        "Export successful",
        `Segment data has been exported as ${exportFormat.toUpperCase()}`
      );
      setShowExportModal(false);
    } catch (err) {
      showError(
        "Export failed",
        (err as Error).message || "Failed to export segment"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddMembers = async () => {
    if (!customerIdsInput.trim()) {
      showError("Validation error", "Please enter at least one customer ID");
      return;
    }

    const customerIds = customerIdsInput
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    if (customerIds.length === 0) {
      showError("Validation error", "Please enter valid customer IDs");
      return;
    }

    try {
      await segmentService.addSegmentMembers(Number(id), {
        customer_ids: customerIds,
      });
      success(
        "Members added",
        `${customerIds.length} member(s) added successfully`
      );
      setCustomerIdsInput("");
      setShowMembersModal(false);
      await loadMembersCount();
      await loadMembers();
    } catch (err) {
      showError(
        "Error adding members",
        (err as Error).message || "Failed to add members"
      );
    }
  };

  const handleRemoveMembers = async (customerIds: Array<string | number>) => {
    const confirmed = await confirm({
      title: "Remove Members",
      message: `Remove ${customerIds.length} member(s) from this segment?`,
      type: "warning",
      confirmText: "Remove",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      // Convert to numbers
      const numericIds = customerIds
        .map((id) => (typeof id === "string" ? parseInt(id, 10) : id))
        .filter((id) => !isNaN(id));

      await segmentService.deleteSegmentMembers(Number(id), {
        customer_ids: numericIds,
      });
      success(
        "Members removed",
        `${customerIds.length} member(s) removed successfully`
      );
      await loadMembersCount();
      await loadMembers();
    } catch (err) {
      showError(
        "Error removing members",
        (err as Error).message || "Failed to remove members"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner
          variant="modern"
          size="xl"
          color="primary"
          className="mb-4"
        />
        <p className={`${tw.textMuted} font-medium text-sm`}>
          Loading segment details...
        </p>
      </div>
    );
  }

  if (!segment) {
    return (
      <div className="text-center py-16">
        <h2 className={`text-xl font-semibold ${tw.textPrimary} mb-2`}>
          Segment not found
        </h2>
        <p className={`${tw.textSecondary} mb-4`}>
          The segment you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/dashboard/segments")}
          className={`${tw.button} inline-flex items-center px-4 py-2`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Segments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/segments")}
            className={`p-2 rounded-lg ${tw.textMuted} hover:bg-gray-100 transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
              {segment.name}
            </h1>
            <p className={`${tw.textSecondary} mt-1`}>{segment.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleEdit}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: color.primary.action }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor =
                color.primary.action;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor =
                color.primary.action;
            }}
          >
            <Edit className="w-4 h-4 inline mr-2" />
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm hover:bg-red-700"
          >
            {/* <Trash2 className="w-4 h-4" /> */}
            Delete Segment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tw.textMuted} mb-1`}>Members</p>
              <p className={`text-2xl font-bold ${tw.textPrimary}`}>
                {isLoadingMembers
                  ? "..."
                  : (membersCount || 0).toLocaleString()}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${color.primary.accent}20` }}
            >
              <Users
                className="w-6 h-6"
                style={{ color: color.primary.accent }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tw.textMuted} mb-1`}>Type</p>
              <p
                className={`text-lg font-semibold ${tw.textPrimary} capitalize`}
              >
                {segment.type}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${color.primary.accent}20` }}
            >
              <Activity
                className="w-6 h-6"
                style={{ color: color.primary.accent }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tw.textMuted} mb-1`}>Visibility</p>
              <p
                className={`text-lg font-semibold ${
                  segment.visibility === "public"
                    ? `text-[${color.status.success}]`
                    : `text-[${color.primary.action}]`
                }`}
              >
                {segment.visibility === "public" ? "Public" : "Private"}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                segment.visibility === "public"
                  ? `bg-[${color.status.success}]/10`
                  : `bg-[${color.primary.action}]/10`
              }`}
            >
              {segment.visibility === "public" ? (
                <Eye className={`w-6 h-6 text-[${color.status.success}]`} />
              ) : (
                <EyeOff className={`w-6 h-6 text-[${color.primary.action}]`} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className={`text-base font-semibold ${tw.textPrimary} mb-4`}>
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className={`text-sm font-medium ${tw.textMuted} block mb-1`}
              >
                Segment Name
              </label>
              <p className={`text-sm ${tw.textPrimary}`}>{segment.name}</p>
            </div>
            <div>
              <label
                className={`text-sm font-medium ${tw.textMuted} block mb-1`}
              >
                Description
              </label>
              <p className={`text-sm ${tw.textSecondary}`}>
                {segment.description || "No description"}
              </p>
            </div>
            <div>
              <label
                className={`text-sm font-medium ${tw.textMuted} block mb-1`}
              >
                Type
              </label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  segment.type === "dynamic"
                    ? `bg-[${color.primary.accent}] text-white`
                    : segment.type === "static"
                    ? `bg-[${color.primary.action}] text-white`
                    : `bg-[${color.status.warning}] text-white`
                }`}
              >
                {segment.type
                  ? segment.type.charAt(0).toUpperCase() + segment.type.slice(1)
                  : "N/A"}
              </span>
            </div>
            <div>
              <label
                className={`text-sm font-medium ${tw.textMuted} block mb-1`}
              >
                Segment Catalog
              </label>
              <p className={`text-sm ${tw.textPrimary}`}>{categoryName}</p>
            </div>
            {segment.tags && segment.tags.length > 0 && (
              <div>
                <label
                  className={`text-sm font-medium ${tw.textMuted} block mb-2`}
                >
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {segment.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700`}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className={`text-base font-semibold ${tw.textPrimary} mb-4`}>
            Metadata
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className={`text-sm font-medium ${tw.textMuted} block mb-1`}
              >
                Created
              </label>
              <p className={`text-sm ${tw.textPrimary}`}>
                {(() => {
                  const createdDate = segment.created_on || segment.created_at;
                  return new Date(createdDate!).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                })()}
              </p>
            </div>
            <div>
              <label
                className={`text-sm font-medium ${tw.textMuted} block mb-1`}
              >
                Last Updated
              </label>
              <p className={`text-sm ${tw.textPrimary}`}>
                {(() => {
                  const updatedDate = segment.updated_on || segment.updated_at;
                  return new Date(updatedDate!).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                })()}
              </p>
            </div>
            {segment.refresh_frequency && (
              <div>
                <label
                  className={`text-sm font-medium ${tw.textMuted} block mb-1`}
                >
                  Refresh Frequency
                </label>
                <p className={`text-sm ${tw.textPrimary} capitalize`}>
                  {segment.refresh_frequency}
                </p>
              </div>
            )}
            {segment.version && (
              <div>
                <label
                  className={`text-sm font-medium ${tw.textMuted} block mb-1`}
                >
                  Version
                </label>
                <p className={`text-sm ${tw.textPrimary}`}>{segment.version}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Criteria/Definition Section */}
      {(segment.criteria || segment.definition) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3
            className={`text-base font-semibold ${tw.textPrimary} mb-4 flex items-center`}
          >
            <Activity
              className="w-5 h-5 mr-2"
              style={{ color: color.primary.accent }}
            />
            Segment Criteria
          </h3>

          {/* Display criteria conditions in a user-friendly way */}
          {segment.criteria &&
          "conditions" in segment.criteria &&
          Array.isArray(
            (segment.criteria as Record<string, unknown>).conditions
          ) ? (
            <div className="space-y-2">
              {(
                (segment.criteria as Record<string, unknown>)
                  .conditions as Array<Record<string, unknown>>
              ).map((condition: Record<string, unknown>, index: number) => {
                const operatorMap: Record<string, string> = {
                  ">": "is greater than",
                  ">=": "is greater than or equal to",
                  "<": "is less than",
                  "<=": "is less than or equal to",
                  "=": "equals",
                  "!=": "does not equal",
                  contains: "contains",
                  in: "is in",
                };

                const fieldName = (condition.field as string) || "Field";
                const operator =
                  operatorMap[condition.operator as string] ||
                  (condition.operator as string);
                const value =
                  typeof condition.value === "string"
                    ? `"${condition.value}"`
                    : String(condition.value);

                return (
                  <div key={index} className="relative">
                    <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
                      <div
                        className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0`}
                        style={{ backgroundColor: `${color.primary.accent}20` }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{ color: color.primary.accent }}
                        >
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${tw.textPrimary}`}>
                          <span className="font-semibold">
                            {fieldName
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>{" "}
                          <span className={`${tw.textMuted}`}>{operator}</span>{" "}
                          <span
                            className="font-semibold"
                            style={{ color: color.primary.action }}
                          >
                            {value}
                          </span>
                        </p>
                      </div>
                    </div>
                    {index <
                      (
                        (segment.criteria as Record<string, unknown>)
                          .conditions as Array<Record<string, unknown>>
                      ).length -
                        1 && (
                      <div className="flex items-center justify-center py-1">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full`}
                          style={{
                            backgroundColor: `${color.primary.accent}15`,
                            color: color.primary.accent,
                          }}
                        >
                          AND
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className={`text-sm ${tw.textMuted}`}>
                No conditions defined or criteria format not supported for
                display
              </p>
            </div>
          )}
        </div>
      )}

      {/* Segment Members Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-base font-semibold ${tw.textPrimary}`}>
            Segment Members ({(membersCount || 0).toLocaleString()})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowMembersModal(true);
                loadMembers();
              }}
              className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg transition-all text-sm flex items-center gap-2 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              View All Members
            </button>
            <button
              onClick={() => {
                setShowCustomerSelection(true);
                setSelectedCustomers([]);
                setCustomerSearchTerm("");
              }}
              className="px-4 py-2 text-white rounded-lg transition-all text-sm flex items-center gap-2"
              style={{ backgroundColor: color.primary.action }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  color.primary.action;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  color.primary.action;
              }}
            >
              <Plus className="w-4 h-4" />
              Add Members
            </button>
          </div>
        </div>

        <p className={`text-sm ${tw.textSecondary}`}>
          View and manage members in this segment.{" "}
          {segment?.type === "static"
            ? "Add or remove members manually."
            : "Members are automatically computed based on segment rules."}
        </p>
      </div>

      {/* Members Modal */}
      {showMembersModal &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Segment Members
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {(membersCount || 0).toLocaleString()} total member
                    {membersCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Add Members Form */}
              {segment?.type === "static" && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Customer IDs (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={customerIdsInput}
                        onChange={(e) => setCustomerIdsInput(e.target.value)}
                        placeholder="e.g., 12345, 67890, 11111"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleAddMembers}
                      className="px-4 py-2 text-white rounded-lg transition-all"
                      style={{ backgroundColor: color.primary.action }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor =
                          color.primary.action;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor =
                          color.primary.action;
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Members Search */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={membersSearchTerm}
                    onChange={(e) => setMembersSearchTerm(e.target.value)}
                    placeholder="Search members by name, email, or ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {membersSearchTerm && (
                    <button
                      onClick={() => setMembersSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingMembersList ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner
                      variant="modern"
                      size="lg"
                      color="primary"
                    />
                    <p className="text-gray-500 mt-4">Loading members...</p>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No members in this segment</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {String(
                                member.name ||
                                  `Customer ID: ${String(
                                    member.customer_id || ""
                                  )}` ||
                                  "Unknown Customer"
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {String(
                                member.email ||
                                  `ID: ${String(member.customer_id || "")}` ||
                                  "No email"
                              )}
                            </p>
                            {member.joined_at ? (
                              <p className="text-xs text-gray-400">
                                Joined:{" "}
                                {new Date(
                                  String(member.joined_at)
                                ).toLocaleDateString()}
                              </p>
                            ) : null}
                            {member.total_spent ? (
                              <p className="text-xs text-green-600 font-medium">
                                Total Spent: $
                                {member.total_spent.toLocaleString()}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        {segment?.type === "static" && (
                          <button
                            onClick={() => {
                              const customerId =
                                typeof member.customer_id === "string"
                                  ? parseInt(member.customer_id, 10)
                                  : member.customer_id;
                              if (!isNaN(customerId)) {
                                handleRemoveMembers([customerId]);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {members.length > 0 && membersTotalPages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Page {membersPage} of {membersTotalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newPage = membersPage - 1;
                          setMembersPage(newPage);
                          loadMembers();
                        }}
                        disabled={membersPage <= 1}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => {
                          const newPage = membersPage + 1;
                          setMembersPage(newPage);
                          loadMembers();
                        }}
                        disabled={membersPage >= membersTotalPages}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Customer Selection Modal */}
      {showCustomerSelection &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Add Members to Segment
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Select customers to add to "{segment?.name}"
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomerSelection(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Search and Selection */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      placeholder="Search customers by name or email..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedCustomers.length} selected
                  </div>
                </div>
              </div>

              {/* Customer List */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {MOCK_CUSTOMERS.filter(
                    (customer) =>
                      customer.name
                        .toLowerCase()
                        .includes(customerSearchTerm.toLowerCase()) ||
                      customer.email
                        .toLowerCase()
                        .includes(customerSearchTerm.toLowerCase())
                  ).map((customer) => (
                    <div
                      key={customer.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCustomers.includes(customer.id)
                          ? "border-gray-200 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setSelectedCustomers((prev) =>
                          prev.includes(customer.id)
                            ? prev.filter((id) => id !== customer.id)
                            : [...prev, customer.id]
                        );
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {customer.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {customer.email}
                            </p>
                            <p className="text-xs text-gray-400">
                              ID: {customer.id} • Phone: {customer.phone}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${customer.total_spent.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last: {customer.last_purchase}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowCustomerSelection(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (selectedCustomers.length === 0) {
                        showError(
                          "No selection",
                          "Please select at least one customer"
                        );
                        return;
                      }

                      try {
                        await segmentService.addSegmentMembers(Number(id), {
                          customer_ids: selectedCustomers,
                        });
                        success(
                          "Members added",
                          `${selectedCustomers.length} customer(s) added successfully`
                        );
                        setShowCustomerSelection(false);
                        setSelectedCustomers([]);
                        await loadMembersCount();
                      } catch (err) {
                        showError(
                          "Error adding members",
                          (err as Error).message || "Failed to add members"
                        );
                      }
                    }}
                    disabled={selectedCustomers.length === 0}
                    className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: color.primary.action }}
                  >
                    Add {selectedCustomers.length} Customer
                    {selectedCustomers.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Export Modal */}
      {showExportModal &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Export Segment
                </h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Export Format
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          value="csv"
                          checked={exportFormat === "csv"}
                          onChange={(e) =>
                            setExportFormat(
                              e.target.value as "csv" | "json" | "xml"
                            )
                          }
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">CSV</div>
                          <div className="text-sm text-gray-500">
                            Comma-separated values (Excel compatible)
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          value="json"
                          checked={exportFormat === "json"}
                          onChange={(e) =>
                            setExportFormat(
                              e.target.value as "csv" | "json" | "xml"
                            )
                          }
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">JSON</div>
                          <div className="text-sm text-gray-500">
                            JavaScript Object Notation (API friendly)
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          value="xml"
                          checked={exportFormat === "xml"}
                          onChange={(e) =>
                            setExportFormat(
                              e.target.value as "csv" | "json" | "xml"
                            )
                          }
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">XML</div>
                          <div className="text-sm text-gray-500">
                            Extensible Markup Language (legacy systems)
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Exporting {(membersCount || 0).toLocaleString()} member
                      {membersCount !== 1 ? "s" : ""} from "{segment?.name}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowExportModal(false)}
                    disabled={isExporting}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomExport}
                    disabled={isExporting}
                    className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: color.primary.action }}
                    onMouseEnter={(e) => {
                      if (!isExporting) {
                        (e.target as HTMLButtonElement).style.backgroundColor =
                          color.primary.action;
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        color.primary.action;
                    }}
                  >
                    {isExporting ? (
                      <>
                        <LoadingSpinner size="sm" className="inline" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Export as {exportFormat.toUpperCase()}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
