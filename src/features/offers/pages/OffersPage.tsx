import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MessageSquare,
  Gift,
  DollarSign,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone
} from 'lucide-react';
import { Offer, OfferFilters, LifecycleStatus, ApprovalStatus } from '../../../../shared/types/offer';
import { offerService } from '../services/offerService';
import HeadlessSelect from '../../../shared/components/ui/HeadlessSelect';
import { color, tw } from '../../../shared/utils/utils';

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

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams: OfferFilters = {
        ...filters,
        search: searchTerm || undefined,
        lifecycleStatus: selectedStatus !== 'all' ? selectedStatus : undefined,
        approvalStatus: selectedApproval !== 'all' ? selectedApproval : undefined
      };

      const response = await offerService.getOffers(filterParams);
      setOffers(response.data);
      setTotalOffers(response.meta.total);
    } catch (err) {
      setError('Failed to load offers');
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load offers on component mount and filter changes
  useEffect(() => {
    loadOffers();
  }, [filters, selectedStatus, selectedApproval, searchTerm]);

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

  const handleViewOffer = (id: number) => {
    navigate(`/dashboard/offers/${id}`);
  };

  const handleEditOffer = (id: number) => {
    navigate(`/dashboard/offers/${id}/edit`);
  };

  const handleCopyOfferId = (id: number) => {
    navigator.clipboard.writeText(id.toString());
  };

  // Helper functions for display
  const getCategoryIcon = (category: { name?: string } | string) => {
    const categoryName = typeof category === 'string' ? category : category?.name || '';
    switch (categoryName) {
      case 'Data Offers': return <MessageSquare className="h-5 w-5 text-white" />;
      case 'Voice Offers': return <Phone className="h-5 w-5 text-white" />;
      case 'Combo Offers': return <Gift className="h-5 w-5 text-white" />;
      case 'Loyalty Rewards': return <DollarSign className="h-5 w-5 text-white" />;
      case 'Promotional': return <Copy className="h-5 w-5 text-white" />;
      default: return <Gift className="h-5 w-5 text-white" />;
    }
  };

  const getStatusBadge = (status: LifecycleStatus) => {
    switch (status) {
      case 'draft':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.ui.gray[100]}] text-[${color.ui.gray[800]}]`}>Draft</span>;
      case 'active':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.success.light}] text-[${color.status.success.main}]`}>Active</span>;
      case 'paused':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.warning.light}] text-[${color.status.warning.main}]`}>Paused</span>;
      case 'expired':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.error.light}] text-[${color.status.error.main}]`}>Expired</span>;
      case 'archived':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.ui.gray[100]}] text-[${color.ui.gray[800]}]`}>Archived</span>;
      default:
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.ui.gray[100]}] text-[${color.ui.gray[800]}]`}>{status}</span>;
    }
  };

  const getApprovalBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.warning.light}] text-[${color.status.warning.main}]`}>Pending</span>;
      case 'approved':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.success.light}] text-[${color.status.success.main}]`}>Approved</span>;
      case 'rejected':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.error.light}] text-[${color.status.error.main}]`}>Rejected</span>;
      default:
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.ui.gray[100]}] text-[${color.ui.gray[800]}]`}>{status}</span>;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
            Offers Management
          </h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>Create and manage customer offers with dynamic pricing and eligibility</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/offers/create')}
          className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 text-white"
          style={{ backgroundColor: color.sentra.main }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] p-6 hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: color.entities.offers }}
              >
                <Gift className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${tw.textMuted}`}>Total Offers</p>
              <p className={`text-2xl font-bold ${tw.textPrimary}`}>{totalOffers}</p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] p-6 hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: color.status.success.main }}
              >
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${tw.textMuted}`}>Active</p>
              <p className={`text-2xl font-bold ${tw.textPrimary}`}>
                {offers.filter(o => o.lifecycle_status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] p-6 hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: color.status.warning.main }}
              >
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${tw.textMuted}`}>Pending</p>
              <p className={`text-2xl font-bold ${tw.textPrimary}`}>
                {offers.filter(o => o.approval_status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] p-6 hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: color.status.error.main }}
              >
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${tw.textMuted}`}>Expired</p>
              <p className={`text-2xl font-bold ${tw.textPrimary}`}>
                {offers.filter(o => o.lifecycle_status === 'expired').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[${color.ui.text.muted}]`} />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={`pl-10 pr-4 py-3.5 border border-[${color.ui.border}] rounded-lg focus:outline-none focus:border-[${color.sentra.main}] focus:ring-1 focus:ring-[${color.sentra.main}]/20 w-full sm:w-64`}
              />
            </div>
            <HeadlessSelect
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'expired', label: 'Expired' },
                { value: 'archived', label: 'Archived' }
              ]}
              value={selectedStatus}
              onChange={(value) => handleStatusFilter(value as LifecycleStatus | 'all')}
              placeholder="All Status"
              className="min-w-[140px]"
            />
            <HeadlessSelect
              options={[
                { value: 'all', label: 'All Approval' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
              ]}
              value={selectedApproval}
              onChange={(value) => handleApprovalFilter(value as ApprovalStatus | 'all')}
              placeholder="All Approval"
              className="min-w-[140px]"
            />
          </div>
        </div>
      </div>

      {/* Offers Table */}
      <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-[${color.sentra.main}]`}></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className={`h-12 w-12 text-[${color.status.error.main}] mx-auto mb-4`} />
              <p className={`${tw.textSecondary}`}>{error}</p>
            </div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Gift className={`h-12 w-12 text-[${color.entities.offers}] mx-auto mb-4`} />
              <p className={`${tw.textSecondary}`}>No offers found</p>
              <button
                onClick={() => navigate('/dashboard/offers/create')}
                className={`mt-4 inline-flex items-center px-3 py-2 text-base ${tw.primaryButton} font-semibold rounded-lg shadow-sm transition-all duration-200`}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Offer
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`bg-[${color.ui.surface}]`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Offer</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Category</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Approval</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Created</th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`bg-white divide-y divide-[${color.ui.border}]`}>
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className={`hover:bg-[${color.ui.surface}]/50 transition-colors duration-150`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0`} style={{ background: `${color.entities.offers}` }}>
                          {getCategoryIcon(offer.category || '')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-base ${tw.textPrimary} truncate`}>{offer.name}</div>
                          <div className={`text-sm ${tw.textSecondary} truncate flex items-center space-x-2 mt-1`}>
                            <span className="truncate">{offer.description}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${offer.category?.name === 'Data Offers' ? `bg-[${color.status.info.light}] text-[${color.status.info.main}]` :
                        offer.category?.name === 'Voice Offers' ? `bg-[${color.status.success.light}] text-[${color.status.success.main}]` :
                          offer.category?.name === 'Combo Offers' ? `bg-[${color.entities.offers}]/10 text-[${color.entities.offers}]` :
                            offer.category?.name === 'Loyalty Rewards' ? `bg-[${color.status.warning.light}] text-[${color.status.warning.main}]` :
                              offer.category?.name === 'Promotional' ? `bg-[${color.entities.campaigns}]/10 text-[${color.entities.campaigns}]` :
                                `bg-[${color.ui.gray[100]}] text-[${color.ui.gray[800]}]`
                        }`}>
                        {offer.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(offer.lifecycle_status)}
                    </td>
                    <td className="px-6 py-5">
                      {getApprovalBadge(offer.approval_status)}
                    </td>
                    <td className={`px-6 py-5 text-sm ${tw.textMuted}`}>
                      {offer.created_at ? new Date(offer.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-5 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => offer.id && handleViewOffer(offer.id)}
                          className={`text-[${color.status.info.main}] hover:text-[${color.status.info.dark}] p-1 rounded`}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => offer.id && handleEditOffer(offer.id)}
                          className={`${tw.textMuted} hover:${tw.textPrimary} p-1 rounded`}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => offer.id && handleCopyOfferId(offer.id)}
                          className={`${tw.textMuted} hover:${tw.textPrimary} p-1 rounded`}
                          title="Copy ID"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button
                            className={`${tw.textMuted} hover:${tw.textPrimary} p-1 rounded`}
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
        <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] px-4 sm:px-6 py-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className={`text-base ${tw.textSecondary} text-center sm:text-left`}>
              Showing {((filters.page || 1) - 1) * (filters.pageSize || 10) + 1} to{' '}
              {Math.min((filters.page || 1) * (filters.pageSize || 10), totalOffers)} of {totalOffers} offers
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                disabled={(filters.page || 1) <= 1}
                className={`px-3 py-2 text-base border border-[${color.ui.border}] rounded-md hover:bg-[${color.ui.surface}] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
              >
                Previous
              </button>
              <span className={`text-base ${tw.textSecondary} px-2`}>
                Page {filters.page || 1} of {Math.ceil(totalOffers / (filters.pageSize || 10))}
              </span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={(filters.page || 1) >= Math.ceil(totalOffers / (filters.pageSize || 10))}
                className={`px-3 py-2 text-base border border-[${color.ui.border}] rounded-md hover:bg-[${color.ui.surface}] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
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
