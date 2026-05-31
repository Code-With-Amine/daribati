"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Search, ChevronDown } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  cin?: string
  avatar?: string
}

export default function NewDossierPage() {
  const [title, setTitle] = useState('')
  const [dossierNumber, setDossierNumber] = useState('')
  const [landRef, setLandRef] = useState('')
  const [clientId, setClientId] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [clientOpen, setClientOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadClients() {
      try {
        const token = localStorage.getItem('token')
        const headers: any = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('/api/clients', { headers })
        const data = await res.json()
        setClients(data.clients || [])
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    loadClients()
  }, [])

  const selectedClient = clients.find((c) => c.id === clientId)
  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase()
    return c.name.toLowerCase().includes(q) || (c.cin || '').toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId) {
      toast.error('Veuillez sélectionner un client')
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/dossiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, dossierNumber, clientId, createdById: null, landRef }),
      })
      if (!res.ok) throw new Error('Erreur lors de la création')
      const data = await res.json()
      toast.success('Dossier créé')
      router.push(`/notaire/dossiers/${data.dossier.id}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <Link href="/notaire/dossiers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour aux dossiers
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Créer un nouveau dossier</h1>
        <p className="text-sm text-muted-foreground">Remplissez les informations pour créer un dossier notarial</p>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientOpen}
                    className="w-full justify-between h-auto min-h-[2.5rem]"
                  >
                    {selectedClient ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {selectedClient.avatar ? <AvatarImage src={selectedClient.avatar} alt={selectedClient.name} /> : null}
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">{selectedClient.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="text-sm font-medium">{selectedClient.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedClient.cin && `CIN: ${selectedClient.cin} · `}
                            {selectedClient.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sélectionner un client...</span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher par nom, CIN ou email..." value={searchQuery} onValueChange={setSearchQuery} />
                    <CommandList>
                      <CommandEmpty>
                        {fetching ? 'Chargement...' : 'Aucun client trouvé'}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredClients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.id}
                            onSelect={(currentValue) => {
                              setClientId(currentValue)
                              setClientOpen(false)
                              setSearchQuery('')
                            }}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <Avatar className="h-8 w-8">
                                {client.avatar ? <AvatarImage src={client.avatar} alt={client.name} /> : null}
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">{client.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{client.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {client.cin && `CIN: ${client.cin}`}
                                  {client.cin && ' · '}
                                  {client.email}
                                </p>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du dossier</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Vente appartement" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ref">Référence</Label>
                <Input id="ref" value={dossierNumber} onChange={(e) => setDossierNumber(e.target.value)} placeholder="Ex: DOS-2024-001" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="landRef">Référence foncière</Label>
              <Input id="landRef" value={landRef} onChange={(e) => setLandRef(e.target.value)} placeholder="Facultatif" />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading || !clientId}>
                {loading ? 'Création...' : 'Créer le dossier'}
              </Button>
              <Link href="/notaire/dossiers">
                <Button type="button" variant="outline">Annuler</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
