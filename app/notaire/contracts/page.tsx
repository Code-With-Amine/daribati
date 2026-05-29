"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Search, Plus, FileText, Upload, Sparkles, Trash2, Copy, ExternalLink, Eye, ArrowUpRight } from "lucide-react"
import { BUILT_IN_TEMPLATES } from "@/lib/contract-templates"
import Link from "next/link"

const CATEGORIES = [
  { value: "vente", label: "Vente" },
  { value: "location", label: "Location" },
  { value: "donation", label: "Donation" },
  { value: "constitution", label: "Constitution" },
  { value: "autre", label: "Autre" },
]

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState("generate")

  // Dossier picker
  const [dossiers, setDossiers] = useState<any[]>([])
  const [dossierSearch, setDossierSearch] = useState("")
  const [selectedDossierId, setSelectedDossierId] = useState<string>("")
  const [selectedDossier, setSelectedDossier] = useState<any>(null)

  // Generation
  const [prompt, setPrompt] = useState("")
  const [method, setMethod] = useState<string>("AI")
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({})
  const [references, setReferences] = useState<any[]>([])
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>([])
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [contracts, setContracts] = useState<any[]>([])

  // Template management
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [editTemplate, setEditTemplate] = useState<any>(null)
  const [templateName, setTemplateName] = useState("")
  const [templateDesc, setTemplateDesc] = useState("")
  const [templateContent, setTemplateContent] = useState("")
  const [templateCategory, setTemplateCategory] = useState("")

  // Ref upload
  const [showRefDialog, setShowRefDialog] = useState(false)
  const [refName, setRefName] = useState("")
  const [refDesc, setRefDesc] = useState("")
  const [refFile, setRefFile] = useState<File | null>(null)
  const [refContent, setRefContent] = useState("")

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const fetchDossiers = useCallback(async () => {
    try {
      const res = await fetch(`/api/dossiers${dossierSearch ? `?q=${encodeURIComponent(dossierSearch)}` : ""}`, { headers })
      const data = await res.json()
      setDossiers(data.dossiers || [])
    } catch { /* ignore */ }
  }, [dossierSearch])

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/contracts/templates", { headers })
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch { /* ignore */ }
  }, [])

  const fetchReferences = useCallback(async () => {
    try {
      const res = await fetch("/api/contracts/references", { headers })
      const data = await res.json()
      setReferences(data.references || [])
    } catch { /* ignore */ }
  }, [])

  const fetchContracts = useCallback(async () => {
    if (!selectedDossierId) return
    try {
      const res = await fetch(`/api/contracts?dossierId=${selectedDossierId}`, { headers })
      const data = await res.json()
      setContracts(data.contracts || [])
    } catch { /* ignore */ }
  }, [selectedDossierId])

  useEffect(() => { fetchDossiers() }, [fetchDossiers])
  useEffect(() => { fetchTemplates() }, [fetchTemplates])
  useEffect(() => { fetchReferences() }, [fetchReferences])
  useEffect(() => { fetchContracts() }, [fetchContracts])

  function handleSelectDossier(id: string) {
    setSelectedDossierId(id)
    const d = dossiers.find(d => d.id === id)
    setSelectedDossier(d)
    setPreviewContent(null)
  }

  async function handlePreview() {
    if (!selectedDossierId) { toast.error("Sélectionnez un dossier d'abord"); return }
    setLoading(true)
    try {
      const body: any = { dossierId: selectedDossierId, method }
      if (method === "TEMPLATE") {
        body.templateId = selectedTemplateId
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
    if (!previewContent || !selectedDossierId) return
    setLoading(true)
    try {
      const body: any = { dossierId: selectedDossierId, method, prompt: method !== "TEMPLATE" ? prompt : undefined }
      if (method === "TEMPLATE") { body.templateId = selectedTemplateId; body.templateVariables = templateVars }
      if (method === "INSPIRATION") body.referenceIds = selectedRefIds
      body.title = `Contrat - ${selectedDossier?.dossierNumber || selectedDossierId}`

      const res = await fetch("/api/contracts", { method: "POST", headers, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setContracts(prev => [data.contract, ...prev])
      toast.success("Contrat enregistré")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleTemplateSelect(id: string) {
    setSelectedTemplateId(id)
    const tpl = [...templates, ...BUILT_IN_TEMPLATES].find(t => (t as any).id === id || (t as any).name === id)
    if (!tpl) return
    const vars: Record<string, string> = {}
    const matches = (tpl as any).content.match(/\{\{(\w+)\}\}/g) || []
    matches.forEach((m: string) => {
      const k = m.replace(/\{\{|\}\}/g, "")
      vars[k] = getAutoValue(k)
    })
    setTemplateVars(vars)
    setPreviewContent((tpl as any).content.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) => vars[k] || `{{${k}}}`))
  }

  function getAutoValue(key: string): string {
    const map: Record<string, string> = {
      CLIENT_NAME: selectedDossier?.client?.name || "",
      CLIENT_EMAIL: selectedDossier?.client?.email || "",
      CLIENT_CIN: selectedDossier?.client?.cin || "",
      BUYER_NAME: selectedDossier?.client?.name || "",
      SELLER_NAME: "", TENANT_NAME: selectedDossier?.client?.name || "", DONOR_NAME: selectedDossier?.client?.name || "",
      LANDLORD_NAME: "", DONEE_NAME: "", PARTNER1_NAME: selectedDossier?.client?.name || "", PARTNER2_NAME: "",
      PROPERTY_ADDRESS: selectedDossier?.landRef || "", CADASTRE_NUM: "", SURFACE: "", PRICE: "", RENT: "", DEPOSIT: "",
      DURATION: "12", START_DATE: "", END_DATE: "", CITY: "",
      DATE: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      NOTAIRE_NAME: "", COMPANY_NAME: "", COMPANY_OBJECT: "", COMPANY_ADDRESS: "", CAPITAL: "", SHARES: "", SHARE_VALUE: "",
      PARTNER1_CONTRIBUTION: "", PARTNER2_CONTRIBUTION: "", MANAGER_NAME: "",
    }
    return map[key] || ""
  }

  function updateTemplateVar(key: string, value: string) {
    const updated = { ...templateVars, [key]: value }
    setTemplateVars(updated)
    const tpl = [...templates, ...BUILT_IN_TEMPLATES].find(t => (t as any).id === selectedTemplateId || (t as any).name === selectedTemplateId)
    if (tpl) setPreviewContent((tpl as any).content.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) => updated[k] || `{{${k}}}`))
  }

  function toggleRef(id: string) {
    setSelectedRefIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  async function handleCreateTemplate(e: React.FormEvent) {
    e.preventDefault()
    if (!templateName || !templateContent) { toast.error("Nom et contenu requis"); return }
    try {
      const res = await fetch("/api/contracts/templates", {
        method: "POST", headers, body: JSON.stringify({ name: templateName, description: templateDesc, content: templateContent, category: templateCategory || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Modèle créé")
      setShowTemplateDialog(false)
      resetTemplateForm()
      fetchTemplates()
    } catch (err: any) { toast.error(err.message) }
  }

  async function handleDeleteTemplate(id: string) {
    try {
      const res = await fetch(`/api/contracts/templates/${id}`, { method: "DELETE", headers })
      if (!res.ok) throw new Error("Erreur")
      toast.success("Modèle supprimé")
      fetchTemplates()
    } catch (err: any) { toast.error(err.message) }
  }

  async function handleUploadRef(e: React.FormEvent) {
    e.preventDefault()
    if (!refContent && !refFile) { toast.error("Contenu ou fichier requis"); return }
    try {
      const fd = new FormData()
      fd.append("name", refName || "Référence")
      if (refDesc) fd.append("description", refDesc)
      if (refFile) fd.append("file", refFile)
      if (refContent) fd.append("content", refContent)

      const uploadHeaders: Record<string, string> = {}
      if (token) uploadHeaders["Authorization"] = `Bearer ${token}`

      const res = await fetch("/api/contracts/references", { method: "POST", headers: uploadHeaders, body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Référence importée")
      setShowRefDialog(false)
      setRefName(""); setRefDesc(""); setRefFile(null); setRefContent("")
      fetchReferences()
    } catch (err: any) { toast.error(err.message) }
  }

  async function handleDeleteRef(id: string) {
    try {
      const res = await fetch(`/api/contracts/references/${id}`, { method: "DELETE", headers })
      if (!res.ok) throw new Error("Erreur")
      toast.success("Référence supprimée")
      fetchReferences()
    } catch (err: any) { toast.error(err.message) }
  }

  function resetTemplateForm() {
    setTemplateName(""); setTemplateDesc(""); setTemplateContent(""); setTemplateCategory(""); setEditTemplate(null)
  }

  function copyContent(c: string) { navigator.clipboard.writeText(c); toast.success("Copié") }

  function getMethodBadge(m: string) {
    const colors: Record<string, string> = {
      AI: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
      TEMPLATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      INSPIRATION: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    }
    const labels: Record<string, string> = { AI: "IA", TEMPLATE: "Modèle", INSPIRATION: "Inspiration" }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[m] || "bg-gray-100"}`}>{labels[m] || m}</span>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contrats</h1>
          <p className="text-sm text-gray-500">Générez et gérez vos contrats notariés</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Modèle</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editTemplate ? "Modifier" : "Nouveau"} modèle de contrat</DialogTitle>
                <DialogDescription>Créez un modèle avec des variables {'{{variable}}'}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nom du modèle</Label>
                    <Input value={templateName} onChange={e => setTemplateName(e.target.value)} required placeholder="Ex: Contrat de vente" />
                  </div>
                  <div>
                    <Label>Catégorie</Label>
                    <Select value={templateCategory} onValueChange={setTemplateCategory}>
                      <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={templateDesc} onChange={e => setTemplateDesc(e.target.value)} placeholder="Description optionnelle" />
                </div>
                <div>
                  <Label>Contenu du modèle</Label>
                  <p className="text-xs text-gray-400 mb-1">Utilisez des {'{{variables}}'} pour les champs dynamiques</p>
                  <Textarea value={templateContent} onChange={e => setTemplateContent(e.target.value)} required
                    rows={12} className="font-mono text-xs" placeholder="CONTRAT DE VENTE&#10;&#10;Le {{DATE}},&#10;&#10;Entre {{BUYER_NAME}} et {{SELLER_NAME}}..." />
                </div>
                <Button type="submit" className="bg-[#262EE3] text-white">Créer le modèle</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showRefDialog} onOpenChange={setShowRefDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1" /> Référence</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importer un contrat de référence</DialogTitle>
                <DialogDescription>Utilisé comme inspiration pour l'IA (few-shot)</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadRef} className="space-y-4">
                <div>
                  <Label>Nom</Label>
                  <Input value={refName} onChange={e => setRefName(e.target.value)} placeholder="Ex: Contrat vente Dupont 2024" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={refDesc} onChange={e => setRefDesc(e.target.value)} placeholder="Contexte optionnel" />
                </div>
                <div>
                  <Label>Fichier (.txt)</Label>
                  <Input type="file" accept=".txt" onChange={e => setRefFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>Ou coller le contenu</Label>
                  <Textarea value={refContent} onChange={e => setRefContent(e.target.value)} rows={8} placeholder="Contenu du contrat de référence..." />
                </div>
                <Button type="submit" className="bg-[#262EE3] text-white">Importer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate"><Sparkles className="w-4 h-4 mr-1" /> Génération</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="w-4 h-4 mr-1" /> Modèles</TabsTrigger>
          <TabsTrigger value="references"><Eye className="w-4 h-4 mr-1" /> Références</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dossier cible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={dossierSearch} onChange={e => setDossierSearch(e.target.value)} placeholder="Rechercher un dossier..." className="pl-9" />
                </div>
                <Select value={selectedDossierId} onValueChange={handleSelectDossier}>
                  <SelectTrigger className="w-[300px]"><SelectValue placeholder="Sélectionner un dossier" /></SelectTrigger>
                  <SelectContent>
                    {dossiers.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.dossierNumber} - {d.client?.name || "Sans client"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedDossier && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm">
                  <p><strong>{selectedDossier.dossierNumber}</strong> — {selectedDossier.title || "Sans titre"}</p>
                  <p className="text-gray-500">Client: {selectedDossier.client?.name || "N/A"} | Réf: {selectedDossier.landRef || "N/A"}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedDossierId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Génération</CardTitle>
                <CardDescription>Choisissez une méthode de génération</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={method} onValueChange={v => { setMethod(v); setPreviewContent(null) }}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="AI"><Sparkles className="w-4 h-4 mr-1" /> IA</TabsTrigger>
                    <TabsTrigger value="TEMPLATE"><FileText className="w-4 h-4 mr-1" /> Modèle</TabsTrigger>
                    <TabsTrigger value="INSPIRATION"><Upload className="w-4 h-4 mr-1" /> Inspiration</TabsTrigger>
                  </TabsList>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {method === "AI" && (
                        <div>
                          <Label>Instructions</Label>
                          <Textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                            placeholder='Ex: "Génère un contrat de vente standard entre un citoyen et une société pour un terrain de 500m²"'
                            rows={5} className="mt-1" />
                        </div>
                      )}

                      {method === "TEMPLATE" && (
                        <div className="space-y-3">
                          <div>
                            <Label>Modèle</Label>
                            <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                              <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                              <SelectContent>
                                {templates.map(t => (
                                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                                <Separator className="my-1" />
                                {BUILT_IN_TEMPLATES.map(t => (
                                  <SelectItem key={t.name} value={t.name}>{t.name} (intégré)</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedTemplateId && Object.keys(templateVars).length > 0 && (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                              <Label className="text-xs text-gray-500">Variables du modèle</Label>
                              {Object.entries(templateVars).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-gray-500 w-32 shrink-0">{'{{' + key + '}}'}</span>
                                  <Input size={1} value={val} onChange={e => updateTemplateVar(key, e.target.value)} className="text-xs h-8" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {method === "INSPIRATION" && (
                        <div className="space-y-3">
                          <div>
                            <Label>Instructions</Label>
                            <Textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                              placeholder="Génère un contrat dans le style des références sélectionnées"
                              rows={3} className="mt-1" />
                          </div>
                          <div>
                            <Label className="flex items-center gap-2">
                              Références ({selectedRefIds.length} sélectionnée{selectedRefIds.length > 1 ? "s" : ""})
                            </Label>
                            <div className="mt-1 space-y-1 max-h-[200px] overflow-y-auto border rounded-lg p-2">
                              {references.map(r => (
                                <div key={r.id}
                                  className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs ${selectedRefIds.includes(r.id) ? "bg-[#262EE3]/10 border border-[#262EE3]/30" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                                  onClick={() => toggleRef(r.id)}>
                                  <input type="checkbox" checked={selectedRefIds.includes(r.id)} readOnly className="rounded" />
                                  <span className="font-medium truncate">{r.name}</span>
                                </div>
                              ))}
                              {references.length === 0 && <p className="text-xs text-gray-400 p-2">Aucune référence importée</p>}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={handlePreview} disabled={loading || (!prompt && method !== "TEMPLATE") || (method === "TEMPLATE" && !selectedTemplateId)}
                          className="flex-1 bg-[#262EE3] text-white">
                          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...</> : "Générer un aperçu"}
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg bg-gray-50 dark:bg-gray-900/50 flex flex-col min-h-[400px]">
                      <div className="flex items-center justify-between p-2 border-b">
                        <span className="text-xs font-medium text-gray-500">APERÇU</span>
                        {previewContent && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => copyContent(previewContent!)}><Copy className="w-3.5 h-3.5" /></Button>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 overflow-y-auto">
                        {previewContent ? (
                          <pre className="whitespace-pre-wrap text-xs font-sans leading-relaxed">{previewContent}</pre>
                        ) : (
                          <p className="text-gray-400 text-sm text-center py-12">Cliquez sur "Générer" pour prévisualiser</p>
                        )}
                      </div>
                      {previewContent && (
                        <div className="p-2 border-t">
                          <Button onClick={handleSave} disabled={loading} className="w-full bg-[#262EE3] text-white">
                            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</> : "Enregistrer le contrat dans le dossier"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {selectedDossierId && contracts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contrats du dossier</CardTitle>
                <CardDescription>{contracts.length} contrat{contracts.length > 1 ? "s" : ""}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contracts.map(c => (
                    <div key={c.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{c.title}</span>
                          {getMethodBadge(c.method)}
                        </div>
                        <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => copyContent(c.content)}><Copy className="w-3.5 h-3.5" /></Button>
                        <Link href={`/notaire/dossiers/${c.dossierId}`}>
                          <Button size="sm" variant="ghost"><ArrowUpRight className="w-3.5 h-3.5" /></Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...BUILT_IN_TEMPLATES.map(t => ({ ...t, builtIn: true })), ...templates.map(t => ({ ...t, builtIn: false }))].map(t => (
              <Card key={(t as any).id || (t as any).name} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium">{(t as any).name}</CardTitle>
                      {(t as any).category && <Badge variant="outline" className="mt-1 text-xs">{(t as any).category}</Badge>}
                    </div>
                    {(t as any).builtIn && <Badge variant="secondary" className="text-xs">Intégré</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-xs text-gray-500 line-clamp-2">{(t as any).description || "Aucune description"}</p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-400">
                      {((t as any).content.match(/\{\{\w+\}\}/g) || []).length} variables
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm" variant="outline" className="flex-1"
                    onClick={() => { setSelectedTemplateId((t as any).id || (t as any).name); setActiveTab("generate") }}>
                    Utiliser
                  </Button>
                  {!(t as any).builtIn && (
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate((t as any).id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="references">
          <div className="space-y-2">
            {references.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{r.name}</p>
                  {r.description && <p className="text-xs text-gray-500">{r.description}</p>}
                  <p className="text-xs text-gray-400">{r.content.length} caractères{r.dossier ? ` — ${r.dossier.dossierNumber}` : ""}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { copyContent(r.content) }}><Copy className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteRef(r.id)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                </div>
              </div>
            ))}
            {references.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Aucune référence importée</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
