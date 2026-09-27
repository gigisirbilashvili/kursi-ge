export function formatSignificantNumber(value: number, maximumSignificantDigits = 12): string {
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits }).format(value)
}
