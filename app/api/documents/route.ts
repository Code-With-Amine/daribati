import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.formData()
    const dossierId = body.get('dossierId') as string
    const name = body.get('name') as string
    const fileUrl = body.get('fileUrl') as string

    if (!dossierId || !name || !fileUrl) return NextResponse.json({ error: 'Missing' }, { status: 400 })

    const doc = await prisma.document.create({ data: { dossierId, name, fileUrl } })
    return NextResponse.redirect(`/notaire/dossiers/${dossierId}`)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
