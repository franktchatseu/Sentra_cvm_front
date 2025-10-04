import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { CreateCampaignRequest } from '../../types/campaign';

interface CampaignDefinitionStepProps {
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
    value: 'acquisition',
    label: 'Customer Acquisition',
    description: 'Campaigns focused on acquiring new customers'
  },
  {
    value: 'retention',
    label: 'Customer Retention',
    description: 'Campaigns to retain existing customers'
  },
  {
    value: 'engagement',
    label: 'Customer Engagement',
    description: 'Campaigns to increase customer engagement'
  },
  {
    value: 'promotional',
    label: 'Promotional',
    description: 'Promotional and discount campaigns'
  }
];

export default function CampaignDefinitionStep({
  formData,
  setFormData
}: CampaignDefinitionStepProps) {
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [objectiveSearchTerm, setObjectiveSearchTerm] = useState('');
  const [isObjectiveDropdownOpen, setIsObjectiveDropdownOpen] = useState(false);


  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="mt-8 mb-8">
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
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#588157] focus:border-[#588157]"
                        placeholder="Search categories..."
                      />
                    </div>
                  </div>
                  <div className="py-1">
                    {categoryOptions
                      .filter(category =>
                        category.label.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
                        category.description.toLowerCase().includes(categorySearchTerm.toLowerCase())
                      )
                      .map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, category: category.value });
                            setIsCategoryDropdownOpen(false);
                            setCategorySearchTerm('');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          <div className="font-medium">{category.label}</div>
                          <div className="text-gray-500 text-xs">{category.description}</div>
                        </button>
                      ))}
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
            placeholder="Describe your campaign goals and objectives"
            rows={3}
          />
        </div>
      </div>

      {/* Campaign Objectives */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900 mb-4">Campaign Objectives</h3>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Primary Objective *
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsObjectiveDropdownOpen(!isObjectiveDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157] bg-white text-sm text-left flex items-center justify-between"
            >
              <span className={formData.primary_objective ? 'text-gray-900' : 'text-gray-500'}>
                {formData.primary_objective ? objectiveOptions.find(o => o.value === formData.primary_objective)?.label : 'Select objective'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isObjectiveDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isObjectiveDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={objectiveSearchTerm}
                      onChange={(e) => setObjectiveSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#588157] focus:border-[#588157]"
                      placeholder="Search objectives..."
                    />
                  </div>
                </div>
                <div className="py-1">
                  {objectiveOptions
                    .filter(objective =>
                      objective.label.toLowerCase().includes(objectiveSearchTerm.toLowerCase()) ||
                      objective.description.toLowerCase().includes(objectiveSearchTerm.toLowerCase())
                    )
                    .map((objective) => (
                      <button
                        key={objective.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, primary_objective: objective.value as 'acquisition' | 'retention' | 'churn_prevention' | 'upsell_cross_sell' | 'reactivation' });
                          setIsObjectiveDropdownOpen(false);
                          setObjectiveSearchTerm('');
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{objective.icon}</span>
                          <div>
                            <div className="font-medium">{objective.label}</div>
                            <div className="text-gray-500 text-xs">{objective.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Priority */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900 mb-4">Campaign Priority</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Priority Level
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'low', label: 'Low', icon: '⬇️', color: 'border-gray-300 hover:border-gray-400 hover:bg-gray-50' },
              { value: 'medium', label: 'Medium', icon: '➡️', color: 'border-blue-300 hover:border-blue-400 hover:bg-blue-50' },
              { value: 'high', label: 'High', icon: '⬆️', color: 'border-orange-300 hover:border-orange-400 hover:bg-orange-50' },
              { value: 'critical', label: 'Critical', icon: '🚨', color: 'border-red-300 hover:border-red-400 hover:bg-red-50' }
            ].map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: priority.value as 'low' | 'medium' | 'high' | 'critical' })}
                className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${formData.priority === priority.value
                  ? 'border-[#588157] bg-[#588157]/10 text-[#588157] shadow-sm'
                  : `${priority.color} text-gray-700`
                  }`}
              >
                <div className="text-xl mb-1">{priority.icon}</div>
                <div className="text-xs font-medium">{priority.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Policy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Campaign Policy
          </label>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.is_definitive || false}
                onChange={(e) => setFormData({ ...formData, is_definitive: e.target.checked })}
                className="mt-0.5 w-5 h-5 text-[#588157] border-gray-300 focus:ring-[#588157] rounded cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 group-hover:text-[#588157] transition-colors">
                  Definitive Campaign
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Once launched, this campaign cannot be modified. Only pause, resume, or termination actions will be available.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}