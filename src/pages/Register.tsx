
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, UserPlus, X, Crown } from 'lucide-react';

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

  const {
    register,
    isLoading
  } = useAuth();
  const {
    toast
  } = useToast();
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

  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">BI</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">Biblioteca IA</span>
          </Link>
        </div>

        <Card className={`border-2 shadow-xl relative ${isPremium ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50' : 'border-gray-200'}`}>
          {/* Close button */}
          <Button variant="ghost" size="sm" onClick={handleClose} className="absolute right-2 top-2 z-10 h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </Button>

          <CardHeader className="text-center">
            {isPremium && (
              <div className="mb-2 flex items-center justify-center">
                <Crown className="h-6 w-6 text-orange-500 mr-2" />
                <span className="text-orange-600 font-semibold text-sm">REGISTRO PREMIUM</span>
              </div>
            )}
            <CardTitle className={`text-2xl font-bold ${isPremium ? 'text-orange-700' : 'text-slate-50'}`}>
              {isPremium ? 'Criar conta Premium' : 'Criar conta gratuita'}
            </CardTitle>
            <CardDescription>
              {isPremium 
                ? 'Acesso completo a todos os assistentes de IA' 
                : 'Comece a usar nossos assistentes de IA hoje mesmo'
              }
            </CardDescription>
            {promoCode && (
              <div className="mt-2 bg-orange-100 border border-orange-200 rounded-lg p-2">
                <span className="text-orange-700 text-sm font-medium">
                  Código promocional: <code className="bg-orange-200 px-1 rounded">{promoCode}</code>
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="name" type="text" placeholder="Seu nome completo" value={name} onChange={e => setName(e.target.value)} className="pl-10" disabled={isLoading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" disabled={isLoading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} className="pr-10" disabled={isLoading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Digite a senha novamente" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pr-10" disabled={isLoading} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className={`w-full font-extrabold text-lg ${
                  isPremium 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-slate-50'
                }`}
              >
                {isLoading 
                  ? (isPremium ? "Criando conta Premium..." : "Criando conta...") 
                  : (isPremium ? "Criar conta Premium" : "Criar conta gratuita")
                }
              </Button>
            </form>

            {isPremium && (
              <div className="mt-4 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <Crown className="h-4 w-4 text-orange-600 mr-2" />
                  <span className="text-orange-700 font-semibold text-sm">Benefícios Premium inclusos:</span>
                </div>
                <ul className="text-orange-600 text-xs space-y-1">
                  <li>• Acesso ilimitado a todos os assistentes</li>
                  <li>• Sem limite de mensagens</li>
                  <li>• Suporte prioritário</li>
                  <li>• Recursos exclusivos</li>
                </ul>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-50">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};

export default Register;
