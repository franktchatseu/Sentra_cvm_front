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
  Star,
  StarOff,
  MessageSquare,
  Save,
  Plus,
} from "lucide-react";
import { Offer, OfferStatusEnum } from "../types/offer";
import { OfferCategoryType } from "../types/offerCategory";
import { offerService } from "../services/offerService";
import { offerCategoryService } from "../services/offerCategoryService";
import { productService } from "../../products/services/productService";
import { offerCreativeService } from "../services/offerCreativeService";
import { OfferCreative } from "../types/offerCreative";
import { color, tw } from "../../../shared/utils/utils";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useToast } from "../../../contexts/ToastContext";
import { useAuth } from "../../../contexts/AuthContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import RegularModal from "../../../shared/components/ui/RegularModal";
import { Product } from "../../products/types/product";
import { Search, Check } from "lucide-react";
import { productCategoryService } from "../../products/services/productCategoryService";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";

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
  const [isExpireLoading, setIsExpireLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [linkedProducts, setLinkedProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoryName, setCategoryName] = useState<string>("Uncategorized");
  const [primaryProductId, setPrimaryProductId] = useState<number | null>(null);
  const [unlinkingProductId, setUnlinkingProductId] = useState<number | null>(
    null
  );
  const [offerCreatives, setOfferCreatives] = useState<OfferCreative[]>([]);
  const [creativesLoading, setCreativesLoading] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Creative edit modal state
  const [isEditCreativeModalOpen, setIsEditCreativeModalOpen] = useState(false);
  const [editingCreative, setEditingCreative] = useState<OfferCreative | null>(
    null
  );
  const [editFormData, setEditFormData] = useState({
    title: "",
    text_body: "",
    html_body: "",
    variables: {} as Record<string, string | number | boolean>,
  });
  const [variablesJson, setVariablesJson] = useState("");
  const [isSavingCreative, setIsSavingCreative] = useState(false);

  // Add product modal state
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProductsToAdd, setSelectedProductsToAdd] = useState<Product[]>(
    []
  );
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [productsSearchLoading, setProductsSearchLoading] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] =
    useState<string>("all");
  const [productCategories, setProductCategories] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [isLinkingProducts, setIsLinkingProducts] = useState(false);

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
          } catch {
            // Failed to fetch category name
          }
        }
      } catch (err) {
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

        // Get products using new endpoint
        const productsResponse = await offerService.getProductsByOffer(
          Number(id),
          { skipCache }
        );

        // Check if offer has primary product
        try {
          await offerService.checkOfferHasPrimaryProduct(Number(id), skipCache);
        } catch {
          // Failed to check primary product
        }

        // Get primary product if it exists
        try {
          const primaryResponse = await offerService.getPrimaryProductByOffer(
            Number(id),
            skipCache
          );
          if (primaryResponse.data) {
            setPrimaryProductId(primaryResponse.data.product_id);
          }
        } catch {
          // No primary product found (expected if none set)
        }

        // Use legacy method for compatibility
        const response = await offerService.getOfferProducts(
          Number(id),
          skipCache
        );

        // Extract products from response.data if wrapped, otherwise use response directly
        const productsData =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (response as any).data || productsResponse.data || response;

        if (Array.isArray(productsData) && productsData.length > 0) {
          // Deduplicate links by product_id - if multiple links exist for same product,
          // keep the primary one, or the first one if none is primary
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const uniqueLinksMap = new Map<number, any>();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          productsData.forEach((link: any) => {
            const productId = link.product_id;
            if (!uniqueLinksMap.has(productId)) {
              uniqueLinksMap.set(productId, link);
            } else {
              // If we already have this product, prefer the primary one
              const existingLink = uniqueLinksMap.get(productId);
              if (link.is_primary && !existingLink.is_primary) {
                uniqueLinksMap.set(productId, link);
              }
            }
          });
          const uniqueLinks = Array.from(uniqueLinksMap.values());

          // Backend returns product links with only product_id, so we need to fetch full product details
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const productDetailsPromises = uniqueLinks.map(async (link: any) => {
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
                product_id: link.product_id,
              };
            } catch {
              // Failed to fetch product details
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const primary = fullProducts.find((p: any) => p.is_primary);
          if (primary && !primaryProductId) {
            setPrimaryProductId(primary.product_id || primary.id);
          }
        } else {
          setLinkedProducts([]);
        }
      } catch {
        setLinkedProducts([]);
      } finally {
        setProductsLoading(false);
      }
    },
    [id, primaryProductId]
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
      } catch {
        setOfferCreatives([]);
      } finally {
        setCreativesLoading(false);
      }
    },
    [id]
  );

  // Handle edit creative
  const handleEditCreative = (creative: OfferCreative) => {
    setEditingCreative(creative);
    setEditFormData({
      title: creative.title || "",
      text_body: creative.text_body || "",
      html_body: creative.html_body || "",
      variables: creative.variables || {},
    });
    setVariablesJson(JSON.stringify(creative.variables || {}, null, 2));
    setIsEditCreativeModalOpen(true);
  };

  // Handle save creative
  const handleSaveCreative = async () => {
    if (!editingCreative || !user?.user_id) return;

    try {
      setIsSavingCreative(true);

      // Parse variables JSON
      let parsedVariables = {};
      if (variablesJson.trim()) {
        try {
          parsedVariables = JSON.parse(variablesJson);
        } catch {
          showError("Invalid JSON in variables field");
          return;
        }
      }

      // Build update payload - only include non-empty fields
      const updatePayload: Record<string, unknown> = {
        updated_by: user.user_id,
      };

      // Only add fields if they have content (not empty strings)
      if (editFormData.title && editFormData.title.trim()) {
        updatePayload.title = editFormData.title;
      }
      if (editFormData.text_body && editFormData.text_body.trim()) {
        updatePayload.text_body = editFormData.text_body;
      }
      if (editFormData.html_body && editFormData.html_body.trim()) {
        updatePayload.html_body = editFormData.html_body;
      }
      if (Object.keys(parsedVariables).length > 0) {
        updatePayload.variables = parsedVariables;
      }

      await offerCreativeService.update(
        editingCreative.id as number,
        updatePayload
      );

      success("Creative Updated", "Creative has been updated successfully");
      setIsEditCreativeModalOpen(false);
      loadCreatives(true); // Reload with skipCache
    } catch (err) {
      // Failed to update creative
      showError(
        err instanceof Error ? err.message : "Failed to update creative"
      );
    } finally {
      setIsSavingCreative(false);
    }
  };

  // Handle delete creative
  const handleDeleteCreative = async (creative: OfferCreative) => {
    const confirmed = await confirm({
      title: "Delete Creative",
      message: `Are you sure you want to delete this ${creative.channel} creative? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
    });

    if (!confirmed) return;

    try {
      await offerCreativeService.delete(creative.id as number);
      success("Creative Deleted", "Creative has been deleted successfully");
      loadCreatives(true); // Reload with skipCache
    } catch (err) {
      // Failed to delete creative
      showError(
        err instanceof Error ? err.message : "Failed to delete creative"
      );
    }
  };

  // Load product categories for filter
  const loadProductCategories = useCallback(async () => {
    try {
      const response = await productCategoryService.getAllCategories({
        limit: 100,
        skipCache: true,
      });
      const categoryOptions = [
        { value: "all", label: "All Categories" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(response.data || []).map((category: any) => ({
          value: category.id.toString(),
          label: category.name,
        })),
      ];
      setProductCategories(categoryOptions);
    } catch {
      // Error loading categories
      setProductCategories([{ value: "all", label: "All Categories" }]);
    }
  }, []);

  // Load available products for selection
  const loadAvailableProducts = useCallback(async () => {
    try {
      setProductsSearchLoading(true);
      const searchQuery = productSearchTerm.trim();

      let response;
      if (searchQuery) {
        // Use searchProducts when there's a search term
        response = await productService.searchProducts({
          q: searchQuery,
          limit: 100,
          skipCache: true,
        });
      } else {
        // Use getAllProducts when there's no search term
        response = await productService.getAllProducts({
          limit: 100,
          skipCache: true,
        });
      }

      let products = response.data || [];

      // Apply category filter if not 'all'
      if (selectedProductCategory !== "all") {
        products = products.filter(
          (product: Product) =>
            product.category_id?.toString() === selectedProductCategory
        );
      }

      setAvailableProducts(products);
    } catch {
      // Failed to load products
      setAvailableProducts([]);
    } finally {
      setProductsSearchLoading(false);
    }
  }, [productSearchTerm, selectedProductCategory]);

  // Load categories when modal opens
  useEffect(() => {
    if (isAddProductModalOpen) {
      loadProductCategories();
    }
  }, [isAddProductModalOpen, loadProductCategories]);

  // Load products when modal opens, search changes, or category changes
  useEffect(() => {
    if (isAddProductModalOpen) {
      loadAvailableProducts();
    }
  }, [isAddProductModalOpen, loadAvailableProducts]);

  // Toggle product selection
  const toggleProductSelection = (product: Product) => {
    const isSelected = selectedProductsToAdd.some((p) => p.id === product.id);
    if (isSelected) {
      setSelectedProductsToAdd(
        selectedProductsToAdd.filter((p) => p.id !== product.id)
      );
    } else {
      setSelectedProductsToAdd([...selectedProductsToAdd, product]);
    }
  };

  // Handle adding products after selection
  const handleConfirmAddProducts = async () => {
    if (!id || !user?.user_id || selectedProductsToAdd.length === 0) return;

    try {
      setIsLinkingProducts(true);

      // Check if offer currently has a primary product
      const currentPrimaryExists = linkedProducts.some((p) => p.is_primary);

      // Prepare links for batch linking
      const links = selectedProductsToAdd.map((product, index) => ({
        offer_id: Number(id),
        product_id:
          typeof product.id === "string" ? parseInt(product.id) : product.id!,
        is_primary: !currentPrimaryExists && index === 0, // First product is primary if no primary exists
        quantity: 1,
      }));

      const batchRequest = {
        links: links,
        created_by: user.user_id,
      };

      await offerService.linkProductsBatch(batchRequest);

      success(
        "Products Linked",
        `${selectedProductsToAdd.length} product${
          selectedProductsToAdd.length > 1 ? "s" : ""
        } linked successfully`
      );

      // Reset state and close modal
      setIsAddProductModalOpen(false);
      setSelectedProductsToAdd([]);
      setProductSearchTerm("");

      // Refresh products list
      loadProducts(true);
    } catch (err) {
      // Failed to link products
      showError(err instanceof Error ? err.message : "Failed to link products");
    } finally {
      setIsLinkingProducts(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadOffer(true); // Skip cache for fresh data
      loadProducts(true); // Skip cache for fresh data
      loadCreatives(true); // Skip cache for fresh data
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
      loadOffer(true); // Skip cache to get fresh data after approval
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
      loadOffer(true); // Skip cache to get fresh data after rejection
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
      loadOffer(true); // Skip cache to get fresh data after approval request
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
      loadOffer(true); // Skip cache to get fresh data after activation
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
      loadOffer(true); // Skip cache to get fresh data after pausing
    } catch {
      showError("Failed to pause offer");
    } finally {
      setIsPauseLoading(false);
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
      loadOffer(true); // Skip cache to get fresh data after expiration
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
      loadOffer(true); // Skip cache to get fresh data after archiving
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
      await offerService.unlinkProductById(linkId);
      success(
        "Product Unlinked",
        `"${productName}" has been unlinked from this offer.`
      );
      // Reload products with cache bypassed to get fresh data
      loadProducts(true);
    } catch {
      // Failed to unlink product
      showError("Failed to unlink product");
    } finally {
      setUnlinkingProductId(null);
    }
  };

  // TODO: Backend needs to provide an endpoint to update is_primary without unlinking products
  // Currently commented out because it unlinks the old primary product entirely,
  // when we only want to unset it as primary while keeping it linked to the offer
  const handleSetPrimaryProduct = async () => {
    // Handler commented out - waiting for backend endpoint to update is_primary flag
    // without unlinking products
    showError(
      "Feature Unavailable",
      "Setting primary product is temporarily disabled. Backend endpoint needed to update primary status without unlinking products."
    );
    return;

    /* COMMENTED OUT - Waiting for backend endpoint
    if (!user?.user_id) {
      showError("Error", "User ID not available. Please log in again.");
      return;
    }

    // Check if there's already a primary product
    let existingPrimaryLink: OfferProductLink | null = null;
    try {
      const primaryResponse = await offerService.getPrimaryProductByOffer(
        Number(id),
        true
      );
      if (primaryResponse.success && primaryResponse.data) {
        existingPrimaryLink = primaryResponse.data;
      }
    } catch (err) {
      // No primary product exists (expected if none set)
    }

    let confirmed = true;
    if (existingPrimaryLink && existingPrimaryLink.product_id !== productId) {
      // Get the name of the current primary product
      const currentPrimaryProduct = linkedProducts.find(
        (p: any) => p.product_id === existingPrimaryLink.product_id
      );
      const currentPrimaryName =
        currentPrimaryProduct?.name ||
        `Product ${existingPrimaryLink.product_id}`;

      confirmed = await confirm({
        title: "Set Primary Product",
        message: `Setting "${productName}" as the primary product will replace the current primary product (${currentPrimaryName}). Do you want to continue?`,
        confirmText: "Set as Primary",
        cancelText: "Cancel",
        type: "info",
      });
    }

    if (!confirmed) return;

    try {
      setSettingPrimaryId(productId);

      // Step 1: Unlink the old primary product if it exists
      if (existingPrimaryLink && existingPrimaryLink.id) {
        await offerService.unlinkProductById(existingPrimaryLink.id);
      }

      // Step 2: Link the new product as primary
      await offerService.linkProductToOffer({
        offer_id: Number(id),
        product_id: productId,
        is_primary: true,
        quantity: 1,
        created_by: user.user_id,
      });

      success(
        "Primary Product Set",
        `"${productName}" is now the primary product for this offer.`
      );
      setPrimaryProductId(productId);
      // Reload products with cache bypassed to get fresh data
      loadProducts(true);
    } catch (err) {
      // Failed to set primary product
      showError("Failed to set primary product");
    } finally {
      setSettingPrimaryId(null);
    }
    */
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
          <div className="flex items-center gap-3">
            {!productsLoading && linkedProducts.length > 0 && (
              <span className={`text-sm ${tw.textMuted}`}>
                {linkedProducts.length} product
                {linkedProducts.length !== 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={() => setIsAddProductModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2"
              style={{ backgroundColor: color.primary.action }}
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {productsLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        ) : linkedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {linkedProducts.map((product: any, index: number) => {
              const isPrimary =
                product.is_primary ||
                (product.product_id && product.product_id === primaryProductId);
              const isUnlinking =
                product.link_id && unlinkingProductId === product.link_id;
              const isSettingPrimary = false; // Feature disabled

              return (
                <div
                  key={
                    product.link_id || `product-${product.product_id}-${index}`
                  }
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
                        <div className="relative group">
                          <button
                            onClick={handleSetPrimaryProduct}
                            disabled={isSettingPrimary || isUnlinking}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 rounded-lg border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSettingPrimary ? (
                              <>
                                <div
                                  className="animate-spin rounded-full h-3.5 w-3.5 border-b-2"
                                  style={{ borderColor: color.primary.accent }}
                                ></div>
                                <span>Setting...</span>
                              </>
                            ) : (
                              <>
                                <StarOff className="w-4 h-4" />
                                <span>Set Primary</span>
                              </>
                            )}
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-normal w-96 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg z-50">
                            Mark this product as the main product for this
                            offer. Only one product can be primary per offer.
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    {/* Unlink button - Always show if we have products */}
                    {(product.link_id || product.product_id || product.id) && (
                      <button
                        onClick={() => {
                          if (!product.link_id) {
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
                          <span>Unlink</span>
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
            <p className={`text-sm ${tw.textMuted} mb-1`}>
              No products linked to this offer
            </p>
            <p className={`text-xs ${tw.textMuted}`}>
              Click "Add Product" above to link products to this offer
            </p>
          </div>
        )}
      </div>

      {/* Offer Creatives Section */}
      <div
        className={`bg-white rounded-xl border border-[${color.border.default}] p-6`}
      >
        <div className="mb-4">
          <h3 className={`${tw.cardHeading}`}>Offer Creatives</h3>
        </div>

        {creativesLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        ) : offerCreatives.length > 0 ? (
          <div className="space-y-4">
            {offerCreatives.map((creative: OfferCreative, index: number) => (
              <div
                key={`creative-${creative.id || creative.channel}-${
                  creative.locale
                }-${index}`}
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

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditCreative(creative)}
                    className="p-2 rounded-lg transition-colors hover:opacity-80"
                    style={{
                      color: color.primary.accent,
                      backgroundColor: `${color.primary.accent}10`,
                    }}
                    title="Edit creative"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCreative(creative)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete creative"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className={`text-sm ${tw.textMuted}`}>
              No creatives created for this offer. Edit the offer to add
              creatives.
            </p>
          </div>
        )}
      </div>

      {/* Edit Creative Modal */}
      <RegularModal
        isOpen={isEditCreativeModalOpen}
        onClose={() => setIsEditCreativeModalOpen(false)}
        title={`Edit ${editingCreative?.channel} Creative`}
        size="xl"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData({ ...editFormData, title: e.target.value })
              }
              placeholder="Enter creative title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Text Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Body
            </label>
            <textarea
              value={editFormData.text_body}
              onChange={(e) =>
                setEditFormData({ ...editFormData, text_body: e.target.value })
              }
              placeholder="Enter text content..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* HTML Body (for Email/Web) */}
          {(editingCreative?.channel === "Email" ||
            editingCreative?.channel === "Web") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Body
              </label>
              <textarea
                value={editFormData.html_body}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    html_body: e.target.value,
                  })
                }
                placeholder="Enter HTML content..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          )}

          {/* Variables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variables (JSON)
            </label>
            <textarea
              value={variablesJson}
              onChange={(e) => setVariablesJson(e.target.value)}
              placeholder='{"variable_name": "value"}'
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <div className="text-xs text-gray-500 mt-1">
              {(() => {
                if (!variablesJson.trim()) return "Empty variables";
                try {
                  JSON.parse(variablesJson);
                  return <span className="text-green-600">✓ Valid JSON</span>;
                } catch {
                  return <span className="text-red-600">⚠ Invalid JSON</span>;
                }
              })()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setIsEditCreativeModalOpen(false)}
              disabled={isSavingCreative}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCreative}
              disabled={isSavingCreative}
              className="px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: color.primary.action }}
            >
              {isSavingCreative ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </RegularModal>

      {/* Add Product Modal - Custom Selector */}
      <RegularModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setSelectedProductsToAdd([]);
          setProductSearchTerm("");
          setSelectedProductCategory("all");
        }}
        title="Add Products to Offer"
        size="full"
      >
        <div className="space-y-4">
          {/* Search and Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <HeadlessSelect
                value={selectedProductCategory}
                onChange={(value) => setSelectedProductCategory(String(value))}
                options={productCategories}
                placeholder="Filter by category"
              />
            </div>
          </div>

          {/* Selected Products Count */}
          {selectedProductsToAdd.length > 0 && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: color.primary.accent }}
            >
              <p className="text-sm text-black font-medium">
                {selectedProductsToAdd.length} product
                {selectedProductsToAdd.length !== 1 ? "s" : ""} selected
              </p>
            </div>
          )}

          {/* Products List */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {productsSearchLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : availableProducts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {availableProducts.map((product) => {
                  const isSelected = selectedProductsToAdd.some(
                    (p) => p.id === product.id
                  );
                  const isAlreadyLinked = linkedProducts.some(
                    (p) => p.id === product.id
                  );

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        if (!isAlreadyLinked) {
                          toggleProductSelection(product);
                        }
                      }}
                      className={`p-4 transition-colors ${
                        isAlreadyLinked
                          ? "bg-gray-50 opacity-60 cursor-not-allowed"
                          : "hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isAlreadyLinked ? "bg-gray-200" : "bg-gray-100"
                            }`}
                          >
                            <Package
                              className="w-5 h-5"
                              style={{
                                color: isAlreadyLinked
                                  ? "#9CA3AF"
                                  : color.primary.accent,
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h5
                              className={`font-medium ${
                                isAlreadyLinked
                                  ? "text-gray-500"
                                  : "text-gray-900"
                              }`}
                            >
                              {product.name}
                            </h5>
                            <p
                              className={`text-sm ${
                                isAlreadyLinked
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {product.description}
                            </p>
                            {isAlreadyLinked && (
                              <span className="text-xs text-gray-500 italic mt-1 block">
                                Already linked to this offer
                              </span>
                            )}
                          </div>
                        </div>
                        {!isAlreadyLinked && (
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected ? "" : "border-gray-300 bg-white"
                            }`}
                            style={
                              isSelected
                                ? {
                                    borderColor: color.primary.accent,
                                    backgroundColor: color.primary.accent,
                                  }
                                : {}
                            }
                          >
                            {isSelected && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        )}
                        {isAlreadyLinked && (
                          <div className="w-6 h-6 rounded border-2 border-gray-300 bg-gray-200 flex items-center justify-center">
                            <Check className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">
                  {productSearchTerm
                    ? "No products found matching your search"
                    : "No products available"}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setIsAddProductModalOpen(false);
                setSelectedProductsToAdd([]);
                setProductSearchTerm("");
              }}
              disabled={isLinkingProducts}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAddProducts}
              disabled={isLinkingProducts || selectedProductsToAdd.length === 0}
              className="px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: color.primary.action }}
            >
              {isLinkingProducts ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Linking...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Link{" "}
                  {selectedProductsToAdd.length > 0
                    ? `${selectedProductsToAdd.length} `
                    : ""}
                  Product{selectedProductsToAdd.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </RegularModal>
    </div>
  );
}
