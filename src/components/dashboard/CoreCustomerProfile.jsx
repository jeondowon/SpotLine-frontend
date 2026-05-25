import { Ic } from "../ui/Icons";
import InfoTooltip from "../ui/InfoTooltip";

function genderKr(g) {
  if (!g) return null;
  const s = g.toLowerCase();
  if (s === "woman" || s === "female") return "여성";
  if (s === "man" || s === "male") return "남성";
  return "미상";
}

function ageKr(a) {
  if (!a) return null;
  if (a === "UNKNOWN" || a === "unknown") return "미상";
  return a.replace("age", "").replace("s", "대");
}

const GENDER_STYLE = {
  여성: { bg: "oklch(0.95 0.04 10)", fg: "oklch(0.50 0.16 10)" },
  남성: { bg: "oklch(0.94 0.04 250)", fg: "oklch(0.45 0.16 250)" },
};

export default function CoreCustomerProfile({ core }) {
  const gender = genderKr(core?.gender);
  const age = ageKr(core?.age);

  const hasData = gender || age;

  return (
    <div className="card">
      <div className="card-h">
        <h3>핵심 고객 프로파일</h3>
        <div className="right">
          <InfoTooltip text={'오늘 매장을 가장 많이 방문한 핵심 고객 그룹이에요.\n\nVision AI가 성별과 연령대를 익명으로 추정해서 대표 그룹을 계산해요. 어떤 손님이 주로 오는지 파악해서 운영이나 마케팅에 참고할 수 있어요.'} />
        </div>
      </div>

      <div className="card-b">
        {!hasData ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted-2)" }}>
            분석된 고객 데이터가 없습니다.
          </p>
        ) : (
          <>
            {/* 대표 그룹 뱃지 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: gender ? GENDER_STYLE[gender]?.bg : "var(--accent-soft)",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
                <Ic.Users color={gender ? GENDER_STYLE[gender]?.fg : "var(--accent-ink)"} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.2 }}>
                  {[...new Set([age, gender].filter(Boolean))].join(" ") || "—"}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                  오늘 가장 많이 방문한 고객층
                </div>
              </div>
            </div>

            {/* 세부 항목 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ProfileRow label="성별" value={gender} color={gender ? GENDER_STYLE[gender]?.fg : undefined} />
              <ProfileRow label="연령대" value={age ? `${age}` : null} />
            </div>

            <div className="priv" style={{ marginTop: 16, fontSize: 11.5 }}>
              <Ic.Shield color="#9AA3AF" />
              Vision AI 익명 추정 통계입니다.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "var(--surface, #F8FAFB)", borderRadius: 8 }}>
      <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: color ?? "var(--ink-2)" }}>
        {value ?? "—"}
      </span>
    </div>
  );
}
