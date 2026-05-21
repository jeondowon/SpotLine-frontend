export default function StoreInfo({ name, address }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: '#fff', border: '1px solid var(--line)',
      borderRadius: 'var(--radius)', padding: '14px 18px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, #FFE6CC, #FFC78A)',
        display: 'grid', placeItems: 'center',
        fontWeight: 700, color: '#8A4A14', fontSize: 16,
      }}>
        {name?.[0] ?? '매'}
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.015em', lineHeight: 1.2 }}>{name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>{address}</div>
      </div>

      <span style={{
        marginLeft: 'auto', flexShrink: 0,
        fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
        background: 'var(--good-soft)', color: 'oklch(0.42 0.12 155)',
        border: '1px solid oklch(0.88 0.06 155)',
      }}>
        영업 중
      </span>
    </div>
  )
}
