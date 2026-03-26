import React from 'react';
import { Category } from '../../lib/supabase';

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  className = ""
}) => {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${className}`}
    >
      <div className="text-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-100 group-hover:scale-110 transition-transform duration-300">
            <img
              src={category.image_url || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg'}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-green-600/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
          {category.name}
        </h3>
        
        {category.description && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {category.description}
          </p>
        )}
        
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="inline-flex items-center text-green-600 font-medium text-sm">
            Shop Now
            <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};