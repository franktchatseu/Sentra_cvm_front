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
  X,
  Star,
  StarOff,
  MessageSquare,
} from "lucide-react";
import { Offer, OfferStatusEnum } from "../types/offer";
import { OfferCategoryType } from "../types/offerCategory";
import { offerService } from "../services/offerService";
import { offerCategoryService } from "../services/offerCategoryService";
import { productService } from "../../products/services/productService";
import { offerCreativeService } from "../services/offerCreativeService";
import { color, tw } from "../../../shared/utils/utils";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useToast } from "../../../contexts/ToastContext";
import { useAuth } from "../../../contexts/AuthContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";

export default function OfferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success, error: showError } = useToast();
  const { user } = useAuth();

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
  const [primaryProductId, setPrimaryProductId] = useState<number | null>(null);
  const [hasPrimaryProduct, setHasPrimaryProduct] = useState<boolean>(false);
  const [unlinkingProductId, setUnlinkingProductId] = useState<number | null>(
    null
  );
  const [settingPrimaryId, setSettingPrimaryId] = useState<number | null>(null);
  const [offerCreatives, setOfferCreatives] = useState<OfferCreativeType[]>([]);
  const [creativesLoading, setCreativesLoading] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close More menu when clicking outside
  useClickOutside(moreMenuRef, () => setShowMoreMenu(false));

  const loadOffer = useCallback(
    async (skipCache: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

        const response = await offerService.getOfferById(Number(id), skipCache);

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
        console.error("Failed to load offer:", err);
        setError(err instanceof Error ? err.message : "Failed to load offer");
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  const loadProducts = useCallback(
    async (skipCache: boolean = false) => {
      if (!id) return;

      try {
        setProductsLoading(true);

        // Test multiple endpoints for product linking
        console.log("[OfferDetails] Testing offer-product endpoints...");

        // 1. Get products using new endpoint (direct test)
        console.log("[OfferDetails] 1. Testing getProductsByOffer...");
        const productsResponse = await offerService.getProductsByOffer(
          Number(id),
          { skipCache }
        );
        console.log(
          "[OfferDetails] getProductsByOffer response:",
          productsResponse
        );

        // 2. Check if offer has primary product
        console.log("[OfferDetails] 2. Testing checkOfferHasPrimaryProduct...");
        try {
          const hasPrimaryResponse =
            await offerService.checkOfferHasPrimaryProduct(
              Number(id),
              skipCache
            );
          console.log(
            "[OfferDetails] checkOfferHasPrimaryProduct response:",
            hasPrimaryResponse
          );
          setHasPrimaryProduct(hasPrimaryResponse.data?.hasPrimary || false);
        } catch (err) {
          console.error("[OfferDetails] Failed to check primary product:", err);
        }

        // 3. Get primary product if it exists
        console.log("[OfferDetails] 3. Testing getPrimaryProductByOffer...");
        try {
          const primaryResponse = await offerService.getPrimaryProductByOffer(
            Number(id),
            skipCache
          );
          console.log(
            "[OfferDetails] getPrimaryProductByOffer response:",
            primaryResponse
          );
          if (primaryResponse.data) {
            setPrimaryProductId(primaryResponse.data.product_id);
          }
        } catch (err) {
          console.log(
            "[OfferDetails] No primary product found (expected if none set)"
          );
        }

        // Use legacy method for compatibility
        const response = await offerService.getOfferProducts(
          Number(id),
          skipCache
        );

        // Extract products from response.data if wrapped, otherwise use response directly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productsData =
          (response as any).data || productsResponse.data || response;

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

              // Test getOffersByProductId for each product
              console.log(
                `[OfferDetails] Testing getOffersByProductId for product ${link.product_id}...`
              );
              try {
                const offersForProduct =
                  await offerService.getOffersByProductId(link.product_id, {
                    skipCache,
                  });
                console.log(
                  `[OfferDetails] getOffersByProductId(${link.product_id}) response:`,
                  offersForProduct
                );
              } catch (err) {
                console.error(
                  `[OfferDetails] Failed to get offers for product ${link.product_id}:`,
                  err
                );
              }

              return {
                ...productData,
                is_primary: link.is_primary,
                link_id: link.id,
                product_id: link.product_id,
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
                product_id: link.product_id,
              };
            }
          });

          const fullProducts = await Promise.all(productDetailsPromises);
          setLinkedProducts(fullProducts);

          // Find primary product from loaded products
          const primary = fullProducts.find((p: any) => p.is_primary);
          if (primary && !primaryProductId) {
            setPrimaryProductId(primary.product_id || primary.id);
          }
        } else {
          setLinkedProducts([]);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
        setLinkedProducts([]);
      } finally {
        setProductsLoading(false);
      }
    },
    [id]
  );

  const loadCreatives = useCallback(
    async (skipCache: boolean = false) => {
      if (!id) return;

      try {
        setCreativesLoading(true);
        const response = await offerCreativeService.getByOffer(Number(id), {
          limit: 100,
          skipCache,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const creativesData = (response as any).data || [];
        setOfferCreatives(creativesData);
      } catch (err) {
        console.error("Failed to load creatives:", err);
        setOfferCreatives([]);
      } finally {
        setCreativesLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (id) {
      loadOffer();
      loadProducts();
      loadCreatives();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
    if (!user?.user_id) {
      showError("Error", "User ID not available. Please log in again.");
      return;
    }
    try {
      setIsApproveLoading(true);
      await offerService.approveOffer(Number(id), {
        approved_by: user.user_id,
      });
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
    if (!user?.user_id) {
      showError("Error", "User ID not available. Please log in again.");
      return;
    }
    try {
      setIsRejectLoading(true);
      await offerService.rejectOffer(Number(id), { rejected_by: user.user_id });
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

  const handleUnlinkProduct = async (linkId: number, productName: string) => {
    const confirmed = await confirm({
      title: "Unlink Product",
      message: `Are you sure you want to unlink "${productName}" from this offer? This action cannot be undone.`,
      type: "danger",
      confirmText: "Unlink",
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    try {
      setUnlinkingProductId(linkId);
      console.log("[OfferDetails] Testing unlinkProductById...");
      const result = await offerService.unlinkProductById(linkId);
      console.log("[OfferDetails] unlinkProductById response:", result);
      success(
        "Product Unlinked",
        `"${productName}" has been unlinked from this offer.`
      );
      // Reload products with cache bypassed to get fresh data
      loadProducts(true);
    } catch (err) {
      console.error("[OfferDetails] Failed to unlink product:", err);
      showError("Failed to unlink product");
    } finally {
      setUnlinkingProductId(null);
    }
  };

  const handleSetPrimaryProduct = async (
    productId: number,
    linkId: number,
    productName: string
  ) => {
    if (!user?.user_id) {
      showError("Error", "User ID not available. Please log in again.");
      return;
    }

    // Check if there's already a primary product
    const existingPrimary = linkedProducts.find((p: any) => p.is_primary);
    let confirmed = true;

    if (existingPrimary && existingPrimary.product_id !== productId) {
      confirmed = await confirm({
        title: "Set Primary Product",
        message: `Setting "${productName}" as the primary product will replace the current primary product (${
          existingPrimary.name || `Product ${existingPrimary.product_id}`
        }). Do you want to continue?`,
        confirmText: "Set as Primary",
        cancelText: "Cancel",
      });
    }

    if (!confirmed) return;

    try {
      setSettingPrimaryId(productId);
      console.log("[OfferDetails] Testing linkProductToOffer (set primary)...");

      // Use linkProductToOffer to set as primary
      // Note: This will replace the existing primary if one exists
      const result = await offerService.linkProductToOffer({
        offer_id: Number(id),
        product_id: productId,
        is_primary: true,
        quantity: 1,
        created_by: user.user_id,
      });

      console.log(
        "[OfferDetails] linkProductToOffer (primary) response:",
        result
      );
      success(
        "Primary Product Set",
        `"${productName}" is now the primary product for this offer.`
      );
      setPrimaryProductId(productId);
      // Reload products with cache bypassed to get fresh data
      loadProducts(true);
    } catch (err) {
      console.error("[OfferDetails] Failed to set primary product:", err);
      showError("Failed to set primary product");
    } finally {
      setSettingPrimaryId(null);
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
            <h1 className={tw.mainHeading}>Offer Details</h1>
            <p className={`${tw.textSecondary} mt-1`}>
              View and manage offer information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Draft: Submit for Approval */}
          {isDraft && (
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
                ? "Submitting..."
                : "Submit for Approval"}
            </button>
          )}

          {/* Pending Approval: Approve/Reject */}
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

          {/* Approved: Activate */}
          {offer.status === OfferStatusEnum.APPROVED &&
            !isExpired &&
            !isArchived && (
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
                {isActivateLoading ? "Activating..." : "Activate"}
              </button>
            )}

          {/* Rejected: Request Approval (to resubmit) */}
          {isRejected && (
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
              {isRequestApprovalLoading ? "Requesting..." : "Request Approval"}
            </button>
          )}

          {/* Lifecycle Actions - Only show if active/paused AND not expired/archived */}
          {(isActive || isPaused) && !isExpired && !isArchived && (
            <>
              {/* Activate/Resume for paused offers */}
              {isPaused && (
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
                  {isActivateLoading ? "Resuming..." : "Resume"}
                </button>
              )}

              {/* Pause, Expire, Archive for active offers */}
              {/* Note: Deactivate (to draft) is not allowed from active status */}
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
            <h2 className={`${tw.cardHeading} mb-2`}>{offer.name}</h2>
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
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: color.primary.accent }}
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
        <h3 className={`${tw.cardHeading} mb-4`}>Offer Information</h3>
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
          <h3 className={`${tw.cardHeading} flex items-center gap-2`}>
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
            {linkedProducts.map((product: any, index: number) => {
              // Debug logging
              if (index === 0) {
                console.log("[OfferDetails] Product data for buttons:", {
                  product,
                  hasLinkId: !!product.link_id,
                  isPrimary: product.is_primary,
                  primaryProductId,
                });
              }

              const isPrimary =
                product.is_primary ||
                (product.product_id && product.product_id === primaryProductId);
              const isUnlinking =
                product.link_id && unlinkingProductId === product.link_id;
              const isSettingPrimary =
                product.product_id && settingPrimaryId === product.product_id;

              return (
                <div
                  key={product.id || index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: color.primary.accent }}
                    >
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${tw.textPrimary} truncate`}>
                          {product.name ||
                            product.product_name ||
                            `Product ${product.product_id || product.id}`}
                        </p>
                        {isPrimary && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      {product.description && (
                        <p className={`text-sm ${tw.textMuted} truncate`}>
                          {product.description}
                        </p>
                      )}
                      {isPrimary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {/* Set as Primary button - Show if not primary and has link_id or product_id */}
                    {!isPrimary &&
                      (product.link_id || product.product_id || product.id) && (
                        <button
                          onClick={() =>
                            handleSetPrimaryProduct(
                              product.product_id || product.id,
                              product.link_id || 0, // Use 0 as fallback if link_id doesn't exist
                              product.name ||
                                `Product ${product.product_id || product.id}`
                            )
                          }
                          disabled={isSettingPrimary || isUnlinking}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg border border-gray-300 hover:border-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Set as primary product"
                        >
                          {isSettingPrimary ? (
                            <>
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-yellow-600"></div>
                              <span>Setting...</span>
                            </>
                          ) : (
                            <>
                              <StarOff className="w-4 h-4" />
                              <span>Set Primary</span>
                            </>
                          )}
                        </button>
                      )}
                    {/* Unlink button - Always show if we have products */}
                    {(product.link_id || product.product_id || product.id) && (
                      <button
                        onClick={() => {
                          if (!product.link_id) {
                            console.warn(
                              "[OfferDetails] No link_id found for product, cannot unlink:",
                              product
                            );
                            showError(
                              "Cannot unlink: Link ID not available. Product may need to be re-linked."
                            );
                            return;
                          }
                          handleUnlinkProduct(
                            product.link_id,
                            product.name ||
                              `Product ${product.product_id || product.id}`
                          );
                        }}
                        disabled={
                          isUnlinking || isSettingPrimary || !product.link_id
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-300 hover:border-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          product.link_id
                            ? "Unlink product"
                            : "Link ID not available"
                        }
                      >
                        {isUnlinking ? (
                          <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-red-600"></div>
                            <span>Unlinking...</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            <span>Unlink</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* Offer Creatives Section */}
      <div
        className={`bg-white rounded-xl border border-[${color.border.default}] p-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${tw.cardHeading}`}>Offer Creatives</h3>
          <button
            onClick={() => navigate(`/dashboard/offers/${id}/edit`)}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2"
            style={{ backgroundColor: color.primary.action }}
          >
            <Edit className="w-4 h-4" />
            Edit Creatives
          </button>
        </div>

        {creativesLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        ) : offerCreatives.length > 0 ? (
          <div className="space-y-4">
            {offerCreatives.map(
              (creative: OfferCreativeType, index: number) => (
                <div
                  key={creative.id || index}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: color.primary.accent }}
                      >
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-medium ${tw.textPrimary}`}>
                            {creative.title || `Creative ${creative.channel}`}
                          </p>
                          <span
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: color.primary.accent }}
                          >
                            {creative.channel}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {creative.locale}
                          </span>
                          {creative.is_active && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                          {creative.version && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              v{creative.version}
                            </span>
                          )}
                        </div>
                        {creative.text_body && (
                          <p
                            className={`text-sm ${tw.textMuted} mt-2 line-clamp-2`}
                          >
                            {creative.text_body}
                          </p>
                        )}
                        {creative.variables &&
                          Object.keys(creative.variables).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {Object.keys(creative.variables)
                                .slice(0, 3)
                                .map((key) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                                  >
                                    {key}
                                  </span>
                                ))}
                              {Object.keys(creative.variables).length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                  +{Object.keys(creative.variables).length - 3}{" "}
                                  more
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className={`text-sm ${tw.textMuted}`}>
              No creatives created for this offer
            </p>
            <button
              onClick={() => navigate(`/dashboard/offers/${id}/edit`)}
              className="mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: color.primary.action }}
            >
              Create Creative
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
