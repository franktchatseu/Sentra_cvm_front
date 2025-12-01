import { useState, useEffect, useRef } from "react";
import { Gift } from "lucide-react";
import {
  CreateCampaignRequest,
  CampaignSegment,
  CampaignOffer,
  SequentialOfferMapping,
  ControlGroup,
} from "../../types/campaign";
import OfferSelectionModal from "./OfferSelectionModal";
import OfferFlowChart from "./OfferFlowChart";
import ChampionChallengerOfferMapping from "../displays/ChampionChallengerOfferMapping";
import ABTestOfferMapping from "../displays/ABTestOfferMapping";
import MultipleTargetOfferMapping from "./MultipleTargetOfferMapping";
import { SegmentOfferMapping } from "../../pages/CreateCampaignPage";

interface OfferMappingStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  formData: CreateCampaignRequest;
  setFormData: (data: CreateCampaignRequest) => void;
  selectedSegments: CampaignSegment[];
  selectedOffers: CampaignOffer[];
  setSelectedOffers: (offers: CampaignOffer[]) => void;
  segmentOfferMappings?: SegmentOfferMapping[];
  setSegmentOfferMappings?: (mappings: SegmentOfferMapping[]) => void;
  controlGroup: ControlGroup;
  setControlGroup: (group: ControlGroup) => void;
  isLoading?: boolean;
  onSaveDraft?: () => void;
  onCancel?: () => void;
  validationErrors?: { [key: string]: string };
  clearValidationErrors?: () => void;
}

export default function OfferMappingStep({
  formData,
  selectedSegments,
  selectedOffers,
  setSelectedOffers,
  segmentOfferMappings = [],
  setSegmentOfferMappings,
  controlGroup,
  validationErrors = {},
  clearValidationErrors,
}: OfferMappingStepProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const hasAutoOpenedRef = useRef(false);
  const [offerMappings, setOfferMappings] = useState<{
    [segmentId: string]: CampaignOffer[];
  }>({});
  const [sequentialMappings, setSequentialMappings] = useState<
    SequentialOfferMapping[]
  >([]);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);

  const isRoundRobinOrMultiLevel =
    formData.campaign_type === "round_robin" ||
    formData.campaign_type === "multiple_level";

  // Auto-open modal when returning from offer creation (only once)
  useEffect(() => {
    // Check if we've already tried to auto-open (using sessionStorage to persist across remounts)
    const autoOpenedKey = "offerModalAutoOpened";
    const hasAutoOpened = sessionStorage.getItem(autoOpenedKey) === "true";

    // Check if we have newly created offers and haven't auto-opened the modal yet
    if (
      !hasAutoOpened &&
      !hasAutoOpenedRef.current &&
      selectedSegments.length > 0
    ) {
      const campaignFlowOffersStr = sessionStorage.getItem(
        "campaignFlowCreatedOffers"
      );
      const campaignFlowOfferIds: number[] = campaignFlowOffersStr
        ? JSON.parse(campaignFlowOffersStr)
        : [];

      // Check if there's a newly created offer that's not already selected
      const hasNewOffer =
        campaignFlowOfferIds.length > 0 &&
        campaignFlowOfferIds.some(
          (offerId) => !selectedOffers.some((o) => o.id === String(offerId))
        );

      // Only auto-open if there are newly created offers that aren't already selected
      if (hasNewOffer) {
        // Mark as attempted immediately to prevent loops
        hasAutoOpenedRef.current = true;
        sessionStorage.setItem(autoOpenedKey, "true");

        // Determine which segment to map to
        let segmentToMap: string | null = null;

        if (isRoundRobinOrMultiLevel && selectedSegments.length > 0) {
          // For Round Robin/Multiple Level, use the first segment
          segmentToMap = selectedSegments[0].id;
        } else if (
          formData.campaign_type === "multiple_target_group" &&
          selectedSegments.length > 0
        ) {
          // For Multiple Target Group, use the first segment
          segmentToMap = selectedSegments[0].id;
        } else if (
          formData.campaign_type === "champion_challenger" &&
          selectedSegments.length > 0
        ) {
          // For Champion-Challenger, use the champion (priority 1) or first segment
          const champion = selectedSegments.find((s) => s.priority === 1);
          segmentToMap = champion?.id || selectedSegments[0].id;
        } else if (
          formData.campaign_type === "ab_test" &&
          selectedSegments.length > 0
        ) {
          // For A/B Test, use the first segment
          segmentToMap = selectedSegments[0].id;
        }

        if (segmentToMap) {
          // Use a small delay to ensure the component is fully mounted
          const timer = setTimeout(() => {
            setEditingSegmentId(segmentToMap);
            setShowOfferModal(true);
          }, 300);

          return () => clearTimeout(timer);
        }
      }
    }
  }, [
    selectedSegments,
    selectedOffers,
    formData.campaign_type,
    isRoundRobinOrMultiLevel,
  ]);

  const syncSelectedOffersFromMappings = (
    mappings: Record<string, CampaignOffer[]>
  ) => {
    const uniqueOffers = new Map<string, CampaignOffer>();
    Object.values(mappings).forEach((offers) => {
      offers.forEach((offer) => {
        if (offer.id) {
          uniqueOffers.set(offer.id, offer);
        }
      });
    });
    setSelectedOffers(Array.from(uniqueOffers.values()));
  };

  const handleOfferSelect = (offers: CampaignOffer[]) => {
    // Clear validation errors when offers are selected
    if (clearValidationErrors) {
      clearValidationErrors();
    }

    if (isRoundRobinOrMultiLevel && selectedSegments.length > 0) {
      // For Round Robin/Multiple Level: add offers sequentially
      const segmentId = selectedSegments[0].id;
      offers.forEach((offer) => {
        if (!selectedOffers.find((o) => o.id === offer.id)) {
          const newMapping: SequentialOfferMapping = {
            offer_id: offer.id,
            segment_id: segmentId,
            sequence_order: sequentialMappings.length + 1,
            ...(formData.campaign_type === "round_robin" && {
              interval_config: { interval_type: "days", interval_value: 1 },
            }),
            ...(formData.campaign_type === "multiple_level" && {
              condition_config: {
                condition_type: "customer_attribute",
                operator: "equals",
                field: "",
                value: "",
              },
            }),
          };
          setSequentialMappings((prev) => [...prev, newMapping]);
        }
      });

      // Add to selected offers
      const newOffers = [...selectedOffers];
      offers.forEach((offer) => {
        if (!newOffers.find((o) => o.id === offer.id)) {
          newOffers.push(offer);
        }
      });
      setSelectedOffers(newOffers);
    } else if (editingSegmentId && offers.length > 0) {
      // For other types: map all selected offers to the current segment
      setOfferMappings((prev) => {
        const updatedMappings = {
          ...prev,
          [editingSegmentId]: offers,
        };
        syncSelectedOffersFromMappings(updatedMappings);
        return updatedMappings;
      });
    }
    setShowOfferModal(false);
    setEditingSegmentId(null);
  };

  const handleRemoveOfferFromSegment = (segmentId: string, offerId: string) => {
    const currentMapping = offerMappings[segmentId];
    if (currentMapping) {
      const updatedOffers = currentMapping.filter(
        (offer) => offer.id !== offerId
      );

      const newMappings = { ...offerMappings };
      if (updatedOffers.length > 0) {
        newMappings[segmentId] = updatedOffers;
      } else {
        delete newMappings[segmentId];
      }

      setOfferMappings(newMappings);
      syncSelectedOffersFromMappings(newMappings);
    }
  };

  // Transform offerMappings for specialized components (extract offerIds only)
  const simplifiedOfferMappings: { [segmentId: string]: string[] } = {};
  Object.keys(offerMappings).forEach((segmentId) => {
    simplifiedOfferMappings[segmentId] = offerMappings[segmentId].map(
      (offer) => offer.id
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Offer Selection & Mapping
        </h2>
        <p className="text-sm text-gray-600">
          {isRoundRobinOrMultiLevel
            ? `Configure offers with ${
                formData.campaign_type === "round_robin"
                  ? "time intervals"
                  : "conditions"
              } for sequential delivery`
            : "Select offers and map them to your audience segments"}
        </p>
      </div>

      {/* Champion-Challenger Offer Mapping */}
      {formData.campaign_type === "champion_challenger" && (
        <ChampionChallengerOfferMapping
          champion={selectedSegments.find((s) => s.priority === 1) || null}
          challengers={selectedSegments.filter((s) => s.priority !== 1)}
          selectedOffers={selectedOffers}
          offerMappings={simplifiedOfferMappings}
          onMapOffers={(segmentId) => {
            setEditingSegmentId(segmentId);
            setShowOfferModal(true);
          }}
          onRemoveOfferFromSegment={handleRemoveOfferFromSegment}
        />
      )}

      {/* A/B Test Offer Mapping */}
      {formData.campaign_type === "ab_test" && (
        <ABTestOfferMapping
          variantA={selectedSegments[0] || null}
          variantB={selectedSegments[1] || null}
          selectedOffers={selectedOffers}
          offerMappings={simplifiedOfferMappings}
          onMapOffers={(segmentId) => {
            setEditingSegmentId(segmentId);
            setShowOfferModal(true);
          }}
          onRemoveOfferFromSegment={handleRemoveOfferFromSegment}
        />
      )}

      {/* Flow Chart for Round Robin and Multiple Level */}
      {isRoundRobinOrMultiLevel && selectedSegments.length > 0 && (
        <OfferFlowChart
          campaignType={
            formData.campaign_type as "round_robin" | "multiple_level"
          }
          segment={selectedSegments[0]}
          selectedOffers={selectedOffers}
          offerMappings={sequentialMappings}
          onUpdateMappings={setSequentialMappings}
          onAddOffer={() => setShowOfferModal(true)}
        />
      )}

      {/* Multiple Target Group - Use specialized component */}
      {formData.campaign_type === "multiple_target_group" &&
        setSegmentOfferMappings && (
          <MultipleTargetOfferMapping
            selectedSegments={selectedSegments}
            segmentOfferMappings={segmentOfferMappings}
            setSegmentOfferMappings={setSegmentOfferMappings}
            selectedOffers={selectedOffers}
            setSelectedOffers={setSelectedOffers}
          />
        )}

      {/* Empty State for Types without Segments */}
      {!isRoundRobinOrMultiLevel &&
        formData.campaign_type !== "multiple_target_group" &&
        selectedSegments.length === 0 && (
          <div
            className={`border-2 border-dashed rounded-md p-12 ${
              validationErrors.offers
                ? "border-red-300 bg-red-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="text-center text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No segments configured</p>
              <p className="text-sm mt-1">
                Please configure your segments in the previous step.
              </p>
            </div>
          </div>
        )}

      {/* Validation Error Message */}
      {validationErrors.offers && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{validationErrors.offers}</p>
        </div>
      )}

      {/* Offer Selection Modal */}
      {showOfferModal && (
        <OfferSelectionModal
          isOpen={showOfferModal}
          onClose={() => {
            setShowOfferModal(false);
            setEditingSegmentId(null);
          }}
          onSelect={handleOfferSelect}
          selectedOffers={
            editingSegmentId ? offerMappings[editingSegmentId] || [] : []
          }
          onCreateNew={() => {
            // Navigation is handled inside OfferSelectionModal
            setShowOfferModal(false);
          }}
          onSaveCampaignData={() => {
            // Save campaign form data to sessionStorage before navigating
            try {
              const campaignData = {
                formData: JSON.parse(JSON.stringify(formData)),
                selectedSegments: JSON.parse(JSON.stringify(selectedSegments)),
                selectedOffers: JSON.parse(JSON.stringify(selectedOffers)),
                segmentOfferMappings: JSON.parse(
                  JSON.stringify(segmentOfferMappings)
                ),
                controlGroup: JSON.parse(JSON.stringify(controlGroup)),
                currentStep: 3,
              };
              console.log(
                "Saving campaign data before navigating:",
                campaignData
              );
              sessionStorage.setItem(
                "campaignFormData",
                JSON.stringify(campaignData)
              );
            } catch (error) {
              console.error("Error saving campaign data:", error);
            }
          }}
        />
      )}
    </div>
  );
}
