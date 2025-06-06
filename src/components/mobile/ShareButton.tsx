
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Loader2 } from 'lucide-react';
import { useNativeShare } from '@/hooks/useNativeShare';

interface ShareButtonProps {
  text?: string;
  url?: string;
  title?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ShareButton({
  text,
  url,
  title = 'Compartilhar',
  variant = 'outline',
  size = 'sm',
  className
}: ShareButtonProps) {
  const { shareText, shareUrl, isLoading } = useNativeShare();

  const handleShare = async () => {
    if (url) {
      await shareUrl(url, title);
    } else if (text) {
      await shareText(text, title);
    }
  };

  const hasContent = Boolean(text || url);

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={isLoading || !hasContent}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Share2 className="w-4 h-4 mr-2" />
      )}
      Compartilhar
    </Button>
  );
}
