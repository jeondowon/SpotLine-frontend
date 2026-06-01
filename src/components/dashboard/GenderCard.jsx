import Donut from '../ui/Donut'
import { Ic } from '../ui/Icons'
import InfoTooltip from '../ui/InfoTooltip'
import { ceil1 } from '../../utils/format'

const FALLBACK_SLICES = [
  { label: '여성', pct: 58, color: 'oklch(0.7 0.13 0)' },
  { label: '남성', pct: 42, color: 'oklch(0.58 0.12 210)' },
]

export default function GenderCard() {
  const slices = FALLBACK_SLICES

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-h">
        <h3>성별 추정 분포</h3>
        <div className="right">
          <InfoTooltip
            text="Vision AI가 영상에서 익명으로 성별을 추정해 분포를 보여줘요.\n\n주요 고객의 성별 비중을 파악해서 상품 구성이나 마케팅 방향을 잡는 데 도움이 돼요."
          />
        </div>
      </div>
      <div
        className="card-b"
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}
      >
        <div className="donut-wrap" style={{ gap: 100 }}>
          <Donut slices={slices} label="전체" size={170} />
          <div className="donut-legend">
            {slices.map((s) => (
              <div className="row" key={s.label}>
                <span className="sw" style={{ background: s.color }} />
                <span>{s.label}</span>
                <span className="v mono">{ceil1(s.pct)}%</span>
              </div>
            ))}
            <div className="priv" style={{ marginTop: 6 }}>
              <Ic.Shield color="#9AA3AF" />
              외관 기반 추정 · 얼굴 식별 없음
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
