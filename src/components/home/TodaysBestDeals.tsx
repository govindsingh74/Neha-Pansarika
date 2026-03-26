import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { supabase, Product } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ArrowRight } from 'lucide-react';

export const TodaysBestDeals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestDeals = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            brand:brands(*)
          `)
          .eq('is_active', true)
          .eq('is_best_deal', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchBestDeals();
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

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>Error loading deals: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't render section if no deals available
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Today's Hot Deals</h2>
            <p className="text-gray-600">Limited time offers on your favorite products</p>
          </div>
          <button className="hidden md:flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors">
            View All
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="featured"
            />
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <button className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
            View All Deals
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};