import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

export async function POST(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { paymentId } = await req.json()
    if (!paymentId) return NextResponse.json({ error: 'paymentId requis' }, { status: 400 })

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { dossier: { include: { client: { select: { name: true, cin: true } } } } },
    })

    if (!payment) return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })

    const receiptNumber = `R-${Date.now().toString(36).toUpperCase()}-${paymentId.slice(0, 4).toUpperCase()}`
    const date = new Date(payment.paidAt || payment.createdAt).toLocaleDateString('fr-FR')

    const receiptContent = `
╔══════════════════════════════════════╗
║           REÇU DE PAIEMENT           ║
║                NotaireFlow           ║
╠══════════════════════════════════════╣
║ N°: ${receiptNumber.padEnd(33)}║
║ Date: ${date.padEnd(34)}║
╠══════════════════════════════════════╣
║ Client: ${(payment.dossier?.client?.name || '—').padEnd(33)}║
║ CIN:    ${(payment.dossier?.client?.cin || '—').padEnd(33)}║
║ Dossier: ${(payment.dossier?.dossierNumber || '—').padEnd(31)}║
╠══════════════════════════════════════╣
║ Montant: ${payment.amount.toLocaleString('fr-FR').padEnd(17)} DH ║
║ Payé:    ${payment.paidAmount.toLocaleString('fr-FR').padEnd(17)} DH ║
║ Méthode: ${(payment.method || '—').padEnd(30)}║
║ Statut:  ${(payment.status === 'PAID' ? 'Payé' : payment.status === 'PARTIAL' ? 'Partiel' : 'Impayé').padEnd(31)}║
╚══════════════════════════════════════╝

                             NotaireFlow
                   Signature du notaire : ${auth.user?.name || '—'}
    `

    const receiptUrl = `/api/receipts/${receiptNumber}`

    await prisma.payment.update({
      where: { id: paymentId },
      data: { receiptUrl },
    })

    return NextResponse.json({
      receipt: {
        number: receiptNumber,
        content: receiptContent,
        url: receiptUrl,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const qs = new URL(req.url).searchParams
  const paymentId = qs.get('paymentId')

  if (!paymentId) return NextResponse.json({ error: 'paymentId requis' }, { status: 400 })

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })

  return NextResponse.json({ payment })
}