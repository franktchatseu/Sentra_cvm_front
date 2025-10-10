import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Target,
    MousePointer,
    DollarSign,
    AlertCircle,
    Play,
    Pause,
    Edit,
    Trash2,
    Tag,
    CheckCircle,
    XCircle,
    Zap,
    Clock,
    MoreHorizontal
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { color, tw } from '../../../shared/utils/utils';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { campaignService } from '../services/campaignService';
import DeleteConfirmModal from '../../../shared/components/ui/DeleteConfirmModal';
import { Campaign } from '../types/campaign';

export default function CampaignDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [rejectComments, setRejectComments] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [categoryName, setCategoryName] = useState<string>('Uncategorized');

    useEffect(() => {
        const fetchCampaignDetails = async () => {
            try {
                setIsLoading(true);

                // Skip cache to get fresh data
                const response = await campaignService.getCampaignById(id!, true) as { data?: Campaign; success?: boolean };
                const campaignData = response.data || response as Campaign;

                // Add dummy segment if not present (same logic as CampaignsPage for consistency)
                if (!(campaignData as { segment?: string }).segment) {
                    const existingSegments = [
                        'High Value Customers',
                        'At Risk Customers',
                        'New Subscribers',
                        'Voice Heavy Users',
                        'Data Bundle Enthusiasts',
                        'Weekend Warriors',
                        'Business Customers',
                        'Dormant Users'
                    ];
                    const campaignId = parseInt(campaignData.id);
                    (campaignData as { segment?: string }).segment = existingSegments[campaignId % existingSegments.length];
                }

                setCampaign(campaignData);

                // Fetch category name if category_id exists
                if (campaignData.category_id) {
                    try {
                        const categoriesResponse = await campaignService.getCampaignCategories() as { data?: Array<{ id: string | number; name: string }> };
                        const categories = categoriesResponse.data || [];
                        const category = categories.find(cat => String(cat.id) === String(campaignData.category_id));
                        if (category) {
                            setCategoryName(category.name);
                        }
                    } catch (error) {
                        console.error('Failed to fetch category name:', error);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch campaign details:', error);
                showToast('error', 'Failed to load campaign details');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCampaignDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Action handlers
    // Note: Campaigns are automatically set to 'pending' approval status when created
    // No manual submit is needed - editing a rejected campaign automatically resets to pending

    const handleApproveCampaign = async () => {
        if (!id) return;

        try {
            setIsActionLoading(true);
            await campaignService.approveCampaign(parseInt(id), { comments: 'Approved from details page' });
            showToast('success', 'Campaign approved successfully');
            // Refresh campaign data
            if (campaign) {
                setCampaign({ ...campaign, approval_status: 'approved' });
            }
        } catch (error) {
            console.error('Failed to approve campaign:', error);
            showToast('error', 'Failed to approve campaign');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRejectCampaign = async () => {
        if (!id || !rejectComments.trim()) {
            showToast('error', 'Please provide rejection comments');
            return;
        }

        try {
            setIsActionLoading(true);
            await campaignService.rejectCampaign(parseInt(id), { comments: rejectComments });
            showToast('success', 'Campaign rejected');
            setShowRejectModal(false);
            setRejectComments('');
            // Refresh campaign data
            if (campaign) {
                setCampaign({ ...campaign, approval_status: 'rejected' });
            }
        } catch (error) {
            console.error('Failed to reject campaign:', error);
            showToast('error', 'Failed to reject campaign');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleActivateCampaign = async () => {
        if (!id) return;

        try {
            setIsActionLoading(true);
            await campaignService.activateCampaign(parseInt(id));
            showToast('success', 'Campaign activated successfully');
            // Refresh campaign data
            if (campaign) {
                setCampaign({ ...campaign, status: 'active' });
            }
        } catch (error) {
            console.error('Failed to activate campaign:', error);
            showToast('error', 'Failed to activate campaign');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handlePauseCampaign = async () => {
        if (!id) return;

        try {
            setIsActionLoading(true);
            const pauseResponse = await campaignService.pauseCampaign(parseInt(id), { comments: 'Paused from details page' });
            showToast('success', 'Campaign paused');

            // Use fresh API data instead of optimistic update
            const responseData = pauseResponse as unknown as { success: boolean; data?: { status?: string } };
            if (responseData.success && responseData.data?.status) {
                const newCampaign = { ...campaign, status: responseData.data.status } as Campaign;
                setCampaign(newCampaign);
            }
        } catch (error) {
            console.error('Failed to pause campaign:', error);
            showToast('error', 'Failed to pause campaign');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleResumeCampaign = async () => {
        if (!id) return;

        try {
            setIsActionLoading(true);
            const resumeResponse = await campaignService.resumeCampaign(parseInt(id));
            showToast('success', 'Campaign resumed');

            // Use fresh API data instead of optimistic update
            const responseData = resumeResponse as unknown as { success: boolean; data?: { status?: string } };
            if (responseData.success && responseData.data?.status) {
                setCampaign({ ...campaign, status: responseData.data.status } as Campaign);
            }
        } catch (error) {
            console.error('Failed to resume campaign:', error);
            showToast('error', 'Failed to resume campaign');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteCampaign = async () => {
        if (!id) return;

        try {
            setIsActionLoading(true);
            await campaignService.deleteCampaign(parseInt(id));
            showToast('success', 'Campaign deleted successfully');
            navigate('/dashboard/campaigns');
        } catch (error) {
            console.error('Failed to delete campaign:', error);
            showToast('error', 'Failed to delete campaign');
        } finally {
            setIsActionLoading(false);
            setShowDeleteModal(false);
        }
    };

    const getStatusBadge = (status: string | undefined) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getApprovalBadge = (status?: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner variant="modern" size="xl" color="primary" />
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <AlertCircle className={`w-16 h-16 text-[${color.entities.campaigns}] mx-auto mb-4`} />
                    <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
                        Campaign Not Found
                    </h3>
                    <p className={`${tw.textMuted} mb-6`}>
                        The campaign you are looking for does not exist.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/campaigns')}
                        className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto text-base text-white"
                        style={{ backgroundColor: color.sentra.main }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Campaigns
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard/campaigns')}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Campaign Details</h1>
                        <p className={`${tw.textSecondary} mt-2 text-sm`}>View and manage campaign information</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* Primary Action - Based on Status */}
                    {campaign.approval_status === 'pending' && (
                        <button
                            onClick={handleApproveCampaign}
                            disabled={isActionLoading}
                            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 bg-white hover:bg-[#3A5A40]/20 text-gray-700 border border-gray-200"
                        >
                            {isActionLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            ) : (
                                <CheckCircle className="w-4 h-4" />
                            )}
                            {isActionLoading ? 'Approving...' : 'Approve'}
                        </button>
                    )}


                    {campaign.approval_status === 'approved' && campaign.status === 'draft' && (
                        <button
                            onClick={handleActivateCampaign}
                            disabled={isActionLoading}
                            className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50"
                            style={{ backgroundColor: color.entities.campaigns }}
                        >
                            {isActionLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Zap className="w-4 h-4" />
                            )}
                            {isActionLoading ? 'Activating...' : 'Activate'}
                        </button>
                    )}

                    {campaign.status === 'active' && (
                        <button
                            onClick={handlePauseCampaign}
                            disabled={isActionLoading}
                            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 bg-white hover:bg-[#3A5A40]/20 text-gray-700 border border-gray-200"
                        >
                            {isActionLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            ) : (
                                <Pause className="w-4 h-4" />
                            )}
                            {isActionLoading ? 'Pausing...' : 'Pause'}
                        </button>
                    )}

                    {campaign.status === 'paused' && (
                        <button
                            onClick={handleResumeCampaign}
                            disabled={isActionLoading}
                            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 bg-white hover:bg-[#3A5A40]/20 text-gray-700 border border-gray-200"
                        >
                            {isActionLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                            {isActionLoading ? 'Resuming...' : 'Resume'}
                        </button>
                    )}

                    {/* Edit Button - Always Visible */}
                    <button
                        onClick={() => navigate(`/dashboard/campaigns/${id}/edit`)}
                        className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm"
                        style={{ backgroundColor: color.sentra.main }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                        }}
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm bg-white hover:bg-[#3A5A40]/20 text-gray-700"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                            More
                        </button>

                        {showMoreMenu && (
                            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                                {/* Reject - Only if pending */}
                                {campaign.approval_status === 'pending' && (
                                    <button
                                        onClick={() => {
                                            setShowRejectModal(true);
                                            setShowMoreMenu(false);
                                        }}
                                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4 mr-3" />
                                        Reject Campaign
                                    </button>
                                )}

                                {/* Delete - Always available */}
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(true);
                                        setShowMoreMenu(false);
                                    }}
                                    className={`w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors ${campaign.approval_status === 'pending' ? 'border-t border-gray-100 mt-1 pt-2' : ''}`}
                                >
                                    <Trash2 className="w-4 h-4 mr-3" />
                                    Delete Campaign
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color.entities.campaigns}20` }}>
                                <Target className="w-6 h-6" style={{ color: color.entities.campaigns }} />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className={`text-sm font-medium ${tw.textMuted}`}>Delivered</p>
                            <p className={`text-2xl font-bold ${tw.textPrimary}`}>12,450</p>
                        </div>
                    </div>
                </div>

                <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color.entities.segments}20` }}>
                                <MousePointer className="w-6 h-6" style={{ color: color.entities.segments }} />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className={`text-sm font-medium ${tw.textMuted}`}>Response</p>
                            <p className={`text-2xl font-bold ${tw.textPrimary}`}>1,234</p>
                        </div>
                    </div>
                </div>

                <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color.entities.offers}20` }}>
                                <CheckCircle className="w-6 h-6" style={{ color: color.entities.offers }} />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className={`text-sm font-medium ${tw.textMuted}`}>Converted</p>
                            <p className={`text-2xl font-bold ${tw.textPrimary}`}>456</p>
                        </div>
                    </div>
                </div>

                <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color.sentra.main}20` }}>
                                <DollarSign className="w-6 h-6" style={{ color: color.sentra.main }} />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className={`text-sm font-medium ${tw.textMuted}`}>Revenue</p>
                            <p className={`text-2xl font-bold ${tw.textPrimary}`}>$12,345</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Campaign Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                        <div className="flex items-start space-x-4">
                            <div
                                className="h-12 w-12 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: color.entities.campaigns }}
                            >
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className={`text-xl font-bold ${tw.textPrimary} mb-2`}>{campaign.name}</h2>
                                <p className={`${tw.textSecondary} mb-4`}>
                                    {campaign.description}
                                </p>
                                <div className="flex items-center flex-wrap gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(campaign.status)}`}>
                                        {campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1)}
                                    </span>
                                    {campaign.approval_status && (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getApprovalBadge(campaign.approval_status)}`}>
                                            {campaign.approval_status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                            {campaign.approval_status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                            {campaign.approval_status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                            {campaign.approval_status?.charAt(0).toUpperCase() + campaign.approval_status?.slice(1)}
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[${color.entities.campaigns}]/10 text-[${color.entities.campaigns}]`}>
                                        <Tag className="w-4 h-4 mr-1" />
                                        {categoryName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Details */}
                    <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>Campaign Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Campaign ID</label>
                                <p className={`text-base ${tw.textPrimary} font-mono`}>
                                    {campaign.id}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Objective</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    {campaign.objective?.replace('_', ' ').toUpperCase()}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Category</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    {categoryName}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Segments</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    {(campaign as { segment?: string }).segment || 'No segments assigned'}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Offers</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    {(campaign as { offers?: unknown[] }).offers?.length || 0} offers
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Created Date</label>
                                <p className={`text-base ${tw.textPrimary} flex items-center`}>
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    {formatDate(campaign.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Campaign Stats */}
                    <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>Campaign Statistics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Status</span>
                                <span className={`text-sm font-medium ${campaign.status === 'active' ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                    {campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Start Date</span>
                                <span className={`text-sm ${tw.textPrimary}`}>
                                    {campaign.start_date ? formatDate(campaign.start_date) : 'Not set'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>End Date</span>
                                <span className={`text-sm ${tw.textPrimary}`}>
                                    {campaign.end_date ? formatDate(campaign.end_date) : 'Not set'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Last Modified</span>
                                <span className={`text-sm ${tw.textPrimary}`}>
                                    {formatDate(campaign.updated_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>Performance Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Delivered</span>
                                <span className={`text-sm font-medium ${tw.textPrimary}`}>
                                    12,450
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Response</span>
                                <span className={`text-sm font-medium ${tw.textPrimary}`}>
                                    1,234
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Converted</span>
                                <span className={`text-sm font-medium ${tw.textPrimary}`}>
                                    456
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Revenue</span>
                                <span className={`text-sm font-medium text-[${color.sentra.main}]`}>
                                    $12,345
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Campaign Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center px-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRejectModal(false)} />
                        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-semibold ${tw.textPrimary}`}>Reject Campaign</h3>
                                    <p className={`text-sm ${tw.textMuted}`}>Please provide a reason</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
                                    Rejection Comments <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectComments}
                                    onChange={(e) => setRejectComments(e.target.value)}
                                    placeholder="Explain why this campaign is being rejected..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows={4}
                                    maxLength={500}
                                />
                                <p className={`text-xs ${tw.textMuted} mt-1`}>
                                    {rejectComments.length}/500 characters
                                </p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectComments('');
                                    }}
                                    disabled={isActionLoading}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectCampaign}
                                    disabled={isActionLoading || !rejectComments.trim()}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    {isActionLoading ? 'Rejecting...' : 'Reject Campaign'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteCampaign}
                title="Delete Campaign"
                description="Are you sure you want to delete this campaign? This action cannot be undone and all campaign data will be permanently removed."
                itemName={campaign?.name || ''}
                isLoading={isActionLoading}
                confirmText="Delete Campaign"
                cancelText="Cancel"
            />
        </div>
    );
}