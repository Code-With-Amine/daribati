import { prisma } from '@/lib/db'
import { renderTemplate } from '@/lib/contract-templates'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = 'mixtral-8x7b-32768' // free tier, fast
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export type GenerationMethod = 'AI' | 'TEMPLATE' | 'INSPIRATION'

export interface DossierContext {
  dossierNumber: string
  title: string | null
  landRef: string | null
  status: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  clientCIN: string | null
  createdBy: string
}

export interface GenerateOptions {
  prompt: string
  dossierId: string
  method: GenerationMethod
  referenceIds?: string[]
  templateId?: string
  templateVariables?: Record<string, string>
  notaireName?: string
}

export interface GenerateResult {
  content: string
  method: GenerationMethod
  templateId?: string
  templateData?: Record<string, string>
  referenceIds?: string[]
  prompt?: string
}

const SYSTEM_PROMPT = `Tu es un assistant juridique spécialisé dans la rédaction d'actes notariés marocains.
Tu rédiges des contrats complets, professionnels et conformes au droit marocain.
 STRUCTURE STANDARD D'UN ACTE NOTARIÉ MAROCAIN :
- Titre de l'acte
- Date et lieu
- Identité complète des parties (nom, prénom, profession, adresse, CIN)
- Exposé préliminaire (contexte de l'acte)
- Désignation du bien (pour les actes immobiliers)
- Prix et conditions de paiement
- Charges et conditions
- Déclarations des parties
- Signature et mentions légales
- Espace pour signatures

Utilise un langage juridique formel en français.
Assure-toi que chaque contrat est cohérent, complet et prêt à être présenté aux parties.`

function buildContextSection(context: DossierContext): string {
  return `CONTEXTE DU DOSSIER :
- Numéro de dossier : ${context.dossierNumber}
- Titre : ${context.title || 'Non défini'}
- Référence foncière : ${context.landRef || 'Non spécifiée'}
- Statut : ${context.status}
- Client : ${context.clientName} (${context.clientEmail})${context.clientCIN ? `, CIN: ${context.clientCIN}` : ''}${context.clientPhone ? `, Tél: ${context.clientPhone}` : ''}
- Rédigé par : ${context.createdBy}`
}

function buildReferencesSection(references: { name: string; content: string }[]): string {
  if (!references.length) return ''
  return `\nCONTRATS DE RÉFÉRENCE (inspire-toi de leur style et structure) :\n${references.map((r, i) => `--- RÉFÉRENCE ${i + 1} : ${r.name} ---\n${r.content}`).join('\n\n')}`
}

export async function generateWithAI(
  prompt: string,
  context: DossierContext,
  references: { name: string; content: string }[] = []
): Promise<string> {
  const userMessage = buildContextSection(context) + buildReferencesSection(references) + `\n\nINSTRUCTION : ${prompt}\n\nRédige l'acte notarié complet en français.`

  if (!GROQ_API_KEY) {
    return generateFallback(prompt, context)
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 8192,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Groq API error:', res.status, errText)
      return generateFallback(prompt, context)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || generateFallback(prompt, context)
  } catch (err) {
    console.error('Groq API call failed:', err)
    return generateFallback(prompt, context)
  }
}

function generateFallback(prompt: string, ctx: DossierContext): string {
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const simplePrompt = prompt.toLowerCase()

  if (simplePrompt.includes('vente') || simplePrompt.includes('achat')) {
    return `ACTE DE VENTE

Le ${date},

Entre les soussignés :

Monsieur/Madame [Nom du Vendeur], ci-après dénommé "Le Vendeur",

D'une part,

ET

Monsieur/Madame ${ctx.clientName}, ci-après dénommé "L'Acquéreur",

D'autre part,

IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :

Article 1 - DÉSIGNATION DU BIEN
Le Vendeur vend à l'Acquéreur, qui accepte, le bien immobilier situé à ${ctx.landRef || '[Adresse du bien]'}.

Article 2 - PRIX
La vente est consentie au prix de [Montant] Dirhams, payable comptant.

Article 3 - CONDITIONS
La présente vente est faite sous les conditions suspensives d'usage.

Article 4 - FRAIS
Tous les frais, droits et émoluments sont à la charge de l'Acquéreur.

Fait à l'étude de Maître ${ctx.createdBy}, le ${date}.

Le Vendeur                    L'Acquéreur`
  }

  if (simplePrompt.includes('location') || simplePrompt.includes('bail')) {
    return `CONTRAT DE LOCATION

Le ${date},

Entre les soussignés :

Monsieur/Madame [Nom du Bailleur], ci-après dénommé "Le Bailleur",

D'une part,

ET

Monsieur/Madame ${ctx.clientName}, ci-après dénommé "Le Locataire",

D'autre part,

IL A ÉTÉ CONVENU CE QUI SUIT :

Article 1 - OBJET
Le Bailleur donne en location au Locataire le bien situé à ${ctx.landRef || '[Adresse]'}.

Article 2 - DURÉE
Le présent bail est consenti pour une durée de [Durée] à compter du [Date d'effet].

Article 3 - LOYER
Le loyer mensuel est fixé à [Montant] Dirhams.

Article 4 - GARANTIE
Le Locataire verse au Bailleur un dépôt de garantie de [Montant] Dirhams.

Fait à [Ville], le ${date}.

Le Bailleur                    Le Locataire`
  }

  return `ACTE NOTARIÉ

${ctx.title || 'Acte'}

Le ${date},

Entre les soussignés :

Monsieur/Madame ${ctx.clientName}${ctx.clientCIN ? `, CIN : ${ctx.clientCIN}` : ''},
ci-après dénommé "La Partie"

D'une part,

ET

[Autre partie], ci-après dénommé "La Contrepartie",

D'autre part,

EXPOSÉ PRÉLIMINAIRE
${prompt}

IL A ÉTÉ CONVENU CE QUI SUIT :

Article 1 - OBJET
Les parties conviennent de [objet de l'acte].

Article 2 - CONDITIONS
[Conditions générales de l'acte].

Article 3 - DISPOSITIONS FINALES
Le présent acte est fait en [Nombre] exemplaires.

Fait à l'étude de Maître ${ctx.createdBy}, le ${date}.

La Partie                    La Contrepartie`
}

export async function generateContract(opts: GenerateOptions): Promise<GenerateResult> {
  const dossier = await prisma.dossier.findUnique({
    where: { id: opts.dossierId },
    include: { client: true, createdBy: true },
  })

  if (!dossier) throw new Error('Dossier introuvable')

  const context: DossierContext = {
    dossierNumber: dossier.dossierNumber,
    title: dossier.title,
    landRef: dossier.landRef,
    status: dossier.status,
    clientName: dossier.client?.name || 'Client',
    clientEmail: dossier.client?.email || '',
    clientPhone: dossier.client?.phone || null,
    clientCIN: dossier.client?.cin || null,
    createdBy: opts.notaireName || dossier.createdBy?.name || 'Notaire',
  }

  if (opts.method === 'TEMPLATE' && opts.templateId) {
    const template = await prisma.contractTemplate.findUnique({ where: { id: opts.templateId } })
    if (!template) throw new Error('Template introuvable')

    const content = renderTemplate(template.content, opts.templateVariables || {})
    return {
      content,
      method: 'TEMPLATE',
      templateId: opts.templateId,
      templateData: opts.templateVariables,
    }
  }

  let references: { name: string; content: string }[] = []

  if (opts.method === 'INSPIRATION' && opts.referenceIds?.length) {
    const refs = await prisma.contractReference.findMany({
      where: { id: { in: opts.referenceIds } },
    })
    references = refs.map(r => ({ name: r.name, content: r.content }))
  }

  const content = await generateWithAI(opts.prompt, context, references)

  return {
    content,
    method: opts.method,
    referenceIds: opts.referenceIds,
    prompt: opts.prompt,
  }
}


