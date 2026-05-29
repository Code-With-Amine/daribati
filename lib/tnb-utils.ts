export interface TariffConfig {
  oldVilla: number
  oldImmeuble: number
  newVilla: number
  newImmeuble: number
  calculationDate: Date
}

export function getDefaultTariffConfig(): TariffConfig {
  return {
    oldVilla: 6,
    oldImmeuble: 10,
    newVilla: 15,
    newImmeuble: 20,
    calculationDate: new Date(),
  }
}

export function getTariffForYear(year: number, type: 'villa' | 'immeuble', config: TariffConfig): number {
  const transitionYear = config.calculationDate.getFullYear()
  const isNewTariff = year >= transitionYear
  if (type === 'villa') return isNewTariff ? config.newVilla : config.oldVilla
  return isNewTariff ? config.newImmeuble : config.oldImmeuble
}

export function calculateAmountForYear(
  year: number,
  superficie: number,
  type: 'villa' | 'immeuble',
  config: TariffConfig,
  isDeclared: boolean = false,
  zone?: string,
): number {
  const tarif = getTariffForYear(year, type, config)
  const principal = superficie * tarif
  const calcDate = new Date(config.calculationDate)
  const currentMonth = calcDate.getMonth() + 1
  const currentYear = calcDate.getFullYear()

  if (year === currentYear && (currentMonth === 1 || currentMonth === 2)) {
    return principal
  }

  const def = isDeclared ? 0 : Math.max(principal * 0.15, 500)
  const maj10 = principal * 0.1
  const maj5 = principal * 0.05

  const monthsLate = Math.max((currentYear - year) * 12 + (currentMonth - 3), 0)
  const maj0_5 = principal * 0.005 * monthsLate

  return principal + maj10 + maj5 + maj0_5 + def
}

export function breakdownForYear(
  year: number,
  superficie: number,
  type: 'villa' | 'immeuble',
  config: TariffConfig,
  isDeclared: boolean = false,
  zone?: string,
) {
  const tarif = getTariffForYear(year, type, config)
  const principal = superficie * tarif
  const calcDate = new Date(config.calculationDate)
  const currentMonth = calcDate.getMonth() + 1
  const currentYear = calcDate.getFullYear()

  if (year === currentYear && (currentMonth === 1 || currentMonth === 2)) {
    return { principal, tarif, def: 0, maj10: 0, maj5: 0, maj0_5: 0, monthsLate: 0, total: principal }
  }

  const def = isDeclared ? 0 : Math.max(principal * 0.15, 500)
  const maj10 = principal * 0.1
  const maj5 = principal * 0.05

  const monthsLate = Math.max((currentYear - year) * 12 + (currentMonth - 3), 0)
  const maj0_5 = principal * 0.005 * monthsLate

  const total = principal + maj10 + maj5 + maj0_5 + def
  return { principal, tarif, def, maj10, maj5, maj0_5, monthsLate, total }
}
