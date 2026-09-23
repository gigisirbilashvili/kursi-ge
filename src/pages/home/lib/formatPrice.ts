export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: price >= 1 ? 2 : 4,
    maximumFractionDigits: price >= 100 ? 2 : price >= 1 ? 4 : 8,
  }).format(price)
}
