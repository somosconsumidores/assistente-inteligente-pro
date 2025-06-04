
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Criar prompt para IA
    const prompt = `
Crie um roteiro detalhado de viagem para:

Destino: ${destination}
Orçamento: ${budget ? `R$ ${budget}` : 'Não especificado'}
Data de ida: ${departureDate}
Data de volta: ${returnDate}
Duração: ${days} dias
Número de pessoas: ${travelersCount}
Estilo de viagem: ${travelStyle}
${additionalPreferences ? `Preferências adicionais: ${additionalPreferences}` : ''}

IMPORTANTE: Responda APENAS com um JSON válido, sem texto adicional antes ou depois. Use exatamente esta estrutura:

{
  "titulo": "Nome do roteiro",
  "resumo": "Breve descrição do roteiro",
  "custoEstimado": "Custo total estimado em reais",
  "dicas": ["dica1", "dica2", "dica3"],
  "dias": [
    {
      "dia": 1,
      "titulo": "Título do dia",
      "atividades": [
        {
          "horario": "09:00",
          "atividade": "Nome da atividade",
          "descricao": "Descrição detalhada",
          "custoEstimado": "R$ 50",
          "localizacao": "Endereço ou localização"
        }
      ]
    }
  ]
}

Seja específico com horários, custos realistas em reais, e inclua atividades variadas. Considere refeições, transporte, atrações e tempo livre.
`

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
            content: 'Você é um especialista em turismo e planejamento de viagens. Crie roteiros detalhados e realistas com base nas informações fornecidas. Sempre responda apenas com JSON válido, sem texto adicional.'
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
    
    const itineraryContent = openaiData.choices[0].message.content
    console.log('Conteúdo do roteiro:', itineraryContent.substring(0, 200) + '...')

    // Parse do JSON retornado pela IA com melhor tratamento de erro
    let itineraryData
    try {
      // Limpar possível texto extra antes e depois do JSON
      const cleanContent = itineraryContent.trim()
      const jsonStart = cleanContent.indexOf('{')
      const jsonEnd = cleanContent.lastIndexOf('}') + 1
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('JSON não encontrado na resposta')
      }
      
      const jsonString = cleanContent.substring(jsonStart, jsonEnd)
      console.log('JSON extraído:', jsonString.substring(0, 200) + '...')
      
      itineraryData = JSON.parse(jsonString)
      console.log('JSON parseado com sucesso')
    } catch (e) {
      console.error('Erro ao fazer parse do JSON:', e)
      console.error('Conteúdo original:', itineraryContent)
      throw new Error('Erro ao processar resposta da IA: ' + e.message)
    }

    // Obter usuário autenticado
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Salvando roteiro no banco de dados...')

    // Salvar roteiro na tabela travel_itineraries
    const { data: savedItinerary, error: saveError } = await supabase
      .from('travel_itineraries')
      .insert({
        user_id: user.id,
        destination,
        budget: budget ? parseFloat(budget.toString()) : null,
        departure_date: departureDate,
        return_date: returnDate,
        travelers_count: parseInt(travelersCount.toString()),
        travel_style: travelStyle,
        additional_preferences: additionalPreferences,
        itinerary_data: itineraryData
      })
      .select()
      .single()

    if (saveError) {
      console.error('Erro ao salvar roteiro:', saveError)
      throw new Error('Erro ao salvar roteiro no banco de dados: ' + saveError.message)
    }

    console.log('Roteiro salvo com sucesso:', savedItinerary.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        itinerary: savedItinerary,
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
