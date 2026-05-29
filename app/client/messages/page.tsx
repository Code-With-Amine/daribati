"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ClientMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [notaireId, setNotaireId] = useState<string | null>(null)
  const [notaireName, setNotaireName] = useState("Votre notaire")
  const [fetchError, setFetchError] = useState("")

  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); setCurrentUserId(u?.id || null) } catch {}
  }, [])

  const findNotaire = useCallback(async () => {
    try {
      // Try /api/me first
      const token = localStorage.getItem("token")
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`
      const meRes = await fetch("/api/me", { headers })
      if (meRes.ok) {
        const meData = await meRes.json()
        if (meData.user?.notaireId) {
          setNotaireId(meData.user.notaireId)
          return
        }
      }
    } catch {}
    // Fallback: look up notaire from first conversation
    try {
      const token = localStorage.getItem("token")
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`
      const convRes = await fetch("/api/messages?type=conversations", { headers })
      if (convRes.ok) {
        const convData = await convRes.json()
        const convs = convData.conversations || []
        if (convs.length > 0) {
          setNotaireId(convs[0].user.id)
          setNotaireName(convs[0].user.name)
          return
        }
      }
    } catch {}
    // Last resort: fetch dossiers to find the notaire who created them
    try {
      const token = localStorage.getItem("token")
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`
      const dossRes = await fetch("/api/dossiers?mine=true", { headers })
      if (dossRes.ok) {
        const dossData = await dossRes.json()
        const doss = dossData.dossiers?.[0]
        if (doss?.createdById) {
          setNotaireId(doss.createdById)
        }
      }
    } catch {}
  }, [])

  const fetchMessages = useCallback(async (notaireIdVal: string) => {
    try {
      const token = localStorage.getItem("token")
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch(`/api/messages?with=${notaireIdVal}`, { headers })
      if (!res.ok) throw new Error("Erreur")
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err: any) { setFetchError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { findNotaire() }, [findNotaire])
  useEffect(() => { if (notaireId) fetchMessages(notaireId) }, [notaireId, fetchMessages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !notaireId) return
    setSending(true)
    try {
      const token = localStorage.getItem("token")
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch("/api/messages", {
        method: "POST",
        headers,
        body: JSON.stringify({ receiverId: notaireId, content: newMessage }),
      })
      if (!res.ok) throw new Error("Erreur")
      setNewMessage("")
      if (notaireId) await fetchMessages(notaireId)
    } catch (err: any) { toast.error(err.message) }
    finally { setSending(false) }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Chargement...</div>

  return (
    <Card className="flex flex-col h-[calc(100vh-10rem)]">
      <CardHeader className="border-b shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Messagerie
        </CardTitle>
        <p className="text-xs text-muted-foreground">Échangez avec {notaireName}</p>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4 space-y-3">
        {!notaireId ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun notaire trouvé. Veuillez contacter le support.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun message. Envoyez un message à votre notaire !</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId
            return (
              <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[70%] rounded-lg p-3 text-sm", isMine ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <p>{msg.content}</p>
                  <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                    {new Date(msg.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
      {notaireId && (
        <form onSubmit={handleSend} className="border-t p-3 flex gap-2 shrink-0">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrire un message..."
            className="min-h-[2.5rem] max-h-[6rem]"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any) } }}
          />
          <Button type="submit" disabled={sending || !newMessage.trim()} className="shrink-0 self-end">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}
    </Card>
  )
}
