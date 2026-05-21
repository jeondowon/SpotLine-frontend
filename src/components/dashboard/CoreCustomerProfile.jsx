import { Ic } from "../ui/Icons";

const RANK = ["①", "②", "③"];

const RANK_COLORS = [
  "oklch(0.78 0.14 85)",   // 금
  "oklch(0.68 0.05 250)",  // 은
  "oklch(0.70 0.10 55)",   // 동
];

function genderKr(g) {
  return g === "female" ? "여성" : "남성";
}

function ageKr(a) {
  return a?.replace("s", "대") ?? "—";
}

function compute(persons) {
  if (!persons || persons.length === 0) return { ranked: [], summary: null };

  const counts = {};
  persons.forEach((p) => {
    const key = `${p.gender}|${p.age_group}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  const total = persons.length;
  const ranked = Object.entries(counts)
    .map(([key, count]) => {
      const [gender, ageGroup] = key.split("|");
      return { gender, ageGroup, count, pct: (count / total) * 100 };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // 상위 3개 중 지배적 성별 집계
  const topPct = ranked.reduce((s, r) => s + r.pct, 0);
  const genderTally = {};
  ranked.forEach((r) => {
    genderTally[r.gender] = (genderTally[r.gender] || 0) + 1;
  });
  const [dominantGender, dominantCount] = Object.entries(genderTally).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return {
    ranked,
    maxPct: ranked[0]?.pct ?? 1,
    summary: { gender: dominantGender, count: dominantCount, pct: topPct },
  };
}

export default function CoreCustomerProfile({ persons }) {
  const { ranked, maxPct, summary } = compute(persons);

  return (
    <div className="card">
      <div className="card-h">
        <h3>핵심 고객 프로파일</h3>
        <span className="sub">· 성별 × 연령대 조합</span>
        <div className="right">
          <span className="chip">TOP 3</span>
        </div>
      </div>

      <div className="card-b">
        {ranked.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted-2)" }}>
            분석된 영상 데이터가 없습니다.
          </p>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {ranked.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* 순위 */}
                  <div
                    style={{
                      width: 22,
                      fontSize: 16,
                      fontWeight: 700,
                      color: RANK_COLORS[i],
                      flexShrink: 0,
                      textAlign: "center",
                    }}
                  >
                    {RANK[i]}
                  </div>

                  {/* 레이블 */}
                  <div
                    style={{
                      width: 72,
                      fontSize: 13.5,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {ageKr(r.ageGroup)} {genderKr(r.gender)}
                  </div>

                  {/* 바 */}
                  <div
                    style={{
                      flex: 1,
                      height: 7,
                      background: "#F1F3F6",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(r.pct / maxPct) * 100}%`,
                        background: RANK_COLORS[i],
                        borderRadius: 99,
                        transition: "width .6s ease",
                      }}
                    />
                  </div>

                  {/* 퍼센트 */}
                  <div
                    className="mono"
                    style={{ width: 40, textAlign: "right", fontSize: 13, fontWeight: 600 }}
                  >
                    {r.pct.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>

            {/* 요약 */}
            {summary && (
              <div
                style={{
                  marginTop: 18,
                  padding: "10px 12px",
                  background: "var(--accent-soft)",
                  borderRadius: 9,
                  fontSize: 12.5,
                  color: "var(--accent-ink)",
                  lineHeight: 1.6,
                }}
              >
                → {genderKr(summary.gender)} {summary.count}개 구간이 방문의{" "}
                <strong>{summary.pct.toFixed(1)}%</strong> 차지
              </div>
            )}

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
