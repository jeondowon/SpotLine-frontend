import { Ic } from '../ui/Icons'

export default function SalesCard({ sales, bestMenu, peekTime }) {
  const salesValue = sales?.dailySales
  const menuValue = bestMenu?.menu
  const peekValue = peekTime?.time

  return (
    <div className="card">
      <div className="card-h">
        <h3>오늘 매출</h3>
        <span className="sub">· 실시간 집계</span>
      </div>
      <div
        className="card-b"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0,
          alignItems: 'center',
        }}
      >
        {/* 좌측: 매출 수치 */}
        <div style={{ padding: '4px 16px 4px 0', borderRight: '1px solid var(--line)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 10 }}>오늘 총 매출</div>
          <div
            className="mono"
            style={{
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--ink)',
              lineHeight: 1,
            }}
          >
            {salesValue != null ? salesValue.toLocaleString() : '—'}
            {salesValue != null && (
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--muted)',
                  marginLeft: 6,
                  letterSpacing: 0,
                }}
              >
                원
              </span>
            )}
          </div>
        </div>

        {/* 우측: 베스트 메뉴 + 피크 시간 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            padding: '4px 0 4px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: 'oklch(0.955 0.03 65)',
                display: 'grid',
                placeItems: 'center',
                color: 'oklch(0.55 0.14 65)',
                flexShrink: 0,
              }}
            >
              <Ic.Sparkle />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>베스트 메뉴</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                {menuValue ?? '—'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: 'oklch(0.955 0.03 205)',
                display: 'grid',
                placeItems: 'center',
                color: 'oklch(0.5 0.095 218)',
                flexShrink: 0,
              }}
            >
              <Ic.Clock />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>피크 시간</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                {peekValue != null ? `${peekValue}시` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
