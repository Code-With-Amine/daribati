"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DossierEditForm({ initialDossier, clients }: { initialDossier: any; clients: any[] }) {
  const router = useRouter()
  const [title, setTitle] = React.useState(initialDossier.title || '')
  const [dossierNumber, setDossierNumber] = React.useState(initialDossier.dossierNumber || '')
  const [clientId, setClientId] = React.useState(initialDossier.clientId || '')
  const [landRef, setLandRef] = React.useState(initialDossier.landRef || '')
  const [saving, setSaving] = React.useState(false)
  const [docs, setDocs] = React.useState<any[]>(initialDossier.documents ?? [])
  const [newFile, setNewFile] = React.useState<File | null>(null)
  const [newName, setNewName] = React.useState('')
  const [newUrl, setNewUrl] = React.useState('')
  const [editingDocId, setEditingDocId] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState('')
  const [editingFile, setEditingFile] = React.useState<File | null>(null)
  const [docBusy, setDocBusy] = React.useState(false)

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
      console.error(err)
      toast.error(err?.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddDocument(e: React.FormEvent) {
    e.preventDefault()
    if (!newFile && !newUrl) return toast.error('Fichier ou URL requis')
    setDocBusy(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
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

      setNewFile(null)
      setNewName('')
      setNewUrl('')
      toast.success('Document ajouté')
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    } finally {
      setDocBusy(false)
    }
  }

  async function handleDeleteDocument(id: string) {
    if (!confirm('Supprimer ce document ?')) return
    setDocBusy(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error('Delete failed')
      setDocs((d) => d.filter((x) => x.id !== id))
      toast.success('Document supprimé')
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    } finally {
      setDocBusy(false)
    }
  }

  async function handleStartEditDoc(doc: any) {
    setEditingDocId(doc.id)
    setEditingName(doc.name || '')
    setEditingFile(null)
  }

  async function handleSaveEditDoc(e?: React.FormEvent) {
    e?.preventDefault()
    if (!editingDocId) return
    setDocBusy(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      if (editingFile) {
        const fd = new FormData()
        fd.append('name', editingName)
        fd.append('file', editingFile)
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
      setEditingDocId(null)
      setEditingName('')
      setEditingFile(null)
      toast.success('Document mis à jour')
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    } finally {
      setDocBusy(false)
    }
  }

  return (
    <div className="grid gap-3 max-w-xl p-0">
      <form onSubmit={handleSubmit} className="grid gap-3">
      <label className="block">
        <div className="text-sm">Titre</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </label>
      <label className="block">
        <div className="text-sm">Numéro</div>
        <input value={dossierNumber} onChange={(e) => setDossierNumber(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </label>
      <label className="block">
        <div className="text-sm">Client</div>
        <select value={clientId ?? ''} onChange={(e) => setClientId(e.target.value)} className="w-full border px-2 py-1 rounded">
          <option value="">— Aucun —</option>
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <div className="text-sm">Référence terrain</div>
        <input value={landRef} onChange={(e) => setLandRef(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </label>

        <div className="flex gap-2 mt-2">
          <button disabled={saving} type="submit" className="px-4 py-2 bg-[#262EE3] text-white rounded">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
          <button type="button" onClick={() => router.push(`/notaire/dossiers/${initialDossier.id}`)} className="px-4 py-2 rounded border">Annuler</button>
        </div>
      </form>

      <section className="mt-6">
        <h3 className="text-lg font-medium">Documents</h3>

        <form onSubmit={handleAddDocument} className="mt-3 flex gap-2 items-center">
          <input type="text" placeholder="Document name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} className="border px-2 py-1 rounded" />
          <input type="url" placeholder="https://... (or choose file)" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="border px-2 py-1 rounded" />
          <input type="file" onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)} />
          <button type="submit" disabled={docBusy} className="px-3 py-1 bg-green-600 text-white rounded">{docBusy ? '...' : 'Add'}</button>
        </form>

        <div className="mt-4 space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="border rounded p-3 flex items-start gap-3">
              <div className="flex-1">
                <div className="font-medium text-blue-600">{doc.name}</div>
                <div className="text-sm text-slate-500 break-all">{doc.fileUrl}</div>

                {editingDocId === doc.id ? (
                  <form onSubmit={handleSaveEditDoc} className="mt-2 flex gap-2 items-center">
                    <input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="border px-2 py-1 rounded" />
                    <input type="file" onChange={(e) => setEditingFile(e.target.files ? e.target.files[0] : null)} />
                    <button type="submit" disabled={docBusy} className="px-3 py-1 bg-[#262EE3] text-white rounded">Save</button>
                    <button type="button" onClick={() => setEditingDocId(null)} className="px-3 py-1 border rounded">Cancel</button>
                  </form>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => handleStartEditDoc(doc)} className="px-3 py-1 border rounded">Edit</button>
                    <button type="button" onClick={() => handleDeleteDocument(doc.id)} className="px-3 py-1 border rounded">Delete</button>
                    <a className="ml-auto text-sm text-slate-700" target="_blank" href={doc.fileUrl}>Open</a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
