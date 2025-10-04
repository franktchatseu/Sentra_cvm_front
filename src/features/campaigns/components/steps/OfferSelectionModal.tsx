import { useState, useEffect } from 'react';
import { X, Search, Plus, Gift, Check, DollarSign, Calendar } from 'lucide-react';
import { CampaignOffer } from '../../types/campaign';
import HeadlessSelect from '../../../../shared/components/ui/HeadlessSelect';

interface OfferSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (offers: CampaignOffer[]) => void;
  selectedOffers: CampaignOffer[];
  editingOffer?: CampaignOffer | null;
  onCreateNew?: () => void;
}

// TODO: Replace with real API call to fetch offers
// Mock offer data - in a real app, this would come from an API
const mockOffers: CampaignOffer[] = [
  {
    id: 'offer-001',
    name: 'Double Data Bundle',
    description: 'Get double the data for the same price - limited time offer',
    offer_type: 'Data Bundle',
    reward_type: 'bundle',
    reward_value: '2x Data',
    validity_period: 30,
    terms_conditions: 'Valid for 30 days from activation',
    segments: []
  },
  {
    id: 'offer-002',
    name: 'Welcome Bonus Package',
    description: 'Special welcome package for new subscribers',
    offer_type: 'Welcome Package',
    reward_type: 'bundle',
    reward_value: '50% Off First Month',
    validity_period: 7,
    terms_conditions: 'For new customers only',
    segments: []
  },
  {
    id: 'offer-003',
    name: 'Loyalty Points Bonus',
    description: '500 bonus loyalty points for active customers',
    offer_type: 'Loyalty Reward',
    reward_type: 'points',
    reward_value: '500 Points',
    validity_period: 60,
    terms_conditions: 'Minimum 3 months active subscription required',
    segments: []
  },
  {
    id: 'offer-004',
    name: 'Weekend Voice Bundle',
    description: 'Unlimited weekend calls at discounted rate',
    offer_type: 'Voice Bundle',
    reward_type: 'bundle',
    reward_value: 'Unlimited Weekend Calls',
    validity_period: 30,
    terms_conditions: 'Valid Saturday-Sunday only',
    segments: []
  },
  {
    id: 'offer-005',
    name: 'Cashback Promotion',
    description: '10% cashback on next recharge',
    offer_type: 'Cashback',
    reward_type: 'cashback',
    reward_value: '10% Cashback',
    validity_period: 14,
    terms_conditions: 'Minimum recharge of $20 required',
    segments: []
  },
  {
    id: 'offer-006',
    name: 'Free International Minutes',
    description: '100 free international minutes to selected countries',
    offer_type: 'International Package',
    reward_type: 'free_service',
    reward_value: '100 Free Minutes',
    validity_period: 30,
    terms_conditions: 'Valid to US, UK, Canada only',
    segments: []
  },
  {
    id: 'offer-007',
    name: 'Student Discount',
    description: '25% discount for verified students',
    offer_type: 'Student Offer',
    reward_type: 'discount',
    reward_value: '25% Discount',
    validity_period: 90,
    terms_conditions: 'Valid student ID required',
    segments: []
  },
  {
    id: 'offer-008',
    name: 'Family Plan Upgrade',
    description: 'Free upgrade to family plan for 3 months',
    offer_type: 'Plan Upgrade',
    reward_type: 'free_service',
    reward_value: '3 Months Free Upgrade',
    validity_period: 90,
    terms_conditions: 'Existing customers only',
    segments: []
  }
];

const rewardTypeColors = {
  bundle: 'bg-blue-100 text-blue-700',
  points: 'bg-purple-100 text-purple-700',
  discount: 'bg-green-100 text-green-700',
  cashback: 'bg-orange-100 text-orange-700',
  free_service: 'bg-indigo-100 text-indigo-700'
};

export default function OfferSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedOffers,
  editingOffer,
  onCreateNew
}: OfferSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [tempSelectedOffers, setTempSelectedOffers] = useState<CampaignOffer[]>(selectedOffers);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Offers' },
    { value: 'bundle', label: 'Bundles' },
    { value: 'discount', label: 'Discounts' },
    { value: 'points', label: 'Points' },
    { value: 'cashback', label: 'Cashback' }
  ];

  useEffect(() => {
    if (isOpen) {
      setTempSelectedOffers(selectedOffers);
    }
  }, [isOpen, selectedOffers]);

  if (!isOpen) return null;

  const filteredOffers = mockOffers.filter(offer => {
    const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'bundle') return matchesSearch && offer.reward_type === 'bundle';
    if (selectedFilter === 'discount') return matchesSearch && offer.reward_type === 'discount';
    if (selectedFilter === 'points') return matchesSearch && offer.reward_type === 'points';
    if (selectedFilter === 'cashback') return matchesSearch && offer.reward_type === 'cashback';

    return matchesSearch;
  });

  const handleOfferToggle = (offer: CampaignOffer) => {
    const isSelected = tempSelectedOffers.some(o => o.id === offer.id);
    if (isSelected) {
      setTempSelectedOffers(tempSelectedOffers.filter(o => o.id !== offer.id));
    } else {
      setTempSelectedOffers([...tempSelectedOffers, offer]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelectedOffers);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingOffer ? 'Edit Offer' : 'Select Campaign Offers'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose offers to include in your campaign
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 space-y-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
              />
            </div>
            <div className="w-48">
              <HeadlessSelect
                options={filterOptions}
                value={selectedFilter}
                onChange={(value: string | number) => setSelectedFilter(value as string)}
                placeholder="Filter offers"
              />
            </div>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 bg-[#3A5A40] text-white rounded-md text-sm font-medium hover:bg-[#2f4a35] transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </button>
          </div>

          {/* Selection Summary */}
          {tempSelectedOffers.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-purple-900">
                    {tempSelectedOffers.length} offer{tempSelectedOffers.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <button
                  onClick={() => setTempSelectedOffers([])}
                  className="text-sm text-purple-700 hover:text-purple-900 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Offers List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOffers.map((offer) => {
              const isSelected = tempSelectedOffers.some(o => o.id === offer.id);

              return (
                <div
                  key={offer.id}
                  onClick={() => handleOfferToggle(offer)}
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-sm ${isSelected
                    ? 'border-[#588157] bg-[#588157]/5'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-[#588157] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{offer.name}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{offer.description}</p>

                      <div className="flex items-center space-x-2 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${rewardTypeColors[offer.reward_type]}`}>
                          {offer.reward_type}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {offer.offer_type}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-[#3b8169]" />
                          <span className="text-sm font-medium text-[#3b8169]">
                            {offer.reward_value}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {offer.validity_period} days
                          </span>
                        </div>
                      </div>

                      {offer.terms_conditions && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-1">
                          {offer.terms_conditions}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOffers.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
              <p className="text-gray-500">Try adjusting your search or create a new offer</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0">
          <div className="text-sm text-gray-500">
            {tempSelectedOffers.length} of {filteredOffers.length} offers selected
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={tempSelectedOffers.length === 0}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tempSelectedOffers.length > 0
                ? 'bg-[#3A5A40] text-white hover:bg-[#2f4a35]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
