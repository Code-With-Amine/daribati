"use client"

import { useState } from "react"
import type React from "react"
import { MultiSelect, type Option } from "./multi-select"
import { cn } from "@/lib/utils"
import {tndYearsOptions} from "@/lib/years";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { calculateAmountForYear, breakdownForYear } from "@/lib/tnb-utils" // utility functions
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export function TnbForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [superficie, setSuperficie] = useState("")
  const [etage, setEtage] = useState<string | null>(null)
  const [zone, setZone] = useState<string | null>(null)
  const [selectedTndYears, setSelectedTndYears] = useState<string[]>([])
  const [selectedDeclaredTnbYears, setSelectedDeclaredTnbYears] = useState<string[]>([])
  const [totalYears, setTotalYears] = useState<number>(0)
  const [results, setResults] = useState<Array<{
    year: string
    total: number
    principal: number
    tarif: number
    breakdown: any
    isDeclared: boolean
  }>>([])


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const superficieValue = parseFloat(superficie)
    setTotalYears(0)
    if (isNaN(superficieValue) || superficieValue <= 0) return

    const computed = selectedTndYears.map((year) => {
      const y = parseInt(year)
      const isDeclared = selectedDeclaredTnbYears.includes(year)
      const tarif = (y >= 2026 && zone === "A") ? (etage == "villa" ? 15 : 20) : (etage == "villa" ? 6 : 10)
      const principal = superficieValue * tarif
      const breakdown = breakdownForYear(y, principal, isDeclared)
      return { year, total: breakdown.total, principal, tarif, breakdown, isDeclared }
    })
    const total = computed.reduce((sum, item) => sum + item.total, 0)
    setTotalYears(total)
    setResults(computed)
  }

  const generatePdf = async () => {
    if (results.length === 0) return

    // helper to load image from public and convert to data URL
    const loadImageAsDataUrl = async (url: string) => {
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        return await new Promise<string | ArrayBuffer | null>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (err) {
        console.warn("Could not load image", url, err)
        return null
      }
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" })

  // try to add the logo (place the logo file in /public/TNBLogo.png)
  const imgData = await loadImageAsDataUrl("/TNBLogo.png")
    if (imgData) {
      try {
        // center the logo at the top of the page
        const pageWidth = (doc.internal?.pageSize?.getWidth && doc.internal.pageSize.getWidth()) || (doc.internal?.pageSize?.width as number) || 595
        const imgW = 80
        const imgH = 80
        const x = (pageWidth - imgW) / 2
        const y = 30
        doc.addImage(imgData as string, "PNG", x, y, imgW, imgH)
      } catch (e) {
        console.warn("Failed to add logo to PDF:", e)
      }
    }

    const title = "TNB - Détails du calcul et des majorations"
    doc.setFontSize(16)
    // title under the logo
    doc.text(title, 40, 130)

    // Summary
    doc.setFontSize(11)
    doc.text(`Superficie: ${superficie} m²`, 40, 100)
    doc.text(`Zone: ${zone || "-"}`, 260, 100)
    doc.text(`Type: ${etage || "-"}`, 420, 100)

    // Table data
    const tableBody = results.map((r) => {
      const br = r.breakdown
      return [
        r.year,
        r.tarif?.toString() || "-",
        r.principal.toFixed(2),
        (br.def || 0).toFixed(2),
        (br.maj10 || 0).toFixed(2),
        (br.maj5 || 0).toFixed(2),
        (br.maj0_5 || 0).toFixed(2),
        (br.monthsLate || 0).toString(),
        (br.total || 0).toFixed(2),
      ]
    })

    autoTable(doc, {
      startY: 160,
      head: [["Année", "Tarif/m²", "Principal", "Défaut", "Maj 10%", "Maj 5%", "Maj 0.5%/mois", "Mois retard", "Total"]],
      body: tableBody,
      styles: { fontSize: 10 },
    })

  const lastAutoTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
  const finalY = lastAutoTable?.finalY || 140
    doc.setFontSize(12)
    doc.text("Explication des majorations:", 40, finalY + 30)
    doc.setFontSize(10)
    const explanation = [
      "- Défaut (pénalité) : si non déclaré, 15% du principal ou minimum 500 DH.",
      "- Majoration 10% : pénalité fixe de 10% du principal.",
      "- Majoration 5% : pénalité supplémentaire de 5% du principal.",
      "- Majoration 0.5% par mois : intérêts de retard de 0.5% du principal par mois de retard.",
      "- Mois de retard : calculés depuis mars de l'année impayée jusqu'au mois courant.",
    ]

    let y = finalY + 50
    explanation.forEach((line) => {
      doc.text(line, 40, y)
      y += 16
    })

    doc.setFontSize(12)
    doc.text(`Total à payer: ${totalYears.toFixed(2)} DH`, 40, y + 10)

    const fileName = `TNB_calcul_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.pdf`
    doc.save(fileName)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Terrains non bâtis (Non exonérés)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="superficie">Taille du terrain en m²</Label>
                <Input
                  id="superficie"
                  type="number"
                  value={superficie}
                  onChange={(e) => setSuperficie(e.target.value)}
                  placeholder="ex: 92"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="zone">Zone</Label>
                <Select onValueChange={setZone}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisissez une zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Zone</SelectLabel>
                      <SelectItem value="A">Zone A</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="etage">Nombre d'étages</Label>
                <Select onValueChange={setEtage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisissez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Type de terrain</SelectLabel>
                      <SelectItem value="villa">R ≤ 3 (Zone villa ou maison)</SelectItem>
                      <SelectItem value="immeuble">R ≥ 3 (Zone immeuble)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Années non payées</Label>
                <MultiSelect
                  options={tndYearsOptions()}
                  selected={selectedTndYears}
                  onChange={setSelectedTndYears}
                  placeholder="Sélectionnez les années"
                />
              </div>

              <div className="grid gap-2">
                <Label>Années déclarées</Label>
                <MultiSelect
                  options={tndYearsOptions().map((o) => ({
                    value: o.value,
                    label: `Je déclare ${o.label}`,
                  }))}
                  selected={selectedDeclaredTnbYears}
                  onChange={setSelectedDeclaredTnbYears}
                  placeholder="Sélectionnez les années déclarées"
                />
              </div>

              <Button type="submit" className="w-full">
                Calculer
              </Button>

              {results.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-center mb-2">Résultats</h3>
                  <ul className="space-y-1 text-sm">
                    {results.map((r) => (
                      <li key={r.year}>
                        <strong>{r.year}:</strong> {r.total.toFixed(2)} DH
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex gap-3">
                    <Button variant="secondary" onClick={generatePdf} className="flex-1">
                      Télécharger le reçu (PDF)
                    </Button>
                  </div>
                </div>
              )}

              {totalYears > 0 && (
                <p className="space-y-1 text-sm">
                  <strong>Total: </strong>
                  {totalYears.toFixed(2)} DH
                </p>
              )}

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
