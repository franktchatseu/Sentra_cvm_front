import { ArrowLeft, ArrowRight } from 'lucide-react';
import { tw } from '../../utils/utils';

interface StepNavigationProps {
    onPrev: () => void;
    onNext: () => void;
    isNextDisabled?: boolean;
    nextButtonText?: string;
    showNextButton?: boolean;
    showPrevButton?: boolean;
    className?: string;
}

export default function StepNavigation({
    onPrev,
    onNext,
    isNextDisabled = false,
    nextButtonText = 'Next Step',
    showNextButton = true,
    showPrevButton = true,
    className = ''
}: StepNavigationProps) {
    return (
        <div className={`flex justify-between pt-6 border-t border-gray-200 ${className}`}>
            {showPrevButton && (
                <button
                    onClick={onPrev}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-all duration-200"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                </button>
            )}

            {showNextButton && (
                <button
                    onClick={onNext}
                    disabled={isNextDisabled}
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isNextDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : `${tw.button.primary} hover:shadow-md`
                        }`}
                >
                    {nextButtonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </button>
            )}
        </div>
    );
}
