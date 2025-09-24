import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
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
import { CreateCampaignRequest, CampaignSegment, CampaignOffer, CampaignScheduling, ControlGroup } from '../../types/campaign';
import { campaignColors } from '../../config/campaignColors';
import CampaignDefinitionStep from './campaign/CampaignDefinitionStep';
import AudienceConfigurationStep from './campaign/AudienceConfigurationStep';
import OfferMappingStep from './campaign/OfferMappingStep';
import SchedulingStep from './campaign/SchedulingStepNew';
import CampaignPreviewStep from './campaign/CampaignPreviewStep';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: '',
    description: '',
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
      // Here you would typically call your campaign service
      // await campaignService.createCampaign(formData);
      console.log('Creating campaign:', formData);
      
      // Simulate API call
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
    // Implement save draft functionality
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all form data? This action cannot be undone.')) {
      setFormData({
        name: '',
        description: '',
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
    }
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/campaigns')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create Campaign</h1>
                <p className="text-sm text-gray-500">Step {currentStep} of {steps.length}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                          className={`h-full transition-all duration-500 ${
                            status === 'completed' ? 'bg-[#3b8169]' : 'bg-gray-200'
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
                          ? 'bg-[#3b8169] border-[#3b8169] text-white' 
                          : status === 'current'
                          ? 'bg-white border-[#3b8169] text-[#3b8169]'
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
                        <div className={`text-sm font-medium ${
                          status === 'current' ? 'text-[#3b8169]' : 
                          status === 'completed' ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 hidden sm:block">
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
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
