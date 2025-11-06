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
  Eye,
} from "lucide-react";
import { color } from "../../../shared/utils/utils";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";
import RegularModal from "../../../shared/components/ui/RegularModal";
import {
  CreativeChannel,
  Locale,
  COMMON_LOCALES,
  OfferCreative,
  RenderCreativeResponse,
} from "../types/offerCreative";
import { offerCreativeService } from "../services/offerCreativeService";

interface LocalOfferCreative extends Omit<OfferCreative, "id" | "offer_id"> {
  id: string; // Use string for local temp ID
  offer_id?: number; // Optional until saved
}

// Helper function to replace variables in text (client-side preview)
const replaceVariables = (
  text: string,
  variables: Record<string, string | number | boolean>
): string => {
  if (!text) return "";
  let result = text;
  Object.keys(variables).forEach((key) => {
    const value = String(variables[key]);
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value);
  });
  return result;
};

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

  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] =
    useState<RenderCreativeResponse | null>(null);
  const [variableOverrides, setVariableOverrides] = useState<string>("");

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

  // Handle preview button click
  const handlePreview = async () => {
    if (!selectedCreativeData) return;

    setIsPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewResult(null);

    // Initialize variable overrides with stored variables
    const storedVars = selectedCreativeData.variables || {};
    setVariableOverrides(JSON.stringify(storedVars, null, 2));

    // Check if creative has been saved (has numeric ID)
    // Saved creatives have numeric string IDs (e.g., "123"), unsaved have random strings (e.g., "abc123xyz")
    const creativeId = selectedCreativeData.id;
    const numericId =
      typeof creativeId === "number"
        ? creativeId
        : !isNaN(Number(creativeId)) &&
          Number(creativeId) > 0 &&
          String(Number(creativeId)) === String(creativeId)
        ? Number(creativeId)
        : null;

    if (numericId !== null) {
      // Creative has been saved - use render endpoint
      try {
        const overrides = storedVars; // Use stored variables as default
        const response = await offerCreativeService.render(
          numericId,
          { variableOverrides: overrides },
          true // Skip cache
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rendered = (response as any).data || response;
        setPreviewResult(rendered);
      } catch (err) {
        // Failed to render creative
        setPreviewError(
          err instanceof Error ? err.message : "Failed to render creative"
        );

        // Fallback to client-side preview
        const clientPreview = {
          rendered_title: replaceVariables(
            selectedCreativeData.title || "",
            storedVars
          ),
          rendered_text_body: replaceVariables(
            selectedCreativeData.text_body || "",
            storedVars
          ),
          rendered_html_body: replaceVariables(
            selectedCreativeData.html_body || "",
            storedVars
          ),
        };
        setPreviewResult(clientPreview);
      }
    } else {
      // Creative not saved yet - use client-side preview
      const clientPreview = {
        rendered_title: replaceVariables(
          selectedCreativeData.title || "",
          storedVars
        ),
        rendered_text_body: replaceVariables(
          selectedCreativeData.text_body || "",
          storedVars
        ),
        rendered_html_body: replaceVariables(
          selectedCreativeData.html_body || "",
          storedVars
        ),
      };
      setPreviewResult(clientPreview);
    }

    setPreviewLoading(false);
  };

  // Handle preview with custom variable overrides
  const handlePreviewWithOverrides = async () => {
    if (!selectedCreativeData) return;

    setPreviewLoading(true);
    setPreviewError(null);

    try {
      // Parse variable overrides
      let overrides: Record<string, string | number | boolean> = {};
      if (variableOverrides.trim()) {
        overrides = JSON.parse(variableOverrides);
      }

      // Merge with stored variables (overrides take precedence)
      const finalOverrides = {
        ...(selectedCreativeData.variables || {}),
        ...overrides,
      };

      // Check if creative has been saved
      const creativeId = selectedCreativeData.id;
      const numericId =
        typeof creativeId === "number"
          ? creativeId
          : !isNaN(Number(creativeId)) &&
            Number(creativeId) > 0 &&
            String(Number(creativeId)) === String(creativeId)
          ? Number(creativeId)
          : null;

      if (numericId !== null) {
        // Use render endpoint
        const response = await offerCreativeService.render(
          numericId,
          { variableOverrides: finalOverrides },
          true
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rendered = (response as any).data || response;
        setPreviewResult(rendered);
      } else {
        // Client-side preview
        const clientPreview = {
          rendered_title: replaceVariables(
            selectedCreativeData.title || "",
            finalOverrides
          ),
          rendered_text_body: replaceVariables(
            selectedCreativeData.text_body || "",
            finalOverrides
          ),
          rendered_html_body: replaceVariables(
            selectedCreativeData.html_body || "",
            finalOverrides
          ),
        };
        setPreviewResult(clientPreview);
      }
    } catch (err) {
      // Failed to preview with overrides
      setPreviewError(
        err instanceof Error ? err.message : "Invalid variable overrides JSON"
      );
    } finally {
      setPreviewLoading(false);
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
              (e.target as HTMLButtonElement).style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.opacity = "1";
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
                    (e.target as HTMLButtonElement).style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.opacity = "1";
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
                      {(selectedCreativeData.title || "").length}/160 characters
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

                  {/* Preview Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handlePreview}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                      style={{
                        backgroundColor: color.primary.action,
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.opacity = "0.9";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.opacity = "1";
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Creative
                    </button>
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

      {/* Preview Modal */}
      <RegularModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewError(null);
          setPreviewResult(null);
          setVariableOverrides("");
        }}
        title="Preview Creative"
        size="xl"
      >
        <div className="space-y-6">
          {/* Variable Overrides */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variable Overrides (JSON) - Optional
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Override variable values to see how the creative looks with
              different data. Leave empty to use stored variables.
            </p>
            <textarea
              value={variableOverrides}
              onChange={(e) => setVariableOverrides(e.target.value)}
              placeholder='{"customerName": "Alice", "discount": "75%"}'
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none font-mono text-sm"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">
                {(() => {
                  if (!variableOverrides.trim())
                    return "Using stored variables";
                  try {
                    JSON.parse(variableOverrides);
                    return <span className="text-green-600">✓ Valid JSON</span>;
                  } catch {
                    return <span className="text-red-600">⚠ Invalid JSON</span>;
                  }
                })()}
              </div>
              <button
                onClick={handlePreviewWithOverrides}
                disabled={previewLoading}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: color.primary.action,
                }}
              >
                {previewLoading ? "Rendering..." : "Update Preview"}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {previewError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{previewError}</p>
            </div>
          )}

          {/* Preview Result */}
          {previewLoading && !previewResult ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          ) : previewResult ? (
            <div className="space-y-4">
              {/* Rendered Title */}
              {previewResult.rendered_title && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rendered Title
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-900">
                      {previewResult.rendered_title}
                    </p>
                  </div>
                </div>
              )}

              {/* Rendered Text Body */}
              {previewResult.rendered_text_body && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rendered Text Body
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {previewResult.rendered_text_body}
                    </p>
                  </div>
                </div>
              )}

              {/* Rendered HTML Body */}
              {previewResult.rendered_html_body && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rendered HTML Body
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: previewResult.rendered_html_body,
                      }}
                    />
                  </div>
                </div>
              )}

              {!previewResult.rendered_title &&
                !previewResult.rendered_text_body &&
                !previewResult.rendered_html_body && (
                  <div className="text-center py-8 text-gray-500">
                    <p>
                      No content to preview. Add title, text body, or HTML body.
                    </p>
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Click "Update Preview" to see how your creative will look.</p>
            </div>
          )}
        </div>
      </RegularModal>
    </div>
  );
}
