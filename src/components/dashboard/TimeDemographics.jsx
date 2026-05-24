import { Ic } from "../ui/Icons";
import InfoTooltip from "../ui/InfoTooltip";
import { ceil1 } from "../../utils/format"

const SLOTS = [
  { label: "오전", range: "09~12시", start: 9, end: 12 },
  { label: "점심", range: "12~15시", start: 12, end: 15 },
  { label: "오후", range: "15~18시", start: 15, end: 18 },
  { label: "저녁", range: "18~21시", start: 18, end: 21 },
];

const SLOT_COLORS = [
  "oklch(0.72 0.14 75)",
  "oklch(0.66 0.15 50)",
  "oklch(0.62 0.14 250)",
  "oklch(0.58 0.15 285)",
];

function ageLabel(a) {
  if (!a || a === "unknown" || a === "UNKNOWN") return "—";
  return a.replace("s", "대");
}
function genderLabel(g) {
  if (g === "female") return "여성";
  if (g === "male") return "남성";
  return "미상";
}

function compute(persons) {
  if (!persons?.length) return null;

  const slotCounts = SLOTS.map(() => ({}));
  const slotTotals = SLOTS.map(() => 0);

  persons.forEach((p) => {
    const ts = p.firstSeen || p.entranceEvent?.timestamp;
    if (!ts) return;
    // ts는 "HH:MM:SS.mmm" 형식의 영상 오프셋 — 절대 시각이 아니므로 시간대 분류 불가
    const parts = ts.split(":");
    if (parts.length < 2) return;
    const hour = parseInt(parts[0], 10);
    const idx = SLOTS.findIndex((s) => hour >= s.start && hour < s.end);
    if (idx === -1) return;
    const key = `${p.ageGroup}|${p.gender}`;
    slotCounts[idx][key] = (slotCounts[idx][key] || 0) + 1;
    slotTotals[idx]++;
  });

  return SLOTS.map((slot, i) => {
    const total = slotTotals[i];
    if (total === 0) return { ...slot, groups: [], total: 0 };
    const groups = Object.entries(slotCounts[i])
      .map(([key, cnt]) => {
        const [ageGroup, gender] = key.split("|");
        return {
          label: `${ageLabel(ageGroup)} ${genderLabel(gender)}`,
          pct: Number(((cnt / total) * 100).toFixed(1)),
        };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3);
    return { ...slot, groups, total };
  });
}

export default function TimeDemographics({ persons }) {
  const slots = compute(persons);

  return (
    <div className="card">
      <div className="card-h">
        <h3>시간대별 인구통계 변화</h3>
        <div className="right"><InfoTooltip text={'오전·점심·오후·저녁 시간대에 방문 고객의 연령·성별 구성이 어떻게 달라지는지 보여줘요.\n\n시간대마다 다른 고객층이 오는 패턴을 파악해서, 시간대별 맞춤 운영이나 프로모션을 기획하는 데 도움이 돼요.'} /></div>
      </div>
      <div className="card-b">
        {!slots ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted-2)" }}>
            분석된 영상 데이터가 없습니다.
          </p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
              {slots.map((slot, i) => (
                <div
                  key={slot.label}
                  style={{
                    padding: "12px 13px",
                    border: "1px solid var(--line)",
                    borderRadius: 11,
                    background: "#FAFBFD",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: SLOT_COLORS[i],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                      {slot.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginLeft: 2,
                      }}
                    >
                      {slot.range}
                    </span>
                  </div>

                  {slot.total === 0 ? (
                    <div style={{ fontSize: 11.5, color: "var(--muted-2)" }}>
                      데이터 없음
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {slot.groups.map((g, j) => (
                        <div key={j}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: j === 0 ? "var(--ink)" : "var(--muted)",
                                fontWeight: j === 0 ? 600 : 400,
                              }}
                            >
                              {g.label}
                            </span>
                            <span
                              className="mono"
                              style={{ fontSize: 11.5, fontWeight: 600 }}
                            >
                              {ceil1(g.pct)}%
                            </span>
                          </div>
                          <div
                            style={{
                              height: 5,
                              background: "#ECEEF2",
                              borderRadius: 99,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${g.pct}%`,
                                background: SLOT_COLORS[i],
                                borderRadius: 99,
                                opacity: j === 0 ? 1 : 0.45,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {slot.total > 0 && (
                    <div
                      style={{ marginTop: 10, fontSize: 11, color: "var(--muted-2)" }}
                    >
                      총 {slot.total}명
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="priv" style={{ marginTop: 14, fontSize: 11.5 }}>
              <Ic.Shield color="#9AA3AF" />
              Vision AI 익명 추정 통계입니다.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
