import { Gift, Plus, X, TrendingUp, ArrowRight } from 'lucide-react';
import { CampaignSegment, CampaignOffer } from '../../types/campaign';

interface ABTestOfferMappingProps {
  variantA: CampaignSegment | null;
  variantB: CampaignSegment | null;
  selectedOffers: CampaignOffer[];
  offerMappings: { [segmentId: string]: string[] }; // segmentId -> offerIds[]
  onMapOffers: (segmentId: string) => void;
  onRemoveOfferFromSegment: (segmentId: string, offerId: string) => void;
}

export default function ABTestOfferMapping({
  variantA,
  variantB,
  selectedOffers,
  offerMappings,
  onMapOffers,
  onRemoveOfferFromSegment
}: ABTestOfferMappingProps) {

  const getOffersForSegment = (segmentId: string) => {
    const offerIds = offerMappings[segmentId] || [];
    return selectedOffers.filter(offer => offerIds.includes(offer.id));
  };

  const hasOffersForSegment = (segmentId: string) => {
    return offerMappings[segmentId] && offerMappings[segmentId].length > 0;
  };

  if (!variantA || !variantB) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12">
        <div className="text-center text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">A/B Test variants not configured</p>
          <p className="text-sm mt-1">Please configure both Variant A and Variant B in the previous step.</p>
        </div>
      </div>
    );
  }

  const hasOffersA = hasOffersForSegment(variantA.id);
  const hasOffersB = hasOffersForSegment(variantB.id);
  const offersCountA = offerMappings[variantA.id]?.length || 0;
  const offersCountB = offerMappings[variantB.id]?.length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-[#DAD7CD] to-[#A3B18A]/20 rounded-xl p-6 border border-[#A3B18A]">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-[#588157]">
              {offersCountA}
            </div>
            <div className="text-sm text-gray-600">Variant A Offers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#F97316]">
              {offersCountB}
            </div>
            <div className="text-sm text-gray-600">Variant B Offers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {selectedOffers.length}
            </div>
            <div className="text-sm text-gray-600">Available Offers</div>
          </div>
        </div>
      </div>

      {/* A/B Test Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variant A */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Variant A Offers</h3>
            </div>
            <button
              onClick={() => onMapOffers(variantA.id)}
              className="inline-flex items-center px-3 py-1.5  hover:bg-[#3A5A40] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {hasOffersA ? 'Add' : 'Map Offers'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#588157]/5 to-[#588157]/10 border-2 border-[#588157] rounded-xl p-6 min-h-[300px]">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-bold text-gray-900">{variantA.name}</span>
                <span className="px-2.5 py-0.5  text-white text-xs font-bold rounded-full">
                  VARIANT A
                </span>
              </div>
              <span className="text-sm text-gray-600">{variantA.customer_count.toLocaleString()} customers</span>
            </div>

            {hasOffersA ? (
              <div className="space-y-2">
                {getOffersForSegment(variantA.id).map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white border border-[#588157]/30 rounded-lg p-4 flex items-start justify-between hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 /10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Gift className="w-4 h-4 text-[#588157]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900">{offer.name}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {offer.reward_type} - {offer.reward_value}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Valid for {offer.validity_period} days
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveOfferFromSegment(variantA.id, offer.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="/5 border-2 border-dashed border-[#588157]/30 rounded-lg p-8 text-center h-full flex flex-col items-center justify-center">
                <Gift className="w-12 h-12 mb-2 text-[#588157]/40" />
                <p className="text-sm text-gray-700 font-medium">No offers mapped</p>
                <p className="text-xs text-gray-600 mt-1">Click "Map Offers" to add</p>
              </div>
            )}
          </div>
        </div>

        {/* Variant B */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Variant B Offers</h3>
            </div>
            <button
              onClick={() => onMapOffers(variantB.id)}
              className="inline-flex items-center px-3 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {hasOffersB ? 'Add' : 'Map Offers'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#F97316]/5 to-[#F97316]/10 border-2 border-[#F97316] rounded-xl p-6 min-h-[300px]">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-bold text-gray-900">{variantB.name}</span>
                <span className="px-2.5 py-0.5 bg-[#F97316] text-white text-xs font-bold rounded-full">
                  VARIANT B
                </span>
              </div>
              <span className="text-sm text-gray-600">{variantB.customer_count.toLocaleString()} customers</span>
            </div>

            {hasOffersB ? (
              <div className="space-y-2">
                {getOffersForSegment(variantB.id).map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white border border-[#F97316]/30 rounded-lg p-4 flex items-start justify-between hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-[#F97316]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Gift className="w-4 h-4 text-[#F97316]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900">{offer.name}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {offer.reward_type} - {offer.reward_value}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Valid for {offer.validity_period} days
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveOfferFromSegment(variantB.id, offer.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#F97316]/5 border-2 border-dashed border-[#F97316]/30 rounded-lg p-8 text-center h-full flex flex-col items-center justify-center">
                <Gift className="w-12 h-12 mb-2 text-[#F97316]/40" />
                <p className="text-sm text-gray-700 font-medium">No offers mapped</p>
                <p className="text-xs text-gray-600 mt-1">Click "Map Offers" to add</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Summary */}
      {(hasOffersA || hasOffersB) && (
        <div className="bg-gradient-to-r from-[#DAD7CD] via-gray-50 to-[#F97316]/10 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#588157] mb-1">
                {offersCountA}
              </div>
              <div className="text-sm text-gray-600">Variant A Offers</div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#588157] to-[#F97316] rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">VS</div>
                <div className="text-sm font-medium text-gray-900">A/B Comparison</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-[#F97316] mb-1">
                {offersCountB}
              </div>
              <div className="text-sm text-gray-600">Variant B Offers</div>
            </div>
          </div>
        </div>
      )}

      {/* Mapping Info */}
      {hasOffersA && hasOffersB && (
        <div className="/5 border border-[#588157]/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center flex-shrink-0">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">A/B Test Configuration Complete</h4>
              <p className="text-sm text-gray-700">
                Both variants are mapped with offers. The test will compare the performance of Variant A
                ({offersCountA} offer{offersCountA !== 1 ? 's' : ''}) against Variant B
                ({offersCountB} offer{offersCountB !== 1 ? 's' : ''}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Incomplete Warning */}
      {(hasOffersA && !hasOffersB) || (!hasOffersA && hasOffersB) && (
        <div className="bg-[#F97316]/5 border border-[#F97316]/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center flex-shrink-0">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Incomplete A/B Test</h4>
              <p className="text-sm text-gray-700">
                {hasOffersA ? 'Variant B needs offers mapped' : 'Variant A needs offers mapped'} to complete the A/B test configuration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
