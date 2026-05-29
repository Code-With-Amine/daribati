import { prisma } from '@/lib/db'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'
import NotaireSettings from '../../../components/NotaireSettings'

async function getNotaire() {
  return prisma.user.findFirst({ where: { role: 'NOTAIRE' } })
}

export default async function SettingsPage() {
  const notaire = await getNotaire()
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6" /> Paramètres
        </h1>
        <p className="text-sm text-muted-foreground">Gérez les informations de votre compte notaire</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <NotaireSettings initialNotaire={notaire} />
        </CardContent>
      </Card>
    </div>
  )
}
