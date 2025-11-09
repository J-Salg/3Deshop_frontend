export function formatUSD(value) {
  const n = typeof value === 'number' ? value : Number(value);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}