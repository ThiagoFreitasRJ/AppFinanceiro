'use client';

import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1F1F1F',
            color: '#FFFFFF',
            border: '1px solid #2A2A2A',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#00FF88', secondary: '#0A0A0A' } },
          error: { iconTheme: { primary: '#FF4444', secondary: '#0A0A0A' } },
        }}
      />
    </>
  );
}
