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

Se o usuário não der contexto, você pergunta sobre as prioridades, orçamento e necessidades antes de sugerir. Você apresenta os resultados em uma tabela com as seguintes colunas : Nome do Produto, Categoria, Preço Médio, Score Mestre, Selo de Avaliação. A tabela deve ter apenas 3 linhas, 1 para cada tipo de selo.

Sempre que possível, forneça links diretos e atualizados para as lojas online onde os produtos podem ser comprados, com preferência por sites confiáveis como Amazon, Mercado Livre, Magazine Luiza, Americanas e similares.

Você também oferece a opção de o usuário enviar uma foto do código de barras ou do produto. Com base nessa imagem, você tenta identificar o produto (via número EAN ou aparência), buscar informações técnicas e realizar uma análise completa com Score Mestre.

Mantenha um tom conversacional e amigável, mas sempre profissional e técnico. Responda de forma natural como se fosse uma conversa real.

IMPORTANTE: Ao final de sua análise, SEMPRE forneça os dados estruturados dos produtos avaliados no seguinte formato JSON:

PRODUTOS_ESTRUTURADOS: {
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

const extractTableProducts = (text: string): any[] => {
  try {
    console.log('Attempting to extract products from table format...');
    
    // Split text into lines and find table content
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Find lines that contain table data (with | separators)
    const tableLines = lines.filter(line => 
      line.includes('|') && 
      !line.match(/^[\s\-\|]+$/) && // Ignore header separator lines (only dashes, spaces, pipes)
      !line.toLowerCase().includes('nome do produto') // Ignore header line
    );
    
    console.log('Found table lines:', tableLines.length);
    
    const products: any[] = [];
    
    for (const line of tableLines) {
      const columns = line.split('|').map(col => col.trim()).filter(col => col.length > 0);
      
      if (columns.length >= 5) {
        const [name, category, priceStr, scoreStr, sealStr] = columns;
        
        // Extract numeric values
        const priceMatch = priceStr.match(/[\d,\.]+/);
        const scoreMatch = scoreStr.match(/[\d,\.]+/);
        
        const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;
        const score = scoreMatch ? parseFloat(scoreMatch[0].replace(',', '.')) : 0;
        
        // Map seal types
        let sealType = 'recomendacao';
        if (sealStr.toLowerCase().includes('melhor') || sealStr.includes('🏆')) {
          sealType = 'melhor';
        } else if (sealStr.toLowerCase().includes('barato') || sealStr.includes('💰')) {
          sealType = 'barato';
        } else if (sealStr.toLowerCase().includes('recomenda') || sealStr.includes('⭐')) {
          sealType = 'recomendacao';
        }
        
        const product = {
          name: name.replace(/[\*\#]+/g, '').trim(),
          category: category.toLowerCase().replace(/[\s\-]+/g, '-'),
          price_average: price,
          score_mestre: score,
          seal_type: sealType,
          brand: name.split(' ')[0], // First word as brand approximation
          description: `${name} - Produto avaliado pelo Consumo Inteligente`,
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center',
          store_link: null
        };
        
        products.push(product);
        console.log('Extracted product:', product.name, 'Seal:', product.seal_type);
      }
    }
    
    console.log('Total products extracted from table:', products.length);
    return products;
  } catch (error) {
    console.log('Error extracting table products:', error);
    return [];
  }
};

const extractStructuredProducts = (text: string): any[] => {
  try {
    // First try JSON extraction (backward compatibility)
    const regex = /PRODUTOS_ESTRUTURADOS:\s*({[\s\S]*?})\s*(?=\n\n|\n$|$)/;
    const match = text.match(regex);
    
    if (match) {
      const jsonStr = match[1];
      const data = JSON.parse(jsonStr);
      console.log('Extracted products from JSON format:', data.produtos?.length || 0);
      return data.produtos || [];
    }
  } catch (error) {
    console.log('JSON extraction failed, trying table extraction:', error);
  }
  
  // If JSON extraction fails, try table extraction
  return extractTableProducts(text);
};

const saveProductsToDatabase = async (products: any[], category: string, supabase: any) => {
  const savedProductIds: string[] = [];
  
  for (const product of products) {
    try {
      // Set default image if not provided
      const imageUrl = product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center';
      
      const { data, error } = await supabase
        .from('featured_products')
        .insert({
          name: product.name,
          category: product.category || category,
          price_average: product.price_average,
          score_mestre: product.score_mestre,
          seal_type: product.seal_type,
          brand: product.brand,
          description: product.description,
          image_url: imageUrl,
          store_link: product.store_link,
          analysis_context: {
            query_category: category,
            created_by: 'ai_analysis'
          }
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Erro ao salvar produto:', error);
      } else if (data) {
        savedProductIds.push(data.id);
        console.log('Produto salvo com sucesso:', product.name);
      }
    } catch (err) {
      console.error('Erro ao processar produto:', err);
    }
  }
  
  return savedProductIds;
};

serve(async (req) => {
  console.log('Comparar produtos function called');
  
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

    // Extract and save structured products (now supports both JSON and table formats)
    const structuredProducts = extractStructuredProducts(analysis);
    console.log('Extracted structured products:', structuredProducts);
    
    let productIds: string[] = [];
    if (structuredProducts.length > 0) {
      productIds = await saveProductsToDatabase(structuredProducts, category, supabase);
      console.log('Saved product IDs:', productIds);
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
