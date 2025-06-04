
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PeticaoData {
  nome: string;
  cpf: string;
  empresa: string;
  valor: string;
  relato: string;
}

export const useSalvarPeticao = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const salvarPeticao = async (peticaoContent: string, dadosFormulario: PeticaoData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar petições",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);

    try {
      const title = `Petição contra ${dadosFormulario.empresa}`;
      
      const { error } = await supabase
        .from('saved_petitions')
        .insert({
          user_id: user.id,
          title,
          content: peticaoContent,
          case_details: {
            nome: dadosFormulario.nome,
            cpf: dadosFormulario.cpf,
            empresa: dadosFormulario.empresa,
            valor: dadosFormulario.valor,
            relato: dadosFormulario.relato
          }
        });

      if (error) {
        console.error('Erro ao salvar petição:', error);
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Petição salva com sucesso"
      });

      return true;
    } catch (error) {
      console.error('Erro ao salvar petição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a petição. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    salvarPeticao,
    isSaving
  };
};
