// Round up (ceiling) to 1 decimal place, formatted as string
export function ceil1(x) {
  if (x == null || isNaN(x)) return x
  return (Math.ceil(x * 10) / 10).toFixed(1)
}
