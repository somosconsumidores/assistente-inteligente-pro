
import { useSearchParams } from 'react-router-dom';

export const usePremiumRegistration = () => {
  const [searchParams] = useSearchParams();
  
  const isPremium = searchParams.get('premium') === 'true' || 
                   searchParams.get('plan') === 'premium' ||
                   searchParams.has('code');
  
  const promoCode = searchParams.get('code');
  const refSource = searchParams.get('ref');
  
  const generatePremiumUrl = (baseUrl: string, options?: {
    code?: string;
    ref?: string;
    plan?: string;
  }) => {
    const url = new URL(baseUrl);
    
    if (options?.code) {
      url.searchParams.set('code', options.code);
    } else if (options?.plan) {
      url.searchParams.set('plan', options.plan);
    } else {
      url.searchParams.set('premium', 'true');
    }
    
    if (options?.ref) {
      url.searchParams.set('ref', options.ref);
    }
    
    return url.toString();
  };
  
  return {
    isPremium,
    promoCode,
    refSource,
    generatePremiumUrl
  };
};
