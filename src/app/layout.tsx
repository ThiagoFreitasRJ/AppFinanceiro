import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "FinanceApp - Controle Financeiro Gamificado",
  description: "Gerencie suas finanças de forma inteligente e divertida",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0A0A0A] text-white antialiased font-sans">
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
      </body>
    </html>
  );
}
