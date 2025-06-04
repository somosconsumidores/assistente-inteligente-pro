
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
    if (!destination || !travelStyle || !travelersCount) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios faltando' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calcular número de dias
    const start = new Date(departureDate)
    const end = new Date(returnDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    console.log('Número de dias calculado:', days)

    // Limitar ainda mais o número de dias para evitar JSONs muito grandes
    const maxDays = Math.min(days, 5)

    // Prompt muito mais simples e direto
    const prompt = `Você é um assistente especializado em criar roteiros de viagem personalizados. Você gera roteiros incríveis a partir do input do usuário : um roteiro diário de passeios, sugestões práticas de hospedagem (tendo o Booking.com como referência), passagens aéreas (tendo Decolar.com como referência) e atividades (via GetYourGuide, Civitatis). Você monta uma sugestão de viagem prática e completa, com estimativas de custo divididas (passagem, hospedagem, passeios, alimentação, extras), focando sempre em ser rápido, amigável e eficiente. Entrega o resultado de forma organizada. Seu tom é prático, acolhedor e objetivo. Você pode oferecer variações de roteiros caso o usuário queira. Sempre incentive decisões rápidas e práticas, focando na experiência do viajante.Com base nisso, crie um roteiro de ${maxDays} dias para ${destination}.
Orçamento: ${budget ? `R$ ${budget}` : 'Flexível'}
Pessoas: ${travelersCount}
Estilo: ${travelStyle}

RESPONDA APENAS com este JSON exato:
{
  "titulo": "Roteiro ${maxDays} dias - ${destination}",
  "resumo": "Resumo em 50 caracteres",
  "custoEstimado": "R$ 0000",
  "dicas": ["dica1", "dica2"],
  "dias": [
    {
      "dia": 1,
      "titulo": "Dia 1",
      "atividades": [
        {
          "horario": "09:00",
          "atividade": "Atividade",
          "descricao": "Descrição curta",
          "custoEstimado": "R$ 0",
          "localizacao": "Local"
        }
      ]
    }
  ]
}

Máximo 3 atividades por dia. Descrições de máximo 50 caracteres.`

    console.log('Chamando OpenAI...')

    // Chamar OpenAI com limite muito restrito
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
            content: 'Você é um assistente que responde APENAS com JSON válido. Não adicione texto antes ou depois do JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    })

    if (!openaiResponse.ok) {
      console.error('Erro na OpenAI API:', openaiResponse.status, openaiResponse.statusText)
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    console.log('Resposta da OpenAI recebida')
    
    let itineraryContent = openaiData.choices[0].message.content
    console.log('Conteúdo bruto:', itineraryContent.substring(0, 200))

    // Limpeza mais agressiva do conteúdo
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
        custoEstimado: budget ? `R$ ${budget}` : 'R$ 5000',
        dicas: [
          'Pesquise sobre a cultura local',
          'Verifique a documentação necessária',
          'Reserve acomodações com antecedência'
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
              horario: '14:00',
              atividade: 'Atração principal',
              descricao: 'Visite pontos turísticos importantes',
              custoEstimado: 'R$ 100',
              localizacao: destination
            },
            {
              horario: '19:00',
              atividade: 'Jantar',
              descricao: 'Desfrute da culinária local',
              custoEstimado: 'R$ 80',
              localizacao: destination
            }
          ]
        }))
      }
      console.log('Usando roteiro fallback')
    }

    // Validar estrutura
    if (!itineraryData.titulo || !itineraryData.dias || !Array.isArray(itineraryData.dias)) {
      throw new Error('Estrutura do roteiro inválida')
    }

    console.log('Roteiro processado com sucesso')

    // Retornar apenas o roteiro gerado (sem salvar automaticamente)
    return new Response(
      JSON.stringify({ 
        success: true, 
        itineraryData 
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
