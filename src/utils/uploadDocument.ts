
import { supabase } from '@/integrations/supabase/client';

export const uploadDocumentFromUrl = async (url: string, title: string) => {
  try {
    console.log('Baixando arquivo da URL:', url);
    
    // Baixar o arquivo da URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erro ao baixar o arquivo');
    }
    
    const blob = await response.blob();
    const file = new File([blob], 'documento.pdf', { type: 'application/pdf' });
    
    console.log('Arquivo baixado, fazendo upload para a base de conhecimento...');
    
    // Criar FormData para enviar para a edge function
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    // Chamar a edge function de upload administrativo
    const { data, error } = await supabase.functions.invoke('admin-upload-document', {
      body: formData
    });
    
    if (error) {
      console.error('Erro no upload:', error);
      throw new Error(error.message || 'Erro ao fazer upload do documento');
    }
    
    console.log('Upload realizado com sucesso:', data);
    return data;
    
  } catch (error) {
    console.error('Erro no processo de upload:', error);
    throw error;
  }
};
