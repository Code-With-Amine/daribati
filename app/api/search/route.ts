import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/app/api/auth/middleware'

export async function GET(req: Request) {
  const user = await verifyAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const qs = new URL(req.url).searchParams
  const q = qs.get('q') || ''

  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const results: any = { dossiers: [], clients: [], documents: [] }

  if (user.role === 'NOTAIRE') {
    results.dossiers = await prisma.dossier.findMany({
      where: {
        OR: [
          { dossierNumber: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          { landRef: { contains: q, mode: 'insensitive' } },
          { client: { name: { contains: q, mode: 'insensitive' } } },
          { client: { cin: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: { client: { select: { name: true, cin: true } } },
      take: 10,
    })

    results.clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { cin: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, email: true, cin: true },
      take: 10,
    })

    results.documents = await prisma.document.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      include: { dossier: { select: { dossierNumber: true } } },
      take: 10,
    })
  } else if (user.role === 'CLIENT') {
    results.dossiers = await prisma.dossier.findMany({
      where: {
        clientId: user.id,
        OR: [
          { dossierNumber: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          { landRef: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
    })
  }

  return NextResponse.json({ results })
}