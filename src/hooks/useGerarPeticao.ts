
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PeticaoData {
  nome: string;
  cpf: string;
  empresa: string;
  valor: string;
  relato: string;
}

export const useGerarPeticao = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [peticaoGerada, setPeticaoGerada] = useState<string | null>(null);
  const { toast } = useToast();

  const gerarPeticao = async (data: PeticaoData) => {
    if (!data.nome || !data.cpf || !data.empresa || !data.valor || !data.relato) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Enviando dados para geração de petição...');
      
      const { data: response, error } = await supabase.functions.invoke('gerar-peticao', {
        body: data
      });

      if (error) {
        console.error('Erro ao chamar edge function:', error);
        throw new Error(error.message || 'Erro ao gerar petição');
      }

      console.log('Petição gerada com sucesso');

      if (response.success) {
        setPeticaoGerada(response.peticao);
        toast({
          title: "Sucesso!",
          description: "Petição gerada com sucesso"
        });
      } else {
        throw new Error(response.error || 'Erro desconhecido');
      }

    } catch (error) {
      console.error('Erro ao gerar petição:', error);
      
      toast({
        title: "Erro",
        description: "Não foi possível gerar a petição. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const limparPeticao = () => {
    setPeticaoGerada(null);
  };

  return {
    gerarPeticao,
    isLoading,
    peticaoGerada,
    limparPeticao
  };
};
