import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Play,
  Pause,
  Archive
} from 'lucide-react';
import { Offer, OfferFilters, LifecycleStatus, ApprovalStatus } from '../types/offer';
import { offerService } from '../services/offerService';
import { offerCategoryService } from '../services/offerCategoryService';
import { OfferCategory } from '../types/offerCategory';
import HeadlessSelect from '../../../shared/components/ui/HeadlessSelect';
import { color, tw } from '../../../shared/utils/utils';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';

export default function OffersPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<OfferCategory[]>([]);
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LifecycleStatus | 'all'>('all');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalStatus | 'all'>('all');

  // Dropdown menu state
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const actionMenuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Loading states for individual offers
  const [loadingAction, setLoadingAction] = useState<{ offerId: number; action: string } | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadCategories = async () => {
    try {
      const response = await offerCategoryService.getOfferCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadOffers = async (skipCache = false) => {
    try {
      setLoading(true);
      setError(null);

      const filterParams: OfferFilters = {
        ...filters,
        search: debouncedSearchTerm || undefined,
        lifecycleStatus: selectedStatus !== 'all' ? selectedStatus : undefined,
        approvalStatus: selectedApproval !== 'all' ? selectedApproval : undefined,
        skipCache: skipCache
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

  // Helper to get category name from category_id
  const getCategoryName = (categoryId: string | number | undefined): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => String(cat.id) === String(categoryId));
    return category?.name || 'Uncategorized';
  };

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load offers on component mount and filter changes
  useEffect(() => {
    loadOffers(true); // Always skip cache for fresh data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedStatus, selectedApproval, debouncedSearchTerm]);

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
    success('Copied', 'Offer ID copied to clipboard');
  };

  // Calculate dropdown position
  const calculateDropdownPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect();
    const dropdownWidth = 256; // w-64
    const dropdownHeight = 300;

    let top = rect.bottom + 8;
    let left = rect.right - dropdownWidth;

    if (left < 8) left = 8;
    if (left + dropdownWidth > window.innerWidth - 8) {
      left = window.innerWidth - dropdownWidth - 8;
    }
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = rect.top - dropdownHeight - 8;
    }

    return { top, left };
  };

  const handleActionMenuToggle = (offerId: number, buttonElement: HTMLElement) => {
    if (showActionMenu === offerId) {
      setShowActionMenu(null);
      setDropdownPosition(null);
    } else {
      const position = calculateDropdownPosition(buttonElement);
      setDropdownPosition(position);
      setShowActionMenu(offerId);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionMenu !== null) {
        const target = event.target as HTMLElement;
        const isInsideDropdown = target.closest('.action-dropdown');
        const isInsideButton = target.closest('.action-button');

        if (!isInsideDropdown && !isInsideButton) {
          setShowActionMenu(null);
          setDropdownPosition(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionMenu]);

  const handleDeleteOffer = async (id: number, name: string) => {
    const confirmed = await confirm({
      title: 'Delete Offer',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await offerService.deleteOffer(id);
      success('Offer Deleted', `"${name}" has been deleted successfully.`);
      await loadOffers(true); // Skip cache for immediate update
      setShowActionMenu(null);
    } catch (err) {
      showError('Error', 'Failed to delete offer');
      console.error('Delete offer error:', err);
    }
  };

  const handleActivateOffer = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: 'activate' });
      const response = await offerService.activateOffer(id);

      // Optimistically update the offer in the list
      const responseData = response as unknown as { success: boolean; data?: { lifecycle_status?: string } };
      if (responseData.success && responseData.data?.lifecycle_status) {
        const newStatus = responseData.data.lifecycle_status;
        setOffers(prevOffers =>
          prevOffers.map(offer =>
            Number(offer.id) === id
              ? { ...offer, lifecycle_status: newStatus as LifecycleStatus }
              : offer
          )
        );
      } else {
        // Fallback: reload if response doesn't include status
        await loadOffers(true);
      }

      success('Offer Activated', 'Offer has been activated successfully.');
      setShowActionMenu(null);
    } catch (err) {
      showError('Error', 'Failed to activate offer');
      console.error('Activate offer error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeactivateOffer = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: 'deactivate' });
      const response = await offerService.deactivateOffer(id);

      // Optimistically update the offer in the list
      const responseData = response as unknown as { success: boolean; data?: { lifecycle_status?: string } };
      if (responseData.success && responseData.data?.lifecycle_status) {
        const newStatus = responseData.data.lifecycle_status;
        setOffers(prevOffers =>
          prevOffers.map(offer =>
            Number(offer.id) === id
              ? { ...offer, lifecycle_status: newStatus as LifecycleStatus }
              : offer
          )
        );
      } else {
        // Fallback: reload if response doesn't include status
        await loadOffers(true);
      }

      success('Offer Deactivated', 'Offer has been deactivated successfully.');
      setShowActionMenu(null);
    } catch (err) {
      showError('Error', 'Failed to deactivate offer');
      console.error('Deactivate offer error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePauseOffer = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: 'pause' });
      const response = await offerService.pauseOffer(id);

      // Optimistically update the offer in the list
      const responseData = response as unknown as { success: boolean; data?: { lifecycle_status?: string } };
      if (responseData.success && responseData.data?.lifecycle_status) {
        const newStatus = responseData.data.lifecycle_status;
        setOffers(prevOffers =>
          prevOffers.map(offer =>
            Number(offer.id) === id
              ? { ...offer, lifecycle_status: newStatus as LifecycleStatus }
              : offer
          )
        );
      } else {
        // Fallback: reload if response doesn't include status
        await loadOffers(true);
      }

      success('Offer Paused', 'Offer has been paused successfully.');
      setShowActionMenu(null);
    } catch (err) {
      showError('Error', 'Failed to pause offer');
      console.error('Pause offer error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleArchiveOffer = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: 'archive' });
      await offerService.archiveOffer(id);
      success('Offer Archived', 'Offer has been archived successfully.');
      await loadOffers(true); // Skip cache for immediate update
      setShowActionMenu(null);
    } catch (err) {
      showError('Error', 'Failed to archive offer');
      console.error('Archive offer error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExpireOffer = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: 'expire' });
      const response = await offerService.expireOffer(id);

      // Optimistically update the offer in the list
      const responseData = response as unknown as { success: boolean; data?: { lifecycle_status?: string } };
      if (responseData.success && responseData.data?.lifecycle_status) {
        const newStatus = responseData.data.lifecycle_status;
        setOffers(prevOffers =>
          prevOffers.map(offer =>
            Number(offer.id) === id
              ? { ...offer, lifecycle_status: newStatus as LifecycleStatus }
              : offer
          )
        );
      } else {
        // Fallback: reload if response doesn't include status
        await loadOffers(true);
      }

      success('Offer Expired', 'Offer has been expired successfully.');
      setShowActionMenu(null);
    } catch (err) {
      showError('Error', 'Failed to expire offer');
      console.error('Expire offer error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRequestApproval = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: 'request_approval' });
      await offerService.requestApproval(id);
      success('Approval Requested', 'Approval request has been sent successfully.');
      await loadOffers(true); // Skip cache for immediate update
      setShowActionMenu(null);
    } catch (err) {
      showError('Error', 'Failed to request approval');
      console.error('Request approval error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApproveOffer = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: 'approve' });
      await offerService.approveOffer(id);
      success('Offer Approved', 'Offer has been approved successfully.');
      await loadOffers(true); // Skip cache for immediate update
      setShowActionMenu(null);
    } catch (err) {
      showError('Error', 'Failed to approve offer');
      console.error('Approve offer error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectOffer = async (id: number) => {
    try {
      setLoadingAction({ offerId: id, action: 'reject' });
      await offerService.rejectOffer(id);
      success('Offer Rejected', 'Offer has been rejected.');
      await loadOffers(true); // Skip cache for immediate update
      setShowActionMenu(null);
    } catch (err) {
      showError('Error', 'Failed to reject offer');
      console.error('Reject offer error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleViewApprovalHistory = (id: number) => {
    navigate(`/dashboard/offers/${id}/approval-history`);
    setShowActionMenu(null);
  };

  const handleViewLifecycleHistory = (id: number) => {
    navigate(`/dashboard/offers/${id}/lifecycle-history`);
    setShowActionMenu(null);
  };

  // Helper functions for display

  const getStatusBadge = (status: LifecycleStatus) => {
    switch (status) {
      case 'draft':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.surface.background}] text-[${color.text.primary}]`}>Draft</span>;
      case 'active':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.success}] text-[${color.status.success}]`}>Active</span>;
      case 'inactive':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.surface.background}] text-[${color.text.primary}]`}>Inactive</span>;
      case 'paused':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.warning}] text-[${color.status.warning}]`}>Paused</span>;
      case 'expired':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.danger}] text-[${color.status.danger}]`}>Expired</span>;
      case 'archived':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.surface.background}] text-[${color.text.primary}]`}>Archived</span>;
      default:
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.surface.background}] text-[${color.text.primary}]`}>{status}</span>;
    }
  };

  const getApprovalBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.warning}]/10 text-[${color.status.warning}]`}>Pending</span>;
      case 'approved':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.success}]/10 text-[${color.status.success}]`}>Approved</span>;
      case 'rejected':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.status.danger}]/10 text-[${color.status.danger}]`}>Rejected</span>;
      default:
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-[${color.surface.background}] text-[${color.text.primary}]`}>{status}</span>;
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
          style={{ backgroundColor: color.primary.action }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`bg-white rounded-xl shadow-sm border border-[${color.border.default}] p-6 hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${tw.textMuted}`}>Total Offers</p>
              <p className={`text-2xl font-bold ${tw.textPrimary}`}>{totalOffers}</p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm border border-[${color.border.default}] p-6 hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${tw.textMuted}`}>Active</p>
              <p className={`text-2xl font-bold ${tw.textPrimary}`}>
                {offers.filter(o => o.lifecycle_status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm border border-[${color.border.default}] p-6 hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${tw.textMuted}`}>Pending</p>
              <p className={`text-2xl font-bold ${tw.textPrimary}`}>
                {offers.filter(o => o.approval_status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm border border-[${color.border.default}] p-6 hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
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
      <div className={`bg-white rounded-xl shadow-sm border border-[${color.border.default}] p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[${color.text.muted}]`} />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={`pl-10 pr-4 py-3.5 border border-[${color.border.default}] rounded-lg focus:outline-none focus:border-[${color.primary.action}] focus:ring-1 focus:ring-[${color.primary.action}]/20 w-full sm:w-64`}
              />
            </div>
            <HeadlessSelect
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
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
      <div className={`bg-white rounded-xl shadow-sm border border-[${color.border.default}] overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-[${color.primary.action}]`}></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className={`h-12 w-12 text-[${color.status.danger}] mx-auto mb-4`} />
              <p className={`${tw.textSecondary}`}>{error}</p>
            </div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className={`${tw.textSecondary}`}>No offers found</p>
              <button
                onClick={() => navigate('/dashboard/offers/create')}
                className="mt-4 inline-flex items-center px-3 py-2 text-base text-white font-semibold rounded-lg shadow-sm transition-all duration-200"
                style={{ backgroundColor: color.primary.action }}
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
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Offer</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Category</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Approval</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Created</th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`bg-white divide-y divide-[${color.border.default}]`}>
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-base ${tw.textPrimary} truncate`}>{offer.name}</div>
                          <div className={`text-sm ${tw.textSecondary} truncate flex items-center space-x-2 mt-1`}>
                            <span className="truncate">{offer.description}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryName(offer.category_id) === 'Data Offers' ? `bg-[${color.status.info}]/10 text-[${color.status.info}]` :
                        getCategoryName(offer.category_id) === 'Voice Offers' ? `bg-[${color.status.success}]/10 text-[${color.status.success}]` :
                          getCategoryName(offer.category_id) === 'Combo Offers' ? `bg-[${color.primary.accent}]/10 text-[${color.primary.accent}]` :
                            getCategoryName(offer.category_id) === 'Loyalty Rewards' ? `bg-[${color.status.warning}]/10 text-[${color.status.warning}]` :
                              getCategoryName(offer.category_id) === 'Promotional' ? `bg-[${color.primary.action}]/10 text-[${color.primary.action}]` :
                                `bg-[${color.surface.background}] text-[${color.text.primary}]`
                        }`}>
                        {getCategoryName(offer.category_id)}
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
                        {/* Play/Pause buttons - Only show if approved */}
                        {offer.approval_status === 'approved' && offer.lifecycle_status !== 'expired' && offer.lifecycle_status !== 'archived' && (
                          <>
                            {(offer.lifecycle_status === 'paused' || offer.lifecycle_status === 'inactive' || offer.lifecycle_status === 'draft') ? (
                              <button
                                onClick={() => offer.id && handleActivateOffer(Number(offer.id))}
                                disabled={loadingAction?.offerId === Number(offer.id) && loadingAction?.action === 'activate'}
                                className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                                style={{ backgroundColor: 'transparent' }}
                                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                                title={offer.lifecycle_status === 'paused' ? 'Resume Offer' : 'Activate Offer'}
                              >
                                {loadingAction?.offerId === Number(offer.id) && loadingAction?.action === 'activate' ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                ) : (
                                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                )}
                              </button>
                            ) : offer.lifecycle_status === 'active' ? (
                              <button
                                onClick={() => offer.id && handlePauseOffer(Number(offer.id))}
                                disabled={loadingAction?.offerId === Number(offer.id) && loadingAction?.action === 'pause'}
                                className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                                style={{ backgroundColor: 'transparent' }}
                                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                                title="Pause Offer"
                              >
                                {loadingAction?.offerId === Number(offer.id) && loadingAction?.action === 'pause' ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                ) : (
                                  <Pause className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                )}
                              </button>
                            ) : null}
                          </>
                        )}

                        <button
                          onClick={() => offer.id && handleViewOffer(offer.id)}
                          className={`text-[${color.status.info}] hover:text-[${color.status.info}] p-1 rounded`}
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
                        <div className="relative" ref={(el) => { actionMenuRefs.current[offer.id!] = el; }}>
                          <button
                            onClick={(e) => offer.id && handleActionMenuToggle(offer.id, e.currentTarget)}
                            className={`action-button ${tw.textMuted} hover:${tw.textPrimary} p-1 rounded`}
                            title="More Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {showActionMenu === offer.id && dropdownPosition && (
                            <div
                              className="action-dropdown fixed w-72 bg-white border border-gray-200 rounded-lg shadow-xl py-2 pb-4"
                              style={{
                                zIndex: 99999,
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                                maxHeight: '80vh',
                                overflowY: 'auto'
                              }}
                            >
                              {/* Duplicate Offer */}
                              {/* TODO: Re-enable when backend duplicate endpoint is available
                              <button
                                onClick={handleDuplicateOffer}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Copy className="w-4 h-4 mr-3" style={{ color: color.primary.action }} />
                                Duplicate Offer
                              </button>
                              */}

                              {/* Lifecycle Actions - Only show if approved */}
                              {offer.approval_status === 'approved' && (
                                <>
                                  {offer.lifecycle_status === 'draft' && (
                                    <button
                                      onClick={() => offer.id && handleActivateOffer(offer.id)}
                                      className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Play className="w-4 h-4 mr-3 text-green-600" />
                                      Activate Offer
                                    </button>
                                  )}

                                  {offer.lifecycle_status === 'active' && (
                                    <>
                                      <button
                                        onClick={() => offer.id && handlePauseOffer(Number(offer.id))}
                                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                      >
                                        <Pause className="w-4 h-4 mr-3 text-yellow-600" />
                                        Pause Offer
                                      </button>
                                      <button
                                        onClick={() => offer.id && handleDeactivateOffer(Number(offer.id))}
                                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                      >
                                        <XCircle className="w-4 h-4 mr-3 text-orange-600" />
                                        Deactivate Offer
                                      </button>
                                      <button
                                        onClick={() => offer.id && handleExpireOffer(offer.id)}
                                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                      >
                                        <Clock className="w-4 h-4 mr-3 text-gray-600" />
                                        Expire Offer
                                      </button>
                                    </>
                                  )}

                                  {(offer.lifecycle_status === 'paused' || offer.lifecycle_status === 'inactive') && (
                                    <button
                                      onClick={() => offer.id && handleActivateOffer(Number(offer.id))}
                                      className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Play className="w-4 h-4 mr-3 text-green-600" />
                                      {offer.lifecycle_status === 'paused' ? 'Resume Offer' : 'Activate Offer'}
                                    </button>
                                  )}

                                  {/* Archive - Available for any non-archived offer */}
                                  {offer.lifecycle_status !== 'archived' && (
                                    <button
                                      onClick={() => offer.id && handleArchiveOffer(offer.id)}
                                      className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Archive className="w-4 h-4 mr-3" style={{ color: color.primary.action }} />
                                      Archive Offer
                                    </button>
                                  )}
                                </>
                              )}

                              {/* Approval Actions - Context Aware */}
                              {offer.lifecycle_status === 'draft' && offer.approval_status !== 'pending' && (
                                <button
                                  onClick={() => offer.id && handleRequestApproval(offer.id)}
                                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4 mr-3" style={{ color: color.status.info }} />
                                  Request Approval
                                </button>
                              )}

                              {offer.approval_status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => offer.id && handleApproveOffer(offer.id)}
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                                    Approve Offer
                                  </button>
                                  <button
                                    onClick={() => offer.id && handleRejectOffer(offer.id)}
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4 mr-3 text-red-600" />
                                    Reject Offer
                                  </button>
                                </>
                              )}

                              {/* History Links */}
                              <button
                                onClick={() => offer.id && handleViewApprovalHistory(offer.id)}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 mr-3" style={{ color: color.primary.action }} />
                                Approval History
                              </button>

                              <button
                                onClick={() => offer.id && handleViewLifecycleHistory(offer.id)}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Clock className="w-4 h-4 mr-3" style={{ color: color.primary.action }} />
                                Lifecycle History
                              </button>

                              {/* Delete - Dangerous Action */}
                              <button
                                onClick={() => offer.id && handleDeleteOffer(offer.id, offer.name)}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Delete Offer
                              </button>
                            </div>
                          )}
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
        <div className={`bg-white rounded-xl shadow-sm border border-[${color.border.default}] px-4 sm:px-6 py-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className={`text-base ${tw.textSecondary} text-center sm:text-left`}>
              Showing {((filters.page || 1) - 1) * (filters.pageSize || 10) + 1} to{' '}
              {Math.min((filters.page || 1) * (filters.pageSize || 10), totalOffers)} of {totalOffers} offers
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                disabled={(filters.page || 1) <= 1}
                className={`px-3 py-2 text-base border border-[${color.border.default}] rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
              >
                Previous
              </button>
              <span className={`text-base ${tw.textSecondary} px-2`}>
                Page {filters.page || 1} of {Math.ceil(totalOffers / (filters.pageSize || 10))}
              </span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={(filters.page || 1) >= Math.ceil(totalOffers / (filters.pageSize || 10))}
                className={`px-3 py-2 text-base border border-[${color.border.default}] rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
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
