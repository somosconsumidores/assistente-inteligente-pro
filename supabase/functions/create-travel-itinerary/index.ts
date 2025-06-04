
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

    // Limitar o número máximo de dias para evitar respostas muito longas (máximo 14 dias)
    const maxDays = Math.min(days, 14)
    if (days > 14) {
      console.log(`Limitando roteiro de ${days} dias para ${maxDays} dias para evitar resposta muito longa`)
    }

    // Prompt mais detalhado considerando o número real de dias
    const prompt = `Você é um assistente especializado em criar roteiros de viagem personalizados. Crie um roteiro detalhado de ${maxDays} dias para ${destination}.

Dados da viagem:
- Destino: ${destination}
- Orçamento: ${budget ? `R$ ${budget}` : 'Flexível'}
- Pessoas: ${travelersCount}
- Estilo: ${travelStyle}
- Preferências: ${additionalPreferences || 'Nenhuma preferência específica'}

IMPORTANTE: O roteiro deve ter EXATAMENTE ${maxDays} dias.

RESPONDA APENAS com este JSON exato:
{
  "titulo": "Roteiro ${maxDays} dias - ${destination}",
  "resumo": "Resumo atrativo em até 60 caracteres",
  "custoEstimado": "R$ XXXX",
  "dicas": ["dica prática 1", "dica prática 2", "dica prática 3"],
  "dias": [
    {
      "dia": 1,
      "titulo": "Dia 1 - Título do dia",
      "atividades": [
        {
          "horario": "09:00",
          "atividade": "Nome da atividade",
          "descricao": "Descrição detalhada da atividade",
          "custoEstimado": "R$ XX",
          "localizacao": "Local específico"
        }
      ]
    }
  ]
}

Crie atividades variadas para cada dia (3-4 atividades por dia). Inclua sugestões de café da manhã, almoço, jantar e atividades turísticas. Seja específico com locais e horários realistas.`

    console.log('Chamando OpenAI...')

    // Chamar OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Você é um assistente especializado em roteiros de viagem. Responda APENAS com JSON válido, sem texto adicional antes ou depois. O roteiro deve ter exatamente ${maxDays} dias conforme solicitado.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    })

    if (!openaiResponse.ok) {
      console.error('Erro na OpenAI API:', openaiResponse.status, openaiResponse.statusText)
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    console.log('Resposta da OpenAI recebida')
    
    let itineraryContent = openaiData.choices[0].message.content
    console.log('Conteúdo bruto (primeiros 200 chars):', itineraryContent.substring(0, 200))

    // Limpeza do conteúdo
    itineraryContent = itineraryContent.trim()
    
    // Remover markdown se houver
    if (itineraryContent.includes('```json')) {
      itineraryContent = itineraryContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
    }
    
    // Remover qualquer texto antes do primeiro {
    const jsonStart = itineraryContent.indexOf('{')
    if (jsonStart > 0) {
      itineraryContent = itineraryContent.substring(jsonStart)
    }
    
    // Remover qualquer texto após o último }
    const jsonEnd = itineraryContent.lastIndexOf('}')
    if (jsonEnd > 0 && jsonEnd < itineraryContent.length - 1) {
      itineraryContent = itineraryContent.substring(0, jsonEnd + 1)
    }

    console.log('JSON limpo (primeiros 200 chars):', itineraryContent.substring(0, 200))

    // Parse com tratamento de erro robusto
    let itineraryData
    try {
      itineraryData = JSON.parse(itineraryContent)
    } catch (parseError) {
      console.error('Erro no parse JSON:', parseError)
      console.error('Conteúdo que causou erro:', itineraryContent)
      
      // Fallback: criar um roteiro simples manualmente
      itineraryData = {
        titulo: `Roteiro ${maxDays} dias - ${destination}`,
        resumo: `Viagem ${travelStyle.toLowerCase()} para ${destination}`,
        custoEstimado: budget ? `R$ ${budget}` : 'R$ 3000',
        dicas: [
          'Pesquise sobre a cultura local antes da viagem',
          'Verifique a documentação necessária',
          'Reserve acomodações com antecedência',
          'Tenha sempre um plano B para atividades ao ar livre'
        ],
        dias: Array.from({ length: maxDays }, (_, i) => ({
          dia: i + 1,
          titulo: `Dia ${i + 1} em ${destination}`,
          atividades: [
            {
              horario: '09:00',
              atividade: 'Café da manhã local',
              descricao: 'Explore a gastronomia da região',
              custoEstimado: 'R$ 50',
              localizacao: destination
            },
            {
              horario: '11:00',
              atividade: 'Atração turística principal',
              descricao: 'Visite pontos turísticos importantes',
              custoEstimado: 'R$ 100',
              localizacao: destination
            },
            {
              horario: '14:00',
              atividade: 'Almoço',
              descricao: 'Experimente pratos típicos da região',
              custoEstimado: 'R$ 80',
              localizacao: destination
            },
            {
              horario: '19:00',
              atividade: 'Jantar',
              descricao: 'Desfrute da culinária local',
              custoEstimado: 'R$ 120',
              localizacao: destination
            }
          ]
        }))
      }
      console.log('Usando roteiro fallback')
    }

    // Validar estrutura básica
    if (!itineraryData.titulo || !itineraryData.dias || !Array.isArray(itineraryData.dias)) {
      throw new Error('Estrutura do roteiro inválida')
    }

    // Garantir que o número de dias está correto
    if (itineraryData.dias.length !== maxDays) {
      console.log(`Ajustando número de dias de ${itineraryData.dias.length} para ${maxDays}`)
      
      if (itineraryData.dias.length < maxDays) {
        // Adicionar dias faltantes
        for (let i = itineraryData.dias.length; i < maxDays; i++) {
          itineraryData.dias.push({
            dia: i + 1,
            titulo: `Dia ${i + 1} em ${destination}`,
            atividades: [
              {
                horario: '09:00',
                atividade: 'Café da manhã',
                descricao: 'Comece o dia com energia',
                custoEstimado: 'R$ 50',
                localizacao: destination
              },
              {
                horario: '14:00',
                atividade: 'Atividade livre',
                descricao: 'Explore por conta própria',
                custoEstimado: 'R$ 100',
                localizacao: destination
              },
              {
                horario: '19:00',
                atividade: 'Jantar',
                descricao: 'Experimente a gastronomia local',
                custoEstimado: 'R$ 120',
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

    console.log(`Roteiro processado com sucesso - ${itineraryData.dias.length} dias`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        itineraryData,
        actualDays: days,
        generatedDays: maxDays
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
