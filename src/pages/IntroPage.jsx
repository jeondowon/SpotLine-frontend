import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Ic } from "../components/ui/Icons";
import { uploadVideo, fetchVideoStatus } from "../api/index";


export default function IntroPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("idle"); // idle | uploading | analyzing | done | error
  const [drag, setDrag] = useState(false);
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
                <button className="intro-btn" onClick={() => setPhase("idle")}>
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

            {phase === "done" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, height: "100%" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--good-soft)", display: "grid", placeItems: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="oklch(0.42 0.12 155)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "oklch(0.42 0.12 155)" }}>분석 완료</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, lineHeight: 1.6 }}>
                    데이터가 대시보드에 반영됐습니다.<br/>대시보드에서 인사이트를 확인하세요.
                  </div>
                </div>
                <div className="priv" style={{ marginTop: 4 }}>
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
