
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Save, Check } from 'lucide-react';

interface SaveRecommendationDialogProps {
  onSave: (customName?: string) => Promise<void>;
  isLoading: boolean;
  isSaved: boolean;
  disabled?: boolean;
}

const SaveRecommendationDialog: React.FC<SaveRecommendationDialogProps> = ({
  onSave,
  isLoading,
  isSaved,
  disabled = false
}) => {
  const [customName, setCustomName] = useState('');
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    await onSave(customName.trim() || undefined);
    setOpen(false);
    setCustomName('');
  };

  if (isSaved) {
    return (
      <Button 
        disabled
        size="sm"
        className="w-full flex items-center gap-2" 
        variant="default"
      >
        <Check className="w-3 h-3" />
        Salvo no Painel
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={disabled || isLoading}
          size="sm"
          className="w-full flex items-center gap-2" 
          variant="outline"
        >
          <Save className="w-3 h-3" />
          Salvar no Painel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Salvar Recomendação</DialogTitle>
          <DialogDescription>
            Dê um nome para sua recomendação para facilitar a identificação mais tarde.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da recomendação</Label>
            <Input
              id="name"
              placeholder="Ex: Smartphones para trabalho, Notebooks gaming..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveRecommendationDialog;
