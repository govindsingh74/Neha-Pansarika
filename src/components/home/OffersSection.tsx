import React, { useEffect, useState } from 'react';
import { supabase, Offer } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ArrowRight, Tag, Clock, Percent } from 'lucide-react';

export const OffersSection: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setOffers(data || []);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" className="h-32" />
        </div>
      </section>
    );
  }

  if (error || offers.length === 0) {
    return null; // Don't render if no offers
  }

  return (
    <section className="py-12 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Tag className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Limited Time Offers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't miss out on these amazing deals! Grab your favorites before they expire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Offer Image */}
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 relative overflow-hidden">
                {offer.image_url ? (
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <Percent className="h-16 w-16 mx-auto mb-2" />
                      <div className="text-4xl font-bold">
                        {offer.discount_type === 'percentage' ? `${offer.discount_value}%` : `₹${offer.discount_value}`}
                      </div>
                      <div className="text-sm uppercase tracking-wide">OFF</div>
                    </div>
                  </div>
                )}
                
                {/* Urgency Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {getDaysRemaining(offer.end_date)} days left
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {offer.title}
                </h3>
                
                {offer.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {offer.description}
                  </p>
                )}

                {/* Offer Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <Tag className="h-4 w-4 mr-2" />
                    <span>
                      {offer.discount_type === 'percentage' 
                        ? `${offer.discount_value}% off` 
                        : `₹${offer.discount_value} off`
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="text-green-600 font-medium">
                      Min. order: ₹{offer.min_order_amount}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Valid till {formatDate(offer.end_date)}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform group-hover:scale-105">
                  Claim Offer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            View All Offers
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Never Miss an Offer</h3>
            <p className="text-gray-600 mb-6">Subscribe to get notifications about exclusive deals and offers</p>
            
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-r-lg hover:bg-purple-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};