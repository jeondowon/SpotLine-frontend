import InfoTooltip from '../ui/InfoTooltip';

const DOW_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function todayDow() {
  return (new Date().getDay() + 6) % 7;
}

function parseNextWeek(nextWeek) {
  return (nextWeek?.result ?? []).map((v) =>
    typeof v === "object" ? (v?.expectedVisits ?? 0) : (v ?? 0)
  );
}

function parseTomorrow(tomorrow) {
  return tomorrow?.expectedVisits ?? null;
}

function StatBlock({ label, value, unit, sub, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{label}</div>
      <div
        className="mono"
        style={{
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: accent ? "var(--accent-ink)" : "var(--ink)",
          lineHeight: 1.1,
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--muted)",
              marginLeft: 4,
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: "var(--muted-2)" }}>{sub}</div>
      )}
    </div>
  );
}

export default function PredictionDetail({ tomorrow, nextWeek, compact = false }) {
  const tomorrowVal = parseTomorrow(tomorrow);
  const arr = parseNextWeek(nextWeek);
  const dow = todayDow();
  const tomorrowDow = (dow + 1) % 7;

  const hasData = arr.some((v) => v > 0);
  const maxVal = Math.max(...arr, 1);
  const weekTotal = arr.reduce((s, v) => s + v, 0);
  const peakDow = arr.reduce((best, v, i) => (v > arr[best] ? i : best), 0);
  const troughDow = arr.reduce(
    (low, v, i) => (v > 0 && v < arr[low] ? i : low),
    arr.findIndex((v) => v > 0)
  );

  return (
    <div className="card">
      <div className="card-h">
        <h3>단기 방문 예측 상세</h3>
        <div className="right">
          <InfoTooltip text={'내일과 다음 주 7일의 방문자 수를 예측해요.\n\n최근 방문 트렌드와 날씨 예보, 요일 패턴을 모두 반영해서 계산해요. 인력 배치나 재고 준비에 활용해보세요.'} />
        </div>
      </div>

      <div className="card-b" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* 상단 3개 수치 */}
        {!compact && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
              gap: 0,
              border: "1px solid var(--line)",
              borderRadius: 11,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "14px 18px", background: "var(--accent-soft)" }}>
              <StatBlock
                label="내일 예측"
                value={tomorrowVal ?? "—"}
                unit={tomorrowVal != null ? "명" : ""}
                sub={`다음 ${DOW_LABELS[tomorrowDow]}요일`}
                accent
              />
            </div>
            <div style={{ background: "var(--line)" }} />
            <div style={{ padding: "14px 18px" }}>
              <StatBlock
                label="다음 주 최고"
                value={hasData ? arr[peakDow] : "—"}
                unit={hasData ? "명" : ""}
                sub={hasData ? `${DOW_LABELS[peakDow]}요일` : ""}
              />
            </div>
            <div style={{ background: "var(--line)" }} />
            <div style={{ padding: "14px 18px" }}>
              <StatBlock
                label="주간 합계"
                value={hasData ? weekTotal : "—"}
                unit={hasData ? "명" : ""}
                sub={hasData ? "다음 주 7일" : ""}
              />
            </div>
          </div>
        )}

        {/* 7일 바 차트 */}
        {hasData ? (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 6,
                alignItems: "flex-end",
                height: compact ? 80 : 120,
              }}
            >
              {arr.map((v, i) => {
                const isPeak = i === peakDow;
                const isTrough = i === troughDow && arr.length > 1;
                const isTomorrow = i === tomorrowDow;
                const barH = Math.max((v / maxVal) * 100, 4);

                let barColor = "#E3E6EC";
                if (isTomorrow) barColor = "var(--accent)";
                else if (isPeak) barColor = "oklch(0.66 0.13 155)";
                else if (isTrough) barColor = "oklch(0.70 0.14 25)";

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      height: "100%",
                      gap: 4,
                    }}
                  >
                    <div
                      className="mono"
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: isTomorrow
                          ? "var(--accent-ink)"
                          : isPeak
                          ? "oklch(0.42 0.12 155)"
                          : isTrough
                          ? "oklch(0.45 0.16 25)"
                          : "var(--muted)",
                      }}
                    >
                      {v}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: `${barH}%`,
                        background: barColor,
                        borderRadius: "4px 4px 0 0",
                        transition: "height .5s ease",
                        position: "relative",
                      }}
                    >
                      {isTomorrow && (
                        <div
                          style={{
                            position: "absolute",
                            top: -16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 9,
                            fontWeight: 700,
                            color: "var(--accent-ink)",
                            whiteSpace: "nowrap",
                          }}
                        >
                    
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 요일 레이블 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 6,
                marginTop: 6,
                borderTop: "1px solid var(--line)",
                paddingTop: 6,
              }}
            >
              {DOW_LABELS.map((d, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    fontSize: 11.5,
                    fontWeight: i === tomorrowDow ? 700 : 400,
                    color:
                      i === tomorrowDow
                        ? "var(--accent-ink)"
                        : i === peakDow
                        ? "oklch(0.42 0.12 155)"
                        : i === troughDow
                        ? "oklch(0.45 0.16 25)"
                        : "var(--muted)",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* 범례 */}
            <div
              style={{
                display: "flex",
                gap: 14,
                marginTop: 12,
                fontSize: 11.5,
                color: "var(--muted-2)",
              }}
            >
              {[
                { color: "var(--accent)", label: "내일" },
                { color: "oklch(0.66 0.13 155)", label: "최고 예측일" },
                { color: "oklch(0.70 0.14 25)", label: "최저 예측일" },
              ].map((l) => (
                <div
                  key={l.label}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <div
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 3,
                      background: l.color,
                      flexShrink: 0,
                    }}
                  />
                  {l.label}
                </div>
              ))}
              <div style={{ marginLeft: "auto" }}>단위: 명</div>
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted-2)" }}>
            {nextWeek === undefined ? "불러오는 중..." : "예측 데이터가 없습니다."}
          </p>
        )}

        {/* 신뢰 구간 안내 */}
        {!compact && (
          <div
            style={{
              padding: "10px 13px",
              background: "#F7F9FC",
              borderRadius: 9,
              fontSize: 12,
              color: "var(--muted)",
              lineHeight: 1.6,
            }}
          >
            신뢰 구간(±1.5σ) 표시는 백엔드에서 σ_dow 값을 내려줘야 활성화됩니다.
            현재는 요일·날씨·트렌드 반영 최종 예측값만 표시합니다.
          </div>
        )}
      </div>
    </div>
  );
}
