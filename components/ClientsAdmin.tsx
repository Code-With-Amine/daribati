"use client"

import * as React from 'react'
import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

export default function ClientsAdmin({ initialClients }: { initialClients: any[] }) {
  const [clients, setClients] = useState(initialClients ?? [])
  const [editing, setEditing] = useState<any | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  async function fetchClients() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: any = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch('/api/clients', { headers })
    const json = await res.json()
    if (res.ok) setClients(json.clients)
    else toast.error(json.error || 'Failed to load clients')
  }

  async function handleCreate(form: FormData) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: any = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch('/api/clients', { method: 'POST', body: form, headers })
    const json = await res.json()
    if (res.ok) {
      toast.success('Client created')
      setShowCreate(false)
      fetchClients()
    } else {
      toast.error(json.error || 'Failed to create')
    }
  }

  async function handleUpdate(id: string, form: FormData) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: any = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api/clients/${id}`, { method: 'PUT', body: form, headers })
    const json = await res.json()
    if (res.ok) {
      toast.success('Client updated')
      setEditing(null)
      fetchClients()
    } else toast.error(json.error || 'Failed to update')
  }

  async function handleDelete(id: string) {
  // confirm deletion
  if (!confirm('Delete client?')) return
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: any = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api/clients/${id}`, { method: 'DELETE', headers })
    const json = await res.json()
    if (res.ok) {
      toast.success('Client deleted')
      fetchClients()
    } else toast.error(json.error || 'Failed to delete')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Clients</h2>
        <div>
          <button onClick={() => setShowCreate(true)} className="px-3 py-1 bg-blue-600 text-white rounded">Add client</button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget as HTMLFormElement); await handleCreate(f) }} className="space-y-2 mb-4">
          <div className="flex gap-2">
            <input name="name" placeholder="Name" className="px-3 py-2 border rounded flex-1" />
            <input name="email" placeholder="Email" className="px-3 py-2 border rounded w-1/3" />
          </div>
          <div className="flex gap-2 items-center">
            <input type="file" name="avatar" />
            <button className="px-3 py-1 bg-green-600 text-white rounded">Create</button>
            <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients.map((c) => (
          <div key={c.id} className="flex items-center gap-3 border p-3 rounded">
            <div className="w-14 h-14 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
              {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" /> : <div className="text-slate-400">No photo</div>}
            </div>
            <div className="flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-slate-500">{c.email}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-yellow-500 text-white rounded" onClick={() => setEditing(c)}>Edit</button>
              <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(c.id)}>Delete</button>
            </div>

            {editing?.id === c.id && (
              <form onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget as HTMLFormElement); await handleUpdate(c.id, f) }} className="mt-3 w-full">
                <div className="flex gap-2">
                  <input name="name" defaultValue={c.name} className="px-3 py-2 border rounded flex-1" />
                  <input name="email" defaultValue={c.email} className="px-3 py-2 border rounded w-1/3" />
                </div>
                <div className="flex gap-2 items-center mt-2">
                  <input type="file" name="avatar" />
                  <button className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                  <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
