const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatPrice(value: number) {
  return usd.format(value)
}

export function formatPriceRange(min: number, max?: number | null) {
  return max == null || max === min
    ? formatPrice(min)
    : `${formatPrice(min)} - ${formatPrice(max)}`
}
