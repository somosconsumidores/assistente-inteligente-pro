
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DestinationSuggestionRequest } from './types.ts';
import { suggestDestination } from './suggestion-logic.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { budget }: DestinationSuggestionRequest = await req.json();

    console.log('📥 Parâmetros recebidos:', { budget });

    // Validar orçamento
    if (!budget || budget < 1000) {
      throw new Error('Orçamento mínimo deve ser R$ 1.000');
    }

    if (budget > 50000) {
      throw new Error('Orçamento máximo suportado é R$ 50.000');
    }

    // Sugerir destino
    const suggestion = await suggestDestination(budget);

    console.log('🎉 Sugestão gerada com sucesso:', {
      destino: suggestion.destination.name,
      isRealData: suggestion.isRealData,
      hasRealFlightData: suggestion.hasRealFlightData,
      hasRealAccommodationData: suggestion.hasRealAccommodationData,
      totalCost: suggestion.totalTravelCost
    });

    return new Response(
      JSON.stringify(suggestion),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erro na sugestão de destino:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
