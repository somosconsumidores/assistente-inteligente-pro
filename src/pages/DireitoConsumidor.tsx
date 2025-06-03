import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, FileText, Scale, AlertCircle, Send, Database, Download, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDireitoChat } from '@/hooks/useDireitoChat';
import { useAuth } from '@/contexts/AuthContext';
import { useGerarPeticao } from '@/hooks/useGerarPeticao';
import KnowledgeBase from '@/components/KnowledgeBase';

const DireitoConsumidor = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessage, setChatMessage] = useState('');
  const { messages, sendMessage, isLoading } = useDireitoChat();
  const { user } = useAuth();
  const { gerarPeticao, isLoading: isGeneratingPetition, peticaoGerada, limparPeticao } = useGerarPeticao();

  // Form states for petition
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    empresa: '',
    valor: '',
    relato: ''
  });

  // Verificar se o usuário atual é o ai01@teste.com
  const isSpecialUser = user?.email === 'ai01@teste.com';

  const handleSendMessage = async () => {
    if (chatMessage.trim() && !isLoading) {
      await sendMessage(chatMessage);
      setChatMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGerarPeticao = async () => {
    await gerarPeticao(formData);
  };

  const handleNovaConsulta = () => {
    setFormData({
      nome: '',
      cpf: '',
      empresa: '',
      valor: '',
      relato: ''
    });
    limparPeticao();
  };

  const handleDownloadPeticao = () => {
    if (!peticaoGerada) return;
    
    const element = document.createElement('a');
    const file = new Blob([peticaoGerada], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `peticao_${formData.nome.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Mestre do Direito</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <Button 
            variant={activeTab === 'chat' ? 'default' : 'outline'}
            onClick={() => setActiveTab('chat')}
            className="flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Consultoria</span>
          </Button>
          {isSpecialUser && (
            <Button 
              variant={activeTab === 'knowledge' ? 'default' : 'outline'}
              onClick={() => setActiveTab('knowledge')}
              className="flex items-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span>Base de Conhecimento</span>
            </Button>
          )}
          <Button 
            variant={activeTab === 'petition' ? 'default' : 'outline'}
            onClick={() => setActiveTab('petition')}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Petição</span>
          </Button>
          <Button 
            variant={activeTab === 'guide' ? 'default' : 'outline'}
            onClick={() => setActiveTab('guide')}
            className="flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Guia Passo a Passo</span>
          </Button>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="max-w-6xl mx-auto">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Consultoria Jurídica</CardTitle>
                <CardDescription>Tire suas dúvidas sobre direito do consumidor</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-4xl px-4 py-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.timestamp && (
                          <div className={`text-xs mt-2 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <span className="text-sm text-gray-600">Consultando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Digite sua dúvida jurídica..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !chatMessage.trim()}
                    className="px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && isSpecialUser && <KnowledgeBase />}

        {/* Petition Tab */}
        {activeTab === 'petition' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {!peticaoGerada ? (
              <Card>
                <CardHeader>
                  <CardTitle>Gerador de Petição</CardTitle>
                  <CardDescription>Crie uma petição inicial para o Juizado Especial Cível</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input 
                        id="nome" 
                        placeholder="Seu nome completo"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input 
                        id="cpf" 
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange('cpf', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="empresa">Nome da Empresa *</Label>
                      <Input 
                        id="empresa" 
                        placeholder="Empresa que causou o problema"
                        value={formData.empresa}
                        onChange={(e) => handleInputChange('empresa', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="valor">Valor do Dano *</Label>
                      <Input 
                        id="valor" 
                        placeholder="R$ 0,00"
                        value={formData.valor}
                        onChange={(e) => handleInputChange('valor', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="relato">Relato dos Fatos *</Label>
                    <Textarea 
                      id="relato" 
                      placeholder="Descreva detalhadamente o que aconteceu..."
                      className="min-h-32"
                      value={formData.relato}
                      onChange={(e) => handleInputChange('relato', e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleGerarPeticao}
                    disabled={isGeneratingPetition}
                  >
                    {isGeneratingPetition ? 'Gerando Petição...' : 'Gerar Petição'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Petição Gerada</CardTitle>
                    <CardDescription>Sua petição foi gerada com sucesso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-6 rounded-lg border">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">{peticaoGerada}</pre>
                    </div>
                    <div className="flex space-x-4 mt-6">
                      <Button onClick={handleDownloadPeticao} className="flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Baixar Petição</span>
                      </Button>
                      <Button variant="outline" onClick={handleNovaConsulta} className="flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4" />
                        <span>Nova Consulta</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Como Acionar uma Empresa no JEC</CardTitle>
                <CardDescription>Passo a passo completo para entrar com ação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Tente Resolver Amigavelmente</h4>
                    <p className="text-gray-600">Entre em contato com a empresa primeiro através dos canais oficiais.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Procure o Procon</h4>
                    <p className="text-gray-600">Registre uma reclamação no órgão de defesa do consumidor da sua cidade.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Reúna Documentos</h4>
                    <p className="text-gray-600">Compile notas fiscais, contratos, fotos, prints de conversas e comprovantes.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold">Vá ao JEC</h4>
                    <p className="text-gray-600">Compareça ao Juizado Especial Cível mais próximo com todos os documentos.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DireitoConsumidor;
