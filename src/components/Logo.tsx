
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '',
  linkClassName = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base',
    lg: 'w-10 h-10 text-base'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl'
  };

  return (
    <Link 
      to="/" 
      className={`inline-flex items-center space-x-2 ${linkClassName}`}
    >
      <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <span className="text-white font-bold">BI</span>
      </div>
      <span className={`font-bold text-gray-900 dark:text-white ${textSizeClasses[size]}`}>
        Biblioteca IA
      </span>
    </Link>
  );
};

export default Logo;
