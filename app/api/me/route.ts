import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/app/api/auth/middleware'

export async function GET(req: Request) {
  const user = await verifyAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, role: true, avatar: true, cin: true, phone: true },
    })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    let notaireId: string | null = null
    if (dbUser.role === 'CLIENT') {
      const dossier = await prisma.dossier.findFirst({
        where: { clientId: dbUser.id },
        select: { createdById: true },
        orderBy: { createdAt: 'desc' },
      })
      notaireId = dossier?.createdById || null
    }
    if (dbUser.role === 'CLIENT' && !notaireId) {
      // Fallback: check the notaire relation on the user itself
      const user = await prisma.user.findUnique({
        where: { id: dbUser.id },
        select: { notaireId: true },
      })
      notaireId = user?.notaireId || null
    }

    return NextResponse.json({ user: { ...dbUser, notaireId } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
