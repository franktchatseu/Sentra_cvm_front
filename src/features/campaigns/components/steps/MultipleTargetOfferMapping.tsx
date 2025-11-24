import { useState } from "react";
import { Gift, Users, Plus, X } from "lucide-react";
import { CampaignSegment, CampaignOffer } from "../../types/campaign";
import OfferSelectionModal from "./OfferSelectionModal";
import { color, tw, components } from "../../../../shared/utils/utils";
import { SegmentOfferMapping } from "../../pages/CreateCampaignPage";

interface MultipleTargetOfferMappingProps {
  selectedSegments: CampaignSegment[];
  segmentOfferMappings: SegmentOfferMapping[];
  setSegmentOfferMappings: (mappings: SegmentOfferMapping[]) => void;
  selectedOffers: CampaignOffer[];
  setSelectedOffers: (offers: CampaignOffer[]) => void;
}

export default function MultipleTargetOfferMapping({
  selectedSegments,
  segmentOfferMappings,
  setSegmentOfferMappings,
  selectedOffers,
  setSelectedOffers,
}: MultipleTargetOfferMappingProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);

  const handleAddOffer = (segmentId: string) => {
    setEditingSegmentId(segmentId);
    setShowOfferModal(true);
  };

  const handleOfferSelect = (offers: CampaignOffer[]) => {
    if (!editingSegmentId) return;

    // For each selected offer, create or update a mapping
    offers.forEach((offer) => {
      // Check if mapping already exists
      const existingMappingIndex = segmentOfferMappings.findIndex(
        (m) =>
          m.segment_id === editingSegmentId && m.offer_id === parseInt(offer.id)
      );

      if (existingMappingIndex === -1) {
        // Add new mapping
        setSegmentOfferMappings([
          ...segmentOfferMappings,
          {
            segment_id: editingSegmentId,
            offer_id: parseInt(offer.id),
          },
        ]);
      }

      // Add to selected offers if not already present
      if (!selectedOffers.find((o) => o.id === offer.id)) {
        setSelectedOffers([...selectedOffers, offer]);
      }
    });

    setShowOfferModal(false);
    setEditingSegmentId(null);
  };

  const handleRemoveMapping = (segmentId: string, offerId: number) => {
    // Remove mapping
    setSegmentOfferMappings(
      segmentOfferMappings.filter(
        (m) => !(m.segment_id === segmentId && m.offer_id === offerId)
      )
    );

    // Check if this offer is used by any other segment
    const offerUsedElsewhere = segmentOfferMappings.some(
      (m) => m.offer_id === offerId && m.segment_id !== segmentId
    );

    // If not used elsewhere, remove from selectedOffers
    if (!offerUsedElsewhere) {
      setSelectedOffers(
        selectedOffers.filter((o) => parseInt(o.id) !== offerId)
      );
    }
  };

  const getOffersForSegment = (segmentId: string): CampaignOffer[] => {
    const mappings = segmentOfferMappings.filter(
      (m) => m.segment_id === segmentId
    );
    return mappings
      .map((m) => selectedOffers.find((o) => parseInt(o.id) === m.offer_id))
      .filter(Boolean) as CampaignOffer[];
  };

  return (
    <div className="space-y-4">
      {/* Segment to Offer Mappings */}
      <div className="space-y-3">
        {selectedSegments.length === 0 ? (
          <div className={components.card.surface}>
            <p className={`${tw.caption} ${tw.textSecondary} text-center py-8`}>
              No segments selected. Please add segments in the Audience step
              first.
            </p>
          </div>
        ) : (
          selectedSegments.map((segment) => {
            const mappedOffers = getOffersForSegment(segment.id);

            return (
              <div key={segment.id} className={components.card.surface}>
                {/* Segment Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: `${color.primary.accent}20` }}
                    >
                      <Users
                        className="w-5 h-5"
                        style={{ color: color.primary.accent }}
                      />
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${tw.textPrimary}`}>
                        {segment.name}
                      </h4>
                      <p className={`text-xs ${tw.textSecondary}`}>
                        {segment.customer_count?.toLocaleString() || "0"}{" "}
                        customers
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddOffer(segment.id)}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md`}
                    style={{
                      backgroundColor: color.primary.action,
                      color: "white",
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Offer
                  </button>
                </div>

                {/* Mapped Offers */}
                <div>
                  <div
                    className={`text-xs font-medium ${tw.textSecondary} mb-2`}
                  >
                    Mapped Offers:
                  </div>
                  {mappedOffers.length === 0 ? (
                    <div
                      className="text-center py-4 border-2 border-dashed rounded-md"
                      style={{ borderColor: color.border.default }}
                    >
                      <p className={`text-xs ${tw.textSecondary}`}>
                        No offers mapped to this segment
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {mappedOffers.map((offer) => (
                        <div
                          key={offer.id}
                          className="flex items-center justify-between p-3 rounded-md"
                          style={{ backgroundColor: color.surface.cards }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-md flex items-center justify-center"
                              style={{
                                backgroundColor: `${color.tertiary.tag1}20`,
                              }}
                            >
                              <Gift
                                className="w-4 h-4"
                                style={{ color: color.tertiary.tag1 }}
                              />
                            </div>
                            <div>
                              <div
                                className={`text-sm font-medium ${tw.textPrimary}`}
                              >
                                {offer.name}
                              </div>
                              <div className={`text-xs ${tw.textSecondary}`}>
                                {offer.reward_value} • {offer.validity_period}d
                                validity
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveMapping(
                                segment.id,
                                parseInt(offer.id)
                              )
                            }
                            className="p-1.5 rounded-md"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Offer Selection Modal */}
      <OfferSelectionModal
        isOpen={showOfferModal}
        onClose={() => {
          setShowOfferModal(false);
          setEditingSegmentId(null);
        }}
        onSelect={handleOfferSelect}
        selectedOffers={
          editingSegmentId ? getOffersForSegment(editingSegmentId) : []
        }
      />
    </div>
  );
}
