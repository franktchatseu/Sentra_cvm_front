import { useState } from 'react';
import { Gift, Users, X, Target } from 'lucide-react';
import { CampaignSegment, CampaignOffer } from '../../types/campaign';
import OfferSelectionModal from './OfferSelectionModal';
import CreateOfferModalWrapper from './CreateOfferModalWrapper';
import { color } from '../../../../shared/utils/utils';

interface OfferMappingStepProps {
  selectedSegments: CampaignSegment[];
  selectedOffers: CampaignOffer[];
  setSelectedOffers: (offers: CampaignOffer[]) => void;
}


export default function OfferMappingStep({
  selectedSegments,
  selectedOffers,
  setSelectedOffers
}: OfferMappingStepProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
  const [offerMappings, setOfferMappings] = useState<{ [segmentId: string]: { offerIds: string[], priority: number } }>({});
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);


  const handleOfferSelect = (offers: CampaignOffer[]) => {
    if (editingSegmentId && offers.length > 0) {
      // Map all selected offers to the current segment
      setOfferMappings(prev => ({
        ...prev,
        [editingSegmentId]: {
          offerIds: offers.map(o => o.id),
          priority: 1
        }
      }));

      // Add to selected offers if not already present
      const newOffers = [...selectedOffers];
      offers.forEach(offer => {
        if (!newOffers.find(o => o.id === offer.id)) {
          newOffers.push(offer);
        }
      });
      setSelectedOffers(newOffers);
    }
    setShowOfferModal(false);
    setEditingSegmentId(null);
  };

  const handleRemoveOfferFromSegment = (segmentId: string, offerId: string) => {
    const currentMapping = offerMappings[segmentId];
    if (currentMapping) {
      const updatedOfferIds = currentMapping.offerIds.filter(id => id !== offerId);

      if (updatedOfferIds.length > 0) {
        // Update mapping with remaining offers
        setOfferMappings(prev => ({
          ...prev,
          [segmentId]: {
            ...currentMapping,
            offerIds: updatedOfferIds
          }
        }));
      } else {
        // Remove mapping entirely if no offers left
        const newMappings = { ...offerMappings };
        delete newMappings[segmentId];
        setOfferMappings(newMappings);
      }
    }
  };




  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Offer Selection & Mapping</h2>
        <p className="text-sm text-gray-600">
          Select offers and map them to your audience segments
        </p>
      </div>


      {/* Segment to Offer Mappings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Segment to Offer Mappings</h3>
        </div>

        {selectedSegments.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Segments Available</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md text-center">
                Please select audience segments in the previous step before mapping offers to them.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedSegments.map((segment) => {
              const mappedOffers = offerMappings[segment.id]?.offerIds || [];
              const segmentOffers = mappedOffers.map(offerId => selectedOffers.find(o => o.id === offerId)).filter((offer): offer is CampaignOffer => offer !== undefined);

              return (
                <div key={segment.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color.entities.segments }}>
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {segment.customer_count.toLocaleString()} customers
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingSegmentId(segment.id);
                        setShowOfferModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-[#3A5A40] hover:bg-[#2f4a35] text-white rounded-md text-sm font-medium transition-colors"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      <span>Add Offer</span>
                    </button>
                  </div>

                  {/* Mapped Offers */}
                  {segmentOffers.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Mapped Offers:</h5>
                      <div className="flex flex-wrap gap-2">
                        {segmentOffers.map((offer) => (
                          <div key={offer.id} className="rounded-lg px-3 py-2 flex items-center space-x-2 group border" style={{ backgroundColor: `${color.entities.offers}10`, borderColor: `${color.entities.offers}40` }}>
                            <Gift className="w-3 h-3" style={{ color: color.entities.offers }} />
                            <span className="text-sm font-medium" style={{ color: color.entities.offers }}>{offer.name}</span>
                            <button
                              onClick={() => handleRemoveOfferFromSegment(segment.id, offer.id)}
                              className="opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all"
                              style={{ color: `${color.entities.offers}80` }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Offer Selection Modal */}
      {showOfferModal && (
        <OfferSelectionModal
          isOpen={showOfferModal}
          onClose={() => {
            setShowOfferModal(false);
            setEditingSegmentId(null);
          }}
          onSelect={handleOfferSelect}
          selectedOffers={editingSegmentId ? (offerMappings[editingSegmentId]?.offerIds.map(id => selectedOffers.find(o => o.id === id)).filter((offer): offer is CampaignOffer => offer !== undefined) || []) : []}
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
