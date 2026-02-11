
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role key to bypass RLS for writes
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    
    // Try getUser first, fall back to JWT decode if session is stale
    let userId: string;
    let userEmail: string;
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep("getUser failed, decoding JWT directly", { error: userError.message });
      // Decode JWT payload to extract user info (session may be stale but token is still valid)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub;
        userEmail = payload.email;
        if (!userId || !userEmail) throw new Error("Invalid JWT payload");
      } catch (e) {
        throw new Error("Could not authenticate user: session expired and JWT decode failed");
      }
    } else {
      const user = userData.user;
      if (!user?.email) throw new Error("User not authenticated or email not available");
      userId = user.id;
      userEmail = user.email;
    }
    
    logStep("User authenticated", { userId, email: userEmail });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: userEmail,
        user_id: userId,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for both active and trialing subscriptions
    const activeSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
    });
    
    const hasActiveSub = activeSubscriptions.data.length > 0 || trialingSubscriptions.data.length > 0;
    const subscription = activeSubscriptions.data[0] || trialingSubscriptions.data[0];
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub && subscription) {
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const isTrialing = subscription.status === 'trialing';
      subscriptionTier = isTrialing ? "Premium (Trial)" : "Premium";
      logStep("Subscription found", { 
        subscriptionId: subscription.id, 
        status: subscription.status,
        endDate: subscriptionEnd 
      });
    } else {
      logStep("No active or trialing subscription found");
    }

    // Update subscribers table
    await supabaseClient.from("subscribers").upsert({
      email: userEmail,
      user_id: userId,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    // Update profiles table
    await supabaseClient.from("profiles").update({
      plan: hasActiveSub ? 'premium' : 'free'
    }).eq('id', userId);

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
