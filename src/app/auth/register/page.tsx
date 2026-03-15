'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

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

  const features = [
    { icon: '📊', text: 'Controle total de entradas e saídas' },
    { icon: '🎯', text: 'Defina e acompanhe objetivos financeiros' },
    { icon: '🏆', text: 'Ganhe XP e conquiste badges' },
  ];

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
            whileHover={{ scale: 1.05, rotate: 2 }}
          >
            💰
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FinanceApp</h1>
          <p className="text-[#475569] text-sm mt-2">Comece sua jornada financeira</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Criar conta</h2>
            <p className="text-sm text-[#475569]">É grátis e leva menos de 1 minuto</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" fullWidth loading={loading} size="lg">
              Criar conta gratuita
            </Button>
          </form>

          <p className="text-center text-sm text-[#475569] pt-1">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Entrar
            </Link>
          </p>
        </div>

        {/* Features */}
        <motion.div
          className="mt-5 bg-[#0f0f1a] border border-[#1e1e32] rounded-xl px-5 py-4 space-y-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-base">{f.icon}</span>
              <span className="text-xs text-[#94a3b8]">{f.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
