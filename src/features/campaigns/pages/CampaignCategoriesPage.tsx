import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, X, Target, ArrowLeft, Eye } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { useToast } from '../../../contexts/ToastContext';
import { campaignService } from '../services/campaignService';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

interface CampaignCategory {
    id: number;
    name: string;
    description?: string;
    campaign_count?: number;
    created_at?: string;
    updated_at?: string;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: CampaignCategory;
    onSave: (category: { name: string; description?: string }) => Promise<void>;
    isSaving?: boolean;
}

function CategoryModal({ isOpen, onClose, category, onSave, isSaving = false }: CategoryModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || ''
            });
        } else {
            setFormData({ name: '', description: '' });
        }
        setError('');
    }, [category, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Catalog name is required');
            return;
        }

        if (formData.name.length > 64) {
            setError('Catalog name must be 64 characters or less');
            return;
        }

        if (formData.description && formData.description.length > 500) {
            setError('Description must be 500 characters or less');
            return;
        }

        setError('');

        const categoryData = {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined
        };

        await onSave(categoryData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {category ? 'Edit Campaign Catalog' : 'Create New Campaign Catalog'}
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
                                Campaign Catalog Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter campaign catalog name"
                                maxLength={64}
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
                                placeholder="Enter campaign catalog description"
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
                            {isSaving ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CampaignCategoriesPage() {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { success, error: showError } = useToast();

    const [campaignCategories, setCampaignCategories] = useState<CampaignCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CampaignCategory | undefined>();
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Campaigns modal state
    const [isCampaignsModalOpen, setIsCampaignsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CampaignCategory | null>(null);
    const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string; description?: string; status?: string; approval_status?: string; start_date?: string; end_date?: string; category_id?: number }>>([]);
    const [campaignsLoading, setCampaignsLoading] = useState(false);
    const [allCampaigns, setAllCampaigns] = useState<Array<{ id: string; name: string; description?: string; status?: string; approval_status?: string; start_date?: string; end_date?: string; category_id?: number }>>([]);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        loadCategories();
        loadAllCampaigns();
    }, [debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadAllCampaigns = async () => {
        try {
            const response = await campaignService.getAllCampaigns({
                pageSize: 1000 // Get all campaigns to count by category
            });
            setAllCampaigns((response.data as Array<{ id: string; name: string; description?: string; status?: string; approval_status?: string; start_date?: string; end_date?: string; category_id?: number }>) || []);
        } catch (err) {
            console.error('Failed to load campaigns for counting:', err);
            setAllCampaigns([]);
        }
    };

    const getCampaignCountForCategory = (categoryId: number) => {
        const count = allCampaigns.filter(campaign => {
            // Check if campaign has category_id that matches (handle both string and number)
            return campaign.category_id === categoryId ||
                campaign.category_id === categoryId.toString() ||
                (campaign as any).category_id === categoryId ||
                (campaign as any).category_id === categoryId.toString();
        }).length;

        console.log(`Category ${categoryId} has ${count} campaigns:`, allCampaigns.filter(campaign =>
            campaign.category_id === categoryId ||
            campaign.category_id === categoryId.toString() ||
            (campaign as any).category_id === categoryId ||
            (campaign as any).category_id === categoryId.toString()
        ));

        return count;
    };

    const loadCategories = async (skipCache = false) => {
        try {
            setLoading(true);
            const response = await campaignService.getCampaignCategories({
                search: debouncedSearchTerm || undefined,
                skipCache: skipCache
            });

            // Handle response structure - might be array or object with data property
            const categoriesData = Array.isArray(response)
                ? response
                : (response as Record<string, unknown>)?.data || [];

            // Add campaign count to each category
            const categoriesWithCounts = (categoriesData as CampaignCategory[]).map(category => {
                const count = getCampaignCountForCategory(category.id);
                console.log(`Setting count for category ${category.id} (${category.name}): ${count}`);
                return {
                    ...category,
                    campaign_count: count
                };
            });

            console.log('Categories with counts:', categoriesWithCounts);
            setCampaignCategories(categoriesWithCounts);
            setError('');
        } catch (err) {
            console.error('Failed to load categories:', err);
            setError(err instanceof Error ? err.message : 'Error loading categories');
            showError('Failed to load campaign categories', 'Please try again later.');
            setCampaignCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = () => {
        setEditingCategory(undefined);
        setIsModalOpen(true);
    };

    const handleEditCategory = (category: CampaignCategory) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDeleteCategory = async (category: CampaignCategory) => {
        const confirmed = await confirm({
            title: 'Delete Category',
            message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            await campaignService.deleteCampaignCategory(category.id);
            setCampaignCategories(prev => prev.filter(c => c.id !== category.id));
            success('Category Deleted', `"${category.name}" has been deleted successfully.`);
        } catch (err) {
            console.error('Error deleting category:', err);
            showError('Error', err instanceof Error ? err.message : 'Failed to delete category');
        }
    };

    const handleCategorySaved = async (categoryData: { name: string; description?: string }) => {
        try {
            setIsSaving(true);
            if (editingCategory) {
                // Update existing category
                await campaignService.updateCampaignCategory(
                    editingCategory.id,
                    categoryData
                );
                await loadCategories(true);
                success('Category updated successfully');
            } else {
                // Create new category
                await campaignService.createCampaignCategory(categoryData);
                await loadCategories(true);
                success('Category created successfully');
            }
            setIsModalOpen(false);
            setEditingCategory(undefined);
        } catch (err) {
            console.error('Failed to save category:', err);
            showError('Failed to save category', 'Please try again later.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleViewCampaigns = async (category: CampaignCategory) => {
        try {
            setSelectedCategory(category);
            setIsCampaignsModalOpen(true);
            setCampaignsLoading(true);

            // Fetch campaigns for this category
            const response = await campaignService.getAllCampaigns({
                categoryId: category.id,
                pageSize: 50 // Get more campaigns to show in modal
            });
            setCampaigns((response.data as Array<{ id: string; name: string; description?: string; status?: string; approval_status?: string; start_date?: string; end_date?: string; category_id?: number }>) || []);
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
            showError('Failed to load campaigns', 'Please try again later.');
            setCampaigns([]);
        } finally {
            setCampaignsLoading(false);
        }
    };

    const filteredCampaignCategories = (campaignCategories || []).filter(category =>
        category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category?.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Campaign Catalogs</h1>
                        <p className={`${tw.textSecondary} mt-2 text-sm`}>Organize and manage your campaign catalogs with ease</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateCategory}
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
                        Create Campaign Catalog
                    </button>
                </div>
            </div>

            <div className={`bg-white my-5`}>
                <div className="relative w-full">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${color.ui.text.muted}]`} />
                    <input
                        type="text"
                        placeholder="Search categories by name or description..."
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
                        <span className={`${tw.textSecondary}`}>Loading categories...</span>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <div className={`bg-[${color.status.error.light}] border border-[${color.status.error.main}]/20 text-[${color.status.error.main}] rounded-xl p-6`}>
                            <p className="font-medium mb-3">{error}</p>
                            <button
                                onClick={() => loadCategories()}
                                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
                                style={{ backgroundColor: color.status.error.main }}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : filteredCampaignCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <Target className={`w-16 h-16 text-[${color.entities.campaigns}] mx-auto mb-4`} />
                        <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
                            {searchTerm ? 'No Categories Found' : 'No Categories'}
                        </h3>
                        <p className={`${tw.textMuted} mb-6`}>
                            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first category to get started.'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={handleCreateCategory}
                                className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto text-sm text-white"
                                style={{ backgroundColor: color.sentra.main }}
                            >
                                <Plus className="w-4 h-4" />
                                Create Campaign Catalog
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
                                            Category
                                        </th>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                                            Description
                                        </th>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                                            Campaigns
                                        </th>
                                        <th className={`px-6 py-4 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredCampaignCategories.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50/30 transition-colors">
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
                                                            {category.name}
                                                        </div>
                                                        <div className={`text-sm ${tw.textMuted}`}>ID: {category.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-sm ${tw.textSecondary} max-w-xs truncate`}>
                                                    {category.description || 'No description'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-base font-medium bg-[${color.entities.campaigns}]/10 text-[${color.entities.campaigns}]`}>
                                                        {category.campaign_count || 0} campaign{(category.campaign_count || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                    {(category.campaign_count || 0) > 0 && (
                                                        <button
                                                            onClick={() => handleViewCampaigns(category)}
                                                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                            title="View campaigns"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEditCategory(category)}
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
                                                        onClick={() => handleDeleteCategory(category)}
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
                            {filteredCampaignCategories.map((category) => (
                                <div key={category.id} className="p-4 border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-start space-x-3">
                                        <div
                                            className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: color.entities.campaigns }}
                                        >
                                            <Target className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-base font-semibold ${tw.textPrimary} mb-1`}>
                                                {category.name}
                                            </div>
                                            <div className={`text-sm ${tw.textSecondary} mb-2`}>
                                                {category.description || 'No description'}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-base font-medium bg-[${color.entities.campaigns}]/10 text-[${color.entities.campaigns}]`}>
                                                        {category.campaign_count || 0} campaign{(category.campaign_count || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                    {(category.campaign_count || 0) > 0 && (
                                                        <button
                                                            onClick={() => handleViewCampaigns(category)}
                                                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                            title="View campaigns"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleEditCategory(category)}
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
                                                        onClick={() => handleDeleteCategory(category)}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCategory(undefined);
                }}
                category={editingCategory}
                onSave={handleCategorySaved}
                isSaving={isSaving}
            />

            {/* Campaigns Modal */}
            {isCampaignsModalOpen && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Campaigns in {selectedCategory.name}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsCampaignsModalOpen(false);
                                    setSelectedCategory(null);
                                    setCampaigns([]);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {campaignsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <LoadingSpinner />
                                    <span className="ml-2 text-gray-600">Loading campaigns...</span>
                                </div>
                            ) : campaigns.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-2">
                                        <Target className="w-12 h-12 mx-auto" />
                                    </div>
                                    <p className="text-gray-600">No campaigns found in this category</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {campaigns.map((campaign, index) => (
                                        <div key={campaign.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                        {campaign.name || 'Unnamed Campaign'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {campaign.description || 'No description available'}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>Status: {campaign.status || 'Unknown'}</span>
                                                        <span>Approval: {campaign.approval_status || 'Unknown'}</span>
                                                        {campaign.start_date && <span>Start: {new Date(campaign.start_date).toLocaleDateString()}</span>}
                                                        {campaign.end_date && <span>End: {new Date(campaign.end_date).toLocaleDateString()}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setIsCampaignsModalOpen(false);
                                                            navigate(`/dashboard/campaigns/${campaign.id}`);
                                                        }}
                                                        className="px-3 py-1 text-sm text-white rounded transition-colors"
                                                        style={{ backgroundColor: color.sentra.main }}
                                                        onMouseEnter={(e) => {
                                                            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

