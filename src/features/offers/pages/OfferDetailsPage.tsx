import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Gift,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Play,
    Pause,
    Archive,
    MoreVertical
} from 'lucide-react';
import { Offer } from '../types/offer';
import { offerService } from '../services/offerService';
import { color, tw } from '../../../shared/utils/utils';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { useToast } from '../../../contexts/ToastContext';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

export default function OfferDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { success, error: showError } = useToast();

    const [offer, setOffer] = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const loadOffer = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const offerData = await offerService.getOfferById(Number(id));
            setOffer(offerData);
        } catch (err) {
            console.error('Failed to load offer:', err);
            setError(err instanceof Error ? err.message : 'Failed to load offer');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            loadOffer();
        }
    }, [id, loadOffer]);

    const handleDelete = async () => {
        if (!offer) return;

        const confirmed = await confirm({
            title: 'Delete Offer',
            message: `Are you sure you want to delete "${offer.name}"? This action cannot be undone.`,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            try {
                await offerService.deleteOffer(Number(id));
                success('Offer Deleted', `"${offer.name}" has been deleted successfully.`);
                navigate('/dashboard/offers');
            } catch {
                showError('Failed to delete offer');
            }
        }
    };

    const handleActivate = async () => {
        try {
            await offerService.activateOffer(Number(id));
            success('Offer Activated', `"${offer?.name}" has been activated successfully.`);
            loadOffer();
        } catch {
            showError('Failed to activate offer');
        }
    };

    const handleDeactivate = async () => {
        try {
            await offerService.deactivateOffer(Number(id));
            success('Offer Deactivated', `"${offer?.name}" has been deactivated successfully.`);
            loadOffer();
        } catch {
            showError('Failed to deactivate offer');
        }
    };

    const handlePause = async () => {
        try {
            await offerService.pauseOffer(Number(id));
            success('Offer Paused', `"${offer?.name}" has been paused successfully.`);
            loadOffer();
        } catch {
            showError('Failed to pause offer');
        }
    };

    const handleApprove = async () => {
        try {
            await offerService.approveOffer(Number(id));
            success('Offer Approved', `"${offer?.name}" has been approved successfully.`);
            loadOffer();
        } catch {
            showError('Failed to approve offer');
        }
    };

    const handleReject = async () => {
        try {
            await offerService.rejectOffer(Number(id));
            success('Offer Rejected', `"${offer?.name}" has been rejected.`);
            loadOffer();
        } catch {
            showError('Failed to reject offer');
        }
    };

    const getLifecycleStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return { bg: 'bg-green-100', text: 'text-green-800', icon: Play };
            case 'paused':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Pause };
            case 'draft':
                return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle };
            case 'archived':
                return { bg: 'bg-red-100', text: 'text-red-800', icon: Archive };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle };
        }
    };

    const getApprovalStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
            case 'rejected':
                return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
            case 'pending':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className={`text-xl font-semibold ${tw.textPrimary} mb-2`}>Offer Not Found</h2>
                    <p className={`${tw.textSecondary} mb-4`}>The offer you're looking for doesn't exist or has been deleted.</p>
                    <button
                        onClick={() => navigate('/dashboard/offers')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200"
                    >
                        Back to Offers
                    </button>
                </div>
            </div>
        );
    }

    const lifecycleStatus = getLifecycleStatusColor(offer.lifecycle_status);
    const approvalStatus = getApprovalStatusColor(offer.approval_status);
    const LifecycleIcon = lifecycleStatus.icon;
    const ApprovalIcon = approvalStatus.icon;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard/offers')}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Offer Details</h1>
                                <p className={`${tw.textSecondary} mt-2 text-sm`}>View and manage offer information</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* Lifecycle Actions */}
                            {offer.lifecycle_status === 'draft' && (
                                <button
                                    onClick={handleActivate}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm"
                                >
                                    <Play className="w-4 h-4" />
                                    Activate
                                </button>
                            )}

                            {offer.lifecycle_status === 'active' && (
                                <>
                                    <button
                                        onClick={handlePause}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm"
                                    >
                                        <Pause className="w-4 h-4" />
                                        Pause
                                    </button>
                                    <button
                                        onClick={handleDeactivate}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm"
                                    >
                                        <Archive className="w-4 h-4" />
                                        Deactivate
                                    </button>
                                </>
                            )}

                            {/* Approval Actions */}
                            {offer.approval_status === 'pending' && (
                                <>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <button
                                        onClick={handleApprove}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </>
                            )}

                            {/* Edit Button */}
                            <button
                                onClick={() => navigate(`/dashboard/offers/${id}/edit`)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>

                            {/* More Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                {showMoreMenu && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                        <button
                                            onClick={handleDelete}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Offer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Main Offer Info */}
                    <div className={`bg-white rounded-lg border border-[${color.ui.border}] p-6`}>
                        <div className="flex items-start space-x-4">
                            <div
                                className="h-12 w-12 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: color.entities.offers }}
                            >
                                <Gift className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className={`text-xl font-bold ${tw.textPrimary} mb-2`}>{offer.name}</h2>
                                <p className={`${tw.textSecondary} mb-4`}>
                                    {offer.description || 'No description available'}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${lifecycleStatus.bg} ${lifecycleStatus.text}`}>
                                        <LifecycleIcon className="w-4 h-4 mr-1" />
                                        {offer.lifecycle_status}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${approvalStatus.bg} ${approvalStatus.text}`}>
                                        <ApprovalIcon className="w-4 h-4 mr-1" />
                                        {offer.approval_status}
                                    </span>
                                    {offer.reusable && (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[${color.status.info.light}] text-[${color.status.info.main}]`}>
                                            Reusable
                                        </span>
                                    )}
                                    {offer.multi_language && (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[${color.entities.offers}]/10 text-[${color.entities.offers}]`}>
                                            Multi-language
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Offer Details */}
                    <div className={`bg-white rounded-lg border border-[${color.ui.border}] p-6`}>
                        <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>Offer Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Offer ID</label>
                                <p className={`text-base ${tw.textPrimary} font-mono`}>
                                    {offer.id}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Category</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    {offer.category?.name || 'Uncategorized'}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Product</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    {offer.product?.name || 'No product assigned'}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Offer Type</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    Not specified
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Created Date</label>
                                <p className={`text-base ${tw.textPrimary} flex items-center`}>
                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                    {offer.created_at ? new Date(offer.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className={`text-sm font-medium ${tw.textMuted} block mb-1`}>Last Updated</label>
                                <p className={`text-base ${tw.textPrimary}`}>
                                    {offer.updated_at ? new Date(offer.updated_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}