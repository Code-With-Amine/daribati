"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Eye, EyeOff, Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/ui/toggole-mode";

export default function LoginPage({ className, ...props }: React.ComponentProps<'div'> & { searchParams?: any; params?: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { searchParams, params, ...safeProps } = props

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Email ou mot de passe incorrect");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `session=${data.token}; path=/; max-age=604800; SameSite=Lax`;

      if (data.user && data.user.role === "OWNER") {
        router.push("/admin");
      } else if (data.user && data.user.role === "NOTAIRE") {
        router.push("/notaire/dashboard");
      } else if (data.user && data.user.role === "CLIENT") {
        router.push("/client");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-[oklch(0.14_0.015_260)] p-6 md:p-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className={cn("flex flex-col gap-6", className)} {...safeProps}>
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-xl shadow-indigo-600/25">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">NotaireFlow</h1>
              <p className="text-sm text-indigo-300/50 tracking-wide mt-0.5">Plateforme de gestion notariale</p>
            </div>
            <ModeToggle />
          </div>

          <Card className="overflow-hidden border-0 shadow-2xl shadow-indigo-950/50 bg-[oklch(0.18_0.02_260)]">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form className="p-8 md:p-10" onSubmit={submit}>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1 mb-1">
                    <h2 className="text-xl font-semibold tracking-tight text-white">Connexion</h2>
                    <p className="text-sm text-indigo-300/50 tracking-wide">Entrez vos identifiants pour accéder à votre espace</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-medium text-indigo-200/80 tracking-wide">Email</label>
                    <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required className="bg-[oklch(0.14_0.015_260)] border-indigo-800/40 text-white placeholder:text-indigo-400/30 focus-visible:ring-indigo-500/50 h-11" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-indigo-200/80 tracking-wide">Mot de passe</label>
                      <a href="#" className="text-xs text-indigo-400/50 hover:text-indigo-300 underline-offset-2 hover:underline tracking-wide">Mot de passe oublié?</a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        className="pr-10 bg-[oklch(0.14_0.015_260)] border-indigo-800/40 text-white placeholder:text-indigo-400/30 focus-visible:ring-indigo-500/50 h-11"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400/50 hover:text-indigo-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="text-red-400 text-sm bg-red-500/10 p-3.5 rounded-xl border border-red-500/15 tracking-wide">
                      {error}
                    </div>
                  )}
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 tracking-wide font-medium">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Connexion en cours...
                      </span>
                    ) : "Se connecter"}
                  </Button>
                  <p className="text-xs text-center text-indigo-400/40 tracking-wide">
                    En cliquant sur continuer, vous acceptez nos{" "}
                    <a href="#" className="underline underline-offset-2 hover:text-indigo-300">Conditions d&apos;utilisation</a>
                  </p>
                </div>
              </form>
              <div className="relative hidden md:block bg-gradient-to-br from-indigo-600 to-indigo-800 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),transparent)]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-white relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm mb-8">
                    <Scale className="w-8 h-8 text-white/90" />
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-3 tracking-tight">NotaireFlow</h3>
                  <p className="text-center text-white/60 text-sm max-w-xs leading-relaxed tracking-wide">
                    Gérez vos dossiers, clients, documents et paiements en un seul endroit. Une solution complète pour votre étude notariale.
                  </p>
                  <div className="mt-10 grid grid-cols-3 gap-3 w-full max-w-xs">
                    {[['Sécurisé', 'Chiffrement AES-256'], ['Rapide', 'Interface fluide'], ['Moderne', 'IA intégrée']].map(([tag, sub]) => (
                      <div key={tag} className="text-center bg-white/5 rounded-xl py-3 px-2 backdrop-blur-sm border border-white/5">
                        <div className="text-xs font-semibold text-white/90 tracking-wide">{tag}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
