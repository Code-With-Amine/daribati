import { prisma } from '@/lib/db'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import SectionCardsDynamic from '@/components/section-cards-dynamic'
import { SiteHeader } from '@/components/site-header'

async function getData() {
  const total = await prisma.dossier.count()
  const enCours = await prisma.dossier.count({ where: { status: 'EN_COURS' } })
  const termines = await prisma.dossier.count({ where: { status: 'TERMINE' } })
  const docsCount = await prisma.document.count()

  const recent = await prisma.dossier.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { client: true },
  })

  const newClients = await prisma.user.count({ where: { role: 'CLIENT' } })

  return { total, enCours, termines, docsCount, recent, newClients }
}

export default async function NotaireDashboardPage() {
  const data = await getData()

  return (
    <main className="flex-1 p-6">
      <div className="w-full">
        <SiteHeader />
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full">
          <SectionCardsDynamic
            totalDossiers={data.total}
            enCours={data.enCours}
            termines={data.termines}
            newClients={data.newClients}
          />

          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>

          <DataTable
            data={data.recent.map((d: any) => ({
              id: String(d.id),
              dossierId: String(d.id),
              ref: d.dossierNumber ?? `REF-${d.id}`,
              client: d.client?.name ?? '—',
              date: new Date(d.createdAt).toISOString(),
              status: (d.status ?? '').replace('_', ' '),
            }))}
          />
        </div>
      </div>
    </main>
  )
}

