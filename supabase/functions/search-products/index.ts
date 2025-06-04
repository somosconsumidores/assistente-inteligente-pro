
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
    const { query } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Consulta de busca é obrigatória' }),
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

    // System prompt for product search recommendations
    const systemPrompt = `Você é um especialista em produtos do varejo brasileiro e deve ajudar consumidores a encontrar os melhores produtos.

    Quando o usuário buscar por um produto, você deve:

    1. Identificar a categoria do produto buscado
    2. Sugerir 3 opções específicas de produtos reais disponíveis no mercado brasileiro:
       - MELHOR CUSTO-BENEFÍCIO: Produto com melhor relação qualidade/preço
       - MELHOR SABOR/QUALIDADE: Produto premium em qualidade ou sabor
       - OPÇÃO PREMIUM: Produto de alta qualidade, mesmo que mais caro

    3. Para cada produto, forneça:
       - Nome exato e marca
       - Preço estimado (baseado no mercado brasileiro)
       - Por que é a melhor opção na categoria
       - Onde geralmente encontrar (redes de supermercado)

    4. Dar uma recomendação final explicando qual escolher dependendo do perfil do consumidor

    Responda sempre em português brasileiro, de forma prática e útil.

    Estruture sua resposta em JSON:
    {
      "category": "categoria do produto",
      "products": {
        "cost_benefit": {
          "name": "nome do produto",
          "brand": "marca",
          "price": "preço estimado",
          "reason": "por que é melhor custo-benefício",
          "where_to_find": "onde encontrar",
          "rating": número de 1-5
        },
        "best_quality": {
          "name": "nome do produto",
          "brand": "marca", 
          "price": "preço estimado",
          "reason": "por que tem melhor qualidade/sabor",
          "where_to_find": "onde encontrar",
          "rating": número de 1-5
        },
        "premium": {
          "name": "nome do produto",
          "brand": "marca",
          "price": "preço estimado", 
          "reason": "por que é premium",
          "where_to_find": "onde encontrar",
          "rating": número de 1-5
        }
      },
      "recommendation": "recomendação final sobre qual escolher e para que perfil de consumidor"
    }`;

    // Call OpenAI API
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
            content: `Busca por: ${query}. Me recomende 3 produtos específicos desta categoria no mercado brasileiro seguindo as categorias: melhor custo-benefício, melhor qualidade/sabor, e opção premium.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Erro na busca de produtos' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const searchResultText = data.choices[0].message.content;

    console.log('OpenAI search response:', searchResultText);

    // Try to parse JSON from the response
    let searchResult;
    try {
      // Extract JSON from the response if it's wrapped in markdown
      const jsonMatch = searchResultText.match(/```json\n([\s\S]*?)\n```/) || 
                       searchResultText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        searchResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // Fallback if not in JSON format
        searchResult = {
          category: 'Produto buscado',
          products: {
            cost_benefit: {
              name: 'Produto não encontrado',
              brand: 'N/A',
              price: 'Consulte preços locais',
              reason: 'Busca não retornou resultados estruturados',
              where_to_find: 'Supermercados em geral',
              rating: 3
            },
            best_quality: {
              name: 'Produto não encontrado',
              brand: 'N/A',
              price: 'Consulte preços locais',
              reason: 'Busca não retornou resultados estruturados',
              where_to_find: 'Supermercados em geral',
              rating: 3
            },
            premium: {
              name: 'Produto não encontrado',
              brand: 'N/A',
              price: 'Consulte preços locais',
              reason: 'Busca não retornou resultados estruturados',
              where_to_find: 'Supermercados em geral',
              rating: 3
            }
          },
          recommendation: searchResultText
        };
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // Fallback response
      searchResult = {
        category: 'Produto buscado',
        products: {
          cost_benefit: {
            name: 'Produto econômico',
            brand: 'Marca genérica',
            price: 'Consulte preços locais',
            reason: 'Análise realizada pela IA',
            where_to_find: 'Supermercados em geral',
            rating: 3
          },
          best_quality: {
            name: 'Produto de qualidade',
            brand: 'Marca reconhecida',
            price: 'Consulte preços locais',
            reason: 'Análise realizada pela IA',
            where_to_find: 'Supermercados em geral',
            rating: 4
          },
          premium: {
            name: 'Produto premium',
            brand: 'Marca premium',
            price: 'Consulte preços locais',
            reason: 'Análise realizada pela IA',
            where_to_find: 'Lojas especializadas',
            rating: 5
          }
        },
        recommendation: searchResultText
      };
    }

    return new Response(
      JSON.stringify(searchResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in search-products function:', error);
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
