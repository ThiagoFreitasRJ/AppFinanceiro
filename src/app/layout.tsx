import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
