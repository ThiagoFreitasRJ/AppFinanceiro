'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase sets the session from the URL hash after redirect
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error('As senhas não coincidem'); return; }
    if (password.length < 6) { toast.error('Senha deve ter pelo menos 6 caracteres'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Senha redefinida com sucesso!');
      router.push('/dashboard');
    }
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
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-5 shadow-xl shadow-blue-500/25">
            🔑
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Nova senha</h1>
          <p className="text-[#475569] text-sm mt-2">Defina sua nova senha de acesso</p>
        </div>

        <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-8 space-y-6">
          {!ready ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-[#475569]">Verificando link de redefinição...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nova Senha"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              <Button type="submit" fullWidth loading={loading} size="lg">
                Salvar nova senha
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
