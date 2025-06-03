
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UploadDocumentButton from './UploadDocumentButton';

const KnowledgeBase = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [documentStats, setDocumentStats] = useState({
    totalChunks: 0,
    totalChars: 0,
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      // Buscar documentos
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar documentos:', error);
        return;
      }

      setDocuments(data || []);

      // Calcular estatísticas
      if (data && data.length > 0) {
        let totalChunks = 0;
        let totalChars = 0;
        
        // Buscar chunks
        const { data: chunks, error: chunksError } = await supabase
          .from('knowledge_chunks')
          .select('chunk_text');
          
        if (!chunksError && chunks) {
          totalChunks = chunks.length;
          totalChars = chunks.reduce((sum, chunk) => sum + (chunk.chunk_text?.length || 0), 0);
        }
        
        setDocumentStats({
          totalChunks,
          totalChars
        });
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Base de Conhecimento</CardTitle>
          <CardDescription>Carregando documentos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Base de Conhecimento Jurídica</CardTitle>
            <CardDescription>
              Documentos disponíveis para consulta pelo assistente jurídico
            </CardDescription>
          </div>
          <UploadDocumentButton onUploadComplete={loadDocuments} />
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum documento na base de conhecimento</p>
            <p className="text-sm">Clique no botão acima para adicionar o Código de Defesa do Consumidor</p>
          </div>
        ) : (
          <>
            {/* Estatísticas da base */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
              <div className="flex items-center space-x-2 mb-1">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-blue-800">Estatísticas da Base de Conhecimento</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white p-3 rounded border border-blue-100">
                  <p className="text-sm text-gray-600">Total de chunks</p>
                  <p className="font-bold text-lg">{documentStats.totalChunks}</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-100">
                  <p className="text-sm text-gray-600">Total de caracteres</p>
                  <p className="font-bold text-lg">{documentStats.totalChars.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {/* Lista de documentos */}
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-gray-600">{doc.file_name}</p>
                      <p className="text-xs text-gray-500">
                        Adicionado em {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tamanho: {doc.content ? (doc.content.length / 1000).toFixed(1) : '0'} KB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(doc.processed_at)}
                    <span className="text-sm">{getStatusText(doc.processed_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeBase;
