
// Função para chamar API de busca de voos com retry
export const searchFlights = async (destination: string, budget: number, retryCount = 0): Promise<any> => {
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + 30); // 30 dias no futuro
  const returnDate = new Date(departureDate);
  returnDate.setDate(returnDate.getDate() + 7); // 7 dias de viagem

  try {
    console.log(`Tentativa ${retryCount + 1} de busca de voos para ${destination}`);
    
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/search-flight-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        origin: 'São Paulo',
        destination: destination,
        departureDate: departureDate.toISOString().split('T')[0],
        returnDate: returnDate.toISOString().split('T')[0],
        passengers: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Flight search failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Flight search returned error');
    }
    
    console.log(`✅ Voos encontrados para ${destination}: R$ ${data.pricePerPerson} (${data.airlineName})`);
    return data;
    
  } catch (error) {
    console.error(`❌ Erro ao buscar voos para ${destination} (tentativa ${retryCount + 1}):`, error.message);
    
    // Retry até 2 vezes com delay
    if (retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Delay crescente
      return searchFlights(destination, budget, retryCount + 1);
    }
    
    return null;
  }
};

// Função para chamar API de busca de hospedagem com retry
export const searchAccommodation = async (destination: string, travelStyle: string, retryCount = 0): Promise<any> => {
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + 30);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + 7);

  try {
    console.log(`Tentativa ${retryCount + 1} de busca de hospedagem para ${destination}`);
    
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/search-accommodation-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        destination: destination,
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        adults: 1,
        travelStyle: travelStyle
      })
    });

    if (!response.ok) {
      throw new Error(`Accommodation search failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Accommodation search returned error');
    }
    
    console.log(`✅ Hospedagem encontrada para ${destination}: R$ ${data.totalPrice} (${data.hotelDetails?.name})`);
    return data;
    
  } catch (error) {
    console.error(`❌ Erro ao buscar hospedagem para ${destination} (tentativa ${retryCount + 1}):`, error.message);
    
    // Retry até 2 vezes com delay
    if (retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Delay crescente
      return searchAccommodation(destination, travelStyle, retryCount + 1);
    }
    
    return null;
  }
};
