"use client"

import * as React from 'react'
import { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function NotaireSettings({ initialNotaire }: any) {
  const [notaire, setNotaire] = useState(initialNotaire ?? {})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    fd.append('name', String(notaire.name || ''))
    fd.append('email', String(notaire.email || ''))
    if (password) fd.append('password', password)
    fd.append('phone', String(notaire.phone || ''))
    fd.append('cin', String(notaire.cin || ''))
    if (avatarFile) fd.append('avatar', avatarFile)

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: any = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      const res = await fetch('/api/me', { method: 'PUT', body: fd, headers })
      const json = await res.json()
      if (res.ok) {
        const updated = json.user ?? json.notaire ?? json
        setNotaire(updated)
        try {
          // persist so NavUser can pick up changes immediately
          if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(updated))
        } catch (e) {}

        const desc = password
          ? 'Vos informations et mot de passe ont été mis à jour.'
          : 'Vos informations ont été enregistrées.'

        toast.success('Profil mis à jour', { description: desc })
      } else {
        toast.error(json.error || 'Failed')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-4 md:col-span-1">
              <Avatar className="h-28 w-28">
                {notaire?.avatar ? <AvatarImage src={notaire.avatar} alt={notaire.name} /> : <AvatarFallback>ND</AvatarFallback>}
              </Avatar>
              <input type="file" onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)} />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <Label>Name</Label>
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

              <div>
                <Label>New password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (leave blank to keep)" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="ml-auto">
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
