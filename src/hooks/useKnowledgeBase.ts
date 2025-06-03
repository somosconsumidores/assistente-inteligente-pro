
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useKnowledgeBase = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const uploadDocument = async (file: File, title: string) => {
    if (!file.type.includes('pdf')) {
      toast({
        title: "Erro",
        description: "Apenas arquivos PDF são suportados.",
        variant: "destructive"
      });
      return null;
    }

    setIsUploading(true);

    try {
      // Upload do arquivo para o storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('knowledge-docs')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      // Extrair texto do PDF (simulação - em produção usaria uma biblioteca real)
      const content = await extractTextFromPDF(file);

      // Salvar metadados no banco
      const { data: document, error: dbError } = await supabase
        .from('knowledge_base')
        .insert({
          title,
          file_name: file.name,
          file_path: uploadData.path,
          content,
          processed_at: null
        })
        .select()
        .single();

      if (dbError) {
        throw new Error('Erro ao salvar documento no banco');
      }

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso!",
      });

      return document;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const processDocument = async (documentId: string) => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: { documentId }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao processar documento');
      }

      toast({
        title: "Sucesso",
        description: "Documento processado e adicionado à base de conhecimento!",
      });

      return data;
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro no processamento",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const getDocuments = async () => {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar documentos:', error);
      return [];
    }

    return data || [];
  };

  return {
    uploadDocument,
    processDocument,
    getDocuments,
    isUploading,
    isProcessing
  };
};

// Função auxiliar para extrair texto de PDF (simulação)
const extractTextFromPDF = async (file: File): Promise<string> => {
  // Em uma implementação real, você usaria uma biblioteca como pdf-parse
  // Por enquanto, vamos simular com o nome do arquivo
  return `Conteúdo extraído do arquivo: ${file.name}
  
Este é um documento jurídico sobre direito do consumidor. Contém informações sobre:
- Código de Defesa do Consumidor (CDC)
- Direitos e deveres dos consumidores
- Procedimentos para reclamações
- Jurisprudência relevante
- Casos práticos e precedentes

O documento aborda temas como garantia, vícios de produtos, práticas abusivas, e procedimentos para buscar reparação de danos.`;
};
