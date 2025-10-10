import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, X, Target, ArrowLeft } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { useToast } from '../../../contexts/ToastContext';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

interface CampaignObjective {
    id: number;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

interface ObjectiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    objective?: CampaignObjective;
    onSave: (objective: { name: string; description?: string }) => Promise<void>;
    isSaving?: boolean;
}

function ObjectiveModal({ isOpen, onClose, objective, onSave, isSaving = false }: ObjectiveModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (objective) {
            setFormData({
                name: objective.name,
                description: objective.description || ''
            });
        } else {
            setFormData({ name: '', description: '' });
        }
        setError('');
    }, [objective, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Objective name is required');
            return;
        }

        if (formData.name.length > 100) {
            setError('Objective name must be 100 characters or less');
            return;
        }

        if (formData.description && formData.description.length > 500) {
            setError('Description must be 500 characters or less');
            return;
        }

        setError('');

        const objectiveData = {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined
        };

        await onSave(objectiveData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {objective ? 'Edit Campaign Objective' : 'Create New Campaign Objective'}
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
                                Objective Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter objective name"
                                maxLength={100}
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
                                placeholder="Enter objective description"
                                rows={3}
                                maxLength={500}
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
                            style={{ backgroundColor: color.sentra.main }}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                    (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                                }
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                            }}
                        >
                            {isSaving ? 'Saving...' : (objective ? 'Update Objective' : 'Create Objective')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CampaignObjectivesPage() {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { success: showToast, error: showError } = useToast();

    // Hardcoded objectives (same as in campaign creation)
    const hardcodedObjectives: CampaignObjective[] = [
        {
            id: 1,
            name: 'New Customer Acquisition',
            description: 'Attract and convert new customers to your service',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-20T14:45:00Z'
        },
        {
            id: 2,
            name: 'Customer Retention',
            description: 'Keep existing customers engaged and loyal',
            created_at: '2024-01-10T09:15:00Z',
            updated_at: '2024-01-18T16:20:00Z'
        },
        {
            id: 3,
            name: 'Churn Prevention',
            description: 'Prevent at-risk customers from leaving',
            created_at: '2024-01-12T11:00:00Z',
            updated_at: '2024-01-19T13:30:00Z'
        },
        {
            id: 4,
            name: 'Upsell/Cross-sell',
            description: 'Increase revenue from existing customers',
            created_at: '2024-01-14T15:30:00Z',
            updated_at: '2024-01-21T10:15:00Z'
        },
        {
            id: 5,
            name: 'Dormant Customer Reactivation',
            description: 'Re-engage inactive or dormant customers',
            created_at: '2024-01-08T08:45:00Z',
            updated_at: '2024-01-15T12:00:00Z'
        }
    ];

    const [campaignObjectives, setCampaignObjectives] = useState<CampaignObjective[]>(hardcodedObjectives);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingObjective, setEditingObjective] = useState<CampaignObjective | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    const handleCreateObjective = () => {
        setEditingObjective(undefined);
        setIsModalOpen(true);
    };

    const handleEditObjective = (objective: CampaignObjective) => {
        setEditingObjective(objective);
        setIsModalOpen(true);
    };

    const handleDeleteObjective = async (objective: CampaignObjective) => {
        const confirmed = await confirm({
            title: 'Delete Objective',
            message: `Are you sure you want to delete "${objective.name}"? This action cannot be undone.`,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            // Simulate API call
            setCampaignObjectives(prev => prev.filter(o => o.id !== objective.id));
            showToast('Objective Deleted', `"${objective.name}" has been deleted successfully.`);
        } catch (err) {
            console.error('Error deleting objective:', err);
            showError('Error', err instanceof Error ? err.message : 'Failed to delete objective');
        }
    };

    const handleObjectiveSaved = async (objectiveData: { name: string; description?: string }) => {
        try {
            setIsSaving(true);
            if (editingObjective) {
                // Update existing objective
                setCampaignObjectives(prev => prev.map(obj =>
                    obj.id === editingObjective.id
                        ? { ...obj, ...objectiveData, updated_at: new Date().toISOString() }
                        : obj
                ));
                showToast('Objective updated successfully');
            } else {
                // Create new objective
                const newObjective: CampaignObjective = {
                    id: Math.max(...campaignObjectives.map(o => o.id)) + 1,
                    ...objectiveData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                setCampaignObjectives(prev => [...prev, newObjective]);
                showToast('Objective created successfully');
            }
            setIsModalOpen(false);
            setEditingObjective(undefined);
        } catch (err) {
            console.error('Failed to save objective:', err);
            showError('Failed to save objective', 'Please try again later.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredObjectives = (campaignObjectives || []).filter(objective =>
        objective?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (objective?.description && objective.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Campaign Objectives</h1>
                        <p className={`${tw.textSecondary} mt-2 text-sm`}>Define and manage your campaign objectives</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateObjective}
                        className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
                        style={{ backgroundColor: color.sentra.main }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Create Objective
                    </button>
                </div>
            </div>

            <div className={`bg-white my-5`}>
                <div className="relative w-full">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${color.ui.text.muted}]`} />
                    <input
                        type="text"
                        placeholder="Search objectives by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 text-sm border border-[${color.ui.border}] rounded-lg focus:outline-none`}
                    />
                </div>
            </div>

            <div className={`bg-white rounded-xl border border-[${color.ui.border}] overflow-hidden`}>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner variant="modern" size="lg" color="primary" className="mr-3" />
                        <span className={`${tw.textSecondary}`}>Loading objectives...</span>
                    </div>
                ) : filteredObjectives.length === 0 ? (
                    <div className="text-center py-12">
                        <Target className={`w-16 h-16 text-[${color.entities.campaigns}] mx-auto mb-4`} />
                        <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
                            {searchTerm ? 'No Objectives Found' : 'No Objectives'}
                        </h3>
                        <p className={`${tw.textMuted} mb-6`}>
                            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first objective to get started.'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={handleCreateObjective}
                                className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto text-sm text-white"
                                style={{ backgroundColor: color.sentra.main }}
                            >
                                <Plus className="w-4 h-4" />
                                Create Objective
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className={`bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-[${color.ui.border}]`}>
                                    <tr>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                                            Objective
                                        </th>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                                            Description
                                        </th>
                                        <th className={`px-6 py-4 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredObjectives.map((objective) => (
                                        <tr key={objective.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                                                        style={{ backgroundColor: color.entities.campaigns }}
                                                    >
                                                        <Target className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className={`text-base font-semibold ${tw.textPrimary}`}>
                                                            {objective.name}
                                                        </div>
                                                        <div className={`text-sm ${tw.textMuted}`}>ID: {objective.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-sm ${tw.textSecondary} max-w-md`}>
                                                    {objective.description || 'No description'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEditObjective(objective)}
                                                        className="p-2 rounded-lg transition-colors"
                                                        style={{
                                                            color: color.sentra.main,
                                                            backgroundColor: 'transparent'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            (e.target as HTMLButtonElement).style.backgroundColor = `${color.sentra.main}10`;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteObjective(objective)}
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
                            {filteredObjectives.map((objective) => (
                                <div key={objective.id} className="p-4 border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-start space-x-3">
                                        <div
                                            className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: color.entities.campaigns }}
                                        >
                                            <Target className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-base font-semibold ${tw.textPrimary} mb-1`}>
                                                {objective.name}
                                            </div>
                                            <div className={`text-sm ${tw.textSecondary} mb-2`}>
                                                {objective.description || 'No description'}
                                            </div>
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditObjective(objective)}
                                                    className="p-2 rounded-lg transition-colors"
                                                    style={{
                                                        color: color.sentra.main,
                                                        backgroundColor: 'transparent'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        (e.target as HTMLButtonElement).style.backgroundColor = `${color.sentra.main}10`;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteObjective(objective)}
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

            <ObjectiveModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingObjective(undefined);
                }}
                objective={editingObjective}
                onSave={handleObjectiveSaved}
                isSaving={isSaving}
            />
        </div>
    );
}

