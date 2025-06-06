
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function NotificationButton() {
  const { scheduleNotification, isLoading } = useLocalNotifications();
  const { isMobile } = useMobileDeviceInfo();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleScheduleNotification = async () => {
    if (!title.trim() || !body.trim()) return;

    await scheduleNotification({
      title: title.trim(),
      body: body.trim(),
    });
    
    setTitle('');
    setBody('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={!isMobile}
          className="w-full"
        >
          <Bell className="w-4 h-4 mr-2" />
          {isMobile ? 'Notificação' : 'Notificação (Mobile)'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Notificação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da notificação"
            />
          </div>
          <div>
            <Label htmlFor="body">Mensagem</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Digite a mensagem da notificação"
              rows={3}
            />
          </div>
          <Button 
            onClick={handleScheduleNotification}
            disabled={isLoading || !title.trim() || !body.trim()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bell className="w-4 h-4 mr-2" />
            )}
            Agendar Notificação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
