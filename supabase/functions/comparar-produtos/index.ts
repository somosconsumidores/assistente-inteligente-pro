
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

Em toda análise de produto (individual ou comparativa), você categoriza os produtos em três selos de destaque:

🏆 Melhor da Avaliação – Produto com o melhor desempenho técnico, independentemente do preço.

💰 Barato da Avaliação – Produto com o menor preço entre os aprovados, representando excelente custo-benefício.

⭐ Nossa Recomendação – Produto com o melhor equilíbrio entre preço e qualidade no contexto geral do mercado.

Você atribui uma pontuação de 1 a 10 para cada produto, chamada de Score Mestre, calculada com pesos iguais (1/3 cada) de:

Características técnicas do produto
Preço médio (baseado na Amazon e Mercado Livre)
Avaliações de usuários reais (Amazon, Mercado Livre, Magazine Luiza)

Suas fontes oficiais de dados são:

Características técnicas: Amazon e Mercado Livre
Preço: Média entre os preços listados na Amazon e Mercado Livre
Reviews de usuários: Amazon, Mercado Livre, Magazine Luiza

Você apresenta suas comparações em formato claro, com tabelas, rankings, prós e contras. Também explica seus critérios de forma transparente. Se o usuário não der contexto, você pergunta sobre as prioridades, orçamento e necessidades antes de sugerir.

Sempre que possível, forneça links diretos e atualizados para as lojas online onde os produtos podem ser comprados, com preferência por sites confiáveis como Amazon, Mercado Livre, Magazine Luiza, Americanas e similares.

Você também oferece a opção de o usuário enviar uma foto do código de barras ou do produto. Com base nessa imagem, você tenta identificar o produto (via número EAN ou aparência), buscar informações técnicas e realizar uma análise completa com Score Mestre.

Mantenha um tom conversacional e amigável, mas sempre profissional e técnico. Responda de forma natural como se fosse uma conversa real.

IMPORTANTE: Ao final de sua análise, SEMPRE forneça os dados estruturados dos produtos avaliados no seguinte formato JSON exato. Use EXATAMENTE este formato, sem variações:

PRODUTOS_ESTRUTURADOS:
{
  "produtos": [
    {
      "name": "Nome limpo do produto",
      "category": "categoria-padronizada",
      "price_average": 99.99,
      "score_mestre": 8.5,
      "seal_type": "melhor",
      "brand": "Marca",
      "description": "Descrição breve",
      "image_url": "URL da imagem ou placeholder",
      "store_link": "URL da loja (opcional)"
    }
  ]
}`;

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
  
  return 'geral';
};

const extractStructuredProducts = (text: string): any[] => {
  console.log('=== DEBUG: Texto completo da resposta da IA ===');
  console.log(text);
  console.log('=== FIM DO TEXTO ===');

  try {
    // Múltiplas tentativas de extração com diferentes padrões
    const patterns = [
      /PRODUTOS_ESTRUTURADOS:\s*({[\s\S]*?})\s*(?=\n\n|\n$|$)/,
      /PRODUTOS_ESTRUTURADOS:\s*\n\s*({[\s\S]*?})\s*(?=\n\n|\n$|$)/,
      /PRODUTOS_ESTRUTURADOS:?\s*```json\s*({[\s\S]*?})\s*```/,
      /PRODUTOS_ESTRUTURADOS:?\s*```\s*({[\s\S]*?})\s*```/,
      /"produtos":\s*\[[\s\S]*?\]/
    ];

    for (let i = 0; i < patterns.length; i++) {
      console.log(`Tentativa ${i + 1} com padrão:`, patterns[i]);
      const match = text.match(patterns[i]);
      
      if (match) {
        console.log('Match encontrado:', match[1] || match[0]);
        
        try {
          let jsonStr = match[1] || match[0];
          
          // Se capturou apenas o array de produtos, envolver em objeto
          if (jsonStr.startsWith('"produtos":')) {
            jsonStr = `{${jsonStr}}`;
          }
          
          const data = JSON.parse(jsonStr);
          console.log('JSON parseado com sucesso:', data);
          
          if (data.produtos && Array.isArray(data.produtos)) {
            console.log(`Produtos extraídos: ${data.produtos.length}`);
            return data.produtos;
          }
        } catch (parseError) {
          console.log(`Erro no parsing da tentativa ${i + 1}:`, parseError);
          continue;
        }
      }
    }

    // Tentativa de parsing manual se JSON estruturado falhar
    console.log('Tentando parsing manual...');
    const manualProducts = tryManualExtraction(text);
    if (manualProducts.length > 0) {
      console.log('Parsing manual bem-sucedido:', manualProducts);
      return manualProducts;
    }

  } catch (error) {
    console.log('Erro geral na extração:', error);
  }
  
  console.log('Nenhum produto extraído - retornando array vazio');
  return [];
};

const tryManualExtraction = (text: string): any[] => {
  // Buscar por padrões específicos no texto
  const products: any[] = [];
  
  // Buscar por menções de produtos com preços e scores
  const lines = text.split('\n');
  let currentProduct: any = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detectar nomes de produtos (linhas com marcas conhecidas ou padrões)
    if (trimmed.includes('Score Mestre') || trimmed.includes('R$')) {
      // Tentar extrair informações básicas da linha
      const priceMatch = trimmed.match(/R\$\s*(\d+[.,]\d{2})/);
      const scoreMatch = trimmed.match(/(\d+[.,]\d+)\/10/);
      
      if (priceMatch || scoreMatch) {
        if (Object.keys(currentProduct).length > 0) {
          products.push(currentProduct);
        }
        
        currentProduct = {
          name: extractProductName(trimmed),
          price_average: priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : null,
          score_mestre: scoreMatch ? parseFloat(scoreMatch[1].replace(',', '.')) : 8.0,
          seal_type: 'recomendacao',
          category: 'geral',
          brand: extractBrand(trimmed),
          description: trimmed.substring(0, 100),
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center'
        };
      }
    }
  }
  
  if (Object.keys(currentProduct).length > 0) {
    products.push(currentProduct);
  }
  
  return products;
};

const extractProductName = (text: string): string => {
  // Remover preços e scores para tentar extrair o nome
  let cleaned = text.replace(/R\$\s*\d+[.,]\d{2}/g, '');
  cleaned = cleaned.replace(/\d+[.,]\d+\/10/g, '');
  cleaned = cleaned.replace(/Score Mestre/gi, '');
  cleaned = cleaned.trim();
  
  // Pegar as primeiras palavras significativas
  const words = cleaned.split(' ').filter(word => word.length > 2);
  return words.slice(0, 4).join(' ') || 'Produto Analisado';
};

const extractBrand = (text: string): string => {
  const brands = ['Samsung', 'Apple', 'Xiaomi', 'Motorola', 'Sony', 'JBL', 'Beats', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer'];
  for (const brand of brands) {
    if (text.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return 'Marca';
};

const validateProduct = (product: any): boolean => {
  // Validações básicas
  if (!product.name || typeof product.name !== 'string' || product.name.length < 3) {
    console.log('Produto inválido - nome:', product.name);
    return false;
  }
  
  if (!product.seal_type || !['melhor', 'barato', 'recomendacao'].includes(product.seal_type)) {
    console.log('Produto inválido - seal_type:', product.seal_type);
    return false;
  }
  
  if (product.score_mestre && (product.score_mestre < 1 || product.score_mestre > 10)) {
    console.log('Produto inválido - score_mestre:', product.score_mestre);
    return false;
  }
  
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
      
      // Garantir valores padrão
      const productData = {
        name: product.name,
        category: product.category || category,
        price_average: product.price_average || null,
        score_mestre: product.score_mestre || 8.0,
        seal_type: product.seal_type,
        brand: product.brand || 'Marca',
        description: product.description || `Produto da categoria ${category}`,
        image_url: product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center',
        store_link: product.store_link || null,
        analysis_context: {
          query_category: category,
          created_by: 'ai_analysis',
          extraction_method: 'structured'
        }
      };
      
      console.log('Inserindo produto:', productData);
      
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
        console.log('Produto salvo com sucesso:', product.name, 'ID:', data.id);
      }
    } catch (err) {
      console.error('Erro ao processar produto:', err);
      console.error('Produto que causou erro:', product);
    }
  }
  
  console.log(`Total de produtos salvos: ${savedProductIds.length}`);
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
        max_tokens: 2000,
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
      console.log('Nenhum produto extraído - não será salvo nada no banco');
    }

    return new Response(JSON.stringify({ 
      analysis,
      productIds,
      category 
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
