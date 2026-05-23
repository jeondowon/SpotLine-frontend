import { Ic } from "../ui/Icons";

function genderLabel(g) {
  if (g === "MAN" || g === "MALE") return "남성";
  if (g === "WOMAN" || g === "FEMALE") return "여성";
  return "미상";
}

function ageLabel(a) {
  if (!a || a === "UNKNOWN" || a === "unknown") return "연령미상";
  return a.replace("s", "대");
}

export default function CoreCustomerProfile({ core }) {
  const age = ageLabel(core?.age);
  const gender = genderLabel(core?.gender);
  const hasData = core && core.age !== "UNKNOWN" && core.gender !== "UNKNOWN";

  return (
    <div className="card">
      <div className="card-h">
        <h3>핵심 고객 프로파일</h3>
        <span className="sub">· core-customers API 결과</span>
        <div className="right">
          <span className="chip" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>대표 그룹</span>
        </div>
      </div>

      <div className="card-b" style={{ padding: "20px 16px" }}>
        {!core ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted-2)" }}>
            데이터를 불러오는 중입니다...
          </p>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* 세련된 성별/연령 표시 아이콘 배지 */}
            <div style={{
              width: 54, height: 54, borderRadius: 16,
              background: hasData ? "oklch(0.95 0.04 155)" : "oklch(0.95 0.03 250)",
              display: "grid", placeItems: "center",
              color: hasData ? "oklch(0.42 0.12 155)" : "oklch(0.48 0.16 250)",
              flexShrink: 0
            }}>
              <Ic.Users style={{ width: 24, height: 24 }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 20, fontWeight: 800, color: "var(--ink)",
                letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 6
              }}>
                {age} {gender}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>
                {hasData ? "오늘 우리 매장을 가장 많이 방문한 핵심 연령/성별 그룹입니다." : "대표 고객 정보 수집 중이거나 정보가 미상입니다."}
              </div>
            </div>
          </div>
        )}

        <div className="priv" style={{ marginTop: 20, fontSize: 11.5 }}>
          <Ic.Shield color="#9AA3AF" />
          Vision AI 익명 추정 통계입니다.
        </div>
      </div>
    </div>
  );
}
