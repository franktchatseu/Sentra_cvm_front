import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Target,
  Users,
  Gift,
  Calendar,
  Eye
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { color, tw } from '../../../shared/utils/utils';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { CreateCampaignRequest, CampaignSegment, CampaignOffer, ControlGroup } from '../types/campaign';
import { campaignService } from '../services/campaignService';
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
  onSaveDraft?: () => void;
  onCancel?: () => void;
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
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);

  // Get categoryId from URL params
  const categoryIdParam = searchParams.get('categoryId');
  const preselectedCategoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: '',
    description: '',
    objective: 'acquisition',
    category_id: preselectedCategoryId,
    start_date: undefined,
    end_date: undefined
  });

  const [selectedSegments, setSelectedSegments] = useState<CampaignSegment[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<CampaignOffer[]>([]);
  const [controlGroup, setControlGroup] = useState<ControlGroup>({
    enabled: false,
    percentage: 5,
    type: 'standard'
  });

  const loadCampaignData = useCallback(async () => {
    if (!id) return;

    setIsLoadingCampaign(true);
    try {
      const response = await campaignService.getCampaignById(id);
      console.log('Loaded campaign data:', response);
      const campaign = (response as any).data || response;
      const newFormData: CreateCampaignRequest = {
        name: campaign.name || '',
        description: campaign.description || '',
        objective: campaign.objective || 'acquisition',
        category_id: campaign.category_id || undefined,
        start_date: campaign.start_date || undefined,
        end_date: campaign.end_date || undefined
      };
      console.log('Setting form data:', newFormData);
      setFormData(newFormData);
    } catch {
      showToast('error', 'Failed to load campaign data');
      navigate('/dashboard/campaigns');
    } finally {
      setIsLoadingCampaign(false);
    }
  }, [id, showToast, navigate]);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadCampaignData();
    }
  }, [id, loadCampaignData]);

  // Validation function for each step
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Definition step
        return formData.name.trim() !== '' && formData.objective !== '' && formData.category_id !== undefined;
      case 2: // Audience step
        return selectedSegments.length > 0;
      case 3: // Offers step
        return selectedOffers.length > 0;
      case 4: // Schedule step
        return formData.scheduling && formData.scheduling.type !== '';
      case 5: // Preview step
        return true; // Preview step doesn't need validation
      default:
        return false;
    }
  };

  const canNavigateToStep = (targetStep: number) => {
    // Can always go to previous steps
    if (targetStep < currentStep) return true;

    // Can't go to future steps beyond current + 1
    if (targetStep > currentStep + 1) return false;

    // Can go to next step only if current step is valid
    if (targetStep === currentStep + 1) return validateCurrentStep();

    // Can stay on current step
    if (targetStep === currentStep) return true;

    return false;
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (canNavigateToStep(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!formData.name.trim()) {
        showToast('error', 'Campaign name is required');
        return;
      }

      // Auto-assign a random dummy segment if no segments are selected
      let finalSegments = formData.segments;
      if (finalSegments.length === 0) {
        const dummySegments = [
          'High Value Customers',
          'At Risk Customers',
          'New Subscribers',
          'Voice Heavy Users',
          'Data Bundle Enthusiasts',
          'Weekend Warriors',
          'Business Customers',
          'Dormant Users'
        ];

        const randomSegment = dummySegments[Math.floor(Math.random() * dummySegments.length)];
        finalSegments = [randomSegment];
      }

      const campaignData: CreateCampaignRequest = {
        name: formData.name,
        objective: formData.objective,
        ...(formData.description && { description: formData.description }),
        ...(formData.category_id && { category_id: formData.category_id }),
        ...(formData.start_date && { start_date: formData.start_date }),
        ...(formData.end_date && { end_date: formData.end_date })
      };

      if (isEditMode && id) {
        // Update campaign configuration (approval_status remains unchanged)
        await campaignService.updateCampaign(parseInt(id), campaignData);
        showToast('success', 'Campaign updated successfully!');
      } else {
        // New campaigns are automatically created with status: 'draft', approval_status: 'pending'
        await campaignService.createCampaign(campaignData);
        showToast('success', 'Campaign created and submitted for approval!');
      }

      navigate('/dashboard/campaigns');
    } catch {
      showToast('error', `Failed to ${isEditMode ? 'update' : 'create'} campaign. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      if (!formData.name.trim()) {
        showToast('error', 'Campaign name is required to save draft');
        return;
      }

      const draftData: CreateCampaignRequest = {
        name: formData.name,
        objective: formData.objective,
        ...(formData.description && { description: formData.description }),
        ...(formData.category_id && { category_id: formData.category_id }),
        ...(formData.start_date && { start_date: formData.start_date }),
        ...(formData.end_date && { end_date: formData.end_date })
      };

      await campaignService.createCampaign(draftData);
      showToast('success', 'Draft saved successfully!');

    } catch {
      showToast('error', 'Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/campaigns');
  };

  // const handleReset = () => {
  //   setFormData({
  //     name: '',
  //     description: '',
  //     campaign_type: 'multiple_target_group',
  //     objective: 'acquisition',
  //     category: '',
  //     segments: [],
  //     offers: [],
  //     scheduling: {
  //       type: 'scheduled',
  //       time_zone: 'UTC',
  //       delivery_times: ['09:00'],
  //       frequency_capping: {
  //         max_per_day: 1,
  //         max_per_week: 3,
  //         max_per_month: 10
  //       },
  //       throttling: {
  //         max_per_hour: 1000,
  //         max_per_day: 10000
  //       }
  //     }
  //   });
  //   setSelectedSegments([]);
  //   setSelectedOffers([]);
  //   setControlGroup({
  //     enabled: false,
  //     percentage: 5,
  //     type: 'standard'
  //   });
  //   setCurrentStep(1);
  //   showToast('success', 'Form reset successfully');
  // };

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
    isLoading,
    onSaveDraft: handleSaveDraft,
    onCancel: handleCancel
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

  if (isLoadingCampaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-4`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center pb-6">
            <div></div>
            <div className="flex items-center space-x-3">
              {currentStep !== 5 && (
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: color.sentra.main }}
                onMouseEnter={(e) => { if (!isSavingDraft) (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
                onMouseLeave={(e) => { if (!isSavingDraft) (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
              >
                {isSavingDraft ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/campaigns')}
                className=" text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-xl font-semibold ${tw.textPrimary}`}>
                  {isEditMode ? 'Edit Campaign' : 'Create Campaign'}
                </h1>
                <p className={`text-sm ${tw.textMuted}`}>Step {currentStep} of {steps.length}</p>
              </div>
            </div>
          </div>

          {/* Sticky Progress Navigation */}
          <nav aria-label="Progress" className="sticky top-16 z-40 bg-white py-6 border-b border-gray-200">
            <div className="flex items-center justify-between w-full">
              {steps.map((step, stepIdx) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;

                return (
                  <div key={step.id} className="relative">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      className="relative flex flex-col items-center group z-10"
                      disabled={!canNavigateToStep(step.id)}
                    >
                      <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                      ${status === 'completed'
                          ? `bg-[${color.sentra.main}] border-[${color.sentra.main}] text-white`
                          : status === 'current'
                            ? `bg-white border-[${color.sentra.main}] text-[${color.sentra.main}]`
                            : 'bg-white border-gray-300 text-gray-400'
                        }
                      ${step.id <= currentStep + 2 ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
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

                    {stepIdx !== steps.length - 1 && (
                      <div
                        className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200"
                        style={{
                          transform: 'translateX(0%)',
                          zIndex: 1
                        }}
                      >
                        <div
                          className={`h-full transition-all duration-500 ${step.id < currentStep
                            ? `bg-[${color.sentra.main}] w-full`
                            : "bg-gray-200 w-0"
                            }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          <div className="pb-8">
            {renderStep()}
          </div>

          {/* Sticky Bottom Navigation */}
          <div className="sticky bottom-0 z-50 bg-white border-t border-gray-200 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={currentStep === 5 ? handleSubmit : handleNext}
                disabled={isLoading || !validateCurrentStep()}
                className="inline-flex items-center px-5 py-2 text-sm font-medium rounded-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: color.sentra.main }}
                onMouseEnter={(e) => { if (!isLoading && validateCurrentStep()) (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
                onMouseLeave={(e) => { if (!isLoading && validateCurrentStep()) (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {currentStep === 5 ? (isEditMode ? 'Updating...' : 'Creating...') : 'Loading...'}
                  </>
                ) : (
                  currentStep === 5 ? (isEditMode ? 'Update Campaign' : 'Create Campaign') : 'Next Step'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
