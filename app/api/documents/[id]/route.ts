import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/app/api/auth/middleware'
import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

export const runtime = 'nodejs'

async function uploadToLocal(fileBuffer: Buffer, filename: string) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  const filePath = path.join(uploadsDir, filename)
  fs.writeFileSync(filePath, fileBuffer)
  return `/uploads/${filename}`
}

async function uploadToS3(fileBuffer: Buffer, filename: string) {
  const client = new S3Client({ region: process.env.AWS_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! } })
  const bucket = process.env.AWS_S3_BUCKET!
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: filename, Body: fileBuffer, ContentType: 'application/octet-stream' })
  await client.send(cmd)
  const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`
  return url
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })

    if (doc.fileUrl.startsWith('/uploads/')) {
      const fp = path.join(process.cwd(), 'public', doc.fileUrl)
      try { fs.unlinkSync(fp) } catch (e) { /* ignore */ }
    } else if (process.env.AWS_S3_BUCKET) {
      try {
        const url = new URL(doc.fileUrl)
        const key = url.pathname.slice(1)
        const client = new S3Client({ region: process.env.AWS_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! } })
        await client.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }))
      } catch (e) { /* ignore */ }
    }

    await prisma.document.delete({ where: { id } })
    return NextResponse.json({ ok: true, message: 'Document supprimé' })
  } catch (err: any) {
    console.error('Error deleting document:', err)
    return NextResponse.json({ error: 'Erreur lors de la suppression du document' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Identifiant du document manquant" }, { status: 400 })
  }

  try {
    const contentType = req.headers.get('content-type') || ''
    let name: string | undefined
    let fileUrl: string | undefined
    let note: string | undefined
    let clientVisible: boolean | undefined

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      name = form.get('name') as string
      note = form.get('note') as string
      const cv = form.get('clientVisible')
      if (cv !== null) clientVisible = cv === 'true'
      const file = form.get('file') as unknown as File
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const filename = `${Date.now()}-${file.name}`
        if (process.env.AWS_S3_BUCKET) fileUrl = await uploadToS3(buffer, filename)
        else fileUrl = await uploadToLocal(buffer, filename)
      }
    } else {
      const body = await req.json()
      name = body.name
      fileUrl = body.fileUrl
      note = body.note
      clientVisible = body.clientVisible
    }

    const data: any = {}
    if (name) data.name = name
    if (fileUrl) data.fileUrl = fileUrl
    if (note !== undefined) data.note = note
    if (clientVisible !== undefined) data.clientVisible = clientVisible
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucune modification fournie' }, { status: 400 })
    }

    const updated = await prisma.document.update({ where: { id }, data })
    return NextResponse.json({ doc: updated })
  } catch (err: any) {
    console.error('Error updating document:', err)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du document' }, { status: 500 })
  }
}