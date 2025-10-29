import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, ChevronUp, Plus, Trash2, Clock, BarChart3, BellOff, Star } from 'lucide-react';
import { color, tw, components } from '../../../shared/utils/utils';
import { 
    CommunicationPolicyConfiguration, 
    CreateCommunicationPolicyRequest, 
    CommunicationPolicyType,
    CommunicationChannel,
    COMMUNICATION_POLICY_TYPES,
    COMMUNICATION_CHANNELS,
    TimeWindowConfig,
    MaximumCommunicationConfig,
    DNDConfig,
    VIPListConfig,
    DNDCategory,
    DND_CATEGORIES,
    DAYS_OF_WEEK
} from '../types/communicationPolicyConfig';

interface CommunicationPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policy?: CommunicationPolicyConfiguration;
    onSave: (policy: CreateCommunicationPolicyRequest) => Promise<void>;
    isSaving?: boolean;
}

interface AllPolicyConfigs {
    timeWindow: TimeWindowConfig;
    maximumCommunication: MaximumCommunicationConfig;
    dnd: DNDConfig;
    vipList: VIPListConfig;
}

export default function CommunicationPolicyModal({ 
    isOpen, 
    onClose, 
    policy, 
    onSave, 
    isSaving = false 
}: CommunicationPolicyModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [channels, setChannels] = useState<CommunicationChannel[]>(['EMAIL']);
    const [isActive, setIsActive] = useState(true);
    
    const [configs, setConfigs] = useState<AllPolicyConfigs>({
        timeWindow: {
            startTime: '09:00',
            endTime: '18:00',
            timezone: 'UTC',
            days: []
        },
        maximumCommunication: {
            type: 'daily',
            maxCount: 3
        },
        dnd: {
            categories: []
        },
        vipList: {
            action: 'include',
            vipLists: [],
            priority: 1
        }
    });
    
    // Track which section is currently expanded (only one at a time)
    const [expandedSection, setExpandedSection] = useState<CommunicationPolicyType | null>('timeWindow');
    
    // Track channel dropdown state
    const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
    
    const [error, setError] = useState('');

    useEffect(() => {
        if (policy) {
            setName(policy.name);
            setDescription(policy.description || '');
            setChannels(policy.channels);
            setIsActive(policy.isActive);
        } else {
            setName('');
            setDescription('');
            setChannels(['EMAIL']);
            setIsActive(true);
            setConfigs({
                timeWindow: {
                    startTime: '09:00',
                    endTime: '18:00',
                    timezone: 'UTC',
                    days: []
                },
                maximumCommunication: {
                    type: 'daily',
                    maxCount: 3
                },
                dnd: {
                    categories: []
                },
                vipList: {
                    action: 'include',
                    vipLists: [],
                    priority: 1
                }
            });
        }
        setError('');
        setIsChannelDropdownOpen(false); // Reset dropdown state when modal opens/closes
    }, [policy, isOpen]);

    const toggleSection = (type: CommunicationPolicyType) => {
        // If clicking the currently expanded section, collapse it
        // Otherwise, expand the clicked section (and collapse others)
        setExpandedSection(current => current === type ? null : type);
    };
    
    const updateConfig = <T extends CommunicationPolicyType>(
        type: T,
        updater: (prev: AllPolicyConfigs[T]) => AllPolicyConfigs[T]
    ) => {
        setConfigs(prev => ({
            ...prev,
            [type]: updater(prev[type] as AllPolicyConfigs[T])
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Policy name is required');
            return;
        }

        setError('');
        
        // Create policies for each type with configurations
        const policyData: CreateCommunicationPolicyRequest = {
            name,
            description,
            channels,
            type: 'timeWindow',
            config: configs.timeWindow,
            isActive
        };
        
        await onSave(policyData);
    };

    const getTypeIcon = (type: CommunicationPolicyType) => {
        switch (type) {
            case 'timeWindow': return <Clock className="w-5 h-5" />;
            case 'maximumCommunication': return <BarChart3 className="w-5 h-5" />;
            case 'dnd': return <BellOff className="w-5 h-5" />;
            case 'vipList': return <Star className="w-5 h-5" />;
        }
    };

    const renderTimeWindowConfig = () => {
        const timeConfig = configs.timeWindow;
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
                            Start Time
                        </label>
                        <input
                            type="time"
                            value={timeConfig.startTime}
                            onChange={(e) => updateConfig('timeWindow', prev => ({ ...prev, startTime: e.target.value }))}
                            className={`${components.input.default} w-full px-3 py-2`}
                        />
                    </div>
                    <div>
                        <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
                            End Time
                        </label>
                        <input
                            type="time"
                            value={timeConfig.endTime}
                            onChange={(e) => updateConfig('timeWindow', prev => ({ ...prev, endTime: e.target.value }))}
                            className={`${components.input.default} w-full px-3 py-2`}
                        />
                    </div>
                </div>
                <div>
                    <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
                        Days of Week
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {DAYS_OF_WEEK.map(day => (
                            <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={timeConfig.days?.includes(day.value) || false}
                                    onChange={(e) => {
                                        const days = timeConfig.days || [];
                                        const newDays = e.target.checked
                                            ? [...days, day.value]
                                            : days.filter(d => d !== day.value);
                                        updateConfig('timeWindow', prev => ({ ...prev, days: newDays }));
                                    }}
                                    className="rounded"
                                    style={{ accentColor: color.primary.action }}
                                />
                                <span className={`${tw.caption} ${tw.textSecondary}`}>{day.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderMaxCommunicationConfig = () => {
        const maxConfig = configs.maximumCommunication;
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
                            Period Type
                        </label>
                        <select
                            value={maxConfig.type}
                            onChange={(e) => updateConfig('maximumCommunication', prev => ({ 
                                ...prev, 
                                type: e.target.value as 'daily' | 'weekly' | 'monthly' 
                            }))}
                            className={`${components.input.default} w-full px-3 py-2`}
                        >
                            <option value="daily">Daily Maximum</option>
                            <option value="weekly">Weekly Maximum</option>
                            <option value="monthly">Monthly Maximum</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
                            Maximum Count
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={maxConfig.maxCount}
                            onChange={(e) => updateConfig('maximumCommunication', prev => ({ 
                                ...prev, 
                                maxCount: parseInt(e.target.value) || 1 
                            }))}
                            className={`${components.input.default} w-full px-3 py-2`}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderDNDConfig = () => {
        const dndConfig = configs.dnd;
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className={`${tw.caption} ${tw.textSecondary}`}>Manage customer preferences</p>
                    <button
                        type="button"
                        onClick={() => {
                            const newCategory: DNDCategory = {
                                id: Date.now().toString(),
                                name: '',
                                type: 'marketing',
                                status: 'stop'
                            };
                            updateConfig('dnd', prev => ({
                                ...prev,
                                categories: [...prev.categories, newCategory]
                            }));
                        }}
                        className={`${tw.button} flex items-center gap-2 text-xs px-3 py-1.5`}
                    >
                        <Plus className="w-3 h-3" />
                        Add Category
                    </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {dndConfig.categories.map((category, index) => (
                        <div key={category.id} className={`p-3 ${tw.borderDefault} border rounded-lg bg-gray-50`}>
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
                                <div>
                                    <label className={`block ${tw.label} ${tw.textSecondary} mb-1`}>
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        value={category.name}
                                        onChange={(e) => {
                                            const newCategories = [...dndConfig.categories];
                                            newCategories[index] = { ...category, name: e.target.value };
                                            updateConfig('dnd', prev => ({ ...prev, categories: newCategories }));
                                        }}
                                        className={`${components.input.default} w-full px-2 py-1 text-sm`}
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div>
                                    <label className={`block ${tw.label} ${tw.textSecondary} mb-1`}>
                                        Type
                                    </label>
                                    <select
                                        value={category.type}
                                        onChange={(e) => {
                                            const newCategories = [...dndConfig.categories];
                                            newCategories[index] = { ...category, type: e.target.value as any };
                                            updateConfig('dnd', prev => ({ ...prev, categories: newCategories }));
                                        }}
                                        className={`${components.input.default} w-full px-2 py-1 text-sm`}
                                    >
                                        {DND_CATEGORIES.map(cat => (
                                            <option key={cat.type} value={cat.type}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newCategories = dndConfig.categories.filter((_, i) => i !== index);
                                        updateConfig('dnd', prev => ({ ...prev, categories: newCategories }));
                                    }}
                                    className={`self-end p-2 ${tw.danger} ${tw.statusDanger10} rounded hover:bg-red-200 transition-colors`}
                                    title="Delete category"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {dndConfig.categories.length === 0 && (
                        <p className={`${tw.caption} ${tw.textMuted} text-center py-6`}>
                            No categories added yet. Click "Add Category" to get started.
                        </p>
                    )}
                </div>
            </div>
        );
    };

    const renderVIPListConfig = () => {
        const vipConfig = configs.vipList;
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
                            Action
                        </label>
                        <select
                            value={vipConfig.action}
                            onChange={(e) => updateConfig('vipList', prev => ({ 
                                ...prev, 
                                action: e.target.value as 'include' | 'exclude' 
                            }))}
                            className={`${components.input.default} w-full px-3 py-2`}
                        >
                            <option value="include">Include VIP List</option>
                            <option value="exclude">Exclude VIP List</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
                            Priority
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={vipConfig.priority || 1}
                            onChange={(e) => updateConfig('vipList', prev => ({ 
                                ...prev, 
                                priority: parseInt(e.target.value) || 1 
                            }))}
                            className={`${components.input.default} w-full px-3 py-2`}
                        />
                    </div>
                </div>
                <div className={`p-3 rounded-lg ${tw.statusInfo10}`}>
                    <p className={`${tw.caption} ${tw.textSecondary}`}>
                        VIP lists will be managed separately. This configuration defines how VIP customers are handled.
                    </p>
                </div>
            </div>
        );
    };

    const renderPolicySection = (type: CommunicationPolicyType) => {
        const policyType = COMMUNICATION_POLICY_TYPES.find(t => t.value === type);
        if (!policyType) return null;

        const isExpanded = expandedSection === type;
        
        return (
            <div key={type} className={`${tw.borderDefault} border rounded-xl overflow-hidden ${
                isExpanded ? `border-2 shadow-md` : ''
            }`} style={{
                borderColor: isExpanded ? color.primary.accent : undefined,
                backgroundColor: isExpanded ? `${color.primary.accent}05` : 'white'
            }}>
                <button
                    type="button"
                    onClick={() => toggleSection(type)}
                    className={`w-full px-6 py-4 flex items-center justify-between transition-all duration-200 ${
                        isExpanded 
                            ? 'bg-gradient-to-r from-white to-blue-50' 
                            : `${tw.hover} bg-white`
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-all duration-200 ${
                            isExpanded 
                                ? 'shadow-sm' 
                                : tw.accent10
                        }`} style={{
                            backgroundColor: isExpanded ? color.primary.accent : undefined,
                            color: isExpanded ? 'white' : undefined
                        }}>
                            {getTypeIcon(type)}
                        </div>
                        <div className="text-left">
                            <h3 className={`${tw.cardTitle} transition-colors duration-200 ${
                                isExpanded ? 'font-semibold' : tw.textPrimary
                            }`} style={{
                                color: isExpanded ? color.primary.action : undefined
                            }}>
                                {policyType.label}
                            </h3>
                            <p className={`${tw.caption} ${tw.textMuted} mt-0.5`}>
                                {policyType.description}
                            </p>
                        </div>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 transition-colors duration-200" style={{
                            color: color.primary.accent
                        }} />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 transition-colors duration-200" />
                    )}
                </button>
                
                {isExpanded && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        {type === 'timeWindow' && renderTimeWindowConfig()}
                        {type === 'maximumCommunication' && renderMaxCommunicationConfig()}
                        {type === 'dnd' && renderDNDConfig()}
                        {type === 'vipList' && renderVIPListConfig()}
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className={`${components.card.surface} w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 ${tw.borderDefault} border-b`}>
                    <div>
                        <h2 className={`${tw.subtitle} ${tw.textPrimary}`}>
                            {policy ? 'Edit Communication Policy' : 'Create Communication Policy'}
                        </h2>
                        <p className={`${tw.caption} ${tw.textMuted} mt-1`}>
                            Configure all policy types in one place
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 ${tw.hover} rounded-lg transition-colors`}
                    >
                        <X className={`w-5 h-5 ${tw.textMuted}`} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <div>
                                <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
                                    Policy Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`${components.input.default} w-full px-4 py-2.5`}
                                    placeholder="Enter policy name"
                                    required
                                />
                            </div>

                            <div>
                                <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`${components.input.default} w-full px-4 py-2.5`}
                                    placeholder="Enter policy description"
                                    rows={2}
                                />
                            </div>

                            {/* Communication Channels (Multi-select Dropdown) */}
                            <div>
                                <label className={`block ${tw.label} ${tw.textSecondary} mb-2`}>
                                    Communication Channels *
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
                                        className={`${components.input.default} w-full px-3 py-2 text-left flex items-center justify-between`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {channels.length === 0 ? (
                                                <span className={tw.textMuted}>Select channels...</span>
                                            ) : (
                                                <div className="flex items-center">
                                                    <span className={`${tw.caption} ${tw.textPrimary}`}>
                                                        {channels.length === 1 
                                                            ? COMMUNICATION_CHANNELS.find(ch => ch.value === channels[0])?.label
                                                            : channels.map(c => COMMUNICATION_CHANNELS.find(ch => ch.value === c)?.label).join(', ')
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 ${tw.textMuted} transition-transform ${isChannelDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isChannelDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                                            {COMMUNICATION_CHANNELS.map((ch) => (
                                                <label
                                                    key={ch.value}
                                                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={channels.includes(ch.value)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setChannels(prev => [...prev, ch.value]);
                                                            } else {
                                                                setChannels(prev => prev.filter(c => c !== ch.value));
                                                            }
                                                        }}
                                                        className="rounded"
                                                        style={{ accentColor: color.primary.accent }}
                                                    />
                                                    <div>
                                                        <div className={`${tw.caption} font-medium ${tw.textPrimary}`}>
                                                            {ch.label}
                                                        </div>
                                                        <div className={`text-xs ${tw.textMuted}`}>
                                                            {ch.description}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className={`${tw.caption} ${tw.textMuted} mt-2`}>
                                    Select one or more communication channels for this policy
                                </p>
                            </div>
                        </div>

                        {/* All Policy Type Configurations */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className={`${tw.cardTitle} ${tw.textPrimary}`}>
                                    Policy Configurations
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedSection('timeWindow')}
                                        className={`${tw.caption} ${tw.textSecondary} hover:underline`}
                                    >
                                        Open First
                                    </button>
                                    <span className={`${tw.textMuted}`}>|</span>
                                    <button
                                        type="button"
                                        onClick={() => setExpandedSection(null)}
                                        className={`${tw.caption} ${tw.textSecondary} hover:underline`}
                                    >
                                        Collapse All
                                    </button>
                                </div>
                            </div>
                            {renderPolicySection('timeWindow')}
                            {renderPolicySection('maximumCommunication')}
                            {renderPolicySection('dnd')}
                            {renderPolicySection('vipList')}
                        </div>

                        {/* Active Status */}
                        <div className="pt-4 border-t border-gray-200">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="rounded w-5 h-5"
                                    style={{ accentColor: color.primary.action }}
                                />
                                <div>
                                    <span className={`${tw.body} font-medium ${tw.textPrimary}`}>Active Policy</span>
                                    <p className={`${tw.caption} ${tw.textMuted}`}>
                                        Enable this policy to apply it to campaigns immediately
                                    </p>
                                </div>
                            </label>
                        </div>

                        {error && (
                            <div className={`p-4 ${tw.statusDanger10} ${tw.borderDefault} border rounded-lg`}>
                                <p className={`${tw.caption} ${tw.danger}`}>{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className={`flex items-center justify-end space-x-3 px-6 py-4 ${tw.borderDefault} border-t bg-gray-50`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 ${tw.textSecondary} ${tw.hover} rounded-lg transition-colors ${tw.body}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`${tw.button} px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSaving ? 'Saving...' : (policy ? 'Update Policy' : 'Create Policy')}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
