import { prisma } from '@/lib/db'
import DossierViewer from '@/components/DossierViewer'
import DossierPayments from '@/components/DossierPayments'
import DossierContract from '@/components/DossierContract'
import DossierStatusBadge from '@/components/DossierStatusBadge'
import DossierStatusStepperWrapper from '@/components/DossierStatusStepperWrapper'
import DossierNoteForm from '@/components/DossierNoteForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Mail, Phone, User, Clock, Download } from 'lucide-react'

async function getDossier(idOrRef: string) {
  const isUuid = /^[0-9a-fA-F-]{36}$/.test(idOrRef)
  const include = {
    documents: { orderBy: { createdAt: 'desc' as const } },
    client: { select: { id: true, name: true, email: true, phone: true, cin: true } },
    statusHistory: { orderBy: { createdAt: 'desc' as const } },
    payments: { orderBy: { createdAt: 'desc' as const } },
    contracts: { orderBy: { createdAt: 'desc' as const } },
    notes: { orderBy: { createdAt: 'desc' as const } },
    createdBy: { select: { name: true } },
  }
  if (isUuid) return prisma.dossier.findUnique({ where: { id: idOrRef }, include })
  return prisma.dossier.findFirst({ where: { dossierNumber: idOrRef }, include })
}

const statusLabels: Record<string, string> = {
  EN_COURS: 'En cours',
  DOCUMENTS_MANQUANTS: 'Documents manquants',
  CHEZ_COMMUNE: 'Chez commune',
  CHEZ_CONSERVATION: 'Chez conservation',
  VALIDATION_BANCAIRE: 'Validation bancaire',
  EN_ATTENTE_SIGNATURE: 'En attente signature',
  TERMINE: 'Terminé',
}

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dossier = await getDossier(id)
  if (!dossier) notFound()

  return (
    <div className="flex-1 space-y-6 p-6">
      <Link href="/notaire/dossiers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour aux dossiers
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{dossier.title || dossier.dossierNumber}</h1>
            <DossierStatusBadge status={dossier.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Réf: <span className="font-mono font-medium text-foreground">{dossier.dossierNumber}</span></span>
            {dossier.landRef && <span>Réf. foncière: <span className="font-medium text-foreground">{dossier.landRef}</span></span>}
            <span>Créé par {dossier.createdBy?.name || '—'} le {new Date(dossier.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
        <Link href={`/notaire/dossiers/${dossier.id}/edit`}>
          <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Modifier</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avancement du dossier</CardTitle>
        </CardHeader>
        <CardContent>
          <DossierStatusStepperWrapper dossierId={dossier.id} currentStatus={dossier.status} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-lg">{dossier.client?.name || '—'}</p>
              {dossier.client?.cin && <p className="text-sm text-muted-foreground">CIN: {dossier.client.cin}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {dossier.client?.email || '—'}</span>
                <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {dossier.client?.phone || '—'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents ({dossier.documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <DossierViewer dossierId={dossier.id} initialDocs={dossier.documents ?? []} client={dossier.client} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <DossierPayments dossierId={dossier.id} initialPayments={dossier.payments ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contrats</CardTitle>
            </CardHeader>
            <CardContent>
              <DossierContract dossierId={dossier.id} initialContracts={dossier.contracts ?? []} client={dossier.client} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" /> Historique des statuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dossier.statusHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun historique</p>
              ) : (
                <div className="space-y-3">
                  {dossier.statusHistory.map((sh: any, idx: number) => (
                    <div key={sh.id} className="flex gap-3 text-sm">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                        {idx < dossier.statusHistory.length - 1 && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="pb-3">
                        <p className={`font-medium ${idx === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {statusLabels[sh.status] || sh.status}
                        </p>
                        {sh.note && <p className="text-muted-foreground">{sh.note}</p>}
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{new Date(sh.createdAt).toLocaleString('fr-FR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes internes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DossierNoteForm dossierId={dossier.id} />
              {dossier.notes.length > 0 ? (
                <div className="space-y-2">
                  {dossier.notes.map((note: any) => (
                    <div key={note.id} className="p-3 bg-muted rounded-lg text-sm">
                      <p>{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(note.createdAt).toLocaleString('fr-FR')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Aucune note pour le moment</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
