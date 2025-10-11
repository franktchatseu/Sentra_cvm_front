import { useState } from 'react';
import { AlertCircle, Users, Gift, Target, TrendingUp, DollarSign } from 'lucide-react';
import { CreateCampaignRequest, CampaignSegment, CampaignOffer } from '../../types/campaign';

interface CampaignPreviewStepProps {
  formData: CreateCampaignRequest;
  selectedSegments: CampaignSegment[];
  selectedOffers: CampaignOffer[];
}

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

export default function CampaignPreviewStep({
  formData,
  selectedSegments,
  selectedOffers
}: CampaignPreviewStepProps) {
  const [showValidation, setShowValidation] = useState(true);
  const [approvalComments, setApprovalComments] = useState('');

  // Calculate campaign metrics
  const totalAudienceSize = selectedSegments.reduce((total, segment) => total + segment.customer_count, 0);
  const estimatedCost = totalAudienceSize * 0.05; // $0.05 per message
  const estimatedRevenue = totalAudienceSize * 2.5; // Estimated revenue per customer
  const estimatedROI = ((estimatedRevenue - estimatedCost) / estimatedCost) * 100;

  // Validation logic
  const getValidationIssues = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    if (!formData.name.trim()) {
      issues.push({ type: 'error', message: 'Campaign name is required', field: 'name' });
    }

    if (selectedSegments.length === 0) {
      issues.push({ type: 'error', message: 'At least one audience segment must be selected', field: 'segments' });
    }

    if (selectedOffers.length === 0) {
      issues.push({ type: 'error', message: 'At least one offer must be selected', field: 'offers' });
    }

    if (formData.scheduling.type === 'scheduled' && !formData.scheduling.start_date) {
      issues.push({ type: 'error', message: 'Start date is required for scheduled campaigns', field: 'scheduling' });
    }

    if (totalAudienceSize > 100000) {
      issues.push({ type: 'warning', message: 'Large audience size may require additional approval', field: 'audience' });
    }

    if (selectedSegments.length > 5) {
      issues.push({ type: 'warning', message: 'Multiple segments may cause overlap - consider consolidation', field: 'segments' });
    }

    if (!formData.scheduling.delivery_times?.length) {
      issues.push({ type: 'warning', message: 'No delivery times specified - using default', field: 'scheduling' });
    }

    if (estimatedCost > 5000) {
      issues.push({ type: 'info', message: 'High-cost campaign - consider budget approval', field: 'budget' });
    }

    return issues;
  };

  const validationIssues = getValidationIssues();

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

  const getSchedulingTypeLabel = (type: string) => {
    const labels = {
      immediate: 'Immediate',
      scheduled: 'Scheduled',
      recurring: 'Recurring',
      trigger_based: 'Trigger-based'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Preview & Validation</h2>
        <p className="text-sm text-gray-600">
          Review your campaign configuration and launch when ready
        </p>
      </div>

      {/* Validation Results */}
      {showValidation && validationIssues.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Validation Results</h3>
            <button
              onClick={() => setShowValidation(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>

          {validationIssues.map((issue, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${issue.type === 'error'
                ? 'bg-red-50 border-red-200'
                : issue.type === 'warning'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
                }`}
            >
              <div className="flex items-start space-x-2">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${issue.type === 'error'
                  ? 'text-red-600'
                  : issue.type === 'warning'
                    ? 'text-amber-600'
                    : 'text-blue-600'
                  }`} />
                <div>
                  <h4 className={`text-sm font-medium ${issue.type === 'error'
                    ? 'text-red-900'
                    : issue.type === 'warning'
                      ? 'text-amber-900'
                      : 'text-blue-900'
                    }`}>
                    {issue.type === 'error' ? 'Error' : issue.type === 'warning' ? 'Warning' : 'Info'}
                  </h4>
                  <p className={`text-sm mt-1 ${issue.type === 'error'
                    ? 'text-red-700'
                    : issue.type === 'warning'
                      ? 'text-amber-700'
                      : 'text-blue-700'
                    }`}>
                    {issue.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campaign Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{selectedSegments.length}</div>
              <div className="text-sm text-blue-700">Segments</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-emerald-600" />
            <div>
              <div className="text-2xl font-bold text-emerald-900">{totalAudienceSize.toLocaleString()}</div>
              <div className="text-sm text-emerald-700">Total Reach</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center space-x-3">
            <Gift className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-900">{selectedOffers.length}</div>
              <div className="text-sm text-purple-700">Offers</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-amber-600" />
            <div>
              <div className="text-2xl font-bold text-amber-900">{estimatedROI.toFixed(0)}%</div>
              <div className="text-sm text-amber-700">Est. ROI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Campaign Details</h3>

        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{formData.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">Objective:</span>
              <span className="font-medium text-gray-900">{getObjectiveLabel(formData.objective)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">Catalog:</span>
              <span className="font-medium text-gray-900">{formData.category_id ? `Category ${formData.category_id}` : 'No category selected'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium text-gray-900">{getSchedulingTypeLabel(formData.scheduling.type)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">Tag:</span>
              <span className="font-medium text-gray-900">{formData.tag || 'No tag'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">Campaign Business:</span>
              <span className="font-medium text-gray-900">{formData.business || 'Not specified'}</span>
            </div>
          </div>
          {formData.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Description:</span>
              <p className="text-sm text-gray-900 mt-1">{formData.description}</p>
            </div>
          )}
        </div>

        {/* Audience Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-medium text-gray-900 mb-4">Audience Segments</h4>
          <div className="space-y-3">
            {selectedSegments.map((segment) => (
              <div key={segment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{segment.name}</div>
                  <div className="text-sm text-gray-500">{segment.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{segment.customer_count.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">customers</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offers Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-medium text-gray-900 mb-4">Campaign Offers</h4>
          <div className="space-y-3">
            {selectedOffers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{offer.name}</div>
                  <div className="text-sm text-gray-500">{offer.description}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {offer.reward_type}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {offer.offer_type}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-[#3b8169]">{offer.reward_value}</div>
                  <div className="text-sm text-gray-500">{offer.validity_period} days</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduling Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-medium text-gray-900 mb-4">Scheduling Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium text-gray-900">{getSchedulingTypeLabel(formData.scheduling.type)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Zone:</span>
              <span className="font-medium text-gray-900">{formData.scheduling.time_zone}</span>
            </div>
            {formData.scheduling.start_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(formData.scheduling.start_date).toLocaleString()}
                </span>
              </div>
            )}
            {formData.scheduling.end_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">End Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(formData.scheduling.end_date).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Times:</span>
              <span className="font-medium text-gray-900">
                {formData.scheduling.delivery_times?.join(', ') || 'Default'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max per Day:</span>
              <span className="font-medium text-gray-900">
                {formData.scheduling.frequency_capping?.max_per_day || 1}
              </span>
            </div>
          </div>
        </div>

        {/* Cost & ROI Projection */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <h4 className="font-medium text-gray-900 mb-4">Financial Projection</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Estimated Cost</span>
              </div>
              <div className="text-2xl font-bold text-red-600">${estimatedCost.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Estimated Revenue</span>
              </div>
              <div className="text-2xl font-bold text-green-600">${estimatedRevenue.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-[#3b8169]" />
                <span className="text-sm font-medium text-gray-700">ROI</span>
              </div>
              <div className="text-2xl font-bold text-[#3b8169]">{estimatedROI.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Comments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Approval Comments (Optional)</h3>
        <textarea
          value={approvalComments}
          onChange={(e) => setApprovalComments(e.target.value)}
          placeholder="Add any comments for the approval workflow..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
        />
      </div>

    </div>
  );
}
