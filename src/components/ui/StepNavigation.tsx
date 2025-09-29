import { ArrowLeft, ArrowRight } from 'lucide-react';
import { tw } from '../../design/utils';

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
                    className="inline-flex items-center px-3 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Previous
                </button>
            )}

            {showNextButton && (
                <button
                    onClick={onNext}
                    disabled={isNextDisabled}
                    className={`inline-flex items-center px-3 py-3 rounded-xl font-semibold transition-all duration-200 ${isNextDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : `${tw.button.primary} hover:shadow-lg hover:scale-105`
                        }`}
                >
                    {nextButtonText}
                    <ArrowRight className="w-5 h-5 ml-2" />
                </button>
            )}
        </div>
    );
}
