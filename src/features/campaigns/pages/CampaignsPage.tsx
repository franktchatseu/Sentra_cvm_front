import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useToast } from "../../../contexts/ToastContext";
import {
  Plus,
  Filter,
  Search,
  Users,
  // Calendar,
  MoreHorizontal,
  Eye,
  Play,
  Pause,
  Edit,
  Copy,
  Archive,
  Trash2,
  Download,
  History,
  CheckCircle,
} from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { campaignService } from "../services/campaignService";
import { useFileDownload } from "../../../shared/hooks/useFileDownload";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import DeleteConfirmModal from "../../../shared/components/ui/DeleteConfirmModal";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import ExecuteCampaignModal from "../components/ExecuteCampaignModal";
import ApproveCampaignModal from "../components/ApproveCampaignModal";
import RejectCampaignModal from "../components/RejectCampaignModal";

interface CampaignDisplay {
  id: number;
  name: string;
  description?: string;
  status: string;
  type?: string;
  category?: string;
  category_id?: number;
  segment?: string;
  offer?: string;
  objective?: string;
  startDate?: string;
  endDate?: string;
  performance?: {
    sent: number;
    delivered: number;
    opened?: number;
    converted: number;
    revenue: number;
  };
}

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { downloadBlob } = useFileDownload();
  const { showToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: "all",
    approvalStatus: "all",
    startDateFrom: "",
    startDateTo: "",
    sortBy: "created_at",
    sortDirection: "DESC" as "ASC" | "DESC",
  });
  const filterRef = useRef<HTMLDivElement>(null);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [campaignToExecute, setCampaignToExecute] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [campaignToApprove, setCampaignToApprove] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [campaignToReject, setCampaignToReject] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const actionMenuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [campaigns, setCampaigns] = useState<CampaignDisplay[]>([]);
  const [allCampaignsUnfiltered, setAllCampaignsUnfiltered] = useState<
    CampaignDisplay[]
  >([]);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [currentPage] = useState(1);
  const [pageSize] = useState(10);
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string; description?: string }>
  >([]);

  // Use click outside hook for filter modal
  useClickOutside(filterRef, () => setShowAdvancedFilters(false), {
    enabled: showAdvancedFilters,
  });

  const handleActionMenuToggle = (campaignId: number) => {
    if (showActionMenu === campaignId) {
      setShowActionMenu(null);
    } else {
      setShowActionMenu(campaignId);
    }
  };

  // Fetch campaign categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await campaignService.getCampaignCategories();
      console.log("Categories fetched:", response);
      const categoriesData = Array.isArray(response)
        ? response
        : (response as Record<string, unknown>)?.data || [];
      setCategories(
        categoriesData as Array<{
          id: number;
          name: string;
          description?: string;
        }>
      );
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  }, []);

  // Fetch campaigns from API
  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);

      // Calculate offset for pagination
      const offset = (currentPage - 1) * pageSize;

      // Use new getCampaigns endpoint
      const response = await campaignService.getCampaigns({
        limit: pageSize,
        offset: offset,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        search: searchQuery.trim() || undefined,
        skipCache: true,
      });

      // Transform backend campaigns to display format
      const campaignsData: CampaignDisplay[] = response.data.map(
        (campaign) => ({
          id: campaign.id,
          name: campaign.name,
          description: campaign.description || undefined,
          status: campaign.status,
          category_id: campaign.category_id || undefined,
          objective: campaign.objective,
          startDate: campaign.start_date || undefined,
          endDate: campaign.end_date || undefined,
        })
      );

      // Helper function to generate consistent random values based on campaign ID
      const seededRandom = (seed: number, min: number, max: number) => {
        const x = Math.sin(seed) * 10000;
        const random = x - Math.floor(x);
        return Math.floor(random * (max - min + 1)) + min;
      };

      const seededRandomFloat = (seed: number, min: number, max: number) => {
        const x = Math.sin(seed) * 10000;
        const random = x - Math.floor(x);
        return random * (max - min) + min;
      };

      // Add dummy performance data and dates for campaigns that don't have them
      const campaignsWithDummyData = campaignsData.map((campaign) => {
        // Ensure category_id is properly set from API response
        if (
          (campaign as CampaignDisplay & { category_id?: string }).category_id
        ) {
          campaign.category_id = parseInt(
            (campaign as CampaignDisplay & { category_id: string }).category_id
          );
        }
        // Add dummy performance data if not present
        if (!campaign.performance) {
          // Generate realistic dummy performance data based on campaign ID (consistent values)
          const baseSent = seededRandom(campaign.id * 1, 1000, 11000);
          const deliveryRate = seededRandomFloat(campaign.id * 2, 0.95, 0.99);
          const openRate = seededRandomFloat(campaign.id * 3, 0.15, 0.4);
          const conversionRate = seededRandomFloat(campaign.id * 4, 0.02, 0.1);

          const delivered = Math.floor(baseSent * deliveryRate);
          const opened = Math.floor(delivered * openRate);
          const converted = Math.floor(delivered * conversionRate);
          const revenue = converted * seededRandom(campaign.id * 5, 50, 250);

          campaign.performance = {
            sent: baseSent,
            delivered: delivered,
            opened: opened,
            converted: converted,
            revenue: Math.round(revenue),
          };
        }

        // Add dummy dates if not present
        if (!campaign.startDate || !campaign.endDate) {
          const now = new Date();
          const daysAgo = seededRandom(campaign.id * 6, 1, 30);
          const campaignDuration = seededRandom(campaign.id * 7, 1, 14);

          const startDate = new Date(now);
          startDate.setDate(startDate.getDate() - daysAgo);

          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + campaignDuration);

          campaign.startDate = startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          campaign.endDate = endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }

        // Add dummy segment if not present (consistent based on campaign ID)
        if (!campaign.segment) {
          const existingSegments = [
            "High Value Customers",
            "At Risk Customers",
            "New Subscribers",
            "Voice Heavy Users",
            "Data Bundle Enthusiasts",
            "Weekend Warriors",
            "Business Customers",
            "Dormant Users",
          ];

          // Use campaign ID to ensure consistent segment from existing segments
          campaign.segment =
            existingSegments[campaign.id % existingSegments.length];
        }

        // Add dummy campaign type and objective if not present (consistent based on campaign ID)
        if (!campaign.type) {
          const campaignTypes = [
            "Multiple Target",
            "Champion Challenger",
            "A/B Test",
            "Round Robin",
            "Multiple Level",
          ];
          // Use campaign ID to ensure consistent type
          campaign.type = campaignTypes[campaign.id % campaignTypes.length];
        }

        if (!campaign.objective) {
          const objectives = [
            "acquisition",
            "retention",
            "engagement",
            "conversion",
            "reactivation",
          ];
          // Use campaign ID to ensure consistent objective
          campaign.objective = objectives[campaign.id % objectives.length];
        }

        return campaign;
      });

      setAllCampaignsUnfiltered(campaignsWithDummyData);

      const finalCampaigns =
        selectedStatus === "all"
          ? campaignsWithDummyData.filter((c) => c.status !== "archived")
          : campaignsWithDummyData;

      setCampaigns(finalCampaigns);
      setTotalCampaigns(
        selectedStatus === "all"
          ? finalCampaigns.length
          : response.pagination?.total || campaignsData.length
      );
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      setCampaigns([]);
      setTotalCampaigns(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery, filters, currentPage, pageSize]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch campaigns when filters change
  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, searchQuery, filters, currentPage, pageSize]);

  // Close action menus when clicking outside
  useEffect(() => {
    const handleClickOutsideActionMenus = (event: MouseEvent) => {
      const clickedOutsideActionMenus = Object.values(
        actionMenuRefs.current
      ).every((ref) => ref && !ref.contains(event.target as Node));
      if (clickedOutsideActionMenus) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideActionMenus);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideActionMenus);
    };
  }, []);

  const statusOptions = [
    { value: "all", label: "All Campaigns", count: totalCampaigns },
    {
      value: "active",
      label: "Active",
      count:
        selectedStatus === "active"
          ? totalCampaigns
          : allCampaignsUnfiltered.filter((c) => c.status === "active").length,
    },
    {
      value: "scheduled",
      label: "Scheduled",
      count:
        selectedStatus === "scheduled"
          ? totalCampaigns
          : allCampaignsUnfiltered.filter((c) => c.status === "scheduled")
              .length,
    },
    {
      value: "paused",
      label: "Paused",
      count:
        selectedStatus === "paused"
          ? totalCampaigns
          : allCampaignsUnfiltered.filter((c) => c.status === "paused").length,
    },
    {
      value: "completed",
      label: "Completed",
      count:
        selectedStatus === "completed"
          ? totalCampaigns
          : allCampaignsUnfiltered.filter((c) => c.status === "completed")
              .length,
    },
    {
      value: "draft",
      label: "Draft",
      count:
        selectedStatus === "draft"
          ? totalCampaigns
          : allCampaignsUnfiltered.filter((c) => c.status === "draft").length,
    },
    {
      value: "archived",
      label: "Archived",
      count:
        selectedStatus === "archived"
          ? totalCampaigns
          : allCampaignsUnfiltered.filter((c) => c.status === "archived")
              .length,
    },
  ];

  // Category options from API
  const categoryOptions = [
    { value: "all", label: "All Catalogs" },
    ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name })),
  ];

  const approvalStatusOptions = [
    { value: "all", label: "All Approval Status" },
    { value: "pending", label: "Pending Approval" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const sortOptions = [
    { value: "created_at", label: "Date Created" },
    { value: "updated_at", label: "Date Updated" },
    { value: "name", label: "Campaign Name" },
    { value: "status", label: "Status" },
    { value: "approval_status", label: "Approval Status" },
    { value: "start_date", label: "Start Date" },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      active: `bg-[${color.status.success}]/10 text-[${color.status.success}]`,
      scheduled: `bg-[${color.status.warning}]/10 text-[${color.status.warning}]`,
      paused: `bg-[${color.interactive.hover}] text-[${color.text.secondary}]`,
      completed: `bg-[${color.status.info}]/10 text-[${color.status.info}]`,
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  // Action handlers using service layer
  const handleDuplicateCampaign = async (campaign: CampaignDisplay) => {
    try {
      const newName = `Copy of ${campaign.name}`;
      await campaignService.duplicateCampaign(campaign.id, { newName });
      showToast("success", "Campaign duplicated successfully");
      setShowActionMenu(null);
      fetchCampaigns(); // Refresh campaigns list
    } catch (error) {
      console.error("Failed to duplicate campaign:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to duplicate campaign";
      showToast("error", errorMessage);
    }
  };

  const handleCloneWithChanges = async (campaign: CampaignDisplay) => {
    // TODO: Open a modal to collect modifications
    // For now, navigate to edit page of the cloned campaign
    try {
      const newName = `Clone of ${campaign.name}`;
      const response = await campaignService.cloneCampaignWithModifications(
        campaign.id,
        {
          newName,
          modifications: {}, // Empty modifications - user will edit in the edit page
        }
      );
      showToast("success", "Campaign cloned successfully");
      setShowActionMenu(null);

      // Navigate to edit page of the newly cloned campaign
      if (response.clonedCampaignId) {
        navigate(`/dashboard/campaigns/${response.clonedCampaignId}/edit`);
      } else {
        fetchCampaigns(); // Fallback: just refresh list
      }
    } catch (error) {
      console.error("Failed to clone campaign with modifications:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to clone campaign";
      showToast("error", errorMessage);
    }
  };

  const handleArchiveCampaign = async (campaignId: number) => {
    try {
      await campaignService.archiveCampaign(campaignId);
      console.log("Campaign archived successfully");
      setShowActionMenu(null);
      fetchCampaigns(); // Refresh campaigns list
    } catch (error) {
      console.error("Failed to archive campaign:", error);
    }
  };

  const handleDeleteCampaign = (campaignId: number, campaignName: string) => {
    setCampaignToDelete({ id: campaignId, name: campaignName });
    setShowDeleteModal(true);
    setShowActionMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;

    setIsDeleting(true);
    try {
      await campaignService.deleteCampaign(campaignToDelete.id);
      console.log("Campaign deleted successfully");
      setShowDeleteModal(false);
      setCampaignToDelete(null);
      fetchCampaigns(); // Refresh campaigns list
    } catch (error) {
      console.error("Failed to delete campaign:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCampaignToDelete(null);
  };

  const handleExportCampaign = async (campaignId: number) => {
    try {
      const blob = await campaignService.exportCampaign(campaignId);
      downloadBlob(blob, `campaign-${campaignId}-data.csv`);
      setShowActionMenu(null);
    } catch (error) {
      console.error("Failed to export campaign:", error);
    }
  };

  const handlePauseCampaign = async (campaignId: number) => {
    try {
      const pauseResponse = await campaignService.pauseCampaign(campaignId, {
        comments: "Paused from campaigns list",
      });

      // Update the campaign directly with the fresh data from API response
      const responseData = pauseResponse as unknown as {
        success: boolean;
        data?: { status?: string };
      };
      if (responseData.success && responseData.data?.status) {
        const newStatus = responseData.data.status;
        setCampaigns((prevCampaigns) =>
          prevCampaigns.map((campaign) =>
            campaign.id === campaignId
              ? { ...campaign, status: newStatus }
              : campaign
          )
        );
      }

      showToast("success", "Campaign paused successfully");
    } catch (error) {
      console.error("Failed to pause campaign:", error);
      showToast("error", "Failed to pause campaign");
    }
  };

  const handleResumeCampaign = async (campaignId: number) => {
    try {
      const resumeResponse = await campaignService.resumeCampaign(campaignId);

      // Update the campaign directly with the fresh data from API response
      const responseData = resumeResponse as unknown as {
        success: boolean;
        data?: { status?: string };
      };
      if (responseData.success && responseData.data?.status) {
        const newStatus = responseData.data.status;
        setCampaigns((prevCampaigns) =>
          prevCampaigns.map((campaign) =>
            campaign.id === campaignId
              ? { ...campaign, status: newStatus }
              : campaign
          )
        );
      }

      showToast("success", "Campaign resumed successfully");
    } catch (error) {
      console.error("Failed to resume campaign:", error);
      showToast("error", "Failed to resume campaign");
    }
  };

  const handleViewApprovalHistory = (campaignId: number) => {
    navigate(`/dashboard/campaigns/${campaignId}/approval-history`);
    setShowActionMenu(null);
  };

  const handleViewLifecycleHistory = (campaignId: number) => {
    navigate(`/dashboard/campaigns/${campaignId}/lifecycle-history`);
    setShowActionMenu(null);
  };

  const filteredCampaigns = campaigns;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>Campaigns</h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>
            Manage and monitor your customer engagement campaigns
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/campaigns/create")}
          className="inline-flex items-center px-4 py-2 font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 text-sm whitespace-nowrap text-white"
          style={{ backgroundColor: color.primary.action }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Campaign
        </button>
      </div>

      <div
        className={`bg-white rounded-xl border border-[${color.border.default}] p-6`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedStatus === option.value
                    ? "shadow-lg border-2"
                    : "border"
                }`}
                style={{
                  backgroundColor:
                    selectedStatus === option.value ? "white" : "white",
                  borderColor:
                    selectedStatus === option.value
                      ? color.primary.action
                      : color.border.default,
                  color:
                    selectedStatus === option.value
                      ? color.primary.action
                      : color.text.secondary,
                }}
                onMouseEnter={(e) => {
                  if (selectedStatus !== option.value) {
                    (
                      e.target as HTMLButtonElement
                    ).style.backgroundColor = `${color.primary.action}20`;
                    (e.target as HTMLButtonElement).style.color =
                      color.primary.action;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStatus !== option.value) {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      "#f9fafb";
                    (e.target as HTMLButtonElement).style.color =
                      color.text.secondary;
                  }
                }}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:w-auto">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[${color.text.muted}]`}
              />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-2.5 border border-[${color.border.default}] rounded-lg focus:outline-none focus:ring-0 focus:border-[${color.primary.action}] w-full sm:w-72 text-sm`}
              />
            </div>
            <button
              onClick={() => setShowAdvancedFilters(true)}
              className={`flex items-center px-4 py-2.5 border border-[${color.border.default}] ${tw.textSecondary} rounded-lg hover:bg-gray-50 transition-colors text-base font-medium w-full sm:w-auto`}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div
        className={`bg-white rounded-2xl border border-[${color.border.default}]`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner
              variant="modern"
              size="xl"
              color="primary"
              className="mb-4"
            />
            <p className={`${tw.textMuted} font-medium text-sm`}>
              Loading campaigns...
            </p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div>
            <table className="min-w-full">
              <thead
                className={`bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-[${color.border.default}]`}
              >
                <tr>
                  <th
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}
                  >
                    Campaign
                  </th>
                  <th
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider hidden lg:table-cell`}
                  >
                    Segment
                  </th>
                  <th
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider hidden md:table-cell`}
                  >
                    Performance
                  </th>
                  <th
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider hidden xl:table-cell`}
                  >
                    Dates
                  </th>
                  <th
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`bg-white divide-y divide-[${color.border.default}]/50`}
              >
                {filteredCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className={`group hover:bg-gray-50/30 transition-all duration-300 relative`}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <div
                            className={`font-semibold text-base ${tw.textPrimary} truncate`}
                          >
                            {campaign.name}
                          </div>
                          {campaign.description && (
                            <div className="mt-1 text-sm text-gray-500 truncate">
                              {campaign.description}
                            </div>
                          )}
                          <div className="mt-2 flex items-center space-x-2">
                            <span
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                              style={{
                                backgroundColor: "#F0FDF4",
                                color: "#16A34A",
                                borderColor: "#BBF7D0",
                              }}
                            >
                              <span className="capitalize">
                                {campaign.objective || "Acquisition"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                          campaign.status
                        )}`}
                      >
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell">
                      <div className="flex items-center space-x-2">
                        <Users
                          className={`w-4 h-4 text-[${color.primary.accent}] flex-shrink-0`}
                        />
                        <span className={`text-sm ${tw.textPrimary} truncate`}>
                          {campaign.segment}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      {campaign.performance ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className={`${tw.textSecondary}`}>
                              Conversion:
                            </span>
                            <span className={`font-medium ${tw.textPrimary}`}>
                              {(
                                (campaign.performance.converted /
                                  campaign.performance.sent) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className={`${tw.textSecondary}`}>
                              Revenue:
                            </span>
                            <span
                              className={`font-medium text-[${color.primary.action}]`}
                            >
                              ${campaign.performance.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className={`text-sm ${tw.textMuted}`}>
                          No data
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 hidden xl:table-cell">
                      <div className={`text-sm ${tw.textPrimary}`}>
                        {campaign.startDate ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500 text-xs">
                                Start:
                              </span>
                              <span className="font-medium">
                                {new Date(
                                  campaign.startDate
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            {campaign.endDate && (
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-500 text-xs">
                                  End:
                                </span>
                                <span className="font-medium">
                                  {new Date(
                                    campaign.endDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Not scheduled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/campaigns/${campaign.id}`)
                          }
                          className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-[${color.primary.action}]/10 transition-all duration-300`}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                        {/* Only show pause/resume for campaigns that can be paused/resumed */}
                        {campaign.status === "paused" ? (
                          <button
                            onClick={() => handleResumeCampaign(campaign.id)}
                            className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-green-500 transition-all duration-300`}
                            style={{ backgroundColor: "transparent" }}
                            onMouseLeave={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = "transparent";
                            }}
                            title="Resume Campaign"
                          >
                            <Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          </button>
                        ) : campaign.status === "active" ||
                          campaign.status === "running" ? (
                          <button
                            onClick={() => handlePauseCampaign(campaign.id)}
                            className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-orange-500 transition-all duration-300`}
                            style={{ backgroundColor: "transparent" }}
                            onMouseLeave={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = "transparent";
                            }}
                            title="Pause Campaign"
                          >
                            <Pause className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          </button>
                        ) : null}
                        <button
                          onClick={() =>
                            navigate(`/dashboard/campaigns/${campaign.id}/edit`)
                          }
                          className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-green-800 transition-all duration-300`}
                          style={{ backgroundColor: "transparent" }}
                          onMouseLeave={(e) => {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "transparent";
                          }}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                        <div
                          className="relative"
                          ref={(el) => {
                            actionMenuRefs.current[campaign.id] = el;
                          }}
                        >
                          <button
                            onClick={() => handleActionMenuToggle(campaign.id)}
                            className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-[${color.primary.action}]/10 transition-all duration-300`}
                          >
                            <MoreHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          </button>

                          {showActionMenu === campaign.id && (
                            <div
                              className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-3"
                              style={{
                                maxHeight: "80vh",
                                overflowY: "auto",
                                zIndex: 9999,
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCampaignToExecute({
                                    id: campaign.id,
                                    name: campaign.name,
                                  });
                                  setShowExecuteModal(true);
                                  setShowActionMenu(null);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                <Play
                                  className="w-4 h-4 mr-4"
                                  style={{ color: color.primary.accent }}
                                />
                                Execute Campaign
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCampaignToApprove({
                                    id: campaign.id,
                                    name: campaign.name,
                                  });
                                  setShowApproveModal(true);
                                  setShowActionMenu(null);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                <CheckCircle
                                  className="w-4 h-4 mr-4"
                                  style={{ color: "#10B981" }}
                                />
                                Approve Campaign
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCampaignToReject({
                                    id: campaign.id,
                                    name: campaign.name,
                                  });
                                  setShowRejectModal(true);
                                  setShowActionMenu(null);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                <Trash2
                                  className="w-4 h-4 mr-4"
                                  style={{ color: "#EF4444" }}
                                />
                                Reject Campaign
                              </button>

                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setShowActionMenu(null);
                                  try {
                                    await campaignService.activateCampaign(
                                      campaign.id
                                    );
                                    showToast(
                                      "success",
                                      `Campaign "${campaign.name}" activated successfully!`
                                    );
                                    fetchCampaigns();
                                  } catch (error) {
                                    console.error(
                                      "Error activating campaign:",
                                      error
                                    );
                                    showToast(
                                      "error",
                                      "Failed to activate campaign"
                                    );
                                  }
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                <Play
                                  className="w-4 h-4 mr-4"
                                  style={{ color: "#10B981" }}
                                />
                                Activate Campaign
                              </button>

                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setShowActionMenu(null);
                                  try {
                                    await campaignService.pauseCampaign(
                                      campaign.id
                                    );
                                    showToast(
                                      "success",
                                      `Campaign "${campaign.name}" paused successfully!`
                                    );
                                    fetchCampaigns();
                                  } catch (error) {
                                    console.error(
                                      "Error pausing campaign:",
                                      error
                                    );
                                    showToast(
                                      "error",
                                      "Failed to pause campaign"
                                    );
                                  }
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                <Pause
                                  className="w-4 h-4 mr-4"
                                  style={{ color: "#F59E0B" }}
                                />
                                Pause Campaign
                              </button>

                              <div className="border-t border-gray-200 my-2"></div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateCampaign(campaign);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                <Copy
                                  className="w-4 h-4 mr-4"
                                  style={{ color: color.primary.action }}
                                />
                                Duplicate Campaign
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCloneWithChanges(campaign);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                <Copy
                                  className="w-4 h-4 mr-4"
                                  style={{ color: color.primary.action }}
                                />
                                Clone with Changes
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveCampaign(campaign.id);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                <Archive
                                  className="w-4 h-4 mr-4"
                                  style={{ color: color.primary.action }}
                                />
                                Archive Campaign
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // handleViewAnalytics(campaign.id);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                View Analytics
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportCampaign(campaign.id);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                <Download
                                  className="w-4 h-4 mr-4"
                                  style={{ color: color.primary.action }}
                                />
                                Export Data
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewApprovalHistory(campaign.id);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                <CheckCircle
                                  className="w-4 h-4 mr-4"
                                  style={{ color: color.primary.action }}
                                />
                                Approval History
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewLifecycleHistory(campaign.id);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-#f9fafb transition-colors"
                              >
                                <History
                                  className="w-4 h-4 mr-4"
                                  style={{ color: color.primary.action }}
                                />
                                Lifecycle History
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCampaign(
                                    campaign.id,
                                    campaign.name
                                  );
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-4 text-red-500" />
                                Delete Campaign
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <h3 className={`${tw.cardHeading} text-gray-900 mb-1`}>
              No campaigns found
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {selectedStatus === "completed"
                ? "No completed campaigns yet. Campaigns will appear here once they finish running."
                : `No ${selectedStatus} campaigns found. Try creating a new campaign or check other status filters.`}
            </p>
            {selectedStatus !== "completed" && (
              <button
                onClick={() => navigate("/dashboard/campaigns/create")}
                className="mt-4 px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-200"
                style={{ backgroundColor: color.primary.action }}
              >
                Create Your First Campaign
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filters Side Modal */}
      {showAdvancedFilters &&
        createPortal(
          <div
            className="fixed inset-0 overflow-hidden"
            style={{ zIndex: 999999, top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowAdvancedFilters(false)}
            ></div>
            <div
              className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl"
              style={{ zIndex: 1000000 }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Filter Campaigns
                  </h2>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Catalog
                      </label>
                      <HeadlessSelect
                        options={categoryOptions}
                        value={filters.categoryId}
                        onChange={(value) =>
                          setFilters({
                            ...filters,
                            categoryId: value as string,
                          })
                        }
                        placeholder="Select a catalog..."
                        searchable={true}
                      />
                    </div>

                    {/* Approval Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Approval Status
                      </label>
                      <HeadlessSelect
                        options={approvalStatusOptions}
                        value={filters.approvalStatus}
                        onChange={(value) =>
                          setFilters({
                            ...filters,
                            approvalStatus: value as string,
                          })
                        }
                        placeholder="Select approval status..."
                      />
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Date Range
                      </label>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Start Date From
                          </label>
                          <input
                            type="date"
                            value={filters.startDateFrom}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                startDateFrom: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Start Date To
                          </label>
                          <input
                            type="date"
                            value={filters.startDateTo}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                startDateTo: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sorting */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Sort By
                      </label>
                      <div className="space-y-3">
                        <HeadlessSelect
                          options={sortOptions}
                          value={filters.sortBy}
                          onChange={(value) =>
                            setFilters({ ...filters, sortBy: value as string })
                          }
                          placeholder="Select sort field..."
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              setFilters({ ...filters, sortDirection: "ASC" })
                            }
                            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                              filters.sortDirection === "ASC"
                                ? "bg-[#3b8169] text-white border-[#3b8169]"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-#f9fafb"
                            }`}
                          >
                            ↑ Ascending
                          </button>
                          <button
                            onClick={() =>
                              setFilters({ ...filters, sortDirection: "DESC" })
                            }
                            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                              filters.sortDirection === "DESC"
                                ? "bg-[#3b8169] text-white border-[#3b8169]"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-#f9fafb"
                            }`}
                          >
                            ↓ Descending
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-#f9fafb">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setFilters({
                          categoryId: "all",
                          approvalStatus: "all",
                          startDateFrom: "",
                          startDateTo: "",
                          sortBy: "created_at",
                          sortDirection: "DESC",
                        });
                        setSearchQuery("");
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-#f9fafb transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowAdvancedFilters(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#3b8169] rounded-lg hover:bg-[#2d5f4a] transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
        itemName={campaignToDelete?.name || ""}
        isLoading={isDeleting}
        confirmText="Delete Campaign"
        cancelText="Cancel"
      />

      {/* Execute Campaign Modal */}
      {campaignToExecute && (
        <ExecuteCampaignModal
          isOpen={showExecuteModal}
          onClose={() => {
            setShowExecuteModal(false);
            setCampaignToExecute(null);
          }}
          campaignId={campaignToExecute.id}
          campaignName={campaignToExecute.name}
          onSuccess={() => {
            fetchCampaigns();
          }}
        />
      )}

      {/* Approve Campaign Modal */}
      {campaignToApprove && (
        <ApproveCampaignModal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setCampaignToApprove(null);
          }}
          campaignId={campaignToApprove.id}
          campaignName={campaignToApprove.name}
          onSuccess={() => {
            fetchCampaigns();
          }}
        />
      )}

      {/* Reject Campaign Modal */}
      {campaignToReject && (
        <RejectCampaignModal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setCampaignToReject(null);
          }}
          campaignId={campaignToReject.id}
          campaignName={campaignToReject.name}
          onSuccess={() => {
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
}
