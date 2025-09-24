import { useState } from 'react';
import { Plus, Trash2, Globe, MessageSquare, Mail, Smartphone, Monitor } from 'lucide-react';

interface OfferCreative {
  id: string;
  channel: 'sms' | 'email' | 'push' | 'web' | 'whatsapp';
  locale: string;
  title: string;
  text_body: string;
  html_body: string;
  variables: Record<string, string | number | boolean>;
}

interface OfferCreativeStepProps {
  creatives: OfferCreative[];
  onCreativesChange: (creatives: OfferCreative[]) => void;
}

const CHANNELS = [
  { value: 'sms', label: 'SMS', icon: Smartphone, color: 'green' },
  { value: 'email', label: 'Email', icon: Mail, color: 'blue' },
  { value: 'push', label: 'Push Notification', icon: MessageSquare, color: 'purple' },
  { value: 'web', label: 'Web', icon: Monitor, color: 'indigo' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'green' }
] as const;

const LOCALES = [
  { value: 'en', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
  { value: 'ar', label: 'Arabic' },
  { value: 'pt', label: 'Portuguese' }
];

export default function OfferCreativeStep({
  creatives,
  onCreativesChange
}: OfferCreativeStepProps) {
  const [selectedCreative, setSelectedCreative] = useState<string | null>(
    creatives.length > 0 ? creatives[0].id : null
  );

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addCreative = () => {
    const newCreative: OfferCreative = {
      id: generateId(),
      channel: 'email',
      locale: 'en',
      title: '',
      text_body: '',
      html_body: '',
      variables: {} as Record<string, string | number | boolean>
    };

    const updatedCreatives = [...creatives, newCreative];
    onCreativesChange(updatedCreatives);
    setSelectedCreative(newCreative.id);
  };

  const removeCreative = (id: string) => {
    const updatedCreatives = creatives.filter(c => c.id !== id);
    onCreativesChange(updatedCreatives);

    if (selectedCreative === id) {
      setSelectedCreative(updatedCreatives.length > 0 ? updatedCreatives[0].id : null);
    }
  };

  const updateCreative = (id: string, updates: Partial<OfferCreative>) => {
    const updatedCreatives = creatives.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    onCreativesChange(updatedCreatives);
  };

  const selectedCreativeData = creatives.find(c => c.id === selectedCreative);
  const getChannelConfig = (channel: string) => CHANNELS.find(c => c.value === channel);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-gray-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Offer Creative</h2>
        <p className="text-gray-600">Create channel-specific creative content for your offer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creative List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Creatives</h3>
              <button
                onClick={addCreative}
                className="inline-flex items-center px-3 py-1.5 text-xs text-white rounded-lg transition-colors font-medium"
                style={{
                  backgroundColor: '#3b8169'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#2d5a4a';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#3b8169';
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>

            {creatives.length === 0 ? (
              <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Creatives Added</h3>
                <p className="text-gray-500 text-sm mb-4">Create compelling content for your offer across different channels</p>
                <div className="text-xs text-gray-400">
                  Click the "Add" button above to get started
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {creatives.map((creative) => {
                  const channelConfig = getChannelConfig(creative.channel);
                  const Icon = channelConfig?.icon || MessageSquare;

                  return (
                    <div
                      key={creative.id}
                      onClick={() => setSelectedCreative(creative.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedCreative === creative.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${channelConfig?.color || 'gray'}-100`}>
                            <Icon className={`w-4 h-4 text-${channelConfig?.color || 'gray'}-600`} />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {channelConfig?.label || creative.channel}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              {LOCALES.find(l => l.value === creative.locale)?.label || creative.locale}
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
            )}
          </div>
        </div>

        {/* Creative Editor */}
        <div className="lg:col-span-2">
          {selectedCreativeData ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Channel and Locale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Channel
                    </label>
                    <select
                      value={selectedCreativeData.channel}
                      onChange={(e) => updateCreative(selectedCreativeData.id, {
                        channel: e.target.value as any
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    >
                      {CHANNELS.map(channel => (
                        <option key={channel.value} value={channel.value}>
                          {channel.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Locale
                    </label>
                    <select
                      value={selectedCreativeData.locale}
                      onChange={(e) => updateCreative(selectedCreativeData.id, {
                        locale: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    >
                      {LOCALES.map(locale => (
                        <option key={locale.value} value={locale.value}>
                          {locale.label}
                        </option>
                      ))}
                    </select>
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
                    onChange={(e) => updateCreative(selectedCreativeData.id, {
                      title: e.target.value
                    })}
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
                    onChange={(e) => updateCreative(selectedCreativeData.id, {
                      text_body: e.target.value
                    })}
                    placeholder="Enter the text content..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>

                {/* HTML Body (for email/web) */}
                {(selectedCreativeData.channel === 'email' || selectedCreativeData.channel === 'web') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HTML Body
                    </label>
                    <textarea
                      value={selectedCreativeData.html_body}
                      onChange={(e) => updateCreative(selectedCreativeData.id, {
                        html_body: e.target.value
                      })}
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
                    value={JSON.stringify(selectedCreativeData.variables, null, 2)}
                    onChange={(e) => {
                      try {
                        const variables = JSON.parse(e.target.value);
                        updateCreative(selectedCreativeData.id, { variables });
                      } catch {
                        // Invalid JSON, don't update
                      }
                    }}
                    placeholder='{"variable_name": "value"}'
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none font-mono text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Use variables like {`{{variable_name}}`} in your content
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Creative Selected</h3>
              <p className="text-gray-500 text-sm">Select a creative from the list above to start editing.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
