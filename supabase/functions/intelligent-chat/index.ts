
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    // Verificar se o usuário tem plano premium
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('plan')
      .eq('id', userData.user.id)
      .single();

    if (profile?.plan !== 'premium') {
      return new Response(JSON.stringify({ 
        error: 'Esta funcionalidade é exclusiva para usuários premium',
        requiresUpgrade: true 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, stream = false } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente inteligente avançado, similar ao ChatGPT Plus. Forneça respostas detalhadas, precisas e úteis. Você pode ajudar com análises, criação de conteúdo, programação, matemática, pesquisa e muito mais. Responda sempre em português brasileiro, a menos que especificamente solicitado em outro idioma.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: stream
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    if (stream) {
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      message: data.choices[0].message.content,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in intelligent-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor'
    }), {
      status: error.message?.includes('premium') ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
