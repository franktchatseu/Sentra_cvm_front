import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  Plus,
  Gift,
  Check,
  DollarSign,
  Calendar,
} from "lucide-react";
import { CampaignOffer } from "../../types/campaign";
import HeadlessSelect from "../../../../shared/components/ui/HeadlessSelect";
import { color } from "../../../../shared/utils/utils";
import { offerService } from "../../../offers/services/offerService";
import { Offer } from "../../../offers/types/offer";

interface OfferSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (offers: CampaignOffer[]) => void;
  selectedOffers: CampaignOffer[];
  editingOffer?: CampaignOffer | null;
  onCreateNew?: () => void;
}

const rewardTypeColors = {
  bundle: "bg-blue-100 text-blue-700",
  points: "bg-purple-100 text-purple-700",
  discount: "bg-green-100 text-green-700",
  cashback: "bg-orange-100 text-orange-700",
  free_service: "bg-indigo-100 text-indigo-700",
};

export default function OfferSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedOffers,
  editingOffer,
  onCreateNew,
}: OfferSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [tempSelectedOffers, setTempSelectedOffers] =
    useState<CampaignOffer[]>(selectedOffers);
  const [offers, setOffers] = useState<CampaignOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterOptions = [
    { value: "all", label: "All Offers" },
    { value: "bundle", label: "Bundles" },
    { value: "discount", label: "Discounts" },
    { value: "points", label: "Points" },
    { value: "cashback", label: "Cashback" },
  ];

  useEffect(() => {
    if (isOpen) {
      setTempSelectedOffers(selectedOffers);
      loadOffers();
    }
  }, [isOpen, selectedOffers]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await offerService.searchOffers({
        limit: 100, // Get all offers for selection
        skipCache: true,
        //  Re-enable lifecycleStatus filter when offers have proper lifecycle status
        // status: 'active' // Only show active offers (currently commented out because offers are in 'draft' status)
      });

      // Convert Offer objects to CampaignOffer format
      const offersData = response.data || [];
      const campaignOffers: CampaignOffer[] = offersData.map(
        (offer: Offer) => ({
          id: offer.id?.toString() || "",
          name: offer.name,
          description: offer.description || "",
          offer_type: offer.category?.name || "General",
          reward_type: "bundle" as const, // Default since Offer doesn't have reward_type
          reward_value: "Special Offer",
          validity_period: 30,
          terms_conditions: "See offer details",
          segments: [],
        })
      );

      setOffers(campaignOffers);
    } catch (err) {
      console.error("Failed to load offers:", err);
      setError(err instanceof Error ? err.message : "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offer.description &&
        offer.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "bundle")
      return matchesSearch && offer.reward_type === "bundle";
    if (selectedFilter === "discount")
      return matchesSearch && offer.reward_type === "discount";
    if (selectedFilter === "points")
      return matchesSearch && offer.reward_type === "points";
    if (selectedFilter === "cashback")
      return matchesSearch && offer.reward_type === "cashback";

    return matchesSearch;
  });

  const handleOfferToggle = (offer: CampaignOffer) => {
    const isSelected = tempSelectedOffers.some((o) => o.id === offer.id);
    if (isSelected) {
      setTempSelectedOffers(
        tempSelectedOffers.filter((o) => o.id !== offer.id)
      );
    } else {
      setTempSelectedOffers([...tempSelectedOffers, offer]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelectedOffers);
  };

  return createPortal(
    <div
      className="fixed bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingOffer ? "Edit Offer" : "Select Campaign Offers"}
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
        <div className="px-6 pt-4 space-y-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="w-48">
              <div className="[&_button]:py-2 [&_li]:py-1.5">
                <HeadlessSelect
                  options={filterOptions}
                  value={selectedFilter}
                  onChange={(value: string | number) =>
                    setSelectedFilter(value as string)
                  }
                  placeholder="Filter offers"
                />
              </div>
            </div>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 bg-[#3A5A40] text-white rounded-lg text-sm font-medium hover:bg-[#2f4a35] transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </button>
          </div>

          {/* Selection Summary */}
          {tempSelectedOffers.length > 0 && (
            <div
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: `${color.primary.accent}15`,
                borderColor: `${color.primary.accent}40`,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: color.primary.accent }}
                  >
                    {tempSelectedOffers.length} offer
                    {tempSelectedOffers.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <button
                  onClick={() => setTempSelectedOffers([])}
                  className="text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ color: color.primary.accent }}
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Offers List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading offers...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadOffers}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No offers found</p>
                <p className="text-sm text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "No offers available at the moment."}
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: color.border.default }}>
              <table className="min-w-full divide-y" style={{ borderColor: color.border.default }}>
                <thead style={{ backgroundColor: color.surface.cards }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      Select
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Offer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y" style={{ borderColor: color.border.default }}>
                  {filteredOffers.map((offer) => {
                    const isSelected = tempSelectedOffers.some(
                      (o) => o.id === offer.id
                    );

                    return (
                      <tr
                        key={offer.id}
                        onClick={() => handleOfferToggle(offer)}
                        className="cursor-pointer transition-colors"
                        style={{
                          backgroundColor: isSelected ? `${color.primary.accent}10` : 'white'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = color.surface.cards;
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <td className="px-4 py-3">
                          <div
                            className="w-5 h-5 rounded border-2 flex items-center justify-center"
                            style={{
                              borderColor: isSelected ? color.primary.accent : '#d1d5db',
                              backgroundColor: isSelected ? color.primary.accent : 'transparent'
                            }}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${color.primary.accent}20` }}
                            >
                              <Gift className="w-4 h-4" style={{ color: color.primary.accent }} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {offer.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {offer.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded-full ${
                              rewardTypeColors[
                                offer.reward_type as keyof typeof rewardTypeColors
                              ] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {offer.reward_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" style={{ color: color.primary.accent }} />
                            <span className="text-sm font-medium" style={{ color: color.primary.accent }}>
                              {offer.reward_value}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {offer.validity_period}d
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0">
          <div className="text-sm text-gray-500">
            {tempSelectedOffers.length} of {filteredOffers.length} offers
            selected
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
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                tempSelectedOffers.length > 0
                  ? "bg-[#3A5A40] text-white hover:bg-[#2f4a35]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
