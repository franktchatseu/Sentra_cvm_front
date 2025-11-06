import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  Trash2,
  Play,
  Pause,
  Archive,
  Filter,
  AlertCircle,
  Package,
} from "lucide-react";
import { Offer, SearchParams, OfferStatusEnum } from "../types/offer";
import { offerService } from "../services/offerService";
import { offerCategoryService } from "../services/offerCategoryService";
import { OfferCategoryType } from "../types/offerCategory";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import { color, tw } from "../../../shared/utils/utils";
import { useToast } from "../../../contexts/ToastContext";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useAuth } from "../../../contexts/AuthContext";

export default function OffersPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<OfferCategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOffers, setTotalOffers] = useState(0);
  const [offerStats, setOfferStats] = useState<{
    total: number;
    active: number;
    expired: number;
    pendingApproval: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchParams>({
    page: 1,
    limit: 10,
    sortBy: "created_at",
    sortDirection: "DESC",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OfferStatusEnum | "all">(
    "all"
  );
  const [selectedApproval, setSelectedApproval] = useState<string | "all">(
    "all"
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);

  // Dropdown menu state
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const actionMenuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Loading states for individual offers
  const [loadingAction, setLoadingAction] = useState<{
    offerId: number;
    action: string;
  } | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadCategories = async () => {
    try {
      const response = await offerCategoryService.getAllCategories({
        limit: 100,
        skipCache: true,
      });
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadOffers = async (skipCache = false) => {
    try {
      setLoading(true);

      const searchParams: SearchParams = {
        ...filters,
        search: debouncedSearchTerm || undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        skipCache: skipCache,
      };

      const response = await offerService.searchOffers(searchParams);

      if (response.success && response.data) {
        setOffers(response.data);
        const total = response.pagination?.total || response.data.length;
        setTotalOffers(total);
      } else {
        showError(
          "Failed to load offers",
          "Unable to retrieve offers. Please try again."
        );
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "Failed to load offers";
      showError("Failed to load offers", errorMessage);
      console.error("Error loading offers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get category name from category_id
  const getCategoryName = (categoryId: string | number | undefined): string => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(
      (cat) => String(cat.id) === String(categoryId)
    );
    return category?.name || "Uncategorized";
  };

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load offer stats
  useEffect(() => {
    const fetchOfferStats = async () => {
      try {
        setStatsLoading(true);
        let total = 0;
        let active = 0;
        let expired = 0;
        let pendingApproval = 0;

        // Fetch total and active from stats
        try {
          const offersResponse = await offerService.getStats();
          if (offersResponse.success && offersResponse.data) {
            total = offersResponse.data.totalOffers || 0;
            active = offersResponse.data.activeOffers || 0;
          }
        } catch (error) {
          console.error("Error fetching offer stats:", error);
        }

        // If stats don't have total, get from pagination
        if (total === 0) {
          try {
            const offersList = await offerService.searchOffers({ limit: 1 });
            if (offersList.pagination?.total !== undefined) {
              total = offersList.pagination.total;
            }
          } catch (error) {
            console.error("Error fetching total offers:", error);
          }
        }

        // Fetch expired offers count
        try {
          const expiredResponse = await offerService.getExpiredOffers({
            limit: 1,
          });
          expired = expiredResponse.pagination?.total || 0;
        } catch (error) {
          console.error("Error fetching expired offers:", error);
        }

        // Fetch pending approval offers count
        try {
          const pendingResponse = await offerService.getPendingApprovalOffers({
            limit: 1,
          });
          pendingApproval = pendingResponse.pagination?.total || 0;
        } catch (error) {
          console.error("Error fetching pending approval offers:", error);
        }

        setOfferStats({ total, active, expired, pendingApproval });
      } catch (error) {
        console.error("Error loading offer stats:", error);
        setOfferStats({ total: 0, active: 0, expired: 0, pendingApproval: 0 });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchOfferStats();
  }, []);

  // Load offers on component mount and filter changes
  useEffect(() => {
    loadOffers(true); // Always skip cache for fresh data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedStatus, selectedApproval, debouncedSearchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status: OfferStatusEnum | "all") => {
    setSelectedStatus(status);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowAdvancedFilters(false);
      setIsClosingModal(false);
    }, 300); // Match the transition duration
  };

  const handleApprovalFilter = (approval: string | "all") => {
    setSelectedApproval(approval);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (
    key: keyof SearchParams,
    value: string | number | boolean | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleViewOffer = (id: number) => {
    navigate(`/dashboard/offers/${id}`);
  };

  const handleEditOffer = (id: number) => {
    navigate(`/dashboard/offers/${id}/edit`);
  };

  const handleCopyOfferId = (id: number) => {
    navigator.clipboard.writeText(id.toString());
    success("Copied", "Offer ID copied to clipboard");
  };

  // Calculate dropdown position
  const calculateDropdownPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect();
    const dropdownWidth = 256; // w-64
    const dropdownHeight = 300;

    let top = rect.bottom + 8;
    let left = rect.right - dropdownWidth;

    if (left < 8) left = 8;
    if (left + dropdownWidth > window.innerWidth - 8) {
      left = window.innerWidth - dropdownWidth - 8;
    }
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = rect.top - dropdownHeight - 8;
    }

    return { top, left };
  };

  const handleActionMenuToggle = (
    offerId: number,
    buttonElement: HTMLElement
  ) => {
    if (showActionMenu === offerId) {
      setShowActionMenu(null);
      setDropdownPosition(null);
    } else {
      const position = calculateDropdownPosition(buttonElement);
      setDropdownPosition(position);
      setShowActionMenu(offerId);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionMenu !== null) {
        const target = event.target as HTMLElement;
        const isInsideDropdown = target.closest(".action-dropdown");
        const isInsideButton = target.closest(".action-button");

        if (!isInsideDropdown && !isInsideButton) {
          setShowActionMenu(null);
          setDropdownPosition(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showActionMenu]);

  const handleDeleteOffer = async (id: number, name: string) => {
    const confirmed = await confirm({
      title: "Delete Offer",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await offerService.deleteOffer(id);
      success("Offer Deleted", `"${name}" has been deleted successfully.`);
      await loadOffers(true); // Skip cache for immediate update
      setShowActionMenu(null);
    } catch (err) {
      showError("Error", "Failed to delete offer");
      console.error("Delete offer error:", err);
    }
  };

  const handleActivateOffer = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: "activate" });
      const response = await offerService.activateOffer(id);

      // Optimistically update the offer in the list
      const responseData = response as unknown as {
        success: boolean;
        data?: { lifecycle_status?: string };
      };
      if (responseData.success && responseData.data?.lifecycle_status) {
        const newStatus = responseData.data.lifecycle_status;
        setOffers((prevOffers) =>
          prevOffers.map((offer) =>
            Number(offer.id) === id
              ? { ...offer, lifecycle_status: newStatus as string }
              : offer
          )
        );
      } else {
        // Fallback: reload if response doesn't include status
        await loadOffers(true);
      }

      success("Offer Activated", "Offer has been activated successfully.");
      setShowActionMenu(null);
    } catch (err) {
      showError("Error", "Failed to activate offer");
      console.error("Activate offer error:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  // const handleDeactivateOffer = async (id: number) => {
  //   try {
  //     setLoadingAction({ offerId: id, action: "deactivate" });
  //     const response = await offerService.deactivateOffer(id);

  //     // Optimistically update the offer in the list
  //     const responseData = response as unknown as {
  //       success: boolean;
  //       data?: { lifecycle_status?: string };
  //     };
  //     if (responseData.success && responseData.data?.lifecycle_status) {
  //       const newStatus = responseData.data.lifecycle_status;
  //       setOffers((prevOffers) =>
  //         prevOffers.map((offer) =>
  //           Number(offer.id) === id
  //             ? { ...offer, lifecycle_status: newStatus as string }
  //             : offer
  //         )
  //       );
  //     } else {
  //       // Fallback: reload if response doesn't include status
  //       await loadOffers(true);
  //     }

  //     success("Offer Deactivated", "Offer has been deactivated successfully.");
  //     setShowActionMenu(null);
  //   } catch (err) {
  //     showError("Error", "Failed to deactivate offer");
  //     console.error("Deactivate offer error:", err);
  //   } finally {
  //     setLoadingAction(null);
  //   }
  // };

  const handlePauseOffer = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: "pause" });
      const response = await offerService.pauseOffer(id);

      // Optimistically update the offer in the list
      const responseData = response as unknown as {
        success: boolean;
        data?: { lifecycle_status?: string };
      };
      if (responseData.success && responseData.data?.lifecycle_status) {
        const newStatus = responseData.data.lifecycle_status;
        setOffers((prevOffers) =>
          prevOffers.map((offer) =>
            Number(offer.id) === id
              ? { ...offer, lifecycle_status: newStatus as string }
              : offer
          )
        );
      } else {
        // Fallback: reload if response doesn't include status
        await loadOffers(true);
      }

      success("Offer Paused", "Offer has been paused successfully.");
      setShowActionMenu(null);
    } catch (err) {
      showError("Error", "Failed to pause offer");
      console.error("Pause offer error:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleArchiveOffer = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: "archive" });
      await offerService.archiveOffer(id);
      success("Offer Archived", "Offer has been archived successfully.");
      await loadOffers(true); // Skip cache for immediate update
      setShowActionMenu(null);
    } catch (err) {
      showError("Error", "Failed to archive offer");
      console.error("Archive offer error:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExpireOffer = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: "expire" });
      const response = await offerService.expireOffer(id);

      // Optimistically update the offer in the list
      const responseData = response as unknown as {
        success: boolean;
        data?: { lifecycle_status?: string };
      };
      if (responseData.success && responseData.data?.lifecycle_status) {
        const newStatus = responseData.data.lifecycle_status;
        setOffers((prevOffers) =>
          prevOffers.map((offer) =>
            Number(offer.id) === id
              ? { ...offer, lifecycle_status: newStatus as string }
              : offer
          )
        );
      } else {
        // Fallback: reload if response doesn't include status
        await loadOffers(true);
      }

      success("Offer Expired", "Offer has been expired successfully.");
      setShowActionMenu(null);
    } catch (err) {
      showError("Error", "Failed to expire offer");
      console.error("Expire offer error:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRequestApproval = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: "request_approval" });
      await offerService.requestApproval(id);
      success(
        "Approval Requested",
        "Approval request has been sent successfully."
      );
      await loadOffers(true); // Skip cache for immediate update
      setShowActionMenu(null);
    } catch (err) {
      showError("Error", "Failed to request approval");
      console.error("Request approval error:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApproveOffer = async (id: number) => {
    if (!user?.user_id) {
      showError("Error", "User ID not available. Please log in again.");
      return;
    }
    try {
      setLoadingAction({ offerId: id, action: "approve" });
      await offerService.approveOffer(id, { approved_by: user.user_id });
      success("Offer Approved", "Offer has been approved successfully.");
      await loadOffers(true); // Skip cache for immediate update
      setShowActionMenu(null);
    } catch (err) {
      showError("Error", "Failed to approve offer");
      console.error("Approve offer error:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectOffer = async (id: number) => {
    if (!user?.user_id) {
      showError("Error", "User ID not available. Please log in again.");
      return;
    }
    try {
      setLoadingAction({ offerId: id, action: "reject" });
      await offerService.rejectOffer(id, { rejected_by: user.user_id });
      success("Offer Rejected", "Offer has been rejected.");
      await loadOffers(true); // Skip cache for immediate update
      setShowActionMenu(null);
    } catch (err) {
      showError("Error", "Failed to reject offer");
      console.error("Reject offer error:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  // TODO: Backend doesn't support these endpoints yet (404 Not Found)
  // const handleViewApprovalHistory = (id: number) => {
  //   navigate(`/dashboard/offers/${id}/approval-history`);
  //   setShowActionMenu(null);
  // };

  // const handleViewLifecycleHistory = (id: number) => {
  //   navigate(`/dashboard/offers/${id}/lifecycle-history`);
  //   setShowActionMenu(null);
  // };

  // Helper functions for display

  const getStatusBadge = (status: OfferStatusEnum) => {
    switch (status) {
      case OfferStatusEnum.DRAFT:
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.surface.cards}] text-[${color.text.primary}]`}
          >
            Draft
          </span>
        );
      case OfferStatusEnum.ACTIVE:
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.success}] text-[${color.status.success}]`}
          >
            Active
          </span>
        );
      case OfferStatusEnum.PAUSED:
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.warning}] text-[${color.status.warning}]`}
          >
            Paused
          </span>
        );
      case OfferStatusEnum.EXPIRED:
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.danger}] text-[${color.status.danger}]`}
          >
            Expired
          </span>
        );
      case OfferStatusEnum.ARCHIVED:
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.surface.cards}] text-[${color.text.primary}]`}
          >
            Archived
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.surface.cards}] text-[${color.text.primary}]`}
          >
            {status}
          </span>
        );
    }
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.warning}]/10 text-[${color.status.warning}]`}
          >
            Pending
          </span>
        );
      case "approved":
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.success}]/10 text-[${color.status.success}]`}
          >
            Approved
          </span>
        );
      case "rejected":
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.danger}]/10 text-[${color.status.danger}]`}
          >
            Rejected
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.surface.cards}] text-[${color.text.primary}]`}
          >
            {status}
          </span>
        );
    }
  };

  // Filter offers based on search term
  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      !searchTerm ||
      offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || offer.status === selectedStatus;
    const matchesApproval =
      selectedApproval === "all" ||
      (offer.status === "approved"
        ? "approved"
        : offer.status === "rejected"
        ? "rejected"
        : "pending") === selectedApproval;

    return matchesSearch && matchesStatus && matchesApproval;
  });

  // Offer stats cards data
  const offerStatsCards = [
    {
      name: "Total Offers",
      value: offerStats?.total?.toLocaleString() || "0",
      icon: Package,
      color: color.primary.accent,
    },
    {
      name: "Active Offers",
      value: offerStats?.active?.toLocaleString() || "0",
      icon: CheckCircle,
      color: "#10B981", // Green
    },
    {
      name: "Expired Offers",
      value: offerStats?.expired?.toLocaleString() || "0",
      icon: Clock,
      color: "#F59E0B", // Orange
    },
    {
      name: "Pending Approval",
      value: offerStats?.pendingApproval?.toLocaleString() || "0",
      icon: AlertCircle,
      color: "#EF4444", // Red
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>
            Offers Management
          </h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>
            Create and manage customer offers with dynamic pricing and
            eligibility
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/offers/create")}
          className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 text-white"
          style={{ backgroundColor: color.primary.action }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </button>
      </div>

      {/* Offer Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {offerStatsCards.map((stat) => {
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
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[${color.text.muted}]`}
          />
          <input
            type="text"
            placeholder="Search offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
            className={`w-full pl-10 pr-4 py-3 border ${tw.borderDefault} rounded-lg focus:outline-none transition-all duration-200 bg-white focus:ring-2 focus:ring-[${color.primary.accent}]/20`}
          />
        </div>

        <HeadlessSelect
          options={[
            { value: "", label: "All Categories" },
            ...categories.map((category) => ({
              value: category.id.toString(),
              label: category.name,
            })),
          ]}
          value={filters.categoryId?.toString() || ""}
          onChange={(value) =>
            handleFilterChange("categoryId", value ? Number(value) : undefined)
          }
          placeholder="All Categories"
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

      {/* Offers Table */}
      <div
        className={`bg-white rounded-lg shadow-sm border border-[${color.border.default}] overflow-hidden`}
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div
              className={`animate-spin rounded-full h-8 w-8 border-b-2 border-[${color.primary.action}]`}
            ></div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className={`${tw.textSecondary}`}>No offers found</p>
              <button
                onClick={() => navigate("/dashboard/offers/create")}
                className="mt-4 inline-flex items-center px-3 py-2 text-base text-white font-semibold rounded-lg shadow-sm transition-all duration-200"
                style={{ backgroundColor: color.primary.action }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Offer
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={`border-b ${tw.borderDefault}`}
                style={{ background: color.surface.tableHeader }}
              >
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                    style={{ color: color.surface.tableHeaderText }}
                  >
                    Offer
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                    style={{ color: color.surface.tableHeaderText }}
                  >
                    Category
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                    style={{ color: color.surface.tableHeaderText }}
                  >
                    Status
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                    style={{ color: color.surface.tableHeaderText }}
                  >
                    Approval
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                    style={{ color: color.surface.tableHeaderText }}
                  >
                    Created
                  </th>
                  <th
                    className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider`}
                    style={{ color: color.surface.tableHeaderText }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`bg-white divide-y divide-[${color.border.default}]`}
              >
                {filteredOffers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <div
                            className={`font-semibold text-base ${tw.textPrimary} truncate`}
                          >
                            {offer.name}
                          </div>
                          <div
                            className={`text-sm ${tw.textSecondary} truncate flex items-center space-x-2 mt-1`}
                          >
                            <span className="truncate">
                              {offer.description}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          getCategoryName(offer.category_id) === "Data Offers"
                            ? `bg-[${color.status.info}]/10 text-[${color.status.info}]`
                            : getCategoryName(offer.category_id) ===
                              "Voice Offers"
                            ? `bg-[${color.status.success}]/10 text-[${color.status.success}]`
                            : getCategoryName(offer.category_id) ===
                              "Combo Offers"
                            ? `bg-[${color.primary.accent}]/10 text-[${color.primary.accent}]`
                            : getCategoryName(offer.category_id) ===
                              "Loyalty Rewards"
                            ? `bg-[${color.status.warning}]/10 text-[${color.status.warning}]`
                            : getCategoryName(offer.category_id) ===
                              "Promotional"
                            ? `bg-[${color.primary.action}]/10 text-[${color.primary.action}]`
                            : `bg-[${color.surface.cards}] text-[${color.text.primary}]`
                        }`}
                      >
                        {getCategoryName(offer.category_id)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(offer.status)}
                    </td>
                    <td className="px-6 py-5">
                      {getApprovalBadge(
                        offer.status === "approved"
                          ? "approved"
                          : offer.status === "rejected"
                          ? "rejected"
                          : "pending"
                      )}
                    </td>
                    <td className={`px-6 py-5 text-sm ${tw.textMuted}`}>
                      {offer.created_at
                        ? new Date(offer.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-5 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Play/Pause buttons - Only show if approved (not draft, not expired/archived) */}
                        {offer.status === OfferStatusEnum.APPROVED && (
                          <>
                            {offer.lifecycle_status === "paused" ? (
                              <button
                                onClick={() =>
                                  offer.id &&
                                  handleActivateOffer(Number(offer.id))
                                }
                                disabled={
                                  loadingAction?.offerId === Number(offer.id) &&
                                  loadingAction?.action === "activate"
                                }
                                className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                                style={{ backgroundColor: "transparent" }}
                                onMouseLeave={(e) => {
                                  (
                                    e.target as HTMLButtonElement
                                  ).style.backgroundColor = "transparent";
                                }}
                                title="Resume Offer"
                              >
                                {loadingAction?.offerId === Number(offer.id) &&
                                loadingAction?.action === "activate" ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                ) : (
                                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                )}
                              </button>
                            ) : offer.lifecycle_status === "active" ? (
                              <button
                                onClick={() =>
                                  offer.id && handlePauseOffer(Number(offer.id))
                                }
                                disabled={
                                  loadingAction?.offerId === Number(offer.id) &&
                                  loadingAction?.action === "pause"
                                }
                                className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                                style={{ backgroundColor: "transparent" }}
                                onMouseLeave={(e) => {
                                  (
                                    e.target as HTMLButtonElement
                                  ).style.backgroundColor = "transparent";
                                }}
                                title="Pause Offer"
                              >
                                {loadingAction?.offerId === Number(offer.id) &&
                                loadingAction?.action === "pause" ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                ) : (
                                  <Pause className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                )}
                              </button>
                            ) : null}
                          </>
                        )}

                        <button
                          onClick={() => offer.id && handleViewOffer(offer.id)}
                          className={`text-[${color.status.info}] hover:text-[${color.status.info}] p-1 rounded`}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => offer.id && handleEditOffer(offer.id)}
                          className={`${tw.textMuted} hover:${tw.textPrimary} p-1 rounded`}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            offer.id && handleCopyOfferId(offer.id)
                          }
                          className={`${tw.textMuted} hover:${tw.textPrimary} p-1 rounded`}
                          title="Copy ID"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <div
                          className="relative"
                          ref={(el) => {
                            actionMenuRefs.current[offer.id!] = el;
                          }}
                        >
                          <button
                            onClick={(e) =>
                              offer.id &&
                              handleActionMenuToggle(offer.id, e.currentTarget)
                            }
                            className={`action-button ${tw.textMuted} hover:${tw.textPrimary} p-1 rounded`}
                            title="More Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {showActionMenu === offer.id && dropdownPosition && (
                            <div
                              className="action-dropdown fixed w-72 bg-white border border-gray-200 rounded-lg shadow-xl py-2 pb-4"
                              style={{
                                zIndex: 99999,
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                                maxHeight: "80vh",
                                overflowY: "auto",
                              }}
                            >
                              {/* Duplicate Offer */}
                              {/* TODO: Re-enable when backend duplicate endpoint is available
                              <button
                                onClick={handleDuplicateOffer}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Copy className="w-4 h-4 mr-3" style={{ color: color.primary.action }} />
                                Duplicate Offer
                              </button>
                              */}

                              {/* Approved: Activate or Archive only */}
                              {offer.status === OfferStatusEnum.APPROVED && (
                                <>
                                  <button
                                    onClick={() =>
                                      offer.id &&
                                      handleActivateOffer(Number(offer.id))
                                    }
                                    disabled={
                                      loadingAction?.offerId ===
                                        Number(offer.id) &&
                                      loadingAction?.action === "activate"
                                    }
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Play className="w-4 h-4 mr-3 text-green-600" />
                                    Activate Offer
                                  </button>
                                  <button
                                    onClick={() =>
                                      offer.id && handleArchiveOffer(offer.id)
                                    }
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Archive
                                      className="w-4 h-4 mr-3"
                                      style={{ color: color.primary.action }}
                                    />
                                    Archive Offer
                                  </button>
                                </>
                              )}

                              {/* Active: Pause, Expire, Archive */}
                              {/* Note: Deactivate (to draft) is not allowed from active status */}
                              {offer.status === OfferStatusEnum.ACTIVE && (
                                <>
                                  <button
                                    onClick={() =>
                                      offer.id &&
                                      handlePauseOffer(Number(offer.id))
                                    }
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Pause className="w-4 h-4 mr-3 text-yellow-600" />
                                    Pause Offer
                                  </button>
                                  <button
                                    onClick={() =>
                                      offer.id && handleExpireOffer(offer.id)
                                    }
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Clock className="w-4 h-4 mr-3 text-gray-600" />
                                    Expire Offer
                                  </button>
                                  <button
                                    onClick={() =>
                                      offer.id && handleArchiveOffer(offer.id)
                                    }
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Archive
                                      className="w-4 h-4 mr-3"
                                      style={{ color: color.primary.action }}
                                    />
                                    Archive Offer
                                  </button>
                                </>
                              )}

                              {/* Paused: Resume, Archive */}
                              {offer.status === OfferStatusEnum.PAUSED && (
                                <>
                                  <button
                                    onClick={() =>
                                      offer.id &&
                                      handleActivateOffer(Number(offer.id))
                                    }
                                    disabled={
                                      loadingAction?.offerId ===
                                        Number(offer.id) &&
                                      loadingAction?.action === "activate"
                                    }
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Play className="w-4 h-4 mr-3 text-green-600" />
                                    Resume Offer
                                  </button>
                                  <button
                                    onClick={() =>
                                      offer.id && handleArchiveOffer(offer.id)
                                    }
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Archive
                                      className="w-4 h-4 mr-3"
                                      style={{ color: color.primary.action }}
                                    />
                                    Archive Offer
                                  </button>
                                </>
                              )}

                              {/* Draft: Submit for Approval */}
                              {offer.status === OfferStatusEnum.DRAFT && (
                                <button
                                  onClick={() =>
                                    offer.id && handleRequestApproval(offer.id)
                                  }
                                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <AlertCircle
                                    className="w-4 h-4 mr-3"
                                    style={{ color: color.status.info }}
                                  />
                                  Submit for Approval
                                </button>
                              )}

                              {/* Pending Approval: Approve/Reject */}
                              {offer.status ===
                                OfferStatusEnum.PENDING_APPROVAL && (
                                <>
                                  <button
                                    onClick={() =>
                                      offer.id && handleApproveOffer(offer.id)
                                    }
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                                    Approve Offer
                                  </button>
                                  <button
                                    onClick={() =>
                                      offer.id && handleRejectOffer(offer.id)
                                    }
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4 mr-3 text-red-600" />
                                    Reject Offer
                                  </button>
                                </>
                              )}

                              {/* Rejected: Request Approval (to resubmit) */}
                              {offer.status === OfferStatusEnum.REJECTED && (
                                <button
                                  onClick={() =>
                                    offer.id && handleRequestApproval(offer.id)
                                  }
                                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <AlertCircle
                                    className="w-4 h-4 mr-3"
                                    style={{ color: color.status.info }}
                                  />
                                  Request Approval
                                </button>
                              )}

                              {/* History Links */}
                              {/* TODO: Backend doesn't support these endpoints yet (404 Not Found) */}
                              {/* <button
                                onClick={() =>
                                  offer.id &&
                                  handleViewApprovalHistory(offer.id)
                                }
                                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <CheckCircle
                                  className="w-4 h-4 mr-3"
                                  style={{ color: color.primary.action }}
                                />
                                Approval History
                              </button>

                              <button
                                onClick={() =>
                                  offer.id &&
                                  handleViewLifecycleHistory(offer.id)
                                }
                                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Clock
                                  className="w-4 h-4 mr-3"
                                  style={{ color: color.primary.action }}
                                />
                                Lifecycle History
                              </button> */}

                              {/* Delete - Dangerous Action */}
                              <button
                                onClick={() =>
                                  offer.id &&
                                  handleDeleteOffer(offer.id, offer.name)
                                }
                                className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Delete Offer
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
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredOffers.length > 0 && (
        <div
          className={`bg-white rounded-xl shadow-sm border border-[${color.border.default}] px-4 sm:px-6 py-4`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div
              className={`text-base ${tw.textSecondary} text-center sm:text-left`}
            >
              Showing {((filters.page || 1) - 1) * (filters.pageSize || 10) + 1}{" "}
              to{" "}
              {Math.min(
                (filters.page || 1) * (filters.pageSize || 10),
                totalOffers
              )}{" "}
              of {totalOffers} offers
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, (prev.page || 1) - 1),
                  }))
                }
                disabled={(filters.page || 1) <= 1}
                className={`px-3 py-2 text-base border border-[${color.border.default}] rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
              >
                Previous
              </button>
              <span className={`text-base ${tw.textSecondary} px-2`}>
                Page {filters.page || 1} of{" "}
                {Math.ceil(totalOffers / (filters.pageSize || 10))}
              </span>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page || 1) + 1,
                  }))
                }
                disabled={
                  (filters.page || 1) >=
                  Math.ceil(totalOffers / (filters.pageSize || 10))
                }
                className={`px-3 py-2 text-base border border-[${color.border.default}] rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Side Modal */}
      {(showAdvancedFilters || isClosingModal) &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] overflow-hidden ${
              isClosingModal
                ? "animate-out fade-out duration-300"
                : "animate-in fade-in duration-300"
            }`}
          >
            <div
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={handleCloseModal}
            ></div>
            <div
              className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                isClosingModal ? "translate-x-full" : "translate-x-0"
              }`}
            >
              <div className={`p-6 border-b ${tw.borderDefault}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`${tw.subHeading} ${tw.textPrimary}`}>
                    Filter Offers
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className={`p-2 ${tw.textMuted} hover:bg-gray-50 rounded-lg transition-colors`}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                {/* Status Filter */}
                <div>
                  <label
                    className={`block text-sm font-medium ${tw.textPrimary} mb-3`}
                  >
                    Status
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Status" },
                      { value: OfferStatusEnum.DRAFT, label: "Draft" },
                      { value: OfferStatusEnum.ACTIVE, label: "Active" },
                      { value: OfferStatusEnum.PAUSED, label: "Paused" },
                      { value: OfferStatusEnum.EXPIRED, label: "Expired" },
                      { value: OfferStatusEnum.ARCHIVED, label: "Archived" },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={selectedStatus === option.value}
                          onChange={() =>
                            handleStatusFilter(
                              option.value as OfferStatusEnum | "all"
                            )
                          }
                          className={`mr-3 text-[${color.primary.action}] focus:ring-[${color.primary.action}]`}
                        />
                        <span className={`text-sm ${tw.textSecondary}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Approval Filter */}
                <div>
                  <label
                    className={`block text-sm font-medium ${tw.textPrimary} mb-3`}
                  >
                    Approval Status
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Approval" },
                      { value: "pending", label: "Pending" },
                      { value: "approved", label: "Approved" },
                      { value: "rejected", label: "Rejected" },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="approval"
                          value={option.value}
                          checked={selectedApproval === option.value}
                          onChange={() =>
                            handleApprovalFilter(option.value as string | "all")
                          }
                          className={`mr-3 text-[${color.primary.action}] focus:ring-[${color.primary.action}]`}
                        />
                        <span className={`text-sm ${tw.textSecondary}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedStatus("all");
                      setSelectedApproval("all");
                    }}
                    className={`flex-1 px-4 py-2 text-sm border border-gray-300 ${tw.textSecondary} rounded-lg hover:bg-gray-50 transition-colors`}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      handleSearch(searchTerm);
                      handleCloseModal();
                    }}
                    className={`${tw.button} flex-1 px-4 py-2 text-sm`}
                  >
                    Apply Filters
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
