import { useState, useEffect } from 'react'
import { fetchAvgDwell, fetchJustLeftCount, fetchBestMenu, fetchResponseWaitTime, fetchEmptyTableTime } from '../../api/index'
import { Ic } from '../ui/Icons'

export default function DwellAndLostCard({ startAt, endAt }) {
  const [bestMenu, setBestMenu] = useState(null)
  const [dwell, setDwell] = useState(null)
  const [waitTime, setWaitTime] = useState(null)
  const [emptyTable, setEmptyTable] = useState(null)
  const [lost, setLost] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setBestMenu(null)
    setDwell(null)
    setWaitTime(null)
    setEmptyTable(null)
    setLost(null)
    fetchBestMenu(startAt, endAt).then(setBestMenu).catch(() => {})
    fetchAvgDwell(startAt, endAt).then(setDwell).catch(() => {})
    fetchResponseWaitTime(startAt, endAt).then(setWaitTime).catch(() => {})
    fetchEmptyTableTime(startAt, endAt).then(setEmptyTable).catch(() => {})
    fetchJustLeftCount(startAt, endAt).then(setLost).catch(() => {})
  }, [startAt, endAt])

  const items = [
    {
      label: '베스트 메뉴',
      display: bestMenu?.menu ?? '—',
      value: bestMenu?.menu ?? null,
      unit: '',
      hint: '오늘 판매 1위',
      icon: <Ic.Sparkle />,
      iconBg: 'oklch(0.955 0.03 65)',
      iconFg: 'oklch(0.55 0.14 65)',
      isText: true,
    },
    {
      label: '평균 체류',
      display: dwell?.time != null ? `${dwell.time}` : '—',
      value: dwell?.time ?? null,
      unit: '분',
      hint: 'AI 분석 기준',
      icon: <Ic.Clock />,
      iconBg: 'oklch(0.95 0.04 155)',
      iconFg: 'oklch(0.42 0.12 155)',
    },
    {
      label: '최대 응대 대기',
      display: waitTime?.time != null ? `${waitTime.time}` : '—',
      value: waitTime?.time ?? null,
      unit: '분',
      hint: '착석 후 최대 대기',
      icon: <Ic.Bell />,
      iconBg: 'oklch(0.955 0.05 80)',
      iconFg: 'oklch(0.55 0.14 65)',
    },
    {
      label: '테이블 유휴',
      display: emptyTable?.time != null ? `${emptyTable.time}` : '—',
      value: emptyTable?.time ?? null,
      unit: '분',
      hint: '최대 비어있던 시간',
      icon: <Ic.Dash />,
      iconBg: 'oklch(0.955 0.02 250)',
      iconFg: 'oklch(0.48 0.10 250)',
    },
    {
      label: '그냥 나간 손님',
      display: lost?.count != null ? `${lost.count}` : '—',
      value: lost?.count ?? null,
      unit: '명',
      hint: '입장 후 미주문 이탈',
      icon: <Ic.Door />,
      iconBg: 'oklch(0.955 0.04 25)',
      iconFg: 'oklch(0.55 0.16 25)',
    },
  ]

  return (
    <div className="card">
      <div className="card-h">
        <h3>운영 현황</h3>
        <span className="sub">· 방문 행동 · 운영 지표</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '16px 20px',
              borderRight: i < items.length - 1 ? '1px solid var(--line)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: item.iconBg,
                  color: item.iconFg,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.3 }}>
                {item.label}
              </span>
            </div>
            <div
              className={item.isText ? '' : 'mono'}
              style={{
                fontSize: item.isText ? 17 : 26,
                fontWeight: item.isText ? 700 : 800,
                color: 'var(--ink)',
                letterSpacing: item.isText ? '-0.01em' : '-0.03em',
                lineHeight: 1,
                marginBottom: 6,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.display}
              {!item.isText && item.value != null && (
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginLeft: 4 }}>
                  {item.unit}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-2)' }}>{item.hint}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
