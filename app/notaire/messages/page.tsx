"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Send, MessageSquare, ArrowLeft, Search, Plus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Client {
  id: string; name: string; email: string; avatar?: string; cin?: string
}

interface Conversation {
  user: { id: string; name: string; email: string; avatar?: string }
  lastMessage: { content: string; createdAt: string }
  unread: number
}

export default function NotaireMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [clientPickerOpen, setClientPickerOpen] = useState(false)

  const selectedConv = conversations.find((c) => c.user.id === selectedUserId)
  const selectedClient = !selectedConv && selectedUserId
    ? clients.find((c) => c.id === selectedUserId)
    : null

  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); setCurrentUserId(u?.id || null) } catch {}
  }, [])

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch("/api/messages?type=conversations", { headers })
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  const fetchMessages = useCallback(async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch(`/api/messages?with=${userId}`, { headers })
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) { console.error(err) }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch("/api/clients", { headers })
      const data = await res.json()
      setClients(data.clients || [])
    } catch (err) { console.error(err) }
  }, [])

  useEffect(() => { fetchConversations(); fetchClients() }, [fetchConversations, fetchClients])
  useEffect(() => { if (selectedUserId) fetchMessages(selectedUserId) }, [selectedUserId, fetchMessages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUserId) return
    setSending(true)
    try {
      const token = localStorage.getItem("token")
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch("/api/messages", {
        method: "POST",
        headers,
        body: JSON.stringify({ receiverId: selectedUserId, content: newMessage }),
      })
      if (!res.ok) throw new Error("Erreur")
      setNewMessage("")
      await fetchMessages(selectedUserId)
      await fetchConversations()
    } catch (err: any) { toast.error(err.message) }
    finally { setSending(false) }
  }

  function handleSelectClient(client: Client) {
    setSelectedUserId(client.id)
    setClientPickerOpen(false)
  }

  const convUserIds = new Set(conversations.map((c) => c.user.id))

  return (
    <div className="flex-1 flex h-[calc(100vh-3rem)] p-6 gap-6">
      {/* Conversation list */}
      <Card className="w-80 shrink-0 overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Messages
            </CardTitle>
            <Popover open={clientPickerOpen} onOpenChange={setClientPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Plus className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Rechercher un client..." />
                  <CommandList>
                    <CommandEmpty>Aucun client trouvé</CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem key={client.id} onSelect={() => handleSelectClient(client)}>
                          <Avatar className="w-6 h-6 mr-2">
                            {client.avatar ? <AvatarImage src={client.avatar} /> : null}
                            <AvatarFallback className="text-[10px]">{client.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{client.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                          </div>
                          {convUserIds.has(client.id) && (
                            <Badge variant="outline" className="text-[10px] shrink-0">Existe</Badge>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto h-[calc(100vh-14rem)]">
          {loading ? (
            <p className="text-sm text-muted-foreground p-4">Chargement...</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">Aucune conversation. Cliquez sur + pour en démarrer une.</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.user.id}
                onClick={() => setSelectedUserId(conv.user.id)}
                className={cn(
                  "w-full text-left p-3 border-b hover:bg-muted/50 transition-colors flex items-center gap-3",
                  selectedUserId === conv.user.id && "bg-muted"
                )}
              >
                <Avatar className="w-9 h-9">
                  {conv.user.avatar ? <AvatarImage src={conv.user.avatar} /> : null}
                  <AvatarFallback className="text-xs">{conv.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conv.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.content}</p>
                </div>
                {conv.unread > 0 && <Badge className="shrink-0">{conv.unread}</Badge>}
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {selectedUserId && (selectedConv || selectedClient) ? (
          <>
            <CardHeader className="border-b shrink-0">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedUserId(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-8 h-8">
                  {(selectedConv?.user.avatar || selectedClient?.avatar) ? <AvatarImage src={selectedConv?.user.avatar || selectedClient?.avatar} /> : null}
                  <AvatarFallback className="text-xs">{(selectedConv?.user.name || selectedClient?.name || '??').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{selectedConv?.user.name || selectedClient?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedConv?.user.email || selectedClient?.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Démarrez la conversation avec {selectedConv?.user.name || selectedClient?.name}</p>
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Sélectionnez une conversation</p>
              <p className="text-xs mt-1">ou cliquez sur + pour démarrer avec un client</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
