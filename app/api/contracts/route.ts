import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

const PARTY_TYPES = ['citizen', 'company', 'government_entity'] as const

function generateContractContent(data: {
  buyerName: string
  buyerType: string
  sellerName: string
  sellerType: string
  propertyAddress: string
  propertyDescription: string
  price: number
  notaireName: string
}): string {
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return `CONTRAT DE VENTE

Le ${date},

Entre les soussignés :

${data.sellerType === 'company' ? 'La Société' : 'Monsieur/Madame'} ${data.sellerName},
ci-après dénommé "Le Vendeur",

D'une part,

ET

${data.buyerType === 'company' ? 'La Société' : 'Monsieur/Madame'} ${data.buyerName},
ci-après dénommé "L'Acquéreur",

D'autre part,

IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :

Article 1 - DÉSIGNATION DU BIEN
Le Vendeur vend à l'Acquéreur, qui accepte, le bien immobilier suivant :
${data.propertyAddress}
${data.propertyDescription}

Article 2 - PRIX
La vente est consentie et acceptée au prix de ${data.price.toLocaleString('fr-FR')} Dirhams.

Article 3 - CONDITIONS DE LA VENTE
La présente vente est faite aux charges et conditions ordinaires et de droit.

Article 4 - JOUISSANCE
L'Acquéreur aura la jouissance du bien à compter de la signature du présent acte.

Article 5 - FRAIS
Tous les frais, droits et émoluments du présent acte sont à la charge de l'Acquéreur.

Fait à ${data.notaireName ? `l'étude de Maître ${data.notaireName}` : '[Ville]'},
en autant d'originaux que de parties.

Le Vendeur                    L'Acquéreur`
}

export async function POST(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { dossierId, buyerName, buyerType, sellerName, sellerType, propertyAddress, propertyDescription, price } = body

    if (!dossierId || !buyerName || !sellerName) {
      return NextResponse.json({ error: 'Information minimale requise (dossierId, buyerName, sellerName)' }, { status: 400 })
    }

    const dossier = await prisma.dossier.findUnique({ where: { id: dossierId } })
    if (!dossier) return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })

    const notaireName = auth.user?.name || 'Notaire'

    const content = generateContractContent({
      buyerName: buyerName || 'Acheteur',
      buyerType: buyerType || 'citizen',
      sellerName: sellerName || 'Vendeur',
      sellerType: sellerType || 'citizen',
      propertyAddress: propertyAddress || dossier.landRef || 'Adresse du bien',
      propertyDescription: propertyDescription || 'Bien immobilier',
      price: parseFloat(price) || 0,
      notaireName,
    })

    const contract = await prisma.contract.create({
      data: {
        dossierId,
        title: `Contrat de vente - ${buyerName} / ${sellerName}`,
        content,
        type: 'VENTE_IMMOBILIERE',
        parties: { buyer: { name: buyerName, type: buyerType }, seller: { name: sellerName, type: sellerType } },
      },
    })

    return NextResponse.json({ contract }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const qs = new URL(req.url).searchParams
  const dossierId = qs.get('dossierId')

  const where: any = {}
  if (dossierId) where.dossierId = dossierId

  const contracts = await prisma.contract.findMany({
    where,
    orderBy: { generatedAt: 'desc' },
  })

  return NextResponse.json({ contracts })
}