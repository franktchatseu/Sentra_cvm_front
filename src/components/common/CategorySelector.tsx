import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Plus, X } from 'lucide-react';
import { ProductCategory } from '../../types/productCategory';
import { productCategoryService } from '../../services/productCategoryService';

interface CategorySelectorProps {
  value?: number;
  onChange: (categoryId: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  allowCreate?: boolean;
  onCreateCategory?: () => void;
  className?: string;
}

export default function CategorySelector({
  value,
  onChange,
  placeholder = "Select Category",
  disabled = false,
  allowCreate = false,
  onCreateCategory,
  className = ""
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productCategoryService.getCategories();
      setCategories(response.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCategory = categories.find(cat => cat.id === value);

  const handleSelect = (categoryId: number | undefined) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    if (onCreateCategory) {
      onCreateCategory();
    } else {
      setShowCreateModal(true);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setIsCreating(true);
      const newCategory = await productCategoryService.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined
      });
      
      // Refresh categories list
      await loadCategories();
      
      // Select the newly created category
      onChange(newCategory.id);
      
      // Close modal and reset form
      setShowCreateModal(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        {/* Category Selector */}
        <div className="flex-1 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`w-full px-4 py-3 text-left border border-gray-300 rounded-lg focus:border-blue-500 transition-colors ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
            } ${isOpen ? 'border-blue-500' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
                {selectedCategory ? selectedCategory.name : placeholder}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown */}
          {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500"
              />
            </div>
          </div>

          {/* Categories List */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            ) : error ? (
              <div className="p-3 text-center text-red-600 text-sm">
                <p>{error}</p>
                <button
                  onClick={loadCategories}
                  className="mt-1 text-blue-600 hover:text-blue-700 underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Clear Selection Option */}
                <button
                  onClick={() => handleSelect(undefined)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear selection
                </button>

                {/* Categories */}
                {filteredCategories.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {searchTerm ? 'No categories found' : 'No categories available'}
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleSelect(category.id)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center justify-between ${
                        value === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{category.description}</div>
                        )}
                      </div>
                      {category.productCount !== undefined && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {category.productCount}
                        </span>
                      )}
                    </button>
                  ))
                )}

                {/* Create New Category Option */}
                {allowCreate && onCreateCategory && (
                  <div className="border-t border-gray-200">
                    <button
                      onClick={handleCreateNew}
                      className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create new category
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
          )}
        </div>

        {/* Add Category Button */}
        {allowCreate && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            title="Create new category"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">New Category</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="e.g., Data, Voice, SMS..."
                  required
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Description
                </label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 transition-all bg-gray-50 focus:bg-white resize-none"
                  placeholder="Category description..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCategoryName('');
                    setNewCategoryDescription('');
                  }}
                  className="px-6 py-3 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || isCreating}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                >
                  {isCreating ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
