
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, type } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Imagem é obrigatória' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Configuração da API não encontrada' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // System prompt for product analysis
    const systemPrompt = `Você é um especialista em análise de produtos do varejo brasileiro. 
    Quando receber uma imagem de um produto ou código de barras, você deve:

    1. Identificar o produto (nome, marca, tipo)
    2. Analisar a qualidade baseado nos ingredientes/composição visível
    3. Estimar um preço médio no mercado brasileiro
    4. Fornecer recomendações sobre:
       - Qualidade nutricional (se aplicável)
       - Custo-benefício
       - Alternativas similares
       - Pontos positivos e negativos

    Responda em português brasileiro, de forma clara e útil para o consumidor.
    Se não conseguir identificar o produto claramente, seja honesto sobre isso.

    Estruture sua resposta em JSON com os campos:
    - productName: string
    - brand: string
    - analysis: string (análise detalhada)
    - price: string (preço estimado)
    - recommendations: array de strings (lista de recomendações)
    - confidence: number (0-1, confiança na identificação)`;

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using GPT-4 with vision capabilities
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analise este produto na imagem. Se for um código de barras, tente identificar o produto e forneça uma análise baseada no que conseguir identificar.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Erro na análise da imagem' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    console.log('OpenAI response:', analysisText);

    // Try to parse JSON from the response
    let analysisResult;
    try {
      // Extract JSON from the response if it's wrapped in markdown
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                       analysisText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // Fallback if not in JSON format
        analysisResult = {
          productName: 'Produto Identificado',
          brand: '',
          analysis: analysisText,
          price: 'Consulte preços locais',
          recommendations: ['Verifique a data de validade', 'Compare preços em diferentes estabelecimentos'],
          confidence: 0.7
        };
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // Fallback response
      analysisResult = {
        productName: 'Produto Analisado',
        brand: '',
        analysis: analysisText,
        price: 'Consulte preços locais',
        recommendations: ['Análise gerada com base na imagem fornecida'],
        confidence: 0.5
      };
    }

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in analyze-product function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
