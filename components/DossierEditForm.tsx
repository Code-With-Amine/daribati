"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ChevronDown } from 'lucide-react'

export default function DossierEditForm({ initialDossier, clients }: { initialDossier: any; clients: any[] }) {
  const router = useRouter()
  const [title, setTitle] = React.useState(initialDossier.title || '')
  const [dossierNumber, setDossierNumber] = React.useState(initialDossier.dossierNumber || '')
  const [clientId, setClientId] = React.useState(initialDossier.clientId || '')
  const [landRef, setLandRef] = React.useState(initialDossier.landRef || '')
  const [clientOpen, setClientOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [docs, setDocs] = React.useState<any[]>(initialDossier.documents ?? [])
  const [newFile, setNewFile] = React.useState<File | null>(null)
  const [newName, setNewName] = React.useState('')
  const [newUrl, setNewUrl] = React.useState('')
  const [editingDocId, setEditingDocId] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState('')
  const [editingFile, setEditingFile] = React.useState<File | null>(null)
  const [docBusy, setDocBusy] = React.useState(false)

  const selectedClient = clients.find((c) => c.id === clientId)
  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase()
    return c.name.toLowerCase().includes(q) || (c.cin || '').toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  })

  function validate() {
    if (!dossierNumber || dossierNumber.trim().length === 0) {
      toast.error('Le numéro du dossier est requis')
      return false
    }
    return true
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/dossiers/${initialDossier.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ title, dossierNumber, clientId, landRef }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Update failed')
      }
      const json = await res.json()
      toast.success('Dossier mis à jour')
      router.push(`/notaire/dossiers/${json.dossier.id}`)
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>Client</Label>
          <Popover open={clientOpen} onOpenChange={setClientOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={clientOpen} className="w-full justify-between h-auto min-h-[2.5rem]">
                {selectedClient ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {selectedClient.avatar ? <AvatarImage src={selectedClient.avatar} alt={selectedClient.name} /> : null}
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{selectedClient.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{selectedClient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedClient.cin && `CIN: ${selectedClient.cin} · `}
                        {selectedClient.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Sélectionner un client...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Rechercher..." value={searchQuery} onValueChange={setSearchQuery} />
                <CommandList>
                  <CommandEmpty>Aucun client trouvé</CommandEmpty>
                  <CommandGroup>
                    {filteredClients.map((client) => (
                      <CommandItem key={client.id} value={client.id} onSelect={(currentValue) => { setClientId(currentValue); setClientOpen(false); setSearchQuery('') }}>
                        <div className="flex items-center gap-3 w-full">
                          <Avatar className="h-8 w-8">
                            {client.avatar ? <AvatarImage src={client.avatar} alt={client.name} /> : null}
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">{client.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{client.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {client.cin && `CIN: ${client.cin}`}{client.cin && ' · '}{client.email}
                            </p>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du dossier" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dossierNumber">Numéro</Label>
            <Input id="dossierNumber" value={dossierNumber} onChange={(e) => setDossierNumber(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="landRef">Référence terrain</Label>
          <Input id="landRef" value={landRef} onChange={(e) => setLandRef(e.target.value)} placeholder="Facultatif" />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
          <Button type="button" variant="outline" onClick={() => router.push(`/notaire/dossiers/${initialDossier.id}`)}>Annuler</Button>
        </div>
      </form>

      <section>
        <h3 className="text-lg font-medium mb-3">Documents</h3>
        <form onSubmit={async (e) => {
          e.preventDefault()
          if (!newFile && !newUrl) return toast.error('Fichier ou URL requis')
          setDocBusy(true)
          try {
            const token = localStorage.getItem('token')
            const headers: any = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            if (newFile) {
              const fd = new FormData()
              fd.append('dossierId', initialDossier.id)
              fd.append('name', newName || newFile.name)
              fd.append('file', newFile)
              const res = await fetch('/api/documents/upload', { method: 'POST', body: fd, headers })
              const json = await res.json()
              if (!res.ok) throw new Error(json.error || 'Upload failed')
              setDocs((d) => [json.doc, ...d])
            } else {
              const res = await fetch('/api/documents', { method: 'POST', body: JSON.stringify({ dossierId: initialDossier.id, name: newName || 'Document', fileUrl: newUrl }), headers: { ...headers, 'Content-Type': 'application/json' } })
              const json = await res.json()
              if (!res.ok) throw new Error(json.error || 'Create failed')
              setDocs((d) => [json.doc, ...d])
            }
            setNewFile(null); setNewName(''); setNewUrl('')
            toast.success('Document ajouté')
          } catch (err: any) {
            toast.error(err.message || 'Erreur')
          } finally { setDocBusy(false) }
        }} className="flex flex-wrap gap-2 items-end mb-4">
          <div className="space-y-1">
            <Label className="text-xs">Nom</Label>
            <Input type="text" placeholder="Nom" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-40" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">URL</Label>
            <Input type="url" placeholder="https://..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="w-48" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fichier</Label>
            <Input type="file" onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)} className="w-40" />
          </div>
          <Button type="submit" disabled={docBusy} size="sm">{docBusy ? '...' : 'Ajouter'}</Button>
        </form>

        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{doc.name}</span>
                  <a href={doc.fileUrl} target="_blank" className="text-xs text-primary hover:underline shrink-0">Ouvrir</a>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{doc.fileUrl}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {editingDocId === doc.id ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    setDocBusy(true)
                    try {
                      const token = localStorage.getItem('token')
                      const headers: any = {}
                      if (token) headers['Authorization'] = `Bearer ${token}`
                      if (editingFile) {
                        const fd = new FormData()
                        fd.append('name', editingName); fd.append('file', editingFile)
                        const res = await fetch(`/api/documents/${editingDocId}`, { method: 'PUT', body: fd, headers })
                        const json = await res.json()
                        if (!res.ok) throw new Error(json.error || 'Update failed')
                        setDocs((d) => d.map((it) => (it.id === json.doc.id ? json.doc : it)))
                      } else {
                        const res = await fetch(`/api/documents/${editingDocId}`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editingName }) })
                        const json = await res.json()
                        if (!res.ok) throw new Error(json.error || 'Update failed')
                        setDocs((d) => d.map((it) => (it.id === json.doc.id ? json.doc : it)))
                      }
                      setEditingDocId(null); setEditingName(''); setEditingFile(null)
                      toast.success('Document mis à jour')
                    } catch (err: any) { toast.error(err.message) } finally { setDocBusy(false) }
                  }} className="flex gap-1 items-center">
                    <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="h-8 w-32 text-xs" />
                    <Input type="file" onChange={(e) => setEditingFile(e.target.files ? e.target.files[0] : null)} className="h-8 w-24 text-xs" />
                    <Button type="submit" size="sm" variant="default" className="h-8 text-xs">Save</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingDocId(null)} className="h-8 text-xs">Cancel</Button>
                  </form>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => { setEditingDocId(doc.id); setEditingName(doc.name || ''); setEditingFile(null) }} className="h-8 text-xs">Edit</Button>
                    <Button size="sm" variant="outline" onClick={async () => {
                      if (!confirm('Supprimer ce document ?')) return
                      try {
                        const token = localStorage.getItem('token')
                        const headers: any = {}
                        if (token) headers['Authorization'] = `Bearer ${token}`
                        const res = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE', headers })
                        if (!res.ok) throw new Error('Delete failed')
                        setDocs((d) => d.filter((x) => x.id !== doc.id))
                        toast.success('Document supprimé')
                      } catch (err: any) { toast.error(err.message) }
                    }} className="h-8 text-xs">Delete</Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {docs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun document</p>}
        </div>
      </section>
    </div>
  )
}
