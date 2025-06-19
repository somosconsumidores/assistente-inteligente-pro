
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (files: FileWithPreview[]) => void;
  selectedFiles: FileWithPreview[];
  onFileRemove: (index: number) => void;
  disabled?: boolean;
}

export interface FileWithPreview {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processFiles = (files: File[]) => {
    const validFiles: FileWithPreview[] = [];
    let processedCount = 0;

    files.forEach(file => {
      // Validar tipo de arquivo
      const isImage = file.type.startsWith('image/');
      const isDocument = file.type === 'application/pdf' || 
                        file.type === 'application/msword' || 
                        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                        file.type === 'text/plain';

      if (!isImage && !isDocument) {
        toast({
          title: "Arquivo não suportado",
          description: `${file.name} não é um tipo de arquivo suportado.`,
          variant: "destructive"
        });
        processedCount++;
        if (processedCount === files.length && validFiles.length > 0) {
          onFileSelect(validFiles);
        }
        return;
      }

      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} é maior que 10MB.`,
          variant: "destructive"
        });
        processedCount++;
        if (processedCount === files.length && validFiles.length > 0) {
          onFileSelect(validFiles);
        }
        return;
      }

      const fileWithPreview: FileWithPreview = {
        file,
        type: isImage ? 'image' : 'document'
      };

      // Criar preview para imagens
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileWithPreview.preview = e.target?.result as string;
          validFiles.push(fileWithPreview);
          processedCount++;
          if (processedCount === files.length && validFiles.length > 0) {
            onFileSelect(validFiles);
          }
        };
        reader.readAsDataURL(file);
      } else {
        validFiles.push(fileWithPreview);
        processedCount++;
        if (processedCount === files.length && validFiles.length > 0) {
          onFileSelect(validFiles);
        }
      }
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
      >
        <Paperclip className="w-4 h-4 text-gray-500" />
      </Button>
      
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
