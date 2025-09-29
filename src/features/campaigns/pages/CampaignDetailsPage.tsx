import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Target,
    Eye,
    MousePointer,
    DollarSign,
    AlertCircle,
    Play,
    Pause,
    Edit,
    Trash2,
    Tag
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { color, tw } from '../../../shared/utils/utils';
import LoadingSpinner from '../../../shared/componen../../../shared/components/ui/LoadingSpinner';
// import { campaignService } from '../services/campaignService';
import { CampaignDetails } from '../../../../shared/type./components/steps/campaignDetails';

export default function CampaignDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCampaignDetails = async () => {
            try {
                setIsLoading(true);

                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock campaign data (primary source for now)
                const mockCampaign: CampaignDetails = {
                    id: id || '1',
                    name: 'Summer Data Promotion',
                    description: 'Special promotion offering double data bundles for summer season to increase customer engagement and retention.',
                    type: 'Promotional',
                    category: 'Data Bundle',
                    segment: 'High Value Customers',
                    offer: 'Double Data Bundle',
                    status: 'active',
                    startDate: '2025-01-15',
                    endDate: '2025-01-31',
                    createdDate: '2025-01-10',
                    lastModified: '2025-01-14',
                    performance: {
                        sent: 15420,
                        delivered: 14892,
                        opened: 8934,
                        clicked: 2847,
                        converted: 1847,
                        revenue: 45280,
                        conversionRate: 12.4,
                        openRate: 60.0,
                        clickRate: 19.1
                    }
                };

                setCampaign(mockCampaign);
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
    }, [id, showToast]);

    const getStatusBadge = (status: string) => {
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
                <div className="flex flex-col sm:flex-row xl:flex-row lg:flex-col gap-3">
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm w-fit text-white ${campaign.status === 'active'
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        {campaign.status === 'active' ? (
                            <>
                                <Pause className="w-4 h-4" />
                                Pause Campaign
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Resume Campaign
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => navigate(`/dashboard/campaigns/${id}/edit`)}
                        className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm w-fit"
                        style={{ backgroundColor: color.sentra.main }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                        }}
                    >
                        <Edit className="w-4 h-4" />
                        Edit Campaign
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-red-700 flex items-center gap-2 text-sm w-fit"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
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
                            <p className={`text-sm font-medium ${tw.textMuted}`}>Total Sent</p>
                            <p className={`text-2xl font-bold ${tw.textPrimary}`}>{campaign.performance.sent.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color.entities.segments}20` }}>
                                <Eye className="w-6 h-6" style={{ color: color.entities.segments }} />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className={`text-sm font-medium ${tw.textMuted}`}>Open Rate</p>
                            <p className={`text-2xl font-bold ${tw.textPrimary}`}>{campaign.performance.openRate}%</p>
                        </div>
                    </div>
                </div>

                <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color.entities.offers}20` }}>
                                <MousePointer className="w-6 h-6" style={{ color: color.entities.offers }} />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className={`text-sm font-medium ${tw.textMuted}`}>Click Rate</p>
                            <p className={`text-2xl font-bold ${tw.textPrimary}`}>{campaign.performance.clickRate}%</p>
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
                            <p className={`text-2xl font-bold ${tw.textPrimary}`}>${campaign.performance.revenue.toLocaleString()}</p>
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
                                <div className="flex items-center space-x-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(campaign.status)}`}>
                                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[${color.entities.campaigns}]/10 text-[${color.entities.campaigns}]`}>
                                        <Tag className="w-4 h-4 mr-1" />
                                        {campaign.category}
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
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Type</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    {campaign.type}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Category</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    {campaign.category}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Target Segment</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    {campaign.segment}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Offer</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    {campaign.offer}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Created Date</label>
                                <p className={`text-base ${tw.textPrimary} flex items-center`}>
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    {formatDate(campaign.createdDate)}
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
                                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Start Date</span>
                                <span className={`text-sm ${tw.textPrimary}`}>
                                    {formatDate(campaign.startDate)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>End Date</span>
                                <span className={`text-sm ${tw.textPrimary}`}>
                                    {formatDate(campaign.endDate)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Last Modified</span>
                                <span className={`text-sm ${tw.textPrimary}`}>
                                    {formatDate(campaign.lastModified)}
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
                                    {campaign.performance.delivered.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Opened</span>
                                <span className={`text-sm font-medium ${tw.textPrimary}`}>
                                    {campaign.performance.opened.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Clicked</span>
                                <span className={`text-sm font-medium ${tw.textPrimary}`}>
                                    {campaign.performance.clicked.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${tw.textMuted}`}>Converted</span>
                                <span className={`text-sm font-medium ${tw.textPrimary}`}>
                                    {campaign.performance.converted.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}