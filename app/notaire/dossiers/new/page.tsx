"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function NewDossierPage() {
  const [title, setTitle] = useState('')
  const [dossierNumber, setDossierNumber] = useState('')
  const [clientId, setClientId] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/dossiers', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title, dossierNumber, clientId, createdById: null, landRef: '' }) })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      router.push(`/notaire/dossiers/${data.dossier.id}`)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Créer un nouveau dossier</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Titre</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-600">Référence</label>
            <Input value={dossierNumber} onChange={e => setDossierNumber(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-600">Client (ID)</label>
            <Input value={clientId} onChange={e => setClientId(e.target.value)} placeholder="Enter client id" />
          </div>

          <Button type="submit" className="bg-[#262EE3] text-white" disabled={loading}>{loading ? 'Creating...' : 'Create dossier'}</Button>
        </form>
      </div>
    </div>
  )
}
