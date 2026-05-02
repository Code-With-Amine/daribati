import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const qs = new URL(req.url).searchParams
  const clientId = qs.get('clientId')

  const args: any = {
    include: { documents: true, statusHistory: true, notes: true },
  }

  if (clientId) args.where = { clientId }

  const dossiers = await prisma.dossier.findMany(args)

  return NextResponse.json({ dossiers })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { title, dossierNumber, clientId, createdById, landRef } = body

  const dossier = await prisma.dossier.create({
    data: {
      title,
      dossierNumber,
      clientId,
      createdById,
      landRef,
      status: 'EN_COURS',
      statusHistory: { create: { status: 'EN_COURS', note: 'Création du dossier', changedById: createdById } },
    },
    include: { statusHistory: true },
  })

  return NextResponse.json({ dossier }, { status: 201 })
}
