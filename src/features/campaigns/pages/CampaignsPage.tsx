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
  Send,
  ChevronLeft,
  ChevronRight,
  Target,
  Clock,
  AlertCircle,
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
  const dropdownMenuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [campaigns, setCampaigns] = useState<CampaignDisplay[]>([]);
  const [allCampaignsUnfiltered, setAllCampaignsUnfiltered] = useState<
    CampaignDisplay[]
  >([]);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string; description?: string }>
  >([]);
  const [campaignStats, setCampaignStats] = useState<{
    total: number;
    active: number;
    draft: number;
    pendingApproval: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

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
      type CategoryRecord = {
        id: number;
        name: string;
        description?: string;
      };
      const categoriesData = Array.isArray(response)
        ? response
        : (response as { data?: CategoryRecord[] })?.data ?? [];
      setCategories(
        categoriesData as Array<{
          id: number;
          name: string;
          description?: string;
        }>
      );
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      showToast(
        "error",
        "Failed to load campaign categories. Please try again."
      );
      setCategories([]);
    }
  }, [showToast]);

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

        // Add dummy dates if not present (store as ISO strings for consistency)
        if (!campaign.startDate || !campaign.endDate) {
          const now = new Date();
          const daysAgo = seededRandom(campaign.id * 6, 1, 30);
          const campaignDuration = seededRandom(campaign.id * 7, 1, 14);

          const startDate = new Date(now);
          startDate.setDate(startDate.getDate() - daysAgo);

          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + campaignDuration);

          // Store as ISO strings for consistent parsing
          campaign.startDate = startDate.toISOString();
          campaign.endDate = endDate.toISOString();
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
      const total = response.pagination?.total || finalCampaigns.length;
      setTotalCampaigns(total);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      showToast(
        "error",
        "Failed to load campaigns. Please try again in a moment."
      );
      setCampaigns([]);
      setTotalCampaigns(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery, currentPage, pageSize, showToast]);

  // Fetch campaign stats
  useEffect(() => {
    const fetchCampaignStats = async () => {
      try {
        setStatsLoading(true);
        const response = await campaignService.getCampaignStats(true);

        if (response.success && response.data) {
          const data = response.data;
          // Parse the stats (they may come as strings or numbers)
          const total =
            parseInt(String(data.total_campaigns)) ||
            (typeof data.total_campaigns === "number"
              ? data.total_campaigns
              : 0);

          const activeNum = data.active_campaigns || data.currently_active;
          const active =
            typeof activeNum === "number"
              ? activeNum
              : parseInt(String(activeNum || "0"), 10) || 0;

          const draftNum = data.in_draft;
          const draft =
            typeof draftNum === "number"
              ? draftNum
              : parseInt(String(draftNum || "0"), 10) || 0;

          const pendingApprovalNum = data.pending_approval;
          const pendingApproval =
            typeof pendingApprovalNum === "number"
              ? pendingApprovalNum
              : parseInt(String(pendingApprovalNum || "0"), 10) || 0;

          setCampaignStats({
            total: Number(total),
            active: Number(active),
            draft: Number(draft),
            pendingApproval: Number(pendingApproval),
          });
        } else {
          // Fallback: calculate from all campaigns if stats endpoint fails
          try {
            const campaignsResponse = await campaignService.getCampaigns({
              limit: 1000,
              skipCache: true,
            });
            if (campaignsResponse.success && campaignsResponse.data) {
              const allCampaigns = campaignsResponse.data;
              const total = allCampaigns.length;
              const active = allCampaigns.filter(
                (c) => c.status === "active"
              ).length;
              const draft = allCampaigns.filter(
                (c) => c.status === "draft"
              ).length;
              const pendingApproval = allCampaigns.filter(
                (c) => c.approval_status === "pending"
              ).length;
              setCampaignStats({ total, active, draft, pendingApproval });
            } else {
              setCampaignStats({
                total: 0,
                active: 0,
                draft: 0,
                pendingApproval: 0,
              });
            }
          } catch {
            setCampaignStats({
              total: 0,
              active: 0,
              draft: 0,
              pendingApproval: 0,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch campaign stats:", error);
        // Fallback: calculate from all campaigns
        try {
          const campaignsResponse = await campaignService.getCampaigns({
            limit: 1000,
            skipCache: true,
          });
          if (campaignsResponse.success && campaignsResponse.data) {
            const allCampaigns = campaignsResponse.data;
            const total = allCampaigns.length;
            const active = allCampaigns.filter(
              (c) => c.status === "active"
            ).length;
            const draft = allCampaigns.filter(
              (c) => c.status === "draft"
            ).length;
            const pendingApproval = allCampaigns.filter(
              (c) => c.approval_status === "pending"
            ).length;
            setCampaignStats({ total, active, draft, pendingApproval });
          } else {
            setCampaignStats({
              total: 0,
              active: 0,
              draft: 0,
              pendingApproval: 0,
            });
          }
        } catch {
          setCampaignStats({
            total: 0,
            active: 0,
            draft: 0,
            pendingApproval: 0,
          });
        }
      } finally {
        setStatsLoading(false);
      }
    };

    fetchCampaignStats();
  }, []);

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
      const target = event.target as Node;
      // Check if click is inside any action menu button
      const clickedInsideButton = Object.values(actionMenuRefs.current).some(
        (ref) => ref && ref.contains(target)
      );

      // Check if click is inside any dropdown menu (portal)
      const clickedInsideDropdown = Object.values(
        dropdownMenuRefs.current
      ).some((ref) => ref && ref.contains(target));

      // Only close if clicked outside both button and dropdown
      if (!clickedInsideButton && !clickedInsideDropdown) {
        setShowActionMenu(null);
      }
    };

    if (showActionMenu !== null) {
      document.addEventListener("mousedown", handleClickOutsideActionMenus);
      return () => {
        document.removeEventListener(
          "mousedown",
          handleClickOutsideActionMenus
        );
      };
    }
  }, [showActionMenu]);

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
      const newName = `${campaign.name} (Copy)`;
      const response = await campaignService.duplicateCampaign(campaign.id, {
        newName,
      });
      showToast("success", "Campaign duplicated successfully!");
      fetchCampaigns(); // Refresh campaigns list

      // Optionally navigate to the duplicated campaign's edit page if response contains ID
      // The response might have different field names depending on backend implementation
      if (response && typeof response === "object") {
        const clonedId =
          (
            response as {
              clonedCampaignId?: number;
              id?: number;
              campaign_id?: number;
            }
          ).clonedCampaignId ||
          (response as { id?: number }).id ||
          (response as { campaign_id?: number }).campaign_id;
        if (clonedId) {
          navigate(`/dashboard/campaigns/${clonedId}/edit`);
        }
      }
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
      // TODO: Get actual user ID from auth context
      const userId = 1;
      await campaignService.archiveCampaign(campaignId, userId);
      showToast("success", "Campaign archived successfully!");
      setShowActionMenu(null);
      fetchCampaigns(); // Refresh campaigns list
    } catch (error) {
      console.error("Failed to archive campaign:", error);

      // Extract error message from backend response
      let errorMessage = "Failed to archive campaign";

      if (error instanceof Error) {
        const match = error.message.match(/details: ({.*})/);
        if (match) {
          try {
            const errorData = JSON.parse(match[1]);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message;
        }
      }

      showToast("error", errorMessage);
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
      // TODO: Get actual user ID from auth context
      const userId = 1;
      await campaignService.deleteCampaign(campaignToDelete.id, userId);
      showToast(
        "success",
        `Campaign "${campaignToDelete.name}" deleted successfully!`
      );
      setShowDeleteModal(false);
      setCampaignToDelete(null);
      fetchCampaigns(); // Refresh campaigns list
    } catch (error) {
      console.error("Failed to delete campaign:", error);

      // Extract error message from backend response
      let errorMessage = "Failed to delete campaign";

      if (error instanceof Error) {
        const match = error.message.match(/details: ({.*})/);
        if (match) {
          try {
            const errorData = JSON.parse(match[1]);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message;
        }
      }

      showToast("error", errorMessage);
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
      const pauseResponse = await campaignService.pauseCampaign(campaignId);

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

  // Calculate total pages
  const totalPages = Math.ceil(totalCampaigns / pageSize);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery]);

  // Campaign stats cards data
  const campaignStatsCards = [
    {
      name: "Total Campaigns",
      value: campaignStats?.total?.toLocaleString() || "0",
      icon: Target,
      color: color.tertiary.tag1, // Purple
    },
    {
      name: "Active Campaigns",
      value: campaignStats?.active?.toLocaleString() || "0",
      icon: CheckCircle,
      color: color.tertiary.tag4, // Green
    },
    {
      name: "Draft",
      value: campaignStats?.draft?.toLocaleString() || "0",
      icon: Clock,
      color: color.tertiary.tag3, // Yellow
    },
    {
      name: "Pending Approval",
      value: campaignStats?.pendingApproval?.toLocaleString() || "0",
      icon: AlertCircle,
      color: color.tertiary.tag2, // Coral
    },
  ];

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

      {/* Campaign Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {campaignStatsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="group bg-white rounded-2xl border border-gray-200 p-6 relative overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: stat.color || color.primary.accent,
                      }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-3xl font-bold ${tw.textPrimary}`}>
                        {statsLoading ? "..." : stat.value}
                      </p>
                      <p className={`${tw.cardSubHeading} ${tw.textSecondary}`}>
                        {stat.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
            style={{ color: color.text.muted }}
          />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchQuery(searchQuery)}
            className={`w-full pl-10 pr-4 py-3 text-sm border ${tw.borderDefault} rounded-lg focus:outline-none transition-all duration-200 bg-white focus:ring-2 focus:ring-[${color.primary.accent}]/20`}
          />
        </div>

        <HeadlessSelect
          options={statusOptions.map((option) => ({
            value: option.value,
            label: `${option.label} (${option.count})`,
          }))}
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(value as string)}
          placeholder="All Status"
          className=""
        />

        <button
          onClick={() => setShowAdvancedFilters(true)}
          className={`flex items-center px-4 py-2 rounded-lg bg-gray-50 transition-colors text-sm font-medium`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
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
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead
                className={`border-b ${tw.borderDefault}`}
                style={{ background: color.surface.tableHeader }}
              >
                <tr>
                  <th
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                    style={{ color: color.surface.tableHeaderText }}
                  >
                    Campaign name
                  </th>
                  <th
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                    style={{ color: color.surface.tableHeaderText }}
                  >
                    Status
                  </th>
                  <th
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell`}
                    style={{ color: color.surface.tableHeaderText }}
                  >
                    Segment
                  </th>
                  <th
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell`}
                    style={{ color: color.surface.tableHeaderText }}
                  >
                    Performance
                  </th>
                  <th
                    className={`px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell`}
                    style={{ color: color.surface.tableHeaderText }}
                  >
                    Dates
                  </th>
                  <th
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                    style={{ color: color.surface.tableHeaderText }}
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
                    <td className="px-3 sm:px-4 md:px-6 py-3 min-w-[200px]">
                      <div
                        className={`font-semibold text-sm sm:text-base ${tw.textPrimary} truncate`}
                        title={campaign.name}
                      >
                        {campaign.name}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusBadge(
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
                    <td className="px-3 sm:px-4 py-3 hidden lg:table-cell min-w-[160px] max-w-[200px]">
                      <div className={`text-xs sm:text-sm ${tw.textPrimary}`}>
                        {campaign.startDate ? (
                          (() => {
                            // Parse date - handle both ISO strings and formatted strings
                            let startDate: Date;
                            let endDate: Date | null = null;

                            try {
                              startDate = new Date(campaign.startDate);
                              if (campaign.endDate) {
                                endDate = new Date(campaign.endDate);
                              }
                            } catch {
                              return (
                                <span className="text-gray-400 text-xs">
                                  Invalid date
                                </span>
                              );
                            }

                            // Check if dates are valid
                            if (isNaN(startDate.getTime())) {
                              return (
                                <span className="text-gray-400 text-xs">
                                  Not scheduled
                                </span>
                              );
                            }

                            // Format dates compactly
                            const formatDateCompact = (date: Date) => {
                              return date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              });
                            };

                            const formatDateWithYear = (date: Date) => {
                              return date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              });
                            };

                            // Format start date
                            let startDateDisplay =
                              formatDateWithYear(startDate);
                            if (endDate && !isNaN(endDate.getTime())) {
                              const sameMonth =
                                startDate.getMonth() === endDate.getMonth();
                              const sameYear =
                                startDate.getFullYear() ===
                                endDate.getFullYear();

                              if (sameMonth && sameYear) {
                                // Same month and year: "Nov 10"
                                startDateDisplay = formatDateCompact(startDate);
                              } else if (sameYear) {
                                // Same year, different month: "Nov 10"
                                startDateDisplay = formatDateCompact(startDate);
                              }
                            }

                            // Format end date
                            let endDateDisplay =
                              endDate && !isNaN(endDate.getTime())
                                ? formatDateWithYear(endDate)
                                : null;

                            if (endDate && !isNaN(endDate.getTime())) {
                              const sameMonth =
                                startDate.getMonth() === endDate.getMonth();
                              const sameYear =
                                startDate.getFullYear() ===
                                endDate.getFullYear();

                              if (sameMonth && sameYear) {
                                // Same month and year: "Nov 15, 2025"
                                endDateDisplay = `${endDate.getDate()}, ${endDate.getFullYear()}`;
                              } else if (sameYear) {
                                // Same year, different month: "Dec 15, 2025"
                                endDateDisplay = formatDateWithYear(endDate);
                              }
                            }

                            return (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-500 text-xs whitespace-nowrap">
                                    Start:
                                  </span>
                                  <span className="font-medium truncate">
                                    {startDateDisplay}
                                  </span>
                                </div>
                                {endDateDisplay && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-gray-500 text-xs whitespace-nowrap">
                                      End:
                                    </span>
                                    <span className="font-medium truncate">
                                      {endDateDisplay}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <span className="text-gray-400 text-xs">
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
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Render dropdown menus via portal outside the table */}
                {filteredCampaigns.map((campaign) => {
                  if (
                    showActionMenu === campaign.id &&
                    actionMenuRefs.current[campaign.id]
                  ) {
                    const buttonRect =
                      actionMenuRefs.current[
                        campaign.id
                      ]!.getBoundingClientRect();

                    // Smart positioning to prevent cutoff
                    const dropdownWidth = 256; // w-64 = 256px
                    const spacing = 4;
                    const padding = 8; // Padding from viewport edges
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const estimatedDropdownContentHeight = 600; // Estimated full content height

                    // Calculate available space from button position
                    const spaceBelow =
                      viewportHeight - buttonRect.bottom - padding;
                    const spaceAbove = buttonRect.top - padding;

                    // Determine vertical position (above or below)
                    let top: number;
                    let maxHeight: number;

                    // Strategy: Show below by default, but flip to above if not enough space
                    // and there's more space above
                    if (
                      spaceBelow >= 250 ||
                      (spaceBelow > spaceAbove && spaceBelow >= 200)
                    ) {
                      // Enough space below - show below button
                      top = buttonRect.bottom + spacing;
                      // Calculate max height to fit in viewport
                      maxHeight = viewportHeight - top - padding;
                    } else if (
                      spaceAbove >= 250 ||
                      (spaceAbove > spaceBelow && spaceAbove >= 200)
                    ) {
                      // More space above - show above button
                      // Calculate how much height we can use
                      maxHeight = Math.min(
                        estimatedDropdownContentHeight,
                        spaceAbove - spacing
                      );
                      top = buttonRect.top - maxHeight - spacing;

                      // If calculated top is above viewport, adjust
                      if (top < padding) {
                        top = padding;
                        maxHeight = buttonRect.top - padding - spacing;
                      }
                    } else {
                      // Very little space - use the side with more space
                      if (spaceBelow >= spaceAbove) {
                        top = buttonRect.bottom + spacing;
                        maxHeight = Math.max(200, spaceBelow - spacing);
                      } else {
                        maxHeight = Math.max(200, spaceAbove - spacing);
                        top = buttonRect.top - maxHeight - spacing;
                        if (top < padding) {
                          top = padding;
                          maxHeight = Math.max(
                            200,
                            buttonRect.top - padding - spacing
                          );
                        }
                      }
                    }

                    // Ensure maxHeight doesn't exceed viewport and is reasonable
                    maxHeight = Math.min(
                      maxHeight,
                      viewportHeight - padding * 2
                    );
                    maxHeight = Math.max(maxHeight, 200);

                    // Final top position check - ensure it fits in viewport
                    if (top + maxHeight > viewportHeight - padding) {
                      top = viewportHeight - maxHeight - padding;
                    }
                    if (top < padding) {
                      top = padding;
                      maxHeight = Math.min(
                        maxHeight,
                        viewportHeight - padding * 2
                      );
                    }

                    // Calculate horizontal position (align to right edge of button)
                    let left = buttonRect.right - dropdownWidth;

                    // Ensure dropdown doesn't overflow on the right
                    if (left + dropdownWidth > viewportWidth - padding) {
                      left = viewportWidth - dropdownWidth - padding;
                    }

                    // Ensure dropdown doesn't overflow on the left
                    if (left < padding) {
                      left = padding;
                    }

                    return createPortal(
                      <div
                        ref={(el) => {
                          dropdownMenuRefs.current[campaign.id] = el;
                        }}
                        className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-3 w-64"
                        style={{
                          maxHeight: `${maxHeight}px`,
                          overflowY: "auto",
                          zIndex: 99999,
                          top: `${top}px`,
                          left: `${left}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
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
                          className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                        >
                          <Play
                            className="w-4 h-4 mr-4"
                            style={{ color: color.primary.accent }}
                          />
                          Execute Campaign
                        </button>

                        {campaign.status === "draft" && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              setShowActionMenu(null);
                              try {
                                await campaignService.submitForApproval(
                                  campaign.id
                                );
                                showToast(
                                  "success",
                                  `Campaign "${campaign.name}" submitted for approval!`
                                );
                                fetchCampaigns();
                              } catch (error) {
                                let errorMessage =
                                  "Failed to submit campaign for approval";
                                if (error instanceof Error) {
                                  const match =
                                    error.message.match(/details: ({.*})/);
                                  if (match) {
                                    try {
                                      const errorData = JSON.parse(match[1]);
                                      errorMessage =
                                        errorData.error ||
                                        errorData.message ||
                                        errorMessage;
                                    } catch {
                                      errorMessage = error.message;
                                    }
                                  } else {
                                    errorMessage = error.message;
                                  }
                                }
                                showToast("error", errorMessage);
                              }
                            }}
                            className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                          >
                            <Send
                              className="w-4 h-4 mr-4"
                              style={{ color: "#3B82F6" }}
                            />
                            Request Approval
                          </button>
                        )}

                        {campaign.status === "pending_approval" && (
                          <>
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
                              className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
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
                              className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-4 text-red-600" />
                              Reject Campaign
                            </button>
                          </>
                        )}

                        {campaign.status === "approved" && (
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
                                let errorMessage =
                                  "Failed to activate campaign";
                                if (error instanceof Error) {
                                  const match =
                                    error.message.match(/details: ({.*})/);
                                  if (match) {
                                    try {
                                      const errorData = JSON.parse(match[1]);
                                      errorMessage =
                                        errorData.error ||
                                        errorData.message ||
                                        errorMessage;
                                    } catch {
                                      errorMessage = error.message;
                                    }
                                  } else {
                                    errorMessage = error.message;
                                  }
                                }
                                showToast("error", errorMessage);
                              }
                            }}
                            className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                          >
                            <Play
                              className="w-4 h-4 mr-4"
                              style={{ color: "#10B981" }}
                            />
                            Activate Campaign
                          </button>
                        )}

                        {(campaign.status === "active" ||
                          campaign.status === "running") && (
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
                                let errorMessage = "Failed to pause campaign";
                                if (error instanceof Error) {
                                  errorMessage = error.message;
                                }
                                showToast("error", errorMessage);
                              }
                            }}
                            className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                          >
                            <Pause
                              className="w-4 h-4 mr-4"
                              style={{ color: "#F59E0B" }}
                            />
                            Pause Campaign
                          </button>
                        )}

                        <div className="border-t border-gray-200 my-2"></div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateCampaign(campaign);
                            setShowActionMenu(null);
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
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
                          className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
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
                            navigate(
                              `/dashboard/campaigns/${campaign.id}/edit`
                            );
                            setShowActionMenu(null);
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                        >
                          <Edit
                            className="w-4 h-4 mr-4"
                            style={{ color: color.primary.action }}
                          />
                          Edit Campaign
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveCampaign(campaign.id);
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                        >
                          <Archive
                            className="w-4 h-4 mr-4"
                            style={{ color: "#6B7280" }}
                          />
                          Archive Campaign
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/campaigns/${campaign.id}`);
                            setShowActionMenu(null);
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                        >
                          <Eye
                            className="w-4 h-4 mr-4"
                            style={{ color: color.primary.action }}
                          />
                          View Analytics
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportCampaign(campaign.id);
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
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
                          className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
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
                          className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                        >
                          <History
                            className="w-4 h-4 mr-4"
                            style={{ color: color.primary.action }}
                          />
                          Lifecycle History
                        </button>

                        <div className="border-t border-gray-200 my-2"></div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCampaign(campaign.id, campaign.name);
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-4 text-red-600" />
                          Delete Campaign
                        </button>
                      </div>,
                      document.body
                    );
                  }
                  // Clean up ref when dropdown is closed
                  if (dropdownMenuRefs.current[campaign.id]) {
                    dropdownMenuRefs.current[campaign.id] = null;
                  }
                  return null;
                })}
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

      {/* Pagination */}
      {!isLoading && filteredCampaigns.length > 0 && totalCampaigns > 0 && (
        <div
          className={`bg-white rounded-xl shadow-sm border ${tw.borderDefault} px-4 sm:px-6 py-4`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div
              className={`text-base ${tw.textSecondary} text-center sm:text-left`}
            >
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalCampaigns)} of{" "}
              {totalCampaigns} campaigns
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 border ${tw.borderDefault} rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-base whitespace-nowrap`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`text-base ${tw.textSecondary} px-2`}>
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`p-2 border ${tw.borderDefault} rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-base whitespace-nowrap`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
