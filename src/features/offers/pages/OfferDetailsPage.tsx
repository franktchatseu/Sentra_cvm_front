import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Gift,
    Package,
    BarChart3,
    Users,
    Zap,
    TestTube,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Play,
    Pause,
    Archive,
    MoreVertical,
    Plus
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

    const getLifecycleStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return { bg: `bg-[${color.status.success.light}]`, text: `text-[${color.status.success.main}]`, icon: CheckCircle };
            case 'draft':
                return { bg: `bg-[${color.ui.gray[100]}]`, text: `text-[${color.ui.gray[600]}]`, icon: Clock };
            case 'inactive':
                return { bg: `bg-[${color.status.warning.light}]`, text: `text-[${color.status.warning.main}]`, icon: Pause };
            case 'expired':
                return { bg: `bg-[${color.status.error.light}]`, text: `text-[${color.status.error.main}]`, icon: XCircle };
            case 'archived':
                return { bg: `bg-[${color.ui.gray[200]}]`, text: `text-[${color.ui.gray[700]}]`, icon: Archive };
            default:
                return { bg: `bg-[${color.ui.gray[100]}]`, text: `text-[${color.ui.gray[600]}]`, icon: AlertCircle };
        }
    };

    const getApprovalStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return { bg: `bg-[${color.status.success.light}]`, text: `text-[${color.status.success.main}]`, icon: CheckCircle };
            case 'pending':
                return { bg: `bg-[${color.status.warning.light}]`, text: `text-[${color.status.warning.main}]`, icon: Clock };
            case 'rejected':
                return { bg: `bg-[${color.status.error.light}]`, text: `text-[${color.status.error.main}]`, icon: XCircle };
            case 'requires_changes':
                return { bg: `bg-[${color.status.info.light}]`, text: `text-[${color.status.info.main}]`, icon: AlertCircle };
            default:
                return { bg: `bg-[${color.ui.gray[100]}]`, text: `text-[${color.ui.gray[600]}]`, icon: AlertCircle };
        }
    };

    const handleDelete = async () => {
        if (!offer) return;

        const confirmed = await confirm({
            title: 'Delete Offer',
            message: `Are you sure you want to delete "${offer.name}"? This action cannot be undone.`,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            await offerService.deleteOffer(Number(id));
            success('Offer Deleted', `"${offer.name}" has been deleted successfully.`);
            navigate('/dashboard/offers');
        } catch (err) {
            console.error('Failed to delete offer:', err);
            showError('Error', err instanceof Error ? err.message : 'Failed to delete offer');
        }
    };

    const handleActivate = async () => {
        if (!offer) return;
        try {
            await offerService.activateOffer(Number(id));
            success('Offer Activated', `"${offer.name}" has been activated successfully.`);
            loadOffer();
        } catch (err) {
            showError('Error', err instanceof Error ? err.message : 'Failed to activate offer');
        }
    };

    const handleDeactivate = async () => {
        if (!offer) return;
        try {
            await offerService.deactivateOffer(Number(id));
            success('Offer Deactivated', `"${offer.name}" has been deactivated successfully.`);
            loadOffer();
        } catch (err) {
            showError('Error', err instanceof Error ? err.message : 'Failed to deactivate offer');
        }
    };

    const handlePause = async () => {
        if (!offer) return;
        try {
            await offerService.pauseOffer(Number(id));
            success('Offer Paused', `"${offer.name}" has been paused successfully.`);
            loadOffer();
        } catch (err) {
            showError('Error', err instanceof Error ? err.message : 'Failed to pause offer');
        }
    };

    const handleApprove = async () => {
        if (!offer) return;
        try {
            await offerService.approveOffer(Number(id));
            success('Offer Approved', `"${offer.name}" has been approved successfully.`);
            loadOffer();
        } catch (err) {
            showError('Error', err instanceof Error ? err.message : 'Failed to approve offer');
        }
    };

    const handleReject = async () => {
        if (!offer) return;
        try {
            await offerService.rejectOffer(Number(id));
            success('Offer Rejected', `"${offer.name}" has been rejected.`);
            loadOffer();
        } catch (err) {
            showError('Error', err instanceof Error ? err.message : 'Failed to reject offer');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <Gift className={`w-16 h-16 text-[${color.entities.offers}] mx-auto mb-4`} />
                    <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
                        {error ? 'Error Loading Offer' : 'Offer Not Found'}
                    </h3>
                    <p className={`${tw.textMuted} mb-6`}>
                        {error || 'The offer you are looking for does not exist.'}
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/offers')}
                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto text-sm text-white"
                        style={{ backgroundColor: color.sentra.main }}
                    >
                        <ArrowLeft className="w-4 h-4" />
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
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
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => navigate(`/dashboard/offers/${id}/edit`)}
                        className="px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
                        style={{ backgroundColor: color.sentra.main }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                        }}
                    >
                        <Edit className="w-4 h-4" />
                        Edit Offer
                    </button>

                    {/* More Actions Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:bg-gray-200 flex items-center gap-2 text-sm"
                        >
                            <MoreVertical className="w-4 h-4" />
                            Actions
                        </button>

                        {showMoreMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMoreMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                    {/* Lifecycle Actions */}
                                    {offer.lifecycle_status === 'draft' && (
                                        <button
                                            onClick={() => {
                                                handleActivate();
                                                setShowMoreMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <Play className="w-4 h-4 text-green-600" />
                                            Activate Offer
                                        </button>
                                    )}

                                    {offer.lifecycle_status === 'active' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    handlePause();
                                                    setShowMoreMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <Pause className="w-4 h-4 text-yellow-600" />
                                                Pause Offer
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleDeactivate();
                                                    setShowMoreMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4 text-red-600" />
                                                Deactivate Offer
                                            </button>
                                        </>
                                    )}

                                    {/* Approval Actions */}
                                    {offer.approval_status === 'pending' && (
                                        <>
                                            <div className="border-t border-gray-200 my-2"></div>
                                            <button
                                                onClick={() => {
                                                    handleApprove();
                                                    setShowMoreMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                Approve Offer
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleReject();
                                                    setShowMoreMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4 text-red-600" />
                                                Reject Offer
                                            </button>
                                        </>
                                    )}

                                    <div className="border-t border-gray-200 my-2"></div>
                                    <button
                                        onClick={() => {
                                            handleDelete();
                                            setShowMoreMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Offer
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Offer Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Offer Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information Card */}
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
                                            <Zap className="w-4 h-4 mr-1" />
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

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className={`text-sm ${tw.textMuted} mb-1`}>Category</p>
                                <p className={`text-sm font-medium ${tw.textPrimary}`}>
                                    {offer.category?.name || 'Uncategorized'}
                                </p>
                            </div>
                            <div>
                                <p className={`text-sm ${tw.textMuted} mb-1`}>Product</p>
                                <p className={`text-sm font-medium ${tw.textPrimary}`}>
                                    {offer.product?.name || 'No product assigned'}
                                </p>
                            </div>
                            <div>
                                <p className={`text-sm ${tw.textMuted} mb-1`}>Created</p>
                                <p className={`text-sm font-medium ${tw.textPrimary}`}>
                                    {offer.created_at ? new Date(offer.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className={`text-sm ${tw.textMuted} mb-1`}>Last Updated</p>
                                <p className={`text-sm font-medium ${tw.textPrimary}`}>
                                    {offer.updated_at ? new Date(offer.updated_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Linked Products Card */}
                    <div className={`bg-white rounded-lg border border-[${color.ui.border}] p-6`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: color.entities.products }}
                                >
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h3 className={`text-lg font-semibold ${tw.textPrimary}`}>Linked Products</h3>
                            </div>
                            <button
                                className="px-3 py-1.5 text-sm text-white rounded-lg transition-colors font-medium flex items-center gap-1"
                                style={{ backgroundColor: color.sentra.main }}
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {offer.products && offer.products.length > 0 ? (
                                offer.products.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Package className={`w-4 h-4 text-[${color.entities.products}]`} />
                                            <div>
                                                <p className={`text-sm font-medium ${tw.textPrimary}`}>{product.name}</p>
                                                <p className={`text-xs ${tw.textMuted}`}>{product.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Package className={`w-12 h-12 text-[${color.ui.gray[300]}] mx-auto mb-2`} />
                                    <p className={`text-sm ${tw.textMuted}`}>No products linked</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tracking Sources Card */}
                    <div className={`bg-white rounded-lg border border-[${color.ui.border}] p-6`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-100"
                                >
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className={`text-lg font-semibold ${tw.textPrimary}`}>Tracking Sources</h3>
                            </div>
                            <button
                                className="px-3 py-1.5 text-sm text-white rounded-lg transition-colors font-medium flex items-center gap-1"
                                style={{ backgroundColor: color.sentra.main }}
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                        <div className="text-center py-8">
                            <BarChart3 className={`w-12 h-12 text-[${color.ui.gray[300]}] mx-auto mb-2`} />
                            <p className={`text-sm ${tw.textMuted}`}>No tracking sources configured</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Personalization Rules Card */}
                    <div className={`bg-white rounded-lg border border-[${color.ui.border}] p-6`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-100">
                                    <Users className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className={`text-base font-semibold ${tw.textPrimary}`}>Personalization</h3>
                            </div>
                        </div>
                        <div className="text-center py-6">
                            <Users className={`w-10 h-10 text-[${color.ui.gray[300]}] mx-auto mb-2`} />
                            <p className={`text-sm ${tw.textMuted}`}>No rules set</p>
                        </div>
                    </div>

                    {/* A/B Tests Card */}
                    <div className={`bg-white rounded-lg border border-[${color.ui.border}] p-6`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-orange-100">
                                    <TestTube className="w-5 h-5 text-orange-600" />
                                </div>
                                <h3 className={`text-base font-semibold ${tw.textPrimary}`}>A/B Tests</h3>
                            </div>
                        </div>
                        <div className="text-center py-6">
                            <TestTube className={`w-10 h-10 text-[${color.ui.gray[300]}] mx-auto mb-2`} />
                            <p className={`text-sm ${tw.textMuted}`}>No tests running</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className={`bg-white rounded-lg border border-[${color.ui.border}] p-6`}>
                        <h3 className={`text-base font-semibold ${tw.textPrimary} mb-4`}>Quick Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm ${tw.textMuted}`}>Offer ID</span>
                                <span className={`text-sm font-medium ${tw.textPrimary}`}>#{offer.id}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm ${tw.textMuted}`}>Status</span>
                                <span className={`text-sm font-medium ${tw.textPrimary}`}>{offer.lifecycle_status}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm ${tw.textMuted}`}>Approval</span>
                                <span className={`text-sm font-medium ${tw.textPrimary}`}>{offer.approval_status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

