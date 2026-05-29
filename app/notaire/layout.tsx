import React from 'react'
import { prisma } from '@/lib/db'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export default async function NotaireLayout({ children }: { children: React.ReactNode }) {
  const notaire = await prisma.user.findFirst({ where: { role: 'NOTAIRE' } })

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <div className="min-h-screen flex">
        <AppSidebar variant="inset" user={{ name: (notaire as any)?.name ?? 'Notaire', email: (notaire as any)?.email, avatar: (notaire as any)?.avatar }} />
        <SidebarInset>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
