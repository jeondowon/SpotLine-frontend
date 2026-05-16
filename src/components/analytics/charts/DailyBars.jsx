import { DAYS_30 } from '../../../data/analytics'

export default function DailyBars({ days = 30 }) {
  const data = DAYS_30.slice(-days)
  const max = Math.max(...data)
  return (
    <div className="day-bars">
      {data.map((v, i) => {
        const isToday = i === data.length - 1
        const dayOfWeek = (i + 1) % 7
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
        const showLbl = i % Math.ceil(days / 8) === 0 || isToday
        return (
          <div className="day-bar" key={i} title={`${v}명`}>
            {isToday && <div className="v">{v}</div>}
            <div className={"bb" + (isToday ? " today" : isWeekend ? " weekend" : "")}
                 style={{height: (v / max) * 150 + "px"}}/>
            <div className="lbl">{showLbl ? `${30 - i}일전` : ""}</div>
          </div>
        )
      })}
    </div>
  )
}
