import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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

export async function DELETE(req: Request, { params }: any) {
  const { id } = params
  try {
    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })

    // For S3 removal we could parse URL to get key; for local just unlink file
    if (doc.fileUrl.startsWith('/uploads/')) {
      const fp = path.join(process.cwd(), 'public', doc.fileUrl)
      try { fs.unlinkSync(fp) } catch (e) { /* ignore */ }
    } else if (process.env.AWS_S3_BUCKET) {
      // naive key extraction
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
    // Log full error for server-side debugging, but return a user-friendly message to clients in French
    console.error('Error in /api/documents/[id] route:', err)
    return NextResponse.json({ error: 'Une erreur est survenue lors du traitement du document. Veuillez réessayer plus tard.' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: any) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: "Identifiant du document manquant" }, { status: 400 })
  }
  try {
    const contentType = req.headers.get('content-type') || ''
    // Debug logging to help diagnose 500 errors during document update
    try {
      console.info('PUT /api/documents/[id] request', { id, contentType })
      // Log some headers but avoid printing Authorization token
      const headersObj: Record<string,string> = {}
      for (const [k,v] of req.headers) {
        if (k.toLowerCase() === 'authorization') { headersObj[k] = '[REDACTED]' } else headersObj[k] = v
      }
      console.info('Request headers:', headersObj)
    } catch (e) {
      console.error('Failed to log request meta', e)
    }
    let name: string | undefined
    let fileUrl: string | undefined

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      name = form.get('name') as string
      const file = form.get('file') as unknown as File
      try {
        console.info('Form fields:', { hasName: !!name, hasFile: !!file })
        if (file && (file as any).name) console.info('Uploaded file name:', (file as any).name)
      } catch (e) { console.error('Error logging form data', e) }
      if (file) {
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
    }

    const data: any = {}
    if (name) data.name = name
    if (fileUrl) data.fileUrl = fileUrl
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucune modification fournie' }, { status: 400 })
    }

    const updated = await prisma.document.update({ where: { id }, data })
    return NextResponse.json({ doc: updated })
  } catch (err: any) {
    // Log full error for server-side debugging, but return a user-friendly message to clients in French
    console.error('Error in /api/documents/[id] route:', err)
    return NextResponse.json({ error: 'Une erreur est survenue lors du traitement du document. Veuillez réessayer plus tard.' }, { status: 500 })
  }
}
