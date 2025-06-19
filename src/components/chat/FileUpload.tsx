
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, X, Image, FileText, Upload } from 'lucide-react';
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

export function FileUpload({ onFileSelect, selectedFiles, onFileRemove, disabled }: FileUploadProps) {
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

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
          {selectedFiles.map((fileWithPreview, index) => (
            <div key={index} className="relative group">
              {fileWithPreview.type === 'image' && fileWithPreview.preview ? (
                <div className="relative">
                  <img 
                    src={fileWithPreview.preview} 
                    alt={fileWithPreview.file.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onFileRemove(index)}
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-xs truncate max-w-20">
                    {fileWithPreview.file.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onFileRemove(index)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 rounded-lg hover:border-gray-400 transition-colors"
      >
        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
        Arraste arquivos aqui ou clique no botão para selecionar
        <div className="text-xs mt-1">
          Suporte: Imagens (JPG, PNG, GIF) e Documentos (PDF, DOC, TXT) - Max 10MB
        </div>
      </div>
    </div>
  );
}
