import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Filter,
  Search,
  Target,
  Users,
  Calendar,
  MoreHorizontal,
  Eye,
  Play,
  Pause,
  Edit,
  Copy,
  Archive,
  Trash2,
  Download,
  History,
  CheckCircle,
} from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { campaignService } from '../services/campaignService';
import { useFileDownload } from '../../../shared/hooks/useFileDownload';
import { useClickOutside } from '../../../shared/hooks/useClickOutside';
import DeleteConfirmModal from '../../../shared/components/ui/DeleteConfirmModal';

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { downloadBlob } = useFileDownload();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    approvalStatus: 'all',
    startDateFrom: '',
    startDateTo: '',
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  const filterRef = useRef<HTMLDivElement>(null);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const actionMenuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Use click outside hook for filter modal
  useClickOutside(filterRef, () => setShowAdvancedFilters(false), { enabled: showAdvancedFilters });

  // Calculate dropdown position based on button position
  const calculateDropdownPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect();
    const dropdownWidth = 256; // w-64 = 16rem = 256px
    const dropdownHeight = 300; // Approximate height for action menu

    // Position dropdown below button with small gap
    let top = rect.bottom + 8;
    // Align dropdown's right edge with button's right edge for proper alignment
    let left = rect.right - dropdownWidth;

    // Prevent dropdown from going off the left edge of screen
    if (left < 8) left = 8;
    // Prevent dropdown from going off the right edge of screen
    if (left + dropdownWidth > window.innerWidth - 8) {
      left = window.innerWidth - dropdownWidth - 8;
    }

    // If dropdown would go off bottom of screen, show it above the button instead
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = rect.top - dropdownHeight - 8;
    }

    return { top, left };
  };

  const handleActionMenuToggle = (campaignId: number, buttonElement: HTMLElement) => {
    if (showActionMenu === campaignId) {
      setShowActionMenu(null);
      setDropdownPosition(null);
      setDropdownPosition(null);
    } else {
      const position = calculateDropdownPosition(buttonElement);
      setDropdownPosition(position);
      setShowActionMenu(campaignId);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Close action menus when clicking outside
  useEffect(() => {
    const handleClickOutsideActionMenus = (event: MouseEvent) => {
      const clickedOutsideActionMenus = Object.values(actionMenuRefs.current).every(ref =>
        ref && !ref.contains(event.target as Node)
      );
      if (clickedOutsideActionMenus) {
        setShowActionMenu(null);
        setDropdownPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideActionMenus);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideActionMenus);
    };
  }, []);

  const campaigns = [
    {
      id: 1,
      name: 'Summer Data Bundle Promotion',
      description: 'A targeted campaign to promote our summer data bundle offers to high-value customers',
      status: 'active',
      type: 'Acquisition',
      category: 'Promotional',
      segment: 'High Value Users',
      offer: 'Double Data Bundle',
      startDate: '2025-01-15',
      endDate: '2025-01-31',
      performance: {
        sent: 15420,
        delivered: 14892,
        opened: 8934,
        converted: 2847,
        revenue: 45280
      }
    },
    {
      id: 2,
      name: 'Churn Prevention - Q1',
      description: 'Prevent at-risk customers from leaving with special retention offers',
      status: 'scheduled',
      type: 'Retention',
      category: 'Customer Lifecycle',
      segment: 'At Risk Customers',
      offer: 'Special Retention Offer',
      startDate: '2025-01-22',
      endDate: '2025-02-15',
      performance: {
        sent: 0,
        delivered: 0,
        opened: 0,
        converted: 0,
        revenue: 0
      }
    },
    {
      id: 3,
      name: 'New Customer Welcome Series',
      description: 'Welcome new subscribers with onboarding offers and guidance',
      status: 'active',
      type: 'Onboarding',
      category: 'Customer Lifecycle',
      segment: 'New Subscribers',
      offer: 'Welcome Bonus Package',
      startDate: '2025-01-10',
      endDate: '2025-02-10',
      performance: {
        sent: 3245,
        delivered: 3198,
        opened: 2456,
        converted: 894,
        revenue: 12340
      }
    },
    {
      id: 4,
      name: 'Weekend Voice Bundle Push',
      description: 'Promote weekend voice bundles to voice-heavy users',
      status: 'paused',
      type: 'Upsell',
      category: 'Promotional',
      segment: 'Voice Heavy Users',
      offer: 'Weekend Voice Bundle',
      startDate: '2025-01-08',
      endDate: '2025-01-20',
      performance: {
        sent: 8765,
        delivered: 8432,
        opened: 4321,
        converted: 1234,
        revenue: 18750
      }
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Campaigns', count: campaigns.length },
    { value: 'active', label: 'Active', count: campaigns.filter(c => c.status === 'active').length },
    { value: 'scheduled', label: 'Scheduled', count: campaigns.filter(c => c.status === 'scheduled').length },
    { value: 'paused', label: 'Paused', count: campaigns.filter(c => c.status === 'paused').length },
    { value: 'completed', label: 'Completed', count: 0 }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Promotional', label: 'Promotional' },
    { value: 'Seasonal', label: 'Seasonal' },
    { value: 'Product Launch', label: 'Product Launch' },
    { value: 'Customer Lifecycle', label: 'Customer Lifecycle' },
    { value: 'Behavioral Trigger', label: 'Behavioral Trigger' },
    { value: 'Loyalty Program', label: 'Loyalty Program' },
    { value: 'Win-back', label: 'Win-back' },
    { value: 'Educational', label: 'Educational' },
    { value: 'Event-based', label: 'Event-based' }
  ];

  const approvalStatusOptions = [
    { value: 'all', label: 'All Approval Status' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'name', label: 'Campaign Name' },
    { value: 'status', label: 'Status' },
    { value: 'performance', label: 'Performance' }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      active: `bg-[${color.status.success.light}] text-[${color.status.success.main}]`,
      scheduled: `bg-[${color.status.warning.light}] text-[${color.status.warning.main}]`,
      paused: `bg-[${color.ui.gray[100]}] text-[${color.ui.gray[800]}]`,
      completed: `bg-[${color.status.info.light}] text-[${color.status.info.main}]`
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  // Action handlers using service layer
  const handleDuplicateCampaign = async (campaignId: number) => {
    try {
      const newName = `Copy of Campaign ${campaignId}`;
      await campaignService.cloneCampaign(campaignId, { newName });
      console.log('Campaign duplicated successfully');
      // Refresh campaigns list or show success message
      setShowActionMenu(null);
      setDropdownPosition(null);
      setDropdownPosition(null);
    } catch (error) {
      console.error('Failed to duplicate campaign:', error);
    }
  };

  const handleCloneCampaign = async (campaignId: number) => {
    try {
      const newName = `Clone of Campaign ${campaignId}`;
      await campaignService.cloneCampaign(campaignId, { newName });
      console.log('Campaign cloned successfully');
      // Navigate to edit page or show success message
      setShowActionMenu(null);
      setDropdownPosition(null);
    } catch (error) {
      console.error('Failed to clone campaign:', error);
    }
  };

  const handleArchiveCampaign = async (campaignId: number) => {
    try {
      await campaignService.archiveCampaign(campaignId);
      console.log('Campaign archived successfully');
      // Update campaign status or refresh list
      setShowActionMenu(null);
      setDropdownPosition(null);
    } catch (error) {
      console.error('Failed to archive campaign:', error);
    }
  };

  const handleDeleteCampaign = (campaignId: number, campaignName: string) => {
    setCampaignToDelete({ id: campaignId, name: campaignName });
    setShowDeleteModal(true);
    setShowActionMenu(null);
    setDropdownPosition(null);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;

    setIsDeleting(true);
    try {
      await campaignService.deleteCampaign(campaignToDelete.id);
      console.log('Campaign deleted successfully');
      // Remove from list or refresh
      setShowDeleteModal(false);
      setCampaignToDelete(null);
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCampaignToDelete(null);
  };

  const handleExportCampaign = async (campaignId: number) => {
    try {
      const blob = await campaignService.exportCampaign(campaignId);
      downloadBlob(blob, `campaign-${campaignId}-data.csv`);
      setShowActionMenu(null);
      setDropdownPosition(null);
    } catch (error) {
      console.error('Failed to export campaign:', error);
    }
  };

  // const handleViewAnalytics = (campaignId: number) => {
  //   navigate(`/dashboard/campaigns/${campaignId}/analytics`);
  //   setShowActionMenu(null);
  // };

  // const handleViewApprovalHistory = (campaignId: number) => {
  //   navigate(`/dashboard/campaigns/${campaignId}/approval-history`);
  //   setShowActionMenu(null);
  // };

  // const handleViewLifecycleHistory = (campaignId: number) => {
  //   navigate(`/dashboard/campaigns/${campaignId}/lifecycle-history`);
  //   setShowActionMenu(null);
  // };

  const filteredCampaigns = campaigns.filter(campaign => {
    // Status filter
    const statusMatch = selectedStatus === 'all' || campaign.status === selectedStatus;

    // Search filter
    const searchMatch = searchQuery === '' ||
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const categoryMatch = filters.category === 'all' || campaign.category === filters.category;

    // Date range filter
    const dateMatch = !filters.startDateFrom || !filters.startDateTo ||
      (campaign.startDate >= filters.startDateFrom && campaign.startDate <= filters.startDateTo);

    return statusMatch && searchMatch && categoryMatch && dateMatch;
  }).sort((a, b) => {
    // Sorting logic
    switch (filters.sortBy) {
      case 'name':
        return filters.sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case 'status':
        return filters.sortDirection === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      case 'performance':
        return filters.sortDirection === 'asc'
          ? a.performance.revenue - b.performance.revenue
          : b.performance.revenue - a.performance.revenue;
      default: // createdAt
        return filters.sortDirection === 'asc'
          ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Campaigns</h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>Manage and monitor your customer engagement campaigns</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/campaigns/create')}
          className="inline-flex items-center px-4 py-2 font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 text-sm whitespace-nowrap text-white"
          style={{ backgroundColor: color.sentra.main }}
          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Campaign
        </button>
      </div>

      <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStatus === option.value
                  ? 'shadow-lg border-2'
                  : 'border'
                  }`}
                style={{
                  backgroundColor: selectedStatus === option.value ? 'white' : 'white',
                  borderColor: selectedStatus === option.value ? color.sentra.main : color.ui.border,
                  color: selectedStatus === option.value ? color.sentra.main : color.ui.text.secondary
                }}
                onMouseEnter={(e) => {
                  if (selectedStatus !== option.value) {
                    (e.target as HTMLButtonElement).style.backgroundColor = `${color.sentra.main}20`;
                    (e.target as HTMLButtonElement).style.color = color.sentra.main;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStatus !== option.value) {
                    (e.target as HTMLButtonElement).style.backgroundColor = color.ui.surface;
                    (e.target as HTMLButtonElement).style.color = color.ui.text.secondary;
                  }
                }}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[${color.ui.text.muted}]`} />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-2.5 border border-[${color.ui.border}] rounded-lg focus:outline-none focus:ring-0 focus:border-[${color.sentra.main}] w-72 text-sm`}
              />
            </div>
            <button
              onClick={() => setShowAdvancedFilters(true)}
              className={`flex items-center px-4 py-2.5 border border-[${color.ui.border}] ${tw.textSecondary} rounded-lg hover:bg-[${color.ui.surface}] transition-colors text-base font-medium`}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-2xl border border-[${color.ui.border}] overflow-visible`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner variant="modern" size="xl" color="primary" className="mb-4" />
            <p className={`${tw.textMuted} font-medium text-sm`}>Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Campaign</th>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Status</th>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Segment</th>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Performance</th>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Dates</th>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`bg-white divide-y divide-[${color.ui.border}]/50`}>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className={`group hover:bg-[${color.ui.surface}]/30 transition-all duration-300`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0`} style={{ background: `${color.entities.campaigns}` }}>
                          <Target className={`w-5 h-5 text-white`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-base ${tw.textPrimary} truncate`}>{campaign.name}</div>
                          <div className={`text-sm ${tw.textSecondary} truncate flex items-center space-x-2 mt-1`}>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ background: `${color.entities.campaigns}20`, color: color.entities.campaigns }}>
                              {campaign.type}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="truncate">{campaign.offer}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <Users className={`w-4 h-4 text-[${color.entities.segments}] flex-shrink-0`} />
                        <span className={`text-sm ${tw.textPrimary} truncate`}>{campaign.segment}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {campaign.status === 'active' ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className={`${tw.textSecondary}`}>Conversion:</span>
                            <span className={`font-medium ${tw.textPrimary}`}>
                              {((campaign.performance.converted / campaign.performance.sent) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className={`${tw.textSecondary}`}>Revenue:</span>
                            <span className={`font-medium text-[${color.sentra.main}]`}>
                              ${campaign.performance.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className={`text-sm ${tw.textMuted}`}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <Calendar className={`w-4 h-4 text-[${color.entities.analytics}] flex-shrink-0`} />
                        <div className={`text-sm ${tw.textPrimary} space-y-1`}>
                          <div className="font-medium">{campaign.startDate}</div>
                          <div className={`${tw.textMuted} text-sm`}>to {campaign.endDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/dashboard/campaigns/${campaign.id}`)}
                          className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-[${color.entities.campaigns}]/10 transition-all duration-300`}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                        {campaign.status === 'paused' ? (
                          <button className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-green-800 transition-all duration-300`} style={{ backgroundColor: 'transparent' }} onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }} title="Resume">
                            <Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          </button>
                        ) : campaign.status === 'active' ? (
                          <button className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-green-800 transition-all duration-300`} style={{ backgroundColor: 'transparent' }} onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }} title="Pause">
                            <Pause className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          </button>
                        ) : null}
                        <button className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-green-800 transition-all duration-300`} style={{ backgroundColor: 'transparent' }} onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }} title="Edit">
                          <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                        <div className="relative" ref={(el) => { actionMenuRefs.current[campaign.id] = el; }}>
                          <button
                            onClick={(e) => handleActionMenuToggle(campaign.id, e.currentTarget)}
                            className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-[${color.entities.campaigns}]/10 transition-all duration-300`}
                          >
                            <MoreHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          </button>

                          {showActionMenu === campaign.id && dropdownPosition && (
                            <div
                              className="fixed w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-3"
                              style={{
                                zIndex: 99999,
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                                maxHeight: '80vh',
                                overflowY: 'auto'
                              }}
                            >
                              <button
                                onClick={() => handleDuplicateCampaign(campaign.id)}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                              >
                                <Copy className="w-4 h-4 mr-4" style={{ color: color.sentra.main }} />
                                Duplicate Campaign
                              </button>

                              <button
                                onClick={() => handleCloneCampaign(campaign.id)}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                              >
                                <Copy className="w-4 h-4 mr-4" style={{ color: color.sentra.main }} />
                                Clone with Changes
                              </button>

                              <button
                                onClick={() => handleArchiveCampaign(campaign.id)}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                              >
                                <Archive className="w-4 h-4 mr-4" style={{ color: color.sentra.main }} />
                                Archive Campaign
                              </button>

                              <button
                                // onClick={() => handleViewAnalytics(campaign.id)}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                              >
                                <Target className="w-4 h-4 mr-4" style={{ color: color.sentra.main }} />
                                View Analytics
                              </button>

                              <button
                                onClick={() => handleExportCampaign(campaign.id)}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                              >
                                <Download className="w-4 h-4 mr-4" style={{ color: color.sentra.main }} />
                                Export Data
                              </button>

                              <button
                                // onClick={() => handleViewApprovalHistory(campaign.id)}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 mr-4" style={{ color: color.sentra.main }} />
                                Approval History
                              </button>

                              <button
                                // onClick={() => handleViewLifecycleHistory(campaign.id)}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                              >
                                <History className="w-4 h-4 mr-4" style={{ color: color.sentra.main }} />
                                Lifecycle History
                              </button>


                              <button
                                onClick={() => handleDeleteCampaign(campaign.id, campaign.name)}
                                className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-4 text-red-500" />
                                Delete Campaign
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
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${color.entities.campaigns}20` }}>
              <Target className="w-8 h-8" style={{ color: color.entities.campaigns }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {selectedStatus === 'completed'
                ? "No completed campaigns yet. Campaigns will appear here once they finish running."
                : `No ${selectedStatus} campaigns found. Try creating a new campaign or check other status filters.`
              }
            </p>
            {selectedStatus !== 'completed' && (
              <button
                className="mt-4 px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-200"
                style={{ backgroundColor: color.sentra.main }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
              >
                Create Your First Campaign
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filters Side Modal */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAdvancedFilters(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Filter Campaigns</h2>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Approval Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Approval Status</label>
                    <select
                      value={filters.approvalStatus}
                      onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                    >
                      {approvalStatusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date From</label>
                        <input
                          type="date"
                          value={filters.startDateFrom}
                          onChange={(e) => setFilters({ ...filters, startDateFrom: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date To</label>
                        <input
                          type="date"
                          value={filters.startDateTo}
                          onChange={(e) => setFilters({ ...filters, startDateTo: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sorting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Sort By</label>
                    <div className="space-y-3">
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setFilters({ ...filters, sortDirection: 'asc' })}
                          className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${filters.sortDirection === 'asc'
                            ? 'bg-[#3b8169] text-white border-[#3b8169]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          ↑ Ascending
                        </button>
                        <button
                          onClick={() => setFilters({ ...filters, sortDirection: 'desc' })}
                          className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${filters.sortDirection === 'desc'
                            ? 'bg-[#3b8169] text-white border-[#3b8169]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          ↓ Descending
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setFilters({
                        category: 'all',
                        approvalStatus: 'all',
                        startDateFrom: '',
                        startDateTo: '',
                        sortBy: 'createdAt',
                        sortDirection: 'desc'
                      });
                      setSearchQuery('');
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#3b8169] rounded-lg hover:bg-[#2d5f4a] transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
        itemName={campaignToDelete?.name || ''}
        isLoading={isDeleting}
        confirmText="Delete Campaign"
        cancelText="Cancel"
      />
    </div>
  );
}