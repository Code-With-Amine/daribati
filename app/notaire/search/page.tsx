"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, FileText, Users, FolderOpen, ArrowUpRight } from "lucide-react"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!query || query.length < 2) return
    setLoading(true)
    setSearched(true)
    try {
      const token = localStorage.getItem("token")
      const headers: any = {}
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { headers })
      const data = await res.json()
      setResults(data.results)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statusLabels: Record<string, string> = {
    EN_COURS: "En cours", DOCUMENTS_MANQUANTS: "Docs manquants",
    CHEZ_COMMUNE: "Chez commune", CHEZ_CONSERVATION: "Chez conservation",
    VALIDATION_BANCAIRE: "Val. bancaire", EN_ATTENTE_SIGNATURE: "Attente signature",
    TERMINE: "Terminé",
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recherche globale</h1>
        <p className="text-sm text-muted-foreground">Recherchez dans les dossiers, clients et documents</p>
      </div>

      <div className="flex gap-3 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Rechercher par nom, CIN, référence dossier, référence foncière..."
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading || query.length < 2}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          Chercher
        </Button>
      </div>

      {searched && results && (
        <div className="space-y-6">
          {results.dossiers?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" /> Dossiers ({results.dossiers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.dossiers.map((d: any) => (
                  <Link key={d.id} href={`/notaire/dossiers/${d.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">{d.title || d.dossierNumber}</p>
                      <p className="text-sm text-muted-foreground">{d.client?.name || "—"} · {d.client?.cin || ""}</p>
                    </div>
                    <Badge variant="secondary">{statusLabels[d.status] || d.status}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {results.clients?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" /> Clients ({results.clients.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.clients.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-lg border">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.email} · {c.cin || "—"}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {results.documents?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Documents ({results.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.documents.map((d: any) => (
                  <a key={d.id} href={d.fileUrl} target="_blank"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="text-sm text-muted-foreground">Dossier: {d.dossier?.dossierNumber || "—"}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </a>
                ))}
              </CardContent>
            </Card>
          )}

          {(!results.dossiers?.length && !results.clients?.length && !results.documents?.length) && (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                Aucun résultat trouvé pour &ldquo;{query}&rdquo;
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
