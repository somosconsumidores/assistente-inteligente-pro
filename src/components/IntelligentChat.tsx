import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Plus, MessageCircle, Trash2, Crown, User, Bot, Image, FileText, Download, Palette, Sparkles, Menu, X } from 'lucide-react';
import { useIntelligentChat } from '@/hooks/useIntelligentChat';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUpload, FileWithPreview } from '@/components/chat/FileUpload';
import { useIsMobile } from '@/hooks/use-mobile';

const IntelligentChat: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const {
    messages,
    isLoading,
    sessions,
    currentSessionId,
    sendMessage,
    loadSessions,
    loadSession,
    startNewChat,
    deleteSession
  } = useIntelligentChat();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  // Close sidebar when selecting a session on mobile
  useEffect(() => {
    if (isMobile && currentSessionId) {
      setSidebarOpen(false);
    }
  }, [currentSessionId, isMobile]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && selectedFiles.length === 0 || isLoading) return;
    const files = selectedFiles.map(f => f.file);
    await sendMessage(inputMessage, files);
    setInputMessage('');
    setSelectedFiles([]);
  };

  const handleFileSelect = (files: FileWithPreview[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const downloadImage = async (imageUrl: string, isTransformation?: boolean) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${isTransformation ? 'imagem-transformada' : 'imagem-gerada'}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao fazer download da imagem:', error);
      window.open(imageUrl, '_blank');
    }
  };

  const renderAttachments = (attachments?: any[]) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {attachments.map((attachment, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg max-w-xs">
            {attachment.type === 'image' ? (
              <>
                <Image className="w-4 h-4 text-blue-600 flex-shrink-0" />
                {attachment.base64 && (
                  <img 
                    src={attachment.base64} 
                    alt={attachment.name} 
                    className="w-16 h-16 object-cover rounded border" 
                  />
                )}
              </>
            ) : (
              <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
            )}
            <span className="text-xs text-gray-600 truncate flex-1">
              {attachment.name}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderGeneratedImage = (imageUrl?: string, isImageGeneration?: boolean, isTransformation?: boolean) => {
    if (!imageUrl || !isImageGeneration) return null;
    
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          {isTransformation ? (
            <>
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Transformação Inteligente</span>
              <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50">
                Análise + Recriação
              </Badge>
            </>
          ) : (
            <>
              <Image className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Imagem Gerada</span>
            </>
          )}
        </div>
        <div className="relative group">
          <img 
            src={imageUrl} 
            alt={isTransformation ? "Imagem transformada por IA" : "Imagem gerada por IA"} 
            className="w-full max-w-full rounded-lg border shadow-sm" 
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => downloadImage(imageUrl, isTransformation)}
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-slate-950"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {isTransformation && (
          <div className="mt-2 text-xs text-gray-600 bg-purple-50 p-2 rounded">
            💡 Esta imagem foi criada analisando sua foto original e recriando-a no estilo solicitado
          </div>
        )}
      </div>
    );
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex h-screen bg-white relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="w-80 max-w-[85vw] h-full bg-gray-900 flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <Button onClick={startNewChat} className="flex-1 mr-2 flex items-center justify-center gap-2 bg-transparent border border-gray-600 hover:bg-gray-800 text-white h-10 rounded-md text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Nova conversa
                </Button>
                <Button onClick={() => setSidebarOpen(false)} variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-2 py-2">
                <div className="space-y-1">
                  {sessions.map(session => (
                    <div 
                      key={session.id} 
                      className={`group relative flex items-center px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                        currentSessionId === session.id ? 'bg-gray-800' : 'hover:bg-gray-800'
                      }`} 
                      onClick={() => loadSession(session.id)}
                    >
                      <MessageCircle className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-300 truncate flex-1 pr-8">
                        {session.title}
                      </span>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-1 opacity-0 group-hover:opacity-100 p-1.5 h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700" 
                        onClick={e => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  
                  {sessions.length === 0 && (
                    <div className="px-3 py-8 text-center">
                      <p className="text-sm text-gray-500">
                        Nenhuma conversa ainda
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Crown className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Chat Inteligente Premium</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Mobile Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <Button onClick={() => setSidebarOpen(true)} variant="ghost" size="sm" className="p-2">
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">ChatGPT 4</h1>
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50 px-1 py-0">
                    Online
                  </Badge>
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50 px-1 py-0">
                    <Image className="w-2 h-2 mr-1" />
                    Imagens
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 bg-white">
            <div className="w-full">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                    Como posso ajudá-lo?
                  </h2>
                  <p className="text-gray-600 text-center max-w-sm leading-relaxed mb-4">
                    Assistente IA avançado para análises, imagens e muito mais.
                  </p>
                  <div className="space-y-3 max-w-sm w-full">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Image className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">Geração de Imagens</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Use "gere uma imagem de..." para criar imagens.
                      </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span className="text-xs font-medium text-purple-800">Transformação</span>
                      </div>
                      <p className="text-xs text-purple-700">
                        Envie uma foto e peça "transforme no estilo Pixar".
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pb-4">
                  {messages.map((message, index) => (
                    <div key={index} className="px-3 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            message.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="w-3 h-3 text-white" />
                            ) : (
                              <Bot className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="prose prose-sm max-w-none">
                            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                              {formatMessage(message.content)}
                            </div>
                          </div>
                          {renderAttachments(message.attachments)}
                          {renderGeneratedImage(message.imageUrl, message.isImageGeneration, message.isTransformation)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="px-3 py-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6">
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Mobile Input Area */}
          <div className="border-t border-gray-200 bg-white safe-area-bottom">
            <div className="p-3">
              {selectedFiles.length > 0 && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((fileWithPreview, index) => (
                      <div key={index} className="relative group">
                        {fileWithPreview.type === 'image' && fileWithPreview.preview ? (
                          <div className="relative">
                            <img 
                              src={fileWithPreview.preview} 
                              alt={fileWithPreview.file.name} 
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200" 
                            />
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleFileRemove(index)} 
                              className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full"
                            >
                              ×
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                            <FileText className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-700 truncate max-w-24">
                              {fileWithPreview.file.name}
                            </span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleFileRemove(index)} 
                              className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                            >
                              ×
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="relative">
                <div className="relative flex items-end gap-2">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 bottom-3 z-10">
                      <FileUpload 
                        onFileSelect={handleFileSelect} 
                        selectedFiles={[]} 
                        onFileRemove={() => {}} 
                        disabled={isLoading} 
                      />
                    </div>
                    
                    <Input 
                      value={inputMessage} 
                      onChange={e => setInputMessage(e.target.value)} 
                      placeholder="Mensagem, gere imagem ou transforme..." 
                      disabled={isLoading} 
                      className="w-full pl-12 pr-4 py-3 min-h-[48px] text-base bg-white border border-gray-300 rounded-xl focus:border-gray-400 focus:ring-2 focus:ring-gray-200 resize-none text-black placeholder:text-gray-500" 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading || (!inputMessage.trim() && selectedFiles.length === 0)} 
                    className="h-12 w-12 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 rounded-xl p-0 flex-shrink-0"
                  >
                    <Send className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </form>
              
              <div className="mt-2 text-xs text-gray-500 text-center">
                ChatGPT pode cometer erros. • Use "gere uma imagem" ou "transforme no estilo..."
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout (keep existing)
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 flex flex-col border-r border-gray-700">
        <div className="p-3 border-b border-gray-700">
          <Button onClick={startNewChat} className="w-full flex items-center justify-center gap-2 bg-transparent border border-gray-600 hover:bg-gray-800 text-white h-11 rounded-md text-sm font-medium">
            <Plus className="w-4 h-4" />
            Nova conversa
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-1">
            {sessions.map(session => (
              <div 
                key={session.id} 
                className={`group relative flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  currentSessionId === session.id ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`} 
                onClick={() => loadSession(session.id)}
              >
                <MessageCircle className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-300 truncate flex-1 pr-8">
                  {session.title}
                </span>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 opacity-0 group-hover:opacity-100 p-1.5 h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700" 
                  onClick={e => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-gray-500">
                  Nenhuma conversa ainda
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Crown className="w-3.5 h-3.5 text-yellow-500" />
            <span>Chat Inteligente Premium</span>
          </div>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">ChatGPT 4</h1>
            <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50 px-2 py-1">
              Online
            </Badge>
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50 px-2 py-1">
              <Image className="w-3 h-3 mr-1" />
              Geração de Imagens
            </Badge>
            <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50 px-2 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Transformação Inteligente
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 bg-white">
          <div className="max-w-3xl mx-auto w-full">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
                  Como posso ajudá-lo hoje?
                </h2>
                <p className="text-gray-600 text-center max-w-md leading-relaxed mb-4">
                  Sou um assistente de IA avançado. Posso analisar imagens, documentos, e ajudá-lo com análises, criação de conteúdo, programação, matemática e muito mais.
                </p>
                <div className="space-y-4 max-w-lg">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Image className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Geração de Imagens</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Use frases como "gere uma imagem de...", "criar uma imagem de..." ou "desenhe..." para criar imagens.
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Transformação Inteligente</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Envie uma imagem e peça "transforme no estilo Pixar 3D". Eu analiso sua foto e a recrio no estilo desejado!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pb-6">
                {messages.map((message, index) => (
                  <div key={index} className="group px-4 py-6 hover:bg-gray-50/50 transition-colors">
                    <div className="max-w-3xl mx-auto flex gap-6">
                      <div className="flex-shrink-0 w-8 h-8">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="prose prose-gray max-w-none">
                          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {formatMessage(message.content)}
                          </div>
                        </div>
                        {renderAttachments(message.attachments)}
                        {renderGeneratedImage(message.imageUrl, message.isImageGeneration, message.isTransformation)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="group px-4 py-6">
                    <div className="max-w-3xl mx-auto flex gap-6">
                      <div className="flex-shrink-0 w-8 h-8">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Área de Input */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto p-4">
            {selectedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((fileWithPreview, index) => (
                    <div key={index} className="relative group">
                      {fileWithPreview.type === 'image' && fileWithPreview.preview ? (
                        <div className="relative">
                          <img 
                            src={fileWithPreview.preview} 
                            alt={fileWithPreview.file.name} 
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200" 
                          />
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleFileRemove(index)} 
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 truncate max-w-32">
                            {fileWithPreview.file.name}
                          </span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleFileRemove(index)} 
                            className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="relative">
              <div className="relative flex items-end gap-2">
                <div className="flex-1 relative">
                  <div className="absolute left-3 bottom-3 z-10">
                    <FileUpload 
                      onFileSelect={handleFileSelect} 
                      selectedFiles={[]} 
                      onFileRemove={() => {}} 
                      disabled={isLoading} 
                    />
                  </div>
                  
                  <Input 
                    value={inputMessage} 
                    onChange={e => setInputMessage(e.target.value)} 
                    placeholder="Envie uma mensagem, gere uma imagem ou transforme uma imagem..." 
                    disabled={isLoading} 
                    className="w-full pl-12 pr-4 py-3 min-h-[48px] text-base bg-white border border-gray-300 rounded-xl focus:border-gray-400 focus:ring-2 focus:ring-gray-200 resize-none text-black placeholder:text-gray-500" 
                    style={{
                      paddingTop: '12px',
                      paddingBottom: '12px'
                    }} 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || (!inputMessage.trim() && selectedFiles.length === 0)} 
                  className="h-12 w-12 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 rounded-xl p-0 flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            </form>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
              O ChatGPT pode cometer erros. Considere verificar informações importantes. • Use "gere uma imagem" para criar ou "transforme no estilo..." para transformação inteligente.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligentChat;
