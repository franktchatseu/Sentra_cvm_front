import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, X, MessageSquare, ArrowLeft } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { useToast } from '../../../contexts/ToastContext';
import { offerCategoryService } from '../services/offerCategoryService';
import { OfferCategory, CreateOfferCategoryRequest, UpdateOfferCategoryRequest } from '../types/offerCategory';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: OfferCategory;
  onSave: (category: { name: string; description?: string }) => void;
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
      setError('Category name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      };

      onSave(categoryData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? 'Edit Offer Category' : 'Create New Offer Category'}
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
                Offer Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Enter offer category name"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Enter offer category description"
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
              disabled={isLoading}
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
              {isLoading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OfferCategoriesPage() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success, error: showError } = useToast();

  const [offerCategories, setOfferCategories] = useState<OfferCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<OfferCategory | undefined>();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadCategories();
  }, [debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategories = async (skipCache = false) => {
    try {
      setLoading(true);
      const response = await offerCategoryService.getOfferCategories({
        search: debouncedSearchTerm || undefined,
        pageSize: 100, // Get all categories
        sortBy: 'created_at',
        sortDirection: 'DESC',
        skipCache: skipCache ? 'true' : undefined
      });
      setOfferCategories(response.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err instanceof Error ? err.message : 'Error loading categories');
      showError('Failed to load offer categories', 'Please try again later.');
      setOfferCategories([]);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: OfferCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (category: OfferCategory) => {
    const confirmed = await confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await offerCategoryService.deleteOfferCategory(parseInt(category.id));
      setOfferCategories(prev => prev.filter(c => c.id !== category.id));
      success('Category Deleted', `"${category.name}" has been deleted successfully.`);
    } catch (err) {
      console.error('Error deleting category:', err);
      showError('Error', err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleCategorySaved = async (categoryData: { name: string; description?: string }) => {
    try {
      if (editingCategory) {
        // Update existing category
        await offerCategoryService.updateOfferCategory(
          parseInt(editingCategory.id),
          categoryData as UpdateOfferCategoryRequest
        );
        // Refresh the list to get updated data (bypass cache)
        await loadCategories(true);
        success('Category updated successfully');
      } else {
        // Create new category
        const newCategory = await offerCategoryService.createOfferCategory(
          categoryData as CreateOfferCategoryRequest
        );
        setOfferCategories(prev => [...prev, newCategory]);
        success('Category created successfully');
      }
      setIsModalOpen(false);
      setEditingCategory(undefined);
    } catch (err) {
      console.error('Failed to save category:', err);
      showError('Failed to save category', 'Please try again later.');
    }
  };

  const filteredOfferCategories = (offerCategories || []).filter(category =>
    category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category?.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/offers')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Offer Categories</h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>Organize and manage your offer categories with ease</p>
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
            Create Offer Category
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
        ) : filteredOfferCategories.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className={`w-16 h-16 text-[${color.entities.offers}] mx-auto mb-4`} />
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
                Create Offer Category
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className={`bg-gradient-to-r from-[${color.ui.surface}] to-[${color.ui.surface}]/80 border-b border-[${color.ui.border}]`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Category
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Description
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Offers
                    </th>
                    <th className={`px-6 py-4 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOfferCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-[${color.ui.surface}]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: color.entities.offers }}
                          >
                            <MessageSquare className="w-5 h-5 text-white" />
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
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-base font-medium bg-[${color.entities.offers}]/10 text-[${color.entities.offers}]`}>
                          {category.offer_count || 0} offer{(category.offer_count || 0) !== 1 ? 's' : ''}
                        </span>
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
              {filteredOfferCategories.map((category) => (
                <div key={category.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: color.entities.offers }}
                    >
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-base font-semibold ${tw.textPrimary} mb-1`}>
                        {category.name}
                      </div>
                      <div className={`text-sm ${tw.textSecondary} mb-2`}>
                        {category.description || 'No description'}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-base font-medium bg-[${color.entities.offers}]/10 text-[${color.entities.offers}]`}>
                          {category.offer_count || 0} offer{(category.offer_count || 0) !== 1 ? 's' : ''}
                        </span>
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
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSave={handleCategorySaved}
      />
    </div>
  );
}
