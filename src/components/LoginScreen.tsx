import React, { useState } from 'react';
import { CheckSquare, ArrowRight, UserCheck, Loader2, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const LoginScreen: React.FC = () => {
  const { login, signUp } = useTasks();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await signUp(email.trim(), password.trim());
      } else {
        await login(email.trim(), password.trim());
      }
    } catch (err: any) {
      setError(
        err?.message || 
        (isSignUp ? 'Erro ao criar conta. Tente outro e-mail.' : 'Erro ao fazer login. Verifique suas credenciais.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mx-auto mb-5">
          <CheckSquare className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1.5">
          {isSignUp ? (
            <>Criar conta no <span className="text-blue-600 font-extrabold">TaskFlow</span></>
          ) : (
            <>Bem-vindo ao <span className="text-blue-600 font-extrabold">TaskFlow</span></>
          )}
        </h1>
        <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto mb-8">
          {isSignUp 
            ? 'Crie sua conta agora mesmo para começar a gerenciar suas tarefas e compromissos.'
            : 'Acompanhe suas tarefas diárias, agende seus compromissos e analise seu progresso de forma inteligente.'
          }
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Endereço de E-mail
            </label>
            <input
              id="login-email"
              type="email"
              required
              placeholder="Ex: admin@taskflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-700 placeholder-slate-400"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              required
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-700 placeholder-slate-400"
            />
          </div>

          {!isSignUp && (
            <div className="mt-2 text-xs text-slate-400 bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col gap-1 text-center">
              <span className="font-semibold text-slate-500">Credenciais de teste padrão:</span>
              <span>E-mail: <strong className="text-slate-600">admin@taskflow.com</strong></span>
              <span>Senha: <strong className="text-slate-600">admin123</strong></span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isSignUp ? 'Criando conta...' : 'Entrando...'}
              </>
            ) : (
              <>
                {isSignUp ? (
                  <>Criar minha conta <UserPlus className="w-4 h-4 stroke-[2.5]" /></>
                ) : (
                  <>Acessar minha conta <ArrowRight className="w-4 h-4 stroke-[2.5]" /></>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isSignUp ? (
              <span className="flex items-center justify-center gap-1"><LogIn className="w-3.5 h-3.5" /> Já tem uma conta? Faça login</span>
            ) : (
              <span className="flex items-center justify-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Não tem uma conta? Cadastre-se</span>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mt-8 pt-6 border-t border-slate-100">
          <UserCheck className="w-4 h-4" />
          <span>Dados armazenados no Supabase</span>
        </div>
      </div>
    </div>
  );
};
