import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Ic } from "../components/ui/Icons";
import { uploadVideo, fetchVideoStatus, fetchRawAnalytics } from "../api/index";
import { ceil1 } from "../utils/format";

function congestionMeta(c) {
  if (c === "low") return { text: "낮음", color: "oklch(0.42 0.12 155)", bg: "var(--good-soft)" };
  if (c === "high") return { text: "높음", color: "oklch(0.45 0.16 25)", bg: "var(--bad-soft)" };
  return { text: "보통", color: "oklch(0.55 0.14 65)", bg: "var(--warn-soft)" };
}

function formatDwell(sec) {
  if (!sec) return "—";
  if (sec < 60) return `${Math.round(sec)}초`;
  return `${Math.floor(sec / 60)}분 ${Math.round(sec % 60)}초`;
}

export default function IntroPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("idle"); // idle | uploading | analyzing | done | error
  const [drag, setDrag] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const process = useCallback(async (file) => {
    setPhase("uploading");
    try {
      const { id } = await uploadVideo(file);

      setPhase("analyzing");
      await new Promise((resolve, reject) => {
        const timer = setInterval(async () => {
          try {
            const { status } = await fetchVideoStatus(id);
            if (status === "COMPLETE") { clearInterval(timer); resolve(); }
            else if (status === "ERROR") { clearInterval(timer); reject(new Error("processing failed")); }
          } catch (e) { clearInterval(timer); reject(e); }
        }, 2000);
      });

      localStorage.setItem("last_video_id", id);
      const data = await fetchRawAnalytics(id);
      setResult(data);
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }, []);

  const onFile = (file) => {
    if (!file || !file.type.startsWith("video/")) return;
    process(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    onFile(e.dataTransfer.files[0]);
  };

  const persons = result?.persons ?? [];
  const female = persons.filter((p) => p.gender === "female").length;
  const male = persons.filter((p) => p.gender === "male").length;
  const genderTotal = female + male;
  const femalePct = genderTotal > 0 ? Number(((female / genderTotal) * 100).toFixed(1)) : 50.0;
  const malePct = Number((100 - femalePct).toFixed(1));
  const congestion = result ? congestionMeta(result.summary?.peakCongestion) : null;

  return (
    <div
      style={{
        height: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        padding: "32px 36px 28px",
        boxSizing: "border-box",
      }}
    >
      {/* 상단 안내 문구 */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
          Vision AI 데모
        </h1>
        <p style={{ fontSize: 14, color: "var(--black)", lineHeight: 1.7, margin: 0 }}>
          SpotLine은 매장 방문자 영상을 AI로 분석해 경영 인사이트를 제공하는 서비스입니다.
        </p>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: "8px 0 0" }}>
          실제 서비스에서는 매장 CCTV 영상을 실시간으로 수집하지만, 이 데모에서는 영상을 직접
          업로드하는 방식으로 동일한 Vision AI 분석 파이프라인을 체험하실 수 있습니다.
        </p>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: "0px 0 0" }}>
          결과는 대시보드에 누적되며, 데이터가 쌓일수록 더 정확한 통계와 예측, 맞춤형 AI 마케팅
          조언을 제공합니다.
        </p>
      </div>

      {/* 2열 그리드 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, flex: 1, minHeight: 0 }}>

        {/* ── 좌: 업로드 ── */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="card-h">
            <h3>영상 업로드</h3>
            <span className="sub">· MP4</span>
          </div>
          <div className="card-b" style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>

            {phase === "idle" && (
              <div
                onClick={() => inputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                style={{
                  border: `2px dashed ${drag ? "var(--accent)" : "var(--line-2)"}`,
                  borderRadius: 12,
                  background: drag ? "var(--accent-soft)" : "#FAFBFC",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 16, cursor: "pointer",
                  transition: "all .15s", flex: 1,
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                  stroke={drag ? "var(--accent)" : "var(--muted-2)"}
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-2)" }}>
                    드래그하거나 클릭하여 업로드
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
                    Vision AI가 방문자 데이터를 추출합니다
                  </div>
                </div>
                <input ref={inputRef} type="file" accept="video/*" style={{ display: "none" }}
                  onChange={(e) => onFile(e.target.files[0])}/>
              </div>
            )}

            {(phase === "uploading" || phase === "analyzing") && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, flex: 1 }}>
                <div style={{ position: "relative", width: 64, height: 64 }}>
                  <svg style={{ animation: "intro-spin 1.2s linear infinite" }} width="64" height="64" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="var(--line-2)" strokeWidth="4"/>
                    <circle cx="28" cy="28" r="24" fill="none" stroke="var(--accent)" strokeWidth="4"
                      strokeLinecap="round" strokeDasharray="60 96"/>
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    <Ic.Activity color="var(--accent)"/>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {phase === "uploading" ? "영상 업로드 중..." : "Vision AI 분석 중..."}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
                    {phase === "uploading" ? "서버로 전송하고 있습니다" : "방문자 데이터를 추출하고 있습니다"}
                  </div>
                </div>
              </div>
            )}

            {phase === "done" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, flex: 1 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--good-soft)", display: "grid", placeItems: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="oklch(0.42 0.12 155)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "oklch(0.42 0.12 155)" }}>분석 완료</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>오른쪽에서 결과를 확인하세요</div>
                </div>
                <button className="intro-btn" onClick={() => { setPhase("idle"); setResult(null); }}>
                  새 영상 업로드
                </button>
              </div>
            )}

            {phase === "error" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, flex: 1 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bad-soft)", display: "grid", placeItems: "center" }}>
                  <span style={{ color: "oklch(0.45 0.16 25)", fontSize: 24, fontWeight: 700, lineHeight: 1 }}>!</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "oklch(0.45 0.16 25)" }}>오류가 발생했습니다</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>다른 영상으로 다시 시도해주세요</div>
                </div>
                <button className="intro-btn" onClick={() => setPhase("idle")}>다시 시도</button>
              </div>
            )}
          </div>
        </div>

        {/* ── 우: 분석 결과 ── */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="card-h">
            <span className="ai-h-badge"><Ic.Sparkle/> Vision AI 분석 결과</span>
          </div>
          <div className="card-b" style={{ padding: 24, flex: 1, overflow: "auto" }}>

            {(phase === "idle" || phase === "error") && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, height: "100%" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                  stroke="var(--line-2)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path d="M8 21h8M12 17v4"/>
                  <path d="M9 9l3 3 3-3"/>
                </svg>
                <div style={{ fontSize: 13, color: "var(--muted-2)", textAlign: "center", lineHeight: 1.6 }}>
                  영상을 업로드하면<br/>분석 결과가 여기에 표시됩니다
                </div>
              </div>
            )}

            {(phase === "uploading" || phase === "analyzing") && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, height: "100%" }}>
                <div style={{ display: "flex", gap: 7 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: 9, height: 9, borderRadius: "50%", background: "var(--accent)",
                      animation: `intro-bounce .7s ease-in-out ${i * 0.14}s infinite alternate`,
                    }}/>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>분석 결과를 기다리는 중...</div>
              </div>
            )}

            {phase === "done" && result && (
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

                {/* KPI 3개 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div style={{ background: "var(--accent-soft)", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, color: "var(--accent-ink)", fontWeight: 500 }}>총 방문자</div>
                    <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 5, color: "var(--accent-ink)", display: "flex", alignItems: "baseline", gap: 3 }}>
                      {result.summary?.totalVisitors ?? 0}
                      <span style={{ fontSize: 13, fontWeight: 500 }}>명</span>
                    </div>
                  </div>
                  <div style={{ background: congestion.bg, borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, color: congestion.color, fontWeight: 500 }}>최대 혼잡도</div>
                    <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 5, color: congestion.color }}>
                      {congestion.text}
                    </div>
                  </div>
                  <div style={{ background: "#F7F9FC", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>평균 체류</div>
                    <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em", marginTop: 5 }}>
                      {formatDwell(result.summary?.avgDwellTimeSeconds)}
                    </div>
                  </div>
                </div>

                {/* 성별 분포 */}
                {genderTotal > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--ink-2)" }}>성별 분포</div>
                    {[
                      { label: "여성", pct: femalePct, color: "oklch(0.68 0.14 350)" },
                      { label: "남성", pct: malePct, color: "var(--accent)" },
                    ].map((g) => (
                      <div key={g.label} style={{ display: "grid", gridTemplateColumns: "32px 1fr 40px", gap: 10, alignItems: "center", fontSize: 13, marginBottom: 10 }}>
                        <div style={{ color: "var(--muted)" }}>{g.label}</div>
                        <div style={{ height: 8, background: "#F1F3F6", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${g.pct}%`, background: g.color, borderRadius: 99, transition: "width .6s ease" }}/>
                        </div>
                        <div className="mono" style={{ fontWeight: 600, textAlign: "right" }}>{ceil1(g.pct)}%</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="priv">
                  <Ic.Shield color="#9AA3AF"/>
                  Vision AI 익명 추정 통계입니다. 개인 식별 정보는 저장되지 않습니다.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 건너뛰기 */}
      <div style={{ display: "flex", justifyContent: "flex-end", flexShrink: 0, marginTop: 14 }}>
        <button className="intro-skip" onClick={() => navigate("/dashboard")}>
          대시보드로 이동
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
