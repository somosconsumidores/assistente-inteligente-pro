
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Financial chat request received');
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { message, conversation } = requestBody;
    
    if (!message) {
      console.error('Missing message in request');
      throw new Error('Mensagem é obrigatória');
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('Chave da API OpenAI não configurada');
    }

    const systemPrompt = `Você é um consultor financeiro pessoal especializado e experiente. Seu papel é:

1. Analisar a situação financeira do usuário com base nos dados fornecidos
2. Fornecer conselhos práticos e personalizados sobre:
   - Gestão de orçamento e controle de gastos
   - Estratégias de economia e investimento
   - Quitação de dívidas
   - Planejamento financeiro de curto e longo prazo
   - Reserva de emergência
   - Diversificação de investimentos

3. Dar respostas claras, didáticas e motivadoras
4. Usar exemplos práticos e específicos do Brasil
5. Sempre considerar o perfil de risco e objetivos do usuário
6. Ser empático e encorajador, mas realista

Mantenha suas respostas concisas (máximo 150 palavras) e focadas na situação específica do usuário.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversation || []),
      { role: 'user', content: message }
    ];

    console.log('Sending messages to OpenAI:', messages.length, 'messages');
    console.log('Last user message:', message);

    // Criar um AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('OpenAI response status:', response.status);
    
    const data = await response.json();
    console.log('OpenAI response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('OpenAI API error:', data.error);
      throw new Error(data.error?.message || 'Erro na API da OpenAI');
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure');
      throw new Error('Resposta inválida da OpenAI');
    }

    const reply = data.choices[0].message.content;
    console.log('Generated reply:', reply);

    if (!reply) {
      console.error('Empty reply from OpenAI');
      throw new Error('Resposta vazia da OpenAI');
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json; charset=utf-8'
      },
    });
  } catch (error) {
    console.error('Error in financial-chat function:', error);
    
    let errorMessage = 'Erro interno do servidor';
    let userMessage = 'Desculpe, ocorreu um erro técnico. Tente novamente em alguns momentos.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Tratamento específico para timeout
      if (error.name === 'AbortError') {
        userMessage = 'A solicitação demorou muito para ser processada. Tente novamente.';
        errorMessage = 'Timeout na requisição OpenAI';
      }
      // Tratamento específico para erro de rede
      else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        userMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
        errorMessage = 'Erro de rede';
      }
      // Tratamento específico para erro da OpenAI
      else if (error.message.includes('OpenAI')) {
        userMessage = 'Serviço temporariamente indisponível. Tente novamente em instantes.';
      }
    }
    
    // Retorna uma resposta de erro mais amigável
    return new Response(JSON.stringify({ 
      error: errorMessage,
      reply: userMessage 
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json; charset=utf-8'
      },
    });
  }
});
