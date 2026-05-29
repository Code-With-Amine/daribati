import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/app/api/auth/middleware'

export async function GET(req: Request) {
  const user = await verifyAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const dossierId = url.searchParams.get('dossierId')

  try {
    const where: any = {}
    if (dossierId) {
      where.dossierId = dossierId
    } else if (user.role === 'NOTAIRE') {
      const dossiers = await prisma.dossier.findMany({ where: { createdById: user.id }, select: { id: true } })
      where.dossierId = { in: dossiers.map((d: { id: string }) => d.id) }
    } else if (user.role === 'CLIENT') {
      const dossiers = await prisma.dossier.findMany({ where: { clientId: user.id }, select: { id: true } })
      where.dossierId = { in: dossiers.map((d: { id: string }) => d.id) }
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        dossier: { select: { id: true, title: true, dossierNumber: true } },
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ notes })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const user = await verifyAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { dossierId, content } = await req.json()
    if (!dossierId || !content) {
      return NextResponse.json({ error: 'dossierId et content requis' }, { status: 400 })
    }

    const note = await prisma.note.create({
      data: { dossierId, content, userId: user.id },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
