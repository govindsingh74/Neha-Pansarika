import React, { useState } from 'react';
import { Search, CreditCard, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RefundData {
  id: string;
  reference_number: string;
  order_id: string;
  refund_amount: number;
  refund_reason: string;
  refund_status: string;
  refund_method?: string;
  tracking_status: string;
  expected_completion_date?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  transaction_reference?: string;
  admin_notes?: string;
  order?: {
    order_number: string;
    total_amount: number;
  };
}

export const RefundTracking: React.FC = () => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refundData, setRefundData] = useState<RefundData | null>(null);

  const handleTrackRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRefundData(null);

    try {
      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .select(`
          *,
          order:orders(order_number, total_amount)
        `)
        .eq('reference_number', referenceNumber)
        .single();

      if (refundError || !refund) {
        throw new Error('Refund not found. Please check your reference number and try again.');
      }

      setRefundData(refund);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'initiated':
      case 'processing':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'approved':
      case 'transferred':
        return <CreditCard className="h-6 w-6 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'initiated': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-purple-600 bg-purple-100';
      case 'transferred': return 'text-indigo-600 bg-indigo-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRefundStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-green-600 bg-green-100';
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

  const getExpectedDays = (status: string) => {
    switch (status) {
      case 'initiated': return '1-2 business days';
      case 'processing': return '2-3 business days';
      case 'approved': return '3-5 business days';
      case 'transferred': return '1-2 business days';
      default: return 'Processing';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Refund</h1>
          <p className="text-lg text-gray-600">
            Enter your refund reference number to check the status of your refund
          </p>
        </div>

        {!refundData ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleTrackRefund} className="space-y-6">
              <div>
                <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Reference Number *
                </label>
                <input
                  type="text"
                  id="referenceNumber"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your refund reference number (e.g., REF20240101001)"
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
                    Tracking Refund...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Track Refund
                  </>
                )}
              </button>
            </form>

            {/* Refund Policy Info */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">Refund Processing Timeline</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Request Review:</span>
                  <span>1-2 business days</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing:</span>
                  <span>2-3 business days</span>
                </div>
                <div className="flex justify-between">
                  <span>Bank Transfer:</span>
                  <span>3-5 business days</span>
                </div>
                <div className="flex justify-between">
                  <span>Wallet Credit:</span>
                  <span>Instant</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Refund Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Refund Details</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getRefundStatusColor(refundData.refund_status)}`}>
                  {refundData.refund_status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Refund Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference Number:</span>
                      <span className="font-medium">{refundData.reference_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refund Amount:</span>
                      <span className="font-bold text-green-600 text-lg">{formatPrice(refundData.refund_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refund Method:</span>
                      <span className="font-medium capitalize">{refundData.refund_method?.replace('_', ' ') || 'Original Payment'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Request Date:</span>
                      <span className="font-medium">{formatDate(refundData.created_at)}</span>
                    </div>
                    {refundData.processed_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processed Date:</span>
                        <span className="font-medium">{formatDate(refundData.processed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Order Information</h3>
                  <div className="space-y-3 text-sm">
                    {refundData.order && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Number:</span>
                          <span className="font-medium">{refundData.order.order_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Original Amount:</span>
                          <span className="font-medium">{formatPrice(refundData.order.total_amount)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refund Reason:</span>
                      <span className="font-medium">{refundData.refund_reason}</span>
                    </div>
                    {refundData.transaction_reference && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction Ref:</span>
                        <span className="font-medium font-mono text-xs">{refundData.transaction_reference}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {refundData.admin_notes && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Admin Notes</h4>
                  <p className="text-blue-800 text-sm">{refundData.admin_notes}</p>
                </div>
              )}
            </div>

            {/* Tracking Status */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Status</h2>
              
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(refundData.tracking_status)}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 capitalize">
                      {refundData.tracking_status.replace('_', ' ')}
                    </h3>
                    <p className="text-gray-600">
                      {refundData.tracking_status === 'completed' 
                        ? 'Your refund has been processed successfully'
                        : `Expected completion: ${getExpectedDays(refundData.tracking_status)}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-8">
                  {[
                    { status: 'initiated', label: 'Refund Initiated', description: 'Your refund request has been received and is being reviewed' },
                    { status: 'processing', label: 'Processing', description: 'Your refund is being processed by our team' },
                    { status: 'approved', label: 'Approved', description: 'Your refund has been approved and is being prepared for transfer' },
                    { status: 'transferred', label: 'Transferred', description: 'Refund amount has been transferred to your account' },
                    { status: 'completed', label: 'Completed', description: 'Refund process completed successfully' }
                  ].map((step, index) => {
                    const isCompleted = ['initiated', 'processing', 'approved', 'transferred', 'completed'].indexOf(refundData.tracking_status) >= index;
                    const isCurrent = refundData.tracking_status === step.status;
                    
                    return (
                      <div key={step.status} className="relative flex items-start">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? isCurrent 
                              ? 'bg-green-500 text-white' 
                              : 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-current"></div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h4 className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.label}
                          </h4>
                          <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                          {isCurrent && refundData.expected_completion_date && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              Expected completion: {formatDate(refundData.expected_completion_date)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setRefundData(null);
                  setReferenceNumber('');
                  setEmail('');
                  setError(null);
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Track Another Refund
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