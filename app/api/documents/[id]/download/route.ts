import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/app/api/auth/middleware'
import fs from 'fs'
import path from 'path'

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

    let filePath: string
    let fileName: string

    if (doc.fileUrl.startsWith('/uploads/')) {
      filePath = path.join(process.cwd(), 'public', doc.fileUrl)
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
      }
      fileName = doc.name || path.basename(doc.fileUrl)
    } else if (doc.fileUrl.startsWith('http')) {
      // External URL — redirect
      return NextResponse.redirect(doc.fileUrl)
    } else {
      return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 })
    }

    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(fileName).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
    }
    const contentType = mimeMap[ext] || 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
