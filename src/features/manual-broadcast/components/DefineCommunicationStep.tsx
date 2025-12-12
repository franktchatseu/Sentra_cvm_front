import { useState, useRef } from "react";
import { Mail, MessageSquare, Phone, Bell, AlertCircle, Variable } from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import { ManualBroadcastData } from "../pages/CreateManualBroadcastPage";
import PreviewPanel from "../../communications/components/PreviewPanel";
import { useLanguage } from "../../../contexts/LanguageContext";
import HierarchicalVariableSelector from "./HierarchicalVariableSelector";
import type { TemplateVariable } from "../types";
import { insertVariableAtCursor, formatVariablePlaceholder } from "../utils/variableInsertion";

interface DefineCommunicationStepProps {
  data: ManualBroadcastData;
  onUpdate: (data: Partial<ManualBroadcastData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

type Channel = "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";

export default function DefineCommunicationStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: DefineCommunicationStepProps) {
  const { t } = useLanguage();
  const channels = [
    {
      id: "EMAIL" as Channel,
      name: t.manualBroadcast.channelEmail,
      icon: Mail,
      description: t.manualBroadcast.channelEmailDesc,
    },
    {
      id: "SMS" as Channel,
      name: t.manualBroadcast.channelSMS,
      icon: MessageSquare,
      description: t.manualBroadcast.channelSMSDesc,
    },
    {
      id: "WHATSAPP" as Channel,
      name: t.manualBroadcast.channelWhatsApp,
      icon: Phone,
      description: t.manualBroadcast.channelWhatsAppDesc,
    },
    {
      id: "PUSH" as Channel,
      name: t.manualBroadcast.channelPush,
      icon: Bell,
      description: t.manualBroadcast.channelPushDesc,
    },
  ];
  const [selectedChannel, setSelectedChannel] = useState<Channel>(
    data.channel || "EMAIL"
  );
  const [messageTitle, setMessageTitle] = useState(data.messageTitle || "");
  const [messageBody, setMessageBody] = useState(data.messageBody || "");
  const [isRichText, setIsRichText] = useState(data.isRichText || false);
  const [error, setError] = useState("");
  const [showVariableSelector, setShowVariableSelector] = useState(false);
  const [activeField, setActiveField] = useState<"title" | "body">("body");
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [selectedVariables, setSelectedVariables] = useState<TemplateVariable[]>(
    data.selectedVariables || []
  );
  
  // Refs for textarea/input elements
  const titleInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleToggleRichText = () => {
    setIsRichText(!isRichText);
  };

  /**
   * Handles variable selection from the HierarchicalVariableSelector.
   * Inserts the variable at the current cursor position in the active field.
   * Requirements: 3.1, 3.2, 3.3
   */
  const handleVariableSelect = (variable: TemplateVariable) => {
    // Track selected variables for state persistence
    if (!selectedVariables.find((v) => v.id === variable.id)) {
      setSelectedVariables((prev) => [...prev, variable]);
    }

    if (activeField === "title") {
      const result = insertVariableAtCursor(messageTitle, cursorPosition, variable);
      setMessageTitle(result.newText);
      // Update cursor position after insertion
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.setSelectionRange(result.newCursorPosition, result.newCursorPosition);
          titleInputRef.current.focus();
        }
      }, 0);
    } else {
      if (isRichText) {
        // For rich text, append at the end
        const placeholder = formatVariablePlaceholder(variable);
        setMessageBody(messageBody + " " + placeholder + " ");
      } else {
        const result = insertVariableAtCursor(messageBody, cursorPosition, variable);
        setMessageBody(result.newText);
        // Update cursor position after insertion
        setTimeout(() => {
          if (bodyTextareaRef.current) {
            bodyTextareaRef.current.setSelectionRange(result.newCursorPosition, result.newCursorPosition);
            bodyTextareaRef.current.focus();
          }
        }, 0);
      }
    }

    // Close the variable selector after selection
    setShowVariableSelector(false);
  };

  /**
   * Calculates character count and SMS segments for SMS/WhatsApp messages.
   * Requirements: 4.3
   */
  const getCharacterInfo = () => {
    const charCount = messageBody.length;
    // GSM-7 encoding: 160 chars per segment, or 153 for concatenated
    // Unicode: 70 chars per segment, or 67 for concatenated
    const isUnicode = /[^\x00-\x7F]/.test(messageBody);
    const singleSegmentLimit = isUnicode ? 70 : 160;
    const multiSegmentLimit = isUnicode ? 67 : 153;
    
    let segments = 1;
    if (charCount > singleSegmentLimit) {
      segments = Math.ceil(charCount / multiSegmentLimit);
    }
    
    return { charCount, segments, isUnicode };
  };

  /**
   * Generates sample data for preview based on selected variables and uploaded file data.
   * Uses first row of uploaded file or mock data for demonstration.
   * Requirements: 4.5
   */
  const getSampleDataForPreview = (): Record<string, string> => {
    const sampleData: Record<string, string> = {};
    
    // If we have sample data from the uploaded file, use it
    if (data.fileColumns && data.fileColumns.length > 0) {
      // Create sample data from file columns
      data.fileColumns.forEach((col) => {
        sampleData[col] = `[${col}]`;
      });
    }
    
    // Add sample data for selected template variables
    selectedVariables.forEach((variable) => {
      const key = `${variable.sourceName.toLowerCase().replace(/\s+/g, "_")}.${variable.value}`;
      // Generate realistic sample data based on field type
      switch (variable.fieldType) {
        case "text":
          if (variable.value.includes("name")) {
            sampleData[key] = "John Doe";
          } else if (variable.value.includes("email")) {
            sampleData[key] = "john.doe@example.com";
          } else if (variable.value.includes("phone")) {
            sampleData[key] = "+1234567890";
          } else {
            sampleData[key] = `Sample ${variable.name}`;
          }
          break;
        case "numeric":
          sampleData[key] = "12345";
          break;
        case "date":
          sampleData[key] = new Date().toLocaleDateString();
          break;
        case "boolean":
          sampleData[key] = "Yes";
          break;
        default:
          sampleData[key] = `[${variable.name}]`;
      }
    });
    
    return sampleData;
  };

  /**
   * Renders text with highlighted variable placeholders.
   * Variables are displayed with a distinct background color.
   * Requirements: 4.4
   */
  const renderHighlightedText = (text: string): React.ReactNode => {
    if (!text) return null;
    
    // Regex to match variable placeholders like {{source.field}}
    const variableRegex = /(\{\{[^}]+\}\})/g;
    const parts = text.split(variableRegex);
    
    return parts.map((part, index) => {
      if (variableRegex.test(part)) {
        // Reset regex lastIndex after test
        variableRegex.lastIndex = 0;
        return (
          <span
            key={index}
            className="rounded px-0.5"
            style={{
              backgroundColor: `${color.primary.accent}25`,
              color: color.primary.accent,
              fontWeight: 500,
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleNext = () => {
    // Validation
    if (!messageBody.trim()) {
      setError(t.manualBroadcast.errorMessageBodyRequired);
      return;
    }

    if (selectedChannel === "EMAIL" && !messageTitle.trim()) {
      setError(t.manualBroadcast.errorSubjectRequired);
      return;
    }

    setError("");

    // Update data including selected variables for state persistence
    onUpdate({
      channel: selectedChannel,
      messageTitle: messageTitle.trim(),
      messageBody: messageBody.trim(),
      isRichText: isRichText,
      selectedVariables: selectedVariables,
    });

    // Move to next step
    onNext();
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
          {t.manualBroadcast.defineCommunicationTitle}
        </h2>
        <p className={`text-xs sm:text-sm ${tw.textSecondary} mt-1`}>
          {t.manualBroadcast.defineCommunicationSubtitle}
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Channel & Message Editor */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Channel Selection */}
            <div>
              <label
                className={`block text-sm font-medium ${tw.textPrimary} mb-2`}
              >
                {t.manualBroadcast.channelLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = selectedChannel === channel.id;
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => handleChannelSelect(channel.id)}
                      className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-md border-2 transition-all"
                      style={{
                        borderColor: isSelected
                          ? color.primary.accent
                          : color.border.default,
                        backgroundColor: isSelected
                          ? `${color.primary.accent}10`
                          : "white",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: isSelected
                            ? color.primary.accent
                            : color.surface.cards,
                        }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{
                            color: isSelected ? "white" : color.text.secondary,
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <p
                          className={`text-sm font-semibold ${
                            isSelected ? tw.textPrimary : tw.textSecondary
                          }`}
                        >
                          {channel.name}
                        </p>
                        <p
                          className={`text-xs ${tw.textMuted} mt-0.5 hidden sm:block`}
                        >
                          {channel.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: color.primary.accent }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Editor with Hierarchical Variable Selector */}
            <div className="space-y-4">
              {/* Header with Variable Selector Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label className={`text-sm font-medium ${tw.textPrimary}`}>
                  {t.manualBroadcast.defineCommunicationTitle}
                </label>
                <div className="flex items-center gap-2">
                  {/* Rich Text Toggle for Email */}
                  {selectedChannel === "EMAIL" && (
                    <button
                      type="button"
                      onClick={handleToggleRichText}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md border transition-colors whitespace-nowrap"
                      style={{
                        backgroundColor: isRichText ? `${color.primary.accent}15` : "white",
                        borderColor: isRichText ? color.primary.accent : "#D1D5DB",
                        color: isRichText ? color.primary.accent : "#6B7280",
                      }}
                    >
                      <span>{isRichText ? "Rich Text" : "Plain Text"}</span>
                    </button>
                  )}
                  {/* Variable Selector Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowVariableSelector(!showVariableSelector)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md border transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor: showVariableSelector ? `${color.primary.accent}15` : "white",
                      borderColor: showVariableSelector ? color.primary.accent : "#D1D5DB",
                      color: showVariableSelector ? color.primary.accent : "#6B7280",
                    }}
                  >
                    <Variable className="w-4 h-4" />
                    <span className="hidden sm:inline">Insert Variable</span>
                    <span className="sm:hidden">Variables</span>
                  </button>
                </div>
              </div>

              {/* Hierarchical Variable Selector Panel */}
              {showVariableSelector && (
                <div className="mb-4">
                  <HierarchicalVariableSelector
                    onVariableSelect={handleVariableSelect}
                    className="max-h-64 overflow-y-auto"
                  />
                </div>
              )}

              {/* Subject Line for Email */}
              {selectedChannel === "EMAIL" && (
                <div>
                  <label className={`text-sm font-medium ${tw.textPrimary} mb-2 block`}>
                    Subject Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={messageTitle}
                    onChange={(e) => {
                      setMessageTitle(e.target.value);
                      setCursorPosition(e.target.selectionStart || 0);
                    }}
                    onClick={(e) => {
                      setActiveField("title");
                      setCursorPosition(e.currentTarget.selectionStart || 0);
                    }}
                    onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart || 0)}
                    onFocus={(e) => {
                      setActiveField("title");
                      setCursorPosition(e.currentTarget.selectionStart || 0);
                    }}
                    placeholder="Enter email subject..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      "--tw-ring-color": `${color.primary.accent}40`,
                    } as React.CSSProperties}
                  />
                </div>
              )}

              {/* Message Body with Variable Highlighting - Requirements: 4.4 */}
              <div>
                <label className={`text-sm font-medium ${tw.textPrimary} mb-2 block`}>
                  Message Body <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* Highlighted Preview Overlay */}
                  <div 
                    className="absolute inset-0 px-4 py-3 pointer-events-none overflow-hidden font-mono text-sm whitespace-pre-wrap break-words"
                    style={{ 
                      color: "transparent",
                      zIndex: 1,
                    }}
                    aria-hidden="true"
                  >
                    {renderHighlightedText(messageBody)}
                  </div>
                  {/* Actual Textarea */}
                  <textarea
                    ref={bodyTextareaRef}
                    value={messageBody}
                    onChange={(e) => {
                      setMessageBody(e.target.value);
                      setCursorPosition(e.target.selectionStart || 0);
                    }}
                    onClick={(e) => {
                      setActiveField("body");
                      setCursorPosition(e.currentTarget.selectionStart || 0);
                    }}
                    onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart || 0)}
                    onFocus={(e) => {
                      setActiveField("body");
                      setCursorPosition(e.currentTarget.selectionStart || 0);
                    }}
                    placeholder="Enter your message... Use the Variable button to insert dynamic content."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all font-mono text-sm resize-none"
                    style={{ 
                      "--tw-ring-color": `${color.primary.accent}40`,
                      background: "transparent",
                      position: "relative",
                      zIndex: 2,
                      caretColor: color.text.primary,
                    } as React.CSSProperties}
                  />
                </div>
                
                {/* Variable Tags Display - Shows inserted variables as chips */}
                {selectedVariables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-xs text-gray-500 mr-1">Variables used:</span>
                    {selectedVariables.map((variable) => (
                      <span
                        key={variable.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${color.primary.accent}15`,
                          color: color.primary.accent,
                          border: `1px solid ${color.primary.accent}30`,
                        }}
                      >
                        {variable.sourceName}.{variable.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Character Count for SMS/WhatsApp - Requirements: 4.3 */}
                {(selectedChannel === "SMS" || selectedChannel === "WHATSAPP") && (
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Character count: {getCharacterInfo().charCount}
                      {getCharacterInfo().isUnicode && " (Unicode)"}
                    </span>
                    <span>
                      SMS Segments: {getCharacterInfo().segments}
                    </span>
                  </div>
                )}
                
                {selectedChannel === "EMAIL" && (
                  <p className="mt-2 text-xs text-gray-500">
                    Variables will be replaced with actual customer data when sent
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <PreviewPanel
                channel={selectedChannel}
                title={messageTitle}
                body={messageBody}
                sampleData={getSampleDataForPreview()}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mt-4 sm:mt-6 p-3 rounded-md flex items-start space-x-2"
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
          className="w-full sm:w-auto px-6 py-2.5 rounded-md transition-all text-sm font-semibold whitespace-nowrap"
          style={{
            backgroundColor: color.surface.cards,
            border: `1px solid ${color.border.default}`,
            color: color.text.primary,
          }}
        >
          {t.manualBroadcast.previous}
        </button>
        <button
          onClick={handleNext}
          disabled={
            !messageBody.trim() ||
            (selectedChannel === "EMAIL" && !messageTitle.trim())
          }
          className="w-full sm:w-auto px-6 py-2.5 text-white rounded-md transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          style={{ backgroundColor: color.primary.action }}
        >
          {t.manualBroadcast.nextTest}
        </button>
      </div>
    </div>
  );
}
