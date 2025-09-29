import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  Package,
  CheckCircle,
  AlertCircle,
  Info,
  Target,
  Palette
} from 'lucide-react';
import Stepper from '../../../shared/componen../../../shared/components/ui/Stepper';
import FormSection from '../../../shared/componen../../../shared/components/ui/FormSection';
import HeadlessSelect from '../../../shared/componen../../../shared/components/ui/HeadlessSelect';
import HeadlessMultiSelect from '../../../shared/componen../../../shared/components/ui/HeadlessMultiSelect';
import TagInput from '../../../shared/componen../../../shared/components/ui/TagInput';
import { colors as color } from '../../../shared/utils/tokens';
import { tw } from '../../../shared/utils/utils';

// Types based on the database schema
interface OfferFormData {
  // Basic Information
  name: string;
  description: string;
  category_id: number | null;

  // Product Association
  product_ids: number[];
  primary_product_id: number | null;

  // Offer Configuration
  lifecycle_status: 'draft' | 'active' | 'expired' | 'suspended';
  approval_status: 'pending' | 'approved' | 'rejected';
  reusable: boolean;
  multi_language: boolean;

  // Eligibility Rules (JSONB)
  eligibility_rules: {
    customer_segments?: string[];
    usage_criteria?: {
      min_usage?: number;
      max_usage?: number;
      usage_type?: string;
    };
    geographic_restrictions?: string[];
    time_restrictions?: {
      start_date?: string;
      end_date?: string;
      days_of_week?: string[];
      hours_of_day?: string[];
    };
  };

  // Creative Content
  creatives: {
    channel: 'sms' | 'email' | 'push' | 'web' | 'app';
    locale: string;
    title: string;
    text_body: string;
    html_body: string;
    variables: Record<string, string>;
  }[];
}

const STEPS = [
  'Basic Info',
  'Products',
  'Eligibility',
  'Content',
  'Review'
];

// Mock data - in real app, these would come from API
const CATEGORIES = [
  { id: 1, label: 'Data Offers', value: 1 },
  { id: 2, label: 'Voice Offers', value: 2 },
  { id: 3, label: 'Combo Offers', value: 3 },
  { id: 4, label: 'Loyalty Rewards', value: 4 },
  { id: 5, label: 'Promotional', value: 5 }
];

const PRODUCTS = [
  { id: 1, label: '1GB Data Bundle', value: 1 },
  { id: 2, label: '5GB Data Bundle', value: 2 },
  { id: 3, label: '100 Minutes Voice', value: 3 },
  { id: 4, label: '500 Minutes Voice', value: 4 },
  { id: 5, label: 'Unlimited Weekend Data', value: 5 }
];

const CUSTOMER_SEGMENTS = [
  { id: 1, label: 'Premium Customers', value: 'premium' },
  { id: 2, label: 'New Customers', value: 'new' },
  { id: 3, label: 'High Usage', value: 'high_usage' },
  { id: 4, label: 'Low Usage', value: 'low_usage' },
  { id: 5, label: 'Churning Risk', value: 'churning_risk' }
];

const CHANNELS = [
  { id: 1, label: 'SMS', value: 'sms' },
  { id: 2, label: 'Email', value: 'email' },
  { id: 3, label: 'Push Notification', value: 'push' },
  { id: 4, label: 'Web Portal', value: 'web' },
  { id: 5, label: 'Mobile App', value: 'app' }
];

const LOCALES = [
  { id: 1, label: 'English (US)', value: 'en-US' },
  { id: 2, label: 'French (FR)', value: 'fr-FR' },
  { id: 3, label: 'Spanish (ES)', value: 'es-ES' },
  { id: 4, label: 'Arabic (AR)', value: 'ar-AR' }
];

export default function CreateOfferPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OfferFormData>({
    name: '',
    description: '',
    category_id: null,
    product_ids: [],
    primary_product_id: null,
    lifecycle_status: 'draft',
    approval_status: 'pending',
    reusable: true,
    multi_language: true,
    eligibility_rules: {},
    creatives: []
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) stepErrors.name = 'Offer name is required';
        if (!formData.description.trim()) stepErrors.description = 'Description is required';
        if (!formData.category_id) stepErrors.category_id = 'Category is required';
        break;
      case 2:
        if (formData.product_ids.length === 0) stepErrors.product_ids = 'At least one product is required';
        if (!formData.primary_product_id) stepErrors.primary_product_id = 'Primary product is required';
        break;
      case 3:
        // Eligibility validation can be optional
        break;
      case 4:
        if (formData.creatives.length === 0) stepErrors.creatives = 'At least one creative is required';
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    // Save as draft logic
    console.log('Saving draft:', formData);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      // Submit logic
      console.log('Submitting offer:', formData);
      navigate('/dashboard/offers');
    }
  };

  const addCreative = () => {
    setFormData({
      ...formData,
      creatives: [
        ...formData.creatives,
        {
          channel: 'sms',
          locale: 'en-US',
          title: '',
          text_body: '',
          html_body: '',
          variables: {}
        }
      ]
    });
  };

  const updateCreative = (index: number, field: string, value: string | number) => {
    const updatedCreatives = [...formData.creatives];
    updatedCreatives[index] = { ...updatedCreatives[index], [field]: value };
    setFormData({ ...formData, creatives: updatedCreatives });
  };

  const removeCreative = (index: number) => {
    setFormData({
      ...formData,
      creatives: formData.creatives.filter((_, i) => i !== index)
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <FormSection
              title="Basic Information"
              description="Define the core details of your offer"
              icon={Info}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Offer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter offer name"
                    className={`w-full px-3 py-2 text-sm border border-[${color.ui.border}] rounded-lg focus:outline-none focus:border-[${color.sentra.main}] transition-colors duration-200`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <HeadlessSelect
                    options={CATEGORIES}
                    value={formData.category_id?.toString() || ''}
                    onChange={(value) => setFormData({ ...formData, category_id: value ? Number(value) : null })}
                    placeholder="Select category"
                  />
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your offer in detail"
                  rows={4}
                  className={`w-full px-3 py-2 text-sm border border-[${color.ui.border}] rounded-lg focus:outline-none focus:border-[${color.sentra.main}] transition-colors duration-200 resize-none`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.reusable}
                      onChange={(e) => setFormData({ ...formData, reusable: e.target.checked })}
                      className={`h-4 w-4 text-[${color.sentra.main}] focus:outline-none border-[${color.ui.border}] rounded`}
                    />
                    <span className="text-sm font-medium text-gray-700">Reusable Offer</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-7">Allow this offer to be used in multiple campaigns</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.multi_language}
                      onChange={(e) => setFormData({ ...formData, multi_language: e.target.checked })}
                      className={`h-4 w-4 text-[${color.sentra.main}] focus:outline-none border-[${color.ui.border}] rounded`}
                    />
                    <span className="text-sm font-medium text-gray-700">Multi-language Support</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-7">Enable content in multiple languages</p>
                </div>
              </div>
            </FormSection>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <FormSection
              title="Product Association"
              description="Link your offer to specific products from the billing system"
              icon={Package}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Associated Products *
                </label>
                <HeadlessMultiSelect
                  options={PRODUCTS}
                  value={formData.product_ids}
                  onChange={(value) => setFormData({ ...formData, product_ids: value as number[] })}
                  placeholder="Select products to include in this offer"
                />
                {errors.product_ids && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_ids}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Primary Product *
                </label>
                <HeadlessSelect
                  options={PRODUCTS.filter(p => formData.product_ids.includes(p.value as number))}
                  value={formData.primary_product_id?.toString() || ''}
                  onChange={(value) => setFormData({ ...formData, primary_product_id: value ? Number(value) : null })}
                  placeholder="Select the main product for this offer"
                />
                {errors.primary_product_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.primary_product_id}</p>
                )}
              </div>

              {formData.product_ids.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Product Integration</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Selected products will be automatically linked to this offer for billing and provisioning purposes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </FormSection>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <FormSection
              title="Eligibility Rules"
              description="Define who can access this offer and when"
              icon={Target}
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer Segments
                  </label>
                  <HeadlessMultiSelect
                    options={CUSTOMER_SEGMENTS}
                    value={formData.eligibility_rules.customer_segments || []}
                    onChange={(value) => setFormData({
                      ...formData,
                      eligibility_rules: {
                        ...formData.eligibility_rules,
                        customer_segments: value as string[]
                      }
                    })}
                    placeholder="Select target customer segments"
                  />
                </div>

                <TagInput
                  label="Geographic Restrictions"
                  value={formData.eligibility_rules.geographic_restrictions || []}
                  onChange={(value) => setFormData({
                    ...formData,
                    eligibility_rules: {
                      ...formData.eligibility_rules,
                      geographic_restrictions: value
                    }
                  })}
                  placeholder="Add regions, cities, or countries"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={formData.eligibility_rules.time_restrictions?.start_date || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibility_rules: {
                          ...formData.eligibility_rules,
                          time_restrictions: {
                            ...formData.eligibility_rules.time_restrictions,
                            start_date: e.target.value
                          }
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={formData.eligibility_rules.time_restrictions?.end_date || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibility_rules: {
                          ...formData.eligibility_rules,
                          time_restrictions: {
                            ...formData.eligibility_rules.time_restrictions,
                            end_date: e.target.value
                          }
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>
            </FormSection>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <FormSection
              title="Creative Content"
              description="Design how your offer will be presented to customers"
              icon={Palette}
            >
              <div className="space-y-6">
                {formData.creatives.map((creative, index) => (
                  <div key={index} className={`bg-white border border-[${color.ui.border}] rounded-lg p-6 shadow-sm`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        Creative #{index + 1}
                      </h4>
                      {formData.creatives.length > 1 && (
                        <button
                          onClick={() => removeCreative(index)}
                          className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Channel
                        </label>
                        <HeadlessSelect
                          options={CHANNELS}
                          value={creative.channel}
                          onChange={(value) => updateCreative(index, 'channel', value)}
                          placeholder="Select channel"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Language
                        </label>
                        <HeadlessSelect
                          options={LOCALES}
                          value={creative.locale}
                          onChange={(value) => updateCreative(index, 'locale', value)}
                          placeholder="Select language"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={creative.title}
                          onChange={(e) => updateCreative(index, 'title', e.target.value)}
                          placeholder="Enter creative title"
                          className={`w-full px-3 py-2 text-sm border border-[${color.ui.border}] rounded-lg focus:outline-none focus:border-[${color.sentra.main}] transition-colors duration-200`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Text Content
                        </label>
                        <textarea
                          value={creative.text_body}
                          onChange={(e) => updateCreative(index, 'text_body', e.target.value)}
                          placeholder="Enter text content for this creative"
                          rows={3}
                          className={`w-full px-3 py-2 text-sm border border-[${color.ui.border}] rounded-lg focus:outline-none focus:border-[${color.sentra.main}] transition-colors duration-200 resize-none`}
                        />
                      </div>

                      {(creative.channel === 'email' || creative.channel === 'web') && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            HTML Content
                          </label>
                          <textarea
                            value={creative.html_body}
                            onChange={(e) => updateCreative(index, 'html_body', e.target.value)}
                            placeholder="Enter HTML content (optional)"
                            rows={4}
                            className={`w-full px-3 py-2 text-sm border border-[${color.ui.border}] rounded-lg focus:outline-none focus:border-[${color.sentra.main}] transition-colors duration-200 resize-none`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={addCreative}
                  className={`w-full px-4 py-2 text-sm font-medium rounded-lg border border-[${color.ui.border}] text-[${color.sentra.main}] hover:bg-[${color.sentra.main}] hover:text-white transition-all duration-200`}
                >
                  Add Creative
                </button>

                {errors.creatives && (
                  <p className="text-sm text-red-600">{errors.creatives}</p>
                )}
              </div>
            </FormSection>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <FormSection
              title="Review & Submit"
              description="Review all offer details before submission"
              icon={CheckCircle}
            >
              <div className="space-y-6">
                <div className={`bg-white border border-[${color.ui.border}] rounded-lg p-6 shadow-sm`}>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Offer Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2 text-gray-900">{formData.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <span className="ml-2 text-gray-900">
                        {CATEGORIES.find(c => c.value === formData.category_id)?.label || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Products:</span>
                      <span className="ml-2 text-gray-900">{formData.product_ids.length} selected</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Creatives:</span>
                      <span className="ml-2 text-gray-900">{formData.creatives.length} created</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900">Approval Required</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This offer will be submitted for approval and won't be active until approved by an administrator.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      {/* Header */}
      <div className={`bg-white border-b border-[${color.ui.border}] shadow-sm`}>
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/offers')}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${tw.textSecondary} hover:${tw.textPrimary} hover:bg-[${color.ui.background}]`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Offers</span>
              </button>
              <div className={`h-6 w-px bg-[${color.ui.border}]`} />
              <h1 className={`text-xl font-semibold ${tw.textPrimary}`}>Create New Offer</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveDraft}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${tw.textSecondary} hover:${tw.textPrimary} hover:bg-[${color.ui.background}]`}
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <button
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${tw.textSecondary} hover:${tw.textPrimary} hover:bg-[${color.ui.background}]`}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-8 py-8">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Progress Stepper */}
          <div className="mb-8">
            <Stepper
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>

          {/* Form Content */}
          <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] p-8 mb-8`}>
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${currentStep === 1
                ? `${tw.textMuted} cursor-not-allowed`
                : `${tw.textSecondary} hover:${tw.textPrimary} hover:bg-[${color.ui.background}]`
                }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-3">
              {currentStep === STEPS.length ? (
                <button
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-200"
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
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Offer</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-200"
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
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
