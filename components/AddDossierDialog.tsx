"use client"

import * as React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AddDossierDialog() {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [creatingClient, setCreatingClient] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPassword, setClientPassword] = useState('')
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [clientPhone, setClientPhone] = useState('')
  const [clientCin, setClientCin] = useState('')
  // no automatic email sending anymore
  const [sendEmailOnCreate, setSendEmailOnCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [dossierNumber, setDossierNumber] = useState('')
  const [documents, setDocuments] = useState<({ name: string; file?: File; fileUrl?: string })[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: any = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    fetch('/api/clients', { headers })
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => setClients([]))
  }, [open])

  async function createClient() {
    setLoading(true)
    try {
      // If admin wants to create a real client and email credentials, call /api/clients
      if (sendEmailOnCreate) {
        // Deprecated: sendEmailOnCreate no longer triggers email. Still create the client.
        const notaire = JSON.parse(localStorage.getItem('user') || 'null')
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const headers: any = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: clientName, email: clientEmail, password: clientPassword || undefined, phone: clientPhone, cin: clientCin, notaireId: notaire?.id || null }),
        })
        if (!res.ok) throw new Error('Failed to create client')
        const body = await res.json()
        if (body.client) {
          setClients((s) => [...s, body.client])
          setTempPassword(body.tempPassword || null)
          return { client: body.client }
        }
        throw new Error('No client in response')
      }

      // Otherwise, create an invitation (previous flow)
      const notaire = JSON.parse(localStorage.getItem('user') || 'null')
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: clientName, email: clientEmail, phone: clientPhone, cin: clientCin, notaireId: notaire?.id || null }),
      })
      if (!res.ok) throw new Error('Failed to create invitation')
      const body = await res.json()
      return { client: body.client }
    } finally {
      setLoading(false)
    }
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    try {
      let clientId = selectedClient
      if (!clientId && creatingClient) {
        // Create a client record and associate with this notaire; the notaire will deliver credentials manually
        const created = await createClient()
        if (created?.client) {
          clientId = created.client.id
        }
      }
      // Create the dossier first (without documents). We'll upload files after we get dossier id.
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/dossiers', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, dossierNumber, clientId: clientId || null, documents: [] }),
      })

      if (!res.ok) throw new Error('Failed to create dossier')
      const body = await res.json()
      // Now upload documents: either File objects (to /api/documents/upload) or URL entries (to /api/documents)
      const createdDossierId = body.dossier.id
      const uploadErrors: string[] = []

      for (let i = 0; i < documents.length; i++) {
        const d = documents[i]
        if (!d || (!d.file && !d.fileUrl)) continue
        try {
            if (d.file) {
            const fd = new FormData()
            fd.append('dossierId', createdDossierId)
            fd.append('name', d.name || d.file.name)
            fd.append('file', d.file)
            const headers2: any = {}
            const token2 = typeof window !== 'undefined' ? localStorage.getItem('token') : null
            if (token2) headers2['Authorization'] = `Bearer ${token2}`
            const r = await fetch('/api/documents/upload', { method: 'POST', body: fd, headers: headers2 })
            const j = await r.json()
            if (!r.ok) uploadErrors.push(j.error || `Upload failed for ${d.name || d.file.name}`)
          } else if (d.fileUrl) {
            const token3 = typeof window !== 'undefined' ? localStorage.getItem('token') : null
            const headers3: any = { 'Content-Type': 'application/json' }
            if (token3) headers3['Authorization'] = `Bearer ${token3}`
            const r = await fetch('/api/documents', { method: 'POST', body: JSON.stringify({ dossierId: createdDossierId, name: d.name || 'Document', fileUrl: d.fileUrl }), headers: headers3 })
            if (!r.ok) {
              const j = await r.json()
              uploadErrors.push(j.error || `Failed to create document ${d.name || d.fileUrl}`)
            }
          }
        } catch (err: any) {
          uploadErrors.push(err?.message || 'Unknown upload error')
        }
      }

      setOpen(false)
      if (uploadErrors.length > 0) {
        toast.error(`Dossier created but some uploads failed: ${uploadErrors.join('; ')}`)
      } else {
        toast.success('Dossier created')
      }
      router.push(`/notaire/dossiers/${createdDossierId}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Ajouter Dossier</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau dossier</DialogTitle>
          <DialogDescription>Choisissez un client existant ou créez-en un nouveau.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Client</label>
            <div className="mt-2">
              <Select onValueChange={(v) => { setSelectedClient(v); setCreatingClient(false) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select existing client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} — {c.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-2 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={creatingClient} onChange={(e) => setCreatingClient(e.target.checked)} />
                <span>Créer un nouveau client</span>
              </label>
            </div>
          </div>

          {creatingClient && (
            <div className="grid gap-2">
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nom du client" />
              <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email du client" />
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Téléphone" />
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={sendEmailOnCreate} onChange={(e) => setSendEmailOnCreate(e.target.checked)} />
                  <span>Send credentials by email</span>
                </label>
              </div>
              {sendEmailOnCreate && (
                <Input value={clientPassword} onChange={(e) => setClientPassword(e.target.value)} placeholder="Mot de passe (laisser vide pour générer)" />
              )}
              {tempPassword && (
                <div className="text-sm text-muted-foreground">
                  Mot de passe temporaire: <span className="font-medium">{tempPassword}</span>
                  <button type="button" className="ml-2 underline" onClick={() => navigator.clipboard.writeText(tempPassword)}>Copier</button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-sm text-muted-foreground">Titre</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Référence</label>
            <Input value={dossierNumber} onChange={e => setDossierNumber(e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Documents (up to 6)</label>
            <div className="grid gap-2 mt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={documents[i]?.name || ''} onChange={e => { const d = [...documents]; d[i] = { ...(d[i] || { name: '', fileUrl: '' }), name: e.target.value }; setDocuments(d) }} placeholder="Document title" />
                  <Input value={documents[i]?.fileUrl || ''} onChange={e => { const d = [...documents]; d[i] = { ...(d[i] || { name: '', fileUrl: '' }), fileUrl: e.target.value }; setDocuments(d) }} placeholder="https://..." />
                  <input type="file" onChange={e => { const f = e.target.files ? e.target.files[0] : undefined; const d = [...documents]; d[i] = { ...(d[i] || { name: '', fileUrl: '' }), file: f }; setDocuments(d) }} />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create dossier'}</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
