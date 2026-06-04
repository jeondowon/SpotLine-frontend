import { useState, useEffect } from 'react'
import { fetchWeatherImpact } from '../../api/index'
import InfoTooltip from '../ui/InfoTooltip'
import { ceil1 } from '../../utils/format'

const INFO_TEXT = '비가 와서 손님이 적었다면, 날씨 탓일까요? 매장 탓일까요?\n\n날씨와 요일 효과를 제거하고 순수하게 매장 성과만 평가해줘요. 오늘 조건에서 기대되는 방문자 수 대비 실제로 얼마나 잘 됐는지 확인할 수 있어요.';

const RESULT_META = {
  GOOD: { zone: '날씨 감안하면 선방', desc: '불리한 날씨·요일 조건에서도 기대치를 넘겼어요. 효과 요인을 기록하세요.', bg: 'var(--good-soft)', ink: 'oklch(0.42 0.12 155)', barColor: 'var(--good)' },
  BAD: { zone: '날씨 좋았는데 부진', desc: '유리한 날씨·요일 조건인데 기대치에 못 미쳤어요. 부진 요인을 점검하세요.', bg: 'var(--bad-soft)', ink: 'oklch(0.45 0.16 25)', barColor: 'var(--bad)' },
  NORMAL: { zone: '날씨 대비 보통', desc: '날씨·요일 조건을 감안하면 기대 수준이에요. 기준 흐름을 기록하세요.', bg: 'var(--warn-soft)', ink: 'oklch(0.55 0.14 65)', barColor: 'var(--warn)' },
}

function meta(result) { return RESULT_META[result] ?? RESULT_META.NORMAL }

function BarRow({ label, value, max, color }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 40px', gap: 10, alignItems: 'center', fontSize: 12 }}>
      <div style={{ color: 'var(--muted)', textAlign: 'right' }}>{label}</div>
      <div style={{ height: 8, background: '#F1F3F6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 99, transition: 'width .5s ease' }} />
      </div>
      <div className="mono" style={{ fontWeight: 600, textAlign: 'right' }}>
        {typeof value === 'number' ? ceil1(value) : value}
      </div>
    </div>
  )
}

export default function WeatherPerformance({ startAt, endAt }) {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    fetchWeatherImpact(startAt, endAt).then(setWeather).catch(() => {})
  }, [startAt, endAt])

  if (!weather) {
    return (
      <div className="card">
        <div className="card-h">
          <h3>날씨 대비 실제 성과</h3>
          <div className="right"><InfoTooltip text={INFO_TEXT} /></div>
        </div>
        <div className="card-b">
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted-2)' }}>날씨 보정 데이터가 없습니다.</p>
        </div>
      </div>
    )
  }

  const { realValue, expectValue, adjustedValue, result } = weather
  const m = meta(result)
  const ratio = ceil1((realValue / expectValue) * 100)
  const maxVal = Math.max(realValue, expectValue, adjustedValue ?? 0)

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-h">
        <h3>날씨 대비 실제 성과</h3>
        <div className="right"><InfoTooltip text={INFO_TEXT} /></div>
      </div>

      <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
        {/* 4개 핵심 수치 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, border: '1px solid var(--line)', borderRadius: 11, overflow: 'hidden' }}>
          {[
            { label: '실제 방문', value: ceil1(realValue), unit: '명', color: 'var(--ink)' },
            { label: '기댓값', value: ceil1(expectValue), unit: '명', color: 'var(--muted)' },
            { label: '보정 방문자', value: adjustedValue != null ? ceil1(adjustedValue) : '—', unit: adjustedValue != null ? '명' : '', color: m.ink },
            { label: '성과 비율', value: `${ratio}%`, unit: '', color: m.ink },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px 12px', borderRight: i < 3 ? '1px solid var(--line)' : 'none', background: i >= 2 ? m.bg : '#fff' }}>
              <div style={{ fontSize: 10.5, color: 'var(--muted)', marginBottom: 6 }}>{s.label}</div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: s.color }}>
                {s.value}
                {s.unit && <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginLeft: 3 }}>{s.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* 비교 바 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <BarRow label="실제 방문" value={realValue} max={maxVal} color={m.barColor} />
          {adjustedValue != null && <BarRow label="보정값" value={adjustedValue} max={maxVal} color="oklch(0.68 0.10 210)" />}
          <BarRow label="기댓값" value={expectValue} max={maxVal} color="#CBD2DC" />
        </div>

        <div style={{ ...{ height: 64, padding: '10px 14px', borderRadius: 10, fontSize: 13, lineHeight: 1.45, boxSizing: 'border-box', overflow: 'hidden', marginTop: 'auto' }, background: m.bg, color: m.ink }}>
          <span style={{ display: 'block', fontWeight: 700, marginBottom: 3 }}>{m.zone}</span>
          {m.desc}
        </div>
      </div>
    </div>
  )
}
