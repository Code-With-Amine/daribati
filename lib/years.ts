export function tndYearsOptions() {
  const currentYear = new Date().getFullYear();

  const tndYearsOptions = [
    { value: (currentYear - 4).toString(), label: (currentYear - 4).toString() },
    { value: (currentYear - 3).toString(), label: (currentYear - 3).toString() },
    { value: (currentYear - 2).toString(), label: (currentYear - 2).toString() },
    { value: (currentYear - 1).toString(), label: (currentYear - 1).toString() },
    { value: currentYear.toString(), label: currentYear.toString() },
  ];

  return tndYearsOptions;
}
