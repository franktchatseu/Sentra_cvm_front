import { Users, Gift, Target, TrendingUp } from "lucide-react";
import {
  CreateCampaignRequest,
  CampaignSegment,
  CampaignOffer,
} from "../../types/campaign";
import { color, tw, components } from "../../../../shared/utils/utils";

interface CampaignPreviewStepProps {
  formData: CreateCampaignRequest;
  selectedSegments: CampaignSegment[];
  selectedOffers: CampaignOffer[];
}

export default function CampaignPreviewStep({
  formData,
  selectedSegments,
  selectedOffers,
}: CampaignPreviewStepProps) {
  const totalAudienceSize = selectedSegments.reduce(
    (total, segment) => total + (segment.customer_count || 0),
    0
  );
  const estimatedCost = totalAudienceSize * 0.05;
  const estimatedRevenue = totalAudienceSize * 2.5;
  const estimatedROI =
    totalAudienceSize > 0
      ? ((estimatedRevenue - estimatedCost) / (estimatedCost || 1)) * 100
      : 0;

  const getObjectiveLabel = (objective: string) => {
    const labels = {
      acquisition: "New Customer Acquisition",
      retention: "Customer Retention",
      churn_prevention: "Churn Prevention",
      upsell_cross_sell: "Upsell/Cross-sell",
      reactivation: "Dormant Customer Reactivation",
    };
    return labels[objective as keyof typeof labels] || objective;
  };

  const formatDate = (value?: string) => {
    if (!value) return "Not scheduled";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  };

  const readinessChecks = [
    {
      label: "Segments configured",
      complete: selectedSegments.length > 0,
    },
    {
      label: "Offers mapped",
      complete: selectedOffers.length > 0,
    },
    {
      label: "Campaign details completed",
      complete: Boolean(formData.name && formData.objective),
    },
    {
      label: "Schedule defined",
      complete: Boolean(formData.start_date && formData.end_date),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Review & Launch
        </h2>
        <p className="text-sm text-gray-600">
          Validate your campaign structure, audience coverage, and offer
          mappings before launching.
        </p>
      </div>

      {/* Campaign Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: `${color.primary.accent}10`,
            borderColor: `${color.primary.accent}40`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color.primary.accent}20` }}
            >
              <Target
                className="w-5 h-5"
                style={{ color: color.primary.accent }}
              />
            </div>
            <div>
              <div
                className="text-2xl font-bold"
                style={{ color: color.primary.accent }}
              >
                {selectedSegments.length}
              </div>
              <div className={`text-xs ${tw.textSecondary}`}>Segments</div>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: `${color.status.success}10`,
            borderColor: `${color.status.success}40`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color.status.success}20` }}
            >
              <Users
                className="w-5 h-5"
                style={{ color: color.status.success }}
              />
            </div>
            <div>
              <div
                className="text-2xl font-bold"
                style={{ color: color.status.success }}
              >
                {totalAudienceSize.toLocaleString()}
              </div>
              <div className={`text-xs ${tw.textSecondary}`}>Total Reach</div>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: `${color.tertiary.tag1}10`,
            borderColor: `${color.tertiary.tag1}40`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color.tertiary.tag1}20` }}
            >
              <Gift
                className="w-5 h-5"
                style={{ color: color.tertiary.tag1 }}
              />
            </div>
            <div>
              <div
                className="text-2xl font-bold"
                style={{ color: color.tertiary.tag1 }}
              >
                {selectedOffers.length}
              </div>
              <div className={`text-xs ${tw.textSecondary}`}>Offers</div>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: `${color.status.warning}10`,
            borderColor: `${color.status.warning}40`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color.status.warning}20` }}
            >
              <TrendingUp
                className="w-5 h-5"
                style={{ color: color.status.warning }}
              />
            </div>
            <div>
              <div
                className="text-2xl font-bold"
                style={{ color: color.status.warning }}
              >
                {estimatedROI.toFixed(0)}%
              </div>
              <div className={`text-xs ${tw.textSecondary}`}>Est. ROI</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          {/* Campaign Details */}
          <div className={components.card.surface}>
            <h3 className={`${tw.cardTitle} ${tw.textPrimary} mb-4`}>
              Campaign Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>
                  Name
                </div>
                <div className={`font-medium ${tw.textPrimary}`}>
                  {formData.name || "Untitled campaign"}
                </div>
              </div>
              <div>
                <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>
                  Objective
                </div>
                <div className={`font-medium ${tw.textPrimary}`}>
                  {getObjectiveLabel(formData.objective)}
                </div>
              </div>
              <div>
                <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>
                  Catalog
                </div>
                <div className={`font-medium ${tw.textPrimary}`}>
                  {formData.category_id
                    ? `Category ${formData.category_id}`
                    : "Not selected"}
                </div>
              </div>
              <div>
                <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>
                  Start Date
                </div>
                <div className={`font-medium ${tw.textPrimary}`}>
                  {formatDate(formData.start_date)}
                </div>
              </div>
              <div>
                <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>
                  End Date
                </div>
                <div className={`font-medium ${tw.textPrimary}`}>
                  {formatDate(formData.end_date)}
                </div>
              </div>
              <div>
                <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>
                  Tags
                </div>
                <div className={`font-medium ${tw.textPrimary}`}>
                  {formData.tag || "None"}
                </div>
              </div>
            </div>
          </div>

          {/* Audience Summary */}
          <div className={components.card.surface}>
            <h3 className={`${tw.cardTitle} ${tw.textPrimary} mb-3`}>
              Audience Segments
            </h3>
            {selectedSegments.length ? (
              <div className="space-y-3">
                {selectedSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color.primary.accent}20` }}
                      >
                        <Users
                          className="w-5 h-5"
                          style={{ color: color.primary.accent }}
                        />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-semibold ${tw.textPrimary}`}
                        >
                          {segment.name}
                        </div>
                        <div className={`text-xs ${tw.textSecondary}`}>
                          {segment.description || "No description provided"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: color.primary.accent }}
                      >
                        {segment.customer_count?.toLocaleString() || "0"}
                      </div>
                      <div className={`text-xs ${tw.textSecondary}`}>
                        customers
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No segments have been selected.
              </div>
            )}
          </div>

          {/* Offers Overview */}
          <div className={components.card.surface}>
            <h3 className={`${tw.cardTitle} ${tw.textPrimary} mb-3`}>
              Selected Offers
            </h3>
            {selectedOffers.length ? (
              <div className="space-y-3">
                {selectedOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100"
                  >
                    <div>
                      <div className={`text-sm font-medium ${tw.textPrimary}`}>
                        {offer.name || `Offer #${offer.id}`}
                      </div>
                      <div className={`text-xs ${tw.textSecondary}`}>
                        {offer.offer_type || "N/A"} •{" "}
                        {offer.start_date
                          ? `${formatDate(offer.start_date)} - ${formatDate(
                              offer.end_date
                            )}`
                          : "No schedule"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      ID: <span className="font-medium">{offer.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No offers have been mapped to this campaign yet.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-3 text-sm">
            <h3 className="text-sm font-semibold text-gray-900">
              Schedule Overview
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Start</span>
              <span className="font-medium text-gray-900">
                {formatDate(formData.start_date)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">End</span>
              <span className="font-medium text-gray-900">
                {formatDate(formData.end_date)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Estimated Duration</span>
              <span className="font-medium text-gray-900">
                {formData.start_date && formData.end_date
                  ? Math.max(
                      1,
                      Math.ceil(
                        (new Date(formData.end_date).getTime() -
                          new Date(formData.start_date).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    ) + " days"
                  : "TBD"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Launch Checklist
            </h3>
            <ul className="space-y-2 text-sm">
              {readinessChecks.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      item.complete
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.complete ? "✓" : "•"}
                  </span>
                  <span
                    className={
                      item.complete ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
