"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EllipsisVerticalIcon } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

export default function DossiersTable({ dossiers }: { dossiers: any[] }) {
  async function handleDelete(id: string) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/dossiers/${id}`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Dossier deleted')
      // simple client-side refresh
      window.location.reload()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  async function toggleFavorite(id: string) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/favorites/toggle`, { method: 'POST', body: JSON.stringify({ dossierId: id }), headers })
      if (!res.ok) throw new Error('Toggle failed')
      toast.success('Toggled favorite')
      window.location.reload()
    } catch (err) {
      toast.error('Failed')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Dossiers récents</h2>
        <Link href="/notaire/dossiers" className="text-sm text-muted-foreground">Voir tout</Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-muted-foreground">
              <th className="pb-2">RÉF</th>
              <th className="pb-2">CLIENT</th>
              <th className="pb-2">DATE</th>
              <th className="pb-2">STATUT</th>
              <th className="pb-2">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {dossiers.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="py-3 font-medium"><Link href={`/notaire/dossiers/${d.id}`}>{d.dossierNumber}</Link></td>
                <td className="py-3 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {d.client?.avatar ? (
                      <AvatarImage src={d.client.avatar} alt={d.client?.name} />
                    ) : (
                      <AvatarFallback>
                        <User className="size-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{d.client?.name ?? '—'}</span>
                </td>
                <td className="py-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                <td className="py-3">{(d.status ?? '').replace('_', ' ')}</td>
                <td className="py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <EllipsisVerticalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem asChild><Link href={`/notaire/dossiers/${d.id}/edit`}>Edit</Link></DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toggleFavorite(d.id)}>Favorite</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onSelect={() => handleDelete(d.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
