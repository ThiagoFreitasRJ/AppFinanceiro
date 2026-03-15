'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        setNeedsConfirmation(true);
        toast.error('Confirme seu email antes de entrar.', { duration: 5000 });
      } else if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('wrong password')) {
        toast.error('Email ou senha incorretos');
      } else {
        toast.error(error.message || 'Erro ao entrar');
      }
    } else {
      toast.success('Bem-vindo de volta! 👋');
      router.push('/dashboard');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#070710] flex items-center justify-center p-6 relative overflow-hidden">
      <AnimatedBackground />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-5 shadow-xl shadow-blue-500/25"
            whileHover={{ scale: 1.05, rotate: -2 }}
          >
            💰
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FinanceApp</h1>
          <p className="text-[#475569] text-sm mt-2">Controle financeiro gamificado</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Entrar</h2>
            <p className="text-sm text-[#475569]">Acesse sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Entrar
            </Button>
          </form>

          {needsConfirmation && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300 space-y-2">
              <p className="font-medium">📧 Email não confirmado</p>
              <p className="text-xs text-amber-400/70">Verifique sua caixa de entrada (e spam). Ou reenvie o email de confirmação.</p>
              <button
                onClick={async () => {
                  if (!email) { toast.error('Digite seu email primeiro'); return; }
                  setResendLoading(true);
                  const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
                  setResendLoading(false);
                  if (resendError) toast.error(resendError.message);
                  else toast.success('Email de confirmação reenviado!');
                }}
                disabled={resendLoading}
                className="text-xs text-amber-300 underline hover:no-underline disabled:opacity-50"
              >
                {resendLoading ? 'Enviando...' : 'Reenviar email de confirmação'}
              </button>
            </div>
          )}

          <p className="text-center text-sm text-[#475569] pt-1">
            Não tem conta?{' '}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Criar conta grátis
            </Link>
          </p>
        </div>

        {/* Gamification teaser */}
        <motion.div
          className="mt-5 bg-blue-500/8 border border-blue-500/15 rounded-xl px-5 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-[#94a3b8] text-center leading-relaxed">
            🎮 Ganhe XP, suba de nível e conquiste badges enquanto cuida das suas finanças
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
