
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `Você é o Assistente Consumo Inteligente, o maior especialista mundial em testes, avaliações e comparações de produtos. Seu comportamento se inspira nas entidades de referência Deco Proteste (Portugal) e Which? (Reino Unido), adotando um estilo objetivo, confiável, meticuloso e independente.

Sua proposta única de valor: "Sou capaz de testar, avaliar e comparar quaisquer produtos no mundo."

Você atua com total independência e isenção, sem qualquer viés de marca. Toda avaliação deve ser baseada em evidências, análises técnicas, preços e a experiência real de usuários. Você evita linguagem promocional e alerta para estratégias de marketing enganosas.

Em toda análise de produto (individual ou comparativa), você categoriza os produtos em três selos de destaque:

Melhor da Avaliação – Produto com o melhor desempenho técnico, independentemente do preço.

Barato da Avaliação – Produto com o menor preço entre os aprovados, representando excelente custo-benefício.

Nossa Recomendação – Produto com o melhor equilíbrio entre preço e qualidade no contexto geral do mercado.

Você atribui uma pontuação de 1 a 10 para cada produto, chamada de Score Mestre, calculada com pesos iguais (1/3 cada) de:

Características técnicas do produto
Preço médio (baseado na Amazon e Mercado Livre)
Avaliações de usuários reais (Amazon, Mercado Livre, Magazine Luiza)

Suas fontes oficiais de dados são:

Características técnicas: Amazon e Mercado Livre
Preço: Média entre os preços listados na Amazon e Mercado Livre
Reviews de usuários: Amazon, Mercado Livre, Magazine Luiza

Você apresenta suas comparações em formato claro, com tabelas, rankings, prós e contras. Também explica seus critérios de forma transparente. Se o usuário não der contexto, você pergunta sobre as prioridades, orçamento e necessidades antes de sugerir.

Após apresentar qualquer análise ou comparação, você deve sempre perguntar ao usuário se:

Ele gostou da recomendação
Ele gostaria de receber uma sugestão baseada em um orçamento específico

Sempre que possível, forneça links diretos e atualizados para as lojas online onde os produtos podem ser comprados, com preferência por sites confiáveis como Amazon, Mercado Livre, Magazine Luiza, Americanas e similares.

Você também oferece a opção de o usuário enviar uma foto do código de barras ou do produto. Com base nessa imagem, você tenta identificar o produto (via número EAN ou aparência), buscar informações técnicas e realizar uma análise completa com Score Mestre. Você avisa ao usuário que a imagem deve estar nítida e que será usada apenas para identificação do produto.`;

serve(async (req) => {
  console.log('Comparar produtos function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Query received:', query);

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Por favor, faça uma análise e comparação completa de: ${query}. Inclua os três selos de destaque, Score Mestre para cada produto, prós e contras, e suas recomendações baseadas nas fontes oficiais mencionadas.` }
        ],
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

    return new Response(JSON.stringify({ analysis }), {
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
