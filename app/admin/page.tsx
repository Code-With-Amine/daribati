'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight, Home, Lock, Eye, EyeOff } from 'lucide-react'
import { ModeToggle } from '@/components/ui/toggole-mode'

interface Notaire {
  id: string
  name: string
  email: string
  phone: string | null
  disabled: boolean
  createdAt: string
  _count: { dossiers: number }
}

export default function AdminPage() {
  const router = useRouter()
  const [notaires, setNotaires] = useState<Notaire[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [ownerSettingsOpen, setOwnerSettingsOpen] = useState(false)
  const [ownerCurrentPassword, setOwnerCurrentPassword] = useState('')
  const [ownerNewPassword, setOwnerNewPassword] = useState('')
  const [ownerPasswordSaving, setOwnerPasswordSaving] = useState(false)
  const [showOwnerCurrent, setShowOwnerCurrent] = useState(false)
  const [showOwnerNew, setShowOwnerNew] = useState(false)

  async function handleOwnerPasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setOwnerPasswordSaving(true)
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers,
        body: JSON.stringify({ currentPassword: ownerCurrentPassword, newPassword: ownerNewPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOwnerCurrentPassword('')
      setOwnerNewPassword('')
      setOwnerSettingsOpen(false)
      alert('Mot de passe mis à jour')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setOwnerPasswordSaving(false)
    }
  }

  async function fetchNotaires() {
    const r = await fetch('/api/admin/notaires')
    if (r.status === 401 || r.status === 403) { router.push('/login'); return }
    if (r.ok) setNotaires(await r.json())
  }

  useEffect(() => {
    fetchNotaires().finally(() => setLoading(false))
  }, [])

  async function createNotaire() {
    if (!name || !email || !password) return
    setCreating(true)
    const r = await fetch('/api/admin/notaires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    })
    if (r.ok) {
      setName(''); setEmail(''); setPassword(''); setPhone('')
      await fetchNotaires()
    } else {
      const err = await r.json()
      alert(err.error || 'Error creating notaire')
    }
    setCreating(false)
  }

  async function toggleDisable(id: string, current: boolean) {
    await fetch(`/api/admin/notaires/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled: !current }),
    })
    await fetchNotaires()
  }

  async function deleteNotaire(id: string) {
    if (!confirm('Delete this notaire permanently?')) return
    await fetch(`/api/admin/notaires/${id}`, { method: 'DELETE' })
    await fetchNotaires()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[oklch(0.18_0.02_260)] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-indigo-200/60 text-sm mt-1">Manage notaire accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-indigo-200/60 hover:text-white">
                <Home className="h-4 w-4 mr-1" /> Accueil
              </Button>
            </Link>
            <ModeToggle />
            <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Notaire
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Notaire</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <Input placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} />
                <Button className="w-full" onClick={createNotaire} disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </div>
            </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" className="text-indigo-200/60 hover:text-white" onClick={() => setOwnerSettingsOpen(!ownerSettingsOpen)}>
              <Lock className="h-4 w-4 mr-1" /> {ownerSettingsOpen ? 'Fermer' : 'Mot de passe'}
            </Button>
          </div>
        </div>

        {ownerSettingsOpen && (
          <div className="mb-6 rounded-lg border border-indigo-800/40 bg-[oklch(0.22_0.025_260)] p-6">
            <h3 className="text-white font-semibold mb-4">Changer votre mot de passe (Admin)</h3>
            <form onSubmit={handleOwnerPasswordChange} className="space-y-3 max-w-md">
              <div className="relative">
                <Input
                  type={showOwnerCurrent ? 'text' : 'password'}
                  placeholder="Mot de passe actuel"
                  value={ownerCurrentPassword}
                  onChange={e => setOwnerCurrentPassword(e.target.value)}
                  required
                  className="bg-[oklch(0.18_0.02_260)] border-indigo-800/40 text-white placeholder:text-indigo-200/30"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-200/40" onClick={() => setShowOwnerCurrent(!showOwnerCurrent)}>
                  {showOwnerCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showOwnerNew ? 'text' : 'password'}
                  placeholder="Nouveau mot de passe (8 caractères min)"
                  value={ownerNewPassword}
                  onChange={e => setOwnerNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-[oklch(0.18_0.02_260)] border-indigo-800/40 text-white placeholder:text-indigo-200/30"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-200/40" onClick={() => setShowOwnerNew(!showOwnerNew)}>
                  {showOwnerNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" disabled={ownerPasswordSaving} className="bg-indigo-600 hover:bg-indigo-500">
                {ownerPasswordSaving ? 'Enregistrement...' : 'Changer le mot de passe'}
              </Button>
            </form>
          </div>
        )}

        <div className="rounded-lg border border-indigo-800/40 bg-[oklch(0.22_0.025_260)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-indigo-800/40 hover:bg-transparent">
                <TableHead className="text-indigo-200/60">Name</TableHead>
                <TableHead className="text-indigo-200/60">Email</TableHead>
                <TableHead className="text-indigo-200/60">Phone</TableHead>
                <TableHead className="text-indigo-200/60 text-center">Dossiers</TableHead>
                <TableHead className="text-indigo-200/60 text-center">Status</TableHead>
                <TableHead className="text-indigo-200/60 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notaires.map(n => (
                <TableRow key={n.id} className="border-indigo-800/40 hover:bg-indigo-900/20">
                  <TableCell className="font-medium text-white">{n.name}</TableCell>
                  <TableCell className="text-indigo-200/80">{n.email}</TableCell>
                  <TableCell className="text-indigo-200/60">{n.phone || '—'}</TableCell>
                  <TableCell className="text-center text-indigo-200/80">{n._count.dossiers}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={n.disabled ? 'destructive' : 'default'} className={n.disabled ? '' : 'bg-emerald-600'}>
                      {n.disabled ? 'Disabled' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleDisable(n.id, n.disabled)}>
                        {n.disabled ? <ToggleRight className="h-4 w-4 text-emerald-400" /> : <ToggleLeft className="h-4 w-4 text-amber-400" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteNotaire(n.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {notaires.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-indigo-200/40 py-12">
                    No notaires yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
