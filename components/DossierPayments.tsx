"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Badge } from "./ui/badge"
import { Plus, Download, CheckCircle } from "lucide-react"

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  UNPAID: { label: "Impayé", variant: "destructive" },
  PARTIAL: { label: "Partiel", variant: "secondary" },
  PAID: { label: "Payé", variant: "default" },
}

export default function DossierPayments({ dossierId, initialPayments }: { dossierId: string; initialPayments: any[] }) {
  const [payments, setPayments] = useState(initialPayments)
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("espèces")
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [receiptLoading, setReceiptLoading] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch("/api/payments", {
        method: "POST",
        headers,
        body: JSON.stringify({ dossierId, amount: parseFloat(amount), method, dueDate: dueDate || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPayments((prev) => [data.payment, ...prev])
      setShowForm(false)
      setAmount("")
      setMethod("espèces")
      setDueDate("")
      toast.success("Paiement créé")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkPaid(paymentId: string) {
    try {
      const token = localStorage.getItem("token")
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      const payment = payments.find((p) => p.id === paymentId)
      if (!payment) return
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: "PAID", paidAmount: payment.amount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? data.payment : p)))
      toast.success("Paiement marqué comme payé")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleDownloadReceipt(paymentId: string) {
    setReceiptLoading(paymentId)
    try {
      const token = localStorage.getItem("token")
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers,
        body: JSON.stringify({ paymentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const blob = new Blob([data.receipt.content], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `recu-${data.receipt.number}.html`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Reçu téléchargé")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setReceiptLoading(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{payments.length} paiement{payments.length > 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          {showForm ? "Annuler" : "Nouveau paiement"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 p-4 bg-muted rounded-lg space-y-3 border">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Montant (DH)</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="100000" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Méthode</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full h-9 px-3 rounded-md border bg-background text-sm">
                <option value="espèces">Espèces</option>
                <option value="virement">Virement</option>
                <option value="chèque">Chèque</option>
                <option value="carte">Carte bancaire</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date d&apos;échéance</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer le paiement"}
          </Button>
        </form>
      )}

      <div className="space-y-2">
        {payments.map((p) => {
          const cfg = statusConfig[p.status] || { label: p.status, variant: 'outline' as const }
          return (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
              <div>
                <p className="font-medium">{p.amount.toLocaleString("fr-FR")} DH</p>
                <p className="text-xs text-muted-foreground">{p.method || "—"} · {new Date(p.createdAt).toLocaleDateString("fr-FR")}</p>
                {p.dueDate && <p className="text-xs text-muted-foreground/60">Échéance: {new Date(p.dueDate).toLocaleDateString("fr-FR")}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
                {p.status !== "PAID" ? (
                  <Button size="sm" variant="outline" onClick={() => handleMarkPaid(p.id)} className="text-xs">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Marquer payé
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadReceipt(p.id)}
                    disabled={receiptLoading === p.id}
                    className="text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    {receiptLoading === p.id ? "..." : "Reçu"}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
        {payments.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">Aucun paiement</p>
        )}
      </div>
    </div>
  )
}
