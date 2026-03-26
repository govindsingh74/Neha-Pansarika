import React, { useEffect, useState } from 'react';
import { supabase, Brand } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ArrowRight } from 'lucide-react';

export const FeaturedBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedBrands = async () => {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('name')
          .limit(8);

        if (error) throw error;
        setBrands(data || []);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBrands();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" className="h-32" />
        </div>
      </section>
    );
  }

  if (error || brands.length === 0) {
    return null; // Don't render if no featured brands
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Brands</h2>
            <p className="text-gray-600">Trusted brands for quality products</p>
          </div>
          <button className="hidden md:flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors">
            View All
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden bg-gray-100 group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={brand.logo_url || 'https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg'}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  {brand.name}
                </h3>
                {brand.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {brand.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <button className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
            View All Brands
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};