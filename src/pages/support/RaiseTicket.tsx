import React, { useState, useEffect } from 'react';
import { Send, Paperclip, ArrowLeft, CheckCircle, MessageCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TicketForm {
  subject: string;
  message: string;
  category: string;
  priority: string;
}

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  resolution?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export const RaiseTicket: React.FC = () => {
  const [formData, setFormData] = useState<TicketForm>({
    subject: '',
    message: '',
    category: 'general_inquiry',
    priority: 'medium'
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [pastTickets, setPastTickets] = useState<Ticket[]>([]);
  const [showPastTickets, setShowPastTickets] = useState(false);

  useEffect(() => {
    loadPastTickets();
  }, []);

  const loadPastTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPastTickets(data || []);
    } catch (error) {
      console.error('Error loading past tickets:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please sign in to raise a support ticket');
      }

      // Upload attachments if any
      const attachmentUrls: string[] = [];
      for (const file of attachments) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ticket-attachments')
          .upload(fileName, file);

        if (uploadError) {
          console.error('File upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('ticket-attachments')
            .getPublicUrl(fileName);
          attachmentUrls.push(publicUrl);
        }
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          subject: formData.subject,
          message: formData.message,
          category: formData.category,
          priority: formData.priority,
          attachments: attachmentUrls,
          user_id: user.id
        })
        .select('ticket_number')
        .single();

      if (error) throw error;

      setTicketNumber(data.ticket_number);
      setSuccess(true);
      setFormData({
        subject: '',
        message: '',
        category: 'general_inquiry',
        priority: 'medium'
      });
      setAttachments([]);
      
      // Reload past tickets
      loadPastTickets();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Created Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your support ticket has been created and our team will review it shortly.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold">Your Ticket Number:</p>
              <p className="text-2xl font-bold text-green-600">{ticketNumber}</p>
              <p className="text-sm text-green-600 mt-1">
                Please save this ticket number for future reference.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setSuccess(false)}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Create Another Ticket
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Raise Support Ticket</h1>
          <p className="text-lg text-gray-600">
            Need help? Create a support ticket and our team will assist you
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Support Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Support Categories</h3>
              
              <div className="space-y-4">
                {[
                  { value: 'order_issue', label: 'Order Issues', icon: '📦', description: 'Problems with your orders' },
                  { value: 'payment_issue', label: 'Payment Issues', icon: '💳', description: 'Payment and billing problems' },
                  { value: 'product_issue', label: 'Product Issues', icon: '🛍️', description: 'Product quality or information' },
                  { value: 'delivery_issue', label: 'Delivery Issues', icon: '🚚', description: 'Shipping and delivery problems' },
                  { value: 'refund_issue', label: 'Refund Issues', icon: '💰', description: 'Refund and return requests' },
                  { value: 'technical_issue', label: 'Technical Issues', icon: '⚙️', description: 'Website or app problems' },
                  { value: 'general_inquiry', label: 'General Inquiry', icon: '❓', description: 'General questions and feedback' }
                ].map((category) => (
                  <div key={category.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{category.label}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Tickets */}
            {pastTickets.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Your Recent Tickets</h3>
                  <button
                    onClick={() => setShowPastTickets(!showPastTickets)}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    {showPastTickets ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showPastTickets && (
                  <div className="space-y-3">
                    {pastTickets.slice(0, 5).map((ticket) => (
                      <div key={ticket.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-gray-900">
                            {ticket.ticket_number}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1 line-clamp-2">{ticket.subject}</p>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(ticket.created_at)}</span>
                        </div>
                        {ticket.resolution && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800">
                            <strong>Resolution:</strong> {ticket.resolution}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ticket Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Create Support Ticket</h3>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="general_inquiry">General Inquiry</option>
                      <option value="order_issue">Order Issue</option>
                      <option value="payment_issue">Payment Issue</option>
                      <option value="product_issue">Product Issue</option>
                      <option value="delivery_issue">Delivery Issue</option>
                      <option value="refund_issue">Refund Issue</option>
                      <option value="technical_issue">Technical Issue</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority *
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce, or relevant order numbers..."
                  />
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Attach files to help us understand your issue better (Max 5 files, 10MB each)
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        Choose Files
                      </label>
                    </div>

                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Creating Ticket...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Create Ticket
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
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