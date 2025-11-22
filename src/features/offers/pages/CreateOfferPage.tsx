import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Target,
  DollarSign,
  ArrowLeft,
  Check,
  Gift,
  Palette,
  BarChart,
  Eye,
} from "lucide-react";
import { CreateOfferRequest, Offer, OfferTypeEnum } from "../types/offer";
import { Product } from "../../products/types/product";
import { offerService } from "../services/offerService";
import { offerCategoryService } from "../services/offerCategoryService";
import { productService } from "../../products/services/productService";
import { offerCreativeService } from "../services/offerCreativeService";
// import { productCategoryService } from "../../products/services/productCategoryService";
import { OfferCategoryType } from "../types/offerCategory";
import ProductSelector from "../../products/components/ProductSelector";
import OfferCreativeStep from "../components/OfferCreativeStep";
import OfferTrackingStep from "../components/OfferTrackingStep";
import OfferRewardStep from "../components/OfferRewardStep";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import MultiCategorySelector from "../../../shared/components/MultiCategorySelector";
import { color, tw } from "../../../shared/utils/utils";
import { useToast } from "../../../contexts/ToastContext";
import { useAuth } from "../../../contexts/AuthContext";

// Import the types from offerCreative instead of defining locally
import { OfferCreative } from "../types/offerCreative";

// Local creative for form (uses string ID until saved)
type LocalOfferCreative = Omit<OfferCreative, "id" | "offer_id"> & {
  id: string;
  offer_id?: number;
};

interface ApiErrorDetail {
  field?: string;
  message?: string;
}

interface ApiErrorResponseData {
  message?: string;
  error?: string;
  details?: ApiErrorDetail[] | Record<string, string>;
}

const hasResponseData = (
  error: unknown
): error is { response?: { data?: ApiErrorResponseData } } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  );
};

const hasErrorString = (error: unknown): error is { error: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as { error?: unknown }).error === "string"
  );
};

const hasMessageString = (error: unknown): error is { message: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  );
};

const isRecordOfString = (value: unknown): value is Record<string, string> => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return Object.values(value).every((v) => typeof v === "string");
};

type LinkedProduct = Product & { link_id?: number; is_primary?: boolean };

interface TrackingRule {
  id: string;
  name: string;
  priority: number;
  parameter: string;
  condition: "equals" | "greater_than" | "less_than" | "contains" | "is_any_of";
  value: string;
  enabled: boolean;
}

interface TrackingSource {
  id: string;
  name: string;
  type: "recharge" | "usage_metric" | "custom";
  enabled: boolean;
  rules: TrackingRule[];
}

interface RewardRule {
  id: string;
  name: string;
  bundle_subscription_track: string;
  priority: number;
  condition: string;
  value: string;
  reward_type: "bundle" | "points" | "discount" | "cashback";
  reward_value: string;
  fulfillment_response: string;
  success_text: string;
  default_failure: string;
  error_group: string;
  failure_text: string;
  enabled: boolean;
}

interface OfferReward {
  id: string;
  name: string;
  type: "default" | "sms_night" | "custom";
  rules: RewardRule[];
}

interface StepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  formData: CreateOfferRequest;
  setFormData: Dispatch<SetStateAction<CreateOfferRequest>>;
  creatives: LocalOfferCreative[];
  setCreatives: (creatives: LocalOfferCreative[]) => void;
  trackingSources: TrackingSource[];
  setTrackingSources: (sources: TrackingSource[]) => void;
  rewards: OfferReward[];
  setRewards: (rewards: OfferReward[]) => void;
  isLoading?: boolean;
  validationErrors?: Record<string, string>;
  clearValidationErrors?: () => void;
  offerCategories?: OfferCategoryType[];
  categoriesLoading?: boolean;
  onSaveDraft?: () => void;
  onCancel?: () => void;
}

// Step definitions for offer creation
const steps = [
  {
    id: 1,
    name: "Basic Info",
    description: "Offer details & type",
    icon: Target,
  },
  {
    id: 2,
    name: "Products",
    description: "Product selection",
    icon: Gift,
  },
  {
    id: 3,
    name: "Creative",
    description: "Content & messaging",
    icon: Palette,
  },
  {
    id: 4,
    name: "Tracking",
    description: "Performance monitoring",
    icon: BarChart,
  },
  {
    id: 5,
    name: "Rewards",
    description: "Reward configuration",
    icon: DollarSign,
  },
  {
    id: 6,
    name: "Review",
    description: "Review & create",
    icon: Eye,
  },
];

function BasicInfoStep({
  formData,
  setFormData,
  validationErrors,
  clearValidationErrors,
  offerCategories,
  categoriesLoading,
}: Omit<
  StepProps,
  | "currentStep"
  | "totalSteps"
  | "onNext"
  | "onPrev"
  | "onSubmit"
  | "creatives"
  | "setCreatives"
  | "trackingSources"
  | "setTrackingSources"
  | "rewards"
  | "setRewards"
  | "isLoading"
  | "onSaveDraft"
  | "onCancel"
>) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  // Initialize selectedCategoryIds from formData.category_id
  useEffect(() => {
    if (
      formData.category_id &&
      !selectedCategoryIds.includes(formData.category_id)
    ) {
      setSelectedCategoryIds([formData.category_id]);
    } else if (!formData.category_id && selectedCategoryIds.length > 0) {
      setSelectedCategoryIds([]);
    }
  }, [formData.category_id]);

  // Update formData.category_id when selectedCategoryIds changes (use first one)
  useEffect(() => {
    const firstCategoryId =
      selectedCategoryIds.length > 0 ? selectedCategoryIds[0] : undefined;
    if (formData.category_id !== firstCategoryId) {
      setFormData((prev) => ({
        ...prev,
        category_id: firstCategoryId, // Send only first to backend
      }));
    }
  }, [selectedCategoryIds]);
  return (
    <div className="space-y-6">
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Basic Information
        </h2>
        <p className="text-sm text-gray-600">
          Let's start with the essential details of your offer
        </p>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Offer Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (validationErrors?.name && clearValidationErrors) {
                clearValidationErrors();
              }
            }}
            placeholder="e.g., Summer Data Bundle"
            className={`w-full px-3 py-1.5 border rounded-md focus:outline-none transition-all duration-200 text-sm placeholder:text-sm ${
              validationErrors?.name ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {validationErrors?.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Offer Code *
          </label>
          <input
            type="text"
            value={formData.code || ""}
            onChange={(e) => {
              setFormData({ ...formData, code: e.target.value });
              if (validationErrors?.code && clearValidationErrors) {
                clearValidationErrors();
              }
            }}
            placeholder="e.g., SUMMER_DATA_2024"
            className={`w-full px-3 py-1.5 border rounded-md focus:outline-none transition-all duration-200 text-sm placeholder:text-sm ${
              validationErrors?.code ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {validationErrors?.code && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.code}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            A unique, descriptive code to identify this offer in your business
            operations
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe what this offer provides to customers..."
            rows={3}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none transition-all duration-200 text-sm placeholder:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Offer Type *
          </label>
          <HeadlessSelect
            options={[
              { value: "data", label: "Data" },
              { value: "voice", label: "Voice" },
              { value: "sms", label: "SMS" },
              { value: "combo", label: "Combo" },
              { value: "voucher", label: "Voucher" },
              { value: "loyalty", label: "Loyalty" },
              { value: "discount", label: "Discount" },
              { value: "bundle", label: "Bundle" },
              { value: "bonus", label: "Bonus" },
              { value: "other", label: "Other" },
            ]}
            value={formData.offer_type}
            onChange={(value) => {
              if (!value) return;
              setFormData({
                ...formData,
                offer_type: value as OfferTypeEnum,
              });
              if (validationErrors?.offer_type && clearValidationErrors) {
                clearValidationErrors();
              }
            }}
            placeholder="Select offer type"
          />
          {validationErrors?.offer_type && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.offer_type}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Catalog *
          </label>
          <MultiCategorySelector
            value={selectedCategoryIds}
            onChange={setSelectedCategoryIds}
            placeholder="Select catalog(s)"
            entityType="offer"
            disabled={categoriesLoading}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can select multiple catalogs. Only the first one will be saved
            to the backend.
          </p>
          {validationErrors?.category_id && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.category_id}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Max Usage Per Customer *
          </label>
          <input
            type="number"
            min="0"
            value={formData.max_usage_per_customer || ""}
            onChange={(e) => {
              setFormData({
                ...formData,
                max_usage_per_customer: e.target.value
                  ? Number(e.target.value)
                  : 0,
              });
              if (
                validationErrors?.max_usage_per_customer &&
                clearValidationErrors
              ) {
                clearValidationErrors();
              }
            }}
            placeholder="e.g., 1, 5, 10"
            className={`w-full px-3 py-1.5 border rounded-md focus:outline-none transition-all duration-200 text-sm placeholder:text-sm ${
              validationErrors?.max_usage_per_customer
                ? "border-red-500"
                : "border-gray-300"
            }`}
            required
          />
          {validationErrors?.max_usage_per_customer && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.max_usage_per_customer}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Maximum times a customer can use this offer (minimum: 0)
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 2: Offer Products
function ProductStepWrapper({
  // formData,
  setFormData,
  selectedProducts,
  onProductsChange,
}: Omit<
  StepProps,
  | "currentStep"
  | "totalSteps"
  | "onNext"
  | "onPrev"
  | "onSubmit"
  | "creatives"
  | "setCreatives"
  | "trackingSources"
  | "setTrackingSources"
  | "rewards"
  | "setRewards"
  | "isLoading"
  | "validationErrors"
  | "clearValidationErrors"
  | "offerCategories"
  | "categoriesLoading"
  | "onSaveDraft"
  | "onCancel"
> & {
  selectedProducts: LinkedProduct[];
  onProductsChange: (products: LinkedProduct[]) => void;
}) {
  // Track previous products to prevent unnecessary updates
  const prevProductsRef = useRef<LinkedProduct[]>(selectedProducts);

  const handleProductsChange = useCallback(
    (products: LinkedProduct[]) => {
      // Check if products actually changed (by reference and length)
      const productsChanged =
        prevProductsRef.current.length !== products.length ||
        prevProductsRef.current.some((p, i) => p.id !== products[i]?.id);

      if (!productsChanged) {
        // Products haven't changed, don't update anything
        return;
      }

      prevProductsRef.current = products;

      // Update selected products
      onProductsChange(products);

      // Update primary product ID only if it changed
      const firstProductId = products[0]?.id;
      const newPrimaryId = firstProductId ? Number(firstProductId) : undefined;

      setFormData((prev) => {
        // Only update if primary_product_id actually changed
        if (prev.primary_product_id === newPrimaryId) {
          return prev; // Return same object reference to prevent unnecessary re-render
        }
        return {
          ...prev,
          primary_product_id: newPrimaryId,
        };
      });
    },
    [onProductsChange, setFormData]
  );

  // Update ref when selectedProducts prop changes
  useEffect(() => {
    prevProductsRef.current = selectedProducts;
  }, [selectedProducts]);

  return (
    <div className="space-y-6">
      <div className="mt-8 mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Offer Products
          </h2>
          <p className="text-sm text-gray-600">
            Select the products that will be included in this offer
          </p>
        </div>
      </div>
      <div className="space-y-6">
        <ProductSelector
          selectedProducts={selectedProducts}
          onProductsChange={(products) =>
            handleProductsChange(products as LinkedProduct[])
          }
          multiSelect={true}
          showAddButtonInline={true}
        />
      </div>
    </div>
  );
}

// Step 3: Offer Creative
function OfferCreativeStepWrapper({
  creatives,
  setCreatives,
  validationErrors,
}: Omit<
  StepProps,
  | "currentStep"
  | "totalSteps"
  | "onNext"
  | "onPrev"
  | "onSubmit"
  | "formData"
  | "setFormData"
  | "trackingSources"
  | "setTrackingSources"
  | "rewards"
  | "setRewards"
  | "isLoading"
  | "clearValidationErrors"
  | "offerCategories"
  | "categoriesLoading"
  | "onSaveDraft"
  | "onCancel"
>) {
  return (
    <div className="space-y-6">
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Offer Creative
        </h2>
        <p className="text-sm text-gray-600">
          Design the creative content for your offer
        </p>
      </div>
      <OfferCreativeStep
        creatives={creatives}
        onCreativesChange={setCreatives}
        validationError={validationErrors?.creatives}
      />
    </div>
  );
}

// Step 4: Offer Tracking
function OfferTrackingStepWrapper({
  trackingSources,
  setTrackingSources,
}: Omit<
  StepProps,
  | "currentStep"
  | "totalSteps"
  | "onNext"
  | "onPrev"
  | "onSubmit"
  | "formData"
  | "setFormData"
  | "creatives"
  | "setCreatives"
  | "rewards"
  | "setRewards"
  | "isLoading"
  | "validationErrors"
  | "clearValidationErrors"
  | "offerCategories"
  | "categoriesLoading"
  | "onSaveDraft"
  | "onCancel"
>) {
  return (
    <div className="space-y-6">
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Offer Tracking
        </h2>
        <p className="text-sm text-gray-600">
          Configure tracking and analytics for your offer
        </p>
      </div>
      <OfferTrackingStep
        trackingSources={trackingSources}
        onTrackingSourcesChange={setTrackingSources}
      />
    </div>
  );
}

// Step 5: Offer Reward
function OfferRewardStepWrapper({
  rewards,
  setRewards,
}: Omit<
  StepProps,
  | "currentStep"
  | "totalSteps"
  | "onNext"
  | "onPrev"
  | "onSubmit"
  | "formData"
  | "setFormData"
  | "creatives"
  | "setCreatives"
  | "trackingSources"
  | "setTrackingSources"
  | "isLoading"
  | "validationErrors"
  | "clearValidationErrors"
  | "offerCategories"
  | "categoriesLoading"
  | "onSaveDraft"
  | "onCancel"
>) {
  return (
    <div className="space-y-6">
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Offer Rewards
        </h2>
        <p className="text-sm text-gray-600">
          Configure rewards and incentives for your offer
        </p>
      </div>
      <OfferRewardStep rewards={rewards} onRewardsChange={setRewards} />
    </div>
  );
}

// Legacy Step 2: Eligibility Rules (kept for reference)

// Step 6: Review
function ReviewStep({
  formData,
  creatives,
  trackingSources,
  rewards,
  offerCategories,
}: Omit<
  StepProps,
  | "currentStep"
  | "totalSteps"
  | "onNext"
  | "onPrev"
  | "onSubmit"
  | "setFormData"
  | "setCreatives"
  | "setTrackingSources"
  | "setRewards"
  | "isLoading"
  | "validationErrors"
  | "clearValidationErrors"
  | "categoriesLoading"
  | "onSaveDraft"
  | "onCancel"
>) {
  return (
    <div className="space-y-6">
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Review & Create
        </h2>
        <p className="text-sm text-gray-600">
          Review your offer details before creating
        </p>
      </div>

      <div className="space-y-6">
        {/* Offer Summary */}
        <div
          className="rounded-md p-6"
          style={{ backgroundColor: `${color.primary.action}10` }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Offer Summary
          </h3>

          {/* Basic Information */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Offer Type:</span>
                <span className="font-medium">
                  {formData.offer_type
                    ? formData.offer_type.charAt(0).toUpperCase() +
                      formData.offer_type.slice(1)
                    : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Catalog:</span>
                <span className="font-medium">
                  {formData.category_id
                    ? offerCategories?.find(
                        (cat: OfferCategoryType) =>
                          cat.id === formData.category_id
                      )?.name || `Catalog ${formData.category_id}`
                    : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Usage Per Customer:</span>
                <span className="font-medium">
                  {formData.max_usage_per_customer || "Not set"}
                </span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium text-right max-w-md">
                  {formData.description || "No description"}
                </span>
              </div>
            </div>
          </div>

          {/* Offer Creative Summary */}
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Offer Creatives
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Creatives:</span>
                  <span className="font-medium">{creatives.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Channels:</span>
                  <span className="font-medium">
                    {creatives.length > 0
                      ? [...new Set(creatives.map((c) => c.channel))].join(", ")
                      : "None configured"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Locales:</span>
                  <span className="font-medium">
                    {creatives.length > 0
                      ? [...new Set(creatives.map((c) => c.locale))].join(", ")
                      : "None configured"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Summary */}
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Tracking Configuration
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking Sources:</span>
                  <span className="font-medium">{trackingSources.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Sources:</span>
                  <span className="font-medium">
                    {trackingSources.filter((s) => s.enabled).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rules:</span>
                  <span className="font-medium">
                    {trackingSources.reduce(
                      (total, source) => total + source.rules.length,
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards Summary */}
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Offer Rewards
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rewards:</span>
                  <span className="font-medium">{rewards.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reward Types:</span>
                  <span className="font-medium">
                    {rewards.length > 0
                      ? [...new Set(rewards.map((r) => r.type))].join(", ")
                      : "None configured"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rules:</span>
                  <span className="font-medium">
                    {rewards.reduce(
                      (total, reward) => total + reward.rules.length,
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Product */}
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Selected Product
              </h3>
              {formData.primary_product_id ? (
                <div className="p-3 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700">
                    Product ID: {formData.primary_product_id}
                  </span>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No product selected</p>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2">
              Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium capitalize">Draft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Approval:</span>
                <span className="font-medium capitalize">Pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reusable:</span>
                <span className="font-medium">
                  {formData.is_reusable ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Multi-language:</span>
                <span className="font-medium">
                  {formData.supports_multi_language ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateOfferPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { success: showToast, error: showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);
  const totalSteps = 6;

  const [formData, setFormData] = useState<CreateOfferRequest>({
    name: "",
    code: "",
    description: "",
    offer_type: OfferTypeEnum.DATA,
    category_id: undefined,
    max_usage_per_customer: 1,
    eligibility_rules: {},
  });

  const [creatives, setCreatives] = useState<LocalOfferCreative[]>([]);
  const [trackingSources, setTrackingSources] = useState<TrackingSource[]>([]);
  const [rewards, setRewards] = useState<OfferReward[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<LinkedProduct[]>([]);
  const [initialProducts, setInitialProducts] = useState<LinkedProduct[]>([]); // Track initial products for edit mode
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1])); // Track visited steps

  const { user } = useAuth();

  // Preselect category from URL parameter
  useEffect(() => {
    const categoryIdParam = searchParams.get("categoryId");
    if (categoryIdParam && !isEditMode) {
      setFormData((prev) => ({
        ...prev,
        category_id: parseInt(categoryIdParam),
      }));
    }
  }, [searchParams, isEditMode]);

  // Load offer data for edit mode
  const loadOfferData = useCallback(async () => {
    if (!id) return;

    setIsLoadingOffer(true);
    try {
      const [offerResponse, productsData, creativesData] = await Promise.all([
        offerService.getOfferById(parseInt(id)),
        offerService.getOfferProducts(parseInt(id)).catch(() => []), // Load existing products, ignore errors
        offerCreativeService
          .getByOffer(parseInt(id), { limit: 100, skipCache: true })
          .catch(() => ({
            data: [],
            pagination: { total: 0, limit: 100, offset: 0, hasMore: false },
          })), // Load existing creatives, ignore errors
      ]);

      const response = offerResponse as { data?: Offer; success?: boolean };
      const offer = response.data || (response as Offer);

      // Extract products from response.data if wrapped
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const products = (productsData as any)?.data || productsData || [];

      const newFormData: CreateOfferRequest = {
        name: offer.name || "",
        code: offer.code || "",
        description: offer.description || "",
        offer_type: offer.offer_type || OfferTypeEnum.DATA, // Use actual offer_type from backend
        category_id: offer.category_id ? Number(offer.category_id) : undefined,
        primary_product_id: offer.primary_product_id
          ? Number(offer.primary_product_id)
          : undefined,
        max_usage_per_customer: offer.max_usage_per_customer || 1,
        eligibility_rules: offer.eligibility_rules || {},
        is_reusable: offer.is_reusable || false,
        supports_multi_language: offer.supports_multi_language || false,
      };
      setFormData(newFormData);

      // Fetch full product details for each product_id
      if (Array.isArray(products) && products.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productDetailsPromises = products.map(async (link: any) => {
          try {
            const productResponse = await productService.getProductById(
              link.product_id
            );
            const productData = productResponse.data || productResponse;
            return {
              ...productData,
              is_primary: link.is_primary,
              link_id: link.id || link.link_id,
            } as LinkedProduct;
          } catch {
            const fallbackProduct: LinkedProduct = {
              id: Number(link.product_id),
              product_uuid: "", // fallback values when details are unavailable
              product_code: "",
              name: `Product ${link.product_id}`,
              price: 0,
              currency: "USD",
              requires_inventory: false,
              is_active: false,
              created_at: new Date(0).toISOString(),
              updated_at: new Date(0).toISOString(),
              description: undefined,
              category_id: undefined,
              da_id: undefined,
              validity_days: undefined,
              validity_hours: undefined,
              available_quantity: undefined,
              effective_from: undefined,
              effective_to: undefined,
              created_by: undefined,
              updated_by: undefined,
              metadata: undefined,
              is_primary: link.is_primary,
              link_id: link.id || link.link_id,
            };
            return fallbackProduct;
          }
        });

        const fullProducts = await Promise.all(productDetailsPromises);
        setSelectedProducts(fullProducts);
        // Store initial products for comparison in edit mode
        setInitialProducts(fullProducts.map((p) => ({ ...p })));
      } else {
        // If no products, reset initial products
        setInitialProducts([]);
      }

      // Load existing creatives and prefill the creatives state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const creativesResponse = creativesData as any;
      const creativesList = creativesResponse?.data || [];

      if (Array.isArray(creativesList) && creativesList.length > 0) {
        const mappedCreatives: LocalOfferCreative[] = creativesList.map(
          (creative: OfferCreative) => ({
            id: String(creative.id ?? Math.random().toString(36).slice(2)),
            offer_id: creative.offer_id,
            channel: creative.channel,
            locale: creative.locale,
            title: creative.title,
            text_body: creative.text_body,
            html_body: creative.html_body,
            variables: creative.variables ?? {},
            default_values: creative.default_values,
            required_variables: creative.required_variables,
            version: creative.version,
            is_active: creative.is_active ?? true,
            is_latest: creative.is_latest,
            template_type_id: creative.template_type_id,
            created_at: creative.created_at,
            updated_at: creative.updated_at,
            created_by: creative.created_by,
            updated_by: creative.updated_by,
          })
        );
        setCreatives(mappedCreatives);
      }
    } catch (error) {
      console.error("Failed to load offer data", error);
      // Failed to load offer data
      navigate("/dashboard/offers");
    } finally {
      setIsLoadingOffer(false);
    }
  }, [id, navigate, setFormData, setCreatives]);

  // Offer categories state
  const [offerCategories, setOfferCategories] = useState<OfferCategoryType[]>(
    []
  );
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load offer categories on component mount
  useEffect(() => {
    const loadOfferCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await offerCategoryService.getAllCategories({
          limit: 50, // Get all categories
          skipCache: true,
        });
        setOfferCategories(response.data || []);
      } catch {
        // Failed to load offer categories
        // Keep empty array on error, user can still proceed
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadOfferCategories();
  }, []);

  // Detect edit mode and load data
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadOfferData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Validation functions
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name?.trim()) {
      errors.name = "Offer name is required";
    }

    if (!formData.code?.trim()) {
      errors.code = "Offer code is required";
    }

    if (!formData.offer_type) {
      errors.offer_type = "Offer type is required";
    }

    if (!formData.category_id) {
      errors.category_id = "Catalog is required";
    }

    // Product selection is optional; remove validation
    // if (!formData.product_id) {
    //   errors.product_id = "Product selection is required";
    // }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  // Validation function for each step
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1: // Basic Info step
        return (
          formData.name.trim() !== "" &&
          formData.offer_type &&
          formData.category_id !== undefined
        );
      case 2: // Products step
        return true; // Products are optional; allow proceeding
      case 3: // Creative step
        return true; // Creatives are optional; allow proceeding
      case 4: // Tracking step
        return trackingSources.length > 0;
      case 5: // Rewards step
        return rewards.length > 0;
      case 6: // Review step
        return true; // Review step doesn't need validation
      default:
        return false;
    }
  }, [
    currentStep,
    formData,
    // creatives,
    trackingSources,
    rewards,
    // Removed validationErrors and clearValidationErrors to break circular dependency
  ]);

  const canNavigateToStep = useCallback(
    (targetStep: number) => {
      // Can always go to previously visited steps
      if (visitedSteps.has(targetStep)) return true;

      // Can go to next step only if current step is valid
      if (targetStep === currentStep + 1) return validateCurrentStep();

      // Can stay on current step
      if (targetStep === currentStep) return true;

      // Can't go to future steps beyond current + 1
      return false;
    },
    [visitedSteps, currentStep, validateCurrentStep]
  );

  const handleNext = useCallback(() => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setVisitedSteps((prev) => new Set(prev).add(nextStep));
    }
  }, [currentStep, totalSteps, validateCurrentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback(
    (stepId: number) => {
      if (canNavigateToStep(stepId)) {
        setCurrentStep(stepId);
        // Mark the clicked step as visited
        setVisitedSteps((prev) => new Set(prev).add(stepId));
      }
    },
    [canNavigateToStep]
  );

  const handleSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      clearValidationErrors();

      // Validate form before submission
      if (!validateForm()) {
        setError("Please fix the validation errors before submitting");
        return;
      }

      // Prepare API data - remove empty description if not provided
      // Backend doesn't accept empty strings for description
      const { description, ...formDataWithoutDescription } = formData;
      const apiData: CreateOfferRequest = {
        ...formDataWithoutDescription,
        offer_type: formData.offer_type!, // Required by validation, so safe to assert
        ...(description?.trim() ? { description: description.trim() } : {}),
      };

      let offerId: number;

      if (isEditMode && id) {
        await offerService.updateOffer(parseInt(id), apiData);
        offerId = parseInt(id);
      } else {
        const createdOfferResponse = await offerService.createOffer(apiData);

        // Extract offer ID from response - BaseResponse wraps the Offer in .data
        // Try data.id first, then insertId as fallback
        offerId =
          createdOfferResponse.data?.id || createdOfferResponse.insertId;

        if (!offerId) {
          throw new Error("Failed to get offer ID from creation response");
        }
      }

      // Handle product linking/unlinking
      if (
        selectedProducts.length > 0 ||
        (isEditMode && initialProducts.length > 0)
      ) {
        try {
          if (!user?.user_id) {
            throw new Error("User ID not available for linking products");
          }

          if (!offerId) {
            throw new Error("Offer ID is not available for linking products");
          }

          if (isEditMode) {
            // In edit mode, compare initial products with current products
            const initialProductIds = new Set(
              initialProducts.map((p) => String(p.id))
            );
            const currentProductIds = new Set(
              selectedProducts.map((p) => String(p.id))
            );

            // Find products to unlink (in initial but not in current)
            const productsToUnlink = initialProducts.filter(
              (p) => !currentProductIds.has(String(p.id))
            );

            // Find products to link (in current but not in initial)
            const productsToLink = selectedProducts.filter(
              (p) => !initialProductIds.has(String(p.id))
            );

            // Unlink removed products
            if (productsToUnlink.length > 0) {
              for (const product of productsToUnlink) {
                const linkId = product.link_id;
                if (!linkId) {
                  continue;
                }
                await offerService.unlinkProductById(linkId);
              }
            }

            // Link newly added products
            if (productsToLink.length > 0) {
              const primaryProductId = formData.primary_product_id;
              const links = productsToLink.map((p) => {
                const productId = Number(p.id);
                return {
                  offer_id: Number(offerId),
                  product_id: productId,
                  is_primary: primaryProductId === productId,
                  quantity: 1,
                };
              });

              const batchRequest = {
                links: links,
                created_by: user.user_id,
              };

              await offerService.linkProductsBatch(batchRequest);
            }

            // Handle primary product change (if primary changed but product still exists)
            const currentPrimaryId = formData.primary_product_id;
            if (currentPrimaryId) {
              const primaryProduct = selectedProducts.find(
                (p) => p.id === currentPrimaryId
              );
              const initialPrimary = initialProducts.find((p) => p.is_primary);

              // If primary changed to a different existing product
              if (
                primaryProduct &&
                initialPrimary &&
                initialPrimary.id !== currentPrimaryId
              ) {
                // Primary product changes are managed through the offer details page
              }
            }
          } else {
            // Create mode: link all selected products
            const primaryProductId = formData.primary_product_id;
            const links = selectedProducts.map((p) => {
              const productId = Number(p.id);
              return {
                offer_id: Number(offerId),
                product_id: productId,
                is_primary: primaryProductId === productId,
                quantity: 1,
              };
            });

            const batchRequest = {
              links: links,
              created_by: user.user_id,
            };

            await offerService.linkProductsBatch(batchRequest);
          }
        } catch {
          // Failed to manage products
          showError(
            `Offer ${isEditMode ? "updated" : "created"}, but failed to ${
              isEditMode ? "update" : "link"
            } products. Creatives will still be saved.`
          );
        }
      }

      // Save creatives to the offer if any were created
      // Note: This runs regardless of product linking success/failure
      if (creatives.length > 0) {
        try {
          if (!user?.user_id) {
            throw new Error("User ID not available for saving creatives");
          }

          // Create creatives for each channel/locale combination
          const creativePromises = creatives.map(async (creative) => {
            const creativePayload = {
              offer_id: offerId,
              channel: creative.channel,
              locale: creative.locale,
              title: creative.title || undefined,
              text_body: creative.text_body || undefined,
              html_body: creative.html_body || undefined,
              variables: creative.variables || undefined,
              created_by: user.user_id,
            };

            return await offerCreativeService.create(creativePayload);
          });

          await Promise.all(creativePromises);
        } catch {
          showError(
            `Offer ${
              isEditMode ? "updated" : "created"
            }, but failed to save creatives`
          );
          navigate("/dashboard/offers");
          return;
        }
      }

      // Show success message
      showToast(`Offer ${isEditMode ? "updated" : "created"} successfully`);

      navigate("/dashboard/offers");
    } catch (err: unknown) {
      // Create offer error

      // Parse API error response for better error messages
      let errorMessage = "Failed to create offer";

      // Handle Error objects (from service)
      if (err instanceof Error) {
        // Filter out HTTP error messages
        if (
          err.message.includes("HTTP error") ||
          err.message.includes("status:")
        ) {
          errorMessage = "Failed to create offer";
        } else {
          errorMessage = err.message;
        }
      } else if (err && typeof err === "object") {
        // Handle response objects
        if (hasResponseData(err)) {
          const errorResponse = err.response;

          if (errorResponse?.data?.message) {
            const msg = errorResponse.data.message;
            // Filter out HTTP errors
            if (msg.includes("HTTP error") || msg.includes("status:")) {
              errorMessage = "Failed to create offer";
            } else {
              errorMessage = msg;
            }
          } else if (errorResponse?.data?.error) {
            const errMsg = errorResponse.data.error;
            // Filter out HTTP errors
            if (errMsg.includes("HTTP error") || errMsg.includes("status:")) {
              errorMessage = "Failed to create offer";
            } else {
              errorMessage = errMsg;
            }
          } else if (errorResponse?.data?.details) {
            // Handle validation errors from API
            const details = errorResponse.data.details;
            if (Array.isArray(details)) {
              const fieldErrors: Record<string, string> = {};
              details.forEach((detail: ApiErrorDetail) => {
                if (detail.field) {
                  fieldErrors[detail.field] = detail.message || "Invalid value";
                }
              });
              setValidationErrors(fieldErrors);
              errorMessage = "Please fix the validation errors below";
            } else if (isRecordOfString(details)) {
              setValidationErrors(details);
              errorMessage = "Please fix the validation errors below";
            }
          }
        } else if (hasErrorString(err)) {
          // Handle direct error objects
          const errMsg = err.error;
          // Filter out HTTP errors
          if (errMsg.includes("HTTP error") || errMsg.includes("status:")) {
            errorMessage = "Failed to create offer";
          } else {
            errorMessage = errMsg;
          }
        } else if (hasMessageString(err)) {
          const msg = err.message;
          // Filter out HTTP errors
          if (msg.includes("HTTP error") || msg.includes("status:")) {
            errorMessage = "Failed to create offer";
          } else {
            errorMessage = msg;
          }
        }
      }

      // Show error to user
      console.error("Failed to create/update offer:", err);
      showError("Error", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    isEditMode,
    id,
    validateForm,
    clearValidationErrors,
    formData,
    selectedProducts,
    initialProducts,
    user,
    creatives,
    navigate,
    showError,
    showToast,
  ]);

  const handleSaveDraft = useCallback(async () => {
    try {
      setIsSavingDraft(true);
      if (!formData.name.trim()) {
        showError("Offer name is required to save draft");
        return;
      }

      const draftData: CreateOfferRequest = {
        name: formData.name,
        code: formData.code,
        offer_type: formData.offer_type || OfferTypeEnum.DATA, // Default to DATA if not set for draft
        max_usage_per_customer: formData.max_usage_per_customer,
        ...(formData.description && { description: formData.description }),
        ...(formData.category_id && { category_id: formData.category_id }),
        ...(formData.primary_product_id && {
          primary_product_id: formData.primary_product_id,
        }),
        ...(formData.eligibility_rules && {
          eligibility_rules: formData.eligibility_rules,
        }),
        ...(formData.is_reusable !== undefined && {
          is_reusable: formData.is_reusable,
        }),
        ...(formData.supports_multi_language !== undefined && {
          supports_multi_language: formData.supports_multi_language,
        }),
      };

      await offerService.createOffer(draftData);
      showToast("Draft saved successfully!");
    } catch {
      showError("Failed to save draft. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  }, [formData, showError, showToast]);

  const handleCancel = useCallback(() => {
    navigate("/dashboard/offers");
  }, [navigate]);

  const stepProps = useMemo(
    () => ({
      currentStep,
      totalSteps,
      onNext: handleNext,
      onPrev: handlePrev,
      onSubmit: handleSubmit,
      formData,
      setFormData,
      creatives,
      setCreatives,
      trackingSources,
      setTrackingSources,
      rewards,
      setRewards,
      isLoading,
      validationErrors,
      clearValidationErrors,
      offerCategories,
      categoriesLoading,
      onSaveDraft: handleSaveDraft,
      onCancel: handleCancel,
    }),
    [
      currentStep,
      totalSteps,
      handleNext,
      handlePrev,
      handleSubmit,
      formData,
      // setFormData, setCreatives, etc. are stable - don't need in deps
      creatives,
      trackingSources,
      rewards,
      isLoading,
      validationErrors,
      clearValidationErrors,
      offerCategories,
      categoriesLoading,
      handleSaveDraft,
      handleCancel,
    ]
  );

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "upcoming";
  };

  // Render step directly in JSX instead of memoizing to avoid dependency issues

  // Show loading state while loading offer data (after all hooks)
  if (isLoadingOffer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div
        className={`bg-white rounded-md border border-[${color.border.default}] p-4`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center pb-6 min-h-[48px]">
            <div></div>
            {currentStep !== 6 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: color.primary.action }}
                  onMouseEnter={(e) => {
                    if (!isSavingDraft)
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        color.interactive.hover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSavingDraft)
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        color.primary.action;
                  }}
                >
                  {isSavingDraft ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Draft"
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard/offers")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-xl font-semibold ${tw.textPrimary}`}>
                  {isEditMode ? "Edit Offer" : "Create Offer"}
                </h1>
                <p className={`text-sm ${tw.textMuted}`}>
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Progress Navigation */}
          <nav
            aria-label="Progress"
            className="sticky top-16 z-40 bg-white py-6 border-b border-gray-200"
          >
            {/* Mobile - Simple dots */}
            <div className="md:hidden flex items-center justify-center gap-2">
              {steps.map((step) => {
                const status = getStepStatus(step.id);
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    disabled={!canNavigateToStep(step.id)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      status === "completed" || status === "current"
                        ? "w-8"
                        : ""
                    }`}
                    style={{
                      backgroundColor:
                        status === "completed" || status === "current"
                          ? color.primary.action
                          : "#d1d5db",
                    }}
                  />
                );
              })}
            </div>

            {/* Desktop - Full stepper */}
            <div className="hidden md:flex items-center justify-between w-full">
              {steps.map((step, stepIdx) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;

                return (
                  <div key={step.id} className="relative">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      className="relative flex flex-col items-center group z-10"
                      disabled={!canNavigateToStep(step.id)}
                    >
                      <div
                        className={`
                        flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                        ${
                          status === "completed"
                            ? `bg-[${color.primary.action}] border-[${color.primary.action}] text-white`
                            : status === "current"
                            ? `bg-white border-[${color.primary.action}] text-[${color.primary.action}]`
                            : "bg-white border-gray-300 text-gray-400"
                        }
                        ${
                          step.id <= currentStep + 2
                            ? "cursor-pointer hover:scale-110"
                            : "cursor-not-allowed"
                        }
                      `}
                      >
                        {status === "completed" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>

                      <div className="mt-2 text-center">
                        <div
                          className={`text-sm font-medium ${
                            status === "current"
                              ? `text-[${color.primary.action}]`
                              : status === "completed"
                              ? tw.textPrimary
                              : tw.textMuted
                          }`}
                        >
                          {step.name}
                        </div>
                        <div
                          className={`text-xs mt-1 hidden lg:block ${tw.textMuted}`}
                        >
                          {step.description}
                        </div>
                      </div>
                    </button>

                    {stepIdx !== steps.length - 1 && (
                      <div
                        className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200"
                        style={{
                          transform: "translateX(0%)",
                          zIndex: 1,
                        }}
                      >
                        <div
                          className={`h-full transition-all duration-500 ${
                            step.id < currentStep
                              ? `bg-[${color.primary.action}] w-full`
                              : "bg-gray-200 w-0"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="pb-10">
            {currentStep === 1 && <BasicInfoStep {...stepProps} />}
            {currentStep === 2 && (
              <ProductStepWrapper
                {...stepProps}
                selectedProducts={selectedProducts}
                onProductsChange={setSelectedProducts}
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {currentStep === 3 && <OfferCreativeStepWrapper {...stepProps} />}
            {currentStep === 4 && <OfferTrackingStepWrapper {...stepProps} />}
            {currentStep === 5 && <OfferRewardStepWrapper {...stepProps} />}
            {currentStep === 6 && <ReviewStep {...stepProps} />}
          </div>

          {/* Sticky Bottom Navigation */}
          <div className="sticky bottom-0 z-50 bg-white py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={currentStep === 6 ? handleSubmit : handleNext}
                disabled={
                  currentStep === 6
                    ? isLoading || !validateCurrentStep()
                    : !validateCurrentStep()
                }
                className="inline-flex items-center px-5 py-2 text-sm font-medium rounded-md text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: color.primary.action }}
                onMouseEnter={(e) => {
                  if (
                    currentStep === 6
                      ? !isLoading && validateCurrentStep()
                      : validateCurrentStep()
                  )
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      color.interactive.hover;
                }}
                onMouseLeave={(e) => {
                  if (
                    currentStep === 6
                      ? !isLoading && validateCurrentStep()
                      : validateCurrentStep()
                  )
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      color.primary.action;
                }}
              >
                {currentStep === 6 ? (
                  isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditMode ? (
                    "Update Offer"
                  ) : (
                    "Create Offer"
                  )
                ) : (
                  "Next Step"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
