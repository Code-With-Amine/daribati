export function tndYearsOptions(count: number = 4) {
  const currentYear = new Date().getFullYear();

  const tndYearsOptions = [];
  for (let i = count; i >= 0; i--) {
    const y = currentYear - i;
    tndYearsOptions.push({ value: y.toString(), label: y.toString() });
  }

  return tndYearsOptions;
}
