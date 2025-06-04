
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para limpar e reparar JSON
const cleanAndRepairJSON = (content: string): string => {
  console.log('=== INÍCIO DA LIMPEZA DO JSON ===')
  console.log('Conteúdo original (primeiros 500 chars):', content.substring(0, 500))
  console.log('Tamanho total do conteúdo:', content.length)
  
  // Etapa 1: Limpeza básica
  let cleaned = content.trim()
  
  // Remover markdown se houver
  if (cleaned.includes('```json')) {
    console.log('Removendo marcadores markdown...')
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
  }
  
  // Etapa 2: Encontrar início e fim do JSON
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  
  console.log('Posição início JSON:', jsonStart)
  console.log('Posição fim JSON:', jsonEnd)
  
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    console.log('ERRO: Não foi possível encontrar delimitadores JSON válidos')
    throw new Error('JSON delimiters not found')
  }
  
  // Extrair apenas a parte JSON
  cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
  console.log('JSON extraído (primeiros 300 chars):', cleaned.substring(0, 300))
  
  // Etapa 3: Validar balanceamento de chaves
  let braceCount = 0
  let bracketCount = 0
  
  for (const char of cleaned) {
    if (char === '{') braceCount++
    if (char === '}') braceCount--
    if (char === '[') bracketCount++
    if (char === ']') bracketCount--
  }
  
  console.log('Balanço de chaves {}:', braceCount)
  console.log('Balanço de colchetes []:', bracketCount)
  
  // Etapa 4: Tentativas de reparo simples
  if (braceCount > 0) {
    console.log('Adicionando chaves de fechamento faltantes...')
    cleaned += '}'.repeat(braceCount)
  }
  
  if (bracketCount > 0) {
    console.log('Adicionando colchetes de fechamento faltantes...')
    cleaned += ']'.repeat(bracketCount)
  }
  
  console.log('JSON após reparo (primeiros 300 chars):', cleaned.substring(0, 300))
  console.log('=== FIM DA LIMPEZA DO JSON ===')
  
  return cleaned
}

// Função para validar estrutura do JSON
const validateItineraryStructure = (data: any): boolean => {
  console.log('=== VALIDAÇÃO DA ESTRUTURA ===')
  
  const requiredFields = ['titulo', 'dias']
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    console.log('Campos obrigatórios faltando:', missingFields)
    return false
  }
  
  if (!Array.isArray(data.dias)) {
    console.log('Campo "dias" não é um array')
    return false
  }
  
  // Validar cada dia
  for (let i = 0; i < data.dias.length; i++) {
    const dia = data.dias[i]
    if (!dia.atividades || !Array.isArray(dia.atividades)) {
      console.log(`Dia ${i + 1} não possui atividades válidas`)
      return false
    }
    
    if (dia.atividades.length === 0) {
      console.log(`Dia ${i + 1} não possui atividades`)
      return false
    }
  }
  
  console.log('Estrutura validada com sucesso')
  console.log('=== FIM DA VALIDAÇÃO ===')
  return true
}

// Função para parsing progressivo
const progressiveJSONParse = (content: string): any => {
  console.log('=== INÍCIO DO PARSING PROGRESSIVO ===')
  
  const strategies = [
    // Estratégia 1: Parse direto
    () => {
      console.log('Tentativa 1: Parse direto')
      return JSON.parse(content)
    },
    
    // Estratégia 2: Limpeza básica + parse
    () => {
      console.log('Tentativa 2: Limpeza básica + parse')
      const cleaned = cleanAndRepairJSON(content)
      return JSON.parse(cleaned)
    },
    
    // Estratégia 3: Remover caracteres problemáticos
    () => {
      console.log('Tentativa 3: Remoção de caracteres problemáticos')
      const cleaned = cleanAndRepairJSON(content)
      // Remover quebras de linha dentro de strings que podem causar problemas
      const fixed = cleaned.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ')
      return JSON.parse(fixed)
    },
    
    // Estratégia 4: Parse de partes válidas
    () => {
      console.log('Tentativa 4: Parse de partes válidas')
      const cleaned = cleanAndRepairJSON(content)
      
      // Tentar extrair pelo menos titulo e criar estrutura básica
      const titleMatch = cleaned.match(/"titulo":\s*"([^"]*)"/)
      const resumoMatch = cleaned.match(/"resumo":\s*"([^"]*)"/)
      
      if (titleMatch) {
        console.log('Título encontrado, criando estrutura mínima')
        return {
          titulo: titleMatch[1],
          resumo: resumoMatch ? resumoMatch[1] : 'Roteiro personalizado',
          custoEstimado: 'R$ 0',
          dicas: ['Estrutura básica criada devido a erro de parsing'],
          dias: []
        }
      }
      
      throw new Error('Não foi possível extrair informações básicas')
    }
  ]
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      const result = strategies[i]()
      console.log(`Estratégia ${i + 1} bem-sucedida`)
      return result
    } catch (error) {
      console.log(`Estratégia ${i + 1} falhou:`, error.message)
      if (i === strategies.length - 1) {
        throw error
      }
    }
  }
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

    // Função para gerar prompt melhorado
    const generateOptimizedPrompt = (destination: string, days: number, budget: string, travelersCount: number, travelStyle: string, preferences: string) => {
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
- Escolha regiões com características diferentes`
      }

      return `Você é um especialista em viagens. Crie um roteiro ÚNICO de ${days} dias para ${destination}.

DADOS DA VIAGEM:
- Destino: ${destination}
- ${budgetGuidance}
- Viajantes: ${travelersCount} ${travelersCount === 1 ? 'pessoa' : 'pessoas'}
- Estilo: ${travelStyle} (foque em: ${styleGuidance[travelStyle] || 'experiências autênticas'})
- Preferências: ${preferences || 'Experiências autênticas e locais'}

${regionInstructions}

FORMATO OBRIGATÓRIO - RESPONDA APENAS COM ESTE JSON VÁLIDO (sem markdown, sem texto adicional):

{
  "titulo": "Roteiro ${days} dias - ${destination}",
  "resumo": "Descrição em 60 caracteres",
  "custoEstimado": "R$ [valor]",
  "dicas": [
    "Dica 1 específica",
    "Dica 2 específica",
    "Dica 3 específica"
  ],
  "dias": [
    {
      "dia": 1,
      "titulo": "Dia 1 - Chegada e primeiros passos",
      "atividades": [
        {
          "horario": "09:00",
          "atividade": "Nome específico",
          "descricao": "Descrição detalhada",
          "custoEstimado": "R$ XX",
          "localizacao": "Local específico"
        },
        {
          "horario": "14:00",
          "atividade": "Nome específico",
          "descricao": "Descrição detalhada",
          "custoEstimado": "R$ XX",
          "localizacao": "Local específico"
        }
      ]
    }
  ]
}

CRÍTICO: Use informações reais de ${destination}. Retorne APENAS JSON válido sem formatação markdown.`
    }

    // Função para fazer chamada à OpenAI com retry
    const callOpenAIWithRetry = async (prompt: string, retries = 2) => {
      for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
          console.log(`=== TENTATIVA ${attempt} OPENAI ===`)

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
                  content: `Você é um especialista em viagens. Responda APENAS com JSON válido, sem markdown ou texto adicional. O JSON deve ter exatamente ${maxDays} dias de roteiro.`
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: maxDays <= 7 ? 3500 : maxDays <= 14 ? 5000 : 6000,
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
          console.log(`Resposta OpenAI recebida na tentativa ${attempt}`)
          console.log('Tamanho da resposta:', openaiData.choices[0].message.content.length)
          
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

    // Gerar prompt otimizado
    const prompt = generateOptimizedPrompt(destination, maxDays, budget, travelersCount, travelStyle, additionalPreferences)
    
    // Chamar OpenAI com retry
    let itineraryContent = await callOpenAIWithRetry(prompt)
    
    console.log('=== RESPOSTA COMPLETA DA OPENAI ===')
    console.log('Tamanho total:', itineraryContent.length)
    console.log('Conteúdo completo:', itineraryContent)
    console.log('=== FIM DA RESPOSTA ===')

    // Parse com sistema melhorado
    let itineraryData
    try {
      itineraryData = progressiveJSONParse(itineraryContent)
      
      // Validação da estrutura
      if (!validateItineraryStructure(itineraryData)) {
        throw new Error('Estrutura JSON inválida após parsing')
      }
      
    } catch (parseError) {
      console.error('=== ERRO CRÍTICO NO PARSING ===')
      console.error('Erro:', parseError)
      console.error('Conteúdo que causou erro:', itineraryContent)
      console.error('=== FIM DO ERRO ===')
      
      // Fallback inteligente melhorado
      console.log('Criando fallback inteligente para', destination)
      
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
          'Mantenha sempre um plano B para atividades dependentes do clima'
        ],
        dias: Array.from({ length: maxDays }, (_, i) => ({
          dia: i + 1,
          titulo: `Dia ${i + 1} - Explorando ${destination}`,
          atividades: fallbackActivities
        }))
      }
      console.log('Fallback criado com sucesso')
    }

    // Garantir que o número de dias está correto
    if (itineraryData.dias.length !== maxDays) {
      console.log(`Ajustando número de dias de ${itineraryData.dias.length} para ${maxDays}`)
      
      if (itineraryData.dias.length < maxDays) {
        // Adicionar dias faltantes
        for (let i = itineraryData.dias.length; i < maxDays; i++) {
          const dayNumber = i + 1
          
          itineraryData.dias.push({
            dia: dayNumber,
            titulo: `Dia ${dayNumber} - Continuando a exploração de ${destination}`,
            atividades: [
              {
                horario: '09:00',
                atividade: 'Café da manhã local',
                descricao: 'Comece o dia com energia para novas aventuras',
                custoEstimado: 'R$ 35',
                localizacao: destination
              },
              {
                horario: '11:00',
                atividade: 'Atividade cultural',
                descricao: 'Explore uma faceta diferente da região',
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
                atividade: 'Experiência local',
                descricao: 'Participe de uma atividade típica da região',
                custoEstimado: 'R$ 45',
                localizacao: destination
              },
              {
                horario: '19:00',
                atividade: 'Jantar especial',
                descricao: 'Celebre mais um dia de descobertas',
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
