import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { TodaysBestDeals } from '../components/home/TodaysBestDeals';
import { FeaturedBrands } from '../components/home/FeaturedBrands';
import { TrendingProducts } from '../components/home/TrendingProducts';
import { DiscountCards } from '../components/home/DiscountCards';
import { BabyFoodCollection } from '../components/home/BabyFoodCollection';
import { HealthFoodSection } from '../components/home/HealthFoodSection';
import { OffersSection } from '../components/home/OffersSection';
import { CTASection } from '../components/home/CTASection';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CategoryGrid />
      <TodaysBestDeals />
      <FeaturedBrands />
      <TrendingProducts />
      <DiscountCards />
      <BabyFoodCollection />
      <HealthFoodSection />
      <OffersSection />
      <CTASection />
    </div>
  );
};