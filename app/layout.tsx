import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Background } from "@/components/Scenes";
import Toasts from "@/components/Toasts";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sentinela | Auditoria e segurança da plataforma",
  description:
    "Painel de auditoria contínua: achados priorizados por risco real, superfície de ataque mapeada, triagem do programa de recompensa e reteste das correções.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={lexend.variable}>
        <StoreProvider>
          <Background />
          {children}
          <Toasts />
        </StoreProvider>
      </body>
    </html>
  );
}
