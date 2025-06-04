
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Calendar, Building } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface VisualizarPeticaoProps {
  peticao: PeticaoSalva | null;
  isOpen: boolean;
  onClose: () => void;
}

const VisualizarPeticao: React.FC<VisualizarPeticaoProps> = ({ peticao, isOpen, onClose }) => {
  const handleDownload = () => {
    if (!peticao) return;
    
    const element = document.createElement('a');
    const file = new Blob([peticao.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${peticao.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!peticao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {peticao.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            Criada em {format(new Date(peticao.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Detalhes do caso */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Dados do Caso</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nome:</span> {peticao.case_details.nome}
              </div>
              <div>
                <span className="font-medium">CPF:</span> {peticao.case_details.cpf}
              </div>
              <div>
                <span className="font-medium">Empresa:</span> {peticao.case_details.empresa}
              </div>
              <div>
                <span className="font-medium">Valor:</span> {peticao.case_details.valor}
              </div>
            </div>
          </div>

          {/* Conteúdo da petição */}
          <div>
            <h3 className="font-semibold mb-3">Petição</h3>
            <div className="bg-white border p-6 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                {peticao.content}
              </pre>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={handleDownload} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Baixar Petição
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisualizarPeticao;
