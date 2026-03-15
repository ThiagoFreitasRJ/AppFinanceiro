'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    if (error) {
      toast.error(error.message || 'Erro ao criar conta');
    } else {
      toast.success('Conta criada! Bem-vindo ao FinanceApp! 🎉');
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
          <p className="text-[#666666] text-sm mt-2">Comece sua jornada financeira</p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Criar conta</h2>
            <p className="text-sm text-[#666666]">É grátis e leva menos de 1 minuto</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nome"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Criar conta gratuita
            </Button>
          </form>

          <p className="text-center text-sm text-[#666666] pt-2">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-[#0066FF] hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>

        {/* Gamification teaser */}
        <div className="mt-5 bg-[#0066FF]/10 border border-[#0066FF]/20 rounded-xl px-5 py-4">
          <p className="text-xs text-[#00AAFF] text-center leading-relaxed">
            🎮 Ganhe XP, suba de nível e conquiste badges enquanto organiza suas finanças!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
