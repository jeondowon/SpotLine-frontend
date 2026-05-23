import { TABS } from '../../data/analytics'

const TAB_COUNTS = { overview: null, visitors: "8", stay: "5", funnel: "4", weather: "4" }

export default function TabBar({ value, onChange }) {
  return (
    <div className="tabs">
      {TABS.map(t => (
        <button key={t.id} className={"tab" + (value === t.id ? " on" : "")} onClick={() => onChange(t.id)}>
          {t.label}
          {TAB_COUNTS[t.id] && <span className="ct">{TAB_COUNTS[t.id]}</span>}
        </button>
      ))}
    </div>
  )
}
