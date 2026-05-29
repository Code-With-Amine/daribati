import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, FileText, ArrowUpRight } from 'lucide-react'

async function getClientData() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) redirect('/login')

  const { payload } = await jwtVerify(session, new TextEncoder().encode(process.env.JWT_SECRET || 'secret'))
  const clientId = payload.sub as string

  const dossiers = await prisma.dossier.findMany({
    where: { clientId },
    include: { documents: true, statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { updatedAt: 'desc' },
  })

  const client = await prisma.user.findUnique({ where: { id: clientId } })
  return { dossiers, client }
}

const statusBadge: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  EN_COURS: 'default',
  DOCUMENTS_MANQUANTS: 'destructive',
  CHEZ_COMMUNE: 'secondary',
  CHEZ_CONSERVATION: 'secondary',
  VALIDATION_BANCAIRE: 'secondary',
  EN_ATTENTE_SIGNATURE: 'outline',
  TERMINE: 'outline',
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

export default async function ClientDashboardPage() {
  const { dossiers, client } = await getClientData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bienvenue, {client?.name}</h1>
        <p className="text-muted-foreground">Suivez ici l&apos;avancement de vos dossiers</p>
      </div>

      {dossiers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <FolderOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Aucun dossier pour le moment</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Votre notaire créera un dossier pour vous</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {dossiers.map((dossier: any) => {
            const lastStatus = dossier.statusHistory[0]
            return (
              <Link key={dossier.id} href={`/client/dossiers/${dossier.id}`} className="group">
                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {dossier.title || dossier.dossierNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {dossier.landRef && <span>Réf: {dossier.landRef} · </span>}
                          Créé le {new Date(dossier.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge variant={statusBadge[dossier.status] || 'outline'} className="shrink-0">
                        {statusLabels[dossier.status] || dossier.status}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {dossier.documents.filter((d: any) => d.clientVisible !== false).length} document{dossier.documents.filter((d: any) => d.clientVisible !== false).length > 1 ? 's' : ''}
                      </span>
                      {lastStatus?.note && <span className="truncate">Note: {lastStatus.note}</span>}
                      <ArrowUpRight className="w-4 h-4 ml-auto group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
