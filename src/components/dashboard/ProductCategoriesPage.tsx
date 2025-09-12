import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Search, X } from 'lucide-react';
import { productCategoryService } from '../../services/productCategoryService';
import { ProductCategory, CreateProductCategoryRequest, UpdateProductCategoryRequest } from '../../types/productCategory';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: ProductCategory;
  onSave: (category: ProductCategory) => void;
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
      setError('Le nom de la catégorie est requis');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let savedCategory: ProductCategory;
      
      if (category) {
        // Update existing category
        const updateData: UpdateProductCategoryRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        };
        savedCategory = await productCategoryService.updateCategory(category.id, updateData);
      } else {
        // Create new category
        const createData: CreateProductCategoryRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        };
        savedCategory = await productCategoryService.createCategory(createData);
      }

      onSave(savedCategory);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Data, Voice, SMS..."
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description de la catégorie..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : (category ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | undefined>();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await productCategoryService.getCategories({
        search: searchTerm || undefined
      });
      setCategories(response.categories);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadCategories();
  };

  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (category: ProductCategory) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      return;
    }

    try {
      await productCategoryService.deleteCategory(category.id);
      setCategories(categories.filter(c => c.id !== category.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleCategorySaved = (savedCategory: ProductCategory) => {
    if (editingCategory) {
      // Update existing category
      setCategories(categories.map(c => c.id === savedCategory.id ? savedCategory : c));
    } else {
      // Add new category
      setCategories([savedCategory, ...categories]);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories de produits</h1>
          <p className="text-gray-600 mt-1">Gérez les catégories pour organiser vos produits</p>
        </div>
        <button
          onClick={handleCreateCategory}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle catégorie</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={loadCategories}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Réessayer
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune catégorie trouvée</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Aucune catégorie ne correspond à votre recherche.' : 'Commencez par créer votre première catégorie de produits.'}
            </p>
            <button
              onClick={handleCreateCategory}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Créer une catégorie
            </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produits
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">ID: {category.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {category.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category.productCount || 0} produit(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Supprimer"
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
