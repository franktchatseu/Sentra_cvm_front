import { useState, useEffect } from 'react';
import { Search, Plus, Check, Package, X } from 'lucide-react';
import { Product } from '../../types/product';
import { productService } from '../../services/productService';

interface ProductSelectorProps {
  selectedProducts: Product[];
  onProductsChange: (products: Product[]) => void;
  multiSelect?: boolean;
}

export default function ProductSelector({ selectedProducts, onProductsChange, multiSelect = true }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock products for demo - replace with actual API call
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Data Plan 10GB',
      description: 'High-speed data plan with 10GB monthly allowance',
      category: 'data',
      price: 29.99,
      currency: 'USD',
      sku: 'DATA-10GB',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      image_url: '/api/placeholder/64/64'
    },
    {
      id: '2',
      name: 'Voice Bundle 500 Minutes',
      description: 'Voice calling bundle with 500 minutes',
      category: 'voice',
      price: 19.99,
      currency: 'USD',
      sku: 'VOICE-500MIN',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      image_url: '/api/placeholder/64/64'
    },
    {
      id: '3',
      name: 'SMS Package 1000',
      description: 'Text messaging package with 1000 SMS',
      category: 'sms',
      price: 9.99,
      currency: 'USD',
      sku: 'SMS-1000',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      image_url: '/api/placeholder/64/64'
    },
    {
      id: '4',
      name: 'Combo Plan Ultimate',
      description: 'Complete package with data, voice, and SMS',
      category: 'combo',
      price: 49.99,
      currency: 'USD',
      sku: 'COMBO-ULT',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      image_url: '/api/placeholder/64/64'
    },
    {
      id: '5',
      name: 'International Roaming',
      description: 'Roaming package for international travel',
      category: 'roaming',
      price: 15.99,
      currency: 'USD',
      sku: 'ROAM-INTL',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      image_url: '/api/placeholder/64/64'
    }
  ];

  useEffect(() => {
    loadProducts();
  }, [searchTerm, selectedCategory]);

  const loadProducts = async () => {
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
        filteredProducts = filteredProducts.filter(product => 
          product.category === selectedCategory
        );
      }
      
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to mock data if API fails
      const filteredProducts = mockProducts.filter(product => {
        const matchesSearch = !searchTerm || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      });
      
      setProducts(filteredProducts);
    } finally {
      setLoading(false);
    }
  };

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data': return '📊';
      case 'voice': return '📞';
      case 'sms': return '💬';
      case 'combo': return '📦';
      case 'roaming': return '🌍';
      default: return '📱';
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'data', label: 'Data Plans' },
    { value: 'voice', label: 'Voice Plans' },
    { value: 'sms', label: 'SMS Packages' },
    { value: 'combo', label: 'Combo Plans' },
    { value: 'roaming', label: 'Roaming' }
  ];

  return (
    <div className="space-y-4">
      {/* Selected Products Display */}
      {selectedProducts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Selected Products ({selectedProducts.length})</h4>
          <div className="grid grid-cols-1 gap-3">
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#3b8169] rounded-lg flex items-center justify-center text-white text-xl">
                    {getCategoryIcon(product.category)}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{product.name}</h5>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm font-semibold text-blue-600">${product.price}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
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
      )}

      {/* Add Product Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center space-x-2 text-gray-600 hover:text-indigo-600"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">
          {selectedProducts.length === 0 ? 'Select Products' : 'Add More Products'}
        </span>
      </button>

      {/* Product Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Select Products</h3>
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
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {products.map((product) => {
                    const isSelected = selectedProducts.some(p => p.id === product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductToggle(product)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white text-xl">
                              {getCategoryIcon(product.category)}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{product.name}</h5>
                              <p className="text-sm text-gray-600">{product.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm font-semibold text-indigo-600">${product.price}</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                                  {product.category}
                                </span>
                                {product.sku && (
                                  <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
