import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Check, Package, X } from 'lucide-react';
import { Product } from '../types/product';
import { ProductCategory } from '../types/productCategory';
import HeadlessSelect from '../../../shared/components/ui/HeadlessSelect';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { productService } from '../services/productService';
import { productCategoryService } from '../services/productCategoryService';
import { color } from '../../../shared/utils/utils';

interface ProductSelectorProps {
  selectedProducts: Product[];
  onProductsChange: (products: Product[]) => void;
  multiSelect?: boolean;
}


export default function ProductSelector({ selectedProducts, onProductsChange, multiSelect = true }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ value: string, label: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const response = await productCategoryService.getCategories();
      const categoryOptions = [
        { value: 'all', label: 'All Catalogs' },
        ...response.categories.map((category: ProductCategory) => ({
          value: category.name.toLowerCase(),
          label: category.name
        }))
      ];
      setCategories(categoryOptions);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set empty categories if API fails
      setCategories([{ value: 'all', label: 'All Categories' }]);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Load products from API
      const response = await productService.getProducts({
        search: searchTerm || undefined,
        isActive: true, // Only show active products
        page: 1,
        pageSize: 100 // Load more products for selection
      });

      let filteredProducts = response.data;

      // Apply category filter if not 'all'
      if (selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter((product: Product) =>
          product.category === selectedCategory
        );
      }

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleProductToggle = (product: Product) => {
    if (multiSelect) {
      const isSelected = selectedProducts.some(p => p.id === product.id);
      if (isSelected) {
        onProductsChange(selectedProducts.filter(p => p.id !== product.id));
      } else {
        onProductsChange([...selectedProducts, product]);
      }
    } else {
      onProductsChange([product]);
      setIsModalOpen(false);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    onProductsChange(selectedProducts.filter(p => p.id !== productId));
  };

  const getCategoryIcon = () => {

    return <Package className="w-6 h-6" style={{ color: color.entities.products }} />;
  };


  return (
    <div className="space-y-4">
      {selectedProducts.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Selected Products ({selectedProducts.length})</h4>
          <div className="grid grid-cols-1 gap-3">
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                    {getCategoryIcon()}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{product.name}</h5>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 text-white rounded-full" style={{ backgroundColor: color.sentra.main }}>
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveProduct(product.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Remove product"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Selected</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md text-center">
              Start building your offer by selecting products. You can choose from various product categories and configure their details.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-5 py-2.5 bg-[#3A5A40] hover:bg-[#2f4a35] text-white rounded-md text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Select Products
            </button>
          </div>
        </div>
      )}

      {/* Add More Products Button (only show when products are selected) */}
      {selectedProducts.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 text-gray-700 hover:text-gray-900 text-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add More Products</span>
          </button>
        </div>
      )}

      {/* Product Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Select Products</h3>
                  <p className="text-sm text-gray-600 mt-1">Choose products to include in your offer</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by name, description, or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <HeadlessSelect
                    options={categories}
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(String(value))}
                    placeholder="All Catalogs"
                    className="min-w-[200px] border border-gray-200 rounded-lg"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner size="lg" variant="default" color="primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {products.map((product) => {
                    const isSelected = selectedProducts.some(p => p.id === product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductToggle(product)}
                        className={`relative p-4 border rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                          ? 'border-green-500'
                          : 'border-gray-200'
                          }`}
                      >
                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-green-600 transition-all duration-200">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}

                        <div className="flex items-start space-x-4 pr-8">
                          {/* Product Icon */}
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                            {getCategoryIcon()}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h5>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>

                            {/* Product Meta */}
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: color.sentra.main }}>
                                {product.category}
                              </span>
                              {product.sku && (
                                <span className="text-xs text-gray-500 font-mono">SKU: {product.sku}</span>
                              )}
                            </div>

                            {/* Price */}
                            {product.price && (
                              <div className="flex items-center space-x-1">
                                <span className="text-lg font-bold text-gray-900">${product.price}</span>
                                <span className="text-sm text-gray-500">{product.currency}</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                  </span>
                  {selectedProducts.length > 0 && (
                    <button
                      onClick={() => {
                        onProductsChange([]);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                    style={{
                      backgroundColor: '#3A5A40'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#2f4a35';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#3A5A40';
                    }}
                  >
                    {selectedProducts.length > 0 ? 'Add Products' : 'Done'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
