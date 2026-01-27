"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

type Quarter = {
  year: number
  part: number
  absIndex: number
  label: string
}

export function TaxiTaxCalculator() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const currentPart = Math.floor((currentMonth - 1) / 3) + 1
  const currentAbsoluteIndex = currentYear * 4 + (currentPart - 1)

  const [taxiGrade, setTaxiGrade] = useState<string | null>(null)
  const [selectedQuarters, setSelectedQuarters] = useState<number[]>([])
  const [resultText, setResultText] = useState("")

  const startYear = currentYear - 3
  const allQuarters: Quarter[] = []

  for (let year = startYear; year <= currentYear; year++) {
    for (let part = 1; part <= 4; part++) {
      const absIndex = year * 4 + (part - 1)
      if (absIndex <= currentAbsoluteIndex) {
        allQuarters.push({
          year,
          part,
          absIndex,
          label: `T${part} - ${year}`,
        })
      }
    }
  }

  const toggleQuarter = (absIndex: number) => {
    setSelectedQuarters(prev =>
      prev.includes(absIndex)
        ? prev.filter(q => q !== absIndex)
        : [...prev, absIndex]
    )
  }

  const calculateTax = () => {
    if (!taxiGrade || selectedQuarters.length === 0) {
      setResultText("Veuillez sélectionner une catégorie et au moins un trimestre.")
      return
    }

    const baseTaxPerPart = 150
    const secondTaxPerPart = taxiGrade === "1" ? 100 : 70

    let delayFee = 0
    let baseTax = 0
    let secondTax = 0

    const selectedParts = allQuarters
      .filter(q => selectedQuarters.includes(q.absIndex))
      .sort((a, b) => b.absIndex - a.absIndex)

    const delayInfo: string[] = []

    selectedParts.forEach(p => {
      const partMonthStart = (p.part - 1) * 3 + 1
      const delayMonths = (currentYear - p.year) * 12 + (currentMonth - partMonthStart)

      const fee = p.absIndex === currentAbsoluteIndex
        ? 0
        : baseTaxPerPart * ((1.5 * delayMonths) / 100)

      delayFee += fee
      if (fee > 0) {
        delayInfo.push(`${p.label} → +${(1.5 * delayMonths).toFixed(1)}% = ${fee.toFixed(2)} DH`)
      }
    })

    const totalParts = selectedParts.length
    baseTax = baseTaxPerPart * totalParts
    secondTax = secondTaxPerPart * totalParts
    const total = baseTax + delayFee + secondTax

    const result = `🧾 Rapport de Taxe\n
Trimestres sélectionnés : ${totalParts}
Trimestres en retard : ${delayInfo.length}

⏰ Détail des pénalités :
${delayInfo.join("\n")}

Taxe 1 de base : ${baseTax.toFixed(2)} DH
Pénalité sur Taxe 1 : ${delayFee.toFixed(2)} DH
Taxe 2 : ${secondTax.toFixed(2)} DH

TOTAL : ${total.toFixed(2)} DH`

    setResultText(result)
  }

  const quartersGroupedByYear = allQuarters.reduce<Record<number, Quarter[]>>((acc, q) => {
    acc[q.year] = acc[q.year] || []
    acc[q.year].push(q)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Calculateur de Taxe pour Taxis</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            {now.toLocaleString("fr-FR", { month: "long", year: "numeric" })} (Trimestre {currentPart})
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label>Catégorie de Taxi</Label>
            <Select onValueChange={setTaxiGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Choisissez la catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1">1ère catégorie</SelectItem>
                  <SelectItem value="2">2ème catégorie</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Trimestres impayés (groupés par année)</Label>
            <div className="space-y-4 max-h-96 overflow-y-auto border rounded-md p-3 bg-muted/10">
              {Object.entries(quartersGroupedByYear).map(([year, quarters]) => (
                <div key={year} className="border-b pb-2">
                  <p className="font-semibold mb-2">{year}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {quarters.map(q => (
                      <div key={q.absIndex} className="flex items-center space-x-2">
                        <Checkbox
                          id={`q-${q.absIndex}`}
                          checked={selectedQuarters.includes(q.absIndex)}
                          onCheckedChange={() => toggleQuarter(q.absIndex)}
                        />
                        <Label htmlFor={`q-${q.absIndex}`} className="cursor-pointer">
                          {q.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={calculateTax}>
            Calculer
          </Button>

          {resultText && (
            <div className="mt-4 text-sm whitespace-pre-wrap border border-muted rounded-md p-3 bg-muted/10">
              {resultText}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
