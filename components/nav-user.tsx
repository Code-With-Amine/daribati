"use client"

import React from 'react'
import { useRouter } from 'next/navigation'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { EllipsisVerticalIcon, CircleUserRoundIcon, CreditCardIcon, StickyNoteIcon, LogOutIcon } from "lucide-react"
import { cn } from '@/lib/utils'

export function NavUser({
  user,
}: {
  user: {
    name: string
    email?: string
    avatar?: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [clientUser, setClientUser] = React.useState<any | null>(null)
  const [notes, setNotes] = React.useState<any[]>([])
  const [notesOpen, setNotesOpen] = React.useState(false)
  const [notesLoading, setNotesLoading] = React.useState(false)

  const handleLogout = React.useCallback(async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    router.push('/login')
  }, [router])

  React.useEffect(() => {
    if (!user) {
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null')
        setClientUser(u)
      } catch (e) {}
    }
  }, [user])

  const handleNotesOpen = React.useCallback(async () => {
    setNotesOpen(true)
    setNotesLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/notes?limit=10', { headers })
      const data = await res.json()
      setNotes(data.notes || [])
    } catch (err) { console.error(err) }
    finally { setNotesLoading(false) }
  }, [])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={(user || clientUser)?.avatar} alt={(user || clientUser)?.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{(user || clientUser)?.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {(user || clientUser)?.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={(user || clientUser)?.avatar} alt={(user || clientUser)?.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{(user || clientUser)?.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {(user || clientUser)?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/notaire/settings')}>
                <CircleUserRoundIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/notaire/payments')}>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenu
                open={notesOpen}
                onOpenChange={(open) => { if (open) handleNotesOpen(); else setNotesOpen(false) }}
              >
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <StickyNoteIcon />
                    Notes
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-72 rounded-lg"
                  side="right"
                  align="start"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                    Notes récentes sur les dossiers
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notesLoading ? (
                    <div className="p-3 text-sm text-muted-foreground">Chargement...</div>
                  ) : notes.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">Aucune note</div>
                  ) : (
                    notes.slice(0, 8).map((note: any) => (
                      <DropdownMenuItem
                        key={note.id}
                        onClick={() => router.push(`/notaire/dossiers/${note.dossierId}`)}
                        className="flex-col items-start gap-0.5 py-2"
                      >
                        <span className="text-xs font-medium truncate w-full">
                          {note.dossier?.title || note.dossier?.dossierNumber || 'Dossier'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {note.content || note.note || '(sans contenu)'}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/notaire/dossiers')} className="text-xs justify-center text-muted-foreground">
                    Voir tous les dossiers
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
