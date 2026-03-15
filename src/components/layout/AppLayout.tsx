'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Header } from './Header';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
