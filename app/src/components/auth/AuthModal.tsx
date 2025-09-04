'use client';

// =============================================================================
// MODAL DE AUTENTICAÇÃO - PitchLab
// =============================================================================

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { SuccessModal } from './SuccessModal';
import { LogIn, UserPlus, User, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'identify' | 'login' | 'register';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { identify, login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('identify');
  const [error, setError] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setShowSuccessModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let result;

      switch (mode) {
        case 'identify':
          if (!name.trim()) {
            setError('Por favor, digite seu nome');
            return;
          }
          result = await identify(name.trim());
          break;

        case 'login':
          if (!email || !password) {
            setError('Por favor, preencha todos os campos');
            return;
          }
          result = await login(email, password);
          if (!result.success) {
            setError('Email ou senha inválidos. Verifique suas credenciais e tente novamente.');
            return;
          }
          break;

        case 'register':
          if (!name.trim() || !email || !password) {
            setError('Por favor, preencha todos os campos');
            return;
          }
          if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
          }
          result = await register({ name: name.trim(), email, password });
          break;

        default:
          return;
      }

      if (result.success) {
        if (mode === 'register') {
          // Após registro, mostrar modal de sucesso e direcionar para login
          setShowSuccessModal(true);
        } else {
          // Identificação ou login bem-sucedido, fechar modal
          resetForm();
          onClose();
        }
      } else {
        setError(result.error || 'Erro desconhecido');
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetForm();
    setMode('login'); // Direcionar para login
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="relative">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <CardTitle className="text-center">
              {mode === 'identify' && 'Entrar no PitchLab'}
              {mode === 'login' && 'Login'}
              {mode === 'register' && 'Criar Conta'}
            </CardTitle>
            
            <p className="text-sm text-gray-600 text-center mt-2">
              {mode === 'identify' && 'Digite seu nome para começar'}
              {mode === 'login' && 'Entre com sua conta'}
              {mode === 'register' && 'Crie sua conta para uma experiência completa'}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome (sempre visível para identify e register) */}
              {(mode === 'identify' || mode === 'register') && (
                <Input
                  label="Nome"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              )}

              {/* Email (login e register) */}
              {(mode === 'login' || mode === 'register') && (
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              )}

              {/* Senha (login e register) */}
              {(mode === 'login' || mode === 'register') && (
                <Input
                  label="Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  helperText={mode === 'register' ? 'Mínimo 6 caracteres' : undefined}
                  required
                />
              )}

              {error && (
                <div className={`px-4 py-3 rounded-md text-sm border ${
                  mode === 'login' 
                    ? 'bg-red-50 border-red-300 text-red-800 font-medium' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                {mode === 'identify' && (
                  <>
                    <User className="mr-2" size={16} />
                    Entrar como Convidado
                  </>
                )}
                {mode === 'login' && (
                  <>
                    <LogIn className="mr-2" size={16} />
                    Fazer Login
                  </>
                )}
                {mode === 'register' && (
                  <>
                    <UserPlus className="mr-2" size={16} />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>

            {/* Navegação entre modos */}
            <div className="mt-6 space-y-2">
              {mode === 'identify' && (
                <div className="text-center text-sm">
                  <p className="text-gray-600 mb-2">Já tem uma conta?</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => switchMode('login')}
                    >
                      Fazer Login
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => switchMode('register')}
                    >
                      Criar Conta
                    </Button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="text-center text-sm space-y-2">
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Não tem conta? Criar uma agora
                  </button>
                  <br />
                  <button
                    type="button"
                    onClick={() => switchMode('identify')}
                    className="text-gray-600 hover:text-gray-800 underline"
                  >
                    Ou entrar como convidado
                  </button>
                </div>
              )}

              {mode === 'register' && (
                <div className="text-center text-sm space-y-2">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Já tem conta? Fazer login
                  </button>
                  <br />
                  <button
                    type="button"
                    onClick={() => switchMode('identify')}
                    className="text-gray-600 hover:text-gray-800 underline"
                  >
                    Ou entrar como convidado
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Cadastro Realizado!"
        message="Sua conta foi criada com sucesso. Agora você pode fazer login com suas credenciais."
        buttonText="Fazer Login"
      />
    </div>
  );
}