import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Target, Users, Gift, Eye } from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import { color, tw } from "../../../shared/utils/utils";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import {
  CampaignSegment,
  CampaignOffer,
  ControlGroup,
  CampaignScheduling,
} from "../types/campaign";
import { CreateCampaignRequest } from "../types/createCampaign";

// Extended type for form data that includes all properties needed during creation
// Mapping interface for segment-offer relationships
export interface SegmentOfferMapping {
  segment_id: string;
  offer_id: number;
}

interface CampaignFormData extends CreateCampaignRequest {
  scheduling?: CampaignScheduling;
  segments?: CampaignSegment[];
  segmentOfferMappings?: SegmentOfferMapping[];
}
import { campaignService } from "../services/campaignService";
import {
  campaignSegmentOfferService,
  CampaignSegmentOfferMapping,
} from "../services/campaignSegmentOfferService";
import { segmentService } from "../../segments/services/segmentService";
import { offerService } from "../../offers/services/offerService";
import { departmentsConfig } from "../../../shared/configs/configurationPageConfigs";

// Objective options mapping
const objectiveOptions = [
  { value: "acquisition", label: "New Customer Acquisition" },
  { value: "retention", label: "Customer Retention" },
  { value: "churn_prevention", label: "Churn Prevention" },
  { value: "upsell_cross_sell", label: "Upsell/Cross-sell" },
  { value: "reactivation", label: "Dormant Customer Reactivation" },
];
import CampaignDefinitionStep from "../components/steps/CampaignDefinitionStep";
import AudienceConfigurationStep from "../components/steps/AudienceConfigurationStep";
import OfferMappingStep from "../components/steps/OfferMappingStep";
import CampaignPreviewStep from "../components/steps/CampaignPreviewStep";

interface StepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  formData: CreateCampaignRequest;
  setFormData: (data: CreateCampaignRequest) => void;
  selectedSegments: CampaignSegment[];
  setSelectedSegments: (segments: CampaignSegment[]) => void;
  selectedOffers: CampaignOffer[];
  setSelectedOffers: (offers: CampaignOffer[]) => void;
  segmentOfferMappings?: SegmentOfferMapping[];
  setSegmentOfferMappings?: (mappings: SegmentOfferMapping[]) => void;
  controlGroup: ControlGroup;
  setControlGroup: (group: ControlGroup) => void;
  isLoading?: boolean;
  onSaveDraft?: () => void;
  onCancel?: () => void;
}

const steps = [
  {
    id: 1,
    name: "Definition",
    description: "Campaign goals & objectives",
    icon: Target,
    color: "from-blue-100 to-indigo-100",
    iconColor: "text-blue-600",
  },
  {
    id: 2,
    name: "Audience",
    description: "Segment configuration",
    icon: Users,
    color: "from-emerald-100 to-teal-100",
    iconColor: "text-emerald-600",
  },
  {
    id: 3,
    name: "Offers",
    description: "Offer selection & mapping",
    icon: Gift,
    color: "from-purple-100 to-indigo-100",
    iconColor: "text-purple-600",
  },
  {
    id: 4,
    name: "Preview",
    description: "Review & launch",
    icon: Eye,
    color: "from-rose-100 to-pink-100",
    iconColor: "text-rose-600",
  },
];

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);

  // Get params from URL
  const categoryIdParam = searchParams.get("categoryId");
  const duplicateIdParam = searchParams.get("duplicateId");
  const preselectedCategoryId = categoryIdParam
    ? Number(categoryIdParam)
    : undefined;

  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    objective: "acquisition",
    category_id: preselectedCategoryId,
    start_date: undefined,
    end_date: undefined,
  });

  const [selectedSegments, setSelectedSegments] = useState<CampaignSegment[]>(
    []
  );
  const [selectedOffers, setSelectedOffers] = useState<CampaignOffer[]>([]);
  const [segmentOfferMappings, setSegmentOfferMappings] = useState<
    SegmentOfferMapping[]
  >([]);
  const [controlGroup, setControlGroup] = useState<ControlGroup>({
    enabled: false,
    percentage: 5,
    type: "standard",
  });

  const loadCampaignData = useCallback(
    async (campaignId: string, isDuplicate: boolean = false) => {
      if (!campaignId) return;

      setIsLoadingCampaign(true);
      try {
        const response = await campaignService.getCampaignById(campaignId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const campaign = (response as { data?: any } | any).data || response;

        // Set form data with all available fields
        // If duplicating, prefix name with "Copy of "
        const newFormData: CampaignFormData = {
          name: isDuplicate
            ? `Copy of ${campaign?.name}`
            : campaign?.name || "",
          description: campaign?.description || "",
          objective: campaign?.objective || "acquisition",
          category_id: campaign?.category_id || undefined,
          program_id: campaign?.program_id || undefined,
          start_date: campaign?.start_date || undefined,
          end_date: campaign?.end_date || undefined,
          campaign_type: campaign?.campaign_type || "multiple_target_group",
          // Load tags as array
          tags: campaign?.tags || [],
          // Load department_id if owner_team matches a department name
          department_id: campaign?.owner_team ? undefined : undefined, // Will be set in UI selection
        };
        setFormData(newFormData);

        // Load segments and offers via mappings
        try {
          const mappingsResponse =
            await campaignSegmentOfferService.getMappingsByCampaign(campaignId);

          if (mappingsResponse.success && mappingsResponse.data.length > 0) {
            // Extract unique segment IDs and offer IDs
            const uniqueSegmentIds = [
              ...new Set(mappingsResponse.data.map((m) => m.segment_id)),
            ];
            const uniqueOfferIds = [
              ...new Set(mappingsResponse.data.map((m) => m.offer_id)),
            ];

            // Load full segment details
            const segmentPromises = uniqueSegmentIds.map(async (segmentId) => {
              try {
                const response = await segmentService.getSegmentById(
                  parseInt(segmentId),
                  true
                );
                const segment = response.data;
                return {
                  id: String(segment.id),
                  name: segment.name,
                  description: segment.description || "",
                  customer_count: segment.size_estimate || 0,
                  criteria: {},
                  created_at: segment.created_at,
                } as CampaignSegment;
              } catch {
                return null;
              }
            });

            // Load full offer details
            const offerPromises = uniqueOfferIds.map(async (offerId) => {
              try {
                const response = await offerService.getOfferById(offerId, true);
                const offer = response.data;
                // Calculate validity period from valid_from and valid_to
                let validityPeriod = 30;
                if (offer.valid_from && offer.valid_to) {
                  const from = new Date(offer.valid_from);
                  const to = new Date(offer.valid_to);
                  validityPeriod = Math.ceil(
                    (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
                  );
                }

                // Determine reward type and value based on available fields
                let rewardType:
                  | "bundle"
                  | "points"
                  | "discount"
                  | "cashback"
                  | "free_service" = "discount";
                let rewardValue = "0";
                if (offer.discount_percentage) {
                  rewardType = "discount";
                  rewardValue = String(offer.discount_percentage);
                } else if (offer.discount_amount) {
                  rewardType = "cashback";
                  rewardValue = String(offer.discount_amount);
                } else if (offer.bonus_value) {
                  rewardType = "points";
                  rewardValue = String(offer.bonus_value);
                }

                return {
                  id: String(offer.id),
                  name: offer.name,
                  description: offer.description || "",
                  offer_type: offer.offer_type,
                  reward_type: rewardType,
                  reward_value: rewardValue,
                  validity_period: validityPeriod,
                  terms_conditions: JSON.stringify(
                    offer.eligibility_rules || {}
                  ),
                } as CampaignOffer;
              } catch {
                return null;
              }
            });

            // Wait for all loads to complete
            const [loadedSegments, loadedOffers] = await Promise.all([
              Promise.all(segmentPromises),
              Promise.all(offerPromises),
            ]);

            // Filter out failed loads and set state
            const validSegments = loadedSegments.filter(
              (s): s is CampaignSegment => s !== null
            );
            const validOffers = loadedOffers.filter(
              (o): o is CampaignOffer => o !== null
            );

            setSelectedSegments(validSegments);
            setSelectedOffers(validOffers);

            // Set segment-offer mappings
            const mappings = mappingsResponse.data.map((m) => ({
              segment_id: m.segment_id,
              offer_id: m.offer_id,
            }));
            setSegmentOfferMappings(mappings);
          }
        } catch (mappingError) {}
      } catch {
        showToast("error", "Failed to load campaign data");
        navigate("/dashboard/campaigns");
      } finally {
        setIsLoadingCampaign(false);
      }
    },
    [showToast, navigate]
  );

  useEffect(() => {
    if (id) {
      // Edit mode - modifying existing campaign
      setIsEditMode(true);
      setIsDuplicateMode(false);
      loadCampaignData(id, false);
    } else if (duplicateIdParam) {
      // Duplicate mode - creating new campaign from existing one
      setIsEditMode(false);
      setIsDuplicateMode(true);
      loadCampaignData(duplicateIdParam, true);
    }
  }, [id, duplicateIdParam, loadCampaignData]);

  // Validation function for each step
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Definition step
        return (
          formData.name.trim() !== "" &&
          formData.objective !== undefined &&
          formData.category_id !== undefined
        );
      case 2: // Audience step
        return selectedSegments.length > 0;
      case 3: // Offers step
        // For multiple_target_group, verify all segments have at least one offer mapped
        if (formData.campaign_type === "multiple_target_group") {
          return (
            selectedSegments.length > 0 &&
            selectedSegments.every((segment) =>
              segmentOfferMappings.some(
                (mapping) => mapping.segment_id === segment.id
              )
            )
          );
        }
        return selectedOffers.length > 0;
      case 4: // Preview step
        return true; // Preview step doesn't need validation
      default:
        return false;
    }
  };

  const canNavigateToStep = (targetStep: number) => {
    // Can always go to previous steps
    if (targetStep < currentStep) return true;

    // Can't go to future steps beyond current + 1
    if (targetStep > currentStep + 1) return false;

    // Can go to next step only if current step is valid
    if (targetStep === currentStep + 1) return validateCurrentStep();

    // Can stay on current step
    if (targetStep === currentStep) return true;

    return false;
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (canNavigateToStep(stepId)) {
      setCurrentStep(stepId);
    }
  };

  // Generate unique campaign code from name
  const generateCampaignCode = (name: string): string => {
    // Remove special characters and convert to uppercase
    const sanitized = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "_");

    // Get current year
    const year = new Date().getFullYear();

    // Generate random suffix for uniqueness (4 characters)
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();

    // Create code: First 3 words of name + year + random suffix
    const words = sanitized.split("_").filter((w) => w.length > 0);
    const prefix = words.slice(0, 3).join("_");

    return `${prefix}_${year}_${randomSuffix}`;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!formData.name.trim()) {
        showToast("error", "Campaign name is required");
        setIsLoading(false);
        return;
      }

      // Auto-assign a random dummy segment if no segments are selected
      let finalSegments = formData.segments || [];
      if (finalSegments.length === 0) {
        const dummySegments = [
          "High Value Customers",
          "At Risk Customers",
          "New Subscribers",
          "Voice Heavy Users",
          "Data Bundle Enthusiasts",
          "Weekend Warriors",
          "Business Customers",
          "Dormant Users",
        ];

        const randomSegmentName =
          dummySegments[Math.floor(Math.random() * dummySegments.length)];
        finalSegments = [
          {
            id: "dummy-segment-" + Math.random().toString(36).substr(2, 9),
            name: randomSegmentName,
            description: `Auto-generated segment: ${randomSegmentName}`,
            customer_count: Math.floor(Math.random() * 10000) + 1000,
            criteria: {},
            created_at: new Date().toISOString(),
          },
        ];
      }

      if (isEditMode && id) {
        // Update campaign - Don't regenerate code, add updated_by
        // Get objective label from value
        const objectiveOption = objectiveOptions.find(
          (o: { value: string; label: string }) =>
            o.value === formData.objective
        );
        const objectiveLabel = objectiveOption
          ? objectiveOption.label
          : formData.objective;

        // Get tags array directly from formData
        const tagsArray = formData.tags || [];

        // Get department name from formData.department_id
        const departmentId = (formData as { department_id?: number })
          .department_id;
        const department = departmentId
          ? departmentsConfig.initialData.find(
              (d: { id: number | string; name: string }) =>
                Number(d.id) === Number(departmentId)
            )
          : undefined;
        const ownerTeam = department?.name || undefined;

        const updateData: Partial<CreateCampaignRequest> = {
          name: formData.name,
          objective: objectiveLabel, // Send label text, not value
          updated_by: 1, // TODO: Get actual user ID from auth context
          ...(formData.description && { description: formData.description }),
          ...(formData.category_id && { category_id: formData.category_id }),
          ...(formData.program_id && { program_id: formData.program_id }),
          ...(formData.start_date && { start_date: formData.start_date }),
          ...(formData.end_date && { end_date: formData.end_date }),
          ...(tagsArray.length > 0 && { tags: tagsArray }),
          ...(ownerTeam && { owner_team: ownerTeam }),
        };

        await campaignService.updateCampaign(parseInt(id), updateData);
        showToast("success", "Campaign updated successfully!");
      } else {
        // Generate unique code from campaign name for NEW campaigns
        const campaignCode = generateCampaignCode(formData.name);

        // Get objective label from value
        const objectiveOption = objectiveOptions.find(
          (o: { value: string; label: string }) =>
            o.value === formData.objective
        );
        const objectiveLabel = objectiveOption
          ? objectiveOption.label
          : formData.objective;

        // Get tags array directly from formData
        const tagsArray = formData.tags || [];

        // Get department name from formData.department_id
        const departmentId = (formData as { department_id?: number })
          .department_id;
        const department = departmentId
          ? departmentsConfig.initialData.find(
              (d: { id: number | string; name: string }) =>
                Number(d.id) === Number(departmentId)
            )
          : undefined;
        const ownerTeam = department?.name || undefined;

        const campaignData: CreateCampaignRequest = {
          name: formData.name,
          code: campaignCode,
          objective: objectiveLabel, // Send label text, not value
          status: "draft", // New campaigns start as draft
          created_by: 1, // TODO: Get actual user ID from auth context
          ...(formData.description && { description: formData.description }),
          ...(formData.category_id && { category_id: formData.category_id }),
          ...(formData.program_id && { program_id: formData.program_id }),
          ...(formData.start_date && { start_date: formData.start_date }),
          ...(formData.end_date && { end_date: formData.end_date }),
          ...(tagsArray.length > 0 && { tags: tagsArray }),
          ...(ownerTeam && { owner_team: ownerTeam }),
        };
        // New campaigns are created with status: 'draft' and approval_status: 'pending'
        const createResponse = await campaignService.createCampaign(
          campaignData
        );

        // Extract campaign ID from response
        const createdCampaignId = createResponse?.data?.id;

        if (!createdCampaignId) {
          throw new Error("Campaign created but ID not returned");
        }

        // Create Campaign-Segment-Offer mappings for Multiple Target campaigns
        if (
          formData.campaign_type === "multiple_target_group" &&
          segmentOfferMappings.length > 0
        ) {
          try {
            const mappingsToCreate: CampaignSegmentOfferMapping[] =
              segmentOfferMappings.map((mapping) => ({
                campaign_id: createdCampaignId,
                segment_id: mapping.segment_id,
                offer_id: mapping.offer_id,
                created_by: 1, // TODO: Get actual user ID from auth context
              }));

            await campaignSegmentOfferService.createBatchMappings(
              mappingsToCreate
            );

            showToast(
              "success",
              "Campaign created and mappings configured successfully!"
            );
          } catch (mappingError) {
            showToast(
              "warning",
              "Campaign created but some mappings failed. Please check the campaign details."
            );
          }
        } else {
          showToast("success", "Campaign created and submitted for approval!");
        }
      }

      navigate("/dashboard/campaigns");
    } catch (error) {
      showToast(
        "error",
        `Failed to ${
          isEditMode ? "update" : "create"
        } campaign. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      if (!formData.name.trim()) {
        showToast("error", "Campaign name is required to save draft");
        return;
      }

      // Generate unique code from campaign name
      const campaignCode = generateCampaignCode(formData.name);

      const draftData: CreateCampaignRequest = {
        name: formData.name,
        code: campaignCode,
        objective: formData.objective,
        status: "draft", // Explicitly set as draft
        created_by: 1, // TODO: Get actual user ID from auth context
        ...(formData.description && { description: formData.description }),
        ...(formData.category_id && { category_id: formData.category_id }),
        ...(formData.start_date && { start_date: formData.start_date }),
        ...(formData.end_date && { end_date: formData.end_date }),
      };

      await campaignService.createCampaign(draftData);
      showToast("success", "Draft saved successfully!");
    } catch {
      showToast("error", "Failed to save draft. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/campaigns");
  };

  // const handleReset = () => {
  //   setFormData({
  //     name: '',
  //     description: '',
  //     campaign_type: 'multiple_target_group',
  //     objective: 'acquisition',
  //     category: '',
  //     segments: [],
  //     offers: [],
  //     scheduling: {
  //       type: 'scheduled',
  //       time_zone: 'UTC',
  //       delivery_times: ['09:00'],
  //       frequency_capping: {
  //         max_per_day: 1,
  //         max_per_week: 3,
  //         max_per_month: 10
  //       },
  //       throttling: {
  //         max_per_hour: 1000,
  //         max_per_day: 10000
  //       }
  //     }
  //   });
  //   setSelectedSegments([]);
  //   setSelectedOffers([]);
  //   setControlGroup({
  //     enabled: false,
  //     percentage: 5,
  //     type: 'standard'
  //   });
  //   setCurrentStep(1);
  //   showToast('success', 'Form reset successfully');
  // };

  const stepProps: StepProps = {
    currentStep,
    totalSteps: steps.length,
    onNext: handleNext,
    onPrev: handlePrev,
    onSubmit: handleSubmit,
    formData,
    setFormData,
    selectedSegments,
    setSelectedSegments,
    selectedOffers,
    setSelectedOffers,
    segmentOfferMappings,
    setSegmentOfferMappings,
    controlGroup,
    setControlGroup,
    isLoading,
    onSaveDraft: handleSaveDraft,
    onCancel: handleCancel,
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CampaignDefinitionStep {...stepProps} />;
      case 2:
        return <AudienceConfigurationStep {...stepProps} />;
      case 3:
        return <OfferMappingStep {...stepProps} />;
      case 4:
        return <CampaignPreviewStep {...stepProps} />;
      default:
        return <CampaignDefinitionStep {...stepProps} />;
    }
  };

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "current";
    return "pending";
  };

  if (isLoadingCampaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div
        className={`bg-white rounded-md border border-[${color.border.default}] p-4`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/dashboard/campaigns")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className={`text-lg font-semibold ${tw.textPrimary}`}>
                {isEditMode
                  ? "Edit Campaign"
                  : isDuplicateMode
                  ? "Duplicate Campaign"
                  : "Create Campaign"}
              </h1>
            </div>
            {currentStep !== 4 && (
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

          {/* Sticky Progress Navigation */}
          <nav
            aria-label="Progress"
            className="sticky top-16 z-20 bg-white py-6 border-b border-gray-200"
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
            <div className="hidden md:flex items-center justify-between w-full relative">
              {/* Background line - starts after first circle, ends before last circle */}
              <div
                className="absolute top-4 h-0.5 bg-gray-200"
                style={{
                  left: "1rem", // Start after first circle (half of 32px/2rem circle)
                  right: "1rem", // End before last circle (half of 32px/2rem circle)
                  zIndex: 0,
                }}
              />

              {/* Progress line for completed steps */}
              {currentStep > 1 && (
                <div
                  className="absolute top-4 h-0.5 transition-all duration-500"
                  style={{
                    left: "1rem", // Start after first circle
                    width: `calc((100% - 2rem) * ${
                      (currentStep - 1) / (steps.length - 1)
                    })`, // Proportional width
                    backgroundColor: color.primary.action,
                    zIndex: 1,
                  }}
                />
              )}

              {steps.map((step, stepIdx) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;

                return (
                  <div key={step.id} className="relative z-10">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      className="relative flex flex-col items-center group"
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
                  </div>
                );
              })}
            </div>
          </nav>

          <div className="py-4">{renderStep()}</div>

          {/* Sticky Bottom Navigation */}
          <div className="sticky bottom-0 z-30 bg-white py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={currentStep === 4 ? handleSubmit : handleNext}
                disabled={isLoading || !validateCurrentStep()}
                className="inline-flex items-center px-5 py-2 text-sm font-medium rounded-md text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: color.primary.action }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {currentStep === 4
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : "Loading..."}
                  </>
                ) : currentStep === 4 ? (
                  isEditMode ? (
                    "Update Campaign"
                  ) : (
                    "Create Campaign"
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
