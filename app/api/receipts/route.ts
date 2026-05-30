import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

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

    const notaire = await prisma.user.findUnique({
      where: { id: auth.user!.id },
      select: { name: true, avatar: true, email: true, phone: true, receiptHeader: true, receiptFooter: true },
    })

    const receiptNumber = `R-${Date.now().toString(36).toUpperCase()}-${paymentId.slice(0, 4).toUpperCase()}`
    const date = new Date(payment.paidAt || payment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

    const avatarImg = notaire?.avatar
      ? `<img src="${esc(notaire.avatar)}" alt="Logo" style="max-height:60px;max-width:200px;object-fit:contain;" />`
      : ''

    const initials = (notaire?.name || 'N').charAt(0)
    const headerAvatar = avatarImg
      ? '<div>' + avatarImg + '</div>'
      : '<div style="width:50px;height:50px;background:#1e3a5f;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0;">' + esc(initials) + '</div>'

    const headerLines = (notaire?.receiptHeader || '').split('\n').filter(Boolean)
    const footerLines = (notaire?.receiptFooter || '').split('\n').filter(Boolean)

    const headerText = headerLines.length
      ? esc(notaire?.receiptHeader || '')
      : 'Étude de Maître ' + esc(notaire?.name || '') + '\n' +
        (notaire?.phone ? 'Tél: ' + esc(notaire.phone) : '') +
        (notaire?.email ? ' | Email: ' + esc(notaire.email) : '')

    const footerText = footerLines.length
      ? esc(notaire?.receiptFooter || '')
      : esc(notaire?.name || 'Notaire') + '\nCachet & Signature : _________________'

    const statusClass = payment.status === 'PAID' ? 'paid' : payment.status === 'PARTIAL' ? 'partial' : 'unpaid'
    const statusLabel = payment.status === 'PAID' ? 'Payé' : payment.status === 'PARTIAL' ? 'Partiel' : 'Impayé'

    const receiptContent = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Reçu ${esc(receiptNumber)}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; color: #1a1a2e; }
  .receipt { max-width: 680px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px; background: #fff; }
  .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #1e3a5f; }
  .header-text { font-size: 11px; color: #64748b; line-height: 1.5; white-space: pre-wrap; }
  .title { font-size: 20px; font-weight: 700; color: #1e3a5f; text-align: center; margin-bottom: 20px; letter-spacing: 1px; text-transform: uppercase; }
  .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .table td:first-child { color: #64748b; width: 120px; }
  .table td:last-child { font-weight: 500; }
  .amount-row td { font-size: 15px; font-weight: 600; }
  .amount-row td:last-child { color: #1e3a5f; }
  .status-paid { color: #059669; font-weight: 600; }
  .status-partial { color: #d97706; font-weight: 600; }
  .status-unpaid { color: #dc2626; font-weight: 600; }
  .stamp-area { margin-top: 32px; padding-top: 16px; border-top: 1px dashed #cbd5e1; text-align: right; font-size: 11px; color: #64748b; white-space: pre-wrap; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; color: rgba(30, 58, 95, 0.03); font-weight: 900; pointer-events: none; z-index: 0; }
  @media print { body { padding: 0; } .receipt { border: none; box-shadow: none; } .no-print { display: none; } }
</style>
</head>
<body>
<div class="receipt">
  <div class="watermark">NOTAIREFLOW</div>

  <div class="header">
    ${headerAvatar}
    <div class="header-text">${headerText}</div>
  </div>

  <div class="title">Reçu de paiement</div>

  <table class="table">
    <tr><td>N° de reçu</td><td>${esc(receiptNumber)}</td></tr>
    <tr><td>Date</td><td>${esc(date)}</td></tr>
    <tr><td>Client</td><td>${esc(payment.dossier?.client?.name || '—')}</td></tr>
    <tr><td>CIN</td><td>${esc(payment.dossier?.client?.cin || '—')}</td></tr>
    <tr><td>Dossier</td><td>${esc(payment.dossier?.dossierNumber || '—')}</td></tr>
    <tr><td>Méthode</td><td>${esc(payment.method || '—')}</td></tr>
    <tr><td>Statut</td><td class="status-${statusClass}">${statusLabel}</td></tr>
    <tr class="amount-row"><td>Montant</td><td>${payment.amount.toLocaleString('fr-FR')} DH</td></tr>
    <tr class="amount-row"><td>Payé</td><td>${payment.paidAmount.toLocaleString('fr-FR')} DH</td></tr>
  </table>

  <div class="stamp-area">${footerText}</div>

  <div style="text-align:center;margin-top:24px;font-size:10px;color:#cbd5e1;">
    Document généré par NotaireFlow — ${esc(date)}
  </div>
</div>

<div class="no-print" style="text-align:center;margin-top:16px;">
  <button onclick="window.print()" style="padding:8px 24px;background:#1e3a5f;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">Imprimer / PDF</button>
</div>

</body>
</html>`

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
