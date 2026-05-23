const RESULT_META = {
  GOOD: {
    text: "날씨 감안하면 선방",
    bg: "var(--good-soft)",
    ink: "oklch(0.42 0.12 155)",
    barColor: "var(--good)",
  },
  BAD: {
    text: "날씨 좋았는데 부진",
    bg: "var(--bad-soft)",
    ink: "oklch(0.45 0.16 25)",
    barColor: "var(--bad)",
  },
  NORMAL: {
    text: "날씨 대비 보통",
    bg: "var(--warn-soft)",
    ink: "oklch(0.55 0.14 65)",
    barColor: "var(--warn)",
  },
};

function meta(result) {
  return RESULT_META[result] ?? RESULT_META.NORMAL;
}

function BarRow({ label, value, max, color }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr 40px",
        gap: 10,
        alignItems: "center",
        fontSize: 12,
      }}
    >
      <div style={{ color: "var(--muted)", textAlign: "right" }}>{label}</div>
      <div
        style={{
          height: 8,
          background: "#F1F3F6",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
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
        {value}
      </div>
    </div>
  );
}

export default function WeatherPerformance({ weather }) {
  if (!weather) {
    return (
      <div className="card">
        <div className="card-h">
          <h3>날씨 보정 성과 상세</h3>
          <span className="sub">· 날씨·요일 효과 제거 후 실제 성과</span>
        </div>
        <div className="card-b">
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted-2)" }}>
            날씨 보정 데이터가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  const { realValue, expectValue, result } = weather;
  const m = meta(result);
  const ratio = ((realValue / expectValue) * 100).toFixed(1);
  const maxVal = Math.max(realValue, expectValue);

  return (
    <div className="card">
      <div className="card-h">
        <h3>날씨 보정 성과 상세</h3>
        <span className="sub">· 날씨·요일 효과 제거 후 실제 성과</span>
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
            {m.text}
          </span>
        </div>
      </div>

      <div className="card-b">
        {/* 3개 핵심 수치 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1,
            border: "1px solid var(--line)",
            borderRadius: 11,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          {[
            { label: "어제 실제 방문", value: realValue, unit: "명", color: "var(--ink)" },
            { label: "날씨·요일 기댓값", value: expectValue, unit: "명", color: "var(--muted)" },
            { label: "보정 성과", value: `${ratio}%`, unit: "", color: m.ink },
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
                style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: s.color }}
              >
                {s.value}
                {s.unit && (
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)", marginLeft: 4 }}>
                    {s.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 비교 바 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <BarRow label="실제 방문" value={realValue} max={maxVal} color={m.barColor} />
          <BarRow label="기댓값" value={expectValue} max={maxVal} color="#CBD2DC" />
        </div>

        <div
          style={{ marginTop: 14, fontSize: 12, color: "var(--muted-2)", textAlign: "right" }}
        >
          실제 / 기대 ={" "}
          <span className="mono" style={{ fontWeight: 600, color: m.ink }}>
            {ratio}%
          </span>
        </div>
      </div>
    </div>
  );
}
