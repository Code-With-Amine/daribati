"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Loader2, Sparkles, FileText, Copy, RefreshCw } from "lucide-react"



const METHOD_LABELS: Record<string, string> = {
  AI: "IA",
  TEMPLATE: "Modèle",
  INSPIRATION: "Inspiration",
}

export default function DossierContract({ dossierId, initialContracts, client }: { dossierId: string; initialContracts: any[]; client: any }) {
  const [contracts, setContracts] = useState(initialContracts)
  const [showGenerator, setShowGenerator] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [prompt, setPrompt] = useState("")
  const [method, setMethod] = useState<string>("AI")
  const [templateId, setTemplateId] = useState<string>("")
  const [templates, setTemplates] = useState<any[]>([])
  const [references, setReferences] = useState<any[]>([])
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>([])
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({})
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [title, setTitle] = useState("")

  async function loadTemplates() {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/contracts/templates", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (data.templates) setTemplates(data.templates)
    } catch { /* ignore */ }
  }

  async function loadReferences() {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/contracts/references", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (data.references) setReferences(data.references)
    } catch { /* ignore */ }
  }

  async function openGenerator() {
    setShowGenerator(true)
    setPreviewContent(null)
    setPrompt("")
    setMethod("AI")
    setSelectedRefIds([])
    setTemplateVars({})
    setTitle("")
    await Promise.all([loadTemplates(), loadReferences()])
  }

  async function handlePreview() {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const body: any = { dossierId, method }
      if (method === "TEMPLATE") {
        body.templateId = templateId
        body.templateVariables = templateVars
      } else {
        body.prompt = prompt
        if (method === "INSPIRATION") body.referenceIds = selectedRefIds
      }

      const res = await fetch("/api/contracts/generate", {
        method: "POST", headers, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPreviewContent(data.result.content)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!previewContent) return
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const body: any = { dossierId, method, prompt: method !== "TEMPLATE" ? prompt : undefined }
      if (method === "TEMPLATE") {
        body.templateId = templateId
        body.templateVariables = templateVars
      }
      if (method === "INSPIRATION") body.referenceIds = selectedRefIds
      if (title) body.title = title

      const res = await fetch("/api/contracts", {
        method: "POST", headers, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setContracts((prev) => [data.contract, ...prev])
      setShowGenerator(false)
      setPreviewContent(null)
      toast.success("Contrat enregistré")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleTemplateSelect(id: string) {
    setTemplateId(id)
    const tpl = templates.find(t => t.id === id)
    if (tpl) {
      const vars: Record<string, string> = {}
      const matches = tpl.content.match(/\{\{(\w+)\}\}/g) || []
      matches.forEach((m: string) => {
        const key = m.replace(/\{\{|\}\}/g, "")
        const autoVal = getAutoValue(key)
        vars[key] = autoVal
      })
      setTemplateVars(vars)
      setPreviewContent(tpl.content.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) => vars[k] || `{{${k}}}`))
    }
  }

  function getAutoValue(key: string): string {
    const map: Record<string, string> = {
      BUYER_NAME: client?.name || "",
      BUYER_CIN: client?.cin || "",
      BUYER_ADDRESS: "",
      SELLER_NAME: "",
      SELLER_CIN: "",
      SELLER_ADDRESS: "",
      LANDLORD_NAME: "",
      LANDLORD_CIN: "",
      LANDLORD_ADDRESS: "",
      TENANT_NAME: client?.name || "",
      TENANT_CIN: client?.cin || "",
      TENANT_ADDRESS: "",
      DONOR_NAME: client?.name || "",
      DONOR_CIN: client?.cin || "",
      DONOR_ADDRESS: "",
      DONEE_NAME: "",
      DONEE_CIN: "",
      DONEE_ADDRESS: "",
      PROPERTY_ADDRESS: "",
      CADASTRE_NUM: "",
      SURFACE: "",
      PRICE: "",
      RENT: "",
      DEPOSIT: "",
      DURATION: "12",
      START_DATE: "",
      END_DATE: "",
      CITY: "",
      DATE: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      NOTAIRE_NAME: "",
      COMPANY_NAME: "",
      COMPANY_OBJECT: "",
      COMPANY_ADDRESS: "",
      CAPITAL: "",
      SHARES: "",
      SHARE_VALUE: "",
      PARTNER1_NAME: client?.name || "",
      PARTNER1_CIN: client?.cin || "",
      PARTNER1_ADDRESS: "",
      PARTNER1_CONTRIBUTION: "",
      PARTNER2_NAME: "",
      PARTNER2_CIN: "",
      PARTNER2_ADDRESS: "",
      PARTNER2_CONTRIBUTION: "",
      MANAGER_NAME: "",
    }
    return map[key] || ""
  }

  function updateTemplateVar(key: string, value: string) {
    const updated = { ...templateVars, [key]: value }
    setTemplateVars(updated)
    const tpl = templates.find(t => t.id === templateId)
    if (tpl) {
      setPreviewContent(tpl.content.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) => updated[k] || `{{${k}}}`))
    }
  }

  function toggleRef(id: string) {
    setSelectedRefIds(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  function copyContent(content: string) {
    navigator.clipboard.writeText(content)
    toast.success("Contenu copié")
  }

  function getMethodBadge(m: string) {
    const colors: Record<string, string> = { AI: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300", TEMPLATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", INSPIRATION: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[m] || "bg-gray-100"}`}>{METHOD_LABELS[m] || m}</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{contracts.length} contrat{contracts.length > 1 ? "s" : ""}</p>
        <Button size="sm" onClick={openGenerator} className="bg-[#262EE3] text-white">
          <Sparkles className="w-4 h-4 mr-1" /> Générer
        </Button>
      </div>

      <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Génération de contrat</DialogTitle>
            <DialogDescription>Choisissez une méthode de génération</DialogDescription>
          </DialogHeader>

          <Tabs value={method} onValueChange={(v) => { setMethod(v); setPreviewContent(null) }} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="AI"><Sparkles className="w-4 h-4 mr-1" /> IA</TabsTrigger>
              <TabsTrigger value="TEMPLATE"><FileText className="w-4 h-4 mr-1" /> Modèle</TabsTrigger>
              <TabsTrigger value="INSPIRATION"><RefreshCw className="w-4 h-4 mr-1" /> Inspiration</TabsTrigger>
            </TabsList>

            <div className="flex gap-4 flex-1 min-h-0">
              <div className="w-1/2 space-y-4 overflow-y-auto pr-2">
                {method === "AI" && (
                  <div className="space-y-3">
                    <div>
                      <Label>Instructions pour l'IA</Label>
                      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                        placeholder='Ex: "Génère un contrat de vente standard entre un citoyen et une société pour un terrain de 500m² à Casablanca"'
                        rows={6} className="mt-1" />
                    </div>
                    <div>
                      <Label>Titre du contrat (optionnel)</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Contrat de vente - Dupont / SARL Immob" className="mt-1" />
                    </div>
                  </div>
                )}

                {method === "TEMPLATE" && (
                  <div className="space-y-3">
                    <div>
                      <Label>Modèle de contrat</Label>
                      <Select value={templateId} onValueChange={handleTemplateSelect}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner un modèle..." /></SelectTrigger>
                        <SelectContent>
                          {templates.map(t => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} {t.category && <span className="text-gray-400">({t.category})</span>}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {templateId && (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        <Label className="text-xs text-gray-500">Variables du modèle</Label>
                        {Object.entries(templateVars).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500 w-32 shrink-0">{`{{${key}}}`}</span>
                            <Input size={1} value={val} onChange={(e) => updateTemplateVar(key, e.target.value)}
                              className="text-xs h-8" placeholder={`Valeur pour ${key}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {method === "INSPIRATION" && (
                  <div className="space-y-3">
                    <div>
                      <Label>Instructions pour l'IA</Label>
                      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                        placeholder='Ex: "Génère un contrat de vente dans le même style que les références ci-dessous"'
                        rows={4} className="mt-1" />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        Contrats de référence
                        <span className="text-xs text-gray-400">({selectedRefIds.length} sélectionné{selectedRefIds.length > 1 ? "s" : ""})</span>
                      </Label>
                      <div className="mt-1 space-y-1 max-h-[200px] overflow-y-auto border rounded-lg p-2">
                        {references.length === 0 && <p className="text-xs text-gray-400 p-2">Aucune référence. Importez des contrats depuis la page Contrats.</p>}
                        {references.map(r => (
                          <div key={r.id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs ${selectedRefIds.includes(r.id) ? "bg-[#262EE3]/10 border border-[#262EE3]/30" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                            onClick={() => toggleRef(r.id)}>
                            <input type="checkbox" checked={selectedRefIds.includes(r.id)} readOnly className="rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{r.name}</p>
                              {r.dossier && <p className="text-gray-400 truncate">{r.dossier.dossierNumber}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Titre du contrat (optionnel)</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Contrat de vente avec clauses similaires" className="mt-1" />
                    </div>
                  </div>
                )}

                <Button onClick={handlePreview} disabled={loading || (method !== "TEMPLATE" && !prompt) || (method === "TEMPLATE" && !templateId)} className="w-full bg-[#262EE3] text-white">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...</> : "Aperçu du contrat"}
                </Button>
              </div>

              <div className="w-1/2 border rounded-lg bg-gray-50 dark:bg-gray-900/50 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-2 border-b">
                  <span className="text-xs font-medium text-gray-500">APERÇU</span>
                  {previewContent && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => copyContent(previewContent)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  {previewContent ? (
                    <pre className="whitespace-pre-wrap text-xs font-sans leading-relaxed">{previewContent}</pre>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-12">Cliquez sur "Aperçu" pour générer le contrat</p>
                  )}
                </div>
                {previewContent && (
                  <div className="p-2 border-t flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={loading} className="flex-1 bg-[#262EE3] text-white">
                      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</> : "Enregistrer le contrat"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handlePreview} disabled={loading}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {contracts.map((c) => (
          <Dialog key={c.id}>
            <DialogTrigger asChild>
              <div className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{c.title}</p>
                  {getMethodBadge(c.method)}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(c.createdAt || c.generatedAt).toLocaleDateString("fr-FR")}
                  {c.prompt && <span className="ml-2 italic">"{c.prompt.slice(0, 60)}..."</span>}
                </p>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{c.title}</DialogTitle>
                  {getMethodBadge(c.method)}
                </div>
              </DialogHeader>
              <pre className="whitespace-pre-wrap text-sm font-sans bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">{c.content}</pre>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyContent(c.content)}>
                  <Copy className="w-4 h-4 mr-1" /> Copier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ))}
        {contracts.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Aucun contrat généré</p>}
      </div>
    </div>
  )
}
