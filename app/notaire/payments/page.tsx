import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, Euro, TrendingUp, AlertTriangle } from 'lucide-react'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  UNPAID: { label: 'Impayé', variant: 'destructive' },
  PARTIAL: { label: 'Partiel', variant: 'secondary' },
  PAID: { label: 'Payé', variant: 'default' },
}

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: { dossier: { select: { dossierNumber: true, title: true, client: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const totalUnpaid = payments.filter(p => p.status === 'UNPAID').reduce((s, p) => s + (p.amount - p.paidAmount), 0)
  const totalCollected = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.paidAmount, 0)
  const partialCount = payments.filter(p => p.status === 'PARTIAL').length

  const summaryCards = [
    { label: 'Total encaissé', value: `${totalCollected.toLocaleString('fr-FR')} DH`, icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20' },
    { label: 'Total impayé', value: `${totalUnpaid.toLocaleString('fr-FR')} DH`, icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20' },
    { label: 'Nombre de paiements', value: payments.length, icon: Euro, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Paiements partiels', value: partialCount, icon: Euro, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paiements</h1>
        <p className="text-sm text-muted-foreground">Gestion des paiements et suivi financier</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-xl p-5 ${card.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dossier</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Payé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const cfg = statusConfig[p.status] || { label: p.status, variant: 'outline' as const }
                return (
                  <TableRow key={p.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Link href={`/notaire/dossiers/${p.dossierId}`} className="font-medium text-primary hover:underline inline-flex items-center gap-1">
                        {p.dossier?.dossierNumber || p.dossierId.slice(0, 8)} <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{p.dossier?.client?.name || '—'}</TableCell>
                    <TableCell className="font-medium">{p.amount.toLocaleString('fr-FR')} DH</TableCell>
                    <TableCell className="text-sm">{p.paidAmount > 0 ? `${p.paidAmount.toLocaleString('fr-FR')} DH` : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR') : new Date(p.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                  </TableRow>
                )
              })}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Aucun paiement enregistré
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
