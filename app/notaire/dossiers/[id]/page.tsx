import { prisma } from '@/lib/db'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import DossierViewer from '@/components/DossierViewer'

async function getDossier(idOrRef?: string) {
  if (!idOrRef) return null

  // simple UUID v4-ish check
  const isUuid = /^[0-9a-fA-F-]{36}$/.test(idOrRef)

  if (isUuid) {
    return prisma.dossier.findUnique({ where: { id: idOrRef }, include: { documents: true, client: true, statusHistory: true } })
  }

  // fallback: try to find by dossierNumber
  return prisma.dossier.findFirst({ where: { dossierNumber: idOrRef }, include: { documents: true, client: true, statusHistory: true } })
}

export default async function DossierPage({ params }: { params: Promise<{ id?: string }> | { id?: string } }) {
  // Next can pass params as a Promise; await if needed
  const resolved = (params && typeof (params as any).then === 'function') ? await (params as any) : params
  const id = resolved?.id
  console.log('[DossierPage] params.id =', id)

  if (!id) {
    console.warn('[DossierPage] No id provided in params')
    return <div className="p-6">Dossier introuvable (identifiant manquant)</div>
  }

  try {
    const dossier = await getDossier(id)
    console.log('[DossierPage] dossier found?', !!dossier)

    if (!dossier) {
      return (
        <div className="p-6">
          <h2 className="text-lg font-semibold">Dossier introuvable</h2>
          <p className="text-sm text-slate-500 mt-2">Aucun dossier trouvé pour l'identifiant: <code className="bg-slate-100 px-2 rounded">{id}</code></p>
        </div>
      )
    }

    return (
      <div className="w-full h-full bg-white p-6 rounded-2xl shadow flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{dossier.title || dossier.dossierNumber}</h1>
            <p className="text-sm text-slate-500">Client: {dossier.client?.name || '—'}</p>
          </div>
          <div>
            <a href="#upload" className="text-sm text-slate-600">Ajouter un document</a>
          </div>
        </div>

        <section className="mt-6 flex-1 overflow-auto">
          <DossierViewer dossierId={dossier.id} initialDocs={dossier.documents ?? []} client={dossier.client} />
        </section>

        <section id="upload" className="mt-6">
          <h3 className="font-semibold mb-2">Ajouter un document (URL)</h3>
          <form action={`/api/documents`} method="post" className="flex gap-2">
            <input type="hidden" name="dossierId" value={dossier.id} />
            <input name="name" placeholder="Document name" className="px-3 py-2 border rounded w-1/3" />
            <input name="fileUrl" placeholder="https://..." className="px-3 py-2 border rounded flex-1" />
            <button className="px-4 py-2 rounded bg-[#262EE3] text-white">Upload</button>
          </form>
        </section>
      </div>
    )
  } catch (err) {
    console.error('[DossierPage] error', err)
    return <div className="p-6">Erreur lors du chargement du dossier.</div>
  }
}
