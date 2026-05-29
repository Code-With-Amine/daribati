"use client"

import * as React from 'react'
import { useState, useRef } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function NotaireSettings({ initialNotaire }: any) {
  const [notaire, setNotaire] = useState(initialNotaire ?? {})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
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

      const body: any = { name: notaire.name, email: notaire.email, phone: notaire.phone }
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
