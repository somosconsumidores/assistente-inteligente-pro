
import { DestinationOption } from './types.ts';

// Base de destinos expandida com estimativas mais realistas
export const destinations: DestinationOption[] = [
  // Destinos Nacionais (até R$ 3.000)
  { 
    name: 'Foz do Iguaçu', 
    country: 'Brasil', 
    category: 'nacional', 
    minBudget: 1500, 
    description: 'Cataratas mundialmente famosas',
    estimatedFlightCost: 800,
    estimatedAccommodationCost: 700
  },
  { 
    name: 'Salvador', 
    country: 'Brasil', 
    category: 'nacional', 
    minBudget: 1800, 
    description: 'História e cultura afro-brasileira',
    estimatedFlightCost: 900,
    estimatedAccommodationCost: 900
  },
  { 
    name: 'Rio de Janeiro', 
    country: 'Brasil', 
    category: 'nacional', 
    minBudget: 2000, 
    description: 'Cidade Maravilhosa com praias icônicas',
    estimatedFlightCost: 600,
    estimatedAccommodationCost: 1400
  },
  { 
    name: 'Florianópolis', 
    country: 'Brasil', 
    category: 'nacional', 
    minBudget: 2200, 
    description: 'Ilha da Magia com praias paradisíacas',
    estimatedFlightCost: 700,
    estimatedAccommodationCost: 1500
  },

  // América do Sul (R$ 3.000 - R$ 6.000)
  { 
    name: 'Buenos Aires', 
    country: 'Argentina', 
    category: 'regional', 
    minBudget: 3500, 
    description: 'Capital do tango e da carne',
    estimatedFlightCost: 1800,
    estimatedAccommodationCost: 1700
  },
  { 
    name: 'Santiago', 
    country: 'Chile', 
    category: 'regional', 
    minBudget: 4000, 
    description: 'Cordilheira dos Andes e vinhos',
    estimatedFlightCost: 2200,
    estimatedAccommodationCost: 1800
  },
  { 
    name: 'Lima', 
    country: 'Peru', 
    category: 'regional', 
    minBudget: 3800, 
    description: 'Gastronomia mundial e história inca',
    estimatedFlightCost: 2000,
    estimatedAccommodationCost: 1800
  },
  { 
    name: 'Montevidéu', 
    country: 'Uruguai', 
    category: 'regional', 
    minBudget: 3200, 
    description: 'Charme europeu na América do Sul',
    estimatedFlightCost: 1600,
    estimatedAccommodationCost: 1600
  },

  // Internacional (R$ 6.000 - R$ 10.000)
  { 
    name: 'Lisboa', 
    country: 'Portugal', 
    category: 'internacional', 
    minBudget: 7000, 
    description: 'História, fado e pastéis de nata',
    estimatedFlightCost: 4200,
    estimatedAccommodationCost: 2800
  },
  { 
    name: 'Madrid', 
    country: 'Espanha', 
    category: 'internacional', 
    minBudget: 7500, 
    description: 'Arte, cultura e vida noturna',
    estimatedFlightCost: 4500,
    estimatedAccommodationCost: 3000
  },
  { 
    name: 'Miami', 
    country: 'Estados Unidos', 
    category: 'internacional', 
    minBudget: 8000, 
    description: 'Praias, compras e vida cosmopolita',
    estimatedFlightCost: 5000,
    estimatedAccommodationCost: 3000
  },
  { 
    name: 'Bangkok', 
    country: 'Tailândia', 
    category: 'internacional', 
    minBudget: 6500, 
    description: 'Templos dourados e street food',
    estimatedFlightCost: 4000,
    estimatedAccommodationCost: 2500
  },

  // Premium (acima de R$ 10.000)
  { 
    name: 'Paris', 
    country: 'França', 
    category: 'premium', 
    minBudget: 12000, 
    description: 'Cidade Luz e capital do romance',
    estimatedFlightCost: 7200,
    estimatedAccommodationCost: 4800
  },
  { 
    name: 'Tóquio', 
    country: 'Japão', 
    category: 'premium', 
    minBudget: 13000, 
    description: 'Tradição e modernidade em harmonia',
    estimatedFlightCost: 8000,
    estimatedAccommodationCost: 5000
  },
  { 
    name: 'Londres', 
    country: 'Reino Unido', 
    category: 'premium', 
    minBudget: 11000, 
    description: 'História real e cultura britânica',
    estimatedFlightCost: 6600,
    estimatedAccommodationCost: 4400
  },
  { 
    name: 'Sydney', 
    country: 'Austrália', 
    category: 'premium', 
    minBudget: 15000, 
    description: 'Opera House e praias espetaculares',
    estimatedFlightCost: 9000,
    estimatedAccommodationCost: 6000
  },
];
