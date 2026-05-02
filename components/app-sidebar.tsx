"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
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
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: <IconDashboard className="w-5 h-5" />,
    },
    {
      title: "Lifecycle",
      url: "#",
      icon: <IconListDetails className="w-5 h-5" />,
    },
    {
      title: "Analytics",
      url: "#",
      icon: <IconChartBar className="w-5 h-5" />,
    },
    {
      title: "Projects",
      url: "#",
      icon: <IconFolder className="w-5 h-5" />,
    },
    {
      title: "Team",
      url: "#",
      icon: <IconUsers className="w-5 h-5" />,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: <IconCamera className="w-5 h-5" />,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: <IconFileDescription className="w-5 h-5" />,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: <IconFileAi className="w-5 h-5" />,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: <IconSettings className="w-5 h-5" />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <IconHelp className="w-5 h-5" />,
    },
    {
      title: "Search",
      url: "#",
      icon: <IconSearch className="w-5 h-5" />,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: <IconDatabase className="w-5 h-5" />,
    },
    {
      name: "Reports",
      url: "#",
      icon: <IconReport className="w-5 h-5" />,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: <IconFileWord className="w-5 h-5" />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}



/*"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  ListIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  CameraIcon,
  FileTextIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
} from "lucide-react"

export type SidebarUser = {
  name: string
  email?: string
  avatar?: string
}

export type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
}

const demo = {
  user: {
    name: "Notaire Demo",
    email: "notaire@example.com",
    avatar: "/avatars/01.png",
  },
  navMain: [
    { title: "Tableau de bord", url: "/notaire/dashboard", icon: <LayoutDashboardIcon /> },
    { title: "Dossiers", url: "/notaire/dossiers", icon: <ListIcon /> },
    { title: "Statistiques", url: "/notaire/statistiques", icon: <ChartBarIcon /> },
    { title: "Documents", url: "/notaire/documents", icon: <FolderIcon /> },
    { title: "Clients", url: "/notaire/clients", icon: <UsersIcon /> },
  ] as NavItem[],
  documents: [
    { name: "Contrat de vente", url: "/notaire/documents/contrat", icon: <FileTextIcon /> },
    { name: "Acte notarié", url: "/notaire/documents/acte", icon: <FileIcon /> },
    { name: "Extrait cadastral", url: "/notaire/documents/cadastral", icon: <FileChartColumnIcon /> },
  ],
  navSecondary: [
    { title: "Paramètres", url: "/notaire/settings", icon: <Settings2Icon /> },
    { title: "Aide", url: "/help", icon: <CircleHelpIcon /> },
  ] as NavItem[],
}

export function AppSidebar({
  user,
  navMain,
  documents,
  navSecondary,
  ...props
}: {
  user?: SidebarUser
  navMain?: NavItem[]
  documents?: { name: string; url: string; icon?: React.ReactNode }[]
  navSecondary?: NavItem[]
} & React.ComponentProps<typeof Sidebar>) {
  // Use demo data as fallback but allow pages to pass dynamic arrays/objects.
  const fallbackUser = user ?? demo.user
  const itemsMain = navMain ?? demo.navMain
  const itemsDocs = documents ?? demo.documents
  const itemsSecondary = navSecondary ?? demo.navSecondary

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/notaire/dashboard" className="flex items-center gap-2">
                  <LayoutDashboardIcon className="size-5" />
                  <span className="text-sm font-medium">Tableau de bord</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={itemsMain} />
          <NavDocuments items={itemsDocs} />
          <NavSecondary items={itemsSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={fallbackUser} />
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
*/ //}
