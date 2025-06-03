
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { useToast } from '@/hooks/use-toast';

const KnowledgeBase = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const { uploadDocument, processDocument, getDocuments, isUploading, isProcessing } = useKnowledgeBase();
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await getDocuments();
    setDocuments(docs);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocumentTitle(file.name.replace('.pdf', ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentTitle.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo e informe um título.",
        variant: "destructive"
      });
      return;
    }

    const document = await uploadDocument(selectedFile, documentTitle);
    if (document) {
      setSelectedFile(null);
      setDocumentTitle('');
      loadDocuments();
      
      // Processar automaticamente após upload
      await processDocument(document.id);
      loadDocuments();
    }
  };

  const handleProcess = async (documentId: string) => {
    await processDocument(documentId);
    loadDocuments();
  };

  const getStatusIcon = (processedAt: string | null) => {
    if (processedAt) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusText = (processedAt: string | null) => {
    if (processedAt) {
      return 'Processado';
    }
    return 'Aguardando processamento';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Documento</CardTitle>
          <CardDescription>
            Faça upload de documentos PDF para enriquecer a base de conhecimento jurídica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Documento</Label>
            <Input
              id="title"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Ex: Jurisprudência sobre vícios de produto"
            />
          </div>
          
          <div>
            <Label htmlFor="file">Arquivo PDF</Label>
            <div className="mt-2">
              <input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file')?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.name : 'Selecionar arquivo PDF'}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !documentTitle.trim() || isUploading}
            className="w-full"
          >
            {isUploading ? 'Enviando...' : 'Adicionar à Base de Conhecimento'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentos na Base</CardTitle>
          <CardDescription>
            Documentos disponíveis para consulta pelo assistente jurídico
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum documento adicionado ainda</p>
              <p className="text-sm">Adicione documentos PDF para enriquecer as respostas do chat</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-gray-600">{doc.file_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(doc.processed_at)}
                      <span className="text-sm">{getStatusText(doc.processed_at)}</span>
                    </div>
                    
                    {!doc.processed_at && (
                      <Button
                        size="sm"
                        onClick={() => handleProcess(doc.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processando...' : 'Processar'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBase;
