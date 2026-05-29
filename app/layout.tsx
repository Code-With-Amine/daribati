import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css";
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NotaireFlow | Gestion de dossiers notariaux",
  description: "Plateforme de gestion numérique pour notaires. Gérez vos dossiers, clients, documents et paiements en un seul endroit.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#262ee3" />
  {/* favicon uses /TNBLogo.png — overwrite this file in public/ with your logo */}
  <link rel="icon" href="/TNBLogo.png" />
  <link rel="apple-touch-icon" href="/icon512_rounded.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            {/* global toaster for sonner toasts */}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
