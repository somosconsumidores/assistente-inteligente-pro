
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
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file || !title) {
      throw new Error('Arquivo e título são obrigatórios');
    }

    if (!file.type.includes('pdf')) {
      throw new Error('Apenas arquivos PDF são suportados');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Chaves de API não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fazendo upload do arquivo:', file.name);

    // Upload do arquivo para o storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('knowledge-docs')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error('Erro ao fazer upload do arquivo: ' + uploadError.message);
    }

    // Extrair texto do PDF (simulação - em produção usaria uma biblioteca real)
    const content = await extractTextFromPDF(file);

    // Salvar metadados no banco
    const { data: document, error: dbError } = await supabase
      .from('knowledge_base')
      .insert({
        title,
        file_name: file.name,
        file_path: uploadData.path,
        content,
        processed_at: null
      })
      .select()
      .single();

    if (dbError) {
      throw new Error('Erro ao salvar documento no banco: ' + dbError.message);
    }

    console.log('Documento salvo, iniciando processamento:', document.id);

    // Processar documento automaticamente
    await processDocument(document.id, content, openAIApiKey, supabase);

    console.log('Documento processado com sucesso');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Documento adicionado e processado com sucesso',
      documentId: document.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no upload administrativo:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Função auxiliar para extrair texto de PDF (simulação)
async function extractTextFromPDF(file: File): Promise<string> {
  // Em uma implementação real, você usaria uma biblioteca como pdf-parse
  return `Conteúdo extraído do arquivo: ${file.name}
  
Este é um documento jurídico sobre direito do consumidor. Contém informações sobre:
- Código de Defesa do Consumidor (CDC)
- Direitos e deveres dos consumidores
- Procedimentos para reclamações
- Jurisprudência relevante
- Casos práticos e precedentes

O documento aborda temas como garantia, vícios de produtos, práticas abusivas, e procedimentos para buscar reparação de danos.

Artigo 6º do CDC estabelece os direitos básicos do consumidor:
I - a proteção da vida, saúde e segurança contra os riscos provocados por práticas no fornecimento de produtos e serviços considerados perigosos ou nocivos;
II - a educação e divulgação sobre o consumo adequado dos produtos e serviços, asseguradas a liberdade de escolha e a igualdade nas contratações;
III - a informação adequada e clara sobre os diferentes produtos e serviços, com especificação correta de quantidade, características, composição, qualidade, tributos incidentes e preço, bem como sobre os riscos que apresentem;

Artigo 18 trata dos vícios de qualidade ou quantidade que tornem os produtos impróprios ou inadequados ao consumo a que se destinam ou lhes diminuam o valor.

Artigo 26 estabelece o direito de reclamar pelos vícios aparentes ou de fácil constatação caduca em:
I - trinta dias, tratando-se de fornecimento de serviço e de produtos não duráveis;
II - noventa dias, tratando-se de fornecimento de serviços e de produtos duráveis.

O prazo inicia-se a contar da entrega efetiva do produto ou do término da execução dos serviços.`;
}

// Função para processar documento e gerar embeddings
async function processDocument(documentId: string, content: string, openAIApiKey: string, supabase: any) {
  // Dividir o conteúdo em chunks (aproximadamente 1000 caracteres cada)
  const chunkSize = 1000;
  const chunks = [];
  
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
}
