import { TABS } from '../../data/analytics'
import DatePicker from '../ui/DatePicker'

const TAB_COUNTS = { overview: null, visitors: "8", stay: "5", funnel: "4", weather: "4" }

export default function TabBar({ value, onChange, day, setDay }) {
  return (
    <div className="tabs" style={{ gap: 0 }}>
      {TABS.map(t => (
        <button key={t.id} className={"tab" + (value === t.id ? " on" : "")} onClick={() => onChange(t.id)}>
          {t.label}
          {TAB_COUNTS[t.id] && <span className="ct">{TAB_COUNTS[t.id]}</span>}
        </button>
      ))}
      {day && setDay && <DatePicker day={day} setDay={setDay}/>}
    </div>
  )
}

