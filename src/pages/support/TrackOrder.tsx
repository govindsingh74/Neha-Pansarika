import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OrderTrackingData {
  order: {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: number;
    created_at: string;
    estimated_delivery?: string;
    delivered_at?: string;
    delivery_address: any;
  };
  tracking: Array<{
    id: string;
    status: string;
    message?: string;
    location?: string;
    created_at: string;
  }>;
  items: Array<{
    id: string;
    product_name: string;
    product_image?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export const TrackOrder: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      // First, create a tracking request record
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: trackingRequest, error: trackingError } = await supabase
        .from('order_tracking_requests')
        .insert({
          order_number: orderNumber,
          email: email,
          user_id: user?.id || null
        })
        .select('reference_number')
        .single();

      if (trackingError) throw trackingError;
      setReferenceNumber(trackingRequest.reference_number);

      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (orderError || !orderData) {
        // Update tracking request status
        await supabase
          .from('order_tracking_requests')
          .update({ status: 'not_found' })
          .eq('reference_number', trackingRequest.reference_number);
        
        throw new Error('Order not found. Please check your order number and try again.');
      }

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderData.id);

      if (itemsError) throw itemsError;

      // Fetch tracking information
      const { data: trackingInfo, error: trackingInfoError } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', orderData.id)
        .order('created_at', { ascending: true });

      if (trackingInfoError) throw trackingInfoError;

      const trackingData: OrderTrackingData = {
        order: orderData,
        tracking: trackingInfo || [],
        items: itemsData || []
      };

      setTrackingData(trackingData);

      // Update tracking request with found data
      await supabase
        .from('order_tracking_requests')
        .update({ 
          status: 'found',
          order_details: orderData,
          tracking_info: trackingInfo
        })
        .eq('reference_number', trackingRequest.reference_number);

    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'preparing':
        return <Package className="h-5 w-5 text-orange-500" />;
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'out_for_delivery': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-lg text-gray-600">
            Enter your order details to get real-time tracking information
          </p>
        </div>

        {!trackingData ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleTrackOrder} className="space-y-6">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number *
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your order number (e.g., ORD20240101001)"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter the email used for the order"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                  {referenceNumber && (
                    <p className="text-red-600 text-sm mt-1">
                      Reference Number: <strong>{referenceNumber}</strong>
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Tracking Order...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Track Order
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(trackingData.order.status)}`}>
                  {trackingData.order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Order Number:</span> <span className="font-medium">{trackingData.order.order_number}</span></p>
                    <p><span className="text-gray-600">Order Date:</span> {formatDate(trackingData.order.created_at)}</p>
                    <p><span className="text-gray-600">Total Amount:</span> <span className="font-medium">{formatPrice(trackingData.order.total_amount)}</span></p>
                    <p><span className="text-gray-600">Payment Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                        trackingData.order.payment_status === 'paid' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                      }`}>
                        {trackingData.order.payment_status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Delivery Information</h3>
                  <div className="space-y-2 text-sm">
                    {trackingData.order.estimated_delivery && (
                      <p><span className="text-gray-600">Estimated Delivery:</span> {formatDate(trackingData.order.estimated_delivery)}</p>
                    )}
                    {trackingData.order.delivered_at && (
                      <p><span className="text-gray-600">Delivered At:</span> {formatDate(trackingData.order.delivered_at)}</p>
                    )}
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-gray-600">
                        {typeof trackingData.order.delivery_address === 'object' ? (
                          <div>
                            <p>{trackingData.order.delivery_address.address_line_1}</p>
                            {trackingData.order.delivery_address.address_line_2 && (
                              <p>{trackingData.order.delivery_address.address_line_2}</p>
                            )}
                            <p>{trackingData.order.delivery_address.city}, {trackingData.order.delivery_address.state} {trackingData.order.delivery_address.postal_code}</p>
                          </div>
                        ) : (
                          <p>{trackingData.order.delivery_address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {trackingData.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.product_image || 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg'}
                        alt={item.product_name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: {formatPrice(item.unit_price)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(item.total_price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tracking Timeline</h2>
              
              {trackingData.tracking.length > 0 ? (
                <div className="space-y-6">
                  {trackingData.tracking.map((track, index) => (
                    <div key={track.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(track.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 capitalize">
                            {track.status.replace('_', ' ')}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {formatDate(track.created_at)}
                          </span>
                        </div>
                        {track.message && (
                          <p className="text-gray-600 mt-1">{track.message}</p>
                        )}
                        {track.location && (
                          <p className="text-sm text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {track.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tracking information available yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Tracking details will appear here once your order is processed.</p>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setTrackingData(null);
                  setOrderNumber('');
                  setEmail('');
                  setError(null);
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Track Another Order
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};