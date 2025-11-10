import { Users, Gift, Target, TrendingUp } from 'lucide-react';
import { CreateCampaignRequest, CampaignSegment, CampaignOffer } from '../../types/campaign';
import { color, tw, components } from '../../../../shared/utils/utils';

interface CampaignPreviewStepProps {
  formData: CreateCampaignRequest;
  selectedSegments: CampaignSegment[];
  selectedOffers: CampaignOffer[];
}


export default function CampaignPreviewStep({
  formData,
  selectedSegments,
  selectedOffers
}: CampaignPreviewStepProps) {

  // Calculate campaign metrics
  const totalAudienceSize = selectedSegments.reduce((total, segment) => total + segment.customer_count, 0);
  const estimatedCost = totalAudienceSize * 0.05; // $0.05 per message
  const estimatedRevenue = totalAudienceSize * 2.5; // Estimated revenue per customer
  const estimatedROI = ((estimatedRevenue - estimatedCost) / estimatedCost) * 100;


  const getObjectiveLabel = (objective: string) => {
    const labels = {
      acquisition: 'New Customer Acquisition',
      retention: 'Customer Retention',
      churn_prevention: 'Churn Prevention',
      upsell_cross_sell: 'Upsell/Cross-sell',
      reactivation: 'Dormant Customer Reactivation'
    };
    return labels[objective as keyof typeof labels] || objective;
  };


  return (
    <div className="space-y-4">


      {/* Campaign Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg p-4 border" style={{ backgroundColor: `${color.primary.accent}10`, borderColor: `${color.primary.accent}40` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color.primary.accent}20` }}>
              <Target className="w-5 h-5" style={{ color: color.primary.accent }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: color.primary.accent }}>{selectedSegments.length}</div>
              <div className={`text-xs ${tw.textSecondary}`}>Segments</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 border" style={{ backgroundColor: `${color.status.success}10`, borderColor: `${color.status.success}40` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color.status.success}20` }}>
              <Users className="w-5 h-5" style={{ color: color.status.success }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: color.status.success }}>{totalAudienceSize.toLocaleString()}</div>
              <div className={`text-xs ${tw.textSecondary}`}>Total Reach</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 border" style={{ backgroundColor: `${color.tertiary.tag1}10`, borderColor: `${color.tertiary.tag1}40` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color.tertiary.tag1}20` }}>
              <Gift className="w-5 h-5" style={{ color: color.tertiary.tag1 }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: color.tertiary.tag1 }}>{selectedOffers.length}</div>
              <div className={`text-xs ${tw.textSecondary}`}>Offers</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 border" style={{ backgroundColor: `${color.status.warning}10`, borderColor: `${color.status.warning}40` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color.status.warning}20` }}>
              <TrendingUp className="w-5 h-5" style={{ color: color.status.warning }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: color.status.warning }}>{estimatedROI.toFixed(0)}%</div>
              <div className={`text-xs ${tw.textSecondary}`}>Est. ROI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className={components.card.surface}>
        <h3 className={`${tw.cardTitle} ${tw.textPrimary} mb-4`}>Campaign Details</h3>

        {/* Basic Information */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          <div>
            <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>Name</div>
            <div className={`font-medium ${tw.textPrimary}`}>{formData.name}</div>
          </div>
          <div>
            <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>Objective</div>
            <div className={`font-medium ${tw.textPrimary}`}>{getObjectiveLabel(formData.objective)}</div>
          </div>
          <div>
            <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>Catalog</div>
            <div className={`font-medium ${tw.textPrimary}`}>{formData.category_id ? `Category ${formData.category_id}` : 'No category'}</div>
          </div>
          <div>
            <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>Type</div>
            <div className={`font-medium ${tw.textPrimary}`}>Scheduled</div>
          </div>
          <div>
            <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>Tag</div>
            <div className={`font-medium ${tw.textPrimary}`}>No tag</div>
          </div>
          <div>
            <div className={`${tw.caption} ${tw.textSecondary} mb-1`}>Campaign Business</div>
            <div className={`font-medium ${tw.textPrimary}`}>Not specified</div>
          </div>
        </div>
      </div>

      {/* Audience Summary */}
      <div className={components.card.surface}>
        <h3 className={`${tw.cardTitle} ${tw.textPrimary} mb-3`}>Audience Segments</h3>
        <div className="space-y-2">
          {selectedSegments.map((segment) => (
            <div key={segment.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: color.surface.cards }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color.primary.accent}20` }}>
                  <Users className="w-4 h-4" style={{ color: color.primary.accent }} />
                </div>
                <div>
                  <div className={`text-sm font-medium ${tw.textPrimary}`}>{segment.name}</div>
                  <div className={`text-xs ${tw.textSecondary}`}>{segment.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold" style={{ color: color.primary.accent }}>{segment.customer_count?.toLocaleString() || '0'}</div>
                <div className={`text-xs ${tw.textSecondary}`}>customers</div>
              </div>
            </div>
          ))}
        </div>
      </div>




    </div>
  );
}
