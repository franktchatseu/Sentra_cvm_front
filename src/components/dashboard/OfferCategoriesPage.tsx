import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FolderOpen, X, MessageSquare } from 'lucide-react';

interface OfferCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  offerCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: OfferCategory;
  onSave: (category: OfferCategory) => void;
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedCategory: OfferCategory = {
        id: category?.id || Date.now(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: category?.color || '#3B82F6',
        isActive: category?.isActive ?? true,
        offerCount: category?.offerCount || 0,
        createdAt: category?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSave(savedCategory);
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
            {category ? 'Edit Category' : 'Create New Category'}
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
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category description"
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
              className="px-4 py-2 bg-[#3b8169] hover:bg-[#2d5f4e] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : (category ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OfferCategoriesPage() {
  const [offerCategories, setOfferCategories] = useState<OfferCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<OfferCategory | undefined>();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, this would come from API
      const mockOfferCategories: OfferCategory[] = [
        {
          id: 1,
          name: 'Data Offers',
          description: 'Mobile data bundles and internet packages',
          color: '#3B82F6',
          isActive: true,
          offerCount: 12,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15'
        },
        {
          id: 2,
          name: 'Voice Offers',
          description: 'Call minutes and voice packages',
          color: '#10B981',
          isActive: true,
          offerCount: 8,
          createdAt: '2024-01-16',
          updatedAt: '2024-01-16'
        },
        {
          id: 3,
          name: 'Combo Offers',
          description: 'Combined data and voice packages',
          color: '#8B5CF6',
          isActive: true,
          offerCount: 15,
          createdAt: '2024-01-17',
          updatedAt: '2024-01-17'
        },
        {
          id: 4,
          name: 'Loyalty Rewards',
          description: 'Customer loyalty and retention programs',
          color: '#F59E0B',
          isActive: true,
          offerCount: 6,
          createdAt: '2024-01-18',
          updatedAt: '2024-01-18'
        },
        {
          id: 5,
          name: 'Promotional',
          description: 'Special promotional offers and campaigns',
          color: '#EF4444',
          isActive: false,
          offerCount: 3,
          createdAt: '2024-01-19',
          updatedAt: '2024-01-19'
        }
      ];

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOfferCategories(mockOfferCategories);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCategories();
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
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setOfferCategories(prev => prev.filter(c => c.id !== category.id));
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleCategorySaved = (savedCategory: OfferCategory) => {
    if (editingCategory) {
      // Update existing category
      setOfferCategories(prev => 
        prev.map(cat => cat.id === savedCategory.id ? savedCategory : cat)
      );
    } else {
      // Add new category
      setOfferCategories(prev => [...prev, savedCategory]);
    }
  };

  const filteredOfferCategories = offerCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Offer Categories</h1>
            </div>
            <p className="text-gray-500 text-base">Organize and manage your offer categories with ease</p>
          </div>
          <button
            onClick={handleCreateCategory}
            className="group flex items-center space-x-2 bg-[#3b8169] hover:bg-[#2d5f4e] text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold">New Category</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-[#3b8169] hover:bg-[#2d5f4e] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium text-base w-full sm:w-auto"
          >
            Search
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-red-700 font-medium mb-3">{error}</p>
              <button
                onClick={loadCategories}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredOfferCategories.length === 0 ? (
          <div className="p-16 text-center">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No categories found</h3>
              <p className="text-gray-600 mb-8 text-sm max-w-md mx-auto">
                {searchTerm ? 'No categories match your search criteria. Try adjusting your search terms.' : 'Get started by creating your first offer category to organize your offers effectively.'}
              </p>
              <button
                onClick={handleCreateCategory}
                className="bg-[#3b8169] hover:bg-[#2d5f4e] text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-base"
              >
                Create Your First Category
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-4 sm:px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Description
                  </th>
                  <th className="px-4 sm:px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Offers
                  </th>
                  <th className="px-4 sm:px-8 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredOfferCategories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group">
                    <td className="px-4 sm:px-8 py-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div 
                            className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200"
                            style={{ backgroundColor: category.color || '#10B981' }}
                          >
                            <MessageSquare className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-5">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-green-900 transition-colors">{category.name}</div>
                          <div className="text-sm text-gray-500 font-medium">ID: {category.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6">
                      <div className="text-sm text-gray-700 max-w-xs">
                        {category.description || <span className="italic text-gray-400">No description</span>}
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6">
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                        {category.offerCount} offer{category.offerCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 sm:px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200 group/btn"
                          title="Edit Category"
                        >
                          <Edit className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200 group/btn"
                          title="Delete Category"
                        >
                          <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSave={handleCategorySaved}
      />
    </div>
  );
}
