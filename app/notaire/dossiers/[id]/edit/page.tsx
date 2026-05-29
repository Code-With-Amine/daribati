import React from 'react'
import { prisma } from '@/lib/db'
import DossierEditForm from '@/components/DossierEditForm'

// Server component to fetch initial data
async function getData(id: string) {
  const dossier = await prisma.dossier.findUnique({ where: { id }, include: { client: true } })
  const clients = await prisma.user.findMany({ where: { role: 'CLIENT' } })
  return { dossier, clients }
}

export default async function EditDossierPage({ params }: { params: Promise<{ id?: string }> | { id?: string } }) {
  // Next may pass params as a Promise; resolve if needed
  const resolved = (params && typeof (params as any).then === 'function') ? await (params as any) : params
  const id = resolved?.id

  if (!id) {
    return <div className="p-6">Identifiant du dossier manquant</div>
  }

  const { dossier, clients } = await getData(id)

  if (!dossier) return <div className="p-6">Dossier introuvable</div>

  // Render client-side form component for nicer UI/validation
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Modifier le dossier</h1>
      {/* Hydrate client form component */}
      <DossierEditForm initialDossier={dossier} clients={clients} />
    </div>
  )
}
