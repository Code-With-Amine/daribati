"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Copy, Check, Eye, EyeOff, UserPlus, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddClientDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [cin, setCin] = useState("")
  const [password, setPassword] = useState("")
  const [autoPassword, setAutoPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [createdClient, setCreatedClient] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function generatePassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$'
    let out = ''
    for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)]
    return out
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      let avatarUrl = ''
      if (avatarFile) {
        setUploadingAvatar(true)
        const formData = new FormData()
        formData.append('file', avatarFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {}, body: formData })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          avatarUrl = uploadData.url
        }
        setUploadingAvatar(false)
      }

      const genPwd = generatePassword()
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, email, phone: phone || undefined, cin: cin || undefined, password: genPwd, avatar: avatarUrl || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')

      setCreatedClient(data.client)
      setAutoPassword(genPwd)
      toast.success('Client créé avec succès')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCopyCredentials() {
    const text = `Email: ${createdClient?.email}\nMot de passe: ${autoPassword}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Identifiants copiés')
  }

  function handleShareByEmail() {
    const subject = encodeURIComponent('Vos identifiants NotaireFlow')
    const body = encodeURIComponent(
      `Bonjour ${createdClient?.name},\n\n` +
      `Votre compte client NotaireFlow a été créé.\n\n` +
      `Email: ${createdClient?.email}\n` +
      `Mot de passe: ${autoPassword}\n\n` +
      `Connectez-vous sur: ${window.location.origin}/login`
    )
    window.open(`mailto:${createdClient?.email}?subject=${subject}&body=${body}`, '_blank')
  }

  function handleClose() {
    setOpen(false)
    setName("")
    setEmail("")
    setPhone("")
    setCin("")
    setPassword("")
    setAutoPassword("")
    setCreatedClient(null)
    setCopied(false)
    setAvatarFile(null)
    setAvatarPreview(null)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true) }}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" /> Ajouter un client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{createdClient ? 'Client créé avec succès' : 'Ajouter un client'}</DialogTitle>
        </DialogHeader>

        {!createdClient ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom complet</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@email.com" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Téléphone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0612345678" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CIN</label>
                <Input value={cin} onChange={(e) => setCin(e.target.value)} placeholder="AB123456" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo (avatar)</label>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-dashed border-muted-foreground/30">
                  {avatarPreview ? <AvatarImage src={avatarPreview} /> : null}
                  <AvatarFallback className="text-xs text-muted-foreground">
                    <Upload className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    {avatarFile ? 'Changer' : 'Choisir une photo'}
                  </Button>
                  {avatarFile && <p className="text-xs text-muted-foreground mt-1">{avatarFile.name}</p>}
                </div>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              Un mot de passe sécurisé sera généré automatiquement.
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>Annuler</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer le client'}</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 text-center">
              <p className="font-semibold text-green-700 dark:text-green-400">Client créé !</p>
              <p className="text-sm text-muted-foreground mt-1">Voici les identifiants de connexion :</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm font-mono">
                {createdClient?.email}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono">
                  {showPassword ? autoPassword : '••••••••••••'}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopyCredentials} variant="outline" className="flex-1">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copié !' : 'Copier les identifiants'}
              </Button>
              <Button onClick={handleShareByEmail} className="flex-1">
                Envoyer par email
              </Button>
            </div>
            <Button variant="ghost" onClick={handleClose} className="w-full">Fermer</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
