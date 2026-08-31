import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha ao autenticar. Verifique e-mail e senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-800/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
            <Scale className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Portal IA para Advogados</h1>
          <p className="text-xs text-slate-400">Inteligência Artificial de alta performance para escritórios</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advogado@escritorio.com.br"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Senha de Acesso</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Acessando...' : 'Entrar no Sistema'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Ainda não possui conta para seu escritório?{' '}
          <Link to="/register" className="text-amber-400 font-bold hover:underline">
            Cadastrar Escritório
          </Link>
        </div>
      </div>
    </div>
  );
};
