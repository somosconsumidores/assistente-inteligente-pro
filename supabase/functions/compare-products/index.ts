
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Compare products function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body...');
    const { images } = await req.json();

    if (!images || images.length < 2) {
      console.error('Invalid request: insufficient images');
      return new Response(
        JSON.stringify({ error: 'Pelo menos 2 imagens são necessárias para comparação' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (images.length > 3) {
      console.error('Invalid request: too many images');
      return new Response(
        JSON.stringify({ error: 'Máximo de 3 produtos para comparação' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing ${images.length} images for comparison`);

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

    // Log payload sizes for debugging
    const payloadSizes = images.map((img: string, i: number) => {
      const size = img.length;
      console.log(`Image ${i + 1} size: ${size} characters`);
      return size;
    });
    console.log('Total payload size:', payloadSizes.reduce((a, b) => a + b, 0));

    // System prompt for product comparison
    const systemPrompt = `Você é um especialista em análise e comparação de produtos do varejo brasileiro. 
    Você receberá ${images.length} imagens de produtos e deve:

    1. Identificar cada produto (nome, marca, tipo, preço estimado)
    2. Analisar a qualidade de cada um baseado nos ingredientes/composição visível
    3. Comparar os produtos entre si em aspectos como:
       - Qualidade nutricional (se aplicável)
       - Custo-benefício
       - Ingredientes/composição
       - Marca e reputação
    4. Determinar o vencedor em cada categoria:
       - Melhor preço
       - Melhor qualidade
       - Melhor opção geral (custo-benefício)

    Responda em português brasileiro, de forma clara e útil para o consumidor.

    Estruture sua resposta em JSON com os campos:
    {
      "products": [
        {
          "name": "nome do produto",
          "brand": "marca",
          "price": "preço estimado",
          "analysis": "análise detalhada",
          "rating": número de 1-5
        }
      ],
      "comparison": {
        "winner_price": "nome do produto com melhor preço",
        "winner_quality": "nome do produto com melhor qualidade",
        "winner_overall": "nome do produto com melhor custo-benefício geral",
        "summary": "resumo da comparação e recomendação final"
      }
    }`;

    // Prepare content with multiple images
    const imageContent = images.map((image: string, index: number) => ({
      type: 'image_url',
      image_url: { url: image }
    }));

    const content = [
      {
        type: 'text',
        text: `Compare estes ${images.length} produtos nas imagens. Analise cada produto individualmente e depois compare entre eles, determinando o vencedor em cada categoria (preço, qualidade, geral).`
      },
      ...imageContent
    ];

    console.log('Making OpenAI API call...');
    
    // Call OpenAI Vision API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
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
              content: systemPrompt
            },
            {
              role: 'user',
              content: content
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('OpenAI API response received');

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        return new Response(
          JSON.stringify({ error: 'Erro na análise das imagens' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content;

      console.log('OpenAI response content length:', analysisText.length);

      // Try to parse JSON from the response
      let comparisonResult;
      try {
        // Extract JSON from the response if it's wrapped in markdown
        const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                         analysisText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const jsonString = jsonMatch[1] || jsonMatch[0];
          comparisonResult = JSON.parse(jsonString);
          console.log('Successfully parsed JSON response');
        } else {
          console.log('No JSON found in response, creating fallback');
          // Fallback if not in JSON format
          comparisonResult = {
            products: images.map((_: any, index: number) => ({
              name: `Produto ${index + 1}`,
              brand: 'Marca não identificada',
              price: 'Consulte preços locais',
              analysis: 'Análise não disponível no formato esperado',
              rating: 3
            })),
            comparison: {
              winner_price: 'Não determinado',
              winner_quality: 'Não determinado', 
              winner_overall: 'Não determinado',
              summary: analysisText
            }
          };
        }
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        // Fallback response
        comparisonResult = {
          products: images.map((_: any, index: number) => ({
            name: `Produto ${index + 1}`,
            brand: 'Marca não identificada',
            price: 'Consulte preços locais',
            analysis: 'Produto analisado pela IA',
            rating: 3
          })),
          comparison: {
            winner_price: 'Primeiro produto',
            winner_quality: 'Primeiro produto',
            winner_overall: 'Primeiro produto',
            summary: analysisText
          }
        };
      }

      console.log('Returning successful response');
      return new Response(
        JSON.stringify(comparisonResult),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('OpenAI API fetch error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Operação demorou muito. Tente novamente com imagens menores.' }),
          { 
            status: 408,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('Error in compare-products function:', error);
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
