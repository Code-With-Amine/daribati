import { prisma } from '@/lib/db'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, FileText, Users, FolderOpen, Euro } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getData() {
  const total = await prisma.dossier.count()
  const enCours = await prisma.dossier.count({ where: { status: { not: 'TERMINE' } } })
  const termines = await prisma.dossier.count({ where: { status: 'TERMINE' } })
  const docsCount = await prisma.document.count()
  const newClients = await prisma.user.count({ where: { role: 'CLIENT' } })

  const payments = await prisma.payment.findMany({ select: { amount: true, paidAmount: true, status: true } })
  const totalRevenue = payments.filter((p: any) => p.status === 'PAID').reduce((s: number, p: any) => s + p.paidAmount, 0)
  const totalUnpaid = payments.filter((p: any) => p.status === 'UNPAID' || p.status === 'PARTIAL').reduce((s: number, p: any) => s + (p.amount - p.paidAmount), 0)

  const recent = await prisma.dossier.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { name: true } } },
  })

  // Build daily dossier activity for the last 90 days
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const allDossiers = await prisma.dossier.findMany({
    where: { createdAt: { gte: ninetyDaysAgo } },
    select: { createdAt: true, status: true },
  })

  const chartMap = new Map<string, { dossiers: number; termines: number }>()
  for (let i = 0; i < 90; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (89 - i))
    const key = d.toISOString().split('T')[0]
    chartMap.set(key, { dossiers: 0, termines: 0 })
  }

  for (const d of allDossiers) {
    const key = new Date(d.createdAt).toISOString().split('T')[0]
    if (chartMap.has(key)) {
      const entry = chartMap.get(key)!
      entry.dossiers += 1
      if (d.status === 'TERMINE') entry.termines += 1
    }
  }

  const chartData = Array.from(chartMap.entries()).map(([date, counts]) => ({
    date,
    dossiers: counts.dossiers,
    termines: counts.termines,
  }))

  return { total, enCours, termines, docsCount, recent, newClients, totalRevenue, totalUnpaid, chartData }
}

export default async function NotaireDashboardPage() {
  const data = await getData()

  const quickCards = [
    { title: 'Dossiers en cours', value: data.enCours, icon: FolderOpen, trend: `${Math.round((data.enCours / Math.max(data.total, 1)) * 100)}% du total`, href: '/notaire/dossiers' },
    { title: 'Clients', value: data.newClients, icon: Users, trend: `${data.total} dossiers`, href: '/notaire/clients' },
    { title: 'Revenu encaissé', value: `${data.totalRevenue.toLocaleString('fr-FR')} DH`, icon: Euro, trend: `${data.termines} dossiers terminés`, href: '/notaire/payments' },
    { title: 'Documents', value: data.docsCount, icon: FileText, trend: `${data.total} dossiers`, href: '/notaire/dossiers' },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm">Vue d&apos;ensemble de votre activité notariale</p>
        </div>
        <Link href="/notaire/dossiers/new">
          <Button>
            <FolderOpen className="w-4 h-4 mr-2" />
            Nouveau dossier
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {quickCards.map((card) => (
          <Link key={card.title} href={card.href} className="group">
            <Card className="transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.trend}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartAreaInteractive data={data.chartData} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Résumé financier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <span className="text-sm text-green-700 dark:text-green-400">Revenu total</span>
              <span className="font-semibold text-green-700 dark:text-green-400">{data.totalRevenue.toLocaleString('fr-FR')} DH</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <span className="text-sm text-red-700 dark:text-red-400">Impayés</span>
              <span className="font-semibold text-red-700 dark:text-red-400">{data.totalUnpaid.toLocaleString('fr-FR')} DH</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <span className="text-sm text-blue-700 dark:text-blue-400">Dossiers</span>
              <span className="font-semibold text-blue-700 dark:text-blue-400">{data.total}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dossiers récents</CardTitle>
          <Link href="/notaire/dossiers" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            Voir tout <ArrowUpRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data.recent.map((d: any) => ({
              id: String(d.id),
              dossierId: String(d.id),
              ref: d.dossierNumber ?? `REF-${d.id}`,
              client: d.client?.name ?? '—',
              date: new Date(d.createdAt).toISOString(),
              status: (d.status ?? '').replace(/_/g, ' '),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
