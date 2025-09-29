import { useState } from 'react';
import { Gift, Plus, Edit, Trash2, Target, AlertCircle, Link, Copy, Save, X, Check } from 'lucide-react';
import { CreateCampaignRequest, CampaignSegment, CampaignOffer } from '../../../types/campaign';
import OfferSelectionModal from './OfferSelectionModal';
import CreateOfferModalWrapper from './CreateOfferModalWrapper';
import { tw } from '../../../design/utils';
import StepNavigation from '../../ui/StepNavigation';

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
  const [offerMappings, setOfferMappings] = useState<{ [offerId: string]: { segmentIds: string[], priority: number } }>({});
  const [editingOffer, setEditingOffer] = useState<string | null>(null);
  const [editingOfferData, setEditingOfferData] = useState<Partial<CampaignOffer>>({});

  const handleNext = () => {
    if (selectedOffers.length > 0 && Object.keys(offerMappings).length > 0) {
      // Update formData with offer mappings
      setFormData({
        ...formData,
        offers: Object.keys(offerMappings).map(offerId => ({
          offer_id: offerId,
          segment_ids: offerMappings[offerId].segmentIds,
          priority: offerMappings[offerId].priority
        }))
      });
      onNext();
    }
  };

  const handleOfferSelect = (offers: CampaignOffer[]) => {
    setSelectedOffers(offers);
    setShowOfferModal(false);
  };

  const handleEditOffer = (offerId: string) => {
    const offer = selectedOffers.find(o => o.id === offerId);
    if (offer) {
      setEditingOffer(offerId);
      setEditingOfferData({ ...offer });
    }
  };

  const handleSaveEdit = () => {
    if (editingOffer && editingOfferData) {
      const updatedOffers = selectedOffers.map(offer =>
        offer.id === editingOffer
          ? { ...offer, ...editingOfferData }
          : offer
      );
      setSelectedOffers(updatedOffers);
      setEditingOffer(null);
      setEditingOfferData({});
    }
  };

  const handleCancelEdit = () => {
    setEditingOffer(null);
    setEditingOfferData({});
  };

  const handleDuplicateOffer = (offer: CampaignOffer) => {
    const duplicatedOffer: CampaignOffer = {
      ...offer,
      id: `${offer.id}-copy-${Date.now()}`,
      name: `${offer.name} (Copie)`,
    };
    setSelectedOffers([...selectedOffers, duplicatedOffer]);
  };

  const handleDeleteOffer = (offerId: string) => {
    setSelectedOffers(selectedOffers.filter(offer => offer.id !== offerId));
    // Remove from mappings as well
    const newMappings = { ...offerMappings };
    delete newMappings[offerId];
    setOfferMappings(newMappings);
  };

  const updateOfferMapping = (offerId: string, segmentIds: string[]) => {
    setOfferMappings(prev => ({
      ...prev,
      [offerId]: { segmentIds, priority: 1 }
    }));
  };

  const toggleSegmentForOffer = (offerId: string, segmentId: string) => {
    const currentMapping = offerMappings[offerId] || { segmentIds: [], priority: 1 };
    const isSelected = currentMapping.segmentIds.includes(segmentId);

    if (isSelected) {
      updateOfferMapping(offerId, currentMapping.segmentIds.filter(id => id !== segmentId));
    } else {
      updateOfferMapping(offerId, [...currentMapping.segmentIds, segmentId]);
    }
  };

  const getSegmentName = (segmentId: string) => {
    return selectedSegments.find(s => s.id === segmentId)?.name || 'Unknown Segment';
  };

  const getMappedSegmentsForOffer = (offerId: string) => {
    return offerMappings[offerId]?.segmentIds || [];
  };

  const getEstimatedReach = (segmentIds: string[]) => {
    return selectedSegments
      .filter(segment => segmentIds.includes(segment.id))
      .reduce((total, segment) => total + segment.customer_count, 0);
  };

  const isFormValid = selectedOffers.length > 0 && Object.values(offerMappings).every(mapping => mapping.segmentIds.length > 0);

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

      {/* Selected Segments Summary */}
      {selectedSegments.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <Target className="w-4 h-4 text-emerald-600 mr-2" />
              Available Segments ({selectedSegments.length})
            </h3>
            <div className="text-xs text-gray-500">
              Total: {selectedSegments.reduce((total, segment) => total + segment.customer_count, 0).toLocaleString()} customers
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSegments.map((segment) => (
              <div key={segment.id} className="inline-flex items-center bg-white rounded-full px-3 py-1.5 border border-emerald-200 shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                <span className="font-medium text-gray-900 text-xs">{segment.name}</span>
                <span className="text-xs text-gray-500 ml-2">({segment.customer_count.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Offers and Mappings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Offer Mappings</h3>
          {selectedOffers.length > 0 && (
            <button
              onClick={() => setShowOfferModal(true)}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${tw.button.primary}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Offers
            </button>
          )}
        </div>

        {selectedOffers.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers selected</h3>
            <p className="text-gray-500 mb-4">Select offers to include in your campaign</p>
            <button
              onClick={() => setShowOfferModal(true)}
              className="inline-flex items-center px-4 py-2 bg-[#3b8169] text-white rounded-lg hover:bg-[#2d5f4e] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Select Offers
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedOffers.map((offer) => {
              const mappedSegmentIds = getMappedSegmentsForOffer(offer.id);
              const estimatedReach = getEstimatedReach(mappedSegmentIds);
              const isEditing = editingOffer === offer.id;

              return (
                <div
                  key={offer.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Gift className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editingOfferData.name || offer.name}
                              onChange={(e) => setEditingOfferData({ ...editingOfferData, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                              placeholder="Nom de l'offre"
                            />
                            <textarea
                              value={editingOfferData.description || offer.description}
                              onChange={(e) => setEditingOfferData({ ...editingOfferData, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                              rows={2}
                              placeholder="Description de l'offre"
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="inline-flex items-center px-3 py-1 bg-[#3b8169] text-white text-sm rounded-lg hover:bg-[#2d5f4e] transition-colors"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Sauvegarder
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="inline-flex items-center px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-semibold text-gray-900">{offer.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{offer.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {offer.reward_type}
                              </span>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                {offer.offer_type}
                              </span>
                              <span className="text-sm font-medium text-[#3b8169]">
                                {offer.reward_value}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {!isEditing && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditOffer(offer.id)}
                          className="p-2 text-gray-400 hover:text-[#3b8169] transition-colors"
                          title="Éditer l'offre"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateOffer(offer)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Dupliquer l'offre"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer l'offre"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Segment Mapping */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Link className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Mapped to Segments</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Segments
                        </label>
                        <div className="space-y-2">
                          {selectedSegments.map((segment) => (
                            <label key={segment.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={mappedSegmentIds.includes(segment.id)}
                                onChange={() => toggleSegmentForOffer(offer.id, segment.id)}
                                className="w-4 h-4 text-[#3b8169] border-gray-300 rounded focus:ring-[#3b8169]"
                              />
                              <div className="flex items-center space-x-2 flex-1">
                                <Target className="w-3 h-3 text-blue-600" />
                                <span className="text-sm text-gray-700 font-medium">{segment.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({segment.customer_count.toLocaleString()})
                                </span>
                              </div>
                              {mappedSegmentIds.includes(segment.id) && (
                                <Check className="w-4 h-4 text-[#3b8169]" />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Estimated Reach */}
                    {mappedSegmentIds.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Portée estimée:</span>
                          <span className="text-sm font-semibold text-[#3b8169]">
                            {estimatedReach.toLocaleString()} clients
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mapping Validation */}
      {selectedOffers.length > 0 && (
        <div className="space-y-4">
          {Object.values(offerMappings).some(mapping => mapping.segmentIds.length === 0) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-900">Offres non associées</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Certaines offres ne sont associées à aucun segment. Veuillez associer toutes les offres à au moins un segment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mapping Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Mapping Summary</h4>
            <div className="space-y-2">
              {Object.entries(offerMappings).map(([offerId, mapping]) => {
                const offer = selectedOffers.find(o => o.id === offerId);
                if (!offer || mapping.segmentIds.length === 0) return null;

                return (
                  <div key={offerId} className="text-sm text-blue-700">
                    <span className="font-medium">{offer.name}</span> → {' '}
                    {mapping.segmentIds.map(segmentId => getSegmentName(segmentId)).join(', ')}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <StepNavigation
        onNext={handleNext}
        onPrev={onPrev}
        isNextDisabled={!isFormValid}
      />

      {/* Offer Selection Modal */}
      {showOfferModal && (
        <OfferSelectionModal
          isOpen={showOfferModal}
          onClose={() => {
            setShowOfferModal(false);
            setEditingOffer(null);
          }}
          onSelect={handleOfferSelect}
          selectedOffers={selectedOffers}
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
