
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, UserPlus, X, Crown } from 'lucide-react';
import Logo from '@/components/Logo';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  
  const isPremium = searchParams.get('premium') === 'true' || 
                   searchParams.get('plan') === 'premium' ||
                   searchParams.has('code');
  
  const promoCode = searchParams.get('code');
  const refSource = searchParams.get('ref');

  const { register, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isPremium) {
      console.log('Premium registration detected', { promoCode, refSource });
    }
  }, [isPremium, promoCode, refSource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    try {
      await register(name, email, password, isPremium);
      toast({
        title: "Sucesso!",
        description: isPremium ? "Conta Premium criada com sucesso!" : "Conta criada com sucesso"
      });
      navigate('/select-assistant?from=register');
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar conta",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" />
        </div>

        <Card className={`border-2 shadow-xl relative transition-all duration-300 ${
          isPremium 
            ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 dark:border-orange-800 animate-scale-in' 
            : 'border-gray-200 dark:border-gray-700'
        }`}>
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose} 
            className="absolute right-2 top-2 z-10 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>

          <CardHeader className="text-center">
            {isPremium && (
              <div className="mb-2 flex items-center justify-center animate-fade-in">
                <Crown className="h-6 w-6 text-orange-500 mr-2 animate-bounce-gentle" />
                <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm">
                  REGISTRO PREMIUM
                </span>
              </div>
            )}
            <CardTitle className={`text-2xl font-bold transition-colors ${
              isPremium 
                ? 'text-orange-700 dark:text-orange-300' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {isPremium ? 'Criar conta Premium' : 'Criar conta gratuita'}
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              {isPremium 
                ? 'Acesso completo a todos os assistentes de IA' 
                : 'Comece a usar nossos assistentes de IA hoje mesmo'
              }
            </CardDescription>
            {promoCode && (
              <div className="mt-2 bg-orange-100 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-2 animate-fade-in">
                <span className="text-orange-700 dark:text-orange-300 text-sm font-medium">
                  Código promocional: <code className="bg-orange-200 dark:bg-orange-800 px-1 rounded">{promoCode}</code>
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-gray-200">Nome completo</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Seu nome completo" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" 
                    disabled={isLoading} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" 
                    disabled={isLoading} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-200">Senha</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Mínimo 6 caracteres" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" 
                    disabled={isLoading} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="dark:text-gray-200">Confirmar senha</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Digite a senha novamente" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" 
                    disabled={isLoading} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className={`w-full font-extrabold text-lg transition-all duration-200 hover:scale-105 ${
                  isPremium 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25'
                }`}
              >
                {isLoading 
                  ? (isPremium ? "Criando conta Premium..." : "Criando conta...") 
                  : (isPremium ? "Criar conta Premium" : "Criar conta gratuita")
                }
              </Button>
            </form>

            {isPremium && (
              <div className="mt-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 animate-fade-in">
                <div className="flex items-center mb-2">
                  <Crown className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
                  <span className="text-orange-700 dark:text-orange-300 font-semibold text-sm">
                    Benefícios Premium inclusos:
                  </span>
                </div>
                <ul className="text-orange-600 dark:text-orange-400 text-xs space-y-1">
                  <li>• Acesso ilimitado a todos os assistentes</li>
                  <li>• Sem limite de mensagens</li>
                  <li>• Suporte prioritário</li>
                  <li>• Recursos exclusivos</li>
                </ul>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Já tem uma conta?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors hover:underline"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
