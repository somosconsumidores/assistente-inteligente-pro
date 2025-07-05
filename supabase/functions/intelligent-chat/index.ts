

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json; charset=utf-8',
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

// Função para detectar se é um prompt de transformação de imagem
const isImageTransformationRequest = (content: string, hasAttachments: boolean): boolean => {
  if (!hasAttachments) return false;
  
  const transformKeywords = [
    'transformar', 'converter', 'mudar para', 'no estilo', 'transform',
    'convert', 'change to', 'in the style of', 'make it look like',
    'transforme em', 'converta para', 'mude para', 'estilo pixar',
    'estilo cartoon', 'estilo realista', 'estilo 3d', 'como se fosse',
    'mudar', 'alterar', 'modificar', 'change', 'modify', 'alter',
    'deixar como', 'tornar', 'fazer parecer', 'aplicar estilo',
    'estilizar', 'redesenhar', 'recriar', 'versão', 'formato'
  ];
  
  const lowerContent = content.toLowerCase();
  console.log('Verificando transformação - Conteúdo:', lowerContent);
  console.log('Verificando transformação - Tem anexos:', hasAttachments);
  
  const isTransform = transformKeywords.some(keyword => lowerContent.includes(keyword));
  console.log('Verificando transformação - É transformação:', isTransform);
  return isTransform;
};

// Função para analisar imagem usando GPT-4o Vision
const analyzeImageWithVision = async (imageBase64: string): Promise<string> => {
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
          content: 'Você é um especialista em análise de imagens. Analise a imagem fornecida e forneça uma descrição extremamente detalhada, incluindo objetos, pessoas, poses, cores, composição, iluminação, ambiente, estilo visual atual, e qualquer detalhe relevante que ajudaria a recriar a essência da imagem em um estilo diferente.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta imagem em detalhes para que eu possa recriá-la em um estilo diferente, preservando todos os elementos importantes:'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro na análise da imagem: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
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

    const lastMessage = messages[messages.length - 1];
    const isImageRequest = lastMessage.role === 'user' && isImageGenerationRequest(lastMessage.content) && !hasAttachments;
    
    console.log('Debug - Última mensagem:', lastMessage.content);
    console.log('Debug - Tem anexos:', hasAttachments);
    console.log('Debug - É solicitação de imagem:', isImageRequest);
    console.log('Debug - Anexos da mensagem:', lastMessage.attachments?.length || 0);

    // Verificar se há imagem anexada para transformação
    const hasImageAttachment = lastMessage.attachments?.some((att: any) => att.type === 'image' && att.base64);
    
    // Processar transformação de imagem (qualquer solicitação com imagem anexada)
    if (hasImageAttachment) {
      console.log('Processando transformação de imagem para prompt:', lastMessage.content);
      
      // Encontrar a imagem anexada
      const imageAttachment = lastMessage.attachments?.find((att: any) => att.type === 'image' && att.base64);
      
      if (!imageAttachment) {
        throw new Error('Nenhuma imagem encontrada para transformação');
      }

      try {
        // Analisar a imagem original usando GPT-4o Vision primeiro
        console.log('Analisando imagem original para edição precisa...');
        const imageAnalysis = await analyzeImageWithVision(imageAttachment.base64);
        console.log('Análise da imagem:', imageAnalysis);

        // Criar prompt específico para edição preservando elementos originais
        const editPrompt = `Baseado na imagem fornecida: ${imageAnalysis}

INSTRUÇÃO DE EDIÇÃO: ${lastMessage.content}

IMPORTANTE: Mantenha EXATAMENTE a mesma pessoa, pose, expressão facial, composição, iluminação e todos os outros elementos visuais. Faça APENAS a alteração solicitada: ${lastMessage.content}. Preserve todos os outros aspectos da imagem original.`;

        console.log('Prompt de edição:', editPrompt);

        // Usar DALL-E 3 com prompt muito específico para edição
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: editPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd'
          }),
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.text();
          console.error('OpenAI Image API error:', errorData);
          throw new Error(`Erro na transformação de imagem: ${imageResponse.statusText}`);
        }

        const imageData = await imageResponse.json();
        
        return new Response(JSON.stringify({
          message: 'Aqui está sua imagem transformada! Analisei a imagem original e a recriei no estilo solicitado.',
          imageUrl: imageData.data[0].url,
          isImageGeneration: true,
          isTransformation: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (analysisError) {
        console.error('Erro na análise da imagem:', analysisError);
        
        // Fallback para o método anterior se a análise falhar
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `Create an image based on this request: ${lastMessage.content}. Make it high quality and detailed.`,
            n: 1,
            size: '1024x1024',
            quality: 'hd'
          }),
        });

        if (!imageResponse.ok) {
          throw new Error(`Erro na transformação de imagem: ${imageResponse.statusText}`);
        }

        const imageData = await imageResponse.json();
        
        return new Response(JSON.stringify({
          message: 'Aqui está sua imagem transformada.',
          imageUrl: imageData.data[0].url,
          isImageGeneration: true,
          isTransformation: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

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
          model: 'dall-e-3',
          prompt: lastMessage.content,
          n: 1,
          size: '1024x1024',
          quality: 'hd'
        }),
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.text();
        console.error('OpenAI Image API error:', errorData);
        throw new Error(`Erro na geração de imagem: ${imageResponse.statusText}`);
      }

      const imageData = await imageResponse.json();
      
      return new Response(JSON.stringify({
        message: 'Aqui está sua imagem!',
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

      if (msg.content && msg.content.trim()) {
        openAIMessage.content.push({
          type: 'text',
          text: msg.content
        });
      }

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
            openAIMessage.content.push({
              type: 'text',
              text: `[Documento anexado: ${attachment.name}]`
            });
          }
        });
      }

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
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: hasAttachments 
              ? 'Você é um assistente de IA avançado equivalente ao ChatGPT Plus. Você tem capacidade de análise de imagens, documentos (PDF, Word, Excel, CSV, texto), criação de conteúdo, programação, matemática, pesquisa e muito mais. Quando receber arquivos, analise-os de forma detalhada e responda com base no conteúdo. Para imagens, descreva o que vê e analise conforme solicitado. Para documentos, extraia informações relevantes, faça resumos, análises ou responda perguntas específicas. Para planilhas/CSV, analise dados, identifique padrões, faça cálculos se necessário. Seja versátil e adaptável ao que o usuário precisa. Responda sempre em português brasileiro de forma clara e útil.'
              : 'Você é um assistente de IA avançado equivalente ao ChatGPT Plus. Você pode ajudar com: análise e criação de conteúdo, programação e debug de código, matemática e cálculos, pesquisa e explicações, geração e transformação de imagens, análise de dados, escrita criativa e técnica, tradução, educação e tutoria, resolução de problemas, e muito mais. Seja versátil, criativo e útil. Adapte-se ao que o usuário precisa. Responda sempre em português brasileiro de forma clara e detalhada, a menos que especificamente solicitado em outro idioma.'
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
    
    // Garantir que a resposta seja tratada como UTF-8
    const messageContent = data.choices[0].message.content || '';
    
    return new Response(JSON.stringify({
      message: messageContent,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    });

  } catch (error) {
    console.error('Error in intelligent-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor'
    }), {
      status: error.message?.includes('premium') ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
});

