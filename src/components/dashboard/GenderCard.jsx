import { useEffect, useState } from 'react'
import Donut from '../ui/Donut'
import { Ic } from '../ui/Icons'
import InfoTooltip from '../ui/InfoTooltip'
import { ceil1 } from '../../utils/format'
import { fetchDailyVisits, fetchGenderDistribution } from '../../api/index'

const FEMALE_COLOR = 'oklch(0.7 0.13 0)'
const MALE_COLOR = 'oklch(0.58 0.12 210)'

export default function GenderCard({ startAt, endAt }) {
  const [data, setData] = useState(null)
  const [visitTotal, setVisitTotal] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    let active = true
    const day = startAt.slice(0, 10)

    Promise.allSettled([
      fetchGenderDistribution(startAt, endAt),
      fetchDailyVisits(day),
    ])
      .then(([genderResult, visitsResult]) => {
        if (!active) return
        setData(genderResult.status === 'fulfilled' ? genderResult.value : null)
        setVisitTotal(
          visitsResult.status === 'fulfilled' && visitsResult.value?.totalVisits != null
            ? Number(visitsResult.value.totalVisits)
            : null
        )
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [startAt, endAt])

  const female = Number(data?.female) || 0
  const male = Number(data?.male) || 0
  const total = female + male
  const slices = total > 0
    ? [
        { label: '여성', pct: (female / total) * 100, color: FEMALE_COLOR },
        { label: '남성', pct: (male / total) * 100, color: MALE_COLOR },
      ]
    : []

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-h">
        <h3>성별 추정 분포</h3>
        <div className="right">
          <InfoTooltip
            text={"Vision AI가 영상에서 익명으로 성별을 추정해 분포를 보여줘요.\n\n주요 고객의 성별 비중을 파악해서 상품 구성이나 마케팅 방향을 잡는 데 도움이 돼요."}
          />
        </div>
      </div>
      <div
        className="card-b"
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 10px 10px' }}
      >
        {total > 0 ? (
          <div className="donut-wrap gender-donut-wrap">
            <Donut slices={slices} label="전체" centerValue={visitTotal ?? total} size={140} />
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
        ) : (
          <div style={{ color: 'var(--muted-2)', fontSize: 13 }}>
            성별 분포 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
