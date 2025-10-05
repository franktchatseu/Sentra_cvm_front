import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Package,
    Eye,
    ArrowLeft,
    Check,
} from 'lucide-react';
import { CreateOfferRequest } from '../types/offer';
import { Product } from '../../products/types/product';
import { offerService } from '../services/offerService';
import { offerCategoryService } from '../services/offerCategoryService';
import { OfferCategory } from '../types/offerCategory';
import ProductSelector from '../../products/components/ProductSelector';
import OfferCreativeStep from '../components/OfferCreativeStep';
import OfferTrackingStep from '../components/OfferTrackingStep';
import OfferRewardStep from '../components/OfferRewardStep';
import HeadlessSelect from '../../../shared/components/ui/HeadlessSelect';
import { colors as color } from '../../../shared/utils/tokens';
import { useToast } from '../../../contexts/ToastContext';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

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
    validationErrors?: Record<string, string>;
    clearValidationErrors?: () => void;
    offerCategories?: OfferCategory[];
    categoriesLoading?: boolean;
}

// Step 1: Basic Information
function BasicInfoStep({ onNext, formData, setFormData, validationErrors, clearValidationErrors, offerCategories, categoriesLoading }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onPrev' | 'onSubmit' | 'creatives' | 'setCreatives' | 'trackingSources' | 'setTrackingSources' | 'rewards' | 'setRewards'>) {
    const handleNext = () => {
        if (formData.name.trim() && formData.offer_type) {
            onNext();
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Offer Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (validationErrors?.name && clearValidationErrors) {
                                clearValidationErrors();
                            }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 ${validationErrors?.name ? 'border-red-500' : 'border-gray-200'
                            }`}
                        placeholder="Enter offer name"
                    />
                    {validationErrors?.name && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Offer Type *
                    </label>
                    <HeadlessSelect
                        options={[
                            { value: '', label: 'Select offer type' },
                            { value: 'promotional', label: 'Promotional' },
                            { value: 'loyalty', label: 'Loyalty' },
                            { value: 'seasonal', label: 'Seasonal' },
                            { value: 'referral', label: 'Referral' }
                        ]}
                        value={formData.offer_type || ''}
                        onChange={(value) => {
                            setFormData({ ...formData, offer_type: typeof value === 'string' ? value || undefined : undefined });
                            if (validationErrors?.offer_type && clearValidationErrors) {
                                clearValidationErrors();
                            }
                        }}
                        placeholder="Select offer type"
                    />
                    {validationErrors?.offer_type && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.offer_type}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                    </label>
                    <HeadlessSelect
                        options={[
                            { value: '', label: categoriesLoading ? 'Loading categories...' : 'Select category' },
                            ...(offerCategories || []).map(category => ({
                                value: category.id,
                                label: category.name
                            }))
                        ]}
                        value={formData.category_id?.toString() || ''}
                        onChange={(value) => {
                            setFormData({ ...formData, category_id: value ? Number(value) : undefined });
                            if (validationErrors?.category_id && clearValidationErrors) {
                                clearValidationErrors();
                            }
                        }}
                        placeholder="Select category"
                        disabled={categoriesLoading}
                    />
                    {validationErrors?.category_id && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.category_id}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none transition-all duration-200"
                    placeholder="Enter offer description"
                    rows={3}
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!formData.name.trim() || !formData.offer_type}
                    className="text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                    style={{
                        backgroundColor: color.sentra.main
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
                    Next Step
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// Step 2: Offer Products
function ProductStepWrapper({ onNext, onPrev, formData, setFormData, validationErrors, clearValidationErrors }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onSubmit'>) {
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
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Offer Products</h2>
                <p className="text-gray-600">Select the products that will be included in this offer</p>
            </div>

            <div className="space-y-6">
                <ProductSelector
                    selectedProducts={selectedProducts}
                    onProductsChange={(products) => {
                        setSelectedProducts(products);
                        if (validationErrors?.product_id && clearValidationErrors) {
                            clearValidationErrors();
                        }
                    }}
                    multiSelect={true}
                />
                {validationErrors?.product_id && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{validationErrors.product_id}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-between">
                <button
                    onClick={onPrev}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    className="text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    style={{
                        backgroundColor: color.sentra.main
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
            </div>
        </div>
    );
}

// Step 3: Offer Creative
function OfferCreativeStepWrapper({ onNext, onPrev, creatives, setCreatives }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onSubmit'>) {
    return (
        <div className="space-y-6">
            <OfferCreativeStep
                creatives={creatives}
                onCreativesChange={setCreatives}
            />

            <div className="flex justify-between">
                <button
                    onClick={onPrev}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                </button>
                <button
                    onClick={onNext}
                    className="text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    style={{
                        backgroundColor: color.sentra.main
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
            </div>
        </div>
    );
}

// Step 4: Offer Tracking
function OfferTrackingStepWrapper({ onNext, onPrev, trackingSources, setTrackingSources }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onSubmit'>) {
    return (
        <div className="space-y-6">
            <OfferTrackingStep
                trackingSources={trackingSources}
                onTrackingSourcesChange={setTrackingSources}
            />

            <div className="flex justify-between">
                <button
                    onClick={onPrev}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                </button>
                <button
                    onClick={onNext}
                    className="text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    style={{
                        backgroundColor: color.sentra.main
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
            </div>
        </div>
    );
}

// Step 5: Offer Rewards
function OfferRewardStepWrapper({ onNext, onPrev, rewards, setRewards }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onSubmit'>) {
    return (
        <div className="space-y-6">
            <OfferRewardStep
                rewards={rewards}
                onRewardsChange={setRewards}
            />

            <div className="flex justify-between">
                <button
                    onClick={onPrev}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                </button>
                <button
                    onClick={onNext}
                    className="text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    style={{
                        backgroundColor: color.sentra.main
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
            </div>
        </div>
    );
}

// Step 6: Review
function ReviewStep({ onPrev, onSubmit, formData, creatives, trackingSources, rewards, isLoading }: Omit<StepProps, 'currentStep' | 'totalSteps' | 'onNext'>) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-gray-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Review Offer</h2>
                <p className="text-gray-600">Review all details before updating your offer</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="text-base font-medium text-gray-900">{formData.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="text-base font-medium text-gray-900">{formData.offer_type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Category</p>
                            <p className="text-base font-medium text-gray-900">
                                {formData.category_id ? `Category ${formData.category_id}` : 'Not selected'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Product</p>
                            <p className="text-base font-medium text-gray-900">
                                {formData.product_id ? `Product ${formData.product_id}` : 'Not selected'}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Lifecycle Status</p>
                            <p className="text-base font-medium text-gray-900">{formData.lifecycle_status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Approval Status</p>
                            <p className="text-base font-medium text-gray-900">{formData.approval_status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Reusable</p>
                            <p className="text-base font-medium text-gray-900">{formData.reusable ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Multi-language</p>
                            <p className="text-base font-medium text-gray-900">{formData.multi_language ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Creatives</p>
                            <p className="text-base font-medium text-gray-900">{creatives.length} creative{creatives.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tracking Sources</p>
                            <p className="text-base font-medium text-gray-900">{trackingSources.length} source{trackingSources.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Rewards</p>
                            <p className="text-base font-medium text-gray-900">{rewards.length} reward{rewards.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={onPrev}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{
                        backgroundColor: color.sentra.main
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
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Updating Offer...
                        </>
                    ) : (
                        <>
                            <Check className="w-5 h-5" />
                            Update Offer
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default function EditOfferPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
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
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Offer categories state
    const [offerCategories, setOfferCategories] = useState<OfferCategory[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Load offer data on component mount
    useEffect(() => {
        const loadOfferData = async () => {
            try {
                setIsLoading(true);
                const [offerData, categoriesData] = await Promise.all([
                    offerService.getOfferById(Number(id)),
                    offerCategoryService.getOfferCategories({
                        pageSize: 100,
                        sortBy: 'name',
                        sortDirection: 'ASC'
                    })
                ]);

                // Populate form with existing offer data
                setFormData({
                    name: offerData.name || '',
                    description: offerData.description || '',
                    offer_type: offerData.offer_type || '',
                    category_id: offerData.category_id,
                    product_id: offerData.product_id,
                    eligibility_rules: offerData.eligibility_rules || {},
                    lifecycle_status: offerData.lifecycle_status || 'draft',
                    approval_status: offerData.approval_status || 'pending',
                    reusable: offerData.reusable || false,
                    multi_language: offerData.multi_language || false,
                });

                setOfferCategories(categoriesData.data || []);
            } catch (err) {
                console.error('Failed to load offer data:', err);
                showError('Failed to load offer data', 'Please try again later.');
                navigate('/dashboard/offers');
            } finally {
                setIsLoading(false);
                setCategoriesLoading(false);
            }
        };

        if (id) {
            loadOfferData();
        }
    }, [id, navigate, showError]);

    // Validation functions
    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Required fields validation
        if (!formData.name?.trim()) {
            errors.name = 'Offer name is required';
        }

        if (!formData.offer_type?.trim()) {
            errors.offer_type = 'Offer type is required';
        }

        if (!formData.category_id) {
            errors.category_id = 'Catalog is required';
        }

        if (!formData.product_id) {
            errors.product_id = 'Product selection is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const clearValidationErrors = () => {
        setValidationErrors({});
    };

    // Step navigation
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
            clearValidationErrors();

            // Validate form before submission
            if (!validateForm()) {
                setError('Please fix the validation errors before submitting');
                return;
            }

            await offerService.updateOffer(Number(id), formData);
            success('Offer Updated', `"${formData.name}" has been updated successfully.`);
            navigate('/dashboard/offers');
        } catch (err: unknown) {
            console.error('Update offer error:', err);

            // Parse API error response for better error messages
            let errorMessage = 'Failed to update offer';

            if (err && typeof err === 'object' && 'response' in err) {
                const errorResponse = err as { response?: { data?: { message?: string; error?: string; details?: unknown } } };

                if (errorResponse.response?.data?.message) {
                    errorMessage = errorResponse.response.data.message;
                } else if (errorResponse.response?.data?.error) {
                    errorMessage = errorResponse.response.data.error;
                } else if (errorResponse.response?.data?.details) {
                    // Handle validation errors from API
                    const details = errorResponse.response.data.details;
                    if (Array.isArray(details)) {
                        const fieldErrors: Record<string, string> = {};
                        details.forEach((detail: { field?: string; message?: string }) => {
                            if (detail.field) {
                                fieldErrors[detail.field] = detail.message || 'Invalid value';
                            }
                        });
                        setValidationErrors(fieldErrors);
                        errorMessage = 'Please fix the validation errors below';
                    } else if (typeof details === 'object') {
                        setValidationErrors(details as Record<string, string>);
                        errorMessage = 'Please fix the validation errors below';
                    }
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
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
        validationErrors,
        clearValidationErrors,
        offerCategories,
        categoriesLoading,
    };

    if (isLoading && currentStep === 1) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard/offers')}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Edit Offer
                        </h1>
                        <p className="text-gray-600">Update your offer details and configuration</p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${step <= currentStep
                                ? 'bg-[#3b8169] text-white'
                                : 'bg-gray-200 text-gray-500'
                                }`}>
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                {currentStep === 1 && <BasicInfoStep {...stepProps} />}
                {currentStep === 2 && <ProductStepWrapper {...stepProps} />}
                {currentStep === 3 && <OfferCreativeStepWrapper {...stepProps} />}
                {currentStep === 4 && <OfferTrackingStepWrapper {...stepProps} />}
                {currentStep === 5 && <OfferRewardStepWrapper {...stepProps} />}
                {currentStep === 6 && <ReviewStep {...stepProps} />}
            </div>
        </div>
    );
}
