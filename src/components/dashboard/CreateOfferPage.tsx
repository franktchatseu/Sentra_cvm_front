import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Target,
  Calendar,
  DollarSign,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Check,
  Gift,
  Users,
  Settings,

} from 'lucide-react';
import { CreateOfferRequest, LifecycleStatus, ApprovalStatus } from '../../types/offer';
import { Product } from '../../types/product';
import { offerService } from '../../services/offerService';
import ProductSelector from './ProductSelector';
import OfferCreativeStep from '../offer/OfferCreativeStep';
import OfferTrackingStep from '../offer/OfferTrackingStep';
import OfferRewardStep from '../offer/OfferRewardStep';
import HeadlessSelect from '../ui/HeadlessSelect';
import { colors as color } from '../../design/tokens';

interface OfferCreative {
  id: string;
  channel: 'sms' | 'email' | 'push' | 'web' | 'whatsapp';
  locale: string;
  title: string;
  text_body: string;
  html_body: string;
  variables: Record<string, string | number | boolean>;
}

interface TrackingRule {
  id: string;
  name: string;
  priority: number;
  parameter: string;
  condition: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'is_any_of';
  value: string;
  enabled: boolean;
}

interface TrackingSource {
  id: string;
  name: string;
  type: 'recharge' | 'usage_metric' | 'custom';
  enabled: boolean;
  rules: TrackingRule[];
}

interface RewardRule {
  id: string;
  name: string;
  bundle_subscription_track: string;
  priority: number;
  condition: string;
  value: string;
  reward_type: 'bundle' | 'points' | 'discount' | 'cashback';
  reward_value: string;
  fulfillment_response: string;
  success_text: string;
  default_failure: string;
  error_group: string;
  failure_text: string;
  enabled: boolean;
}

interface OfferReward {
  id: string;
  name: string;
  type: 'default' | 'sms_night' | 'custom';
  rules: RewardRule[];
}

interface StepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  formData: CreateOfferRequest;
  setFormData: (data: CreateOfferRequest) => void;
  creatives: OfferCreative[];
  setCreatives: (creatives: OfferCreative[]) => void;
  trackingSources: TrackingSource[];
  setTrackingSources: (sources: TrackingSource[]) => void;
  rewards: OfferReward[];
  setRewards: (rewards: OfferReward[]) => void;
  isLoading?: boolean;
}

// Step 1: Basic Information
function BasicInfoStep({ onNext, formData, setFormData }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onPrev' | 'onSubmit'>) {
  const handleNext = () => {
    if (formData.name.trim() && formData.offer_type) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: color.sentra.main }}
        >
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with the essential details of your offer</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Offer Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Summer Data Bundle"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:outline-none transition-all duration-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this offer provides to customers..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Offer Type *
          </label>
          <HeadlessSelect
            options={[
              { value: '', label: 'Select offer type' },
              { value: 'STV', label: 'STV' },
              { value: 'Short Text (SMS/USSD)', label: 'Short Text (SMS/USSD)' },
              { value: 'Email', label: 'Email' },
              { value: 'Voice Push', label: 'Voice Push' },
              { value: 'WAP Push', label: 'WAP Push' },
              { value: 'Rich Media', label: 'Rich Media' }
            ]}
            value={formData.offer_type || ''}
            onChange={(value) => setFormData({ ...formData, offer_type: value ? String(value) : undefined })}
            placeholder="Select offer type"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <HeadlessSelect
            options={[
              { value: '', label: 'Select category' },
              { value: '1', label: 'Data' },
              { value: '2', label: 'Voice' },
              { value: '3', label: 'Combo' },
              { value: '4', label: 'Loyalty' }
            ]}
            value={formData.category_id ? String(formData.category_id) : ''}
            onChange={(value) => setFormData({ ...formData, category_id: value ? Number(value) : undefined })}
            placeholder="Select category"
          />
        </div>
      </div>

    </div>
  );
}

// Step 2: Offer Products
function ProductStepWrapper({ onNext, onPrev, formData, setFormData }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onSubmit'>) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const handleNext = () => {
    // Store only the first selected product ID (backend expects single product_id)
    const firstProductId = selectedProducts.length > 0 ? selectedProducts[0].id : undefined;
    setFormData({
      ...formData,
      product_id: firstProductId ? Number(firstProductId) : undefined
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: color.sentra.main }}
        >
          <Package className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Offer Products</h2>
        <p className="text-gray-600">Select the products that will be included in this offer</p>
      </div>

      <div className="space-y-6">
        <ProductSelector
          selectedProducts={selectedProducts}
          onProductsChange={setSelectedProducts}
          multiSelect={true}
        />
      </div>

    </div>
  );
}

// Step 3: Offer Creative
function OfferCreativeStepWrapper({ onNext, onPrev, creatives, setCreatives }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onSubmit' | 'formData' | 'setFormData'>) {
  return (
    <OfferCreativeStep
      creatives={creatives}
      onCreativesChange={setCreatives}
      onNext={onNext}
      onPrev={onPrev}
    />
  );
}

// Step 4: Offer Tracking
function OfferTrackingStepWrapper({ onNext, onPrev, trackingSources, setTrackingSources }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onSubmit' | 'formData' | 'setFormData'>) {
  return (
    <OfferTrackingStep
      trackingSources={trackingSources}
      onTrackingSourcesChange={setTrackingSources}
      onNext={onNext}
      onPrev={onPrev}
    />
  );
}

// Step 5: Offer Reward
function OfferRewardStepWrapper({ onNext, onPrev, rewards, setRewards }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onSubmit' | 'formData' | 'setFormData'>) {
  return (
    <OfferRewardStep
      rewards={rewards}
      onRewardsChange={setRewards}
      onNext={onNext}
      onPrev={onPrev}
    />
  );
}

// Legacy Step 2: Eligibility Rules (kept for reference)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EligibilityStepLegacy({ onNext, onPrev, formData, setFormData }: Omit<StepProps, 'currentStep' | 'totalSteps'>) {
  const [eligibilityRules, setEligibilityRules] = useState({
    min_spend: formData.eligibility_rules?.min_spend || 0,
    customer_segment: formData.eligibility_rules?.customer_segment || [],
    valid_days: formData.eligibility_rules?.valid_days || []
  });

  const customerSegments = ['new', 'returning', 'vip', 'premium', 'standard'];
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleNext = () => {
    setFormData({
      ...formData,
      eligibility_rules: eligibilityRules
    });
    onNext();
  };

  const toggleSegment = (segment: string) => {
    setEligibilityRules(prev => ({
      ...prev,
      customer_segment: prev.customer_segment.includes(segment)
        ? prev.customer_segment.filter(s => s !== segment)
        : [...prev.customer_segment, segment]
    }));
  };

  const toggleDay = (day: string) => {
    setEligibilityRules(prev => ({
      ...prev,
      valid_days: prev.valid_days.includes(day)
        ? prev.valid_days.filter(d => d !== day)
        : [...prev.valid_days, day]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: color.sentra.main }}
        >
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Eligibility Rules</h2>
        <p className="text-gray-600">Define who can access this offer and when</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Minimum Spend */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Minimum Spend Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={eligibilityRules.min_spend}
              onChange={(e) => setEligibilityRules(prev => ({
                ...prev,
                min_spend: parseFloat(e.target.value) || 0
              }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <p className="text-sm text-gray-500">Minimum amount customer must spend to be eligible</p>
        </div>

        {/* Customer Segments */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Customer Segments
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {customerSegments.map((segment) => (
              <button
                key={segment}
                type="button"
                onClick={() => toggleSegment(segment)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${eligibilityRules.customer_segment.includes(segment)
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
              >
                {segment.charAt(0).toUpperCase() + segment.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">Select which customer segments are eligible</p>
        </div>

        {/* Valid Days */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Valid Days
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weekDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${eligibilityRules.valid_days.includes(day)
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">Select which days the offer is valid</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 text-white rounded-lg transition-all shadow-lg flex items-center gap-2 text-sm font-medium"
          style={{
            backgroundColor: `${color.sentra.main} !important`,
            background: 'none !important'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.setProperty('background-color', color.sentra.hover, 'important');
            (e.target as HTMLButtonElement).style.setProperty('background', 'none', 'important');
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.setProperty('background-color', color.sentra.main, 'important');
            (e.target as HTMLButtonElement).style.setProperty('background', 'none', 'important');
          }}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


// Step 6: Review
function ReviewStep({ onSubmit, formData, creatives, trackingSources, rewards, isLoading }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onNext' | 'setFormData' | 'onPrev'>) {
  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: color.sentra.main }}
        >
          <Eye className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Review & Create</h2>
        <p className="text-gray-600">Review your offer details before creating</p>
      </div>

      <div className="space-y-6">
        {/* Offer Summary */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: `${color.sentra.main}10` }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Offer Summary</h3>

          {/* Basic Information */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Offer Type:</span>
                <span className="font-medium">{formData.offer_type || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">
                  {formData.category_id ? `Category ${formData.category_id}` : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium text-right max-w-md">{formData.description || 'No description'}</span>
              </div>
            </div>
          </div>

          {/* Offer Creative Summary */}
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Offer Creatives</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Creatives:</span>
                  <span className="font-medium">{creatives.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Channels:</span>
                  <span className="font-medium">
                    {creatives.length > 0
                      ? [...new Set(creatives.map(c => c.channel))].join(', ')
                      : 'None configured'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Locales:</span>
                  <span className="font-medium">
                    {creatives.length > 0
                      ? [...new Set(creatives.map(c => c.locale))].join(', ')
                      : 'None configured'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Summary */}
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking Configuration</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking Sources:</span>
                  <span className="font-medium">{trackingSources.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Sources:</span>
                  <span className="font-medium">
                    {trackingSources.filter(s => s.enabled).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rules:</span>
                  <span className="font-medium">
                    {trackingSources.reduce((total, source) => total + source.rules.length, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards Summary */}
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Offer Rewards</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rewards:</span>
                  <span className="font-medium">{rewards.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reward Types:</span>
                  <span className="font-medium">
                    {rewards.length > 0
                      ? [...new Set(rewards.map(r => r.type))].join(', ')
                      : 'None configured'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rules:</span>
                  <span className="font-medium">
                    {rewards.reduce((total, reward) => total + reward.rules.length, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Product */}
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Product</h3>
              {formData.product_id ? (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Product ID: {formData.product_id}</span>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No product selected</p>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2">Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium capitalize">{formData.lifecycle_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Approval:</span>
                <span className="font-medium capitalize">{formData.approval_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reusable:</span>
                <span className="font-medium">{formData.reusable ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Multi-language:</span>
                <span className="font-medium">{formData.multi_language ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// Legacy Eligibility Step (kept for reference)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EligibilityStepOld({ onNext, onPrev, formData, setFormData }: Omit<StepProps, 'currentStep' | 'totalSteps'>) {
  const [eligibilityRules, setEligibilityRules] = useState(formData.eligibility_rules || {});

  const handleNext = () => {
    setFormData({ ...formData, eligibility_rules: eligibilityRules });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: color.sentra.main }}
        >
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Eligibility Rules</h2>
        <p className="text-gray-600">Define who can access this offer</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Spend ($)
            </label>
            <input
              type="number"
              value={eligibilityRules.min_spend || ''}
              onChange={(e) => setEligibilityRules({ ...eligibilityRules, min_spend: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer Tier
            </label>
            <HeadlessSelect
              options={[
                { value: '', label: 'Any tier' },
                { value: 'bronze', label: 'Bronze' },
                { value: 'silver', label: 'Silver' },
                { value: 'gold', label: 'Gold' },
                { value: 'vip', label: 'VIP' }
              ]}
              value={eligibilityRules.customer_tier || ''}
              onChange={(value) => setEligibilityRules({ ...eligibilityRules, customer_tier: value ? String(value) : undefined })}
              placeholder="Any tier"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Account Age (days)
            </label>
            <input
              type="number"
              value={eligibilityRules.min_account_age_days || ''}
              onChange={(e) => setEligibilityRules({ ...eligibilityRules, min_account_age_days: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Purchase Count
            </label>
            <input
              type="number"
              value={eligibilityRules.min_purchase_count || ''}
              onChange={(e) => setEligibilityRules({ ...eligibilityRules, min_purchase_count: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Valid From
            </label>
            <input
              type="date"
              value={eligibilityRules.valid_from || ''}
              onChange={(e) => setEligibilityRules({ ...eligibilityRules, valid_from: e.target.value || undefined })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Valid To
            </label>
            <input
              type="date"
              value={eligibilityRules.valid_to || ''}
              onChange={(e) => setEligibilityRules({ ...eligibilityRules, valid_to: e.target.value || undefined })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Max Usage Per Customer
          </label>
          <input
            type="number"
            value={eligibilityRules.max_usage_per_customer || ''}
            onChange={(e) => setEligibilityRules({ ...eligibilityRules, max_usage_per_customer: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Unlimited"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="combinable"
            checked={eligibilityRules.combinable_with_other_offers || false}
            onChange={(e) => setEligibilityRules({ ...eligibilityRules, combinable_with_other_offers: e.target.checked })}
            className="w-4 h-4 text-[#1a3d2e] border-gray-300 rounded focus:outline-none"
          />
          <label htmlFor="combinable" className="ml-2 text-sm text-gray-700">
            Can be combined with other offers
          </label>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={handleNext}
          className="text-white px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
        >
          Next Step
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Legacy Settings Step (kept for reference)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SettingsStepOld({ onPrev, onSubmit, formData, setFormData, isLoading }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onNext'>) {
  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: color.sentra.main }}
        >
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings & Configuration</h2>
        <p className="text-gray-600">Configure the final settings for your offer</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lifecycle Status
            </label>
            <HeadlessSelect
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' }
              ]}
              value={formData.lifecycle_status}
              onChange={(value) => setFormData({ ...formData, lifecycle_status: value as LifecycleStatus })}
              placeholder="Select status"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Approval Status
            </label>
            <HeadlessSelect
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' }
              ]}
              value={formData.approval_status}
              onChange={(value) => setFormData({ ...formData, approval_status: value as ApprovalStatus })}
              placeholder="Select status"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="reusable"
              checked={formData.reusable}
              onChange={(e) => setFormData({ ...formData, reusable: e.target.checked })}
              className="w-4 h-4 text-[#1a3d2e] border-gray-300 rounded focus:outline-none"
            />
            <label htmlFor="reusable" className="ml-2 text-sm text-gray-700">
              Reusable across multiple campaigns
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="multiLanguage"
              checked={formData.multi_language}
              onChange={(e) => setFormData({ ...formData, multi_language: e.target.checked })}
              className="w-4 h-4 text-[#1a3d2e] border-gray-300 rounded focus:outline-none"
            />
            <label htmlFor="multiLanguage" className="ml-2 text-sm text-gray-700">
              Multi-language support
            </label>
          </div>
        </div>

        {/* Summary */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: `${color.sentra.main}10` }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">
                {formData.category_id ? `Category ${formData.category_id}` : 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium capitalize">{formData.lifecycle_status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Approval:</span>
              <span className="font-medium capitalize">{formData.approval_status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reusable:</span>
              <span className="font-medium">{formData.reusable ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateOfferPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalSteps = 6;

  const [formData, setFormData] = useState<CreateOfferRequest>({
    name: '',
    description: '',
    offer_type: '',
    category_id: undefined,
    product_id: undefined,
    eligibility_rules: {},
    lifecycle_status: 'draft',
    approval_status: 'pending',
    reusable: false,
    multi_language: false,
  });

  const [creatives, setCreatives] = useState<OfferCreative[]>([]);
  const [trackingSources, setTrackingSources] = useState<TrackingSource[]>([]);
  const [rewards, setRewards] = useState<OfferReward[]>([]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await offerService.createOffer(formData);
      navigate('/dashboard/offers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer');
    } finally {
      setIsLoading(false);
    }
  };

  const stepProps = {
    currentStep,
    totalSteps,
    onNext: handleNext,
    onPrev: handlePrev,
    onSubmit: handleSubmit,
    formData,
    setFormData,
    creatives,
    setCreatives,
    trackingSources,
    setTrackingSources,
    rewards,
    setRewards,
    isLoading,
  };

  return (
    <div className="space-y-6 bg-gray-100 min-h-screen  overflow-y-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard/offers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Offers
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Offer
          </h1>
          <p className="text-gray-600">Follow the steps to create a comprehensive offer for your customers</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${step <= currentStep
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-500'
                  }`}
                style={step <= currentStep ? { backgroundColor: color.sentra.main } : {}}
              >
                {step < currentStep ? <Check className="w-5 h-5" /> : step}
              </div>
              {step < 6 && (
                <div
                  className={`w-12 h-1 mx-2 transition-all duration-200 ${step < currentStep ? '' : 'bg-gray-200'}`}
                  style={step < currentStep ? { backgroundColor: color.sentra.main } : {}}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Basic Info</span>
          <span>Products</span>
          <span>Creative</span>
          <span>Tracking</span>
          <span>Rewards</span>
          <span>Review</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[500px] relative overflow-visible flex flex-col">
        <div className="flex-1">
          {currentStep === 1 && <BasicInfoStep {...stepProps} />}
          {currentStep === 2 && <ProductStepWrapper {...stepProps} />}
          {currentStep === 3 && <OfferCreativeStepWrapper {...stepProps} />}
          {currentStep === 4 && <OfferTrackingStepWrapper {...stepProps} />}
          {currentStep === 5 && <OfferRewardStepWrapper {...stepProps} />}
          {currentStep === 6 && <ReviewStep {...stepProps} />}
        </div>

        {/* Fixed Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-sm"
              style={{
                backgroundColor: color.sentra.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
              }}
            >
              Next Step
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
              style={{
                backgroundColor: color.sentra.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                }
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Create Offer
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
