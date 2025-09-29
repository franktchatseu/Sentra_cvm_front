import { Target, ChevronDown } from 'lucide-react';
import { CreateCampaignRequest } from '../../../../../shared/types/campaign';
import { tw, components } from '../../../../shared/utils/utils';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
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
    value: 'Promotional',
    label: 'Promotional',
    icon: '🎁',
    color: 'border-pink-200 hover:border-pink-300 hover:bg-pink-50'
  },
  {
    value: 'Seasonal',
    label: 'Seasonal',
    icon: '🌟',
    color: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50'
  },
  {
    value: 'Product Launch',
    label: 'Product Launch',
    icon: '🚀',
    color: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'
  },
  {
    value: 'Customer Lifecycle',
    label: 'Customer Lifecycle',
    icon: '👥',
    color: 'border-green-200 hover:border-green-300 hover:bg-green-50'
  },
  {
    value: 'Behavioral Trigger',
    label: 'Behavioral Trigger',
    icon: '⚡',
    color: 'border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50'
  },
  {
    value: 'Loyalty Program',
    label: 'Loyalty Program',
    icon: '💎',
    color: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
  },
  {
    value: 'Win-back',
    label: 'Win-back',
    icon: '🔄',
    color: 'border-teal-200 hover:border-teal-300 hover:bg-teal-50'
  },
  {
    value: 'Educational',
    label: 'Educational',
    icon: '📚',
    color: 'border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50'
  },
  {
    value: 'Event-based',
    label: 'Event-based',
    icon: '📅',
    color: 'border-red-200 hover:border-red-300 hover:bg-red-50'
  },
  {
    value: 'Custom',
    label: 'Custom',
    icon: '⚙️',
    color: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
  }
];


export default function CampaignDefinitionStep({
  onNext,
  formData,
  setFormData
}: CampaignDefinitionStepProps) {
  const handleNext = () => {
    if (formData.name.trim() && formData.primary_objective && formData.category) {
      onNext();
    }
  };

  const isFormValid = formData.name.trim() && formData.primary_objective && formData.category;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className={`text-2xl font-bold ${tw.textPrimary} mb-2`}>Campaign Definition & Objectives</h2>
        <p className={`${tw.textMuted} max-w-2xl mx-auto`}>
          Define your campaign goals and choose how you want to create your campaign
        </p>
      </div>


      <div className="space-y-6">
        <h3 className={`text-lg font-semibold ${tw.textPrimary}`}>Campaign Information</h3>

        <div>
          <label className={`block text-sm font-medium ${tw.textMuted} mb-2`}>
            Campaign Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-3 text-base ${components.input.default}`}
            placeholder="Enter campaign name..."
            required
          />
        </div>

        {/* Campaign Description */}
        <div>
          <label className={`block text-sm font-medium ${tw.textMuted} mb-2`}>
            Campaign Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`w-full px-4 py-3 text-base ${components.input.default}`}
            placeholder="Describe your campaign objectives and strategy..."
            rows={3}
          />
        </div>
      </div>

      {/* Campaign Category */}
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${tw.textMuted} mb-3`}>
            Campaign Category *
          </label>
          <Listbox value={formData.category} onChange={(value) => setFormData({ ...formData, category: value })}>
            <div className="relative">
              <Listbox.Button className={`w-full  px-4 py-3 text-base ${components.input.default} text-left cursor-pointer flex items-center justify-between`}>
                {({ open }) => (
                  <>
                    <span className="block truncate">
                      {formData.category ? (
                        <span className="flex items-center">
                          <span className="mr-2">{categoryOptions.find(cat => cat.value === formData.category)?.icon}</span>
                          {categoryOptions.find(cat => cat.value === formData.category)?.label}
                        </span>
                      ) : (
                        'Select a campaign category...'
                      )}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </>
                )}
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {categoryOptions.map((category) => (
                    <Listbox.Option
                      key={category.value}
                      value={category.value}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 px-4 ${active ? 'bg-gray-50' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span className={`block truncate text-sm ${selected ? 'font-medium' : 'font-normal'}`}>
                          <span className="flex items-center">
                            <span className="mr-3 text-lg">{category.icon}</span>
                            {category.label}
                          </span>
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      </div>

      {/* Primary Objective */}
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${tw.textMuted} mb-3`}>
            Primary Objective *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {objectiveOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, primary_objective: option.value as CreateCampaignRequest['primary_objective'] })}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${formData.primary_objective === option.value
                  ? `${option.color} border-[#3b8169] bg-gradient-to-br from-[#3b8169]/5 to-[#2d5f4e]/5`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className={`font-medium ${tw.textPrimary} mb-1`}>{option.label}</div>
                <div className={`text-sm ${tw.textMuted}`}>{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

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
