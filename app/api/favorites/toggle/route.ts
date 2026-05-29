import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { dossierId } = body
    // find if favorite exists
    const existing = await prisma.favorite.findFirst({ where: { dossierId } })
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ ok: true, action: 'removed' })
    }
    await prisma.favorite.create({ data: { dossierId } })
    return NextResponse.json({ ok: true, action: 'added' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
