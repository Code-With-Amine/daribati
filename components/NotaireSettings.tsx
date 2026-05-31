"use client"

import * as React from 'react'
import { useState, useRef } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function NotaireSettings({ initialNotaire }: any) {
  const [notaire, setNotaire] = useState(initialNotaire ?? {})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [receiptHeader, setReceiptHeader] = useState(initialNotaire?.receiptHeader || '')
  const [receiptFooter, setReceiptFooter] = useState(initialNotaire?.receiptFooter || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const authHeaders: any = {}
  if (token) authHeaders['Authorization'] = `Bearer ${token}`

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      let avatarUrl = notaire.avatar || ''
      if (avatarFile) {
        const fd = new FormData()
        fd.append('file', avatarFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', headers: authHeaders, body: fd })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          avatarUrl = uploadData.url
        }
      }

      const body: any = { name: notaire.name, email: notaire.email, phone: notaire.phone, receiptHeader, receiptFooter }
      if (avatarUrl) body.avatar = avatarUrl

      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (res.ok) {
        const updated = json.user ?? json.notaire ?? json
        setNotaire(updated)
        setAvatarFile(null)
        setAvatarPreview(null)
        try {
          if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(updated))
        } catch (e) {}
        toast.success('Profil mis à jour', { description: 'Vos informations ont été enregistrées.' })
      } else {
        toast.error(json.error || 'Erreur')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCurrentPassword('')
      setNewPassword('')
      toast.success('Mot de passe mis à jour')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setPasswordSaving(false)
    }
  }

  function buildDefaultHeader(): string {
    return `Étude de Maître ${notaire.name || '[Nom]'}
${notaire.phone ? `Tél: ${notaire.phone}` : ''}${notaire.email ? ` | Email: ${notaire.email}` : ''}
${'─'.repeat(38)}`
  }

  function buildDefaultFooter(): string {
    return `${' '.repeat(30)}${notaire.name || 'Notaire'}
${' '.repeat(22)}Cachet & Signature : _________________`
  }

  return (
    <form onSubmit={handleSave} className="h-full">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-4 md:col-span-1">
                <Avatar className="h-28 w-28">
                  <AvatarImage src={avatarPreview || notaire?.avatar} alt={notaire.name} />
                  <AvatarFallback>ND</AvatarFallback>
                </Avatar>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setAvatarFile(file)
                    const reader = new FileReader()
                    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
                    reader.readAsDataURL(file)
                  }
                }} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  {avatarFile ? 'Changer' : 'Choisir une photo'}
                </Button>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <Label>Nom</Label>
                  <Input value={notaire?.name || ''} onChange={(e) => setNotaire((p: any) => ({ ...p, name: e.target.value }))} placeholder="Nom" />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input value={notaire?.email || ''} onChange={(e) => setNotaire((p: any) => ({ ...p, email: e.target.value }))} placeholder="Email" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Téléphone</Label>
                    <Input value={notaire?.phone || ''} onChange={(e) => setNotaire((p: any) => ({ ...p, phone: e.target.value }))} placeholder="Téléphone" />
                  </div>
                  <div>
                    <Label>CIN</Label>
                    <Input value={notaire?.cin || ''} onChange={(e) => setNotaire((p: any) => ({ ...p, cin: e.target.value }))} placeholder="CIN" />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium mb-2">Changer le mot de passe</p>
                  <div className="space-y-2">
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Mot de passe actuel" />
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe (8 caractères min)" minLength={8} />
                    <Button type="button" variant="outline" size="sm" onClick={handlePasswordChange} disabled={passwordSaving || !currentPassword || !newPassword}>
                      {passwordSaving ? 'Enregistrement...' : 'Changer le mot de passe'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En-tête et pied de page du reçu</CardTitle>
            <p className="text-sm text-muted-foreground">
              Personnalisez l'en-tête et le pied de page des reçus de paiement générés.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>En-tête du reçu</Label>
                <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setReceiptHeader(buildDefaultHeader())}>
                  Valeurs par défaut
                </Button>
              </div>
              <Textarea value={receiptHeader} onChange={(e) => setReceiptHeader(e.target.value)}
                rows={4} className="font-mono text-xs"
                placeholder={`Étude de Maître ${notaire.name || '[Nom]'}\nTél: ${notaire.phone || ''} | Email: ${notaire.email || ''}\n${'─'.repeat(38)}`} />
              <p className="text-xs text-muted-foreground mt-1">
                Sera affiché en haut du reçu. La première ligne sert de titre.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Pied de page du reçu</Label>
                <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setReceiptFooter(buildDefaultFooter())}>
                  Valeurs par défaut
                </Button>
              </div>
              <Textarea value={receiptFooter} onChange={(e) => setReceiptFooter(e.target.value)}
                rows={4} className="font-mono text-xs"
                placeholder={`${' '.repeat(30)}${notaire.name || 'Notaire'}\n${' '.repeat(22)}Cachet & Signature : _________________`} />
              <p className="text-xs text-muted-foreground mt-1">
                Sera affiché en bas du reçu (nom, cachet, signature, etc.).
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs font-medium mb-2">Aperçu du reçu :</p>
              <pre className="text-[10px] font-mono leading-tight whitespace-pre-wrap">
{`╔══════════════════════════════════════╗
║${(receiptHeader ? receiptHeader.split('\n')[0] || 'REÇU DE PAIEMENT' : 'REÇU DE PAIEMENT').padEnd(38)}║
╠══════════════════════════════════════╣
║ N°: R-XXXX-1234                      ║
║ Date: 30 mai 2026                    ║
╠══════════════════════════════════════╣
║ Client: Client X                     ║
║ Montant: 10 000 DH                   ║
╠══════════════════════════════════════╣
║ Statut: Payé                         ║
╚══════════════════════════════════════╝
${receiptFooter || `${' '.repeat(30)}${notaire.name || 'Notaire'}\n${' '.repeat(22)}Cachet & Signature : _________________`}`}
              </pre>
            </div>
          </CardContent>
          <CardFooter>
            <div className="ml-auto">
              <Button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer les modifications'}</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
