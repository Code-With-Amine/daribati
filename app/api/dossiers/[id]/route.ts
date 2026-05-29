import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function DELETE(req: Request, context: any) {
  const { params } = context || {}
  const { id } = params || {}
  // auth: ensure user is NOTAIRE
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  const payload: any = verifyToken(token)
  if (!payload) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user || user.role !== 'NOTAIRE') return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  try {
    await prisma.dossier.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

export async function PUT(req: Request, context: any) {
  const { params } = context || {}
  const { id } = params || {}
  // auth: ensure user is NOTAIRE
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  const payload: any = verifyToken(token)
  if (!payload) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user || user.role !== 'NOTAIRE') return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { title, dossierNumber, clientId, landRef, status } = body

    const data: any = {}
    if (title !== undefined) data.title = title
    if (dossierNumber !== undefined) data.dossierNumber = dossierNumber
    if (clientId !== undefined) data.clientId = clientId || null
    if (landRef !== undefined) data.landRef = landRef
    if (status !== undefined) data.status = status

    const updated = await prisma.dossier.update({ where: { id }, data, include: { client: true, documents: true, statusHistory: true } })

    return NextResponse.json({ ok: true, dossier: updated })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
