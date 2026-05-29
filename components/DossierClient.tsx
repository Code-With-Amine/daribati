"use client"
import React, { useState } from 'react'
import { toast } from 'sonner'

export default function DossierClient({ initialDocs, dossierId }: { initialDocs: any[], dossierId: string }) {
  const [docs, setDocs] = useState(initialDocs ?? [])
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('dossierId', dossierId)
    fd.append('name', name || file.name)
    fd.append('file', file)

    try {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: any = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch('/api/documents/upload', { method: 'POST', body: fd, headers })
      const json = await res.json()
      if (res.ok) {
        setDocs((d: any) => [json.doc, ...d])
        setFile(null)
        setName('')
      } else {
        toast.error(json.error || 'Échec du téléchargement')
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du téléchargement')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleUpload} className="flex gap-2 items-center">
  <input type="text" placeholder="Nom du document (optionnel)" value={name} onChange={(e) => setName(e.target.value)} className="border p-2" />
        <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
        <button type="submit" disabled={uploading} className="px-3 py-1 bg-blue-600 text-white rounded">
          {uploading ? 'Téléchargement...' : 'Téléverser'}
        </button>
      </form>

      <ul className="mt-4 space-y-2">
        {docs.map((d) => (
          <li key={d.id} className="flex items-center justify-between border p-3 rounded">
            <div>
              <div className="font-medium text-blue-600">{d.name}</div>
              <div className="text-sm text-slate-500">{d.fileUrl}</div>
            </div>
            <div>
              <a target="_blank" href={d.fileUrl} className="text-sm text-slate-700">View</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
