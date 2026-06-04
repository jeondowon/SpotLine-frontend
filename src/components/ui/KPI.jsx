import Spark from './Spark'
import InfoTooltip from './InfoTooltip'
import { ceil1 } from '../../utils/format'

export default function KPI({ icon, iconBg, iconFg, label, value, unit, delta, spark, sparkColor, tooltip, className = "" }) {
  const up = delta > 0, dn = delta < 0;
  return (
    <div className={"kpi " + className}>
      <div className="kpi-h">
        <div className="ico" style={{ background: iconBg, color: iconFg }}>{icon}</div>
        <div className="lbl">{label}</div>
        {tooltip && <div className="info"><InfoTooltip text={tooltip} /></div>}
      </div>
      <div className="kpi-val mono">
        {value}{unit && <span className="unit">{unit}</span>}
      </div>
      {delta !== undefined && (
        <div className="kpi-foot">
          <span className={"delta " + (up ? "up" : dn ? "dn" : "flat")}>
            {up ? "▲" : dn ? "▼" : "—"} {ceil1(Math.abs(delta))}%
          </span>
          <span>직전 기간 대비</span>
        </div>
      )}
      {spark && <Spark values={spark} color={sparkColor}/>}
    </div>
  );
}
