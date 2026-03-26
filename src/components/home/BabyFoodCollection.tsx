import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { supabase, Product } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ArrowRight, Baby } from 'lucide-react';

export const BabyFoodCollection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBabyFood = async () => {
      try {
        // First, get the Baby Food category ID
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', 'Baby Food')
          .eq('is_active', true)
          .single();

        if (categoryError || !categoryData) {
          console.log('Baby Food category not found');
          setProducts([]);
          setLoading(false);
          return;
        }

        // Then fetch products with that category ID
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            brand:brands(*)
          `)
          .eq('is_active', true)
          .eq('category_id', categoryData.id)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchBabyFood();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" className="h-32" />
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null; // Don't render if no baby food products
  }

  return (
    <section className="py-12 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
            <Baby className="h-8 w-8 text-pink-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Baby Food Collection</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nutritious and safe food options for your little ones. Carefully selected products 
            to support healthy growth and development.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`transform transition-all duration-500 ${
                index % 2 === 0 ? 'lg:translate-y-4' : ''
              }`}
            >
              <ProductCard
                product={product}
                variant="featured"
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-4 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
            View All Baby Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="font-semibold text-gray-900">Safety Certified</h3>
            <p className="text-sm text-gray-600">All products meet international safety standards</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="font-semibold text-gray-900">Organic Options</h3>
            <p className="text-sm text-gray-600">Natural and organic ingredients for pure nutrition</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">👶</span>
            </div>
            <h3 className="font-semibold text-gray-900">Age Appropriate</h3>
            <p className="text-sm text-gray-600">Products categorized by age and development stage</p>
          </div>
        </div>
      </div>
    </section>
  );
};