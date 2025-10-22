import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, X, Bell, ArrowLeft } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { useToast } from '../../../contexts/ToastContext';
import { CommunicationPolicy } from '../types/communicationPolicy';

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policy?: CommunicationPolicy;
    onSave: (policy: { name: string; description?: string }) => Promise<void>;
    isSaving?: boolean;
}

function PolicyModal({ isOpen, onClose, policy, onSave, isSaving = false }: PolicyModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (policy) {
            setFormData({
                name: policy.name,
                description: policy.description || ''
            });
        } else {
            setFormData({ name: '', description: '' });
        }
        setError('');
    }, [policy, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Policy name is required');
            return;
        }

        if (formData.name.length > 128) {
            setError('Policy name must be 128 characters or less');
            return;
        }

        setError('');

        const policyData = {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined
        };

        await onSave(policyData);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {policy ? 'Edit Communication Policy' : 'Create Communication Policy'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Policy Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter policy name"
                                maxLength={128}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter policy description"
                                rows={3}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: color.primary.action }}
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

export default function CommunicationPolicyPage() {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { success: showToast, error: showError } = useToast();

    // Hardcoded communication policies (matching existing dummy data patterns)
    const hardcodedPolicies: CommunicationPolicy[] = [
        {
            id: 1,
            name: 'Standard Customer Policy',
            description: 'Default communication limits for regular customers',
            frequency_capping: {
                max_per_day: 1,
                max_per_week: 3,
                max_per_month: 10
            },
            throttling: {
                max_per_hour: 1000,
                max_per_day: 10000
            },
            channels: ['NORMAL_SMS', 'EMAIL', 'PUSH'],
            blackout_windows: [
                { start_time: '22:00', end_time: '08:00' }
            ],
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-20T14:45:00Z'
        },
        {
            id: 2,
            name: 'VIP Customer Policy',
            description: 'Higher frequency limits for VIP customers',
            frequency_capping: {
                max_per_day: 3,
                max_per_week: 7,
                max_per_month: 20
            },
            throttling: {
                max_per_hour: 2000,
                max_per_day: 20000
            },
            channels: ['NORMAL_SMS', 'FLASH_SMS', 'EMAIL', 'PUSH', 'WHATSAPP'],
            blackout_windows: [
                { start_time: '23:00', end_time: '07:00' }
            ],
            created_at: '2024-01-10T09:15:00Z',
            updated_at: '2024-01-18T16:20:00Z'
        },
        {
            id: 3,
            name: 'Promotional Campaign Policy',
            description: 'Moderate limits for promotional campaigns',
            frequency_capping: {
                max_per_day: 2,
                max_per_week: 5,
                max_per_month: 15
            },
            throttling: {
                max_per_hour: 1500,
                max_per_day: 15000
            },
            channels: ['NORMAL_SMS', 'EMAIL', 'PUSH', 'INAPP'],
            created_at: '2024-01-12T11:00:00Z',
            updated_at: '2024-01-19T13:30:00Z'
        },
        {
            id: 4,
            name: 'Urgent Alerts Policy',
            description: 'Relaxed limits for critical/urgent communications',
            frequency_capping: {
                max_per_day: 5,
                max_per_week: 15,
                max_per_month: 40
            },
            throttling: {
                max_per_hour: 5000,
                max_per_day: 50000
            },
            channels: ['FLASH_SMS', 'NORMAL_SMS', 'PUSH', 'EMAIL'],
            created_at: '2024-01-08T08:45:00Z',
            updated_at: '2024-01-15T12:00:00Z'
        }
    ];

    const [policies, setPolicies] = useState<CommunicationPolicy[]>(hardcodedPolicies);
    const [loading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<CommunicationPolicy | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    const handleCreatePolicy = () => {
        setEditingPolicy(undefined);
        setIsModalOpen(true);
    };

    const handleEditPolicy = (policy: CommunicationPolicy) => {
        setEditingPolicy(policy);
        setIsModalOpen(true);
    };

    const handleDeletePolicy = async (policy: CommunicationPolicy) => {
        const confirmed = await confirm({
            title: 'Delete Policy',
            message: `Are you sure you want to delete "${policy.name}"? This action cannot be undone.`,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            setPolicies(prev => prev.filter(p => p.id !== policy.id));
            showToast('Policy Deleted', `"${policy.name}" has been deleted successfully.`);
        } catch (err) {
            console.error('Error deleting policy:', err);
            showError('Error', err instanceof Error ? err.message : 'Failed to delete policy');
        }
    };

    const handlePolicySaved = async (policyData: { name: string; description?: string }) => {
        try {
            setIsSaving(true);
            if (editingPolicy) {
                // Update existing policy
                setPolicies(prev => prev.map(p =>
                    p.id === editingPolicy.id
                        ? { ...p, ...policyData, updated_at: new Date().toISOString() }
                        : p
                ));
                showToast('Policy updated successfully');
            } else {
                // Create new policy
                const newPolicy: CommunicationPolicy = {
                    id: Math.max(...policies.map(p => Number(p.id))) + 1,
                    ...policyData,
                    frequency_capping: {
                        max_per_day: 1,
                        max_per_week: 3,
                        max_per_month: 10
                    },
                    throttling: {
                        max_per_hour: 1000,
                        max_per_day: 10000
                    },
                    channels: ['NORMAL_SMS', 'EMAIL'],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                setPolicies(prev => [...prev, newPolicy]);
                showToast('Policy created successfully');
            }
            setIsModalOpen(false);
            setEditingPolicy(undefined);
        } catch (err) {
            console.error('Failed to save policy:', err);
            showError('Failed to save policy', 'Please try again later.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredPolicies = (policies || []).filter(policy =>
        policy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (policy?.description && policy.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard/campaigns')}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Communication Policies</h1>
                        <p className={`${tw.textSecondary} mt-2 text-sm`}>Manage customer communication frequency and fatigue rules</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreatePolicy}
                        className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
                        style={{ backgroundColor: color.primary.action }}
                    >
                        <Plus className="w-4 h-4" />
                        Create Policy
                    </button>
                </div>
            </div>

            <div className={`bg-white my-5`}>
                <div className="relative w-full">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${color.text.muted}]`} />
                    <input
                        type="text"
                        placeholder="Search policies by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 text-sm border border-[${color.border.default}] rounded-lg focus:outline-none`}
                    />
                </div>
            </div>

            <div className={`bg-white rounded-xl border border-[${color.border.default}] overflow-hidden`}>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <span className={`${tw.textSecondary}`}>Loading policies...</span>
                    </div>
                ) : filteredPolicies.length === 0 ? (
                    <div className="text-center py-12">
                        <p className={`${tw.textMuted} mb-6`}>
                            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first communication policy to get started.'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={handleCreatePolicy}
                                className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto text-sm text-white"
                                style={{ backgroundColor: color.primary.action }}
                            >
                                <Plus className="w-4 h-4" />
                                Create Policy
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className={`bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-[${color.border.default}]`}>
                                    <tr>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                                            Policy
                                        </th>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                                            Description
                                        </th>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                                            Frequency Cap
                                        </th>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                                            Channels
                                        </th>
                                        <th className={`px-6 py-4 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredPolicies.map((policy) => (
                                        <tr key={policy.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div>
                                                        <div className={`text-base font-semibold ${tw.textPrimary}`}>
                                                            {policy.name}
                                                        </div>
                                                        <div className={`text-sm ${tw.textMuted}`}>ID: {policy.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-sm ${tw.textSecondary} max-w-md`}>
                                                    {policy.description || 'No description'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm space-y-1">
                                                    <div className={tw.textSecondary}>
                                                        <span className="font-medium">Day:</span> {policy.frequency_capping.max_per_day}
                                                    </div>
                                                    <div className={tw.textSecondary}>
                                                        <span className="font-medium">Week:</span> {policy.frequency_capping.max_per_week}
                                                    </div>
                                                    <div className={tw.textSecondary}>
                                                        <span className="font-medium">Month:</span> {policy.frequency_capping.max_per_month}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {policy.channels.slice(0, 3).map((channel, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[${color.primary.action}]/10 text-[${color.primary.action}]`}
                                                        >
                                                            {channel.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                    {policy.channels.length > 3 && (
                                                        <span className={`text-xs ${tw.textMuted}`}>
                                                            +{policy.channels.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEditPolicy(policy)}
                                                        className="p-2 rounded-lg transition-colors"
                                                        style={{
                                                            color: color.primary.action,
                                                            backgroundColor: 'transparent'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            (e.target as HTMLButtonElement).style.backgroundColor = `${color.primary.action}10`;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePolicy(policy)}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="lg:hidden">
                            {filteredPolicies.map((policy) => (
                                <div key={policy.id} className="p-4 border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-base font-semibold ${tw.textPrimary} mb-1`}>
                                                {policy.name}
                                            </div>
                                            <div className={`text-sm ${tw.textSecondary} mb-2`}>
                                                {policy.description || 'No description'}
                                            </div>
                                            <div className="text-xs space-y-1 mb-2">
                                                <div className={tw.textSecondary}>
                                                    Limits: {policy.frequency_capping.max_per_day}/day, {policy.frequency_capping.max_per_week}/week, {policy.frequency_capping.max_per_month}/month
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {policy.channels.slice(0, 3).map((channel, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[${color.primary.action}]/10 text-[${color.primary.action}]`}
                                                        >
                                                            {channel.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                    {policy.channels.length > 3 && (
                                                        <span className={`text-xs ${tw.textMuted}`}>
                                                            +{policy.channels.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditPolicy(policy)}
                                                    className="p-2 rounded-lg transition-colors"
                                                    style={{
                                                        color: color.primary.action,
                                                        backgroundColor: 'transparent'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        (e.target as HTMLButtonElement).style.backgroundColor = `${color.primary.action}10`;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePolicy(policy)}
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <PolicyModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPolicy(undefined);
                }}
                policy={editingPolicy}
                onSave={handlePolicySaved}
                isSaving={isSaving}
            />
        </div>
    );
}

