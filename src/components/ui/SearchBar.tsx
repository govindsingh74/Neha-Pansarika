import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { supabase, Product } from '../../lib/supabase';

interface SearchBarProps {
  onProductSelect?: (product: Product) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onProductSelect,
  placeholder = "Search for products, categories...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [priceFilter, setPriceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            brand:brands(*)
          `)
          .eq('is_active', true);

        // Parse natural language queries like "below 100", "under 50", etc.
        const priceMatch = searchTerm.match(/(below|under|less than|<)\s*(\d+)/i);
        
        if (priceMatch) {
          const maxPrice = parseFloat(priceMatch[2]);
          query = query.lte('price', maxPrice);
          
          // Remove price filter from search term for name/category search
          const cleanedTerm = searchTerm.replace(/(below|under|less than|<)\s*\d+/i, '').trim();
          if (cleanedTerm) {
            query = query.or(`name.ilike.%${cleanedTerm}%,description.ilike.%${cleanedTerm}%`);
          }
        } else {
          // Regular search in name, description, and category
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Apply additional price filter if set
        if (priceFilter) {
          const maxPrice = parseFloat(priceFilter);
          if (!isNaN(maxPrice)) {
            query = query.lte('price', maxPrice);
          }
        }

        const { data, error } = await query.limit(8);

        if (error) throw error;

        setSearchResults(data || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, priceFilter]);

  const handleProductClick = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
    setShowResults(false);
    setSearchTerm('');
  };

  const clearFilters = () => {
    setPriceFilter('');
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {(searchTerm || priceFilter) && (
              <button
                onClick={clearFilters}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-md transition-colors ${
                showFilters || priceFilter 
                  ? 'bg-green-100 text-green-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Filter
                </label>
                <input
                  type="number"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  placeholder="Max price (₹)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPriceFilter('100')}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Under ₹100
                </button>
                <button
                  onClick={() => setPriceFilter('500')}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Under ₹500
                </button>
                <button
                  onClick={() => setPriceFilter('1000')}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Under ₹1000
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <img
                    src={product.image_url || 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg'}
                    alt={product.name}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category?.name}</p>
                    <p className="text-sm font-semibold text-green-600">
                      ₹{product.price}
                      {product.original_price && product.original_price > product.price && (
                        <span className="ml-2 text-gray-400 line-through">₹{product.original_price}</span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No products found for "{searchTerm}"
              {priceFilter && ` under ₹${priceFilter}`}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};