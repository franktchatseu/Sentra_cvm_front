import { ArrowLeft, ArrowRight } from 'lucide-react';
import { colors as color } from '../../../shared/utils/tokens';

interface StepNavigationProps {
    onPrev: () => void;
    onNext: () => void;
    showPrev?: boolean;
    showNext?: boolean;
    prevText?: string;
    nextText?: string;
    isNextDisabled?: boolean;
    isLoading?: boolean;
}

export default function StepNavigation({
    onPrev,
    onNext,
    showPrev = true,
    showNext = true,
    prevText = 'Previous',
    nextText = 'Next Step',
    isNextDisabled = false,
    isLoading = false
}: StepNavigationProps) {
    return (
        <div className="flex justify-between pt-6">
            {showPrev && (
                <button
                    onClick={onPrev}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {prevText}
                </button>
            )}

            {showNext && (
                <button
                    onClick={onNext}
                    disabled={isNextDisabled || isLoading}
                    className="text-white px-6 py-3 rounded-md font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ backgroundColor: color.sentra.main }}
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
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Loading...
                        </>
                    ) : (
                        <>
                            {nextText}
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
