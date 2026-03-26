import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { supabase, Product } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ArrowRight, Heart, Leaf, Award } from 'lucide-react';

export const HealthFoodSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthFood = async () => {
      try {
        // First, get the Health Food category ID
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', 'Health Food')
          .eq('is_active', true)
          .single();

        if (categoryError || !categoryData) {
          console.log('Health Food category not found');
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

    fetchHealthFood();
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
    return null; // Don't render if no health food products
  }

  return (
    <section className="py-12 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Heart className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Health Food Collection</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nourish your body with our carefully curated selection of health foods. 
            From superfoods to organic products, fuel your wellness journey.
          </p>
        </div>

        {/* Health Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">100% Organic</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Certified organic products free from harmful pesticides and chemicals.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Quality Assured</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Rigorously tested products that meet the highest quality standards.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Nutrient Dense</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Packed with essential vitamins, minerals, and antioxidants.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`transform transition-all duration-500 hover:scale-105 ${
                index % 3 === 1 ? 'lg:-translate-y-4' : ''
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
          <button className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Explore Health Foods
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Wellness Tips */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Wellness Tips</h3>
            <p className="text-gray-600">Simple tips to incorporate health foods into your daily routine</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🥗</div>
              <h4 className="font-semibold text-gray-900 mb-2">Start Your Day</h4>
              <p className="text-sm text-gray-600">Begin with a nutritious breakfast to fuel your day</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💧</div>
              <h4 className="font-semibold text-gray-900 mb-2">Stay Hydrated</h4>
              <p className="text-sm text-gray-600">Drink plenty of water and herbal teas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🥜</div>
              <h4 className="font-semibold text-gray-900 mb-2">Healthy Snacking</h4>
              <p className="text-sm text-gray-600">Choose nuts, seeds, and fruits for snacks</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🌟</div>
              <h4 className="font-semibold text-gray-900 mb-2">Balance is Key</h4>
              <p className="text-sm text-gray-600">Maintain a balanced diet with variety</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};