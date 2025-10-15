import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, X, MessageSquare, ArrowLeft, Eye, Grid, List } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { useToast } from '../../../contexts/ToastContext';
import { offerCategoryService } from '../services/offerCategoryService';
import { offerService } from '../services/offerService';
import { OfferCategory, CreateOfferCategoryRequest, UpdateOfferCategoryRequest } from '../types/offerCategory';
import { Offer } from '../types/offer';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: OfferCategory;
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

      await onSave(categoryData); // Wait for save to complete
      onClose(); // Only close after save succeeds
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
            {category ? 'Edit Offer Catalog' : 'Create New Offer Catalog'}
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
                Offer Catalog Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Enter offer catalog name"
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
                placeholder="Enter offer catalog description"
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

interface OffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: OfferCategory | null;
  onRefreshCategories: () => void;
}

function OffersModal({ isOpen, onClose, category, onRefreshCategories }: OffersModalProps) {
  const navigate = useNavigate();
  const { success: showToast, error: showError } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [allOffersList, setAllOffersList] = useState<Offer[]>([]);
  const [assigningOffer, setAssigningOffer] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      loadOffers();
      setSearchTerm('');
    }
  }, [isOpen, category]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchTerm) {
      const filtered = offers.filter(offer =>
        offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOffers(filtered);
    } else {
      setFilteredOffers(offers);
    }
  }, [searchTerm, offers]);

  const loadOffers = async () => {
    if (!category) return;

    try {
      setLoading(true);
      setError(null);
      const response = await offerCategoryService.getCategoryOffers(parseInt(category.id), {
        pageSize: 100,
        skipCache: 'true'
      });
      // Backend returns offers in response.data.offers, not response.offers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const offersData = (response as any).data?.offers || response.offers || [];
      setOffers(offersData);
    } catch (err) {
      console.error('Failed to load offers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  // const handleCreateOffer = () => {
  //   if (category) {
  //     navigate(`/dashboard/offers/create?categoryId=${category.id}`);
  //   }
  // };

  const loadUnassignedOffers = async () => {
    try {
      const response = await offerService.getOffers({
        pageSize: 1000,
        skipCache: true
      });
      // Get offers not in this category or with no category
      const unassigned = (response.data || []).filter(
        (o: Offer) => !o.category_id || String(o.category_id) !== String(category?.id)
      );
      setAllOffersList(unassigned);
    } catch (err) {
      console.error('Failed to load unassigned offers:', err);
      setAllOffersList([]);
    }
  };

  const handleAssignOffer = async (offerId: string) => {
    if (!category) return;

    try {
      setAssigningOffer(true);
      await offerService.updateOffer(parseInt(offerId), {
        category_id: parseInt(category.id)
      });

      showToast('Offer assigned successfully');
      setShowAssignDropdown(false);
      loadOffers(); // Refresh the offers in this category
      loadUnassignedOffers(); // Refresh unassigned list
      onRefreshCategories(); // Refresh parent categories list with updated counts
    } catch (err) {
      console.error('Failed to assign offer:', err);
      showError(err instanceof Error ? err.message : 'Failed to assign offer');
    } finally {
      setAssigningOffer(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Offers in "{category.name}"
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {offers.length} offer{offers.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search and Actions */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    onClick={() => {
                      if (!showAssignDropdown) {
                        loadUnassignedOffers();
                      }
                      setShowAssignDropdown(!showAssignDropdown);
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap hover:bg-gray-50"
                    disabled={assigningOffer}
                  >
                    <Plus className="w-4 h-4" />
                    Assign Existing Offer
                  </button>

                  {/* Dropdown for available offers */}
                  {showAssignDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                      {allOffersList.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No available offers to assign
                        </div>
                      ) : (
                        <div className="py-2">
                          {allOffersList.map((offer) => (
                            <button
                              key={offer.id}
                              onClick={() => handleAssignOffer(offer.id!.toString())}
                              disabled={assigningOffer}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 border-b border-gray-100 last:border-0"
                            >
                              <div className="font-medium text-gray-900 text-sm">{offer.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {offer.description || 'No description'}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* <button
                  onClick={handleCreateOffer}
                  className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap"
                  style={{ backgroundColor: color.sentra.main }}
                >
                  <Plus className="w-4 h-4" />
                  Create New Offer
                </button> */}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadOffers}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No offers found' : 'No offers in this category'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Create a new offer or assign an existing one to this category'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: color.entities.offers }}
                        >
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{offer.name}</h4>
                          <p className="text-sm text-gray-600">
                            {offer.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${offer.lifecycle_status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : offer.lifecycle_status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {offer.lifecycle_status}
                      </span>
                      <button
                        onClick={() => handleAssignOffer(offer.id!.toString())}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory | null>(null);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const loadData = async () => {
      // Load offers first, then categories (to avoid race condition)
      const offers = await loadAllOffers();
      await loadCategories(true, offers); // Always skip cache for fresh data
    };
    loadData();
  }, [debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllOffers = async () => {
    try {
      const response = await offerService.getOffers({
        pageSize: 1000, // Get all offers to count by category
        skipCache: true
      });
      const offers = response.data || [];
      setAllOffers(offers);
      return offers;
    } catch (err) {
      console.error('Failed to load offers for counting:', err);
      setAllOffers([]);
      return [];
    }
  };

  const getOfferCountForCategory = (categoryId: string, offers: Offer[]) => {
    return offers.filter(offer => Number(offer.category_id) === Number(categoryId)).length;
  };

  const loadCategories = async (skipCache = false, offersData?: Offer[]) => {
    try {
      setLoading(true);
      const response = await offerCategoryService.getOfferCategories({
        search: debouncedSearchTerm || undefined,
        pageSize: 100, // Get all categories
        sortBy: 'created_at',
        sortDirection: 'DESC',
        skipCache: skipCache ? 'true' : 'false'
      });

      // Use provided offers data or fall back to state
      const offersToUse = offersData || allOffers;

      // Add offer count to each category by counting from offers
      const categoriesWithCounts = (response.data || []).map(category => ({
        ...category,
        offer_count: getOfferCountForCategory(category.id, offersToUse)
      }));

      setOfferCategories(categoriesWithCounts);
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

  const handleViewOffers = (category: OfferCategory) => {
    setSelectedCategory(category);
    setIsOffersModalOpen(true);
  };

  const handleCategorySaved = async (categoryData: { name: string; description?: string }) => {
    try {
      if (editingCategory) {
        // Update existing category
        await offerCategoryService.updateOfferCategory(
          parseInt(editingCategory.id),
          categoryData as UpdateOfferCategoryRequest
        );
        success('Category updated successfully');
      } else {
        // Create new category
        await offerCategoryService.createOfferCategory(
          categoryData as CreateOfferCategoryRequest
        );
        success('Category created successfully');
      }

      // Refresh both offers and categories to get updated counts
      const offers = await loadAllOffers();
      await loadCategories(true, offers);

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
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Offer Catalogs</h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>Organize and manage your offer catalogs with ease</p>
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
            Create Offer Catalog
          </button>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
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
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner variant="modern" size="xl" color="primary" className="mb-4" />
          <p className={`${tw.textMuted} font-medium`}>Loading catalogs...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className={`bg-red-50 border border-red-200 text-red-700 rounded-xl p-6`}>
            <p className="font-medium mb-3">{error}</p>
            <button
              onClick={() => loadCategories()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredOfferCategories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16 px-4">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No catalogs found' : 'No catalogs yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Create your first offer catalog to organize your offers'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateCategory}
              className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all"
              style={{ backgroundColor: color.sentra.main }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Catalog
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOfferCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color.entities.offers}20` }}
                >
                  <MessageSquare className="w-6 h-6" style={{ color: color.entities.offers }} />
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditCategory(category)}
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
                  {category.offer_count || 0} offer{category.offer_count !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => handleViewOffers(category)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View & Assign Offers"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOfferCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color.entities.offers}20` }}
                >
                  <MessageSquare className="w-6 h-6" style={{ color: color.entities.offers }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {category.offer_count || 0} offer{category.offer_count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewOffers(category)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View & Assign Offers"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleEditCategory(category)}
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

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSave={handleCategorySaved}
      />

      <OffersModal
        isOpen={isOffersModalOpen}
        onClose={() => {
          setIsOffersModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onRefreshCategories={async () => {
          const offers = await loadAllOffers();
          await loadCategories(true, offers);
        }}
      />
    </div>
  );
}
