
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `Você é o Assistente Consumo Inteligente, o maior especialista mundial em testes, avaliações e comparações de produtos. Seu comportamento se inspira nas entidades de referência Deco Proteste (Portugal) e Which? (Reino Unido), adotando um estilo objetivo, confiável, meticuloso e independente.

Sua proposta única de valor: "Sou capaz de testar, avaliar e comparar quaisquer produtos no mundo."

Você atua com total independência e isenção, sem qualquer viés de marca. Toda avaliação deve ser baseada em evidências, análises técnicas, preços e a experiência real de usuários. Você evita linguagem promocional e alerta para estratégias de marketing enganosas.

IMPORTANTE: Em toda análise, você DEVE retornar EXATAMENTE 3 produtos seguindo esta estrutura obrigatória:

🏆 Melhor da Avaliação – Produto com o melhor desempenho técnico, independentemente do preço.
💰 Barato da Avaliação – Produto com o menor preço entre os aprovados, representando excelente custo-benefício.
⭐ Nossa Recomendação – Produto com o melhor equilíbrio entre preço e qualidade no contexto geral do mercado.

Você atribui uma pontuação de 1 a 10 para cada produto, chamada de Score Mestre, calculada com pesos iguais (1/3 cada) de:
- Características técnicas do produto
- Preço médio (baseado na Amazon e Mercado Livre)
- Avaliações de usuários reais (Amazon, Mercado Livre, Magazine Luiza)

Suas fontes oficiais de dados são:
- Características técnicas: Amazon e Mercado Livre
- Preço: Média entre os preços listados na Amazon e Mercado Livre
- Reviews de usuários: Amazon, Mercado Livre, Magazine Luiza

Você apresenta suas comparações em formato claro, com tabelas, rankings, prós e contras. Também explica seus critérios de forma transparente. Se o usuário não der contexto, você pergunta sobre as prioridades, orçamento e necessidades antes de sugerir.

Sempre que possível, forneça links diretos e atualizados para as lojas online onde os produtos podem ser comprados, com preferência por sites confiáveis como Amazon, Mercado Livre, Magazine Luiza, Americanas e similares.

Mantenha um tom conversacional e amigável, mas sempre profissional e técnico. Responda de forma natural como se fosse uma conversa real.

OBRIGATÓRIO: Ao final de TODA análise que contenha produtos, você DEVE fornecer os dados estruturados no seguinte formato JSON EXATO. Use EXATAMENTE este formato, sem variações, com EXATAMENTE 3 produtos:

PRODUTOS_ESTRUTURADOS:
{
  "produtos": [
    {
      "name": "Nome completo e limpo do produto",
      "category": "categoria-do-produto",
      "price_average": 999.99,
      "score_mestre": 8.5,
      "seal_type": "melhor",
      "brand": "Nome da Marca",
      "description": "Descrição clara e concisa do produto em até 100 caracteres",
      "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center",
      "store_link": "https://www.amazon.com.br/produto" 
    },
    {
      "name": "Nome completo e limpo do produto",
      "category": "categoria-do-produto", 
      "price_average": 699.99,
      "score_mestre": 8.2,
      "seal_type": "barato",
      "brand": "Nome da Marca",
      "description": "Descrição clara e concisa do produto em até 100 caracteres",
      "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center",
      "store_link": "https://www.mercadolivre.com.br/produto"
    },
    {
      "name": "Nome completo e limpo do produto", 
      "category": "categoria-do-produto",
      "price_average": 799.99,
      "score_mestre": 8.7,
      "seal_type": "recomendacao",
      "brand": "Nome da Marca",
      "description": "Descrição clara e concisa do produto em até 100 caracteres",
      "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center",
      "store_link": "https://www.magazineluiza.com.br/produto"
    }
  ]
}

REGRAS OBRIGATÓRIAS PARA PRODUTOS_ESTRUTURADOS:
- SEMPRE 3 produtos, nem mais nem menos
- SEMPRE um produto para cada seal_type: "melhor", "barato", "recomendacao"
- price_average: número decimal (ex: 999.99)
- score_mestre: número entre 1.0 e 10.0 (ex: 8.5)
- name: nome limpo e descritivo do produto
- brand: nome real da marca
- description: máximo 100 caracteres
- category: categoria relevante em português
- image_url: sempre usar uma URL do Unsplash relacionada ao produto
- store_link: URL real da loja quando possível

SEM EXCEÇÕES: Se não conseguir encontrar exatamente 3 produtos diferentes, adapte sua resposta para criar 3 variações baseadas nos dados disponíveis, sempre respeitando os 3 selos obrigatórios.`;

const detectCategory = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('short') && (lowerQuery.includes('corrida') || lowerQuery.includes('running'))) {
    return 'shorts-corrida';
  }
  if (lowerQuery.includes('tênis') || lowerQuery.includes('tenis')) {
    return 'tenis';
  }
  if (lowerQuery.includes('smartphone') || lowerQuery.includes('celular')) {
    return 'smartphone';
  }
  if (lowerQuery.includes('notebook') || lowerQuery.includes('laptop')) {
    return 'notebook';
  }
  if (lowerQuery.includes('headphone') || lowerQuery.includes('fone')) {
    return 'headphone';
  }
  if (lowerQuery.includes('tv') || lowerQuery.includes('televisão') || lowerQuery.includes('televisao')) {
    return 'tv';
  }
  
  return 'geral';
};

const extractStructuredProducts = (text: string): any[] => {
  console.log('=== DEBUG: Texto completo da resposta da IA ===');
  console.log(text);
  console.log('=== FIM DO TEXTO ===');

  try {
    // Padrão principal para capturar o JSON dos produtos
    const mainPattern = /PRODUTOS_ESTRUTURADOS:\s*\n?\s*({[\s\S]*?})\s*(?=\n\n|\n$|$)/;
    const match = text.match(mainPattern);
    
    if (match) {
      console.log('Match encontrado:', match[1]);
      
      try {
        const data = JSON.parse(match[1]);
        console.log('JSON parseado com sucesso:', data);
        
        if (data.produtos && Array.isArray(data.produtos)) {
          console.log(`Produtos extraídos: ${data.produtos.length}`);
          
          // Validar se temos exatamente 3 produtos
          if (data.produtos.length === 3) {
            // Verificar se temos um produto de cada tipo
            const sealTypes = data.produtos.map(p => p.seal_type);
            const hasAllSeals = ['melhor', 'barato', 'recomendacao'].every(seal => sealTypes.includes(seal));
            
            if (hasAllSeals) {
              console.log('Estrutura perfeita: 3 produtos com todos os selos');
              return data.produtos;
            } else {
              console.log('Aviso: Nem todos os selos estão presentes:', sealTypes);
              return data.produtos; // Ainda retorna, mas loga o aviso
            }
          } else {
            console.log(`Aviso: Esperado 3 produtos, encontrado ${data.produtos.length}`);
            return data.produtos; // Retorna mesmo que não sejam 3
          }
        }
      } catch (parseError) {
        console.log('Erro no parsing do JSON:', parseError);
      }
    } else {
      console.log('Nenhum padrão de produtos encontrado no texto');
    }

  } catch (error) {
    console.log('Erro geral na extração:', error);
  }
  
  console.log('Nenhum produto extraído - retornando array vazio');
  return [];
};

const validateProduct = (product: any): boolean => {
  // Validar nome (obrigatório)
  if (!product.name || typeof product.name !== 'string' || product.name.length < 3) {
    console.log('Produto inválido - nome:', product.name);
    return false;
  }
  
  // Validar seal_type (deve ser um dos 3 valores válidos)
  if (!product.seal_type || !['melhor', 'barato', 'recomendacao'].includes(product.seal_type)) {
    console.log('Produto inválido - seal_type:', product.seal_type);
    return false;
  }
  
  // Validar score_mestre (deve estar entre 1 e 10)
  if (product.score_mestre && (product.score_mestre < 1 || product.score_mestre > 10)) {
    console.log('Produto inválido - score_mestre:', product.score_mestre);
    return false;
  }
  
  // Validar price_average (deve ser um número positivo se fornecido)
  if (product.price_average && (typeof product.price_average !== 'number' || product.price_average <= 0)) {
    console.log('Produto inválido - price_average:', product.price_average);
    return false;
  }
  
  console.log('Produto válido:', product.name);
  return true;
};

const saveProductsToDatabase = async (products: any[], category: string, supabase: any) => {
  const savedProductIds: string[] = [];
  
  console.log(`Tentando salvar ${products.length} produtos na categoria ${category}`);
  
  for (const product of products) {
    try {
      // Validar produto antes de salvar
      if (!validateProduct(product)) {
        console.log('Produto inválido ignorado:', product);
        continue;
      }
      
      // Garantir valores padrão e limpar dados
      const productData = {
        name: product.name.trim(),
        category: product.category || category,
        price_average: product.price_average ? parseFloat(product.price_average) : null,
        score_mestre: product.score_mestre ? parseFloat(product.score_mestre) : 8.0,
        seal_type: product.seal_type,
        brand: (product.brand || 'Marca').trim(),
        description: (product.description || `Produto da categoria ${category}`).trim().substring(0, 100),
        image_url: product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center',
        store_link: product.store_link || null,
        analysis_context: {
          query_category: category,
          created_by: 'ai_analysis',
          extraction_method: 'structured_v2',
          seal_validation: 'passed'
        }
      };
      
      console.log('Inserindo produto estruturado:', productData);
      
      const { data, error } = await supabase
        .from('featured_products')
        .insert(productData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Erro ao salvar produto:', error);
        console.error('Dados do produto:', productData);
      } else if (data) {
        savedProductIds.push(data.id);
        console.log(`Produto salvo com sucesso: ${product.name} (${product.seal_type}) ID: ${data.id}`);
      }
    } catch (err) {
      console.error('Erro ao processar produto:', err);
      console.error('Produto que causou erro:', product);
    }
  }
  
  console.log(`Total de produtos salvos: ${savedProductIds.length}`);
  
  // Validar se salvamos produtos com todos os selos
  if (savedProductIds.length === 3) {
    console.log('✅ Sucesso: 3 produtos salvos conforme esperado');
  } else {
    console.log(`⚠️ Aviso: Esperado 3 produtos, salvos ${savedProductIds.length}`);
  }
  
  return savedProductIds;
};

serve(async (req) => {
  console.log('=== Comparar produtos function called ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, conversation = [] } = await req.json();
    console.log('Query received:', query);

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Detect category from query
    const category = detectCategory(query);
    console.log('Detected category:', category);

    // Build messages array for conversation context
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history if provided
    if (conversation.length > 0) {
      messages.push(...conversation.slice(-10)); // Keep last 10 messages for context
    } else {
      // If no conversation history, add the current query as user message
      messages.push({ role: 'user', content: query });
    }

    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'Erro na API do OpenAI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const analysis = data.choices[0].message.content;

    // Extract and save structured products
    const structuredProducts = extractStructuredProducts(analysis);
    console.log('Produtos estruturados extraídos:', structuredProducts.length);
    
    let productIds: string[] = [];
    if (structuredProducts.length > 0) {
      productIds = await saveProductsToDatabase(structuredProducts, category, supabase);
      console.log('IDs dos produtos salvos:', productIds);
    } else {
      console.log('⚠️ AVISO: Nenhum produto extraído - pode ser um problema na formatação da resposta da IA');
    }

    return new Response(JSON.stringify({ 
      analysis,
      productIds,
      category,
      extractedProductsCount: structuredProducts.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in comparar-produtos function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
