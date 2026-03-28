import React, { useState, useEffect } from 'react';
import { Package, RotateCcw, X, Upload, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CancelReturnForm {
  requestType: string;
  orderNumber: string;
  reason: string;
  reasonCategory: string;
  description: string;
  refundMethod: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: Array<{
    id: string;
    product_name: string;
    product_image?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export const CancelReturn: React.FC = () => {
  const [formData, setFormData] = useState<CancelReturnForm>({
    requestType: 'cancel_order',
    orderNumber: '',
    reason: '',
    reasonCategory: 'changed_mind',
    description: '',
    refundMethod: 'original_payment'
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOrderSearch = async () => {
    if (!formData.orderNumber) return;

    setSearchingOrder(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please sign in to access your orders');
      }

      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', formData.orderNumber)
        .eq('user_id', user.id)
        .single();

      if (orderError || !orderData) {
        throw new Error('Order not found or you do not have access to this order');
      }

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderData.id);

      if (itemsError) throw itemsError;

      setOrder({
        ...orderData,
        items: itemsData || []
      });

      // Pre-select all items for cancellation
      if (formData.requestType === 'cancel_order') {
        setSelectedItems(itemsData?.map(item => item.id) || []);
      }

    } catch (error) {
      setError((error as Error).message);
      setOrder(null);
    } finally {
      setSearchingOrder(false);
    }
  };

  const handleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const calculateRefundAmount = () => {
    if (!order) return 0;
    
    if (formData.requestType === 'cancel_order') {
      return order.total_amount;
    }
    
    return order.items
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please sign in to submit a request');
      }

      if (!order) {
        throw new Error('Please search for your order first');
      }

      if (selectedItems.length === 0) {
        throw new Error('Please select at least one item');
      }

      // Upload images if any
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileName = `${Date.now()}-${image.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cancellation-images')
          .upload(fileName, image);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('cancellation-images')
            .getPublicUrl(fileName);
          imageUrls.push(publicUrl);
        }
      }

      const { data, error } = await supabase
        .from('cancellation_requests')
        .insert({
          request_type: formData.requestType,
          order_number: formData.orderNumber,
          order_item_ids: selectedItems,
          reason: formData.reason,
          reason_category: formData.reasonCategory,
          description: formData.description,
          images: imageUrls,
          refund_method: formData.refundMethod,
          refund_amount: calculateRefundAmount(),
          user_id: user.id
        })
        .select('reference_number')
        .single();

      if (error) throw error;

      setReferenceNumber(data.reference_number);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const canCancelOrder = (status: string) => {
    return ['pending', 'confirmed'].includes(status);
  };

  const canReturnOrder = (status: string) => {
    return ['delivered'].includes(status);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your {formData.requestType.replace('_', ' ')} request has been submitted and is being reviewed by our team.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold">Your Reference Number:</p>
              <p className="text-2xl font-bold text-green-600">{referenceNumber}</p>
              <p className="text-sm text-green-600 mt-1">
                Please save this reference number to track your request status.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    requestType: 'cancel_order',
                    orderNumber: '',
                    reason: '',
                    reasonCategory: 'changed_mind',
                    description: '',
                    refundMethod: 'original_payment'
                  });
                  setOrder(null);
                  setSelectedItems([]);
                  setImages([]);
                }}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Submit Another Request
              </button>
              <a
                href="/"
                className="block text-green-600 hover:text-green-700 font-medium"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cancel or Return Order</h1>
          <p className="text-lg text-gray-600">
            Submit a request to cancel your order or return items
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Request Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'cancel_order', label: 'Cancel Order', icon: X, description: 'Cancel entire order' },
                  { value: 'return_item', label: 'Return Items', icon: RotateCcw, description: 'Return specific items' },
                  { value: 'exchange_item', label: 'Exchange Items', icon: Package, description: 'Exchange for different items' }
                ].map(({ value, label, icon: Icon, description }) => (
                  <label key={value} className="relative">
                    <input
                      type="radio"
                      name="requestType"
                      value={value}
                      checked={formData.requestType === value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.requestType === value 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-6 w-6 ${
                          formData.requestType === value ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <h3 className="font-semibold text-gray-900">{label}</h3>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Search */}
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number *
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your order number"
                />
                <button
                  type="button"
                  onClick={handleOrderSearch}
                  disabled={searchingOrder || !formData.orderNumber}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {searchingOrder ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Order Details */}
            {order && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered' ? 'text-green-600 bg-green-100' :
                    order.status === 'cancelled' ? 'text-red-600 bg-red-100' :
                    'text-blue-600 bg-blue-100'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-semibold">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                  </div>
                </div>

                {/* Eligibility Check */}
                {formData.requestType === 'cancel_order' && !canCancelOrder(order.status) && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      This order cannot be cancelled as it is already {order.status}. 
                      You may be able to return items instead.
                    </p>
                  </div>
                )}

                {(formData.requestType === 'return_item' || formData.requestType === 'exchange_item') && !canReturnOrder(order.status) && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Items can only be returned after the order is delivered.
                    </p>
                  </div>
                )}

                {/* Item Selection */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {formData.requestType === 'cancel_order' ? 'Items to Cancel' : 'Select Items'}
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <label key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleItemSelection(item.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <img
                          src={item.product_image || 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg'}
                          alt={item.product_name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm font-semibold text-gray-900">{formatPrice(item.total_price)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="reasonCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason Category *
                </label>
                <select
                  id="reasonCategory"
                  name="reasonCategory"
                  value={formData.reasonCategory}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="changed_mind">Changed Mind</option>
                  <option value="wrong_item">Wrong Item Received</option>
                  <option value="damaged_item">Damaged Item</option>
                  <option value="late_delivery">Late Delivery</option>
                  <option value="quality_issue">Quality Issue</option>
                  <option value="size_issue">Size Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="refundMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Method *
                </label>
                <select
                  id="refundMethod"
                  name="refundMethod"
                  value={formData.refundMethod}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="original_payment">Original Payment Method</option>
                  <option value="wallet">Pansarika Wallet</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Reason *
              </label>
              <input
                type="text"
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Brief reason for your request"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Please provide additional details about your request..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload images to support your request (Max 5 images)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    Choose Images
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Refund Summary */}
            {order && selectedItems.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Refund Summary</h4>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Refund Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(calculateRefundAmount())}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Final refund amount may vary based on our return policy and item condition.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !order || selectedItems.length === 0}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Submitting Request...
                </>
              ) : (
                `Submit ${formData.requestType.replace('_', ' ')} Request`
              )}
            </button>
          </form>
        </div>

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