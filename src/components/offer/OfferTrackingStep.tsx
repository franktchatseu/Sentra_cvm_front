import { useState } from 'react';
import { Plus, Trash2, BarChart3, Settings, ArrowLeft, ArrowRight, Edit, X } from 'lucide-react';

interface TrackingRule {
  id: string;
  name: string;
  priority: number;
  parameter: string;
  condition: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'is_any_of';
  value: string;
  enabled: boolean;
}

interface TrackingSource {
  id: string;
  name: string;
  type: 'recharge' | 'usage_metric' | 'custom';
  enabled: boolean;
  rules: TrackingRule[];
}

interface OfferTrackingStepProps {
  trackingSources: TrackingSource[];
  onTrackingSourcesChange: (sources: TrackingSource[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

const TRACKING_TYPES = [
  { value: 'recharge', label: 'Recharge TrackSource', description: 'Track recharge-based activities' },
  { value: 'usage_metric', label: 'Usage Metric', description: 'Track usage-based metrics' },
  { value: 'custom', label: 'Custom Tracking', description: 'Custom tracking parameters' }
];

const PARAMETERS = [
  'Amount', 'Channel', 'Customer_Segment', 'Product_Type', 'Transaction_Type',
  'Location', 'Time_Period', 'Usage_Volume', 'Frequency'
];

const CONDITIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'contains', label: 'Contains' },
  { value: 'is_any_of', label: 'Is any of' }
];

export default function OfferTrackingStep({
  trackingSources,
  onTrackingSourcesChange,
  onNext,
  onPrev
}: OfferTrackingStepProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(
    trackingSources.length > 0 ? trackingSources[0].id : null
  );
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<TrackingRule | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTrackingSource = () => {
    const newSource: TrackingSource = {
      id: generateId(),
      name: 'New Tracking Source',
      type: 'recharge',
      enabled: true,
      rules: []
    };

    const updatedSources = [...trackingSources, newSource];
    onTrackingSourcesChange(updatedSources);
    setSelectedSource(newSource.id);
  };

  const removeTrackingSource = (id: string) => {
    const updatedSources = trackingSources.filter(s => s.id !== id);
    onTrackingSourcesChange(updatedSources);

    if (selectedSource === id) {
      setSelectedSource(updatedSources.length > 0 ? updatedSources[0].id : null);
    }
  };

  const updateTrackingSource = (id: string, updates: Partial<TrackingSource>) => {
    const updatedSources = trackingSources.map(s =>
      s.id === id ? { ...s, ...updates } : s
    );
    onTrackingSourcesChange(updatedSources);
  };

  const addRule = () => {
    const newRule: TrackingRule = {
      id: generateId(),
      name: 'New Rule',
      priority: 1,
      parameter: 'Amount',
      condition: 'equals',
      value: '',
      enabled: true
    };

    setEditingRule(newRule);
    setShowRuleModal(true);
  };

  const saveRule = (sourceId: string, rule: TrackingRule) => {
    const source = trackingSources.find(s => s.id === sourceId);
    if (!source) return;

    const existingRuleIndex = source.rules.findIndex(r => r.id === rule.id);
    let updatedRules;

    if (existingRuleIndex >= 0) {
      updatedRules = [...source.rules];
      updatedRules[existingRuleIndex] = rule;
    } else {
      updatedRules = [...source.rules, rule];
    }

    updateTrackingSource(sourceId, { rules: updatedRules });
    setShowRuleModal(false);
    setEditingRule(null);
  };

  const removeRule = (sourceId: string, ruleId: string) => {
    const source = trackingSources.find(s => s.id === sourceId);
    if (!source) return;

    const updatedRules = source.rules.filter(r => r.id !== ruleId);
    updateTrackingSource(sourceId, { rules: updatedRules });
  };

  const selectedSourceData = trackingSources.find(s => s.id === selectedSource);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Tracking</h2>
        <p className="text-gray-600">Configure tracking sources and rules for offer performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tracking Sources List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tracking Sources</h3>
              <button
                onClick={addTrackingSource}
                className="inline-flex items-center px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>

            {trackingSources.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-4">No tracking sources yet</p>
                <button
                  onClick={addTrackingSource}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {trackingSources.map((source) => (
                  <div
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedSource === source.id
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${source.enabled ? 'bg-emerald-100' : 'bg-gray-100'
                          }`}>
                          <BarChart3 className={`w-4 h-4 ${source.enabled ? 'text-emerald-600' : 'text-gray-400'
                            }`} />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {source.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {TRACKING_TYPES.find(t => t.value === source.type)?.label}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTrackingSource(source.id);
                        }}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {source.rules.length} rule{source.rules.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Source Configuration */}
        <div className="lg:col-span-2">
          {selectedSourceData ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Source Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Name
                    </label>
                    <input
                      type="text"
                      value={selectedSourceData.name}
                      onChange={(e) => updateTrackingSource(selectedSourceData.id, {
                        name: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={selectedSourceData.type}
                      onChange={(e) => updateTrackingSource(selectedSourceData.id, {
                        type: e.target.value as 'recharge' | 'usage_metric' | 'custom'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {TRACKING_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`enabled-${selectedSourceData.id}`}
                    checked={selectedSourceData.enabled}
                    onChange={(e) => updateTrackingSource(selectedSourceData.id, {
                      enabled: e.target.checked
                    })}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor={`enabled-${selectedSourceData.id}`} className="ml-2 text-sm text-gray-700">
                    Set as default tracking source
                  </label>
                </div>

                {/* Rules Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Tracking Rules</h4>
                    <button
                      onClick={() => addRule()}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Rule
                    </button>
                  </div>

                  {selectedSourceData.rules.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm mb-4">No rules configured</p>
                      <button
                        onClick={() => addRule()}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Rule
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedSourceData.rules.map((rule) => (
                        <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-sm text-gray-900">{rule.name}</span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                Priority: {rule.priority}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${rule.enabled
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {rule.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setEditingRule(rule);
                                  setShowRuleModal(true);
                                }}
                                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeRule(selectedSourceData.id, rule.id)}
                                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {rule.parameter} {CONDITIONS.find(c => c.value === rule.condition)?.label.toLowerCase()} "{rule.value}"
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Source Selected</h3>
                <p className="text-gray-500 mb-4">Add a tracking source to start configuring</p>
                <button
                  onClick={addTrackingSource}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rule Modal */}
      {showRuleModal && editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRule.id ? 'Edit Rule' : 'Add Rule'}
              </h3>
              <button
                onClick={() => {
                  setShowRuleModal(false);
                  setEditingRule(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingRule.priority}
                  onChange={(e) => setEditingRule({ ...editingRule, priority: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parameter
                </label>
                <select
                  value={editingRule.parameter}
                  onChange={(e) => setEditingRule({ ...editingRule, parameter: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                >
                  {PARAMETERS.map(param => (
                    <option key={param} value={param}>{param}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={editingRule.condition}
                  onChange={(e) => setEditingRule({ ...editingRule, condition: e.target.value as 'equals' | 'greater_than' | 'less_than' | 'contains' | 'is_any_of' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                >
                  {CONDITIONS.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={editingRule.value}
                  onChange={(e) => setEditingRule({ ...editingRule, value: e.target.value })}
                  placeholder="Enter value..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rule-enabled"
                  checked={editingRule.enabled}
                  onChange={(e) => setEditingRule({ ...editingRule, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="rule-enabled" className="ml-2 text-sm text-gray-700">
                  Enable this rule
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRuleModal(false);
                  setEditingRule(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedSourceData && saveRule(selectedSourceData.id, editingRule)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
        >
          Next Step
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
