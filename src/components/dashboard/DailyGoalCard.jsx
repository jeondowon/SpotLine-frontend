import { useState, useEffect } from 'react'
import { fetchDailySales, fetchDailyVisits } from '../../api/index'
import { Ic } from '../ui/Icons'

const KEY_SALES = 'spotline_goal_sales'
const KEY_VISITS = 'spotline_goal_visits'

export default function DailyGoalCard({ startAt, endAt, day }) {
  const [sales, setSales] = useState(null)
  const [visits, setVisits] = useState(null)

  const goalSales = Number(localStorage.getItem(KEY_SALES)) || null
  const goalVisits = Number(localStorage.getItem(KEY_VISITS)) || null

  useEffect(() => {
    if (!startAt || !endAt) return
    if (goalSales) fetchDailySales(startAt, endAt).then(setSales).catch(() => {})
    if (goalVisits) fetchDailyVisits(day).then(setVisits).catch(() => {})
  }, [startAt, endAt, day, goalSales, goalVisits])

  const salesPct = goalSales && sales?.dailySales != null
    ? Math.round((sales.dailySales / goalSales) * 100)
    : null
  const visitsPct = goalVisits && visits?.totalVisits != null
    ? Math.round((visits.totalVisits / goalVisits) * 100)
    : null

  const noGoal = !goalSales && !goalVisits

  return (
    <div className="kpi">
      <div className="kpi-h">
        <div className="ico" style={{ background: 'oklch(0.955 0.025 145)', color: 'oklch(0.48 0.12 145)' }}>
          <Ic.TrendUp />
        </div>
        <div className="lbl">오늘 목표 달성률</div>
      </div>
      {noGoal ? (
        <>
          <div className="kpi-val mono">—</div>
          <div className="kpi-foot">
            <span style={{ color: 'var(--muted)' }}>설정에서 목표를 입력하세요</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 20, marginTop: 6, alignItems: 'flex-end' }}>
            {goalSales && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>매출</div>
                <div className="mono" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1 }}>
                  {salesPct ?? '—'}
                  {salesPct != null && <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--muted)', marginLeft: 3 }}>%</span>}
                </div>
              </div>
            )}
            {goalVisits && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>방문자</div>
                <div className="mono" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1 }}>
                  {visitsPct ?? '—'}
                  {visitsPct != null && <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--muted)', marginLeft: 3 }}>%</span>}
                </div>
              </div>
            )}
          </div>
          <div className="kpi-foot">
            <span style={{ color: 'var(--muted)' }}>오늘 목표 기준</span>
          </div>
        </>
      )}
    </div>
  )
}
