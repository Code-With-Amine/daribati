"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Eye, EyeOff } from "lucide-react";

const Field: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("flex flex-col gap-2", className)} {...props}>{children}</div>
);

const FieldGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("flex flex-col gap-4", className)} {...props}>{children}</div>
);

const FieldLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className, ...props }) => (
  <label className={cn("text-sm font-medium", className)} {...props}>{children}</label>
);

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

      if (data.user && data.user.role === "NOTAIRE") {
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
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className={cn("flex flex-col gap-6", className)} {...safeProps}>
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Scale className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">NotaireFlow</h1>
            <p className="text-sm text-muted-foreground">Plateforme de gestion notariale</p>
          </div>

          <Card className="overflow-hidden border-0 shadow-xl">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form className="p-8" onSubmit={submit}>
                <FieldGroup>
                  <div className="flex flex-col gap-1 mb-2">
                    <h2 className="text-xl font-semibold">Connexion</h2>
                    <p className="text-sm text-muted-foreground">Entrez vos identifiants pour accéder à votre espace</p>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
                  </Field>
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                      <a href="#" className="text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline">Mot de passe oublié?</a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>
                  {error && <div className="text-destructive text-sm bg-destructive/5 p-3 rounded-lg border border-destructive/10">{error}</div>}
                  <Field>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                  </Field>
                  <p className="text-xs text-center text-muted-foreground">
                    En cliquant sur continuer, vous acceptez nos{" "}
                    <a href="#" className="underline underline-offset-2 hover:text-primary">Conditions d&apos;utilisation</a>
                  </p>
                </FieldGroup>
              </form>
              <div className="relative hidden md:block bg-gradient-to-br from-primary to-primary/70">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-primary-foreground">
                  <Scale className="w-16 h-16 mb-6 opacity-80" />
                  <h3 className="text-2xl font-bold text-center mb-3">NotaireFlow</h3>
                  <p className="text-center text-primary-foreground/80 text-sm max-w-xs">
                    Gérez vos dossiers, clients, documents et paiements en un seul endroit. Une solution complète pour votre étude notariale.
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xs">
                    {['Sécurisé', 'Rapide', 'Moderne'].map((tag) => (
                      <div key={tag} className="text-center text-xs bg-primary-foreground/10 rounded-lg py-2 px-1 backdrop-blur-sm">
                        {tag}
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
