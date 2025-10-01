import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { CreateCampaignRequest } from '../../types/campaign';
import StepNavigation from '../../../../shared/components/ui/StepNavigation';

interface CampaignDefinitionStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  formData: CreateCampaignRequest;
  setFormData: (data: CreateCampaignRequest) => void;
}

const objectiveOptions = [
  {
    value: 'acquisition',
    label: 'New Customer Acquisition',
    description: 'Attract and convert new customers to your service',
    icon: '🎯',
    color: 'border-green-300 hover:border-green-400 hover:bg-green-50'
  },
  {
    value: 'retention',
    label: 'Customer Retention',
    description: 'Keep existing customers engaged and loyal',
    icon: '🤝',
    color: 'border-green-200 hover:border-green-300 hover:bg-green-50'
  },
  {
    value: 'churn_prevention',
    label: 'Churn Prevention',
    description: 'Prevent at-risk customers from leaving',
    icon: '🛡️',
    color: 'border-red-200 hover:border-red-300 hover:bg-red-50'
  },
  {
    value: 'upsell_cross_sell',
    label: 'Upsell/Cross-sell',
    description: 'Increase revenue from existing customers',
    icon: '📈',
    color: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
  },
  {
    value: 'reactivation',
    label: 'Dormant Customer Reactivation',
    description: 'Re-engage inactive or dormant customers',
    icon: '🔄',
    color: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50'
  }
];

const categoryOptions = [
  {
    value: 'Acquisition',
    label: 'Acquisition',
    description: 'Campaigns focused on acquiring new customers'
  },
  {
    value: 'Retention',
    label: 'Retention',
    description: 'Campaigns to retain existing customers'
  },
  {
    value: 'Churn Prevention',
    label: 'Churn Prevention',
    description: 'Campaigns to prevent customer churn'
  },
  {
    value: 'Upsell/Cross-sell',
    label: 'Upsell/Cross-sell',
    description: 'Campaigns to increase customer value'
  },
  {
    value: 'Reactivation',
    label: 'Reactivation',
    description: 'Campaigns to reactivate dormant customers'
  },
  {
    value: 'Engagement',
    label: 'Engagement',
    description: 'Campaigns to increase customer engagement'
  },
  {
    value: 'Loyalty',
    label: 'Loyalty',
    description: 'Campaigns to build customer loyalty'
  },
  {
    value: 'Promotional',
    label: 'Promotional',
    description: 'Promotional and discount campaigns'
  }
];


export default function CampaignDefinitionStep({
  onNext,
  formData,
  setFormData
}: CampaignDefinitionStepProps) {
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [objectiveSearchTerm, setObjectiveSearchTerm] = useState('');
  const [isObjectiveDropdownOpen, setIsObjectiveDropdownOpen] = useState(false);

  const filteredCategories = categoryOptions.filter(category =>
    category.label.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const filteredObjectives = objectiveOptions.filter(objective =>
    objective.label.toLowerCase().includes(objectiveSearchTerm.toLowerCase()) ||
    objective.description.toLowerCase().includes(objectiveSearchTerm.toLowerCase())
  );

  const handleNext = () => {
    if (formData.name.trim() && formData.primary_objective && formData.category) {
      onNext();
    }
  };

  const isFormValid = formData.name.trim() && formData.primary_objective && formData.category;

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Definition & Objectives</h2>
        <p className="text-sm text-gray-600">
          Define your campaign goals and choose how you want to create your campaign
        </p>
      </div>


      {/* Campaign Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900 mb-4">Campaign Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] text-sm"
              placeholder="Enter campaign name"
              required
            />
          </div>

          {/* Campaign Category */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Category *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] bg-white text-sm text-left flex items-center justify-between"
              >
                <span className={formData.category ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.category ? categoryOptions.find(c => c.value === formData.category)?.label : 'Select category'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157]"
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: category.value });
                          setIsCategoryDropdownOpen(false);
                          setCategorySearchTerm('');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <div className="font-medium text-gray-900 text-sm">{category.label}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </button>
                    ))}
                    {filteredCategories.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">No categories found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] text-sm"
            placeholder="Describe your campaign objectives and strategy"
            rows={2}
          />
        </div>
      </div>


      {/* Primary Objective */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Primary Objective *</h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsObjectiveDropdownOpen(!isObjectiveDropdownOpen)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] bg-white text-sm text-left flex items-center justify-between"
          >
            <span className={formData.primary_objective ? 'text-gray-900' : 'text-gray-500'}>
              {formData.primary_objective ? (
                <div className="flex items-center">
                  <span className="text-lg mr-2">{objectiveOptions.find(o => o.value === formData.primary_objective)?.icon}</span>
                  <span>{objectiveOptions.find(o => o.value === formData.primary_objective)?.label}</span>
                </div>
              ) : (
                'Select primary objective'
              )}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isObjectiveDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isObjectiveDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search objectives..."
                    value={objectiveSearchTerm}
                    onChange={(e) => setObjectiveSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157]"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredObjectives.map((objective) => (
                  <button
                    key={objective.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, primary_objective: objective.value as CreateCampaignRequest['primary_objective'] });
                      setIsObjectiveDropdownOpen(false);
                      setObjectiveSearchTerm('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center mb-1">
                      <span className="text-lg mr-2">{objective.icon}</span>
                      <span className="font-medium text-gray-900 text-sm">{objective.label}</span>
                    </div>
                    <div className="text-xs text-gray-500 ml-7">{objective.description}</div>
                  </button>
                ))}
                {filteredObjectives.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">No objectives found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900 mb-4">Additional Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campaign Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'low', label: 'Low', icon: '⬇️' },
                { value: 'medium', label: 'Medium', icon: '➡️' },
                { value: 'high', label: 'High', icon: '⬆️' },
                { value: 'critical', label: 'Critical', icon: '🚨' }
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: priority.value as 'low' | 'medium' | 'high' | 'critical' })}
                  className={`p-2 rounded-md border text-center transition-colors text-sm ${formData.priority === priority.value
                    ? 'border-[#588157] bg-[#588157]/5 text-[#588157]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <div className="text-base mb-1">{priority.icon}</div>
                  <div className="text-xs font-medium">{priority.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Policy
            </label>
            <div className="bg-gray-50 rounded-md p-3">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_definitive || false}
                  onChange={(e) => setFormData({ ...formData, is_definitive: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-[#588157] border-gray-300 focus:ring-[#588157] rounded"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Definitive Campaign</div>
                  <div className="text-xs text-gray-500">Cannot be modified after launch</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <StepNavigation
        onNext={handleNext}
        onPrev={() => { }} // First step, no previous
        isNextDisabled={!isFormValid}
        showPrevButton={false}
        className="justify-end"
      />
    </div>
  );
}
