import { useState } from "react";
import {
  Send,
  Plus,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import { ManualBroadcastData } from "../pages/CreateManualBroadcastPage";
import { communicationService } from "../../communications/services/communicationService";

interface TestBroadcastStepProps {
  data: ManualBroadcastData;
  onUpdate: (data: Partial<ManualBroadcastData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface TestResult {
  contact: string;
  status: "success" | "failed";
  message?: string;
}

export default function TestBroadcastStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: TestBroadcastStepProps) {
  const [testContacts, setTestContacts] = useState<string[]>(
    data.testContacts || []
  );
  const [currentContact, setCurrentContact] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [error, setError] = useState("");

  const validateContact = (contact: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[0-9\s()-]{8,}$/;

    if (data.channel === "EMAIL") {
      return emailRegex.test(contact);
    } else if (data.channel === "SMS" || data.channel === "WHATSAPP") {
      return phoneRegex.test(contact);
    }
    return emailRegex.test(contact) || phoneRegex.test(contact);
  };

  const handleAddContact = () => {
    const trimmedContact = currentContact.trim();

    if (!trimmedContact) {
      setError("Please enter a contact");
      return;
    }

    if (!validateContact(trimmedContact)) {
      if (data.channel === "EMAIL") {
        setError("Please enter a valid email address");
      } else if (data.channel === "SMS" || data.channel === "WHATSAPP") {
        setError("Please enter a valid phone number");
      } else {
        setError("Please enter a valid email or phone number");
      }
      return;
    }

    if (testContacts.includes(trimmedContact)) {
      setError("This contact is already added");
      return;
    }

    setTestContacts([...testContacts, trimmedContact]);
    setCurrentContact("");
    setError("");
  };

  const handleRemoveContact = (contact: string) => {
    setTestContacts(testContacts.filter((c) => c !== contact));
  };

  const handleSendTest = async () => {
    if (testContacts.length === 0) {
      setError("Please add at least one test contact");
      return;
    }

    if (!data.quicklistId) {
      setError("Audience not created. Please go back to Step 1.");
      return;
    }

    setIsTesting(true);
    setError("");
    setTestResults([]);

    try {
      // Send actual test communication for each contact
      const results: TestResult[] = [];

      for (const contact of testContacts) {
        try {
          await communicationService.sendCommunication({
            source_type: "quicklist",
            source_id: data.quicklistId,
            channels: [data.channel!],
            message_template: {
              title: data.messageTitle || undefined,
              body: data.messageBody || "",
            },
            filters: {
              column_conditions: [
                {
                  column: data.channel === "EMAIL" ? "email" : "phone",
                  operator: "equals",
                  value: contact,
                },
              ],
              limit: 1,
            },
          });

          results.push({
            contact,
            status: "success",
            message: "Message sent successfully",
          });
        } catch (err) {
          console.error(`Failed to send test to ${contact}:`, err);
          results.push({
            contact,
            status: "failed",
            message:
              err instanceof Error ? err.message : "Failed to send message",
          });
        }
      }

      setTestResults(results);
    } catch (err) {
      console.error("Failed to send test broadcasts:", err);
      setError("Failed to send test messages. Please try again.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleNext = () => {
    // Update data
    onUpdate({
      testContacts: testContacts,
      testResults: testResults,
    });

    // Move to next step
    onNext();
  };

  const handleSkipTest = () => {
    // Update data
    onUpdate({
      testContacts: [],
      testResults: [],
    });

    // Move to next step
    onNext();
  };

  const getChannelLabel = () => {
    switch (data.channel) {
      case "EMAIL":
        return "email address";
      case "SMS":
      case "WHATSAPP":
        return "phone number";
      default:
        return "contact";
    }
  };

  return (
    <div
      className="bg-white rounded-md shadow-sm border"
      style={{ borderColor: color.border.default }}
    >
      <div
        className="p-4 sm:p-6 border-b"
        style={{ borderColor: color.border.default }}
      >
        <h2 className={`text-lg sm:text-xl font-semibold ${tw.textPrimary}`}>
          Test Broadcast
        </h2>
        <p className={`text-xs sm:text-sm ${tw.textSecondary} mt-1`}>
          Send a test message before launching your broadcast
        </p>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Test Contact Input */}
        <div>
          <label className={`block text-sm font-medium ${tw.textPrimary} mb-2`}>
            Test{" "}
            {getChannelLabel().charAt(0).toUpperCase() +
              getChannelLabel().slice(1)}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={currentContact}
              onChange={(e) => setCurrentContact(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddContact();
                }
              }}
              className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
              style={{
                borderColor: color.border.default,
                color: color.text.primary,
              }}
              placeholder={`Enter ${getChannelLabel()}...`}
              disabled={isTesting}
            />
            <button
              onClick={handleAddContact}
              disabled={isTesting}
              className="w-full sm:w-auto px-4 py-2 text-white rounded-md transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              style={{ backgroundColor: color.primary.action }}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>Add</span>
            </button>
          </div>
          <p className={`text-xs ${tw.textSecondary} mt-1`}>
            {data.channel === "EMAIL"
              ? "Enter a valid email address (e.g., test@example.com)"
              : data.channel === "SMS" || data.channel === "WHATSAPP"
              ? "Enter a valid phone number (e.g., +1234567890)"
              : "Enter a valid email or phone number"}
          </p>
        </div>

        {/* Test Contacts List */}
        {testContacts.length > 0 && (
          <div>
            <label
              className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
            >
              Test Recipients ({testContacts.length})
            </label>
            <div className="space-y-2">
              {testContacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-md"
                  style={{ backgroundColor: color.surface.cards }}
                >
                  <span className={`text-sm ${tw.textPrimary}`}>{contact}</span>
                  <button
                    onClick={() => handleRemoveContact(contact)}
                    disabled={isTesting}
                    className="p-1 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Send Test Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSendTest}
            disabled={testContacts.length === 0 || isTesting}
            className="w-full sm:w-auto sm:min-w-[200px] px-6 py-3 text-white rounded-md transition-all text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ backgroundColor: color.primary.accent }}
          >
            {isTesting ? (
              <>
                <Loader className="w-5 h-5 animate-spin flex-shrink-0" />
                <span>Sending Test...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 flex-shrink-0" />
                <span>Send Test Broadcast</span>
              </>
            )}
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <label
              className={`block text-sm font-medium ${tw.textPrimary} mb-3`}
            >
              Test Results
            </label>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-md"
                  style={{
                    backgroundColor:
                      result.status === "success"
                        ? `${color.status.success}10`
                        : `${color.status.danger}10`,
                    border: `1px solid ${
                      result.status === "success"
                        ? `${color.status.success}30`
                        : `${color.status.danger}30`
                    }`,
                  }}
                >
                  {result.status === "success" ? (
                    <CheckCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: color.status.success }}
                    />
                  ) : (
                    <XCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: color.status.danger }}
                    />
                  )}
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{
                        color:
                          result.status === "success"
                            ? color.status.success
                            : color.status.danger,
                      }}
                    >
                      {result.contact}
                    </p>
                    <p className={`text-xs ${tw.textMuted} mt-0.5`}>
                      {result.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Success Summary */}
            <div
              className="mt-4 p-4 rounded-md"
              style={{ backgroundColor: `${color.primary.accent}10` }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: color.primary.accent }}
              >
                ✓ Test completed successfully!
              </p>
              <p className={`text-xs ${tw.textSecondary} mt-1`}>
                {testResults.filter((r) => r.status === "success").length} of{" "}
                {testResults.length} test messages sent successfully.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="p-3 rounded-md flex items-start space-x-2"
            style={{
              backgroundColor: `${color.status.danger}10`,
              border: `1px solid ${color.status.danger}30`,
            }}
          >
            <AlertCircle
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: color.status.danger }}
            />
            <p className="text-sm" style={{ color: color.status.danger }}>
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="p-4 sm:p-6 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
        style={{ borderColor: color.border.default }}
      >
        <button
          onClick={onPrevious}
          disabled={isTesting}
          className="w-full sm:w-auto px-6 py-2.5 rounded-md transition-all text-sm font-semibold disabled:opacity-50 whitespace-nowrap"
          style={{
            backgroundColor: color.surface.cards,
            border: `1px solid ${color.border.default}`,
            color: color.text.primary,
          }}
        >
          Previous
        </button>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleSkipTest}
            disabled={isTesting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-md transition-all text-sm font-medium disabled:opacity-50 whitespace-nowrap"
            style={{
              color: color.text.secondary,
            }}
          >
            Skip Test
          </button>
          <button
            onClick={handleNext}
            disabled={isTesting}
            className="w-full sm:w-auto px-6 py-2.5 text-white rounded-md transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ backgroundColor: color.primary.action }}
          >
            Next: Schedule Broadcast
          </button>
        </div>
      </div>
    </div>
  );
}
