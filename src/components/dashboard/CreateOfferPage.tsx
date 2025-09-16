import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Target, 
  Calendar, 
  DollarSign, 
  Package, 
  Eye, 
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Check,
  Gift,
  Users,
  Settings
} from 'lucide-react';
import { CreateOfferRequest, LifecycleStatus, ApprovalStatus } from '../../types/offer';
import { Product } from '../../types/product';
import { offerService } from '../../services/offerService';
import ProductSelector from './ProductSelector';

interface StepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  formData: CreateOfferRequest;
  setFormData: (data: CreateOfferRequest) => void;
  isLoading?: boolean;
}

// Step 1: Basic Information
function BasicInfoStep({ currentStep, totalSteps, onNext, formData, setFormData }: StepProps) {
  const handleNext = () => {
    if (formData.name.trim()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-[#1a3d2e]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <select
            value={formData.category_id || ''}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
          >
            <option value="">Select category</option>
            <option value="1">Data</option>
            <option value="2">Voice</option>
            <option value="3">Combo</option>
            <option value="4">Loyalty</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!formData.name.trim()}
          className="bg-[#1a3d2e] hover:bg-[#2d5f4e] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Next Step
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Step 2: Eligibility Rules
function EligibilityStep({ currentStep, totalSteps, onNext, onPrev, formData, setFormData }: StepProps) {
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
        <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-[#1a3d2e]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Eligibility Rules</h2>
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500"
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  eligibilityRules.customer_segment.includes(segment)
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  eligibilityRules.valid_days.includes(day)
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
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-[#1a3d2e] hover:bg-[#2d5f4e] text-white rounded-lg transition-all shadow-lg flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Step 3: Offer Products
function ProductStep({ currentStep, totalSteps, onNext, onPrev, formData, setFormData }: StepProps) {
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
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Products</h2>
        <p className="text-gray-600">Select the products that will be included in this offer</p>
      </div>

      <div className="space-y-6">
        <ProductSelector
          selectedProducts={selectedProducts}
          onProductsChange={setSelectedProducts}
          multiSelect={true}
        />
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
          className="bg-[#1a3d2e] hover:bg-[#2d5f4e] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
        >
          Next Step
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Step 4: Review
function ReviewStep({ currentStep, totalSteps, onNext, onPrev, onSubmit, formData, setFormData, isLoading }: StepProps) {
  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Create</h2>
        <p className="text-gray-600">Review your offer details before creating</p>
      </div>

      <div className="space-y-6">
        {/* Offer Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
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

          {/* Eligibility Rules */}
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Eligibility Rules</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Spend:</span>
                  <span className="font-medium">${formData.eligibility_rules?.min_spend || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Segments:</span>
                  <span className="font-medium">
                    {formData.eligibility_rules?.customer_segment && formData.eligibility_rules.customer_segment.length > 0 
                      ? formData.eligibility_rules.customer_segment.join(', ') 
                      : 'None selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valid Days:</span>
                  <span className="font-medium">
                    {formData.eligibility_rules?.valid_days && formData.eligibility_rules.valid_days.length > 0 
                      ? formData.eligibility_rules.valid_days.join(', ') 
                      : 'All days'}
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

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-[#1a3d2e] hover:bg-[#2d5f4e] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
      </div>
    </div>
  );
}

// Legacy Eligibility Step (kept for reference)
function EligibilityStepOld({ currentStep, totalSteps, onNext, onPrev, formData, setFormData }: StepProps) {
  const [eligibilityRules, setEligibilityRules] = useState(formData.eligibility_rules || {});

  const handleNext = () => {
    setFormData({ ...formData, eligibility_rules: eligibilityRules });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-emerald-600" />
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer Tier
            </label>
            <select
              value={eligibilityRules.customer_tier || ''}
              onChange={(e) => setEligibilityRules({ ...eligibilityRules, customer_tier: e.target.value || undefined })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Any tier</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="vip">VIP</option>
            </select>
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
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
          className="bg-[#1a3d2e] hover:bg-[#2d5f4e] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
        >
          Next Step
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Legacy Settings Step (kept for reference)
function SettingsStepOld({ currentStep, totalSteps, onNext, onPrev, onSubmit, formData, setFormData, isLoading }: StepProps) {
  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-amber-600" />
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
            <select
              value={formData.lifecycle_status}
              onChange={(e) => setFormData({ ...formData, lifecycle_status: e.target.value as LifecycleStatus })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Approval Status
            </label>
            <select
              value={formData.approval_status}
              onChange={(e) => setFormData({ ...formData, approval_status: e.target.value as ApprovalStatus })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 transition-all duration-200"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
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
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
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

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-[#1a3d2e] hover:bg-[#2d5f4e] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
      </div>
    </div>
  );
}

export default function CreateOfferPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalSteps = 4;

  const [formData, setFormData] = useState<CreateOfferRequest>({
    name: '',
    description: '',
    category_id: undefined,
    product_id: undefined,
    eligibility_rules: {},
    lifecycle_status: 'draft',
    approval_status: 'pending',
    reusable: false,
    multi_language: false,
  });

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
    isLoading,
  };

  return (
    <div className="space-y-6">
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Create New Offer
          </h1>
          <p className="text-gray-600">Follow the steps to create a comprehensive offer for your customers</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                  step <= currentStep 
                    ? 'bg-[#3b8169] text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? <Target className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-200 ${
                    step < currentStep ? 'bg-[#3b8169]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Basic Info</span>
            <span>Eligibility</span>
            <span>Products</span>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {currentStep === 1 && <BasicInfoStep {...stepProps} />}
          {currentStep === 2 && <EligibilityStep {...stepProps} />}
          {currentStep === 3 && <ProductStep {...stepProps} />}
          {currentStep === 4 && <ReviewStep {...stepProps} />}
    </div>

        </div>
  );
}
