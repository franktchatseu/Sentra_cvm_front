import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, XCircle, Clock, User } from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { campaignService } from "../services/campaignService";
import { useToast } from "../../../contexts/ToastContext";

interface ApprovalHistoryEntry {
  id: number;
  campaign_id: number;
  action: "approved" | "rejected" | "pending";
  comments?: string;
  created_by: number;
  created_at: string;
  user_name?: string;
}

export default function CampaignApprovalHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<ApprovalHistoryEntry[]>([]);
  const [campaignName, setCampaignName] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [historyData, campaignData] = await Promise.all([
          campaignService.getApprovalHistory(parseInt(id)),
          campaignService.getCampaignById(id),
        ]);

        setHistory(historyData as unknown as ApprovalHistoryEntry[]);
        setCampaignName(
          ((campaignData as unknown as Record<string, unknown>)
            ?.name as string) || `Campaign ${id}`
        );
      } catch (error) {
        console.error("Failed to fetch approval history:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load approval history.";
        showError("Approval history unavailable", message);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "approved":
        return `bg-green-100 text-green-800 border-green-200`;
      case "rejected":
        return `bg-red-100 text-red-800 border-red-200`;
      default:
        return `bg-yellow-100 text-yellow-800 border-yellow-200`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/dashboard/campaigns")}
          className={`p-2 rounded-lg hover:bg-[${color.surface.cards}] transition-colors`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
            Approval History
          </h1>
          <p className={`${tw.textSecondary} mt-1 text-sm`}>{campaignName}</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner
              variant="modern"
              size="xl"
              color="primary"
              className="mb-4"
            />
            <p className={`${tw.textMuted} font-medium text-sm`}>
              Loading approval history...
            </p>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div
                key={entry.id || index}
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(entry.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getActionBadge(
                        entry.action
                      )}`}
                    >
                      {entry.action.charAt(0).toUpperCase() +
                        entry.action.slice(1)}
                    </span>
                    <span className={`text-xs ${tw.textMuted}`}>
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  {entry.comments && (
                    <p className={`text-sm ${tw.textSecondary} mb-2`}>
                      {entry.comments}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 text-xs">
                    <User className="w-3 h-3" />
                    <span className={tw.textMuted}>
                      {entry.user_name || `User ID: ${entry.created_by}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className={`${tw.cardHeading} ${tw.textPrimary} mb-1`}>
              No Approval History
            </p>
            <p className={`text-sm ${tw.textMuted}`}>
              This campaign has no approval history yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
