import { prisma } from '@/lib/db'
import Nav from '@/components/Nav'
import FooterNav from '@/components/Footer'
import { AppSidebar } from '@/components/app-sidebar'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Single, canonical dashboard page — no duplicates
async function getData() {
  const total = await prisma.dossier.count()
  const enCours = await prisma.dossier.count({ where: { status: 'EN_COURS' } })
  const termines = await prisma.dossier.count({ where: { status: 'TERMINE' } })

  const recent = await prisma.dossier.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { client: true, statusHistory: true } })

  return { total, enCours, termines, recent }
}

async function getNotaireUser() {
  return prisma.user.findFirst({ where: { role: 'NOTAIRE' } })
}

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


//export default async function DashboardPage() {
    /*
  const [{ total, enCours, termines, recent }, notaire] = await Promise.all([getData(), getNotaireUser()])
  const successPct = total > 0 ? Math.round((termines / total) * 100) : 0

  const user = { name: notaire?.name ?? 'Maître', email: notaire?.email, avatar: notaire?.avatar }

  const navMain = [
    { title: 'Tableau de bord', url: '/notaire/dashboard' },
    { title: `Dossiers (${total})`, url: '/notaire/dossiers' },
    { title: 'Clients', url: '/notaire/clients' },
  ]

  const docs = [
    { name: `Documents (${await prisma.document.count()})`, url: '/notaire/documents' },
  ]

  const navSecondary = [{ title: 'Paramètres', url: '/notaire/settings' }]

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AppSidebar user={user} navMain={navMain} documents={docs} navSecondary={navSecondary} />

        <div className="flex-1">
          <Nav />
          <main className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold">Tableau de bord</h1>
                <p className="text-muted-foreground mt-1">Bienvenue, {user.name}. Voici un aperçu de votre activité.</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Filtrer</Button>
                <Button className="bg-primary text-primary-foreground">Exporter les données</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              import { prisma } from '@/lib/db'
              import Nav from '@/components/Nav'
              import FooterNav from '@/components/Footer'
              import { AppSidebar } from '@/components/app-sidebar'
              import Link from 'next/link'
              import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
              import { Button } from '@/components/ui/button'

              // Clean single dashboard page
              async function getData() {
                const total = await prisma.dossier.count()
                const enCours = await prisma.dossier.count({ where: { status: 'EN_COURS' } })
                const termines = await prisma.dossier.count({ where: { status: 'TERMINE' } })
                const docsCount = await prisma.document.count()

                const recent = await prisma.dossier.findMany({
                  take: 5,
                  orderBy: { createdAt: 'desc' },
                  include: { client: true },
                })

                import { prisma } from '@/lib/db'
                import Nav from '@/components/Nav'
                import FooterNav from '@/components/Footer'
                import { AppSidebar } from '@/components/app-sidebar'
                import Link from 'next/link'
                import { Button } from '@/components/ui/button'

                async function getData() {
                  const total = await prisma.dossier.count()
                  const enCours = await prisma.dossier.count({ where: { status: 'EN_COURS' } })
                  const termines = await prisma.dossier.count({ where: { status: 'TERMINE' } })
                  const docsCount = await prisma.document.count()

                  const recent = await prisma.dossier.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: { client: true },
                  })

                  return { total, enCours, termines, docsCount, recent }
                }

                async function getNotaireUser() {
                  return prisma.user.findFirst({ where: { role: 'NOTAIRE' } })
                }

                export default async function DashboardPage() {
                  const [{ total, enCours, termines, docsCount, recent }, notaire] = await Promise.all([
                    getData(),
                    getNotaireUser(),
                  ])

                  const successPct = total > 0 ? Math.round((termines / total) * 100) : 0

                  const user = { name: notaire?.name ?? 'Maître', email: notaire?.email, avatar: notaire?.avatar }

                  const navMain = [
                    { title: 'Tableau de bord', url: '/notaire/dashboard' },
                    { title: `Dossiers (${total})`, url: '/notaire/dossiers' },
                    { title: 'Clients', url: '/notaire/clients' },
                  ]

                  const docs = [{ name: `Documents (${docsCount})`, url: '/notaire/documents' }]
                  const navSecondary = [{ title: 'Paramètres', url: '/notaire/settings' }]

                  return (
                    <div className="min-h-screen bg-background">
                      <div className="flex">
                        <AppSidebar user={user} navMain={navMain} documents={docs} navSecondary={navSecondary} />

                        <div className="flex-1">
                          <Nav />
                          <main className="max-w-7xl mx-auto p-6">
                            <header className="flex items-center justify-between mb-6">
                              <div>
                                <h1 className="text-4xl font-bold">Tableau de bord</h1>
                                <p className="text-muted-foreground mt-1">Bienvenue, {user.name}. Voici un aperçu de votre activité.</p>
                              </div>

                              <div className="flex gap-2">
                                <Button variant="outline">Filtrer</Button>
                                <Button className="bg-primary text-primary-foreground">Exporter</Button>
                              </div>
                            </header>

                            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-white p-6 rounded-2xl shadow">
                                <h3 className="text-sm text-muted-foreground">Total dossiers</h3>
                                <div className="text-3xl font-bold mt-2">{total}</div>
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow">
                                <h3 className="text-sm text-muted-foreground">Dossiers en cours</h3>
                                <div className="text-3xl font-bold mt-2">{enCours}</div>
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow">
                                <h3 className="text-sm text-muted-foreground">Dossiers terminés</h3>
                                <div className="text-3xl font-bold mt-2">{termines}</div>
                                <div className="text-sm text-green-600 mt-1">{successPct}% succès</div>
                              </div>
                            </section>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="col-span-2">
                                <div className="bg-white rounded-2xl shadow p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold">Dossiers récents</h2>
                                    <Link href="/notaire/dossiers" className="text-sm text-muted-foreground">Voir tout</Link>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                      <thead>
                                        <tr className="text-sm text-muted-foreground">
                                          <th className="pb-2">RÉF</th>
                                          <th className="pb-2">CLIENT</th>
                                          <th className="pb-2">DATE</th>
                                          <th className="pb-2">STATUT</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(recent as any[]).map((d) => (
                                          <tr key={d.id} className="border-t">
                                            <td className="py-3 font-medium"><Link href={`/notaire/dossiers/${d.id}`}>{d.dossierNumber}</Link></td>
                                            <td className="py-3">{d.client?.name ?? '—'}</td>
                                            <td className="py-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3">{d.status.replace('_', ' ')}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>

                              <aside className="bg-white rounded-2xl shadow p-6">
                                <h3 className="text-lg font-semibold mb-3">Échéances</h3>
                                <div className="space-y-3 text-sm text-muted-foreground">
                                  <div className="bg-primary/5 p-3 rounded">27 Mai — Signature Acte de Vente</div>
                                  <div className="bg-amber-50 p-3 rounded">28 Mai — Audit Dossier Succession</div>
                                  <div className="bg-green-50 p-3 rounded">30 Mai — Clôture exercice mensuel</div>
                                </div>
                              </aside>
                            </div>
                          </main>
                        </div>
                      </div>
                      <FooterNav />
                    </div>
                  )
                  */               //}
