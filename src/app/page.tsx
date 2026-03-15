'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
      else router.push('/auth/login');
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070710] flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <motion.div
        className="flex flex-col items-center gap-5 relative z-10"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-blue-500/25">
          💰
        </div>
        <motion.div
          className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </div>
  );
}
