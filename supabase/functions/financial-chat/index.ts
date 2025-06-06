
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
    const { message, conversation } = await req.json();

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
      ...conversation,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro na API da OpenAI');
    }

    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in financial-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
