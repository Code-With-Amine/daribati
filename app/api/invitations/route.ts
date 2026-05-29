import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

function genToken(len = 32) {
  return crypto.randomBytes(len).toString('hex')
}

export async function POST(req: Request) {
  const body = await req.json()
  const { email, name, createDossier, dossierData } = body
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const token = genToken(16)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

  let dossierId = null
  if (createDossier) {
    const d = await prisma.dossier.create({ data: { title: dossierData.title || null, dossierNumber: dossierData.dossierNumber || `INV-${Date.now()}`, status: 'EN_COURS', landRef: dossierData.landRef || '' } })
    dossierId = d.id
  }

  // cast prisma to any for the invitation delegate if generated client typing differs
  const invite = await (prisma as any).invitation.create({ data: { email, name: name || null, token, dossierId, expiresAt } })

  const link = `${process.env.NEXT_PUBLIC_APP_URL || ''}/accept-invite?token=${token}`

  return NextResponse.json({ invite: { id: invite.id, token: invite.token, link }, dossierId })
}
