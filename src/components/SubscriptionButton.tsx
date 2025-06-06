
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, CreditCard } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionButtonProps {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ 
  variant = 'default', 
  size = 'default',
  className = ''
}) => {
  const { subscribed, isLoading, createCheckout, openCustomerPortal } = useSubscription();

  if (subscribed) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={openCustomerPortal}
        disabled={isLoading}
        className={`${className}`}
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Gerenciar Assinatura
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={createCheckout}
      disabled={isLoading}
      className={`bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 ${className}`}
    >
      <Crown className="w-4 h-4 mr-2" />
      {isLoading ? 'Carregando...' : 'Upgrade para Premium'}
    </Button>
  );
};

export default SubscriptionButton;
