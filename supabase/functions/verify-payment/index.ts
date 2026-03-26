/*
  # Payment Verification Edge Function
  
  Verifies payment status and updates order
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VerifyPaymentRequest {
  paymentIntentId: string;
  orderId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { paymentIntentId, orderId }: VerifyPaymentRequest = await req.json();

    if (!paymentIntentId || !orderId) {
      throw new Error('Missing required parameters: paymentIntentId and orderId');
    }

    // Mock payment verification - replace with actual Stripe verification
    const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate for demo

    if (isPaymentSuccessful) {
      // Update order status to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          payment_id: paymentIntentId,
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        throw new Error(`Failed to update order: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Payment verified successfully',
          paymentStatus: 'paid',
          orderStatus: 'confirmed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } else {
      // Update order status to failed
      await supabase
        .from('orders')
        .update({ 
          payment_status: 'failed',
          payment_id: paymentIntentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Payment verification failed',
          paymentStatus: 'failed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Payment verification failed',
        details: 'Please contact support if the issue persists'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});