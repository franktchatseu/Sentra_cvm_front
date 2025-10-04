import React, { ReactNode, useEffect } from 'react';
import { Save, X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';

interface StepFlowLayoutProps {
    currentStep: number;
    totalSteps: number;
    stepTitle: string;
    stepDescription: string;
    onNext: () => void;
    onPrev: () => void;
    onSaveDraft?: () => void;
    onCancel?: () => void;
    isNextDisabled?: boolean;
    nextButtonText?: string;
    isSavingDraft?: boolean;
    customNavigation?: ReactNode;
    children: ReactNode;
    className?: string;
    showProgressBar?: boolean;
    showStepNumbers?: boolean;
    stepIcons?: ReactNode[];
    variant?: 'default' | 'compact' | 'minimal';
    confirmCancel?: boolean;
    cancelMessage?: string;
}

export default function EnhancedStepFlowLayout({
    currentStep,
    totalSteps,
    stepTitle,
    stepDescription,
    onNext,
    onPrev,
    onSaveDraft,
    onCancel,
    isNextDisabled = false,
    nextButtonText = 'Next Step',
    isSavingDraft = false,
    customNavigation,
    children,
    className = '',
    showProgressBar = true,
    showStepNumbers = true,
    stepIcons,
    variant = 'default',
    confirmCancel = true,
    cancelMessage = 'Are you sure you want to cancel? Your progress will be lost.'
}: StepFlowLayoutProps) {
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !isNextDisabled && !e.shiftKey) {
                e.preventDefault();
                onNext();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isNextDisabled, onNext]);

    const handleSaveDraft = async () => {
        if (onSaveDraft) {
            try {
                await onSaveDraft();
                showToast('Draft saved successfully!', 'success');
            } catch (error) {
                showToast('Failed to save draft', 'error');
            }
        } else {
            showToast('Draft saved successfully!', 'success');
        }
    };

    const handleCancel = () => {
        if (confirmCancel) {
            if (window.confirm(cancelMessage)) {
                if (onCancel) {
                    onCancel();
                } else {
                    navigate(-1);
                }
            }
        } else {
            if (onCancel) {
                onCancel();
            } else {
                navigate(-1);
            }
        }
    };

    const progressPercentage = (currentStep / totalSteps) * 100;

    if (variant === 'minimal') {
        return (
            <div className={`space-y-4 ${className}`}>
                {showProgressBar && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-[#588157] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                )}
                {children}
                <div className="flex justify-between items-center pt-4 border-t">
                    <button
                        onClick={handleCancel}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Cancel
                    </button>
                    <div className="flex space-x-2">
                        <button
                            onClick={onPrev}
                            disabled={currentStep === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={onNext}
                            disabled={isNextDisabled}
                            className={`px-3 py-1 text-sm rounded ${isNextDisabled
                                    ? 'bg-gray-300 text-gray-500'
                                    : 'bg-[#588157] text-white hover:bg-[#4a6b3a]'
                                }`}
                        >
                            {nextButtonText}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{stepTitle}</h3>
                        <p className="text-sm text-gray-600">{stepDescription}</p>
                    </div>
                    {showStepNumbers && (
                        <div className="text-sm text-gray-500">
                            Step {currentStep} of {totalSteps}
                        </div>
                    )}
                </div>

                {showProgressBar && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className="bg-[#588157] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                )}

                {children}

                <div className="flex justify-between items-center pt-4">
                    <div className="flex space-x-2">
                        <button
                            onClick={handleCancel}
                            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSavingDraft}
                            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            {isSavingDraft ? 'Saving...' : 'Save Draft'}
                        </button>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={onPrev}
                            disabled={currentStep === 1}
                            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={onNext}
                            disabled={isNextDisabled}
                            className={`px-3 py-2 text-sm rounded ${isNextDisabled
                                    ? 'bg-gray-300 text-gray-500'
                                    : 'bg-[#588157] text-white hover:bg-[#4a6b3a]'
                                }`}
                        >
                            {nextButtonText}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`max-w-7xl space-y-6 ${className}`}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{stepTitle}</h2>
                        <p className="text-sm text-gray-600">{stepDescription}</p>
                    </div>
                    {showStepNumbers && (
                        <div className="flex items-center space-x-2">
                            {Array.from({ length: totalSteps }, (_, index) => (
                                <div
                                    key={index}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${index + 1 < currentStep
                                            ? 'bg-[#588157] text-white'
                                            : index + 1 === currentStep
                                                ? 'bg-[#588157] text-white ring-2 ring-[#588157] ring-offset-2'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {index + 1 < currentStep ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showProgressBar && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{Math.round(progressPercentage)}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#588157] h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-white hover:border-gray-400 transition-all duration-200"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveDraft}
                        disabled={isSavingDraft}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-white hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSavingDraft ? 'Saving...' : 'Save Draft'}
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrev}
                        disabled={currentStep === 1}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-white hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                    </button>
                    <button
                        onClick={onNext}
                        disabled={isNextDisabled}
                        className={`inline-flex items-center px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isNextDisabled
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#588157] text-white hover:bg-[#4a6b3a] hover:shadow-md transform hover:scale-105'
                            }`}
                    >
                        {nextButtonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>

            {customNavigation && (
                <div className="mb-6">
                    {customNavigation}
                </div>
            )}

            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}