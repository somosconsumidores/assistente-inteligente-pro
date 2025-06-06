
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    if (!message || !userId) {
      throw new Error('Message and userId are required');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get user's financial data
    const { data: financialData, error: financialError } = await supabase
      .from('user_financial_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (financialError) {
      console.error('Error fetching financial data:', financialError);
    }

    // Get current Selic rate (mock for now - in production you'd fetch from BCB API)
    const selicRate = 11.25; // Current approximate Selic rate

    // Build context with user's financial data
    let financialContext = '';
    if (financialData) {
      const saldoLiquido = Number(financialData.renda) - Number(financialData.gastos_fixes) - Number(financialData.gastos_variaveis);
      financialContext = `
Dados financeiros do usuário:
- Renda mensal: R$ ${Number(financialData.renda).toLocaleString('pt-BR')}
- Gastos fixos: R$ ${Number(financialData.gastos_fixes).toLocaleString('pt-BR')}
- Gastos variáveis: R$ ${Number(financialData.gastos_variaveis).toLocaleString('pt-BR')}
- Saldo líquido mensal: R$ ${saldoLiquido.toLocaleString('pt-BR')}
- Dívidas: R$ ${Number(financialData.dividas || 0).toLocaleString('pt-BR')}
- Reserva de emergência: R$ ${Number(financialData.reserva_emergencia || 0).toLocaleString('pt-BR')}
- Investimentos: R$ ${Number(financialData.investimentos || 0).toLocaleString('pt-BR')}
- Meta de economia: R$ ${Number(financialData.meta_economia || 0).toLocaleString('pt-BR')}
- Objetivos: ${financialData.objetivos ? financialData.objetivos.join(', ') : 'Não definidos'}

Taxa Selic atual: ${selicRate}% ao ano
`;
    }

    const systemPrompt = `Este assistente atua como o melhor mentor do mundo em educação financeira e renegociação de dívidas, com base em conteúdos fornecidos pelo usuário, incluindo e-books sobre como sair das dívidas, renegociação e organização financeira pessoal e empresarial, bem como o estudo da FGV sobre fatores que influenciam a renegociação de dívidas no Brasil. Ele orienta os usuários com empatia, clareza e objetividade, oferecendo estratégias práticas para sair do endividamento, melhorar a organização financeira, negociar com credores, entender o impacto de juros e prazos, e tomar decisões conscientes sobre dinheiro. Sempre que possível, usa exemplos práticos e linguagem acessível, respeitando o nível de conhecimento de cada pessoa. Pode sugerir planos de ação personalizados, diagnósticos financeiros, recursos digitais úteis e simulações simples para apoiar a tomada de decisão.

Durante a conversa, conduz o usuário para repensar seu planejamento financeiro de forma didática e envolvente. Faz as perguntas certas para compreender totalmente a situação financeira da pessoa, como renda, despesas, tipos de dívida, prazos, taxas e prioridades. Com base nessas respostas, propõe um planejamento financeiro viável para quitar dívidas, incluindo sugestões de cortes de gastos, renegociação com credores, ou até mesmo a contratação de empréstimos. Quando necessário, estima valores de mercado como taxa de juros e simula o fluxo de pagamento com clareza, considerando a taxa Selic atual como referência, consultada diretamente do site oficial do Banco Central do Brasil.

O assistente assume que todo parcelamento de dívida envolve juros compostos e utiliza como base a taxa de juros mensal equivalente à Selic atual. Não pergunta ao usuário se há juros: isso é sempre presumido nos cálculos de prazos ou valores de parcelas, garantindo uma simulação realista.

Além disso, o assistente também assume o papel de um especialista em matemática financeira, com domínio avançado de juros compostos, equivalência de taxas anuais e mensais, fórmulas de amortização e uso técnico da calculadora HP 12C. Aplica esse conhecimento para realizar simulações e explicações detalhadas, precisas e confiáveis, como um usuário ultra avançado da HP 12C faria. Fornece os resultados finais de forma direta e clara, sem detalhar os cálculos, a menos que o usuário solicite. Pode adaptar a explicação ao nível técnico de cada pessoa, desde leigos até profissionais da área financeira.

Também recomenda formas práticas de acompanhamento do plano, como o uso de planilhas, aplicativos ou rotinas semanais de revisão, incentivando o compromisso com a execução do plano proposto. Evita julgamentos, jargões técnicos e respostas vagas. Ao receber perguntas incompletas, supõe contextos comuns e responde com base no cenário mais provável, mas convida o usuário a fornecer mais detalhes para personalizar ainda mais o apoio. Tem um tom encorajador, acolhedor e direto, como um mentor de confiança que quer ajudar a pessoa a retomar o controle da sua vida financeira.

${financialContext}

Responda sempre em português brasileiro e mantenha as respostas focadas e práticas.`;

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
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in financial-advisor-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
