"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const chartConfig = {
  dossiers: {
    label: "Dossiers",
    color: "var(--primary)",
  },
  termines: {
    label: "Terminés",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ data: initialData }: { data: { date: string; dossiers: number; termines: number }[] }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  const referenceDate = initialData.length > 0 ? new Date(initialData[initialData.length - 1].date) : new Date()
  const filteredData = initialData.filter((item) => {
    const date = new Date(item.date)
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Activité des dossiers</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Nouveaux dossiers et dossiers terminés par jour
          </span>
          <span className="@[540px]/card:hidden">Activité par jour</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 mois</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 jours</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 jours</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Période"
            >
              <SelectValue placeholder="3 mois" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">3 mois</SelectItem>
              <SelectItem value="30d" className="rounded-lg">30 jours</SelectItem>
              <SelectItem value="7d" className="rounded-lg">7 jours</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDossiers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-dossiers)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-dossiers)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillTermines" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-termines)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-termines)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => new Date(value).toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" })}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="termines" type="natural" fill="url(#fillTermines)" stroke="var(--color-termines)" stackId="a" />
            <Area dataKey="dossiers" type="natural" fill="url(#fillDossiers)" stroke="var(--color-dossiers)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
