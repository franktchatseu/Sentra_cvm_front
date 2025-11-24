import { useState } from "react";
import { Gift, Target, Users, X } from "lucide-react";
import {
  CreateCampaignRequest,
  CampaignSegment,
  CampaignOffer,
  SequentialOfferMapping,
  ControlGroup,
} from "../../types/campaign";
import OfferSelectionModal from "./OfferSelectionModal";
import CreateOfferModalWrapper from "./CreateOfferModalWrapper";
import OfferFlowChart from "./OfferFlowChart";
import ChampionChallengerOfferMapping from "../displays/ChampionChallengerOfferMapping";
import ABTestOfferMapping from "../displays/ABTestOfferMapping";
import MultipleTargetOfferMapping from "./MultipleTargetOfferMapping";
import { color } from "../../../../shared/utils/utils";
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
}

export default function OfferMappingStep({
  currentStep: _currentStep,
  totalSteps: _totalSteps,
  onNext,
  onPrev,
  onSubmit: _onSubmit,
  formData,
  setFormData,
  selectedSegments,
  selectedOffers,
  setSelectedOffers,
  segmentOfferMappings = [],
  setSegmentOfferMappings,
  controlGroup: _controlGroup,
  setControlGroup: _setControlGroup,
  isLoading: _isLoading,
  onSaveDraft: _onSaveDraft,
  onCancel: _onCancel,
}: OfferMappingStepProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
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

  const handleNext = () => {
    if (isRoundRobinOrMultiLevel) {
      // For Round Robin and Multiple Level, use sequential mappings
      if (selectedSegments.length > 0 && sequentialMappings.length > 0) {
        const offerMappingsList = sequentialMappings.map((mapping) => ({
          offer_id: mapping.offer_id,
          segment_ids: [mapping.segment_id],
          priority: mapping.sequence_order,
        }));
        setFormData({
          ...formData,
          offers: offerMappingsList,
        });
        onNext();
      }
    } else {
      // For other types, use standard mappings
      if (
        selectedSegments.length > 0 &&
        Object.keys(offerMappings).length > 0
      ) {
        const offerMappingsList: {
          offer_id: string;
          segment_ids: string[];
          priority: number;
        }[] = [];
        Object.entries(offerMappings).forEach(([segmentId, offers]) => {
          offers.forEach((offer) => {
            offerMappingsList.push({
              offer_id: offer.id,
              segment_ids: [segmentId],
              priority: 1,
            });
          });
        });
        setFormData({
          ...formData,
          offers: offerMappingsList,
        });
        onNext();
      }
    }
  };

  const handleOfferSelect = (offers: CampaignOffer[]) => {
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

  const isFormValid = isRoundRobinOrMultiLevel
    ? selectedSegments.length > 0 && sequentialMappings.length > 0
    : selectedSegments.length > 0 &&
      selectedSegments.every((segment) => offerMappings[segment.id]?.length);

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
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-12">
            <div className="text-center text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No segments configured</p>
              <p className="text-sm mt-1">
                Please configure your segments in the previous step.
              </p>
            </div>
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
            setShowOfferModal(false);
            setShowCreateOfferModal(true);
          }}
        />
      )}

      {/* Create Offer Modal */}
      {showCreateOfferModal && (
        <CreateOfferModalWrapper
          isOpen={showCreateOfferModal}
          onClose={() => setShowCreateOfferModal(false)}
          onOfferCreated={() => {
            // Handle the newly created offer
            setShowCreateOfferModal(false);
            // Optionally refresh offers list or add to selected offers
          }}
        />
      )}
    </div>
  );
}
