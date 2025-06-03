
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Chave da API OpenAI não configurada');
    }

    console.log('Enviando mensagem para OpenAI:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um advogado especialista em Direito do Consumidor brasileiro. Sua função é orientar consumidores sobre seus direitos com base no Código de Defesa do Consumidor (CDC) e legislação brasileira relacionada.

INSTRUÇÕES IMPORTANTES:
- Sempre cite os artigos específicos do CDC quando relevante
- Forneça orientações práticas e claras
- Explique os procedimentos passo a passo
- Mencione prazos legais quando aplicável
- Oriente sobre documentos necessários
- Seja empático e acolhedor com o consumidor
- Use linguagem clara e acessível, evitando juridiquês excessivo
- Sempre que possível, sugira tentativas de resolução amigável antes da via judicial

ÁREAS DE CONHECIMENTO:
- Vícios e defeitos em produtos e serviços
- Garantia legal e contratual
- Direito de arrependimento
- Práticas abusivas e propaganda enganosa
- Cobrança indevida e negativação irregular
- Relacionamento de consumo e fornecedores
- Juizado Especial Cível para causas consumeristas
- Órgãos de defesa do consumidor (Procon, etc.)

Responda sempre de forma profissional, precisa e útil.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro da API OpenAI:', error);
      throw new Error(`Erro da API OpenAI: ${error.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log('Resposta recebida da OpenAI');

    const assistantReply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply: assistantReply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função direito-chat:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor',
      reply: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente em alguns instantes.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
