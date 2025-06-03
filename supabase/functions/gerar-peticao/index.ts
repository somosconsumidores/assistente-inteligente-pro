
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PeticaoData {
  nome: string;
  cpf: string;
  empresa: string;
  valor: string;
  relato: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, cpf, empresa, valor, relato }: PeticaoData = await req.json();

    console.log('Gerando petição para:', { nome, empresa, valor });

    const prompt = `Você é um advogado especialista em direito do consumidor. Gere uma petição inicial completa para o Juizado Especial Cível com base nos dados fornecidos.

DADOS DO CASO:
- Nome do autor: ${nome}
- CPF: ${cpf}
- Empresa requerida: ${empresa}
- Valor do dano: ${valor}
- Relato dos fatos: ${relato}

INSTRUÇÕES:
1. Crie uma petição inicial formal e profissional
2. Use a estrutura padrão: cabeçalho, qualificação das partes, dos fatos, do direito, dos pedidos
3. Inclua fundamentos legais do CDC (Código de Defesa do Consumidor)
4. Seja específico quanto aos direitos violados
5. Faça pedidos claros de indenização por danos materiais e morais
6. Use linguagem jurídica apropriada mas acessível
7. Inclua referências aos artigos relevantes do CDC

A petição deve estar pronta para protocolo no JEC.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um advogado especialista em direito do consumidor com vasta experiência em Juizados Especiais Cíveis. Sempre gere petições completas, formais e tecnicamente corretas.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const peticaoGerada = data.choices[0].message.content;

    console.log('Petição gerada com sucesso');

    return new Response(JSON.stringify({ 
      peticao: peticaoGerada,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao gerar petição:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro ao gerar petição. Tente novamente.',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
