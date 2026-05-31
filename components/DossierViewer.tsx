"use client"

import React, { useState } from 'react'
import DossierClient from './DossierClient'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
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
import { FileText, StickyNote, ExternalLink, Eye, EyeOff } from 'lucide-react'

export default function DossierViewer({ dossierId, initialDocs, client }: { dossierId: string; initialDocs: any[]; client: any }) {
  const [docs, setDocs] = useState(initialDocs ?? [])
  const [editing, setEditing] = useState<any | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingNote, setEditingNote] = useState('')
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
      const isTechnical = /__TURBOPACK__|prisma|stack|at\s+/i.test(raw)
      toast.error(isTechnical ? 'Impossible de supprimer le document pour le moment.' : raw || 'Erreur')
    } finally {
      setConfirmDocOpen(false)
      setPendingDeleteId(null)
    }
  }

  async function handleDeleteDossier() { setConfirmDossierOpen(true) }

  async function confirmDeleteDossier() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/dossiers/${dossierId}`, { method: 'DELETE', headers })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Échec de la suppression')
      toast.success(json.message || 'Dossier supprimé')
      window.location.href = '/notaire/dossiers'
    } catch (err: any) {
      const raw = err?.message || ''
      const isTechnical = /__TURBOPACK__|prisma|stack|at\s+/i.test(raw)
      toast.error(isTechnical ? 'Impossible de supprimer le dossier pour le moment.' : raw || 'Erreur')
    } finally { setConfirmDossierOpen(false) }
  }

  async function handleSaveEdit() {
    setUploading(true)
    try {
      if (!editing) { toast.error("Identifiant du document manquant."); setUploading(false); return }
      const id = String(editing.id)
      if (!id || id === 'undefined') { toast.error('Identifiant du document invalide.'); setUploading(false); return }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      let res: Response
      if (editingFile) {
        const fd = new FormData()
        fd.append('name', editingName); fd.append('note', editingNote); fd.append('file', editingFile)
        res = await fetch(`/api/documents/${id}`, { method: 'PUT', body: fd, headers })
      } else {
        headers['Content-Type'] = 'application/json'
        res = await fetch(`/api/documents/${id}`, { method: 'PUT', headers, body: JSON.stringify({ name: editingName, note: editingNote }) })
      }

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Échec de la mise à jour')
      setDocs((d) => d.map((it) => (it.id === json.doc.id ? json.doc : it)))
      setEditing(null); setEditingName(''); setEditingNote(''); setEditingFile(null)
      toast.success('Document mis à jour')
    } catch (err: any) {
      const raw = err?.message || ''
      const isTechnical = /__TURBOPACK__|prisma|stack|at\s+/i.test(raw)
      toast.error(isTechnical ? 'Impossible de mettre à jour le document pour le moment.' : raw || 'Erreur')
    } finally { setUploading(false) }
  }

  async function toggleClientVisible(docId: string, current: boolean) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/documents/${docId}`, { method: 'PUT', headers, body: JSON.stringify({ clientVisible: !current }) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Erreur')
      setDocs((d) => d.map((it) => (it.id === json.doc.id ? json.doc : it)))
      toast.success(current ? 'Document masqué au client' : 'Document visible par le client')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {client?.avatar ? <AvatarImage src={client.avatar} alt={client.name} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{(client?.name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{client?.name || 'Client'}</h2>
            <div className="text-sm text-muted-foreground">{client?.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/notaire/dossiers'}>Retour</Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteDossier}>Supprimer le dossier</Button>
        </div>
      </div>

      <div className="mb-6"><DossierClient initialDocs={docs} dossierId={dossierId} /></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <div key={doc.id} className="border rounded-lg bg-card hover:shadow-md transition-shadow relative">
            {!doc.clientVisible && (
              <div className="absolute top-2 right-2 z-10">
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Masqué</span>
              </div>
            )}
            <div className="h-40 overflow-hidden flex items-center justify-center bg-muted rounded-t-lg">
              <img src={doc.fileUrl} alt={doc.name} className="max-h-full object-cover" />
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <a href={doc.fileUrl} target="_blank" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Ouvrir
                  </a>
                </div>
              </div>
              {doc.note && (
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{doc.note}</span>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Dialog open={!!editing && editing?.id === doc.id} onOpenChange={(o) => { if (!o) { setEditing(null); setEditingName(''); setEditingNote(''); setEditingFile(null) } }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => { setEditing(doc); setEditingName(doc?.name || ''); setEditingNote(doc?.note || ''); setEditingFile(null) }}>Modifier</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Modifier le document</DialogTitle></DialogHeader>
                    <form onSubmit={async (e) => { e.preventDefault(); await handleSaveEdit() }} className="space-y-3">
                      <input type="hidden" name="id" value={doc.id} />
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Nom</label>
                        <Input name="name" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Note</label>
                        <Textarea name="note" value={editingNote} onChange={(e) => setEditingNote(e.target.value)} rows={3} placeholder="Ajouter une note..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Remplacer le fichier (optionnel)</label>
                        <input type="file" name="file" onChange={(e) => setEditingFile(e.target.files ? e.target.files[0] : null)} className="text-sm" />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={uploading}>{uploading ? 'Enregistrement...' : 'Enregistrer'}</Button>
                        <Button variant="outline" onClick={() => { setEditing(null); setEditingName(''); setEditingNote(''); setEditingFile(null) }}>Annuler</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="outline" onClick={() => toggleClientVisible(doc.id, doc.clientVisible)} title={doc.clientVisible ? 'Masquer pour le client' : 'Rendre visible pour le client'}>
                  {doc.clientVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteDoc(doc.id)}>Supprimer</Button>
              </div>
            </div>
          </div>
        ))}
        {docs.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">Aucun document</div>}
      </div>

      <AlertDialog open={confirmDocOpen} onOpenChange={(o) => setConfirmDocOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer le document</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible. Voulez-vous continuer ?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setConfirmDocOpen(false); setPendingDeleteId(null) }}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeleteDoc()}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDossierOpen} onOpenChange={(o) => setConfirmDossierOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer le dossier</AlertDialogTitle><AlertDialogDescription>Supprimer le dossier et tous ses documents ? Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDossierOpen(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeleteDossier()}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
