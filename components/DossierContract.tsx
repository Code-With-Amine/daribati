"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

export default function DossierContract({ dossierId, initialContracts, client }: { dossierId: string; initialContracts: any[]; client: any }) {
  const [contracts, setContracts] = useState(initialContracts)
  const [showForm, setShowForm] = useState(false)
  const [buyerName, setBuyerName] = useState("")
  const [buyerType, setBuyerType] = useState("citizen")
  const [sellerName, setSellerName] = useState(client?.name || "")
  const [sellerType, setSellerType] = useState("citizen")
  const [propertyAddress, setPropertyAddress] = useState("")
  const [propertyDescription, setPropertyDescription] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any>(null)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    try {
      const token = localStorage.getItem("token")
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          dossierId,
          buyerName,
          buyerType,
          sellerName,
          sellerType,
          propertyAddress,
          propertyDescription,
          price: parseFloat(price) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setContracts((prev) => [data.contract, ...prev])
      setShowForm(false)
      setBuyerName("")
      setPropertyAddress("")
      setPropertyDescription("")
      setPrice("")
      toast.success("Contrat généré avec succès")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{contracts.length} contrat{contracts.length > 1 ? "s" : ""}</p>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "Générer un contrat"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleGenerate} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Acheteur</label>
              <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required placeholder="Nom de l'acheteur" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type acheteur</label>
              <select value={buyerType} onChange={(e) => setBuyerType(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
                <option value="citizen">Citoyen</option>
                <option value="company">Société</option>
                <option value="government_entity">Entité gouvernementale</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Vendeur</label>
              <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} required placeholder="Nom du vendeur" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type vendeur</label>
              <select value={sellerType} onChange={(e) => setSellerType(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
                <option value="citizen">Citoyen</option>
                <option value="company">Société</option>
                <option value="government_entity">Entité gouvernementale</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Adresse du bien</label>
              <Input value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="Adresse" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prix (DH)</label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="500000" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description du bien</label>
            <textarea value={propertyDescription} onChange={(e) => setPropertyDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm" rows={2} placeholder="Description..." />
          </div>
          <Button type="submit" disabled={generating} className="bg-[#262EE3] text-white">
            {generating ? "Génération..." : "Générer le contrat"}
          </Button>
        </form>
      )}

      <div className="space-y-2">
        {contracts.map((c) => (
          <Dialog key={c.id}>
            <DialogTrigger asChild>
              <div className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                <p className="font-medium text-sm">{c.title}</p>
                <p className="text-xs text-gray-500">Généré le {new Date(c.generatedAt).toLocaleDateString("fr-FR")}</p>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{c.title}</DialogTitle>
              </DialogHeader>
              <pre className="whitespace-pre-wrap text-sm font-sans bg-gray-50 p-4 rounded-lg">{c.content}</pre>
              <Button size="sm" variant="outline" onClick={() => {
                navigator.clipboard.writeText(c.content)
                toast.success("Contenu copié")
              }}>Copier le contenu</Button>
            </DialogContent>
          </Dialog>
        ))}
        {contracts.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Aucun contrat généré</p>}
      </div>
    </div>
  )
}