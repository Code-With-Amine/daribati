import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/app/api/auth/middleware'

export const runtime = 'nodejs'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const doc = await prisma.document.findUnique({
      where: { id },
      include: { dossier: { select: { clientId: true } } },
    })
    if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })

    // Client can only download if document is clientVisible and belongs to their dossier
    if (user.role === 'CLIENT') {
      if (doc.clientVisible === false) {
        return NextResponse.json({ error: 'Document non disponible' }, { status: 403 })
      }
      if (doc.dossier.clientId !== user.id) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }
    }

    const fileUrl = doc.fileUrl

    // External URL — redirect
    if (fileUrl.startsWith('http') && !fileUrl.startsWith('data:')) {
      return NextResponse.redirect(fileUrl)
    }

    // Base64 data URI — decode and serve
    if (fileUrl.startsWith('data:')) {
      const match = fileUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (!match) return NextResponse.json({ error: 'Format de fichier invalide' }, { status: 400 })
      const contentType = match[1]
      const base64 = match[2]
      const buffer = Buffer.from(base64, 'base64')
      const fileName = doc.name || 'document'

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': String(buffer.length),
        },
      })
    }

    return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
