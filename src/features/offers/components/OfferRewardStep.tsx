import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Gift, Edit, X } from 'lucide-react';
import { color as utilColor } from '../../../shared/utils/utils';

interface RewardRule {
  id: string;
  name: string;
  bundle_subscription_track: string;
  priority: number;
  condition: string;
  value: string;
  reward_type: 'bundle' | 'points' | 'discount' | 'cashback';
  reward_value: string;
  fulfillment_response: string;
  success_text: string;
  default_failure: string;
  error_group: string;
  failure_text: string;
  enabled: boolean;
}

interface OfferReward {
  id: string;
  name: string;
  type: 'default' | 'sms_night' | 'custom';
  rules: RewardRule[];
}

interface OfferRewardStepProps {
  rewards: OfferReward[];
  onRewardsChange: (rewards: OfferReward[]) => void;
}

const REWARD_TYPES = [
  { value: 'default', label: 'DEFAULT (Bundle_Subscription_Track)', description: 'Standard bundle subscription tracking' },
  { value: 'sms_night', label: 'SMS Night (Bundle_Subscription_Track)', description: 'Night-time SMS bundle tracking' },
  { value: 'custom', label: 'Custom Reward', description: 'Custom reward configuration' }
];

const BUNDLE_TRACKS = [
  'R2TPersAdjustBalCount2',
  'SelectDependantProduct',
  'SYSDATE'
];

const REWARD_RULE_TYPES = [
  { value: 'bundle', label: 'Bundle' },
  { value: 'points', label: 'Points' },
  { value: 'discount', label: 'Discount' },
  { value: 'cashback', label: 'Cashback' }
];

export default function OfferRewardStep({
  rewards,
  onRewardsChange
}: OfferRewardStepProps) {
  const [selectedReward, setSelectedReward] = useState<string | null>(
    rewards.length > 0 ? rewards[0].id : null
  );
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RewardRule | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addReward = () => {
    const newReward: OfferReward = {
      id: generateId(),
      name: 'New Reward',
      type: 'default',
      rules: []
    };

    const updatedRewards = [...rewards, newReward];
    onRewardsChange(updatedRewards);
    setSelectedReward(newReward.id);
  };

  const removeReward = (id: string) => {
    const updatedRewards = rewards.filter(r => r.id !== id);
    onRewardsChange(updatedRewards);

    if (selectedReward === id) {
      setSelectedReward(updatedRewards.length > 0 ? updatedRewards[0].id : null);
    }
  };

  const updateReward = (id: string, updates: Partial<OfferReward>) => {
    const updatedRewards = rewards.map(r =>
      r.id === id ? { ...r, ...updates } : r
    );
    onRewardsChange(updatedRewards);
  };

  const addRule = () => {
    const newRule: RewardRule = {
      id: generateId(),
      name: 'New Rule',
      bundle_subscription_track: 'R2TPersAdjustBalCount2',
      priority: 1,
      condition: '',
      value: '',
      reward_type: 'bundle',
      reward_value: '',
      fulfillment_response: 'success',
      success_text: '',
      default_failure: 'failed',
      error_group: 'Low balance Failure [01]',
      failure_text: 'failed due to low balance',
      enabled: true
    };

    setEditingRule(newRule);
    setShowRuleModal(true);
  };

  const saveRule = (rewardId: string, rule: RewardRule) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    const existingRuleIndex = reward.rules.findIndex(r => r.id === rule.id);
    let updatedRules;

    if (existingRuleIndex >= 0) {
      updatedRules = [...reward.rules];
      updatedRules[existingRuleIndex] = rule;
    } else {
      updatedRules = [...reward.rules, rule];
    }

    updateReward(rewardId, { rules: updatedRules });
    setShowRuleModal(false);
    setEditingRule(null);
  };

  const removeRule = (rewardId: string, ruleId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    const updatedRules = reward.rules.filter(r => r.id !== ruleId);
    updateReward(rewardId, { rules: updatedRules });
  };

  const selectedRewardData = rewards.find(r => r.id === selectedReward);

  return (
    <div className="space-y-6">
      {rewards.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rewards Added</h3>
          <p className="text-gray-500 text-sm mb-6">Define what customers will receive when they engage with your offer</p>
          <button
            onClick={addReward}
            className="inline-flex items-center px-4 py-2 text-sm text-white rounded-lg transition-colors font-medium"
            style={{ backgroundColor: utilColor.sentra.main }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = utilColor.sentra.hover;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = utilColor.sentra.main;
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Reward
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rewards List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Rewards</h3>
                <button
                  onClick={addReward}
                  className="inline-flex items-center px-4 py-2 text-sm text-white rounded-lg transition-colors font-medium"
                  style={{ backgroundColor: utilColor.sentra.main }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = utilColor.sentra.hover;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = utilColor.sentra.main;
                  }}
                >
                  <Plus className="w-5 h-5 mr-1.5" />
                  Add Reward
                </button>
              </div>

              <div className="space-y-2">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    onClick={() => setSelectedReward(reward.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedReward === reward.id
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                          <Gift className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {reward.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {REWARD_TYPES.find(t => t.value === reward.type)?.label}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeReward(reward.id);
                        }}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {reward.rules.length} rule{reward.rules.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reward Configuration */}
          <div className="lg:col-span-2">
            {selectedRewardData ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-6">
                  {/* Reward Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reward Name
                      </label>
                      <input
                        type="text"
                        value={selectedRewardData.name}
                        onChange={(e) => updateReward(selectedRewardData.id, {
                          name: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reward Type
                      </label>
                      <select
                        value={selectedRewardData.type}
                        onChange={(e) => updateReward(selectedRewardData.id, {
                          type: e.target.value as 'default' | 'sms_night' | 'custom'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                      >
                        {REWARD_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Rules Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Reward Rules</h4>
                      <button
                        onClick={() => addRule()}
                        className="inline-flex items-center px-3 py-1 text-sm text-white rounded-lg transition-colors"
                        style={{ backgroundColor: utilColor.sentra.main }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = utilColor.sentra.hover;
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = utilColor.sentra.main;
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Rule
                      </button>
                    </div>

                    {selectedRewardData.rules.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm mb-4">No rules configured</p>
                        <button
                          onClick={() => addRule()}
                          className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors"
                          style={{ backgroundColor: utilColor.sentra.main }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = utilColor.sentra.hover;
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = utilColor.sentra.main;
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Rule
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedRewardData.rules.map((rule) => (
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
                                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeRule(selectedRewardData.id, rule.id)}
                                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Track: {rule.bundle_subscription_track}</div>
                              <div>Type: {rule.reward_type} - Value: {rule.reward_value}</div>
                              <div>Success: {rule.success_text || 'Default success message'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reward Selected</h3>
                <p className="text-gray-500 text-sm">Select a reward from the list above to start configuring.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rule Modal */}
      {showRuleModal && editingRule && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRule.id ? 'Edit Reward Rule' : 'Add Reward Rule'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bundle Subscription Track
                </label>
                <select
                  value={editingRule.bundle_subscription_track}
                  onChange={(e) => setEditingRule({ ...editingRule, bundle_subscription_track: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                >
                  {BUNDLE_TRACKS.map(track => (
                    <option key={track} value={track}>{track}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reward Type
                  </label>
                  <select
                    value={editingRule.reward_type}
                    onChange={(e) => setEditingRule({ ...editingRule, reward_type: e.target.value as 'bundle' | 'points' | 'discount' | 'cashback' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  >
                    {REWARD_RULE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reward Value
                  </label>
                  <input
                    type="text"
                    value={editingRule.reward_value}
                    onChange={(e) => setEditingRule({ ...editingRule, reward_value: e.target.value })}
                    placeholder="Enter reward value..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Success Text
                </label>
                <textarea
                  value={editingRule.success_text}
                  onChange={(e) => setEditingRule({ ...editingRule, success_text: e.target.value })}
                  placeholder="Enter success message..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Error Group
                  </label>
                  <input
                    type="text"
                    value={editingRule.error_group}
                    onChange={(e) => setEditingRule({ ...editingRule, error_group: e.target.value })}
                    placeholder="e.g., Low balance Failure [01]"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Failure Text
                  </label>
                  <input
                    type="text"
                    value={editingRule.failure_text}
                    onChange={(e) => setEditingRule({ ...editingRule, failure_text: e.target.value })}
                    placeholder="Enter failure message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rule-enabled"
                  checked={editingRule.enabled}
                  onChange={(e) => setEditingRule({ ...editingRule, enabled: e.target.checked })}
                  className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:outline-none"
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
                onClick={() => selectedRewardData && saveRule(selectedRewardData.id, editingRule)}
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: utilColor.sentra.main }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = utilColor.sentra.hover;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = utilColor.sentra.main;
                }}
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
