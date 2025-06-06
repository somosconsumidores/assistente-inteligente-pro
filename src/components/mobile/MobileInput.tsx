
import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ 
    label, 
    error, 
    helper, 
    leftIcon, 
    rightIcon, 
    className, 
    type = 'text',
    ...props 
  }, ref) => {
    const { isMobile } = useMobileDeviceInfo();

    // Map input types to mobile keyboard types
    const getInputMode = (inputType: string) => {
      switch (inputType) {
        case 'email': return 'email';
        case 'tel': return 'tel';
        case 'number': return 'numeric';
        case 'url': return 'url';
        case 'search': return 'search';
        default: return 'text';
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label 
            htmlFor={props.id} 
            className={cn(
              'text-slate-50 font-medium',
              isMobile ? 'text-sm' : 'text-base'
            )}
          >
            {label}
          </Label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <Input
            ref={ref}
            type={type}
            inputMode={isMobile ? getInputMode(type) : undefined}
            className={cn(
              'mobile-form-input transition-all duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              isMobile && [
                'h-12 text-base rounded-lg',
                'focus:scale-[1.02] focus:shadow-lg'
              ],
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-red-400 text-sm mt-1 animate-slide-in-bottom">
            {error}
          </p>
        )}
        
        {helper && !error && (
          <p className="text-gray-400 text-sm mt-1">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

MobileInput.displayName = 'MobileInput';
