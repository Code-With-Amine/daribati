import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TNB Tax Calculator | Estimate Your Unpaid Taxes Instantly",
  description: "Easily calculate unpaid TNB (Taxe sur les terrains non bâtis) taxes for multiple years. Free, accurate, and optimized for property owners and developers in Morocco.",
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
