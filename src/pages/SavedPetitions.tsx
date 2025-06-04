
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, Calendar, FileText, Eye, ArrowLeft, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import VisualizarPeticao from '@/components/VisualizarPeticao';

interface PeticaoSalva {
  id: string;
  title: string;
  content: string;
  case_details: {
    nome: string;
    cpf: string;
    empresa: string;
    valor: string;
    relato: string;
  };
  created_at: string;
}

const SavedPetitions: React.FC = () => {
  const [petitions, setPetitions] = useState<PeticaoSalva[]>([]);
  const [selectedPetition, setSelectedPetition] = useState<PeticaoSalva | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPetitions();
  }, [user]);

  const fetchPetitions = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('saved_petitions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar petições:', error);
        throw error;
      }

      setPetitions(data || []);
    } catch (error) {
      console.error('Erro ao carregar petições:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as petições",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPetition = (petition: PeticaoSalva) => {
    setSelectedPetition(petition);
    setIsDialogOpen(true);
  };

  const handleDeletePetition = async (petitionId: string) => {
    try {
      const { error } = await supabase
        .from('saved_petitions')
        .delete()
        .eq('id', petitionId);

      if (error) throw error;

      setPetitions(prev => prev.filter(p => p.id !== petitionId));
      toast({
        title: "Sucesso",
        description: "Petição excluída com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir petição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a petição",
        variant: "destructive"
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPetition(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Scale className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p>Carregando petições...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Petições Salvas</h1>
              <p className="text-gray-600">
                Gerencie suas petições do Mestre do Direito
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {petitions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhuma petição salva
              </h3>
              <p className="text-gray-500 mb-6">
                Use o Mestre do Direito para gerar e salvar petições
              </p>
              <Button onClick={() => navigate('/direito-consumidor')}>
                Ir para Mestre do Direito
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {petitions.map((petition) => (
              <Card key={petition.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2 text-lg">{petition.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePetition(petition.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(petition.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p><strong>Cliente:</strong> {petition.case_details.nome}</p>
                      <p><strong>Empresa:</strong> {petition.case_details.empresa}</p>
                      <p><strong>Valor:</strong> {petition.case_details.valor}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleViewPetition(petition)}
                    className="w-full flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Visualizar Petição
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <VisualizarPeticao
        peticao={selectedPetition}
        isOpen={isDialogOpen}
        onClose={closeDialog}
      />
    </div>
  );
};

export default SavedPetitions;
