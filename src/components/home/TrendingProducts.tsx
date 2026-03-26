import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { supabase, Product, Category } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Filter, ArrowRight } from 'lucide-react';

export const TrendingProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch trending products
        await fetchTrendingProducts();
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTrendingProducts = async (categoryId?: string) => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .eq('is_active', true)
        .eq('is_trending', true);

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    fetchTrendingProducts(categoryId);
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" className="h-32" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>Error loading trending products: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0 && !loading) {
    return null; // Don't render if no trending products
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Products</h2>
            <p className="text-gray-600">Popular items that everyone's talking about</p>
          </div>
          <button className="hidden md:flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors">
            View All
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filter by Category</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center text-green-600 font-medium"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </button>
          </div>

          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p>No trending products found in this category.</p>
          </div>
        )}

        <div className="text-center mt-8 md:hidden">
          <button className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
            View All Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};