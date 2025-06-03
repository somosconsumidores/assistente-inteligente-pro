
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { uploadDocumentFromUrl } from '@/utils/uploadDocument';
import { useToast } from '@/hooks/use-toast';

const UploadDocumentButton = ({ onUploadComplete }: { onUploadComplete?: () => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    setIsUploading(true);
    
    try {
      const documentUrl = 'https://a025adad-b360-4787-a9c7-13b92df27cb3.usrfiles.com/ugd/a025ad_016d173f460048828bb7304cc6f5d004.pdf';
      const title = 'Código de Defesa do Consumidor';
      
      const result = await uploadDocumentFromUrl(documentUrl, title);
      
      toast({
        title: "Sucesso",
        description: `Documento adicionado à base de conhecimento com sucesso! ${result.charactersProcessed || 0} caracteres processados em ${result.chunksProcessed || 0} chunks.`,
      });
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar documento à base de conhecimento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Button 
      onClick={handleUpload} 
      disabled={isUploading}
      className="flex items-center space-x-2"
      variant="outline"
    >
      {isUploading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processando...</span>
        </>
      ) : (
        <>
          <Upload className="w-4 h-4" />
          <span>Adicionar CDC à Base</span>
        </>
      )}
    </Button>
  );
};

export default UploadDocumentButton;
