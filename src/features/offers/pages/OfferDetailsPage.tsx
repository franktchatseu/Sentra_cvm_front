import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Archive,
  MoreVertical,
  Package,
} from "lucide-react";
import { Offer, OfferStatusEnum } from "../types/offer";
import { OfferCategoryType } from "../types/offerCategory";
import { offerService } from "../services/offerService";
import { offerCategoryService } from "../services/offerCategoryService";
import { productService } from "../../products/services/productService";
import { color, tw } from "../../../shared/utils/utils";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";

export default function OfferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success, error: showError } = useToast();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isApproveLoading, setIsApproveLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);
  const [isRequestApprovalLoading, setIsRequestApprovalLoading] =
    useState(false);
  const [isActivateLoading, setIsActivateLoading] = useState(false);
  const [isPauseLoading, setIsPauseLoading] = useState(false);
  const [isDeactivateLoading, setIsDeactivateLoading] = useState(false);
  const [isExpireLoading, setIsExpireLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [linkedProducts, setLinkedProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoryName, setCategoryName] = useState<string>("Uncategorized");
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close More menu when clicking outside
  useClickOutside(moreMenuRef, () => setShowMoreMenu(false));

  const loadOffer = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await offerService.getOfferById(Number(id));

      // Extract offer from response.data if wrapped, otherwise use response directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const offerData = (response as any).data || response;
      setOffer(offerData);

      // Fetch category name if category_id exists
      if (offerData.category_id) {
        try {
          const categoriesResponse =
            await offerCategoryService.getAllCategories({
              limit: 100,
              skipCache: true,
            });
          const categories =
            (categoriesResponse as { data?: OfferCategoryType[] }).data ||
            (categoriesResponse as unknown as OfferCategoryType[]);
          const category = categories.find(
            (cat: OfferCategoryType) =>
              String(cat.id) === String(offerData.category_id)
          );
          if (category) {
            setCategoryName(category.name);
          }
        } catch (error) {
          console.error("Failed to fetch category name:", error);
        }
      }
    } catch (err) {
      console.error("❌ OFFER DETAILS - Failed to load offer:", err);
      setError(err instanceof Error ? err.message : "Failed to load offer");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadProducts = useCallback(async () => {
    if (!id) return;

    try {
      setProductsLoading(true);
      const response = await offerService.getOfferProducts(Number(id));

      // Extract products from response.data if wrapped, otherwise use response directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const productsData = (response as any).data || response;

      if (Array.isArray(productsData) && productsData.length > 0) {
        // Backend returns product links with only product_id, so we need to fetch full product details
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productDetailsPromises = productsData.map(async (link: any) => {
          try {
            const productResponse = await productService.getProductById(
              link.product_id
            );
            const productData =
              (productResponse as { data?: unknown }).data || productResponse;
            return {
              ...productData,
              is_primary: link.is_primary,
              link_id: link.id,
            };
          } catch (error) {
            console.error(
              "Failed to fetch product details for ID:",
              link.product_id,
              error
            );
            return {
              id: link.product_id,
              name: `Product ${link.product_id}`,
              is_primary: link.is_primary,
              link_id: link.id,
            };
          }
        });

        const fullProducts = await Promise.all(productDetailsPromises);
        setLinkedProducts(fullProducts);
      } else {
        setLinkedProducts([]);
      }
    } catch (err) {
      console.error("❌ OFFER DETAILS - Failed to load products:", err);
      setLinkedProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadOffer();
      loadProducts();
    }
  }, [id, loadOffer, loadProducts]);

  const handleDelete = async () => {
    if (!offer) return;

    const confirmed = await confirm({
      title: "Delete Offer",
      message: `Are you sure you want to delete "${offer.name}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      try {
        await offerService.deleteOffer(Number(id));
        success(
          "Offer Deleted",
          `"${offer.name}" has been deleted successfully.`
        );
        navigate("/dashboard/offers");
      } catch {
        showError("Failed to delete offer");
      }
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproveLoading(true);
      await offerService.approveOffer(Number(id), { approved_by: 1 }); // TODO: Use actual user ID
      success(
        "Offer Approved",
        `"${offer?.name}" has been approved successfully.`
      );
      loadOffer();
    } catch {
      showError("Failed to approve offer");
    } finally {
      setIsApproveLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsRejectLoading(true);
      await offerService.updateOfferStatus(Number(id), {
        status: OfferStatusEnum.REJECTED,
      });
      success("Offer Rejected", `"${offer?.name}" has been rejected.`);
      loadOffer();
    } catch {
      showError("Failed to reject offer");
    } finally {
      setIsRejectLoading(false);
    }
  };

  const handleRequestApproval = async () => {
    try {
      setIsRequestApprovalLoading(true);
      await offerService.submitForApproval(Number(id), {});
      success(
        "Approval Requested",
        "Your approval request has been submitted successfully."
      );
      loadOffer();
    } catch {
      showError("Failed to request approval");
    } finally {
      setIsRequestApprovalLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      setIsActivateLoading(true);
      await offerService.updateOfferStatus(Number(id), {
        status: OfferStatusEnum.ACTIVE,
      });
      success("Offer Activated", `"${offer?.name}" is now active.`);
      loadOffer();
    } catch {
      showError("Failed to activate offer");
    } finally {
      setIsActivateLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setIsPauseLoading(true);
      await offerService.updateOfferStatus(Number(id), {
        status: OfferStatusEnum.PAUSED,
      });
      success("Offer Paused", `"${offer?.name}" has been paused.`);
      loadOffer();
    } catch {
      showError("Failed to pause offer");
    } finally {
      setIsPauseLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setIsDeactivateLoading(true);
      await offerService.updateOfferStatus(Number(id), {
        status: OfferStatusEnum.DRAFT,
      });
      success("Offer Deactivated", `"${offer?.name}" has been deactivated.`);
      loadOffer();
    } catch {
      showError("Failed to deactivate offer");
    } finally {
      setIsDeactivateLoading(false);
    }
  };

  const handleExpire = async () => {
    const confirmed = await confirm({
      title: "Expire Offer",
      message: `Are you sure you want to expire "${offer?.name}"? This action cannot be undone.`,
    });
    if (!confirmed) return;

    try {
      setIsExpireLoading(true);
      await offerService.updateOfferStatus(Number(id), {
        status: OfferStatusEnum.EXPIRED,
      });
      success("Offer Expired", `"${offer?.name}" has been expired.`);
      loadOffer();
    } catch {
      showError("Failed to expire offer");
    } finally {
      setIsExpireLoading(false);
    }
  };

  const handleArchive = async () => {
    const confirmed = await confirm({
      title: "Archive Offer",
      message: `Are you sure you want to archive "${offer?.name}"?`,
    });
    if (!confirmed) return;

    try {
      await offerService.updateOfferStatus(Number(id), {
        status: OfferStatusEnum.ARCHIVED,
      });
      success("Offer Archived", `"${offer?.name}" has been archived.`);
      loadOffer();
    } catch {
      showError("Failed to archive offer");
    }
  };

  // Generate dummy offer type based on offer characteristics
  // Using the same types as in CreateOfferPage dropdown
  const getOfferType = (offer: Offer) => {
    const offerTypes = [
      "STV",
      "Short Text (SMS/USSD)",
      "Email",
      "Voice Push",
      "WAP Push",
      "Rich Media",
    ];

    // Use offer ID to consistently assign the same type
    const typeIndex = Number(offer.id) % offerTypes.length;
    return offerTypes[typeIndex];
  };

  const getLifecycleStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "bg-green-100", text: "text-green-800", icon: Play };
      case "paused":
        return { bg: "bg-yellow-100", text: "text-yellow-800", icon: Pause };
      case "draft":
        return { bg: "bg-gray-100", text: "text-gray-800", icon: AlertCircle };
      case "archived":
        return { bg: "bg-red-100", text: "text-red-800", icon: Archive };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold ${tw.textPrimary} mb-2`}>
            Offer Not Found
          </h2>
          <p className={`${tw.textSecondary} mb-4`}>
            The offer you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate("/dashboard/offers")}
            className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200"
            style={{ backgroundColor: color.primary.action }}
          >
            Back to Offers
          </button>
        </div>
      </div>
    );
  }

  // Helper function to determine if offer is approved
  const isApproved =
    offer.status === "approved" ||
    offer.status === "active" ||
    offer.status === "paused" ||
    offer.status === "expired";
  const isPending = offer.status === "pending_approval";
  const isRejected = offer.status === "rejected";
  const isActive = offer.status === "active";
  const isPaused = offer.status === "paused";
  const isDraft = offer.status === "draft";
  const isExpired = offer.status === "expired";
  const isArchived = offer.status === "archived";

  const statusColor = getLifecycleStatusColor(offer.status);
  const StatusIcon = statusColor.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/offers")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
              Offer Details
            </h1>
            <p className={`${tw.textSecondary} mt-1`}>
              View and manage offer information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Approval Actions - Only Approve button visible */}
          {isPending && (
            <>
              <button
                onClick={handleApprove}
                disabled={isApproveLoading}
                className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: color.primary.action }}
              >
                {isApproveLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isApproveLoading ? "Approving..." : "Approve"}
              </button>
            </>
          )}

          {/* Request Approval - For rejected offers */}
          {isRejected && (
            <>
              <button
                onClick={handleRequestApproval}
                disabled={isRequestApprovalLoading}
                className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: color.primary.action }}
              >
                {isRequestApprovalLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {isRequestApprovalLoading
                  ? "Requesting..."
                  : "Request Approval"}
              </button>
            </>
          )}

          {/* Lifecycle Actions - Only show if approved AND not expired/archived */}
          {isApproved && !isExpired && !isArchived && (
            <>
              {/* Activate/Resume for paused/draft offers */}
              {(isPaused || isDraft) && (
                <button
                  onClick={handleActivate}
                  disabled={isActivateLoading}
                  className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: color.primary.action }}
                >
                  {isActivateLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isActivateLoading
                    ? "Activating..."
                    : isPaused
                    ? "Resume"
                    : "Activate"}
                </button>
              )}

              {/* Pause and Deactivate for active offers */}
              {isActive && (
                <>
                  <button
                    onClick={handlePause}
                    disabled={isPauseLoading}
                    className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: color.primary.action }}
                  >
                    {isPauseLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                    {isPauseLoading ? "Pausing..." : "Pause"}
                  </button>
                  <button
                    onClick={handleDeactivate}
                    disabled={isDeactivateLoading}
                    className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-900 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeactivateLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {isDeactivateLoading ? "Deactivating..." : "Deactivate"}
                  </button>
                </>
              )}
            </>
          )}

          {/* Edit Button */}
          <button
            onClick={() => navigate(`/dashboard/offers/${id}/edit`)}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
            style={{ backgroundColor: color.primary.action }}
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>

          {/* More Menu */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {/* Reject - Only for pending offers */}
                {isPending && (
                  <button
                    onClick={() => {
                      handleReject();
                      setShowMoreMenu(false);
                    }}
                    disabled={isRejectLoading}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    {isRejectLoading ? "Rejecting..." : "Reject"}
                  </button>
                )}

                {/* Expire - Only for active offers that are approved */}
                {isApproved && isActive && (
                  <button
                    onClick={() => {
                      handleExpire();
                      setShowMoreMenu(false);
                    }}
                    disabled={isExpireLoading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4" />
                    {isExpireLoading ? "Expiring..." : "Expire Offer"}
                  </button>
                )}

                {/* Archive - Available for any non-archived offer */}
                {!isArchived && (
                  <button
                    onClick={() => {
                      handleArchive();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    Archive Offer
                  </button>
                )}

                {/* Delete */}
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Offer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Offer Info */}
      <div
        className={`bg-white rounded-xl border border-[${color.border.default}] p-6`}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${tw.textPrimary} mb-2`}>
              {offer.name}
            </h2>
            <p className={`${tw.textSecondary} mb-4`}>
              {offer.description || "No description available"}
            </p>
            <div className="flex items-center flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}
              >
                <StatusIcon className="w-4 h-4 mr-1" />
                {offer.status}
              </span>
              {offer.is_reusable && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[${color.primary.accent}]/10 text-[${color.primary.accent}]`}
                >
                  Reusable
                </span>
              )}
              {offer.supports_multi_language && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[${color.primary.accent}]/10 text-[${color.primary.accent}]`}
                >
                  Multi-language
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offer Details */}
      <div
        className={`bg-white rounded-xl border border-[${color.border.default}] p-6`}
      >
        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>
          Offer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>
              Offer ID
            </label>
            <p className={`text-base ${tw.textPrimary} font-mono`}>
              {offer.id}
            </p>
          </div>
          <div>
            <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>
              Catalog
            </label>
            <p className={`text-base ${tw.textPrimary}`}>{categoryName}</p>
          </div>
          <div>
            <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>
              Offer Type
            </label>
            <p className={`text-base ${tw.textPrimary}`}>
              {getOfferType(offer)}
            </p>
          </div>
          <div>
            <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>
              Created Date
            </label>
            <p className={`text-base ${tw.textPrimary} flex items-center`}>
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              {offer.created_at
                ? new Date(offer.created_at).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>
              Last Updated
            </label>
            <p className={`text-base ${tw.textPrimary}`}>
              {offer.updated_at
                ? new Date(offer.updated_at).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Linked Products Section */}
      <div
        className={`bg-white rounded-xl border border-[${color.border.default}] p-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-semibold ${tw.textPrimary} flex items-center gap-2`}
          >
            <Package className="w-5 h-5" />
            Linked Products
          </h3>
          {!productsLoading && linkedProducts.length > 0 && (
            <span className={`text-sm ${tw.textMuted}`}>
              {linkedProducts.length} product
              {linkedProducts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {productsLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        ) : linkedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {linkedProducts.map((product: any, index: number) => (
              <div
                key={product.id || index}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: color.primary.accent }}
                >
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${tw.textPrimary} truncate`}>
                    {product.name ||
                      product.product_name ||
                      `Product ${product.product_id || product.id}`}
                  </p>
                  {product.description && (
                    <p className={`text-sm ${tw.textMuted} truncate`}>
                      {product.description}
                    </p>
                  )}
                  {product.is_primary && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      Primary
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className={`text-sm ${tw.textMuted}`}>
              No products linked to this offer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
