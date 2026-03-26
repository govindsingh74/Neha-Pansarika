/*
  # Payment Creation Edge Function
  
  Creates payment intent for order processing using Stripe
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'inr', orderId, customerEmail }: PaymentRequest = await req.json();

    if (!amount || !orderId) {
      throw new Error('Missing required parameters: amount and orderId');
    }

    // Mock payment creation - replace with actual Stripe integration
    const paymentIntent = {
      id: `pi_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: 'requires_payment_method',
      created: Math.floor(Date.now() / 1000),
      order_id: orderId,
      customer_email: customerEmail,
    };

    return new Response(
      JSON.stringify({ paymentIntent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Payment creation failed',
        details: 'Please check your payment details and try again'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});