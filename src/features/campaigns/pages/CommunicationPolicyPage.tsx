import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ArrowLeft, Clock, BarChart3, BellOff, Star } from 'lucide-react';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { useToast } from '../../../contexts/ToastContext';
import { color, tw, components, helpers } from '../../../shared/utils/utils';
import { 
    CommunicationPolicyConfiguration, 
    CreateCommunicationPolicyRequest, 
    COMMUNICATION_POLICY_TYPES,
    TimeWindowConfig,
    MaximumCommunicationConfig,
    DNDConfig,
    VIPListConfig
} from '../types/communicationPolicyConfig';
import CommunicationPolicyModal from '../components/CommunicationPolicyModal';
import { communicationPolicyService } from '../services/communicationPolicyService';

export default function CommunicationPolicyPage() {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { success: showToast, error: showError } = useToast();

    const [policies, setPolicies] = useState<CommunicationPolicyConfiguration[]>([]);
    const [loading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<CommunicationPolicyConfiguration | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    // Load policies from service and subscribe to changes
    useEffect(() => {
        // Load initial policies
        setPolicies(communicationPolicyService.getAllPolicies());

        // Subscribe to policy changes
        const unsubscribe = communicationPolicyService.subscribe((updatedPolicies) => {
            setPolicies(updatedPolicies);
        });

        return unsubscribe;
    }, []);

    const handleCreatePolicy = () => {
        setEditingPolicy(undefined);
        setIsModalOpen(true);
    };

    const handleEditPolicy = (policy: CommunicationPolicyConfiguration) => {
        setEditingPolicy(policy);
        setIsModalOpen(true);
    };

    const handleDeletePolicy = async (policy: CommunicationPolicyConfiguration) => {
        const confirmed = await confirm({
            title: 'Delete Policy',
            message: `Are you sure you want to delete "${policy.name}"? This action cannot be undone.`,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            const success = communicationPolicyService.deletePolicy(policy.id);
            if (success) {
                showToast('Policy deleted successfully');
            } else {
                showError('Policy not found');
            }
        } catch (err) {
            console.error('Failed to delete policy:', err);
            showError('Failed to delete policy');
        }
    };

    const handlePolicySaved = async (policyData: CreateCommunicationPolicyRequest) => {
        try {
            setIsSaving(true);
            if (editingPolicy) {
                // Update existing policy
                const updatedPolicy = communicationPolicyService.updatePolicy(editingPolicy.id, policyData);
                if (updatedPolicy) {
                    showToast('Policy updated successfully');
                } else {
                    showError('Policy not found');
                    return;
                }
            } else {
                // Create new policy
                communicationPolicyService.createPolicy(policyData);
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

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'timeWindow': return <Clock className="w-4 h-4 text-blue-600" />;
            case 'maximumCommunication': return <BarChart3 className="w-4 h-4 text-green-600" />;
            case 'dnd': return <BellOff className="w-4 h-4 text-red-600" />;
            case 'vipList': return <Star className="w-4 h-4 text-yellow-600" />;
            default: return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getTypeLabel = (type: string) => {
        const policyType = COMMUNICATION_POLICY_TYPES.find(t => t.value === type);
        return policyType?.label || type;
    };

    const getConfigSummary = (policy: CommunicationPolicyConfiguration) => {
        switch (policy.type) {
            case 'timeWindow':
                const timeConfig = policy.config as TimeWindowConfig;
                return `${timeConfig.startTime} - ${timeConfig.endTime}`;
            case 'maximumCommunication':
                const maxConfig = policy.config as MaximumCommunicationConfig;
                return `Max ${maxConfig.maxCount} per ${maxConfig.type}`;
            case 'dnd':
                const dndConfig = policy.config as DNDConfig;
                return `${dndConfig.categories.length} categories`;
            case 'vipList':
                const vipConfig = policy.config as VIPListConfig;
                return `${vipConfig.action} VIP (Priority: ${vipConfig.priority})`;
            default:
                return 'No configuration';
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
                        className={`p-2 ${tw.textSecondary} ${tw.hover} rounded-lg transition-colors`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`${tw.heading} ${tw.textPrimary}`}>Communication Policies</h1>
                        <p className={`${tw.caption} ${tw.textSecondary} mt-2`}>Manage customer communication rules and preferences</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreatePolicy}
                        className={`${tw.button} flex items-center gap-2`}
                    >
                        <Plus className="w-4 h-4" />
                        Create Policy
                    </button>
                </div>
            </div>

            <div className={tw.surfaceBackground}>
                <div className="relative w-full">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tw.textMuted}`} />
                    <input
                        type="text"
                        placeholder="Search policies by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${components.input.default} w-full pl-10 pr-4 py-3 ${tw.caption}`}
                    />
                </div>
            </div>

            <div className={`${components.card.surface} overflow-hidden`}>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <span className={tw.textSecondary}>Loading policies...</span>
                    </div>
                ) : filteredPolicies.length === 0 ? (
                    <div className="text-center py-12">
                        <p className={`${tw.textMuted} mb-6`}>
                            {searchTerm ? 'No policies found matching your search.' : 'Create your first communication policy to get started.'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={handleCreatePolicy}
                                className={`${tw.button} flex items-center gap-2 mx-auto`}
                            >
                                <Plus className="w-4 h-4" />
                                Create Policy
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className={`${tw.tableHeader} ${tw.borderDefault} border-b`}>
                                    <tr>
                                        <th className={`px-6 py-4 text-left ${tw.label} ${tw.textMuted}`}>
                                            Policy
                                        </th>
                                        <th className={`px-6 py-4 text-left ${tw.label} ${tw.textMuted}`}>
                                            Type
                                        </th>
                                        <th className={`px-6 py-4 text-left ${tw.label} ${tw.textMuted}`}>
                                            Configuration
                                        </th>
                                        <th className={`px-6 py-4 text-left ${tw.label} ${tw.textMuted}`}>
                                            Status
                                        </th>
                                        <th className={`px-6 py-4 text-right ${tw.label} ${tw.textMuted}`}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${tw.borderMuted}`}>
                                    {filteredPolicies.map((policy) => (
                                        <tr key={policy.id} className={`${tw.hover} transition-colors`}>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className={`${tw.body} font-semibold ${tw.textPrimary}`}>
                                                        {policy.name}
                                                    </div>
                                                    <div className={`${tw.caption} ${tw.textMuted}`}>{policy.description || 'No description'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    {getTypeIcon(policy.type)}
                                                    <span className={`${tw.caption} font-medium ${tw.textPrimary}`}>
                                                        {getTypeLabel(policy.type)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`${tw.caption} ${tw.textSecondary}`}>
                                                    {getConfigSummary(policy)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={policy.isActive ? helpers.badge('success') : helpers.badge('info')}>
                                                    {policy.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEditPolicy(policy)}
                                                        className={`p-2 ${color.primary.action} hover:${color.primary.action}/90 ${tw.accent10} rounded-lg transition-colors`}
                                                        style={{ color: color.primary.action }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePolicy(policy)}
                                                        className={`p-2 ${tw.danger} ${tw.statusDanger10} rounded-lg transition-colors`}
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

                        {/* Mobile Card View */}
                        <div className="lg:hidden">
                            {filteredPolicies.map((policy) => (
                                <div key={policy.id} className="p-4 border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                {getTypeIcon(policy.type)}
                                                <div className="text-base font-semibold text-gray-900">
                                                    {policy.name}
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    policy.isActive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {policy.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2">
                                                {policy.description || 'No description'}
                                            </div>
                                            <div className="text-xs text-gray-500 mb-3">
                                                <span className="font-medium">{getTypeLabel(policy.type)}:</span> {getConfigSummary(policy)}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEditPolicy(policy)}
                                                className="p-2 text-[#588157] hover:text-[#3A5A40] hover:bg-[#588157]/10 rounded-lg transition-colors"
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
                            ))}
                        </div>
                    </>
                )}
            </div>

            <CommunicationPolicyModal
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
