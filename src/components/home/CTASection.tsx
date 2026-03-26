import React from 'react';
import { ArrowRight, Download, Star, Shield, Zap } from 'lucide-react';

export const CTASection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-green-600 to-green-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Download App Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Download className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Download Our App</h3>
              <p className="text-gray-600">
                Get the best shopping experience with our mobile app. 
                Exclusive deals, faster checkout, and real-time order tracking.
              </p>
            </div>

            {/* App Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">Lightning fast delivery tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">Secure payments & data protection</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">Exclusive app-only offers</span>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-4">
              <button className="w-full bg-black text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-3">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2.01.77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </button>

              <button className="w-full bg-black text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-3">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile App Preview */}
          <div className="relative">
            <div className="text-center text-white mb-8">
              <h2 className="text-4xl font-bold mb-4">
                Order through our app and enjoy 
                <span className="text-green-200"> free delivery!</span>
              </h2>
              <p className="text-green-100 text-lg">
                Join thousands of happy customers who trust Pansarika for their daily grocery needs.
              </p>
            </div>

            {/* Mock Phone Interface */}
            <div className="relative max-w-sm mx-auto">
              <div className="bg-black rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Phone Screen */}
                  <div className="h-96 bg-gradient-to-br from-green-50 to-white p-6 relative">
                    {/* Mock App Interface */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-24 bg-green-500 rounded-full"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      </div>
                      
                      <div className="h-32 bg-gray-100 rounded-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-90"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <div className="text-center">
                            <div className="text-xl font-bold">Free Delivery</div>
                            <div className="text-sm">On orders above ₹500</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                        ))}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="h-16 bg-gray-100 rounded-xl flex items-center justify-between px-4">
                          <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                          <div className="h-4 w-20 bg-gray-300 rounded"></div>
                        </div>
                        <div className="h-16 bg-gray-100 rounded-xl flex items-center justify-between px-4">
                          <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                          <div className="h-4 w-20 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg animate-float">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm font-semibold">4.9 Rating</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg animate-float-delayed">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">30min</div>
                  <div className="text-xs text-gray-500">Delivery</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 text-center text-white">
              <div>
                <div className="text-3xl font-bold text-green-200">50K+</div>
                <div className="text-sm text-green-100">Happy Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-200">4.9</div>
                <div className="text-sm text-green-100">App Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-200">24/7</div>
                <div className="text-sm text-green-100">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};