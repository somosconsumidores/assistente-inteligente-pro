
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
    const { documentId } = await req.json();
    
    if (!documentId) {
      throw new Error('Document ID é obrigatório');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Chaves de API não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar o documento
    const { data: document, error: docError } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error('Documento não encontrado');
    }

    console.log('Processando documento:', document.title);

    // Dividir o conteúdo em chunks (aproximadamente 1000 caracteres cada)
    const chunkSize = 1000;
    const chunks = [];
    const content = document.content;
    
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      chunks.push({
        text: chunk,
        index: Math.floor(i / chunkSize)
      });
    }

    console.log(`Criados ${chunks.length} chunks para processamento`);

    // Processar cada chunk e gerar embeddings
    for (const chunk of chunks) {
      try {
        // Gerar embedding usando OpenAI
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: chunk.text,
          }),
        });

        if (!embeddingResponse.ok) {
          console.error('Erro ao gerar embedding:', await embeddingResponse.text());
          continue;
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Salvar o chunk com embedding no banco
        const { error: insertError } = await supabase
          .from('knowledge_chunks')
          .insert({
            document_id: documentId,
            chunk_text: chunk.text,
            chunk_index: chunk.index,
            embedding: embedding
          });

        if (insertError) {
          console.error('Erro ao salvar chunk:', insertError);
        }
      } catch (error) {
        console.error('Erro ao processar chunk:', error);
      }
    }

    // Atualizar status do documento
    await supabase
      .from('knowledge_base')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', documentId);

    console.log('Documento processado com sucesso');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Documento processado com sucesso',
      chunksProcessed: chunks.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no processamento:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
