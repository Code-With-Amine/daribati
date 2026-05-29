import { prisma } from '@/lib/db'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import NotaireSettings from '../../../components/NotaireSettings'

async function getNotaire() {
  return prisma.user.findFirst({ where: { role: 'NOTAIRE' } })
}

export default async function SettingsPage() {
  const notaire = await getNotaire()
  return (
    <main className="flex-1 p-6 h-screen">
      <div className="w-full h-full">
        <h1 className="text-2xl font-bold mb-4">Paramètres du notaire</h1>
        <div className="bg-white rounded-2xl shadow p-6 w-full h-full">
          <NotaireSettings initialNotaire={notaire} />
        </div>
      </div>
    </main>
  )
}
