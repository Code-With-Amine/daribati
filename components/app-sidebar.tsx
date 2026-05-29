"use client"

import * as React from "react"
import {
  IconDashboard,
  IconListDetails,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconHelp,
  IconSearch,
  IconDatabase,
  IconReport,
  IconCalculator,
  IconBuilding,
  IconMessage,
  IconHome,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavCalculators } from "@/components/nav-calculators"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ModeToggle } from '@/components/ui/toggole-mode'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    { title: "Tableau de bord", url: "/notaire/dashboard", icon: <IconDashboard className="w-5 h-5" /> },
    { title: "Dossiers", url: "/notaire/dossiers", icon: <IconListDetails className="w-5 h-5" /> },
    { title: "Clients", url: "/notaire/clients", icon: <IconUsers className="w-5 h-5" /> },
    { title: "Statistiques", url: "/notaire/dashboard", icon: <IconChartBar className="w-5 h-5" /> },
    { title: "Messages", url: "/notaire/messages", icon: <IconMessage className="w-5 h-5" /> },
    { title: "Site public", url: "/", icon: <IconHome className="w-5 h-5" /> },
  ],
  calculators: [
    { title: "Terrain Exonéré", url: "/notaire/terrainExo", icon: <IconCalculator className="w-5 h-5" /> },
    { title: "Terrain Non Exonéré", url: "/notaire/terrainNonExo", icon: <IconBuilding className="w-5 h-5" /> },
  ],
  documents: [
    { name: "Documents récents", url: "/notaire/dossiers", icon: <IconDatabase className="w-5 h-5" /> },
    { name: "Paiements", url: "/notaire/payments", icon: <IconReport className="w-5 h-5" /> },
  ],
  navSecondary: [
    { title: "Recherche", url: "/notaire/search", icon: <IconSearch className="w-5 h-5" /> },
    { title: "Paramètres", url: "/notaire/settings", icon: <IconSettings className="w-5 h-5" /> },
    { title: "Aide", url: "#", icon: <IconHelp className="w-5 h-5" /> },
  ],
}

export function AppSidebar({ user, navMain, documents, navSecondary, calculators, ...props }: { user?: any; navMain?: any; documents?: any; navSecondary?: any; calculators?: any } & React.ComponentProps<typeof Sidebar>) {
  const itemsMain = navMain ?? data.navMain
  const itemsDocs = documents ?? data.documents
  const itemsCalc = calculators ?? data.calculators
  const itemsSecondary = navSecondary ?? data.navSecondary

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-3 pt-1 pb-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-sidebar-foreground/40 uppercase">NotaireFlow</span>
          </div>
          <ModeToggle />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="/notaire/dashboard" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user?.name} />
                  ) : (
                    <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary font-medium">{(user?.name || 'N').slice(0,2)}</AvatarFallback>
                  )}
                </Avatar>
                <span className="text-base font-semibold truncate">{user?.name || 'Notaire'}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={itemsMain} />
        <NavCalculators items={itemsCalc} />
        <NavDocuments items={itemsDocs} />
        <NavSecondary items={itemsSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
