import React from 'react';
import { ArrowRight, Truck, Clock, Shield } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content - Left side */}
          <div className="space-y-8 z-20 relative">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Grab some{' '}
                <span className="text-green-600">yummy fruits</span>{' '}
                and enjoy{' '}
                <span className="text-green-600">free delivery!</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Get fresh groceries delivered to your doorstep within 30 minutes. 
                Quality products at the best prices, guaranteed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="inline-flex items-center px-8 py-4 border-2 border-green-600 text-green-600 font-semibold rounded-full hover:bg-green-50 transition-colors">
                Learn More
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Free Delivery</h3>
                <p className="text-sm text-gray-600">On orders above ₹500</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">30 Min Delivery</h3>
                <p className="text-sm text-gray-600">Lightning fast</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Quality</h3>
                <p className="text-sm text-gray-600">100% guaranteed</p>
              </div>
            </div>
          </div>

          {/* Hero Image - Right side with proper z-index */}
          <div className="relative z-10">
            <div className="relative">
              <div className="bg-white rounded-3xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg"
                  alt="Fresh groceries"
                  className="w-full h-80 object-cover rounded-2xl"
                />
                <div className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm transform rotate-12 z-20">
                  Fresh!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements - positioned independently with higher z-index to stay above */}
        <div className="absolute top-1/3 left-1/2 bg-white rounded-2xl p-4 shadow-lg animate-float z-30 hidden lg:block">
          <div className="flex items-center space-x-3">
            <img
              src="https://images.pexels.com/photos/2238309/pexels-photo-2238309.jpeg"
              alt="Bananas"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <p className="font-semibold text-sm">Fresh Bananas</p>
              <p className="text-green-600 font-bold">₹45/dozen</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/3 right-1/4 bg-white rounded-2xl p-4 shadow-lg animate-float-delayed z-30 hidden lg:block">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Truck className="h-8 w-8 text-green-600" />
            </div>
            <p className="font-semibold text-sm">Free Delivery</p>
            <p className="text-gray-500 text-xs">Above ₹500</p>
          </div>
        </div>
      </div>

      {/* Background decorations - lowest z-index */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-200 to-transparent rounded-full blur-3xl opacity-30 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-200 to-transparent rounded-full blur-3xl opacity-30 -z-10"></div>
    </section>
  );
};