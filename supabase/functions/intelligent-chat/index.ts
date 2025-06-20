

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Função para detectar se é um prompt de geração de imagem
const isImageGenerationRequest = (content: string): boolean => {
  const imageKeywords = [
    'gere uma imagem', 'criar uma imagem', 'desenhe', 'ilustre',
    'faça uma imagem', 'generate an image', 'create an image', 'draw',
    'ilustrar', 'imagem de', 'foto de', 'picture of', 'image of',
    'visualizar', 'mostrar visualmente', 'criar visual'
  ];
  
  const lowerContent = content.toLowerCase();
  return imageKeywords.some(keyword => lowerContent.includes(keyword));
};

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

    const { messages, hasAttachments = false } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    // Verificar se a última mensagem é uma solicitação de geração de imagem
    const lastMessage = messages[messages.length - 1];
    const isImageRequest = lastMessage.role === 'user' && isImageGenerationRequest(lastMessage.content);

    if (isImageRequest) {
      // Gerar imagem usando OpenAI
      console.log('Gerando imagem para prompt:', lastMessage.content);
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: lastMessage.content,
          n: 1,
          size: '1024x1024',
          quality: 'high',
          output_format: 'png'
        }),
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.text();
        console.error('OpenAI Image API error:', errorData);
        throw new Error(`Erro na geração de imagem: ${imageResponse.statusText}`);
      }

      const imageData = await imageResponse.json();
      
      return new Response(JSON.stringify({
        message: 'Aqui está a imagem que você solicitou!',
        imageUrl: imageData.data[0].url,
        isImageGeneration: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Processar mensagens normais (chat de texto/análise)
    const processedMessages = messages.map((msg: any) => {
      const openAIMessage: any = {
        role: msg.role,
        content: []
      };

      // Adicionar conteúdo de texto
      if (msg.content && msg.content.trim()) {
        openAIMessage.content.push({
          type: 'text',
          text: msg.content
        });
      }

      // Adicionar anexos se existirem
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach((attachment: any) => {
          if (attachment.type === 'image' && attachment.base64) {
            openAIMessage.content.push({
              type: 'image_url',
              image_url: {
                url: attachment.base64,
                detail: 'high'
              }
            });
          } else if (attachment.type === 'document') {
            // Para documentos, adicionar como texto descritivo
            openAIMessage.content.push({
              type: 'text',
              text: `[Documento anexado: ${attachment.name}]`
            });
          }
        });
      }

      // Se não há conteúdo, adicionar placeholder
      if (openAIMessage.content.length === 0) {
        openAIMessage.content = 'Arquivo enviado';
      }

      return openAIMessage;
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Usar GPT-4o para suporte a visão
        messages: [
          {
            role: 'system',
            content: hasAttachments 
              ? 'Você é um assistente inteligente avançado com capacidade de análise de imagens e documentos. Forneça respostas detalhadas, precisas e úteis baseadas no texto e nos arquivos fornecidos. Quando analisar imagens, descreva o que você vê de forma detalhada. Para documentos, extraia e analise as informações relevantes. Responda sempre em português brasileiro.'
              : 'Você é um assistente inteligente avançado, similar ao ChatGPT Plus. Forneça respostas detalhadas, precisas e úteis. Você pode ajudar com análises, criação de conteúdo, programação, matemática, pesquisa e muito mais. Responda sempre em português brasileiro, a menos que especificamente solicitado em outro idioma. IMPORTANTE: Se o usuário solicitar geração de imagens, informe que deve usar palavras-chave como "gere uma imagem", "criar uma imagem", "desenhe" ou similares para ativar a funcionalidade de geração de imagens.'
          },
          ...processedMessages
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
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

