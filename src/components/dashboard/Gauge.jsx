export default function Gauge({ value }) {
  const size = 116, sw = 12, r = (size - sw) / 2, c = 2 * Math.PI * r
  const filled = (value / 100) * c
  const color = value > 70
    ? "oklch(0.62 0.18 25)"
    : value > 45
    ? "oklch(0.72 0.15 65)"
    : "oklch(0.62 0.13 155)"
  return (
    <svg width={size} height={size} className="gauge" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#F1F3F6" strokeWidth={sw} fill="none"/>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={sw} fill="none"
        strokeLinecap="round" strokeDasharray={`${filled} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`}/>
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fontSize="24" fontWeight="700" fill="#0F1419" fontFamily="JetBrains Mono">{value}</text>
      <text x={size / 2} y={size / 2 + 16} textAnchor="middle" fontSize="11" fill="#6B7280">/ 100</text>
    </svg>
  )
}
