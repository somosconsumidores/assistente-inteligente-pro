
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { destination, budget, departureDate, returnDate, travelersCount, travelStyle, additionalPreferences } = await req.json()

    console.log('Dados recebidos:', { destination, budget, departureDate, returnDate, travelersCount, travelStyle, additionalPreferences })

    // Validar dados obrigatórios
    if (!destination || !travelStyle || !travelersCount || !departureDate || !returnDate) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios faltando' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calcular número de dias baseado nas datas fornecidas
    const start = new Date(departureDate)
    const end = new Date(returnDate)
    const timeDiff = end.getTime() - start.getTime()
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    console.log('Número de dias calculado baseado nas datas:', days)

    // Validar se as datas fazem sentido
    if (days <= 0) {
      return new Response(
        JSON.stringify({ error: 'A data de volta deve ser posterior à data de ida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Aumentar o limite máximo de dias para 21 (3 semanas)
    const maxDays = Math.min(days, 21)
    if (days > 21) {
      console.log(`Limitando roteiro de ${days} dias para ${maxDays} dias para evitar resposta muito longa`)
    }

    // Função para gerar prompt personalizado baseado no destino
    const generatePersonalizedPrompt = (destination: string, days: number, budget: string, travelersCount: number, travelStyle: string, preferences: string) => {
      // Identificar se é um país grande que precisa de múltiplas cidades/regiões
      const largeCountries = ['china', 'brasil', 'estados unidos', 'eua', 'russia', 'india', 'canada', 'australia', 'argentina']
      const isLargeCountry = largeCountries.some(country => destination.toLowerCase().includes(country))
      
      const budgetGuidance = budget ? `Orçamento total: R$ ${budget}` : 'Orçamento flexível'
      const styleGuidance = {
        'Econômica': 'hostels, transporte público, comida local, atrações gratuitas/baratas',
        'Conforto': 'hotéis 3-4 estrelas, mix de transporte, restaurantes locais e alguns upscale',
        'Luxo': 'hotéis 5 estrelas, transfers privados, restaurantes premium, experiências exclusivas',
        'Aventura': 'atividades ao ar livre, esportes radicais, trilhas, experiências únicas',
        'Cultural': 'museus, monumentos históricos, festivais locais, experiências autênticas'
      }

      let regionInstructions = ''
      if (isLargeCountry && days > 7) {
        regionInstructions = `
IMPORTANTE: Como ${destination} é um destino extenso e você tem ${days} dias, distribua o roteiro entre 2-4 cidades/regiões principais. 
- Inclua informações sobre deslocamento entre cidades (tempo e meio de transporte)
- Dedique 3-5 dias para cada região principal
- Escolha regiões com características diferentes (ex: China: Beijing/Pequim histórica, Shanghai moderna, Guilin paisagens naturais)`
      }

      return `Você é um especialista em viagens com conhecimento profundo sobre ${destination}. Crie um roteiro ÚNICO e PERSONALIZADO de ${days} dias.

DADOS DA VIAGEM:
- Destino: ${destination}
- ${budgetGuidance}
- Viajantes: ${travelersCount} ${travelersCount === 1 ? 'pessoa' : 'pessoas'}
- Estilo: ${travelStyle} (foque em: ${styleGuidance[travelStyle] || 'experiências autênticas'})
- Preferências: ${preferences || 'Experiências autênticas e locais'}

${regionInstructions}

INSTRUÇÕES CRÍTICAS:
1. Crie atividades ESPECÍFICAS E REAIS para ${destination} - nada genérico
2. Use nomes reais de restaurantes, atrações, bairros e locais
3. Varie as atividades: cultural, gastronômica, natural, local
4. Inclua horários realistas e tempos de deslocamento
5. Custos condizentes com o estilo escolhido
6. Pelo menos 3-4 atividades diferentes por dia
7. Inclua experiências únicas/imperdíveis de ${destination}

RESPONDA APENAS com este JSON exato:
{
  "titulo": "Roteiro ${days} dias - ${destination}",
  "resumo": "Descrição atrativa específica do roteiro (máx 80 chars)",
  "custoEstimado": "R$ [valor realista baseado no estilo]",
  "dicas": [
    "Dica prática específica de ${destination}",
    "Dica cultural/comportamental local", 
    "Dica de economia/logística",
    "Dica sobre melhor época/clima"
  ],
  "dias": [
    {
      "dia": 1,
      "titulo": "Dia 1 - [Nome específico do que farão]",
      "atividades": [
        {
          "horario": "09:00",
          "atividade": "Nome específico da atividade",
          "descricao": "Descrição detalhada com informações práticas",
          "custoEstimado": "R$ XX",
          "localizacao": "Nome exato do local/endereço"
        }
      ]
    }
  ]
}

CRUCIAL: Use informações reais e específicas de ${destination}. Não crie um roteiro genérico!`
    }

    // Função para fazer chamada à OpenAI com retry
    const callOpenAIWithRetry = async (prompt: string, retries = 2) => {
      for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
          console.log(`Tentativa ${attempt} - Chamando OpenAI...`)

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: `Você é um especialista em viagens com amplo conhecimento mundial. Crie roteiros únicos e personalizados baseados em locais reais e específicos. NUNCA use informações genéricas. Responda APENAS com JSON válido, sem texto adicional. O roteiro deve ter exatamente ${maxDays} dias conforme solicitado.`
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.8, // Aumentar criatividade
              max_tokens: maxDays <= 7 ? 3500 : maxDays <= 14 ? 5000 : 6000, // Tokens baseados na duração
              top_p: 0.9
            })
          })

          if (!response.ok) {
            console.error(`Erro na OpenAI API (tentativa ${attempt}):`, response.status, response.statusText)
            if (attempt === retries + 1) {
              throw new Error(`OpenAI API error: ${response.statusText}`)
            }
            continue
          }

          const openaiData = await response.json()
          console.log(`Resposta da OpenAI recebida na tentativa ${attempt}`)
          
          return openaiData.choices[0].message.content
        } catch (error) {
          console.error(`Erro na tentativa ${attempt}:`, error)
          if (attempt === retries + 1) {
            throw error
          }
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    // Gerar prompt personalizado
    const prompt = generatePersonalizedPrompt(destination, maxDays, budget, travelersCount, travelStyle, additionalPreferences)
    
    // Chamar OpenAI com retry
    let itineraryContent = await callOpenAIWithRetry(prompt)
    
    console.log('Conteúdo bruto (primeiros 300 chars):', itineraryContent.substring(0, 300))

    // Limpeza mais robusta do conteúdo
    itineraryContent = itineraryContent.trim()
    
    // Remover markdown se houver
    if (itineraryContent.includes('```json')) {
      itineraryContent = itineraryContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
    }
    
    // Remover texto antes do JSON
    const jsonStart = itineraryContent.indexOf('{')
    if (jsonStart > 0) {
      itineraryContent = itineraryContent.substring(jsonStart)
    }
    
    // Remover texto após o JSON
    const jsonEnd = itineraryContent.lastIndexOf('}')
    if (jsonEnd > 0 && jsonEnd < itineraryContent.length - 1) {
      itineraryContent = itineraryContent.substring(0, jsonEnd + 1)
    }

    console.log('JSON limpo (primeiros 300 chars):', itineraryContent.substring(0, 300))

    // Parse com validação mais rigorosa
    let itineraryData
    try {
      itineraryData = JSON.parse(itineraryContent)
      
      // Validação da estrutura
      if (!itineraryData.titulo || !itineraryData.dias || !Array.isArray(itineraryData.dias)) {
        throw new Error('Estrutura JSON inválida - campos obrigatórios ausentes')
      }
      
      // Validar se cada dia tem atividades
      for (let i = 0; i < itineraryData.dias.length; i++) {
        const dia = itineraryData.dias[i]
        if (!dia.atividades || !Array.isArray(dia.atividades) || dia.atividades.length === 0) {
          throw new Error(`Dia ${i + 1} não possui atividades válidas`)
        }
      }
      
    } catch (parseError) {
      console.error('Erro no parse JSON:', parseError)
      console.error('Conteúdo que causou erro (primeiros 500 chars):', itineraryContent.substring(0, 500))
      
      // Fallback melhorado com informações específicas do destino
      console.log('Criando roteiro fallback personalizado para', destination)
      
      const isAsianCountry = ['china', 'japao', 'tailandia', 'coreia', 'vietnam'].some(country => destination.toLowerCase().includes(country))
      const isEuropeanCountry = ['franca', 'italia', 'espanha', 'alemanha', 'portugal', 'holanda'].some(country => destination.toLowerCase().includes(country))
      
      let fallbackActivities = []
      
      if (isAsianCountry) {
        fallbackActivities = [
          { horario: '08:00', atividade: 'Café da manhã tradicional', descricao: 'Experimente o café da manhã local em um mercado tradicional', custoEstimado: 'R$ 25', localizacao: 'Mercado local' },
          { horario: '10:00', atividade: 'Templo histórico principal', descricao: 'Visite o templo mais importante da região', custoEstimado: 'R$ 30', localizacao: 'Centro histórico' },
          { horario: '14:00', atividade: 'Almoço típico', descricao: 'Experimente pratos tradicionais em restaurante local', custoEstimado: 'R$ 45', localizacao: 'Restaurante tradicional' },
          { horario: '16:00', atividade: 'Jardim ou parque cultural', descricao: 'Relaxe em um jardim tradicional com vista panorâmica', custoEstimado: 'R$ 20', localizacao: 'Jardim tradicional' },
          { horario: '19:00', atividade: 'Jantar e vida noturna', descricao: 'Jante em área movimentada e explore a vida noturna local', custoEstimado: 'R$ 60', localizacao: 'Distrito de entretenimento' }
        ]
      } else if (isEuropeanCountry) {
        fallbackActivities = [
          { horario: '09:00', atividade: 'Café da manhã em café histórico', descricao: 'Comece o dia em um café centenário', custoEstimado: 'R$ 35', localizacao: 'Centro histórico' },
          { horario: '10:30', atividade: 'Museu principal', descricao: 'Visite o museu mais importante da cidade', custoEstimado: 'R$ 50', localizacao: 'Distrito cultural' },
          { horario: '13:00', atividade: 'Almoço em bistro', descricao: 'Experimente a culinária local em bistro tradicional', custoEstimado: 'R$ 65', localizacao: 'Bistro local' },
          { horario: '15:00', atividade: 'Passeio por bairro histórico', descricao: 'Explore arquitetura e ruas históricas a pé', custoEstimado: 'R$ 0', localizacao: 'Bairro histórico' },
          { horario: '19:00', atividade: 'Jantar típico', descricao: 'Jante em restaurante tradicional com especialidades regionais', custoEstimado: 'R$ 85', localizacao: 'Restaurante tradicional' }
        ]
      } else {
        // Atividades genéricas para outros destinos
        fallbackActivities = [
          { horario: '09:00', atividade: 'Café da manhã local', descricao: 'Experimente sabores típicos da região', custoEstimado: 'R$ 30', localizacao: destination },
          { horario: '11:00', atividade: 'Atração principal', descricao: 'Visite o ponto turístico mais importante', custoEstimado: 'R$ 50', localizacao: destination },
          { horario: '14:00', atividade: 'Almoço típico', descricao: 'Deguste pratos tradicionais da culinária local', custoEstimado: 'R$ 55', localizacao: destination },
          { horario: '16:00', atividade: 'Experiência cultural', descricao: 'Participe de atividade cultural autêntica', custoEstimado: 'R$ 40', localizacao: destination },
          { horario: '19:00', atividade: 'Jantar e entretenimento', descricao: 'Jante e explore a vida noturna local', custoEstimado: 'R$ 70', localizacao: destination }
        ]
      }
      
      itineraryData = {
        titulo: `Roteiro ${maxDays} dias - ${destination}`,
        resumo: `Viagem ${travelStyle.toLowerCase()} personalizada para ${destination}`,
        custoEstimado: budget ? `R$ ${budget}` : `R$ ${maxDays * 350}`,
        dicas: [
          `Pesquise sobre a cultura local de ${destination} antes da viagem`,
          'Verifique a documentação necessária e vacinas recomendadas',
          'Reserve acomodações com antecedência, especialmente na alta temporada',
          'Mantenha sempre um plano B para atividades dependentes do clima',
          'Aprenda algumas palavras básicas do idioma local'
        ],
        dias: Array.from({ length: maxDays }, (_, i) => ({
          dia: i + 1,
          titulo: `Dia ${i + 1} - Explorando ${destination}`,
          atividades: fallbackActivities
        }))
      }
      console.log('Usando roteiro fallback personalizado')
    }

    // Garantir que o número de dias está correto
    if (itineraryData.dias.length !== maxDays) {
      console.log(`Ajustando número de dias de ${itineraryData.dias.length} para ${maxDays}`)
      
      if (itineraryData.dias.length < maxDays) {
        // Adicionar dias faltantes com atividades variadas
        for (let i = itineraryData.dias.length; i < maxDays; i++) {
          const dayNumber = i + 1
          const isWeekend = dayNumber % 7 === 0 || dayNumber % 7 === 6
          
          itineraryData.dias.push({
            dia: dayNumber,
            titulo: `Dia ${dayNumber} - ${isWeekend ? 'Relaxamento e descobertas' : 'Exploração contínua'} em ${destination}`,
            atividades: [
              {
                horario: '09:00',
                atividade: isWeekend ? 'Café da manhã tardio' : 'Café da manhã energético',
                descricao: isWeekend ? 'Relaxe com um café da manhã mais demorado' : 'Comece o dia com energia para novas aventuras',
                custoEstimado: 'R$ 35',
                localizacao: destination
              },
              {
                horario: '11:00',
                atividade: `Atividade ${dayNumber % 3 === 0 ? 'cultural' : dayNumber % 3 === 1 ? 'gastronômica' : 'de natureza'}`,
                descricao: `Explore uma faceta diferente de ${destination}`,
                custoEstimado: 'R$ 60',
                localizacao: destination
              },
              {
                horario: '14:00',
                atividade: 'Almoço regional',
                descricao: 'Descubra novos sabores da culinária local',
                custoEstimado: 'R$ 50',
                localizacao: destination
              },
              {
                horario: '16:30',
                atividade: 'Experiência local única',
                descricao: 'Participe de uma atividade típica da região',
                custoEstimado: 'R$ 45',
                localizacao: destination
              },
              {
                horario: '19:00',
                atividade: 'Jantar especial',
                descricao: 'Celebre mais um dia de descobertas com um jantar memorável',
                custoEstimado: 'R$ 75',
                localizacao: destination
              }
            ]
          })
        }
      } else {
        // Remover dias extras
        itineraryData.dias = itineraryData.dias.slice(0, maxDays)
      }
    }

    console.log(`Roteiro processado com sucesso - ${itineraryData.dias.length} dias para ${destination}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        itineraryData,
        actualDays: days,
        generatedDays: maxDays,
        destination: destination
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função create-travel-itinerary:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
