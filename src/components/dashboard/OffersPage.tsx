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
        lifecycle_status: selectedStatus !== 'all' ? selectedStatus : undefined,
        approval_status: selectedApproval !== 'all' ? selectedApproval : undefined
      };

      const response = await offerService.getOffers(filterParams);
      setOffers(response.data);
      setTotalOffers(response.total);
    } catch (err) {
      setError('Failed to load offers');
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status: LifecycleStatus | 'all') => {
    setSelectedStatus(status);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleApprovalFilter = (approval: ApprovalStatus | 'all') => {
    setSelectedApproval(approval);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleViewOffer = (id: string) => {
    navigate(`/dashboard/offers/${id}`);
  };

  const handleEditOffer = (id: string) => {
    navigate(`/dashboard/offers/${id}/edit`);
  };

  const handleCopyOfferId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  // Helper functions for display
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount': return <DollarSign className="h-5 w-5 text-white" />;
      case 'cashback': return <Gift className="h-5 w-5 text-white" />;
      case 'loyalty': return <MessageSquare className="h-5 w-5 text-white" />;
      case 'referral': return <Copy className="h-5 w-5 text-white" />;
      case 'seasonal': return <Clock className="h-5 w-5 text-white" />;
      default: return <Gift className="h-5 w-5 text-white" />;
    }
  };

  const getStatusBadge = (status: LifecycleStatus) => {
    switch (status) {
      case 'draft':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'paused':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Paused</span>;
      case 'expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
      case 'archived':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Archived</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getApprovalBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Filter offers based on search term
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = !searchTerm || 
      offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || offer.lifecycle_status === selectedStatus;
    const matchesApproval = selectedApproval === 'all' || offer.approval_status === selectedApproval;
    
    return matchesSearch && matchesStatus && matchesApproval;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Offers Management
          </h1>
          <p className="text-gray-600 mt-2">Create and manage customer offers with dynamic pricing and eligibility</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/offers/create')}
          className="inline-flex items-center px-4 py-2 bg-[#3b8169] hover:bg-[#2d5f4e] text-white font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Offer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Offers</p>
              <p className="text-2xl font-semibold text-gray-900">{totalOffers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {offers.filter(o => o.lifecycle_status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {offers.filter(o => o.approval_status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expired</p>
              <p className="text-2xl font-semibold text-gray-900">
                {offers.filter(o => o.lifecycle_status === 'expired').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value as LifecycleStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={selectedApproval}
              onChange={(e) => handleApprovalFilter(e.target.value as ApprovalStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Approval</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No offers found</p>
              <button 
                onClick={() => navigate('/dashboard/offers/create')}
                className="mt-4 inline-flex items-center px-4 py-2 bg-[#3b8169] hover:bg-[#2d5f4e] text-white font-semibold rounded-lg shadow-sm transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Offer
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            {getCategoryIcon(offer.category)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{offer.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{offer.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        offer.category === 'discount' ? 'bg-green-100 text-green-800' :
                        offer.category === 'cashback' ? 'bg-blue-100 text-blue-800' :
                        offer.category === 'loyalty' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {offer.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(offer.lifecycle_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getApprovalBadge(offer.approval_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(offer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewOffer(offer.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditOffer(offer.id)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCopyOfferId(offer.id)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          title="Copy ID"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                            title="More Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && filteredOffers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((filters.page || 1) - 1) * (filters.pageSize || 10) + 1} to{' '}
              {Math.min((filters.page || 1) * (filters.pageSize || 10), totalOffers)} of {totalOffers} offers
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                disabled={(filters.page || 1) <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {filters.page || 1} of {Math.ceil(totalOffers / (filters.pageSize || 10))}
              </span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={(filters.page || 1) >= Math.ceil(totalOffers / (filters.pageSize || 10))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
