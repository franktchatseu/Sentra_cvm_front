import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, AlertCircle } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { offerService } from '../services/offerService';

interface ApprovalHistoryEntry {
    id: number;
    offer_id: number;
    previous_status: string | null;
    new_status: string;
    comments: string | null;
    approved_by: string | null;
    created_at: string;
    created_by: string;
}

export default function OfferApprovalHistoryPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [history, setHistory] = useState<ApprovalHistoryEntry[]>([]);
    const [offerName, setOfferName] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!id) return;

            try {
                setIsLoading(true);
                const [historyData, offerData] = await Promise.all([
                    offerService.getApprovalHistory(parseInt(id)),
                    offerService.getOfferById(parseInt(id))
                ]);

                console.log('Approval history data:', historyData);
                console.log('Offer data:', offerData);

                // Extract data from API response structure
                const historyArray = Array.isArray(historyData)
                    ? historyData
                    : (historyData as unknown as { success: boolean; data: ApprovalHistoryEntry[] })?.data || [];

                const offerInfo = (offerData as unknown as { success: boolean; data: { name: string } })?.data || offerData;

                setHistory(historyArray);
                setOfferName(offerInfo?.name || `Offer ${id}`);
            } catch (error) {
                console.error('Failed to fetch approval history:', error);
                setHistory([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [id]);

    const getActionIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'requires_changes':
                return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case 'pending':
            default:
                return <Clock className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getActionBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'requires_changes':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate(`/dashboard/offers/${id}`)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Approval History</h1>
                    <p className={`${tw.textSecondary} mt-1 text-sm`}>{offerName}</p>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <LoadingSpinner variant="modern" size="xl" color="primary" className="mb-4" />
                        <p className={`${tw.textMuted} font-medium text-sm`}>Loading approval history...</p>
                    </div>
                ) : history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((entry, index) => (
                            <div
                                key={entry.id || index}
                                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {getActionIcon(entry.new_status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            {entry.previous_status && (
                                                <>
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getActionBadge(entry.previous_status)}`}>
                                                        {entry.previous_status.charAt(0).toUpperCase() + entry.previous_status.slice(1).replace('_', ' ')}
                                                    </span>
                                                    <span className={tw.textMuted}>→</span>
                                                </>
                                            )}
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getActionBadge(entry.new_status)}`}>
                                                {entry.new_status.charAt(0).toUpperCase() + entry.new_status.slice(1).replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className={`text-xs ${tw.textMuted}`}>
                                            {new Date(entry.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    {entry.comments && (
                                        <p className={`text-sm ${tw.textSecondary} mb-2`}>{entry.comments}</p>
                                    )}
                                    <div className="flex items-center space-x-2 text-xs">
                                        <User className="w-3 h-3" />
                                        <span className={tw.textMuted}>
                                            {entry.approved_by || entry.created_by || 'System'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className={`text-lg font-semibold ${tw.textPrimary} mb-2`}>No Approval History</p>
                        <p className={`text-sm ${tw.textMuted}`}>This offer has no approval history yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


