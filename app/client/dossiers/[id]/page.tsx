import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Download } from 'lucide-react'

const statusLabels: Record<string, string> = {
  EN_COURS: 'En cours',
  DOCUMENTS_MANQUANTS: 'Documents manquants',
  CHEZ_COMMUNE: 'Chez commune',
  CHEZ_CONSERVATION: 'Chez conservation',
  VALIDATION_BANCAIRE: 'Validation bancaire',
  EN_ATTENTE_SIGNATURE: 'En attente signature',
  TERMINE: 'Terminé',
}

const statusColors: Record<string, string> = {
  EN_COURS: 'bg-blue-100 text-blue-800',
  DOCUMENTS_MANQUANTS: 'bg-red-100 text-red-800',
  CHEZ_COMMUNE: 'bg-yellow-100 text-yellow-800',
  CHEZ_CONSERVATION: 'bg-purple-100 text-purple-800',
  VALIDATION_BANCAIRE: 'bg-orange-100 text-orange-800',
  EN_ATTENTE_SIGNATURE: 'bg-green-100 text-green-800',
  TERMINE: 'bg-gray-100 text-gray-800',
}

async function getData(dossierId: string) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) redirect('/login')

  const { payload } = await jwtVerify(session, new TextEncoder().encode(process.env.JWT_SECRET || 'secret'))
  const clientId = payload.sub as string

  const dossier = await prisma.dossier.findFirst({
    where: { id: dossierId, clientId },
    include: {
      documents: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
      payments: true,
      contracts: { orderBy: { createdAt: 'desc' } },
      notes: true,
    },
  })

  if (!dossier) redirect('/client')

  return dossier
}

export default async function ClientDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dossier = await getData(id)
  const visibleDocs = dossier.documents.filter((d: any) => d.clientVisible !== false)

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/client" className="text-sm text-[#262EE3] hover:underline mb-4 inline-block">&larr; Retour à mes dossiers</Link>

      <div className="bg-white rounded-xl p-6 border mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{dossier.title || dossier.dossierNumber}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {dossier.landRef && <span>Référence foncière: {dossier.landRef}</span>}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[dossier.status] || 'bg-gray-100'}`}>
            {statusLabels[dossier.status] || dossier.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold text-lg mb-4">Documents</h3>
          {visibleDocs.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun document pour le moment</p>
          ) : (
            <div className="grid gap-3">
              {visibleDocs.map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border group">
                  <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">
                    {doc.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <a
                    href={`/api/documents/${doc.id}/download`}
                    download={doc.name}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold text-lg mb-4">Suivi du dossier</h3>
          {dossier.statusHistory.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun suivi pour le moment</p>
          ) : (
            <div className="space-y-4">
              {dossier.statusHistory.map((sh: any) => (
                <div key={sh.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${statusColors[sh.status]?.split(' ')[0] || 'bg-gray-300'}`} />
                    <div className="w-px h-full bg-gray-200" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{statusLabels[sh.status] || sh.status}</p>
                    {sh.note && <p className="text-xs text-gray-500">{sh.note}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(sh.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {dossier.payments.length > 0 && (
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="font-semibold text-lg mb-4">Paiements</h3>
            <div className="space-y-3">
              {dossier.payments.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{p.amount.toLocaleString('fr-FR')} DH</p>
                    <p className="text-xs text-gray-500">{p.method || '—'} · {new Date(p.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    p.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    p.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {p.status === 'PAID' ? 'Payé' : p.status === 'PARTIAL' ? 'Partiel' : 'Impayé'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {dossier.contracts.length > 0 && (
          <div className="bg-white rounded-xl p-6 border col-span-full">
            <h3 className="font-semibold text-lg mb-4">Contrats</h3>
            <div className="space-y-3">
              {dossier.contracts.map((c: any) => (
                <details key={c.id} className="p-3 rounded-lg border group">
                  <summary className="text-sm font-medium cursor-pointer list-none flex items-center justify-between">
                    <span>{c.title}</span>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
                  </summary>
                  <pre className="mt-3 p-4 bg-gray-50 rounded text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto">{c.content}</pre>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}