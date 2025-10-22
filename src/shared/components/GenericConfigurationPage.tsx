import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, X, ArrowLeft, LucideIcon } from 'lucide-react';
import { color, tw } from '../utils/utils';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useToast } from '../../contexts/ToastContext';
import { configurationDataService, ConfigurationType } from '../services/configurationDataService';
import LoadingSpinner from './ui/LoadingSpinner';

export interface ConfigurationItem {
    id: number;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ConfigurationPageConfig {
    // Page configuration
    title: string;
    subtitle: string;
    entityName: string; // "objective", "department", etc.
    entityNamePlural: string; // "objectives", "departments", etc.
    configType?: 'lineOfBusiness' | 'departments' | 'campaignObjectives';
    
    // Navigation
    backPath: string;
    
    // UI
    icon: LucideIcon;
    searchPlaceholder: string;
    
    // Data
    initialData: ConfigurationItem[];
    
    // Labels
    createButtonText: string;
    modalTitle: {
        create: string;
        edit: string;
    };
    nameLabel: string;
    nameRequired: boolean;
    descriptionLabel: string;
    descriptionRequired: boolean;
    
    // Validation
    nameMaxLength: number;
    descriptionMaxLength: number;
    
    // Messages
    deleteConfirmTitle: string;
    deleteConfirmMessage: (name: string) => string;
    deleteSuccessMessage: (name: string) => string;
    createSuccessMessage: string;
    updateSuccessMessage: string;
    deleteErrorMessage: string;
    saveErrorMessage: string;
}

interface ConfigurationModalProps {
    isOpen: boolean;
    onClose: () => void;
    item?: ConfigurationItem;
    onSave: (item: { name: string; description?: string }) => Promise<void>;
    isSaving?: boolean;
    config: ConfigurationPageConfig;
}

function ConfigurationModal({ isOpen, onClose, item, onSave, isSaving = false, config }: ConfigurationModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                description: item.description || ''
            });
        } else {
            setFormData({ name: '', description: '' });
        }
        setError('');
    }, [item, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (config.nameRequired && !formData.name.trim()) {
            setError(`${config.nameLabel} is required`);
            return;
        }

        if (formData.name.length > config.nameMaxLength) {
            setError(`${config.nameLabel} must be ${config.nameMaxLength} characters or less`);
            return;
        }

        if (config.descriptionRequired && !formData.description.trim()) {
            setError(`${config.descriptionLabel} is required`);
            return;
        }

        if (formData.description && formData.description.length > config.descriptionMaxLength) {
            setError(`${config.descriptionLabel} must be ${config.descriptionMaxLength} characters or less`);
            return;
        }

        setError('');

        const itemData = {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined
        };

        await onSave(itemData);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {item ? config.modalTitle.edit : config.modalTitle.create}
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
                                {config.nameLabel} {config.nameRequired && '*'}
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder={`Enter ${config.nameLabel.toLowerCase()}`}
                                maxLength={config.nameMaxLength}
                                required={config.nameRequired}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {config.descriptionLabel} {config.descriptionRequired && '*'}
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder={`Enter ${config.descriptionLabel.toLowerCase()}`}
                                rows={3}
                                maxLength={config.descriptionMaxLength}
                                required={config.descriptionRequired}
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
                            {isSaving ? 'Saving...' : (item ? `Update ${config.entityName}` : `Create ${config.entityName}`)}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

interface GenericConfigurationPageProps {
    config: ConfigurationPageConfig;
}

export default function GenericConfigurationPage({ config }: GenericConfigurationPageProps) {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { success: showToast, error: showError } = useToast();

    const [items, setItems] = useState<ConfigurationItem[]>(config.initialData);
    const [loading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ConfigurationItem | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    // Utiliser le service de données si configType est défini
    useEffect(() => {
        if (config.configType) {
            // Initialiser les données du service avec les données de config
            configurationDataService.setData(config.configType, config.initialData);
            
            // S'abonner aux changements
            const unsubscribe = configurationDataService.subscribe(config.configType, setItems);
            return unsubscribe;
        }
    }, [config.configType, config.initialData]);

    const handleCreateItem = () => {
        setEditingItem(undefined);
        setIsModalOpen(true);
    };

    const handleEditItem = (item: ConfigurationItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteItem = async (item: ConfigurationItem) => {
        const confirmed = await confirm({
            title: config.deleteConfirmTitle,
            message: config.deleteConfirmMessage(item.name),
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            if (config.configType) {
                // Utiliser le service de données
                configurationDataService.deleteItem(config.configType, item.id);
            } else {
                // Fallback pour les configurations sans configType
                setItems(prev => prev.filter(i => i.id !== item.id));
            }
            showToast(config.deleteConfirmTitle, config.deleteSuccessMessage(item.name));
        } catch (err) {
            console.error(`Error deleting ${config.entityName}:`, err);
            showError('Error', err instanceof Error ? err.message : config.deleteErrorMessage);
        }
    };

    const handleItemSaved = async (itemData: { name: string; description?: string }) => {
        try {
            setIsSaving(true);
            if (editingItem) {
                // Update existing item
                if (config.configType) {
                    configurationDataService.updateItem(config.configType, editingItem.id, itemData);
                } else {
                    setItems(prev => prev.map(item =>
                        item.id === editingItem.id
                            ? { ...item, ...itemData, updated_at: new Date().toISOString() }
                            : item
                    ));
                }
                showToast(config.updateSuccessMessage);
            } else {
                // Create new item
                if (config.configType) {
                    configurationDataService.addItem(config.configType, itemData);
                } else {
                    const newItem: ConfigurationItem = {
                        id: Math.max(...items.map(i => i.id)) + 1,
                        ...itemData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    setItems(prev => [...prev, newItem]);
                }
                showToast(config.createSuccessMessage);
            }
            setIsModalOpen(false);
            setEditingItem(undefined);
        } catch (err) {
            console.error(`Failed to save ${config.entityName}:`, err);
            showError(`Failed to save ${config.entityName}`, config.saveErrorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredItems = (items || []).filter(item =>
        item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item?.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const IconComponent = config.icon;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(config.backPath)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>{config.title}</h1>
                        <p className={`${tw.textSecondary} mt-2 text-sm`}>{config.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateItem}
                        className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
                        style={{ backgroundColor: color.primary.action }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = color.interactive.hover;
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = color.primary.action;
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        {config.createButtonText}
                    </button>
                </div>
            </div>

            <div className={`bg-white my-5`}>
                <div className="relative w-full">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${color.text.muted}]`} />
                    <input
                        type="text"
                        placeholder={config.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 text-sm border border-[${color.border.default}] rounded-lg focus:outline-none`}
                    />
                </div>
            </div>

            <div className={`bg-white rounded-xl border border-[${color.border.default}] overflow-hidden`}>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner variant="modern" size="lg" color="primary" className="mr-3" />
                        <span className={`${tw.textSecondary}`}>Loading {config.entityNamePlural}...</span>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <IconComponent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
                            {searchTerm ? `No ${config.entityNamePlural} Found` : `No ${config.entityNamePlural}`}
                        </h3>
                        <p className={`${tw.textMuted} mb-6`}>
                            {searchTerm ? 'Try adjusting your search terms.' : `Create your first ${config.entityName} to get started.`}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={handleCreateItem}
                                className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto text-sm text-white"
                                style={{ backgroundColor: color.primary.action }}
                            >
                                <Plus className="w-4 h-4" />
                                {config.createButtonText}
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
                                            {config.entityName}
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
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div>
                                                        <div className={`text-base font-semibold ${tw.textPrimary}`}>
                                                            {item.name}
                                                        </div>
                                                        <div className={`text-sm ${tw.textMuted}`}>ID: {item.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-sm ${tw.textSecondary} max-w-md`}>
                                                    {item.description || 'No description'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEditItem(item)}
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
                                                        onClick={() => handleDeleteItem(item)}
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
                            {filteredItems.map((item) => (
                                <div key={item.id} className="p-4 border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-base font-semibold ${tw.textPrimary} mb-1`}>
                                                {item.name}
                                            </div>
                                            <div className={`text-sm ${tw.textSecondary} mb-2`}>
                                                {item.description || 'No description'}
                                            </div>
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditItem(item)}
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
                                                    onClick={() => handleDeleteItem(item)}
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

            <ConfigurationModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(undefined);
                }}
                item={editingItem}
                onSave={handleItemSaved}
                isSaving={isSaving}
                config={config}
            />
        </div>
    );
}
