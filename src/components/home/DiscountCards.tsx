import React from 'react';
import { Percent, Tag, Zap } from 'lucide-react';

interface DiscountCardData {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  description: string;
}

const discountCards: DiscountCardData[] = [
  {
    id: '1',
    title: '10% OFF',
    subtitle: 'On First Order',
    discount: 'FIRST10',
    icon: <Tag className="h-8 w-8" />,
    bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
    textColor: 'text-white',
    description: 'Get 10% off on your first purchase above ₹500'
  },
  {
    id: '2',
    title: '20% OFF',
    subtitle: 'Weekend Special',
    discount: 'WEEKEND20',
    icon: <Percent className="h-8 w-8" />,
    bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
    textColor: 'text-white',
    description: 'Weekend special offer on all categories'
  },
  {
    id: '3',
    title: '30% OFF',
    subtitle: 'Bulk Orders',
    discount: 'BULK30',
    icon: <Zap className="h-8 w-8" />,
    bgColor: 'bg-gradient-to-br from-orange-400 to-red-500',
    textColor: 'text-white',
    description: 'Save more on orders above ₹2000'
  }
];

export const DiscountCards: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Special Offers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't miss out on these amazing deals. Use these discount codes and save big on your orders!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {discountCards.map((card, index) => (
            <div
              key={card.id}
              className={`group relative overflow-hidden rounded-2xl ${card.bgColor} p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full border-4 border-white"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border-4 border-white"></div>
              </div>

              <div className={`relative ${card.textColor}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    {card.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{card.title}</div>
                    <div className="text-sm opacity-90">{card.subtitle}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm opacity-90 mb-3">
                    {card.description}
                  </p>
                  <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <span className="font-mono font-bold text-lg">
                      {card.discount}
                    </span>
                    <button className="text-xs px-3 py-1 bg-white/30 rounded-full hover:bg-white/40 transition-colors">
                      Copy Code
                    </button>
                  </div>
                </div>

                <button className="w-full bg-white/20 backdrop-blur-sm text-white font-semibold py-3 rounded-lg hover:bg-white/30 transition-all duration-300 transform group-hover:scale-105">
                  Shop Now
                </button>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};