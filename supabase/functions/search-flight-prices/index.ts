
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
}

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FlightOffer {
  price: {
    total: string;
    currency: string;
  };
  validatingAirlineCodes?: string[];
  itineraries?: Array<{
    segments?: Array<{
      carrierCode?: string;
      operating?: {
        carrierCode?: string;
      };
    }>;
  }>;
}

interface AmadeusFlightResponse {
  data: FlightOffer[];
}

// Função para obter token de acesso da Amadeus
const getAmadeusToken = async (): Promise<string> => {
  const clientId = Deno.env.get('AMADEUS_API_KEY');
  const clientSecret = Deno.env.get('AMADEUS_API_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Amadeus API credentials not configured');
  }

  // Usando API de produção
  const tokenUrl = 'https://api.amadeus.com/v1/security/oauth2/token';
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  if (!response.ok) {
    console.error('Erro ao obter token Amadeus:', response.status, response.statusText);
    throw new Error('Failed to get Amadeus access token');
  }

  const data: AmadeusTokenResponse = await response.json();
  return data.access_token;
};

// Função para mapear códigos IATA em nomes de companhias aéreas (expandido)
const getAirlineName = (code: string): string => {
  const airlineMap: Record<string, string> = {
    // Companhias Brasileiras
    'LA': 'LATAM Airlines',
    'G3': 'GOL Linhas Aéreas',
    'AD': 'Azul Linhas Aéreas',
    'JJ': 'TAM Linhas Aéreas',
    '2Z': 'Voepass Linhas Aéreas',
    
    // Companhias Sul-Americanas
    'AR': 'Aerolíneas Argentinas',
    'H2': 'SKY Airline',
    'JA': 'JetSMART',
    'LP': 'LAN Peru',
    'PZ': 'LATAM Airlines Peru',
    'XL': 'LATAM Airlines Ecuador',
    'VE': 'Avior Airlines',
    'P5': 'Wingo',
    
    // Companhias Europeias
    'LH': 'Lufthansa',
    'AF': 'Air France',
    'KL': 'KLM',
    'BA': 'British Airways',
    'IB': 'Iberia',
    'TP': 'TAP Air Portugal',
    'LX': 'Swiss International Air Lines',
    'OS': 'Austrian Airlines',
    'SN': 'Brussels Airlines',
    'AZ': 'ITA Airways',
    'RY': 'Ryanair',
    'EW': 'Eurowings',
    'VY': 'Vueling',
    'FR': 'Ryanair',
    'U2': 'easyJet',
    'W6': 'Wizz Air',
    'DY': 'Norwegian',
    'SK': 'SAS',
    'AY': 'Finnair',
    'WF': 'Widerøe',
    'FI': 'Icelandair',
    'EI': 'Aer Lingus',
    'A3': 'Aegean Airlines',
    'OA': 'Olympic Air',
    
    // Companhias Norte-Americanas
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'WN': 'Southwest Airlines',
    'B6': 'JetBlue Airways',
    'AS': 'Alaska Airlines',
    'F9': 'Frontier Airlines',
    'NK': 'Spirit Airlines',
    'AC': 'Air Canada',
    'WS': 'WestJet',
    'PD': 'Porter Airlines',
    
    // Companhias Asiáticas
    'JL': 'Japan Airlines',
    'NH': 'ANA',
    'CX': 'Cathay Pacific',
    'SQ': 'Singapore Airlines',
    'TG': 'Thai Airways',
    'MH': 'Malaysia Airlines',
    'CI': 'China Airlines',
    'BR': 'EVA Air',
    'KE': 'Korean Air',
    'OZ': 'Asiana Airlines',
    'CZ': 'China Southern',
    'MU': 'China Eastern',
    'CA': 'Air China',
    'AI': 'Air India',
    '6E': 'IndiGo',
    'SG': 'SpiceJet',
    'IX': 'Air India Express',
    
    // Companhias do Oriente Médio
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'EY': 'Etihad Airways',
    'TK': 'Turkish Airlines',
    'MS': 'EgyptAir',
    'RJ': 'Royal Jordanian',
    'GF': 'Gulf Air',
    'WY': 'Oman Air',
    'J9': 'Jazeera Airways',
    'XY': 'flynas',
    
    // Companhias da Oceania
    'QF': 'Qantas',
    'VA': 'Virgin Australia',
    'JQ': 'Jetstar Airways',
    'NZ': 'Air New Zealand',
    
    // Companhias Africanas
    'SA': 'South African Airways',
    'ET': 'Ethiopian Airlines',
    'MS': 'EgyptAir',
    'AT': 'Royal Air Maroc',
    'DT': 'TAAG Angola Airlines',
    'KQ': 'Kenya Airways',
    'UU': 'Air Austral',
    
    // Outras companhias relevantes
    'SU': 'Aeroflot',
    'IG': 'Air Italy',
    'PC': 'Pegasus Airlines',
    'XQ': 'SunExpress',
    'HV': 'Transavia',
    'VV': 'Aerosvit Airlines'
  };

  return airlineMap[code] || `${code} Airlines`;
};

// Função para mapear destinos para códigos IATA (corrigido e expandido)
const getIATACode = (destination: string): string => {
  const destinationMap: Record<string, string> = {
    // Brasil
    'são paulo': 'GRU',
    'rio de janeiro': 'GIG',
    'salvador': 'SSA',
    'foz do iguaçu': 'IGU',
    'florianópolis': 'FLN',
    'brasília': 'BSB',
    'recife': 'REC',
    'fortaleza': 'FOR',
    'manaus': 'MAO',
    'belém': 'BEL',
    'porto alegre': 'POA',
    'curitiba': 'CWB',
    'goiânia': 'GYN',
    'natal': 'NAT',
    'maceió': 'MCZ',
    'joão pessoa': 'JPA',
    'aracaju': 'AJU',
    'teresina': 'THE',
    'são luís': 'SLZ',
    'campo grande': 'CGR',
    'cuiabá': 'CGB',
    'vitória': 'VIX',
    'belo horizonte': 'CNF',
    
    // América do Sul
    'buenos aires': 'EZE',
    'santiago': 'SCL',
    'lima': 'LIM', // Corrigido
    'montevidéu': 'MVD',
    'bogotá': 'BOG',
    'caracas': 'CCS',
    'quito': 'UIO',
    'la paz': 'LPB',
    'asunción': 'ASU',
    'georgetown': 'GEO',
    'paramaribo': 'PBM',
    'cayenne': 'CAY',
    'medellín': 'MDE',
    'cartagena': 'CTG',
    'cali': 'CLO',
    'barranquilla': 'BAQ',
    'córdoba': 'COR',
    'mendoza': 'MDZ',
    'rosario': 'ROS',
    'bariloche': 'BRC',
    'ushuaia': 'USH',
    'valparaíso': 'VAP',
    'antofagasta': 'ANF',
    'iquique': 'IQQ',
    'punta arenas': 'PUQ',
    'cusco': 'CUZ',
    'arequipa': 'AQP',
    'trujillo': 'TRU',
    'iquitos': 'IQT',
    
    // Europa
    'lisboa': 'LIS',
    'porto': 'OPO',
    'madrid': 'MAD',
    'barcelona': 'BCN',
    'sevilha': 'SVQ',
    'valencia': 'VLC',
    'bilbao': 'BIO',
    'paris': 'CDG',
    'lyon': 'LYS',
    'marseille': 'MRS',
    'nice': 'NCE',
    'toulouse': 'TLS',
    'londres': 'LHR',
    'manchester': 'MAN',
    'edimburgo': 'EDI',
    'glasgow': 'GLA',
    'dublin': 'DUB',
    'cork': 'ORK',
    'roma': 'FCO',
    'milão': 'MXP',
    'veneza': 'VCE',
    'florença': 'FLR',
    'nápoles': 'NAP',
    'palermo': 'PMO',
    'catania': 'CTA',
    'berlim': 'BER',
    'munique': 'MUC',
    'frankfurt': 'FRA',
    'hamburgo': 'HAM',
    'colônia': 'CGN',
    'düsseldorf': 'DUS',
    'stuttgart': 'STR',
    'amsterdã': 'AMS',
    'amsterdam': 'AMS',
    'rotterdam': 'RTM',
    'bruxelas': 'BRU',
    'antuérpia': 'ANR',
    'zurique': 'ZUR',
    'genebra': 'GVA',
    'basel': 'BSL',
    'berna': 'BRN',
    'viena': 'VIE',
    'salzburgo': 'SZG',
    'innsbruck': 'INN',
    'praga': 'PRG',
    'brno': 'BRQ',
    'budapest': 'BUD',
    'debrecen': 'DEB',
    'varsóvia': 'WAW',
    'cracóvia': 'KRK',
    'gdansk': 'GDN',
    'wroclaw': 'WRO',
    'estocolmo': 'ARN',
    'gotemburgo': 'GOT',
    'malmö': 'MMX',
    'copenhague': 'CPH',
    'aarhus': 'AAR',
    'helsinque': 'HEL',
    'tampere': 'TMP',
    'turku': 'TKU',
    'oslo': 'OSL',
    'bergen': 'BGO',
    'trondheim': 'TRD',
    'stavanger': 'SVG',
    'reykjavik': 'KEF',
    'akureyri': 'AEY',
    'atenas': 'ATH',
    'thessaloniki': 'SKG',
    'heraklion': 'HER',
    'rhodes': 'RHO',
    'mykonos': 'JMK',
    'santorini': 'JTR',
    'istambul': 'IST',
    'ankara': 'ESB',
    'izmir': 'ADB',
    'antalya': 'AYT',
    'bodrum': 'BJV',
    
    // América do Norte
    'nova york': 'JFK',
    'new york': 'JFK',
    'los angeles': 'LAX',
    'chicago': 'ORD',
    'miami': 'MIA',
    'las vegas': 'LAS',
    'san francisco': 'SFO',
    'seattle': 'SEA',
    'boston': 'BOS',
    'washington': 'DCA',
    'philadelphia': 'PHL',
    'atlanta': 'ATL',
    'dallas': 'DFW',
    'houston': 'IAH',
    'denver': 'DEN',
    'phoenix': 'PHX',
    'detroit': 'DTW',
    'minneapolis': 'MSP',
    'orlando': 'MCO',
    'tampa': 'TPA',
    'toronto': 'YYZ',
    'vancouver': 'YVR',
    'montreal': 'YUL',
    'calgary': 'YYC',
    'ottawa': 'YOW',
    'winnipeg': 'YWG',
    'halifax': 'YHZ',
    'quebec city': 'YQB',
    'cidade do méxico': 'MEX',
    'cancún': 'CUN',
    'guadalajara': 'GDL',
    'monterrey': 'MTY',
    'puerto vallarta': 'PVR',
    'tijuana': 'TIJ',
    'mérida': 'MID',
    
    // Ásia
    'tóquio': 'NRT',
    'tokyo': 'NRT',
    'osaka': 'KIX',
    'kyoto': 'ITM',
    'sapporo': 'CTS',
    'fukuoka': 'FUK',
    'nagoya': 'NGO',
    'pequim': 'PEK',
    'beijing': 'PEK',
    'xangai': 'PVG',
    'shanghai': 'PVG',
    'guangzhou': 'CAN',
    'shenzhen': 'SZX',
    'chengdu': 'CTU',
    'xi\'an': 'XIY',
    'hangzhou': 'HGH',
    'seul': 'ICN',
    'busan': 'PUS',
    'jeju': 'CJU',
    'bangkok': 'BKK',
    'phuket': 'HKT',
    'chiang mai': 'CNX',
    'koh samui': 'USM',
    'singapura': 'SIN',
    'kuala lumpur': 'KUL',
    'penang': 'PEN',
    'langkawi': 'LGK',
    'kota kinabalu': 'BKI',
    'jacarta': 'CGK',
    'bali': 'DPS',
    'yogyakarta': 'JOG',
    'surabaya': 'MLG',
    'medan': 'KNO',
    'manila': 'MNL',
    'cebu': 'CEB',
    'davao': 'DVO',
    'boracay': 'MPH',
    'palawan': 'PPS',
    'hong kong': 'HKG',
    'macau': 'MFM',
    'taipei': 'TPE',
    'kaohsiung': 'KHH',
    'taichung': 'RMQ',
    'ho chi minh': 'SGN',
    'hanoi': 'HAN',
    'da nang': 'DAD',
    'nha trang': 'CXR',
    'phnom penh': 'PNH',
    'siem reap': 'REP',
    'vientiane': 'VTE',
    'luang prabang': 'LPQ',
    'yangon': 'RGN',
    'mandalay': 'MDL',
    'dhaka': 'DAC',
    'chittagong': 'CGP',
    'colombo': 'CMB',
    'male': 'MLE',
    'kathmandu': 'KTM',
    'pokhara': 'PKR',
    'thimphu': 'PBH',
    'mumbai': 'BOM',
    'nova delhi': 'DEL',
    'new delhi': 'DEL',
    'bangalore': 'BLR',
    'chennai': 'MAA',
    'hyderabad': 'HYD',
    'kolkata': 'CCU',
    'pune': 'PNQ',
    'ahmedabad': 'AMD',
    'jaipur': 'JAI',
    'goa': 'GOI',
    'kochi': 'COK',
    'thiruvananthapuram': 'TRV',
    'chandigarh': 'IXC',
    'lucknow': 'LKO',
    'bhubaneswar': 'BBI',
    'visakhapatnam': 'VTZ',
    'dubai': 'DXB',
    'abu dhabi': 'AUH',
    'sharjah': 'SHJ',
    'doha': 'DOH',
    'kuwait city': 'KWI',
    'manama': 'BAH',
    'muscat': 'MCT',
    'riyadh': 'RUH',
    'jeddah': 'JED',
    'dammam': 'DMM',
    'medina': 'MED',
    'tabuk': 'TUU',
    'tehran': 'IKA',
    'isfahan': 'IFN',
    'shiraz': 'SYZ',
    'mashhad': 'MHD',
    'bagdá': 'BGW',
    'basra': 'BSR',
    'erbil': 'EBL',
    'damasco': 'DAM',
    'aleppo': 'ALP',
    'beirute': 'BEY',
    'amã': 'AMM',
    'aqaba': 'AQJ',
    'tel aviv': 'TLV',
    'eilat': 'ETH',
    'jerusalém': 'JRS',
    'nicósia': 'LCA',
    'larnaca': 'LCA',
    'paphos': 'PFO',
    
    // Oceania
    'sydney': 'SYD',
    'melbourne': 'MEL',
    'brisbane': 'BNE',
    'perth': 'PER',
    'adelaide': 'ADL',
    'darwin': 'DRW',
    'hobart': 'HBA',
    'cairns': 'CNS',
    'gold coast': 'OOL',
    'canberra': 'CBR',
    'townsville': 'TSV',
    'rockhampton': 'ROK',
    'mackay': 'MKY',
    'ballina': 'BNK',
    'auckland': 'AKL',
    'wellington': 'WLG',
    'christchurch': 'CHC',
    'queenstown': 'ZQN',
    'dunedin': 'DUD',
    'hamilton': 'HLZ',
    'tauranga': 'TRG',
    'rotorua': 'ROT',
    'napier': 'NPE',
    'new plymouth': 'NPL',
    'nelson': 'NSN',
    'invercargill': 'IVC',
    'suva': 'SUV',
    'nadi': 'NAN',
    'port moresby': 'POM',
    'lae': 'LAE',
    'mount hagen': 'HGU',
    'port vila': 'VLI',
    'nouméa': 'NOU',
    'papeete': 'PPT',
    'apia': 'APW',
    'nuku\'alofa': 'TBU',
    'honiara': 'HIR',
    'tarawa': 'TRW',
    'majuro': 'MAJ',
    'koror': 'ROR',
    'pohnpei': 'PNI',
    'chuuk': 'TKK',
    'yap': 'YAP',
    'kosrae': 'KSA',
    
    // África
    'cidade do cabo': 'CPT',
    'cape town': 'CPT',
    'johannesburgo': 'JNB',
    'johannesburg': 'JNB',
    'durban': 'DUR',
    'pretória': 'WDH',
    'port elizabeth': 'PLZ',
    'bloemfontein': 'BFN',
    'kimberley': 'KIM',
    'east london': 'ELS',
    'george': 'GRJ',
    'upington': 'UTN',
    'cairo': 'CAI',
    'alexandria': 'ALY',
    'luxor': 'LXR',
    'aswan': 'ASW',
    'hurghada': 'HRG',
    'sharm el sheikh': 'SSH',
    'casablanca': 'CMN',
    'marrakech': 'RAK',
    'rabat': 'RBA',
    'fez': 'FEZ',
    'agadir': 'AGA',
    'tanger': 'TNG',
    'ouarzazate': 'OZZ',
    'tunis': 'TUN',
    'sfax': 'SFA',
    'monastir': 'MIR',
    'djerba': 'DJE',
    'argel': 'ALG',
    'oran': 'ORN',
    'constantine': 'CZL',
    'annaba': 'AAE',
    'tripoli': 'TIP',
    'benghazi': 'BEN',
    'khartoum': 'KRT',
    'port sudan': 'PZU',
    'addis ababa': 'ADD',
    'dire dawa': 'DIR',
    'bahir dar': 'BJR',
    'gondar': 'GDQ',
    'mekelle': 'MQX',
    'nairobi': 'NBO',
    'mombasa': 'MBA',
    'kisumu': 'KIS',
    'eldoret': 'EDL',
    'malindi': 'MLW',
    'kampala': 'EBB',
    'entebbe': 'EBB',
    'kigali': 'KGL',
    'bujumbura': 'BJM',
    'dar es salaam': 'DAR',
    'kilimanjaro': 'JRO',
    'zanzibar': 'ZNZ',
    'mwanza': 'MWZ',
    'dodoma': 'DOD',
    'lusaka': 'LUN',
    'ndola': 'NLA',
    'livingstone': 'LVI',
    'harare': 'HRE',
    'bulawayo': 'BUQ',
    'victoria falls': 'VFA',
    'gaborone': 'GBE',
    'francistown': 'FRW',
    'windhoek': 'WDH',
    'walvis bay': 'WVB',
    'maputo': 'MPM',
    'beira': 'BEW',
    'nampula': 'APL',
    'pemba': 'POL',
    'antananarivo': 'TNR',
    'toamasina': 'TMM',
    'mahajanga': 'MJN',
    'antsiranana': 'DIE',
    'port louis': 'MRU',
    'rodrigues': 'RRG',
    'saint-denis': 'RUN',
    'saint-pierre': 'ZSE',
    'lagos': 'LOS',
    'abuja': 'ABV',
    'kano': 'KAN',
    'port harcourt': 'PHC',
    'enugu': 'ENU',
    'calabar': 'CBQ',
    'ibadan': 'IBA',
    'jos': 'JOS',
    'maiduguri': 'MIU',
    'sokoto': 'SKO',
    'yola': 'YOL',
    'accra': 'ACC',
    'kumasi': 'KMS',
    'tamale': 'TML',
    'sunyani': 'NYI',
    'abidjan': 'ABJ',
    'yamoussoukro': 'ASK',
    'bouaké': 'BYK',
    'san-pédro': 'SPY',
    'daloa': 'DJO',
    'korhogo': 'HGO',
    'dakar': 'DKR',
    'saint-louis': 'XLS',
    'cap skirring': 'CSK',
    'ziguinchor': 'ZIG',
    'tambacounda': 'TUD',
    'kaolack': 'KLC',
    'conakry': 'CKY',
    'labé': 'LEK',
    'kankan': 'KNN',
    'nzérékoré': 'NZE',
    'faranah': 'FAA',
    'bissau': 'OXB',
    'bafatá': 'BFA',
    'gabú': 'GBU',
    'freetown': 'FNA',
    'bo': 'KBS',
    'kenema': 'KEN',
    'makeni': 'WYE',
    'monrovia': 'ROB',
    'buchanan': 'UCN',
    'greenville': 'SNI',
    'harper': 'CPA',
    'bamako': 'BKO',
    'gao': 'GAQ',
    'timbuktu': 'TOM',
    'mopti': 'MZI',
    'sikasso': 'KSS',
    'kayes': 'KYS',
    'ouagadougou': 'OUA',
    'bobo-dioulasso': 'BOY',
    'ouahigouya': 'OUG',
    'koudougou': 'KUD',
    'banfora': 'BNR',
    'niamey': 'NIM',
    'agadez': 'AJY',
    'maradi': 'MFG',
    'zinder': 'ZND',
    'tahoua': 'THZ',
    'diffa': 'DIF',
    'n\'djamena': 'NDJ',
    'abéché': 'AEH',
    'moundou': 'MQQ',
    'sarh': 'SRH',
    'am timan': 'AMT',
    'faya': 'FYT',
    'bangui': 'BGF',
    'berberati': 'BBT',
    'bouar': 'BOP',
    'bambari': 'BBM',
    'bossangoa': 'BSN',
    'carnot': 'CRF',
    'libreville': 'LBV',
    'port-gentil': 'POG',
    'franceville': 'MVB',
    'oyem': 'OYE',
    'mouila': 'MJL',
    'tchibanga': 'TCH',
    'malabo': 'SSG',
    'bata': 'BSG',
    'annobon': 'ANO',
    'evinayong': 'EVN',
    'mongomo': 'MNG',
    'ebebiyin': 'EBB',
    'yaoundé': 'YAO',
    'douala': 'DLA',
    'garoua': 'GOU',
    'maroua': 'MVR',
    'bamenda': 'BDA',
    'bafoussam': 'BFX',
    'bertoua': 'BTA',
    'ngaoundéré': 'NGE',
    'ebolowa': 'EBW',
    'kribi': 'KBI',
    'limbé': 'LBE',
    'brazzaville': 'BZV',
    'pointe-noire': 'PNR',
    'dolisie': 'DIS',
    'nkayi': 'NKY',
    'owando': 'FTX',
    'ouesso': 'OUE',
    'impfondo': 'ION',
    'gamboma': 'GMM',
    'sibiti': 'SIB',
    'kinshasa': 'FIH',
    'lubumbashi': 'FBM',
    'goma': 'GOM',
    'bukavu': 'BKY',
    'kisangani': 'FKI',
    'mbuji-mayi': 'MJM',
    'kananga': 'KGA',
    'matadi': 'MAT',
    'mbandaka': 'MDK',
    'gemena': 'GMA',
    'lisala': 'LIQ',
    'isiro': 'IRP',
    'bunia': 'BUX',
    'uvira': 'UVR',
    'kamina': 'KMN',
    'kolwezi': 'KWZ',
    'likasi': 'LIK',
    'angola': 'LAD',
    'luanda': 'LAD',
    'benguela': 'BUG',
    'huambo': 'NOV',
    'lubango': 'SDD',
    'malanje': 'MEG',
    'namibe': 'MSZ',
    'soyo': 'SZA',
    'cabinda': 'CAB',
    'menongue': 'SPP',
    'ondjiva': 'VPE',
    'uíge': 'UGO',
    'saurimo': 'VHC',
    'kuito': 'SVP',
    'n\'dalatando': 'NDD',
    'sumbe': 'NZA',
    'caxito': 'CXI',
    'dundo': 'DRC',
    'mbanza-congo': 'SSY',
    'xangongo': 'XGN',
    'são tomé': 'TMS',
    'príncipe': 'PCP',
    
    // Países (fallback para códigos principais)
    'brasil': 'GRU',
    'argentina': 'EZE',
    'chile': 'SCL',
    'peru': 'LIM',
    'uruguai': 'MVD',
    'paraguai': 'ASU',
    'colômbia': 'BOG',
    'venezuela': 'CCS',
    'equador': 'UIO',
    'bolívia': 'LPB',
    'guiana': 'GEO',
    'suriname': 'PBM',
    'guiana francesa': 'CAY',
    'portugal': 'LIS',
    'espanha': 'MAD',
    'frança': 'CDG',
    'itália': 'FCO',
    'alemanha': 'BER',
    'reino unido': 'LHR',
    'holanda': 'AMS',
    'bélgica': 'BRU',
    'suíça': 'ZUR',
    'áustria': 'VIE',
    'república tcheca': 'PRG',
    'hungria': 'BUD',
    'polônia': 'WAW',
    'suécia': 'ARN',
    'dinamarca': 'CPH',
    'finlândia': 'HEL',
    'noruega': 'OSL',
    'islândia': 'KEF',
    'irlanda': 'DUB',
    'grécia': 'ATH',
    'turquia': 'IST',
    'rússia': 'SVO',
    'ucrânia': 'KBP',
    'bielorrússia': 'MSQ',
    'lituânia': 'VNO',
    'letônia': 'RIX',
    'estônia': 'TLL',
    'finlândia': 'HEL',
    'croácia': 'ZAG',
    'sérvia': 'BEG',
    'bósnia e herzegovina': 'SJJ',
    'montenegro': 'TGD',
    'macedonia do norte': 'SKP',
    'albânia': 'TIA',
    'kosovo': 'PRN',
    'moldávia': 'KIV',
    'romênia': 'OTP',
    'bulgária': 'SOF',
    'eslovênia': 'LJU',
    'eslováquia': 'BTS',
    'malta': 'MLA',
    'chipre': 'LCA',
    'estados unidos': 'JFK',
    'eua': 'JFK',
    'canadá': 'YYZ',
    'méxico': 'MEX',
    'guatemala': 'GUA',
    'belize': 'BZE',
    'honduras': 'TGU',
    'el salvador': 'SAL',
    'nicarágua': 'MGA',
    'costa rica': 'SJO',
    'panamá': 'PTY',
    'cuba': 'HAV',
    'jamaica': 'KIN',
    'haiti': 'PAP',
    'república dominicana': 'SDQ',
    'porto rico': 'SJU',
    'bahamas': 'NAS',
    'barbados': 'BGI',
    'trinidad e tobago': 'POS',
    'granada': 'GND',
    'santa lúcia': 'UVF',
    'são vicente e granadinas': 'SVD',
    'dominica': 'DOM',
    'antígua e barbuda': 'ANU',
    'são cristóvão e névis': 'SKB',
    'japão': 'NRT',
    'china': 'PEK',
    'coreia do sul': 'ICN',
    'coreia do norte': 'FNJ',
    'mongólia': 'ULN',
    'tailândia': 'BKK',
    'vietnã': 'SGN',
    'laos': 'VTE',
    'camboja': 'PNH',
    'mianmar': 'RGN',
    'malásia': 'KUL',
    'singapura': 'SIN',
    'indonésia': 'CGK',
    'brunei': 'BWN',
    'filipinas': 'MNL',
    'taiwan': 'TPE',
    'hong kong': 'HKG',
    'macau': 'MFM',
    'timor-leste': 'DIL',
    'papuásia-nova guiné': 'POM',
    'ilhas salomão': 'HIR',
    'vanuatu': 'VLI',
    'nova caledônia': 'NOU',
    'fiji': 'SUV',
    'polinésia francesa': 'PPT',
    'samoa': 'APW',
    'tonga': 'TBU',
    'kiribati': 'TRW',
    'ilhas marshall': 'MAJ',
    'micronésia': 'PNI',
    'palau': 'ROR',
    'nauru': 'INU',
    'tuvalu': 'FUN',
    'índia': 'BOM',
    'paquistão': 'KHI',
    'bangladesh': 'DAC',
    'sri lanka': 'CMB',
    'maldivas': 'MLE',
    'nepal': 'KTM',
    'butão': 'PBH',
    'afeganistão': 'KBL',
    'irã': 'IKA',
    'iraque': 'BGW',
    'síria': 'DAM',
    'líbano': 'BEY',
    'jordânia': 'AMM',
    'israel': 'TLV',
    'palestina': 'GZA',
    'arábia saudita': 'RUH',
    'emirados árabes unidos': 'DXB',
    'catar': 'DOH',
    'kuwait': 'KWI',
    'bahrein': 'BAH',
    'omã': 'MCT',
    'iêmen': 'SAH',
    'geórgia': 'TBS',
    'armênia': 'EVN',
    'azerbaijão': 'BAK',
    'cazaquistão': 'ALA',
    'quirguistão': 'FRU',
    'tadjiquistão': 'DYU',
    'turcomenistão': 'ASB',
    'uzbequistão': 'TAS',
    'austrália': 'SYD',
    'nova zelândia': 'AKL',
    'egito': 'CAI',
    'líbia': 'TIP',
    'tunísia': 'TUN',
    'argélia': 'ALG',
    'marrocos': 'CMN',
    'sudão': 'KRT',
    'sudão do sul': 'JUB',
    'etiópia': 'ADD',
    'eritreia': 'ASM',
    'djibuti': 'JIB',
    'somália': 'MGQ',
    'quênia': 'NBO',
    'uganda': 'EBB',
    'tanzânia': 'DAR',
    'ruanda': 'KGL',
    'burundi': 'BJM',
    'república democrática do congo': 'FIH',
    'república do congo': 'BZV',
    'república centro-africana': 'BGF',
    'camarões': 'YAO',
    'guiné equatorial': 'SSG',
    'gabão': 'LBV',
    'são tomé e príncipe': 'TMS',
    'chade': 'NDJ',
    'níger': 'NIM',
    'mali': 'BKO',
    'burkina faso': 'OUA',
    'senegal': 'DKR',
    'gambia': 'BJL',
    'guiné-bissau': 'OXB',
    'guiné': 'CKY',
    'serra leoa': 'FNA',
    'libéria': 'ROB',
    'costa do marfim': 'ABJ',
    'gana': 'ACC',
    'togo': 'LFW',
    'benin': 'COO',
    'nigéria': 'LOS',
    'mauritânia': 'NKC',
    'cabo verde': 'RAI',
    'zâmbia': 'LUN',
    'zimbabwe': 'HRE',
    'botswana': 'GBE',
    'namíbia': 'WDH',
    'áfrica do sul': 'CPT',
    'lesoto': 'MSU',
    'eswatini': 'MTS',
    'moçambique': 'MPM',
    'madagascar': 'TNR',
    'maurício': 'MRU',
    'seicheles': 'SEZ',
    'comores': 'HAH',
    'reunião': 'RUN',
    'mayotte': 'DZA',
    'angola': 'LAD'
  };

  const normalizedDestination = destination.toLowerCase().trim();
  const iataCode = destinationMap[normalizedDestination];
  
  if (!iataCode) {
    console.warn(`Código IATA não encontrado para: ${destination}. Usando GRU como fallback.`);
    return 'GRU'; // São Paulo como fallback seguro
  }
  
  console.log(`Mapeamento voo: ${destination} -> ${iataCode}`);
  return iataCode;
};

// Função para extrair código da companhia aérea do voo
const extractAirlineCode = (offer: FlightOffer): string => {
  // Primeiro tenta validatingAirlineCodes
  if (offer.validatingAirlineCodes && offer.validatingAirlineCodes.length > 0) {
    return offer.validatingAirlineCodes[0];
  }
  
  // Se não encontrar, tenta nos segmentos
  if (offer.itineraries && offer.itineraries.length > 0) {
    const firstItinerary = offer.itineraries[0];
    if (firstItinerary.segments && firstItinerary.segments.length > 0) {
      const firstSegment = firstItinerary.segments[0];
      return firstSegment.operating?.carrierCode || firstSegment.carrierCode || 'XX';
    }
  }
  
  return 'XX'; // Código padrão se não encontrar
};

// Função para validar se um voo é realista
const validateFlightOffer = (offer: FlightOffer, destination: string): boolean => {
  const price = parseFloat(offer.price.total);
  
  // Validar faixa de preços realistas (ida e volta em BRL)
  if (price < 300 || price > 50000) {
    console.log(`Preço de voo fora da faixa realista: R$ ${price} para ${destination}`);
    return false;
  }
  
  // Verificar se tem companhia aérea válida
  const airlineCode = extractAirlineCode(offer);
  if (!airlineCode || airlineCode === 'XX') {
    console.log(`Companhia aérea inválida para voo: ${airlineCode}`);
    return false;
  }
  
  return true;
};

// Função para buscar voos na Amadeus com validação
const searchFlights = async (params: FlightSearchParams): Promise<{ 
  pricePerPerson: number; 
  currency: string; 
  source: string;
  airlineCode?: string;
  airlineName?: string;
  quotationDate: string;
}> => {
  console.log('Buscando voos para:', params);
  
  try {
    const token = await getAmadeusToken();
    console.log('Token Amadeus obtido com sucesso');
    
    const destinationCode = getIATACode(params.destination);
    const originCode = 'GRU'; // São Paulo como origem padrão
    
    console.log(`Buscando voos: ${originCode} -> ${destinationCode}`);
    
    // Usando API de produção
    const searchUrl = 'https://api.amadeus.com/v2/shopping/flight-offers';
    const searchParams = new URLSearchParams({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.passengers.toString(),
      currencyCode: 'BRL',
      max: '250' // Aumentar o número de resultados
    });

    const response = await fetch(`${searchUrl}?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Erro na busca de voos:', response.status, response.statusText);
      throw new Error(`Amadeus API error: ${response.status}`);
    }

    const data: AmadeusFlightResponse = await response.json();
    console.log(`Encontrados ${data.data?.length || 0} voos brutos`);
    
    if (!data.data || data.data.length === 0) {
      throw new Error('Nenhum voo encontrado para as datas especificadas');
    }

    // Filtrar ofertas válidas
    const validOffers = data.data.filter(offer => validateFlightOffer(offer, params.destination));
    console.log(`${validOffers.length} voos válidos após filtros`);
    
    if (validOffers.length === 0) {
      throw new Error('Nenhum voo válido encontrado após aplicar filtros');
    }

    // Encontrar o voo com menor preço
    const cheapestOffer = validOffers.reduce((prev, current) => 
      parseFloat(current.price.total) < parseFloat(prev.price.total) ? current : prev
    );
    
    const minPrice = parseFloat(cheapestOffer.price.total);
    const airlineCode = extractAirlineCode(cheapestOffer);
    const airlineName = getAirlineName(airlineCode);
    
    console.log(`Menor preço encontrado: ${minPrice} ${cheapestOffer.price.currency}, Companhia: ${airlineName} (${airlineCode})`);
    
    return {
      pricePerPerson: minPrice,
      currency: cheapestOffer.price.currency,
      source: 'amadeus_api_prod',
      airlineCode,
      airlineName,
      quotationDate: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Erro ao buscar voos na Amadeus:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, passengers }: FlightSearchParams = await req.json();

    console.log('Parâmetros de busca recebidos:', { origin, destination, departureDate, returnDate, passengers });

    // Validar datas
    const depDate = new Date(departureDate);
    const retDate = new Date(returnDate);
    const today = new Date();
    
    if (depDate < today) {
      throw new Error('Data de partida não pode ser no passado');
    }
    
    if (retDate <= depDate) {
      throw new Error('Data de volta deve ser posterior à data de partida');
    }

    // Buscar preços de voos
    const flightData = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers
    });

    return new Response(
      JSON.stringify({
        success: true,
        pricePerPerson: flightData.pricePerPerson,
        totalPrice: flightData.pricePerPerson * passengers,
        currency: flightData.currency,
        source: flightData.source,
        airlineCode: flightData.airlineCode,
        airlineName: flightData.airlineName,
        quotationDate: flightData.quotationDate,
        searchParams: { origin, destination, departureDate, returnDate, passengers }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na busca de voos:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        source: 'error'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
