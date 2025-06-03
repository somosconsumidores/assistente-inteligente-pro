
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Chaves de API não configuradas');
    }

    console.log('Processando mensagem:', message);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Gerar embedding da pergunta do usuário
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: message,
      }),
    });

    let relevantContext = '';
    
    if (embeddingResponse.ok) {
      const embeddingData = await embeddingResponse.json();
      const queryEmbedding = embeddingData.data[0].embedding;

      // Buscar chunks relevantes na base de conhecimento
      const { data: relevantChunks, error: searchError } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 3
      });

      if (!searchError && relevantChunks && relevantChunks.length > 0) {
        relevantContext = '\n\nCONTEXTO DA BASE DE CONHECIMENTO:\n' + 
          relevantChunks.map((chunk: any) => 
            `- ${chunk.chunk_text.substring(0, 500)}...`
          ).join('\n');
        
        console.log('Contexto relevante encontrado:', relevantChunks.length, 'chunks');
      }
    }

    const systemPrompt = `Você é um advogado especialista em Direito do Consumidor brasileiro. Sua função é orientar consumidores sobre seus direitos com base no Código de Defesa do Consumidor (CDC) e legislação brasileira relacionada.

INSTRUÇÕES IMPORTANTES:
- Sempre cite os artigos específicos do CDC quando relevante
- Forneça orientações práticas e claras
- Explique os procedimentos passo a passo
- Mencione prazos legais quando aplicável
- Oriente sobre documentos necessários
- Seja empático e acolhedor com o consumidor
- Use linguagem clara e acessível, evitando juridiquês excessivo
- Sempre que possível, sugira tentativas de resolução amigável antes da via judicial
- Se houver informações da base de conhecimento, incorpore-as naturalmente na resposta

ÁREAS DE CONHECIMENTO:
- Vícios e defeitos em produtos e serviços
- Garantia legal e contratual
- Direito de arrependimento
- Práticas abusivas e propaganda enganosa
- Cobrança indevida e negativação irregular
- Relacionamento de consumo e fornecedores
- Juizado Especial Cível para causas consumeristas
- Órgãos de defesa do consumidor (Procon, etc.)

${relevantContext}

Responda sempre de forma profissional, precisa e útil.`;

    console.log('Enviando mensagem para OpenAI com contexto');

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
            content: systemPrompt
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
