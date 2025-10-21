import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, X, Users, ArrowLeft, Eye, Grid, List } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { useToast } from '../../../contexts/ToastContext';
import { segmentService } from '../services/segmentService';
import { SegmentCategory, CreateSegmentCategoryRequest, UpdateSegmentCategoryRequest } from '../types/segment';
import { Segment } from '../types/segment';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: SegmentCategory;
    onSave: (category: { name: string; description?: string }) => Promise<void>;
}

function CategoryModal({ isOpen, onClose, category, onSave }: CategoryModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
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

        setIsLoading(true);
        setError('');

        try {
            const categoryData = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined
            };

            await onSave(categoryData);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save category');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {category ? 'Edit Segment Catalog' : 'Create New Segment Catalog'}
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
                                Segment Catalog Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
                                placeholder="e.g., Marketing Segments, Retention Campaigns"
                                required
                            />
                            {/* <p className="text-sm text-gray-500 mt-1">
                                Choose a descriptive name to organize your segments
                            </p> */}
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
                            disabled={isLoading}
                            className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: color.primary.action }}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                    (e.target as HTMLButtonElement).style.backgroundColor = color.primary.action;
                                }
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = color.primary.action;
                            }}
                        >
                            {isLoading ? 'Saving...' : (category ? 'Update Catalog' : 'Create Catalog')}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

interface SegmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: SegmentCategory | null;
}

function SegmentsModal({ isOpen, onClose, category }: SegmentsModalProps) {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [filteredSegments, setFilteredSegments] = useState<Segment[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loadCategorySegments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await segmentService.getSegments({ skipCache: true });
            const segmentsData = (response as { data?: Segment[] }).data || [];

            // Filter segments that belong to this category
            const categorySegments = segmentsData.filter(
                (s: Segment) => s.category && String(s.category) === String(category?.id)
            );

            setSegments(categorySegments);
            setFilteredSegments(categorySegments);
        } catch (err) {
            console.error('Failed to load segments:', err);
            setSegments([]);
            setFilteredSegments([]);
        } finally {
            setIsLoading(false);
        }
    }, [category?.id]);

    useEffect(() => {
        if (isOpen && category) {
            loadCategorySegments();
        }
    }, [isOpen, category, loadCategorySegments]);

    useEffect(() => {
        if (searchTerm.trim()) {
            const filtered = segments.filter(segment =>
                segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (segment.description && segment.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredSegments(filtered);
        } else {
            setFilteredSegments(segments);
        }
    }, [searchTerm, segments]);



    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Segments in {category?.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {segments.length} segment{segments.length !== 1 ? 's' : ''} in this catalog
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Search and Assign Button */}
                <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search segments..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <LoadingSpinner variant="modern" size="lg" color="primary" />
                            <p className="text-gray-500 mt-4">Loading segments...</p>
                        </div>
                    ) : filteredSegments.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                                {searchTerm ? 'No segments match your search' : 'No segments in this catalog'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredSegments.map((segment) => (
                                <div
                                    key={segment.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{segment.name}</h3>
                                        {segment.description && (
                                            <p className="text-sm text-gray-500 mt-1">{segment.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs text-gray-500">
                                                Type: <span className="font-medium capitalize">{segment.type}</span>
                                            </span>
                                            {segment.customer_count !== undefined && (
                                                <span className="text-xs text-gray-500">
                                                    Members: <span className="font-medium">{segment.customer_count.toLocaleString()}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function SegmentCategoriesPage() {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { success, error: showError } = useToast();

    const [categories, setCategories] = useState<SegmentCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<SegmentCategory | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSegmentsModalOpen, setIsSegmentsModalOpen] = useState(false);
    const [segmentCounts, setSegmentCounts] = useState<Record<number, number>>({});
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const loadCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await segmentService.getSegmentCategories(undefined, true);
            const categoriesData = response.data || [];
            setCategories(categoriesData);

            // Load segment counts for each category
            await loadSegmentCounts(categoriesData);
        } catch (err) {
            showError('Error loading categories', (err as Error).message || 'Failed to load segment catalogs');
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const loadSegmentCounts = async (cats: SegmentCategory[]) => {
        try {
            const response = await segmentService.getSegments({ skipCache: true });
            const segmentsData = ((response as { data?: Segment[] }).data || []) as Segment[];

            const counts: Record<number, number> = {};
            cats.forEach(cat => {
                counts[cat.id] = segmentsData.filter(s => s.category === cat.id).length;
            });

            setSegmentCounts(counts);
        } catch (err) {
            console.error('Failed to load segment counts:', err);
        }
    };

    const handleCreateCategory = async (categoryData: { name: string; description?: string }) => {
        try {
            const request: CreateSegmentCategoryRequest = {
                name: categoryData.name
                // Note: Backend only accepts 'name', description is ignored
            };

            await segmentService.createSegmentCategory(request);
            success('Catalog created', `Segment catalog "${categoryData.name}" has been created successfully`);
            await loadCategories();
        } catch (err) {
            throw new Error((err as Error).message || 'Failed to create segment catalog');
        }
    };

    const handleUpdateCategory = async (categoryData: { name: string; description?: string }) => {
        if (!selectedCategory) return;

        try {
            const request: UpdateSegmentCategoryRequest = {
                name: categoryData.name
                // Note: Backend only accepts 'name', description is ignored
            };

            await segmentService.updateSegmentCategory(selectedCategory.id, request);
            success('Catalog updated', `Segment catalog "${categoryData.name}" has been updated successfully`);
            await loadCategories();
        } catch (err) {
            throw new Error((err as Error).message || 'Failed to update segment catalog');
        }
    };

    const handleDeleteCategory = async (category: SegmentCategory) => {
        const segmentCount = segmentCounts[category.id] || 0;

        const confirmed = await confirm({
            title: 'Delete Segment Catalog',
            message: segmentCount > 0
                ? `This catalog contains ${segmentCount} segment(s). Deleting it will unassign all segments. Are you sure you want to continue?`
                : `Are you sure you want to delete "${category.name}"?`,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            await segmentService.deleteSegmentCategory(category.id);
            success('Catalog deleted', `Segment catalog "${category.name}" has been deleted successfully`);
            await loadCategories();
        } catch (err) {
            showError('Error deleting catalog', (err as Error).message || 'Failed to delete segment catalog');
        }
    };


    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard/segments')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Segment Catalogs</h1>
                        <p className={`${tw.textSecondary} mt-1`}>Organize your segments into catalogs</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setSelectedCategory(null);
                        setIsCategoryModalOpen(true);
                    }}
                    className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all"
                    style={{ backgroundColor: color.primary.action }}
                    onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = color.primary.action;
                    }}
                    onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = color.primary.action;
                    }}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Catalog
                </button>
            </div>

            {/* Search and View Toggle */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search catalogs..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-2  p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded transition-colors ${viewMode === 'grid'
                            ? 'bg-gray-200 text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        title="Grid View"
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded transition-colors ${viewMode === 'list'
                            ? 'bg-gray-200 text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        title="List View"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Categories */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <LoadingSpinner variant="modern" size="xl" color="primary" className="mb-4" />
                    <p className={`${tw.textMuted} font-medium`}>Loading catalogs...</p>
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16 px-4">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'No catalogs found' : 'No catalogs yet'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm
                            ? 'Try adjusting your search terms'
                            : 'Create your first segment catalog to organize your segments'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => {
                                setSelectedCategory(null);
                                setIsCategoryModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all"
                            style={{ backgroundColor: color.primary.action }}
                            onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = color.primary.action;
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = color.primary.action;
                            }}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Your First Catalog
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((category) => (
                        <div
                            key={category.id}
                            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setIsCategoryModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                            {category.description && (
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{category.description}</p>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <span className="text-sm text-gray-600">
                                    {segmentCounts[category.id] || 0} segment{segmentCounts[category.id] !== 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setIsSegmentsModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="View & Assign Segments"
                                >
                                    <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredCategories.map((category) => (
                        <div
                            key={category.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold text-gray-900">{category.name}</h3>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        {segmentCounts[category.id] || 0} segment{segmentCounts[category.id] !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setIsSegmentsModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="View & Assign Segments"
                                >
                                    <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setIsCategoryModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => handleDeleteCategory(category)}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }

            {/* Modals */}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    setSelectedCategory(null);
                }}
                category={selectedCategory || undefined}
                onSave={selectedCategory ? handleUpdateCategory : handleCreateCategory}
            />

            <SegmentsModal
                isOpen={isSegmentsModalOpen}
                onClose={() => {
                    setIsSegmentsModalOpen(false);
                    setSelectedCategory(null);
                }}
                category={selectedCategory}
            />
        </div>
    );
}


