
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, FileText, Scale, AlertCircle, Send, Database, Download, RotateCcw, Save } from 'lucide-react';
import { useDireitoChat } from '@/hooks/useDireitoChat';
import { useAuth } from '@/contexts/AuthContext';
import { useGerarPeticao } from '@/hooks/useGerarPeticao';
import { useSalvarPeticao } from '@/hooks/useSalvarPeticao';
import KnowledgeBase from '@/components/KnowledgeBase';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useIsMobile } from '@/hooks/use-mobile';

const DireitoConsumidor = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessage, setChatMessage] = useState('');
  const { messages, sendMessage, isLoading } = useDireitoChat();
  const { user } = useAuth();
  const { gerarPeticao, isLoading: isGeneratingPetition, peticaoGerada, dadosFormulario, limparPeticao } = useGerarPeticao();
  const { salvarPeticao, isSaving } = useSalvarPeticao();
  const isMobile = useIsMobile();

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

  const handleSalvarPeticao = async () => {
    if (peticaoGerada && dadosFormulario) {
      const sucesso = await salvarPeticao(peticaoGerada, dadosFormulario);
      if (sucesso) {
        // Petição salva com sucesso, mantém a visualização
      }
    }
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
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Mobile-optimized content wrapper */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 safe-area-bottom">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex-shrink-0">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-50">Mestre do Direito</h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                  Consultoria jurídica especializada
                </p>
              </div>
            </div>
          </div>

          {/* Mobile-optimized Navigation Tabs */}
          <div className={`flex ${isMobile ? 'flex-wrap gap-2' : 'space-x-4'} mb-6 sm:mb-8`}>
            <Button 
              variant={activeTab === 'chat' ? 'default' : 'outline'}
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 ${isMobile ? 'h-10 text-xs px-3' : 'h-10 sm:h-auto'}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Consultoria</span>
            </Button>
            {isSpecialUser && (
              <Button 
                variant={activeTab === 'knowledge' ? 'default' : 'outline'}
                onClick={() => setActiveTab('knowledge')}
                className={`flex items-center space-x-2 ${isMobile ? 'h-10 text-xs px-3' : 'h-10 sm:h-auto'}`}
              >
                <Database className="w-4 h-4" />
                <span>Base</span>
              </Button>
            )}
            <Button 
              variant={activeTab === 'petition' ? 'default' : 'outline'}
              onClick={() => setActiveTab('petition')}
              className={`flex items-center space-x-2 ${isMobile ? 'h-10 text-xs px-3' : 'h-10 sm:h-auto'}`}
            >
              <FileText className="w-4 h-4" />
              <span>Petição</span>
            </Button>
            <Button 
              variant={activeTab === 'guide' ? 'default' : 'outline'}
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-2 ${isMobile ? 'h-10 text-xs px-3' : 'h-10 sm:h-auto'}`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Guia</span>
            </Button>
          </div>

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-4 sm:space-y-6">
              <Card className="border-gray-700 bg-gray-800/50">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Consultoria Jurídica</CardTitle>
                  <CardDescription className="text-sm">Tire suas dúvidas sobre direito do consumidor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mobile-optimized chat container */}
                  <div className="h-[400px] sm:h-[500px] overflow-y-auto space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-4xl px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-slate-50 border border-gray-600'
                        }`}>
                          <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{message.content}</div>
                          {message.timestamp && (
                            <div className={`text-xs mt-2 ${
                              message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
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
                        <div className="bg-gray-700 text-slate-50 border border-gray-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <span className="text-xs sm:text-sm text-gray-300">Consultando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile-optimized input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Digite sua dúvida jurídica..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="flex-1 mobile-form-input"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={isLoading || !chatMessage.trim()}
                      className="mobile-button touch-target bg-blue-600 hover:bg-blue-700"
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
            <div className="space-y-4 sm:space-y-6">
              {!peticaoGerada ? (
                <Card className="border-gray-700 bg-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Gerador de Petição</CardTitle>
                    <CardDescription className="text-sm">Crie uma petição inicial para o Juizado Especial Cível</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="text-sm font-medium">Nome Completo *</Label>
                        <Input 
                          id="nome" 
                          placeholder="Seu nome completo"
                          value={formData.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          className="mobile-form-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpf" className="text-sm font-medium">CPF *</Label>
                        <Input 
                          id="cpf" 
                          placeholder="000.000.000-00"
                          value={formData.cpf}
                          onChange={(e) => handleInputChange('cpf', e.target.value)}
                          className="mobile-form-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="empresa" className="text-sm font-medium">Nome da Empresa *</Label>
                        <Input 
                          id="empresa" 
                          placeholder="Empresa que causou o problema"
                          value={formData.empresa}
                          onChange={(e) => handleInputChange('empresa', e.target.value)}
                          className="mobile-form-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="valor" className="text-sm font-medium">Valor do Dano *</Label>
                        <Input 
                          id="valor" 
                          placeholder="R$ 0,00"
                          value={formData.valor}
                          onChange={(e) => handleInputChange('valor', e.target.value)}
                          className="mobile-form-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relato" className="text-sm font-medium">Relato dos Fatos *</Label>
                      <Textarea 
                        id="relato" 
                        placeholder="Descreva detalhadamente o que aconteceu..."
                        className="min-h-32 mobile-form-input"
                        value={formData.relato}
                        onChange={(e) => handleInputChange('relato', e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full mobile-button mobile-button-primary"
                      onClick={handleGerarPeticao}
                      disabled={isGeneratingPetition}
                    >
                      {isGeneratingPetition ? 'Gerando Petição...' : 'Gerar Petição'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <Card className="border-gray-700 bg-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">Petição Gerada</CardTitle>
                      <CardDescription className="text-sm">Sua petição foi gerada com sucesso</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-900/50 p-4 sm:p-6 rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-200">{peticaoGerada}</pre>
                      </div>
                      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-4'}`}>
                        <Button onClick={handleSalvarPeticao} disabled={isSaving} className="mobile-button mobile-button-primary">
                          <Save className="w-4 h-4 mr-2" />
                          <span>{isSaving ? 'Salvando...' : 'Salvar Petição'}</span>
                        </Button>
                        <Button onClick={handleDownloadPeticao} variant="outline" className="mobile-button mobile-button-secondary">
                          <Download className="w-4 h-4 mr-2" />
                          <span>Baixar Petição</span>
                        </Button>
                        <Button variant="outline" onClick={handleNovaConsulta} className="mobile-button mobile-button-secondary">
                          <RotateCcw className="w-4 h-4 mr-2" />
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
            <div className="space-y-4 sm:space-y-6">
              <Card className="border-gray-700 bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Como Acionar uma Empresa no JEC</CardTitle>
                  <CardDescription className="text-sm">Passo a passo completo para entrar com ação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                      <div>
                        <h4 className="font-semibold text-slate-50 text-sm sm:text-base">Tente Resolver Amigavelmente</h4>
                        <p className="text-slate-400 text-xs sm:text-sm">Entre em contato com a empresa primeiro através dos canais oficiais.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                      <div>
                        <h4 className="font-semibold text-slate-50 text-sm sm:text-base">Procure o Procon</h4>
                        <p className="text-slate-400 text-xs sm:text-sm">Registre uma reclamação no órgão de defesa do consumidor da sua cidade.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                      <div>
                        <h4 className="font-semibold text-slate-50 text-sm sm:text-base">Reúna Documentos</h4>
                        <p className="text-slate-400 text-xs sm:text-sm">Compile notas fiscais, contratos, fotos, prints de conversas e comprovantes.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                      <div>
                        <h4 className="font-semibold text-slate-50 text-sm sm:text-base">Vá ao JEC</h4>
                        <p className="text-slate-400 text-xs sm:text-sm">Compareça ao Juizado Especial Cível mais próximo com todos os documentos.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DireitoConsumidor;
