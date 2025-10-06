import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Target,
  Users,
  Gift,
  Calendar,
  Eye,
  Save,
  RotateCcw
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { color, tw } from '../../../shared/utils/utils';
import { CreateCampaignRequest, CampaignSegment, CampaignOffer, ControlGroup } from '../types/campaign';
import CampaignDefinitionStep from '../components/steps/CampaignDefinitionStep';
import AudienceConfigurationStep from '../components/steps/AudienceConfigurationStep';
import OfferMappingStep from '../components/steps/OfferMappingStep';
import SchedulingStep from '../components/steps/SchedulingStepNew';
import CampaignPreviewStep from '../components/steps/CampaignPreviewStep';

interface StepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  formData: CreateCampaignRequest;
  setFormData: (data: CreateCampaignRequest) => void;
  selectedSegments: CampaignSegment[];
  setSelectedSegments: (segments: CampaignSegment[]) => void;
  selectedOffers: CampaignOffer[];
  setSelectedOffers: (offers: CampaignOffer[]) => void;
  controlGroup: ControlGroup;
  setControlGroup: (group: ControlGroup) => void;
  isLoading?: boolean;
}

const steps = [
  {
    id: 1,
    name: 'Definition',
    description: 'Campaign goals & objectives',
    icon: Target,
    color: 'from-blue-100 to-indigo-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 2,
    name: 'Audience',
    description: 'Segment configuration',
    icon: Users,
    color: 'from-emerald-100 to-teal-100',
    iconColor: 'text-emerald-600'
  },
  {
    id: 3,
    name: 'Offers',
    description: 'Offer selection & mapping',
    icon: Gift,
    color: 'from-purple-100 to-indigo-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 4,
    name: 'Schedule',
    description: 'Timing & frequency',
    icon: Calendar,
    color: 'from-amber-100 to-orange-100',
    iconColor: 'text-amber-600'
  },
  {
    id: 5,
    name: 'Preview',
    description: 'Review & launch',
    icon: Eye,
    color: 'from-rose-100 to-pink-100',
    iconColor: 'text-rose-600'
  }
];

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: '',
    description: '',
    campaign_type: 'multiple_target_group',
    primary_objective: 'acquisition',
    category: '',
    segments: [],
    offers: [],
    scheduling: {
      type: 'scheduled',
      time_zone: 'UTC',
      delivery_times: ['09:00'],
      frequency_capping: {
        max_per_day: 1,
        max_per_week: 3,
        max_per_month: 10
      },
      throttling: {
        max_per_hour: 1000,
        max_per_day: 10000
      }
    }
  });

  const [selectedSegments, setSelectedSegments] = useState<CampaignSegment[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<CampaignOffer[]>([]);
  const [controlGroup, setControlGroup] = useState<ControlGroup>({
    enabled: false,
    percentage: 5,
    type: 'standard'
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // await campaignService.createCampaign(formData);
      console.log('Creating campaign:', formData);

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate back to campaigns page
      navigate('/dashboard/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', formData);
    showToast('success', 'Draft saved successfully');
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      campaign_type: 'multiple_target_group',
      primary_objective: 'acquisition',
      category: '',
      segments: [],
      offers: [],
      scheduling: {
        type: 'scheduled',
        time_zone: 'UTC',
        delivery_times: ['09:00'],
        frequency_capping: {
          max_per_day: 1,
          max_per_week: 3,
          max_per_month: 10
        },
        throttling: {
          max_per_hour: 1000,
          max_per_day: 10000
        }
      }
    });
    setSelectedSegments([]);
    setSelectedOffers([]);
    setControlGroup({
      enabled: false,
      percentage: 5,
      type: 'standard'
    });
    setCurrentStep(1);
    showToast('success', 'Form reset successfully');
  };

  const stepProps: StepProps = {
    currentStep,
    totalSteps: steps.length,
    onNext: handleNext,
    onPrev: handlePrev,
    onSubmit: handleSubmit,
    formData,
    setFormData,
    selectedSegments,
    setSelectedSegments,
    selectedOffers,
    setSelectedOffers,
    controlGroup,
    setControlGroup,
    isLoading
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CampaignDefinitionStep {...stepProps} />;
      case 2:
        return <AudienceConfigurationStep {...stepProps} />;
      case 3:
        return <OfferMappingStep {...stepProps} />;
      case 4:
        return <SchedulingStep {...stepProps} />;
      case 5:
        return <CampaignPreviewStep {...stepProps} />;
      default:
        return <CampaignDefinitionStep {...stepProps} />;
    }
  };

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-4`}>
        <div className="">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard/campaigns')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className={`text-xl font-semibold ${tw.textPrimary}`}>Create Campaign</h1>
                  <p className={`text-sm ${tw.textMuted}`}>Step {currentStep} of {steps.length}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveDraft}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                  style={{ backgroundColor: color.sentra.main }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, stepIdx) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;

                return (
                  <li key={step.id} className="relative flex-1">
                    {stepIdx !== steps.length - 1 && (
                      <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200">
                        <div
                          className={`h-full transition-all duration-500 ${status === 'completed' ? `bg-[${color.sentra.main}]` : 'bg-gray-200'
                            }`}
                          style={{
                            width: status === 'completed' ? '100%' : '0%'
                          }}
                        />
                      </div>
                    )}

                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className="relative flex flex-col items-center group"
                      disabled={step.id > currentStep}
                    >
                      <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                      ${status === 'completed'
                          ? `bg-[${color.sentra.main}] border-[${color.sentra.main}] text-white`
                          : status === 'current'
                            ? `bg-white border-[${color.sentra.main}] text-[${color.sentra.main}]`
                            : 'bg-white border-gray-300 text-gray-400'
                        }
                      ${step.id <= currentStep ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                    `}>
                        {status === 'completed' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>

                      <div className="mt-2 text-center">
                        <div className={`text-sm font-medium ${status === 'current' ? `text-[${color.sentra.main}]` :
                          status === 'completed' ? tw.textPrimary : tw.textMuted
                          }`}>
                          {step.name}
                        </div>
                        <div className={`text-xs mt-1 hidden sm:block ${tw.textMuted}`}>
                          {step.description}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
