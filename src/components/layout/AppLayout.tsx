'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Header } from './Header';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#070710] relative">
      <AnimatedBackground />
      <Navbar />
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        <Header />
        <main className="flex-1 px-6 py-8 pb-24 md:pb-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
