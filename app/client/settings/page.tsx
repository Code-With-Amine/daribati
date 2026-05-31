"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"

export default function ClientSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [email, setEmail] = useState("")
  const [emailSaving, setEmailSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  useEffect(() => {
    fetch("/api/me", { headers })
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user)
        setEmail(d.user?.email || "")
      })
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setLoading(false))
  }, [])

  async function handleEmailUpdate(e: React.FormEvent) {
    e.preventDefault()
    setEmailSaving(true)
    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers,
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUser(data.user)
      toast.success("Email mis à jour")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setEmailSaving(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordSaving(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers,
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCurrentPassword("")
      setNewPassword("")
      toast.success("Mot de passe mis à jour")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Gérez vos informations de connexion</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailUpdate} className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Votre email"
            />
            <Button type="submit" disabled={emailSaving}>
              {emailSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mettre à jour"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="w-4 h-4" /> Mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Mot de passe actuel"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Nouveau mot de passe (8 caractères min)"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Minimum 8 caractères requis</p>
            <Button type="submit" disabled={passwordSaving}>
              {passwordSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Changer le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
