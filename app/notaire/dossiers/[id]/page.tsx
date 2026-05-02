import { prisma } from '@/lib/db'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'

async function getDossier(id: string) {
  return prisma.dossier.findUnique({ where: { id }, include: { documents: true, client: true, statusHistory: true } })
}

export default async function DossierPage({ params }: { params: { id: string } }) {
  const dossier = await getDossier(params.id)

  if (!dossier) return <div>Not found</div>

  return (
    <div className="flex">
      <AppSidebar user={{ name: dossier.client?.name || 'Maître Dupont', email: dossier.client?.email }} navMain={[{ title: 'Dossiers', url: '/notaire/dossiers' }]} documents={[]} />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{dossier.title || dossier.dossierNumber}</h1>
              <p className="text-sm text-slate-500">Client: {dossier.client?.name || '—'}</p>
            </div>
            <div>
              <a href="#upload" className="text-sm text-slate-600">Ajouter un document</a>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="font-semibold mb-2">Documents</h2>
            <ul className="space-y-2">
              {(dossier.documents as any[]).map((doc) => (
                <li key={doc.id} className="flex items-center justify-between border p-3 rounded">
                  <div>
                    <div className="font-medium text-blue-600">{doc.name}</div>
                    <div className="text-sm text-slate-500">{doc.fileUrl}</div>
                  </div>
                  <div>
                    <a target="_blank" href={doc.fileUrl} className="text-sm text-slate-700">View</a>
                  </div>
                </li>
              ))}
            </ul>
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
      </main>
    </div>
  )
}
