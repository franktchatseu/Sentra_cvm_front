import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, MessageSquare, Send, Calendar } from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import { useToast } from "../../../contexts/ToastContext";
import ProgressStepper, {
  Step,
} from "../../../shared/components/ui/ProgressStepper";
import TargetAudienceStep from "../components/TargetAudienceStep";
import DefineCommunicationStep from "../components/DefineCommunicationStep";
import TestBroadcastStep from "../components/TestBroadcastStep";
import ScheduleStep from "../components/ScheduleStep";

export interface ManualBroadcastData {
  // Step 1: Audience
  audienceFile?: File;
  audienceName?: string;
  audienceDescription?: string;
  uploadType?: string;
  quicklistId?: number;
  rowCount?: number;

  // Step 2: Communication
  channel?: "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";
  messageTitle?: string;
  messageBody?: string;
  isRichText?: boolean;

  // Step 3: Test
  testContacts?: string[];
  testResults?: Record<string, unknown>;

  // Step 4: Schedule
  scheduleType?: "now" | "later";
  scheduleDate?: string;
  scheduleTime?: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    name: "Target Audience",
    description: "Define your audience",
    icon: Users,
  },
  {
    id: 2,
    name: "Define Communication",
    description: "Create your message",
    icon: MessageSquare,
  },
  {
    id: 3,
    name: "Test Broadcast",
    description: "Test before sending",
    icon: Send,
  },
  {
    id: 4,
    name: "Schedule",
    description: "Launch your broadcast",
    icon: Calendar,
  },
];

export default function CreateManualBroadcastPage() {
  const navigate = useNavigate();
  const { success: showToast, error: showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [broadcastData, setBroadcastData] = useState<ManualBroadcastData>({});

  const updateBroadcastData = (data: Partial<ManualBroadcastData>) => {
    setBroadcastData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (canNavigateToStep(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const canNavigateToStep = (stepId: number) => {
    // Can navigate to current step or previous steps
    return stepId <= currentStep;
  };

  const handleSubmit = async () => {
    try {
      // TODO: Save manual broadcast to database
      showToast("Manual Broadcast created successfully!");
      navigate("/dashboard/quicklists");
    } catch (err) {
      console.error("Failed to create manual broadcast:", err);
      showError("Failed to create manual broadcast");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TargetAudienceStep
            data={broadcastData}
            onUpdate={updateBroadcastData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <DefineCommunicationStep
            data={broadcastData}
            onUpdate={updateBroadcastData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <TestBroadcastStep
            data={broadcastData}
            onUpdate={updateBroadcastData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <ScheduleStep
            data={broadcastData}
            onUpdate={updateBroadcastData}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div
        className="bg-white rounded-md border p-4"
        style={{ borderColor: color.border.default }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/dashboard/quicklists")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className={`text-lg font-semibold ${tw.textPrimary}`}>
                Create Manual Broadcast
              </h1>
            </div>
          </div>

          {/* Sticky Progress Navigation */}
          <ProgressStepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            canNavigateToStep={canNavigateToStep}
            primaryColor={color.primary.action}
            textPrimary={tw.textPrimary}
            textMuted={tw.textMuted}
          />

          {/* Step Content */}
          <div className="py-4">{renderStep()}</div>
        </div>
      </div>
    </div>
  );
}
