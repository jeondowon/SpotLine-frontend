import { useState, useEffect } from 'react'
import { fetchDailyVisits } from '../../api/index'
import TrendChart from './TrendChart'
import InfoTooltip from '../ui/InfoTooltip'

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDaysInRange(startAt, endAt) {
  const startDay = startAt.slice(0, 10)
  const endDay = endAt.slice(0, 10)
  const days = []
  const cursor = new Date(`${startDay}T00:00:00`)
  const end = new Date(`${endDay}T00:00:00`)

  while (cursor <= end) {
    days.push(formatLocalDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

export default function VisitTrendCard({ startAt, endAt, selectedDay }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    let active = true
    const days = getDaysInRange(startAt, endAt)

    Promise.allSettled(days.map(day => fetchDailyVisits(day)))
      .then((results) => {
        const nextData = {
          time: days,
          data: results.map(result => (
            result.status === 'fulfilled' && result.value?.totalVisits != null
              ? Number(result.value.totalVisits)
              : null
          )),
        }
        if (active) setData(nextData)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [startAt, endAt])

  return (
    <div className="card">
      <div className="card-h">
        <h3>방문자 그래프</h3>
        <div className="right">
          <InfoTooltip
            text={"날짜별 방문자 수를 단순 선 그래프로 보여줘요.\n\n각 지점은 해당 날짜에 방문한 총 인원을 의미합니다."}
          />
        </div>
      </div>
      <div className="card-b" style={{ padding: '8px 12px 14px' }}>
        <TrendChart data={data} selectedDay={selectedDay} />
      </div>
    </div>
  )
}
