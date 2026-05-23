import InfoTooltip from '../ui/InfoTooltip';
import { ceil1 } from '../../utils/format'

const INFO_TEXT = '오늘이 같은 요일 평균과 비교해서 얼마나 특이한지 보여줘요.\n\n통계적으로 이상하게 많거나 적을 때 바로 알 수 있어요. ±2σ(표준편차 2배) 기준으로 상위 2.3% 또는 하위 2.3%에 들어오면 이상 신호로 판단해요.';

const DOW_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

const RESULT_META = {
  GOOD: {
    label: "이상 증가",
    zone: "이상 증가 (상위 2.3%)",
    desc: (dow) =>
      `이번 ${dow}요일은 통계적으로 이례적인 호황입니다. 무엇이 효과를 냈는지 기록해 두세요.`,
    bg: "oklch(0.95 0.03 250)",
    ink: "oklch(0.48 0.16 250)",
    dot: "oklch(0.62 0.14 250)",
    barColor: "oklch(0.62 0.14 250)",
  },
  BAD: {
    label: "이상 감소",
    zone: "이상 감소 (하위 2.3%)",
    desc: (dow) =>
      `이번 ${dow}요일은 통계적으로 이상하게 한산합니다. 원인을 점검해보세요. (경쟁 매장? 주변 행사?)`,
    bg: "var(--bad-soft)",
    ink: "oklch(0.45 0.16 25)",
    dot: "var(--bad)",
    barColor: "var(--bad)",
  },
  NORMAL: {
    label: "정상 범위",
    zone: "정상 범위 (±2σ 이내)",
    desc: (dow) => `이번 ${dow}요일은 통계적 정상 범위 내에 있습니다.`,
    bg: "var(--good-soft)",
    ink: "oklch(0.42 0.12 155)",
    dot: "var(--good)",
    barColor: "var(--good)",
  },
};

function meta(result) {
  return RESULT_META[result] ?? RESULT_META.NORMAL;
}

function currentDow() {
  return (new Date().getDay() + 6) % 7;
}

function ZoneBar({ result }) {
  const zones = [
    { key: "BAD",    label: "이상 감소", color: "oklch(0.90 0.06 25)",  flex: 1 },
    { key: "NORMAL", label: "정상 범위", color: "oklch(0.92 0.06 155)", flex: 2 },
    { key: "GOOD",   label: "이상 증가", color: "oklch(0.92 0.05 250)", flex: 1 },
  ];

  return (
    <div>
      <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", gap: 2 }}>
        {zones.map((z) => (
          <div
            key={z.key}
            style={{
              flex: z.flex,
              background: z.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10.5,
              fontWeight: 600,
              color: result === z.key ? "var(--ink)" : "var(--muted-2)",
              position: "relative",
              outline: result === z.key ? "2px solid var(--ink-2)" : "none",
              outlineOffset: -2,
              transition: "outline .2s",
            }}
          >
            {z.label}
            {result === z.key && (
              <div
                style={{
                  position: "absolute",
                  bottom: -6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "5px solid var(--ink-2)",
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: "var(--muted-2)", textAlign: "center" }}>
        ← 하위 2.3% &nbsp;·&nbsp; ±2σ 기준 &nbsp;·&nbsp; 상위 2.3% →
      </div>
    </div>
  );
}

function BarRow({ label, value, max, color }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr 40px",
        gap: 10,
        alignItems: "center",
        fontSize: 12,
      }}
    >
      <div style={{ color: "var(--muted)", textAlign: "right" }}>{label}</div>
      <div style={{ height: 8, background: "#F1F3F6", borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${(value / max) * 100}%`,
            background: color,
            borderRadius: 99,
            transition: "width .5s ease",
          }}
        />
      </div>
      <div className="mono" style={{ fontWeight: 600, textAlign: "right" }}>
        {typeof value === "number" ? ceil1(value) : value}
      </div>
    </div>
  );
}

export default function WeekdayAnomaly({ weekday }) {
  const dow = currentDow();
  const dowLabel = DOW_LABELS[dow];

  if (!weekday) {
    return (
      <div className="card">
        <div className="card-h">
          <h3>오늘의 방문자 수</h3>
          <span className="sub">· {dowLabel}요일 기준 통계</span>
          <div className="right"><InfoTooltip text={INFO_TEXT} /></div>
        </div>
        <div className="card-b">
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted-2)" }}>
            요일 패턴 데이터가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  const { realValue, expectValue, result } = weekday;
  const m = meta(result);
  const diff = realValue - expectValue;
  const diffPct = ceil1((diff / expectValue) * 100);
  const maxVal = Math.max(realValue, expectValue);

  return (
    <div className="card">
      <div className="card-h">
        <h3>오늘의 방문자 수</h3>
        <span className="sub">· {dowLabel}요일 기준 통계 (±2σ 룰)</span>
        <div className="right">
          <span
            style={{
              fontSize: 11,
              padding: "3px 9px",
              borderRadius: 999,
              background: m.bg,
              color: m.ink,
              fontWeight: 600,
            }}
          >
            {m.label}
          </span>
          <InfoTooltip text={INFO_TEXT} />
        </div>
      </div>

      <div className="card-b" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* 3개 핵심 수치 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1,
            border: "1px solid var(--line)",
            borderRadius: 11,
            overflow: "hidden",
          }}
        >
          {[
            { label: `오늘(${dowLabel}) 방문`, value: typeof realValue === "number" ? ceil1(realValue) : realValue, unit: "명", color: "var(--ink)" },
            { label: `${dowLabel}요일 평균`, value: typeof expectValue === "number" ? ceil1(expectValue) : expectValue, unit: "명", color: "var(--muted)" },
            {
              label: "평균 대비 편차",
              value: `${diff > 0 ? "+" : ""}${diffPct}%`,
              unit: "",
              color: m.ink,
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                padding: "14px 16px",
                borderRight: i < 2 ? "1px solid var(--line)" : "none",
                background: i === 2 ? m.bg : "#fff",
              }}
            >
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 6 }}>
                {s.label}
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: s.color,
                }}
              >
                {s.value}
                {s.unit && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--muted)",
                      marginLeft: 4,
                    }}
                  >
                    {s.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 비교 바 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <BarRow label={`오늘(${dowLabel})`} value={realValue} max={maxVal} color={m.barColor} />
          <BarRow label="요일 평균" value={expectValue} max={maxVal} color="#CBD2DC" />
        </div>

        {/* 정상범위 구간 시각화 */}
        <ZoneBar result={result} />

        {/* 해석 텍스트 */}
        <div
          style={{
            padding: "12px 14px",
            background: m.bg,
            borderRadius: 10,
            fontSize: 13,
            color: m.ink,
            lineHeight: 1.65,
          }}
        >
          <span style={{ fontWeight: 700 }}>{m.zone}</span>
          <br />
          {m.desc(dowLabel)}
        </div>
      </div>
    </div>
  );
}
