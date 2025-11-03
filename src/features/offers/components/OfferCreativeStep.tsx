import { useState } from "react";
import {
  Plus,
  Trash2,
  Globe,
  MessageSquare,
  Mail,
  Smartphone,
  Monitor,
  Phone,
  PhoneCall,
} from "lucide-react";
import { color } from "../../../shared/utils/utils";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import {
  CreativeChannel,
  Locale,
  VALID_CHANNELS,
  COMMON_LOCALES,
  OfferCreative,
} from "../types/offerCreative";

interface LocalOfferCreative extends Omit<OfferCreative, "id" | "offer_id"> {
  id: string; // Use string for local temp ID
  offer_id?: number; // Optional until saved
}

interface OfferCreativeStepProps {
  creatives: LocalOfferCreative[];
  onCreativesChange: (creatives: LocalOfferCreative[]) => void;
  validationError?: string; // Optional validation error message
}

// Channel configuration with icons
const CHANNELS: Array<{
  value: CreativeChannel;
  label: string;
  icon: typeof Smartphone;
}> = [
  { value: "SMS", label: "SMS", icon: Smartphone },
  { value: "Email", label: "Email", icon: Mail },
  { value: "Push", label: "Push Notification", icon: MessageSquare },
  { value: "InApp", label: "In-App", icon: Monitor },
  { value: "Web", label: "Web", icon: Monitor },
  { value: "IVR", label: "IVR", icon: PhoneCall },
  { value: "USSD", label: "USSD", icon: Phone },
  { value: "WhatsApp", label: "WhatsApp", icon: MessageSquare },
];

// Locale labels for display
const getLocaleLabel = (locale: Locale): string => {
  const localeMap: Record<string, string> = {
    en: "English",
    "en-US": "English (US)",
    "en-GB": "English (UK)",
    fr: "French",
    "fr-CA": "French (Canada)",
    "fr-FR": "French (France)",
    es: "Spanish",
    "es-ES": "Spanish (Spain)",
    "es-MX": "Spanish (Mexico)",
    de: "German",
    "de-DE": "German (Germany)",
    ar: "Arabic",
    "ar-SA": "Arabic (Saudi Arabia)",
    pt: "Portuguese",
    "pt-BR": "Portuguese (Brazil)",
    "pt-PT": "Portuguese (Portugal)",
    sw: "Swahili",
    "sw-UG": "Swahili (Uganda)",
    "sw-KE": "Swahili (Kenya)",
  };
  return localeMap[locale] || locale;
};

const LOCALE_OPTIONS = COMMON_LOCALES.map((locale) => ({
  value: locale,
  label: getLocaleLabel(locale),
}));

export default function OfferCreativeStep({
  creatives,
  onCreativesChange,
  validationError,
}: OfferCreativeStepProps) {
  // Initialize selectedCreative from creatives if available, otherwise null
  const [selectedCreative, setSelectedCreative] = useState<string | null>(
    () => {
      return creatives.length > 0 ? creatives[0].id : null;
    }
  );
  // Track raw JSON text for variables to allow free typing
  const [variablesText, setVariablesText] = useState<Record<string, string>>(
    {}
  );

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addCreative = () => {
    const newCreative: LocalOfferCreative = {
      id: generateId(),
      channel: "Email", // Default to Email (backend format)
      locale: "en", // Default locale
      title: "",
      text_body: "",
      html_body: "",
      variables: {} as Record<string, string | number | boolean>,
      is_active: true,
    };

    const updatedCreatives = [...creatives, newCreative];
    onCreativesChange(updatedCreatives);
    setSelectedCreative(newCreative.id);
    // Initialize empty variables text for new creative
    setVariablesText((prev) => ({ ...prev, [newCreative.id]: "" }));
  };

  const removeCreative = (id: string) => {
    const updatedCreatives = creatives.filter((c) => c.id !== id);
    onCreativesChange(updatedCreatives);

    // Update selection if we removed the currently selected creative
    if (selectedCreative === id) {
      const newSelection =
        updatedCreatives.length > 0 ? updatedCreatives[0].id : null;
      setSelectedCreative(newSelection);
    }
  };

  const updateCreative = (id: string, updates: Partial<LocalOfferCreative>) => {
    const updatedCreatives = creatives.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    onCreativesChange(updatedCreatives);
  };

  const selectedCreativeData = creatives.find((c) => c.id === selectedCreative);
  const getChannelConfig = (channel: CreativeChannel) =>
    CHANNELS.find((c) => c.value === channel);

  // Get variables text for current creative (with fallback)
  const getVariablesText = (creativeId: string): string => {
    if (variablesText[creativeId]) {
      return variablesText[creativeId];
    }
    const creative = creatives.find((c) => c.id === creativeId);
    if (creative?.variables && Object.keys(creative.variables).length > 0) {
      return JSON.stringify(creative.variables, null, 2);
    }
    return "";
  };

  // Update variables text and try to parse
  const handleVariablesChange = (creativeId: string, text: string) => {
    // Store the raw text
    setVariablesText((prev) => ({ ...prev, [creativeId]: text }));

    // Try to parse and update if valid JSON
    if (text.trim() === "") {
      updateCreative(creativeId, { variables: {} });
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        updateCreative(creativeId, { variables: parsed });
      } else {
        // Invalid structure - keep the text but don't update variables
        // This allows user to continue typing to fix it
      }
    } catch {
      // Invalid JSON while typing - that's okay, just don't update variables yet
      // User can continue typing
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Error Display */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 font-medium">
                {validationError}
              </p>
            </div>
          </div>
        </div>
      )}

      {creatives.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Creatives Added
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Create compelling content for your offer across different channels
          </p>
          <button
            onClick={addCreative}
            className="inline-flex items-center px-4 py-2 text-sm text-white rounded-lg transition-colors font-medium"
            style={{
              backgroundColor: color.primary.action,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor =
                color.primary.hover;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor =
                color.primary.action;
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Creative
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creative List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Creatives</h3>
                <button
                  onClick={addCreative}
                  className="inline-flex items-center px-4 py-2 text-sm text-white rounded-lg transition-colors font-medium"
                  style={{
                    backgroundColor: color.primary.action,
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      color.primary.hover;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      color.primary.action;
                  }}
                >
                  <Plus className="w-5 h-5 mr-1.5" />
                  Add Creative
                </button>
              </div>

              <div className="space-y-2">
                {creatives.map((creative) => {
                  const channelConfig = getChannelConfig(creative.channel);
                  const Icon = channelConfig?.icon || MessageSquare;

                  return (
                    <div
                      key={creative.id}
                      onClick={() => setSelectedCreative(creative.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCreative === creative.id
                          ? "border-gray-300 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {channelConfig?.label || creative.channel}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              {getLocaleLabel(creative.locale)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCreative(creative.id);
                          }}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {creative.title && (
                        <div className="mt-2 text-xs text-gray-600 truncate">
                          {creative.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Creative Editor */}
          <div className="lg:col-span-2">
            {selectedCreativeData ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 w-full">
                <div className="space-y-6">
                  {/* Channel and Locale */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Channel
                      </label>
                      <HeadlessSelect
                        value={selectedCreativeData.channel}
                        onChange={(value) =>
                          updateCreative(selectedCreativeData.id, {
                            channel: value as CreativeChannel,
                          })
                        }
                        options={CHANNELS.map((channel) => ({
                          value: channel.value,
                          label: channel.label,
                        }))}
                        placeholder="Select channel"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Locale / Language
                      </label>
                      <HeadlessSelect
                        value={selectedCreativeData.locale}
                        onChange={(value) =>
                          updateCreative(selectedCreativeData.id, {
                            locale: value as Locale,
                          })
                        }
                        options={LOCALE_OPTIONS}
                        placeholder="Select locale"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (160 characters max)
                    </label>
                    <input
                      type="text"
                      maxLength={160}
                      value={selectedCreativeData.title}
                      onChange={(e) =>
                        updateCreative(selectedCreativeData.id, {
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter creative title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedCreativeData.title.length}/160 characters
                    </div>
                  </div>

                  {/* Text Body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Body
                    </label>
                    <textarea
                      value={selectedCreativeData.text_body}
                      onChange={(e) =>
                        updateCreative(selectedCreativeData.id, {
                          text_body: e.target.value,
                        })
                      }
                      placeholder="Enter the text content..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    />
                  </div>

                  {/* HTML Body (for email/web) */}
                  {(selectedCreativeData.channel === "Email" ||
                    selectedCreativeData.channel === "Web") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        HTML Body
                      </label>
                      <textarea
                        value={selectedCreativeData.html_body}
                        onChange={(e) =>
                          updateCreative(selectedCreativeData.id, {
                            html_body: e.target.value,
                          })
                        }
                        placeholder="Enter HTML content..."
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none font-mono text-sm"
                      />
                    </div>
                  )}

                  {/* Variables */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variables (JSON)
                    </label>
                    <textarea
                      value={getVariablesText(selectedCreativeData.id)}
                      onChange={(e) =>
                        handleVariablesChange(
                          selectedCreativeData.id,
                          e.target.value
                        )
                      }
                      placeholder='{"variable_name": "value"}'
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none font-mono text-sm"
                    />
                    <div className="text-xs text-gray-500 mt-1 flex items-start gap-2">
                      <span>
                        Use variables like {`{{variable_name}}`} in your content
                      </span>
                      {(() => {
                        const text = getVariablesText(selectedCreativeData.id);
                        if (text.trim() && text.trim() !== "{}") {
                          try {
                            JSON.parse(text);
                            return (
                              <span className="text-green-600">
                                ✓ Valid JSON
                              </span>
                            );
                          } catch {
                            return (
                              <span className="text-red-600">
                                ⚠ Invalid JSON (keep typing...)
                              </span>
                            );
                          }
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Creative Selected
                </h3>
                <p className="text-gray-500 text-sm">
                  Select a creative from the list above to start editing.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
