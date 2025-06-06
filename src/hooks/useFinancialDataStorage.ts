
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FinancialData } from './useFinancialChat';

export const useFinancialDataStorage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const saveFinancialData = async (data: FinancialData) => {
    if (!user) {
      console.warn('User not authenticated');
      return false;
    }

    setIsLoading(true);
    try {
      // First check if user already has financial data
      const { data: existingData, error: selectError } = await supabase
        .from('user_financial_data')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError) {
        console.error('Error checking existing data:', selectError);
        return false;
      }

      const financialDataToSave = {
        user_id: user.id,
        renda: data.renda,
        gastos_fixes: data.gastosFixes,
        gastos_variaveis: data.gastosVariaveis,
        dividas: data.dividas || 0,
        reserva_emergencia: data.reservaEmergencia || 0,
        investimentos: data.investimentos || 0,
        meta_economia: data.metaEconomia || 0,
        objetivos: data.objetivos || []
      };

      let result;
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('user_financial_data')
          .update(financialDataToSave)
          .eq('id', existingData.id);
      } else {
        // Insert new record
        result = await supabase
          .from('user_financial_data')
          .insert(financialDataToSave);
      }

      if (result.error) {
        console.error('Error saving financial data:', result.error);
        return false;
      }

      console.log('Financial data saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving financial data:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadFinancialData = async (): Promise<FinancialData | null> => {
    if (!user) {
      console.warn('User not authenticated');
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_financial_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading financial data:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Convert database format to FinancialData format
      const financialData: FinancialData = {
        renda: Number(data.renda),
        gastosFixes: Number(data.gastos_fixes),
        gastosVariaveis: Number(data.gastos_variaveis),
        dividas: Number(data.dividas || 0),
        reservaEmergencia: Number(data.reserva_emergencia || 0),
        investimentos: Number(data.investimentos || 0),
        metaEconomia: Number(data.meta_economia || 0),
        objetivos: data.objetivos || [],
        categoriaGastos: {} // Default empty object for now
      };

      return financialData;
    } catch (error) {
      console.error('Error loading financial data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFinancialData = async () => {
    if (!user) {
      console.warn('User not authenticated');
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_financial_data')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting financial data:', error);
        return false;
      }

      console.log('Financial data deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting financial data:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveFinancialData,
    loadFinancialData,
    deleteFinancialData,
    isLoading
  };
};
