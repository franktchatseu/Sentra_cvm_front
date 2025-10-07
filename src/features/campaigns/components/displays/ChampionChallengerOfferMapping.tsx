import { Award, Target, Gift, Plus, X, ArrowRight } from 'lucide-react';
import { CampaignSegment, CampaignOffer } from '../../types/campaign';

interface ChampionChallengerOfferMappingProps {
  champion: CampaignSegment | null;
  challengers: CampaignSegment[];
  selectedOffers: CampaignOffer[];
  offerMappings: { [segmentId: string]: string[] }; // segmentId -> offerIds[]
  onMapOffers: (segmentId: string) => void;
  onRemoveOfferFromSegment: (segmentId: string, offerId: string) => void;
}

export default function ChampionChallengerOfferMapping({
  champion,
  challengers,
  selectedOffers,
  offerMappings,
  onMapOffers,
  onRemoveOfferFromSegment
}: ChampionChallengerOfferMappingProps) {

  const getOffersForSegment = (segmentId: string) => {
    const offerIds = offerMappings[segmentId] || [];
    return selectedOffers.filter(offer => offerIds.includes(offer.id));
  };

  const hasOffersForSegment = (segmentId: string) => {
    return offerMappings[segmentId] && offerMappings[segmentId].length > 0;
  };

  if (!champion) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12">
        <div className="text-center text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">No Champion segment configured</p>
          <p className="text-sm mt-1">Please configure your Champion segment in the previous step.</p>
        </div>
      </div>
    );
  }

  const allSegments = [champion, ...challengers];
  const totalMappedSegments = allSegments.filter(s => hasOffersForSegment(s.id)).length;
  const totalOffersMapped = Object.values(offerMappings).flat().length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-[#588157]">
              {totalMappedSegments}/{allSegments.length}
            </div>
            <div className="text-sm text-gray-600">Segments Mapped</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#588157]">
              {totalOffersMapped}
            </div>
            <div className="text-sm text-gray-600">Total Offer Mappings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#588157]">
              {selectedOffers.length}
            </div>
            <div className="text-sm text-gray-600">Available Offers</div>
          </div>
        </div>
      </div>

      {/* Champion Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-[#588157]" />
          <h3 className="text-lg font-semibold text-gray-900">Champion Offers</h3>
        </div>

        <div className="bg-gradient-to-r from-[#588157]/5 to-[#3A5A40]/5 border-2 border-[#588157] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#588157] rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">{champion.name}</span>
                  <span className="px-2.5 py-0.5 bg-[#588157] text-white text-xs font-bold rounded-full">
                    🏆 CHAMPION
                  </span>
                </div>
                <span className="text-sm text-gray-600">{champion.customer_count.toLocaleString()} customers</span>
              </div>
            </div>
            <button
              onClick={() => onMapOffers(champion.id)}
              className="inline-flex items-center px-4 py-2 bg-[#588157] hover:bg-[#3A5A40] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {hasOffersForSegment(champion.id) ? 'Add More Offers' : 'Map Offers'}
            </button>
          </div>

          {/* Offers List */}
          {hasOffersForSegment(champion.id) ? (
            <div className="space-y-2">
              {getOffersForSegment(champion.id).map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-[#588157]/30 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#588157]/10 rounded-lg flex items-center justify-center">
                      <Gift className="w-4 h-4 text-[#588157]" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{offer.name}</div>
                      <div className="text-sm text-gray-500">
                        {offer.reward_type} - {offer.reward_value}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveOfferFromSegment(champion.id, offer.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#588157]/5 border-2 border-dashed border-[#588157]/30 rounded-lg p-8 text-center">
              <Gift className="w-10 h-10 mx-auto mb-2 text-[#588157]/40" />
              <p className="text-sm text-gray-600">No offers mapped yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Challengers Section */}
      {challengers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-[#A3B18A]" />
            <h3 className="text-lg font-semibold text-gray-900">Challenger Offers</h3>
            <span className="text-sm text-gray-500">({challengers.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challengers.map((challenger, index) => (
              <div
                key={challenger.id}
                className="bg-white border-2 border-[#A3B18A] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#A3B18A] rounded-lg flex items-center justify-center">
                      <span className="text-[#344E41] font-bold text-sm">C{index + 1}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 text-sm">{challenger.name}</span>
                        <span className="px-2 py-0.5 bg-[#A3B18A] text-[#344E41] text-xs font-medium rounded-full">
                          Challenger
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{challenger.customer_count.toLocaleString()} customers</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onMapOffers(challenger.id)}
                    className="p-2 bg-[#A3B18A] hover:bg-[#588157] text-[#344E41] hover:text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Offers List */}
                {hasOffersForSegment(challenger.id) ? (
                  <div className="space-y-2">
                    {getOffersForSegment(challenger.id).map((offer) => (
                      <div
                        key={offer.id}
                        className="bg-[#A3B18A]/10 border border-[#A3B18A]/30 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <Gift className="w-3.5 h-3.5 text-[#588157] flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm truncate">{offer.name}</div>
                            <div className="text-xs text-gray-500 truncate">{offer.reward_type}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveOfferFromSegment(challenger.id, offer.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#A3B18A]/5 border border-dashed border-[#A3B18A]/30 rounded-lg p-6 text-center">
                    <Gift className="w-8 h-8 mx-auto mb-1 text-[#A3B18A]/40" />
                    <p className="text-xs text-gray-500">No offers</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mapping Visualization */}
      {totalOffersMapped > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Mapping Summary</h4>
              <p className="text-sm text-blue-700">
                {totalMappedSegments} segment{totalMappedSegments !== 1 ? 's' : ''} mapped with {totalOffersMapped} offer assignment{totalOffersMapped !== 1 ? 's' : ''}. 
                The champion and challengers can have different offers to test various strategies.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
