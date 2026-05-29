"use client"

import React, { useState } from 'react'
import DossierClient from './DossierClient'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './ui/alert-dialog'
import { toast } from 'sonner'

export default function DossierViewer({ dossierId, initialDocs, client }: { dossierId: string; initialDocs: any[]; client: any }) {
  const [docs, setDocs] = useState(initialDocs ?? [])
  const [editing, setEditing] = useState<any | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingFile, setEditingFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [confirmDocOpen, setConfirmDocOpen] = useState(false)
  const [confirmDossierOpen, setConfirmDossierOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  async function handleDeleteDoc(id: string) {
    setPendingDeleteId(id)
    setConfirmDocOpen(true)
  }

  async function confirmDeleteDoc() {
    const id = pendingDeleteId
    if (!id) return
    try {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: any = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api/documents/${id}`, { method: 'DELETE', headers })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Échec de la suppression')
      setDocs((d) => d.filter((x) => x.id !== id))
      toast.success(json.message || 'Document supprimé')
    } catch (err: any) {
        const raw = err?.message || ''
        console.error('confirmDeleteDoc error:', err)
        const isTechnical = /__TURBOPACK__|prisma|stack|at\s+/i.test(raw)
        toast.error(isTechnical ? 'Impossible de supprimer le document pour le moment. Veuillez réessayer.' : raw || 'Erreur')
    } finally {
      setConfirmDocOpen(false)
      setPendingDeleteId(null)
    }
  }

  async function handleDeleteDossier() {
    setConfirmDossierOpen(true)
  }

  async function confirmDeleteDossier() {
    try {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: any = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api/dossiers/${dossierId}`, { method: 'DELETE', headers })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Échec de la suppression')
      toast.success(json.message || 'Dossier supprimé')
      // redirect to dossiers list
      window.location.href = '/notaire/dossiers'
    } catch (err: any) {
        const raw = err?.message || ''
        console.error('confirmDeleteDossier error:', err)
        const isTechnical = /__TURBOPACK__|prisma|stack|at\s+/i.test(raw)
        toast.error(isTechnical ? "Impossible de supprimer le dossier pour le moment. Veuillez réessayer." : raw || 'Erreur')
    } finally {
      setConfirmDossierOpen(false)
    }
  }

  async function handleSaveEdit() {
    setUploading(true)
    try {
      if (!editing) {
        toast.error("Identifiant du document manquant. Impossible d'enregistrer.")
        setUploading(false)
        return
      }
      const id = String(editing.id)
      if (!id || id === 'undefined') {
        toast.error('Identifiant du document invalide. Veuillez réessayer.')
        setUploading(false)
        return
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      let res: Response
      if (editingFile) {
        const fd = new FormData()
        fd.append('name', editingName)
        fd.append('file', editingFile)
        res = await fetch(`/api/documents/${id}`, { method: 'PUT', body: fd, headers })
      } else {
        headers['Content-Type'] = 'application/json'
        res = await fetch(`/api/documents/${id}`, { method: 'PUT', headers, body: JSON.stringify({ name: editingName }) })
      }

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Échec de la mise à jour')
      // replace in list
      setDocs((d) => d.map((it) => (it.id === json.doc.id ? json.doc : it)))
      setEditing(null)
      setEditingName('')
      setEditingFile(null)
      toast.success('Document mis à jour')
    } catch (err: any) {
      const raw = err?.message || ''
      console.error('handleSaveEdit error:', err)
      const isTechnical = /__TURBOPACK__|prisma|stack|at\s+/i.test(raw)
      toast.error(isTechnical ? 'Impossible de mettre à jour le document pour le moment. Veuillez réessayer.' : raw || 'Erreur')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className=""  style={{ height: '80vh', width: '80vw', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
        <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{client?.name || 'Client'}</h2>
          <div className="text-sm text-slate-500">{client?.email}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => window.location.href = '/notaire/dossiers'}>Retour</Button>
          <Button variant="destructive" onClick={handleDeleteDossier}>Supprimer le dossier</Button>
        </div>
      </div>

      <div className="mb-6">
        <DossierClient initialDocs={docs} dossierId={dossierId} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1 overflow-auto">
        {docs.map((doc) => (
          <div key={doc.id} className="border rounded p-3 bg-white shadow">
            <div className="h-40 mb-3 overflow-hidden flex items-center justify-center bg-slate-50">
              <img src={doc.fileUrl} alt={doc.name} className="max-h-full" />
            </div>
            <div className="font-medium mb-2 text-blue-600">{doc.name}</div>
            <div className="flex gap-2">
              <Dialog open={!!editing && editing?.id === doc.id} onOpenChange={(o) => { if (!o) { setEditing(null); setEditingName(''); setEditingFile(null) } }}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => { setEditing(doc); setEditingName(doc?.name || ''); setEditingFile(null) }}>Modifier</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifier le document</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={async (e) => { e.preventDefault(); await handleSaveEdit() }} className="space-y-3">
                    <input type="hidden" name="id" value={doc.id} />
                    <Input name="name" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                    <input type="file" name="file" onChange={(e) => setEditingFile(e.target.files ? e.target.files[0] : null)} />
                    <DialogFooter>
                      <Button type="submit" disabled={uploading}>{uploading ? 'Enregistrement...' : 'Enregistrer'}</Button>
                      <Button variant="outline" onClick={() => { setEditing(null); setEditingName(''); setEditingFile(null) }}>Annuler</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={() => handleDeleteDoc(doc.id)}>Supprimer</Button>
              <a className="ml-auto text-sm text-slate-700" target="_blank" href={doc.fileUrl}>Ouvrir</a>
            </div>
          </div>
        ))}
      </div>
      
      {/* Confirm delete document dialog */}
      <AlertDialog open={confirmDocOpen} onOpenChange={(o) => setConfirmDocOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le document</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Voulez-vous continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setConfirmDocOpen(false); setPendingDeleteId(null) }}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeleteDoc()}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete dossier dialog */}
      <AlertDialog open={confirmDossierOpen} onOpenChange={(o) => setConfirmDossierOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le dossier</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer le dossier et tous ses documents ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDossierOpen(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeleteDossier()}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
