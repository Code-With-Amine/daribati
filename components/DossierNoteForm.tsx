"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

export default function DossierNoteForm({ dossierId }: { dossierId: string }) {
  const [content, setContent] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch("/api/notes", {
        method: "POST",
        headers,
        body: JSON.stringify({ dossierId, content }),
      })
      if (!res.ok) throw new Error("Erreur")
      setContent("")
      setOpen(false)
      toast.success("Note ajoutée")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="w-full">
        <Plus className="w-4 h-4 mr-1" /> Ajouter une note
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écrire une note..."
        autoFocus
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !content.trim()} size="sm">
          {loading ? "..." : "Ajouter"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setOpen(false); setContent("") }}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
