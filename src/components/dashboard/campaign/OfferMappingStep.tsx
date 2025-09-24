import { useState } from 'react';
import { ArrowRight, ArrowLeft, Gift, Target, Users, X } from 'lucide-react';
import { CreateCampaignRequest, CampaignSegment, CampaignOffer } from '../../../types/campaign';
import OfferSelectionModal from './OfferSelectionModal';
import CreateOfferModalWrapper from './CreateOfferModalWrapper';

interface OfferMappingStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  formData: CreateCampaignRequest;
  setFormData: (data: CreateCampaignRequest) => void;
  selectedSegments: CampaignSegment[];
  selectedOffers: CampaignOffer[];
  setSelectedOffers: (offers: CampaignOffer[]) => void;
}


export default function OfferMappingStep({
  onNext,
  onPrev,
  formData,
  setFormData,
  selectedSegments,
  selectedOffers,
  setSelectedOffers
}: OfferMappingStepProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
  const [offerMappings, setOfferMappings] = useState<{[segmentId: string]: {offerIds: string[], priority: number}}>({});
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedSegments.length > 0 && Object.keys(offerMappings).length > 0) {
      // Update formData with offer-segment mappings
      const offerMappingsList: any[] = [];
      Object.entries(offerMappings).forEach(([segmentId, mapping]) => {
        mapping.offerIds.forEach(offerId => {
          offerMappingsList.push({
            offer_id: offerId,
            segment_ids: [segmentId],
            priority: mapping.priority
          });
        });
      });
      setFormData({
        ...formData,
        offers: offerMappingsList
      });
      onNext();
    }
  };

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




  const isFormValid = selectedSegments.length > 0 && selectedSegments.every(segment => 
    offerMappings[segment.id] && offerMappings[segment.id].offerIds.length > 0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Selection & Mapping</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select offers and map them to your audience segments
        </p>
      </div>


      {/* Segment to Offer Mappings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Segment to Offer Mappings</h3>
        </div>

        {selectedSegments.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No segments available</h3>
            <p className="text-gray-500 mb-4">Please select audience segments in the previous step to map offers</p>
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
                      <div className="w-10 h-10 bg-[#588157] rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
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
                      className="text-[#588157] hover:text-[#3A5A40] hover:bg-[#588157]/10 px-3 py-1.5 rounded-md border border-[#588157]/30 hover:border-[#588157] flex items-center space-x-1.5 transition-all text-sm font-medium"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Add Offer</span>
                    </button>
                  </div>

                  {/* Mapped Offers */}
                  {segmentOffers.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Mapped Offers:</h5>
                      <div className="flex flex-wrap gap-2">
                        {segmentOffers.map((offer) => (
                          <div key={offer.id} className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 flex items-center space-x-2 group">
                            <Gift className="w-3 h-3 text-purple-600" />
                            <span className="text-sm text-purple-800">{offer.name}</span>
                            <button
                              onClick={() => handleRemoveOfferFromSegment(segment.id, offer.id)}
                              className="opacity-0 group-hover:opacity-100 text-purple-400 hover:text-purple-600 transition-all"
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


      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="px-6 py-2 border border-[#A3B18A] text-[#3A5A40] rounded-lg hover:bg-[#DAD7CD] flex items-center space-x-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!isFormValid}
          className="px-6 py-2 bg-[#588157] hover:bg-[#3A5A40] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center space-x-2 transition-colors"
        >
          Next Step
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
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
