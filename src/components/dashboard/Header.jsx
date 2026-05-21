export default function Header() {
  const name    = localStorage.getItem('store_name')    ?? '스팟라인 홍대점'
  const address = localStorage.getItem('store_address') ?? '서울시 마포구 홍익로 15'

  return (
    <header className="hdr">
      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, #FFE6CC, #FFC78A)',
        display: 'grid', placeItems: 'center',
        fontWeight: 700, color: '#8A4A14', fontSize: 16,
      }}>
        {name[0]}
      </div>

      <div>
        <div className="hdr-title">{name}</div>
        <div className="hdr-sub">{address}</div>
      </div>

    </header>
  )
}
