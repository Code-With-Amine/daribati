import React from 'react'
import { prisma } from '@/lib/db'
import DossierEditForm from '@/components/DossierEditForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

async function getData(id: string) {
  const dossier = await prisma.dossier.findUnique({ where: { id }, include: { client: true } })
  const clients = await prisma.user.findMany({ where: { role: 'CLIENT' } })
  return { dossier, clients }
}

export default async function EditDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) return <div className="p-6">Identifiant du dossier manquant</div>

  const { dossier, clients } = await getData(id)
  if (!dossier) return <div className="p-6">Dossier introuvable</div>

  return (
    <div className="flex-1 space-y-6 p-6">
      <Link href={`/notaire/dossiers/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour au dossier
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modifier le dossier</h1>
        <p className="text-sm text-muted-foreground">{dossier.dossierNumber} — {dossier.title || 'Sans titre'}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <DossierEditForm initialDossier={dossier} clients={clients} />
        </CardContent>
      </Card>
    </div>
  )
}
