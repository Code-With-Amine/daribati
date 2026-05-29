import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Search, ArrowUpRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import DossierStatusBadge from '@/components/DossierStatusBadge'

async function getDossiers(searchQuery?: string) {
  const where: any = {}
  if (searchQuery && searchQuery.length >= 2) {
    where.OR = [
      { dossierNumber: { contains: searchQuery, mode: 'insensitive' } },
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { landRef: { contains: searchQuery, mode: 'insensitive' } },
      { client: { name: { contains: searchQuery, mode: 'insensitive' } } },
    ]
  }
  return prisma.dossier.findMany({
    where,
    include: { client: { select: { name: true, email: true, cin: true } } },
    orderBy: { updatedAt: 'desc' },
  })
}

export default async function DossiersPage(props: { searchParams?: Promise<{ q?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : undefined
  const q = searchParams?.q || ''
  const dossiers = await getDossiers(q)

  const stats = {
    total: dossiers.length,
    enCours: dossiers.filter((d) => d.status === 'EN_COURS').length,
    termines: dossiers.filter((d) => d.status === 'TERMINE').length,
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dossiers</h1>
          <p className="text-sm text-muted-foreground">{stats.total} dossiers · {stats.enCours} en cours · {stats.termines} terminés</p>
        </div>
        <Link href="/notaire/dossiers/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau dossier
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-primary/10 text-primary' },
          { label: 'En cours', value: stats.enCours, color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400' },
          { label: 'Terminés', value: stats.termines, color: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' },
          { label: 'Taux succès', value: stats.total > 0 ? `${Math.round((stats.termines / stats.total) * 100)}%` : '—', color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400' },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
            <p className="text-sm opacity-80">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <form method="GET" className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Rechercher par référence, titre, client..."
            className="pl-10"
          />
        </div>
      </form>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dossiers.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm font-medium">{d.dossierNumber}</TableCell>
                  <TableCell className="font-medium">{d.title || '—'}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{d.client?.name || '—'}</div>
                    {d.client?.cin && <div className="text-xs text-muted-foreground">{d.client.cin}</div>}
                  </TableCell>
                  <TableCell><DossierStatusBadge status={d.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(d.updatedAt).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/notaire/dossiers/${d.id}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Voir <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {dossiers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Aucun dossier trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
