import { Ic } from './Icons'
import Spark from './Spark'

export default function KPI({ icon, iconBg, iconFg, label, value, unit, delta, spark, sparkColor, hint, className = "" }) {
  const up = delta > 0, dn = delta < 0;
  return (
    <div className={"kpi " + className}>
      <div className="kpi-h">
        <div className="ico" style={{ background: iconBg, color: iconFg }}>{icon}</div>
        <div className="lbl">{label}</div>

      </div>
      <div className="kpi-val mono">
        {value}{unit && <span className="unit">{unit}</span>}
      </div>
      <div className="kpi-foot">
        {delta !== undefined ? (
          <>
            <span className={"delta " + (up ? "up" : dn ? "dn" : "flat")}>
              {up ? "▲" : dn ? "▼" : "—"} {Math.abs(delta).toFixed(1)}%
            </span>
            <span>{hint || "직전 기간 대비"}</span>
          </>
        ) : (
          <span style={{color: "var(--muted)"}}>{hint}</span>
        )}
      </div>
      {spark && <Spark values={spark} color={sparkColor}/>}
    </div>
  );
}
