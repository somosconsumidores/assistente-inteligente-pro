
import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

const PremiumRegister = () => {
  const [searchParams] = useSearchParams();
  
  // Redirect to regular register page with premium parameter
  const params = new URLSearchParams();
  params.set('premium', 'true');
  
  // Preserve any existing parameters
  searchParams.forEach((value, key) => {
    params.set(key, value);
  });
  
  return <Navigate to={`/register?${params.toString()}`} replace />;
};

export default PremiumRegister;
