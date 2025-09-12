import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Filter, 
  Search, 
  MessageSquare, 
  Gift, 
  DollarSign, 
  Clock, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy,
  Play,
  Pause,
  Archive,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Offer, OfferFilters, LifecycleStatus, ApprovalStatus } from '../../types/offer';
import { offerService } from '../../services/offerService';

export default function OffersPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOffers, setTotalOffers] = useState(0);
  const [filters, setFilters] = useState<OfferFilters>({
    page: 1,
    pageSize: 10,
    sortBy: 'created_at',
    sortDirection: 'DESC'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LifecycleStatus | 'all'>('all');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalStatus | 'all'>('all');

  // Load offers on component mount and filter changes
  useEffect(() => {
    loadOffers();
  }, [filters, selectedStatus, selectedApproval]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams: OfferFilters = {
        ...filters,
        search: searchTerm || undefined,
        lifecycleStatus: selectedStatus !== 'all' ? selectedStatus : undefined,
        approvalStatus: selectedApproval !== 'all' ? selectedApproval : undefined,
      };

      const response = await offerService.getOffers(filterParams);
      setOffers(response.offers);
      setTotalOffers(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    loadOffers();
  };

  const handleStatusChange = async (offerId: number, action: string) => {
    try {
      switch (action) {
        case 'activate':
          await offerService.activateOffer(offerId);
          break;
        case 'deactivate':
          await offerService.deactivateOffer(offerId);
          break;
        case 'pause':
          await offerService.pauseOffer(offerId);
          break;
        case 'expire':
          await offerService.expireOffer(offerId);
          break;
        case 'archive':
          await offerService.archiveOffer(offerId);
          break;
        case 'approve':
          await offerService.approveOffer(offerId);
          break;
        case 'reject':
          await offerService.rejectOffer(offerId);
          break;
        case 'delete':
          await offerService.deleteOffer(offerId);
          break;
      }
      loadOffers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories', count: totalOffers },
    { value: 'data', label: 'Data', count: offers.filter((o: Offer) => o.category?.name === 'data').length },
    { value: 'voice', label: 'Voice', count: offers.filter((o: Offer) => o.category?.name === 'voice').length },
    { value: 'combo', label: 'Combo', count: offers.filter((o: Offer) => o.category?.name === 'combo').length },
    { value: 'loyalty', label: 'Loyalty', count: offers.filter((o: Offer) => o.category?.name === 'loyalty').length },
  ];

  const getStatusBadge = (status: LifecycleStatus) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: Pause },
      archived: { color: 'bg-blue-100 text-blue-800', icon: Archive },
    };
    return statusConfig[status] || statusConfig.draft;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      data: Gift,
      voice: MessageSquare,
      combo: DollarSign,
      loyalty: Clock,
    };
    return icons[category as keyof typeof icons] || Gift;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Offer Management
              </h1>
              <p className="text-gray-600 mt-2">Create, manage, and optimize your customer offers</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/offers/create')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Offer
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as LifecycleStatus | 'all')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Approval Filter */}
            <div className="lg:w-48">
              <select
                value={selectedApproval}
                onChange={(e) => setSelectedApproval(e.target.value as ApprovalStatus | 'all')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Approval</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading offers...</span>
            </div>
          </div>
        ) : (
          /* Offers Table */
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Offer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Approval</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {offers.map((offer, index) => {
                    const statusConfig = getStatusBadge(offer.lifecycle_status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr 
                        key={offer.id} 
                        className="hover:bg-indigo-50/50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <Gift className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{offer.name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {offer.description || 'No description'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {offer.category?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {offer.lifecycle_status}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            offer.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                            offer.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {offer.approval_status === 'approved' && <CheckCircle className="w-4 h-4" />}
                            {offer.approval_status === 'rejected' && <XCircle className="w-4 h-4" />}
                            {offer.approval_status === 'pending' && <Clock className="w-4 h-4" />}
                            {offer.approval_status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {offer.created_at ? new Date(offer.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/offers/${offer.id}`)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/offers/${offer.id}/edit`)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Edit Offer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <div className="relative group">
                              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <div className="py-1">
                                  {offer.lifecycle_status === 'draft' && (
                                    <button
                                      onClick={() => handleStatusChange(offer.id!, 'activate')}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Play className="w-4 h-4" />
                                      Activate
                                    </button>
                                  )}
                                  {offer.lifecycle_status === 'active' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(offer.id!, 'pause')}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Pause className="w-4 h-4" />
                                        Pause
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(offer.id!, 'deactivate')}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        Deactivate
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleStatusChange(offer.id!, 'archive')}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Archive className="w-4 h-4" />
                                    Archive
                                  </button>
                                  <hr className="my-1" />
                                  <button
                                    onClick={() => navigator.clipboard.writeText(offer.id?.toString() || '')}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Copy ID
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(offer.id!, 'delete')}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {offers.length === 0 && !loading && (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No offers found</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first offer</p>
                <button
                  onClick={() => navigate('/dashboard/offers/create')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Offer
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalOffers > filters.pageSize! && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((filters.page! - 1) * filters.pageSize!) + 1} to {Math.min(filters.page! * filters.pageSize!, totalOffers)} of {totalOffers} offers
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
                      disabled={filters.page === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                      disabled={filters.page! * filters.pageSize! >= totalOffers}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

              {/* Performance Stats */}
              {offer.status !== 'draft' && (
                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{offer.campaigns}</div>
                    <div className="text-xs text-gray-500">Campaigns</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{offer.conversions.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Conversions</div>
                  </div>
                </div>
              )}

/* ... */
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200" title="View Details">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors duration-200" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors duration-200" title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Last used: {offer.lastUsed}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOffers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No offers found</h3>
          <p className="text-gray-600 mb-6">Create your first offer to start engaging with customers</p>
          <button 
            onClick={() => navigate('/dashboard/offers/create')}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Offer
          </button>
        </div>
      )}
    </div>
  );
}