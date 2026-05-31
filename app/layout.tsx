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
  title: {
    default: "NotaireFlow | Gestion de dossiers notariaux",
    template: "%s | NotaireFlow",
  },
  description: "Plateforme de gestion numérique pour notaires. Gérez vos dossiers, clients, documents, contrats et paiements en un seul endroit. Simplifiez votre étude notariale avec NotaireFlow.",
  keywords: ["notaire", "gestion dossiers notariaux", "logiciel notaire", "étude notariale", "contrats notariés", "paiements notaires", "Maroc"],
  authors: [{ name: "NotaireFlow" }],
  creator: "NotaireFlow",
  publisher: "NotaireFlow",
  metadataBase: new URL("https://notaireflow.com"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "NotaireFlow",
    title: "NotaireFlow | Gestion de dossiers notariaux",
    description: "Plateforme numérique complète pour la gestion d'étude notariale : dossiers, contrats, paiements et communication client.",
    images: [{ url: "/icon512_rounded.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NotaireFlow | Gestion de dossiers notariaux",
    description: "Plateforme numérique complète pour la gestion d'étude notariale.",
    images: ["/icon512_rounded.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://notaireflow.com",
  },
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
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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
