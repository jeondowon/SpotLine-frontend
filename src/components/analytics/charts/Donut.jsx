export default function Donut({ slices, size = 130, label = "" }) {
  const sw = 22, r = (size - sw) / 2, c = 2 * Math.PI * r
  let offset = 0
  const arcs = slices.map((s) => {
    const len = (s.pct / 100) * c
    const arc = { ...s, len, offset: -offset }
    offset += len
    return arc
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F3F6" strokeWidth={sw}/>
      {arcs.map((s, i) => (
        <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={s.color} strokeWidth={sw}
          strokeDasharray={`${s.len} ${c}`} strokeDashoffset={s.offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="butt"/>
      ))}
      {label && (
        <g>
          <text x={size / 2} y={size / 2 - 2} fontSize="11" textAnchor="middle" fill="#9AA3AF">{label}</text>
          <text x={size / 2} y={size / 2 + 16} fontSize="18" fontWeight="700" textAnchor="middle" fill="#0F1419" fontFamily="JetBrains Mono">
            {slices.reduce((s, x) => s + (x.count || 0), 0).toLocaleString()}
          </text>
        </g>
      )}
    </svg>
  )
}
