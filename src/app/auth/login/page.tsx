'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error('Email ou senha inválidos');
    } else {
      toast.success('Bem-vindo de volta! 👋');
      router.push('/dashboard');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#0066FF] rounded-3xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-5 shadow-lg shadow-[#0066FF]/30">
            F
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FinanceApp</h1>
          <p className="text-[#666666] text-sm mt-2">Controle financeiro gamificado</p>
        </div>

        {/* Form */}
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Entrar</h2>
            <p className="text-sm text-[#666666]">Acesse sua conta</p>
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
            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-[#666666] pt-2">
            Não tem conta?{' '}
            <Link href="/auth/register" className="text-[#0066FF] hover:underline font-medium">
              Criar conta
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
