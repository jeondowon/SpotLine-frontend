import { useState, useEffect } from "react";
import "../styles/analytics.css";
import Sidebar from "../components/layout/Sidebar";
import KPI from "../components/ui/KPI";
import { Ic } from "../components/ui/Icons";
import {
  TweaksPanel,
  TweakSection,
  TweakColor,
  TweakNumber,
} from "../components/ui/TweaksPanel";
import { useTweaks } from "../hooks/useTweaks";
import ChatPanel from "../components/ai/ChatPanel";
import { fetchRawAnalytics, fetchDailyBriefing, fetchMarketingRecommendations } from "../api/index";
import { generateSummary, generateInsightCards, generateStrategies, generateActions } from "../api/gemini";

const TWEAK_DEFAULTS = { accent: "#3B7CF6", videoId: 1 };

const TYPE_META = {
  opportunity: {
    color: "oklch(0.42 0.12 155)",
    bg: "oklch(0.95 0.04 155)",
    bar: "oklch(0.62 0.13 155)",
    label: "기회 발견",
  },
  warning: {
    color: "oklch(0.55 0.16 25)",
    bg: "oklch(0.95 0.04 25)",
    bar: "oklch(0.62 0.18 25)",
    label: "개선 필요",
  },
  trend: {
    color: "oklch(0.48 0.16 250)",
    bg: "oklch(0.95 0.03 250)",
    bar: "oklch(0.62 0.14 250)",
    label: "트렌드",
  },
  success: {
    color: "oklch(0.50 0.16 295)",
    bg: "oklch(0.95 0.04 295)",
    bar: "oklch(0.55 0.14 295)",
    label: "성과",
  },
};

const PRIORITY_META = {
  high: { color: "oklch(0.55 0.16 25)", label: "높음" },
  mid: { color: "oklch(0.55 0.14 65)", label: "중간" },
  low: { color: "oklch(0.42 0.12 155)", label: "낮음" },
};

const TAG_META = {
  운영: { color: "oklch(0.48 0.16 250)", bg: "oklch(0.95 0.03 250)" },
  마케팅: { color: "oklch(0.50 0.16 295)", bg: "oklch(0.95 0.04 295)" },
  공간: { color: "oklch(0.42 0.12 155)", bg: "oklch(0.95 0.04 155)" },
  상품: { color: "oklch(0.55 0.14 65)", bg: "oklch(0.95 0.05 80)" },
};

function SkeletonBlock({ width = "100%", height = 16, radius = 6, style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, #F0F2F5 25%, #E5E8EE 50%, #F0F2F5 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-wave 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

const emptySection = () => ({ loading: false, data: null, error: null });

export default function InsightsPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [stratTab, setStratTab] = useState("time");

  const [backendState, setBackendState] = useState({
    videoId: null,
    data: null,
    feedback: null,
    error: null,
  });
  const [sections, setSections] = useState({
    summary:    emptySection(),
    insights:   emptySection(),
    strategies: emptySection(),
    actions:    emptySection(),
  });

  async function runSection(key, fetchFn) {
    if (!backendState.data || sections[key].loading) return;
    const cacheKey = `gemini-${key}-v${t.videoId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setSections(prev => ({ ...prev, [key]: { loading: false, data: JSON.parse(cached), error: null } }));
        return;
      } catch { /* 무시 */ }
    }
    setSections(prev => ({ ...prev, [key]: { loading: true, data: null, error: null } }));
    try {
      const data = await fetchFn(backendState.data, backendState.feedback);
      localStorage.setItem(cacheKey, JSON.stringify(data));
      setSections(prev => ({ ...prev, [key]: { loading: false, data, error: null } }));
    } catch (e) {
      setSections(prev => ({ ...prev, [key]: { loading: false, data: null, error: e.message } }));
    }
  }

  function retrySection(key) {
    localStorage.removeItem(`gemini-${key}-v${t.videoId}`);
    setSections(prev => ({ ...prev, [key]: emptySection() }));
  }

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  useEffect(() => {
    setSections({ summary: emptySection(), insights: emptySection(), strategies: emptySection(), actions: emptySection() });
  }, [t.videoId]);

  // 백엔드 데이터 fetch
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchRawAnalytics(t.videoId),
      fetchDailyBriefing(),
      fetchMarketingRecommendations(),
    ])
      .then(([data, briefing, marketing]) => {
        if (!cancelled)
          setBackendState({ videoId: t.videoId, data, feedback: { briefing, marketing }, error: null });
      })
      .catch((e) => {
        if (!cancelled)
          setBackendState({
            videoId: t.videoId,
            data: null,
            feedback: null,
            error: e.message,
          });
      });
    return () => {
      cancelled = true;
    };
  }, [t.videoId]);

  const backendLoading = backendState.videoId !== t.videoId;
  const videoData = backendState.data;
  const feedback = backendState.feedback;
  const anyLoading = Object.values(sections).some(s => s.loading);
  const aiSummary = sections.summary.data?.summary ?? "";
  const aiInsights = sections.insights.data?.insights ?? [];
  const aiActions = sections.actions.data?.actions ?? [];
  const aiStrategies = sections.strategies.data?.strategies ?? [];
  const activeStratTab = aiStrategies.find((s) => s.id === stratTab)
    ? stratTab
    : (aiStrategies[0]?.id ?? null);
  const activeStratItems =
    aiStrategies.find((s) => s.id === activeStratTab)?.items ?? [];

  const persons = videoData?.persons ?? [];
  const womanCount = persons.filter(p => p.gender === 'female').length;
  const manCount = persons.filter(p => p.gender === 'male').length;
  const gTotal = womanCount + manCount;
  const femPct = gTotal > 0 ? Math.round((womanCount / gTotal) * 100) : 50;
  const dwellSecs = videoData?.summary?.avg_dwell_time_seconds ?? 0;
  const dwellM = Math.floor(dwellSecs / 60);
  const dwellS = Math.round(dwellSecs % 60);
  const dwellStr = videoData
    ? `${dwellM}분 ${String(dwellS).padStart(2, "0")}초`
    : "—";

  return (
    <div className="app">
      <style>{`
        @keyframes skeleton-wave {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <Sidebar />
      <div className="main">
        <header className="hdr">
          <div>
            <div className="hdr-title">AI 인사이트</div>
            <div className="hdr-sub">
              비디오 #{t.videoId} · Gemini 2.0 Flash 기반
            </div>
          </div>
          <div className="hdr-right">
            <div className="ai-status">
              <span className="d" />
              {backendLoading
                ? "데이터 로딩 중"
                : anyLoading
                  ? "AI 분석 중"
                  : "인사이트 생성 대기 중"}
            </div>
            <button className="icon-btn" aria-label="알림">
              <Ic.Bell />
            </button>
            <div className="avatar">박</div>
          </div>
        </header>

        <div
          className="content"
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* AI 요약 */}
          <div
            style={{
              background:
                "linear-gradient(135deg, oklch(0.97 0.02 250), oklch(0.96 0.03 285))",
              border: "1px solid oklch(0.92 0.03 260)",
              borderRadius: 14,
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  flexShrink: 0,
                  background: "oklch(0.93 0.05 265)",
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid oklch(0.89 0.06 265)",
                }}
              >
                <Ic.Sparkle color="oklch(0.50 0.16 265)" />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "oklch(0.40 0.14 265)",
                    }}
                  >
                    AI 요약
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      padding: "1px 8px",
                      borderRadius: 999,
                      background: "oklch(0.91 0.04 265)",
                      color: "oklch(0.48 0.16 265)",
                      fontWeight: 600,
                    }}
                  >
                    Gemini 자동 생성
                  </span>
                </div>
                {sections.summary.loading ? (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <SkeletonBlock height={14} width="90%" />
                    <SkeletonBlock height={14} width="75%" />
                    <SkeletonBlock height={14} width="60%" />
                  </div>
                ) : sections.summary.error ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "oklch(0.55 0.16 25)",
                      }}
                    >
                      {sections.summary.error.includes("429")
                        ? "API 요청 한도 초과 — 잠시 후 다시 시도하세요"
                        : `오류: ${sections.summary.error}`}
                    </p>
                    <button
                      onClick={() => retrySection("summary")}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        border: "1px solid oklch(0.82 0.04 260)",
                        background: "#fff",
                        color: "oklch(0.48 0.16 265)",
                        cursor: "pointer",
                      }}
                    >
                      다시 시도
                    </button>
                  </div>
                ) : sections.summary.data ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      lineHeight: 1.7,
                      color: "oklch(0.22 0.03 255)",
                    }}
                  >
                    {aiSummary}
                  </p>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "oklch(0.50 0.08 265)" }}>
                      매장 데이터를 기반으로 AI 요약을 생성합니다.
                    </p>
                    <button
                      onClick={() => runSection("summary", generateSummary)}
                      disabled={backendLoading}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        border: "none",
                        background: backendLoading ? "var(--line)" : "oklch(0.50 0.16 265)",
                        color: backendLoading ? "var(--muted)" : "#fff",
                        cursor: backendLoading ? "default" : "pointer",
                        flexShrink: 0,
                      }}
                    >
                      요약 생성
                    </button>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    `비디오 #${t.videoId}`,
                    "Gemini 2.0 Flash",
                    "Vision AI",
                  ].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        padding: "3px 10px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.65)",
                        color: "oklch(0.45 0.14 260)",
                        border: "1px solid oklch(0.90 0.04 260)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 핵심 인사이트 */}
          <div>
            <div className="section-h" style={{ marginBottom: 12 }}>
              <h2>핵심 인사이트</h2>
              <span className="sub">
                · Gemini AI 생성 · {aiInsights.length}건
              </span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                {sections.insights.error && (
                  <span style={{ fontSize: 12, color: "oklch(0.55 0.16 25)" }}>
                    {sections.insights.error.includes("429") ? "한도 초과" : "오류"}
                  </span>
                )}
                <button
                  onClick={() => sections.insights.data
                    ? retrySection("insights")
                    : runSection("insights", generateInsightCards)
                  }
                  disabled={sections.insights.loading || backendLoading}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 600,
                    border: "1px solid",
                    borderColor: sections.insights.data ? "var(--line)" : "var(--accent)",
                    background: sections.insights.data ? "#fff" : "var(--accent)",
                    color: sections.insights.data ? "var(--muted)" : "#fff",
                    cursor: sections.insights.loading || backendLoading ? "default" : "pointer",
                    opacity: sections.insights.loading || backendLoading ? 0.5 : 1,
                  }}
                >
                  {sections.insights.loading ? "생성 중..." : sections.insights.data ? "재생성" : "생성"}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  alignContent: "start",
                }}
              >
                {sections.insights.loading ? (
                  [0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 12,
                        border: "1px solid var(--line)",
                        background: "#fff",
                        overflow: "hidden",
                        padding: 0,
                      }}
                    >
                      <div style={{ height: 3, background: "#E5E8EE" }} />
                      <div
                        style={{
                          padding: "14px 15px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <SkeletonBlock height={20} width={60} radius={999} />
                        <SkeletonBlock height={14} width="80%" />
                        <SkeletonBlock height={12} width="100%" />
                        <SkeletonBlock height={12} width="90%" />
                        <SkeletonBlock height={10} width="70%" radius={6} />
                      </div>
                    </div>
                  ))
                ) : aiInsights.length > 0 ? (
                  aiInsights.map((ins, i) => {
                    const meta = TYPE_META[ins.type] ?? TYPE_META.trend;
                    return (
                      <div
                        key={i}
                        style={{
                          borderRadius: 12,
                          border: "1px solid var(--line)",
                          background: "#fff",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        <div style={{ height: 3, background: meta.bar }} />
                        <div
                          style={{
                            padding: "14px 15px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            flex: 1,
                          }}
                        >
                          <span
                            style={{
                              alignSelf: "flex-start",
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: meta.bg,
                              color: meta.color,
                            }}
                          >
                            {meta.label}
                          </span>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 13.5,
                              lineHeight: 1.35,
                              color: "var(--ink)",
                            }}
                          >
                            {ins.title}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--muted)",
                              lineHeight: 1.55,
                              flex: 1,
                            }}
                          >
                            {ins.desc}
                          </div>
                          <div
                            style={{
                              padding: "7px 9px",
                              background: "#F7F9FC",
                              borderRadius: 8,
                              fontSize: 11,
                              color: "var(--muted-2)",
                            }}
                          >
                            <span
                              style={{ fontWeight: 600, color: "var(--muted)" }}
                            >
                              근거 ·{" "}
                            </span>
                            {ins.data}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              fontWeight: 600,
                              color: meta.color,
                            }}
                          >
                            → {ins.action}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      gridColumn: "1/-1",
                      padding: "20px",
                      textAlign: "center",
                      color: "var(--muted)",
                      fontSize: 13,
                    }}
                  >
                    인사이트가 없습니다.
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-h">
                  <h3>우선순위 액션 리스트</h3>
                  <span className="sub">· AI 추천</span>
                  <button
                    onClick={() => sections.actions.data
                      ? retrySection("actions")
                      : runSection("actions", generateActions)
                    }
                    disabled={sections.actions.loading || backendLoading}
                    style={{
                      marginLeft: "auto",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 11.5,
                      fontWeight: 600,
                      border: "1px solid",
                      borderColor: sections.actions.data ? "var(--line)" : "var(--accent)",
                      background: sections.actions.data ? "#fff" : "var(--accent)",
                      color: sections.actions.data ? "var(--muted)" : "#fff",
                      cursor: sections.actions.loading || backendLoading ? "default" : "pointer",
                      opacity: sections.actions.loading || backendLoading ? 0.5 : 1,
                    }}
                  >
                    {sections.actions.loading ? "생성 중..." : sections.actions.data ? "재생성" : "생성"}
                  </button>
                </div>
                <div
                  className="card-b"
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {sections.actions.loading ? (
                    [0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          padding: "10px 0",
                        }}
                      >
                        <SkeletonBlock height={10} width={60} />
                        <SkeletonBlock height={12} width="85%" />
                        <SkeletonBlock height={10} width="60%" />
                      </div>
                    ))
                  ) : aiActions.length > 0 ? (
                    ["high", "mid", "low"].map((level) => {
                      const levelActions = aiActions.filter(
                        (a) => a.priority === level,
                      );
                      if (!levelActions.length) return null;
                      const meta = PRIORITY_META[level];
                      return (
                        <div key={level}>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.07em",
                              textTransform: "uppercase",
                              color: meta.color,
                              marginBottom: 6,
                            }}
                          >
                            {meta.label} 우선순위
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            {levelActions.map((act, i) => (
                              <div
                                key={i}
                                style={{
                                  padding: "10px 12px",
                                  borderRadius: 9,
                                  border: "1px solid var(--line)",
                                  background: "#fff",
                                  borderLeft: `3px solid ${meta.color}`,
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: 12.5,
                                    color: "var(--ink)",
                                    marginBottom: 5,
                                  }}
                                >
                                  {act.title}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    fontSize: 11,
                                    color: "var(--muted)",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span>{act.impact}</span>
                                  <span style={{ color: "var(--line-2)" }}>
                                    ·
                                  </span>
                                  <span>난이도 {act.difficulty}</span>
                                </div>
                                <div
                                  style={{
                                    fontSize: 10.5,
                                    color: "var(--muted-2)",
                                    marginTop: 3,
                                  }}
                                >
                                  관련 지표 · {act.metric}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>
                      액션 데이터가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 추천 전략 분류 */}
          <div className="card">
            <div className="card-h">
              <h3>추천 전략 분류</h3>
              <span className="sub">· AI 데이터 기반 실행 전략</span>
              <button
                onClick={() => sections.strategies.data
                  ? retrySection("strategies")
                  : runSection("strategies", generateStrategies)
                }
                disabled={sections.strategies.loading || backendLoading}
                style={{
                  marginLeft: "auto",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 11.5,
                  fontWeight: 600,
                  border: "1px solid",
                  borderColor: sections.strategies.data ? "var(--line)" : "var(--accent)",
                  background: sections.strategies.data ? "#fff" : "var(--accent)",
                  color: sections.strategies.data ? "var(--muted)" : "#fff",
                  cursor: sections.strategies.loading || backendLoading ? "default" : "pointer",
                  opacity: sections.strategies.loading || backendLoading ? 0.5 : 1,
                }}
              >
                {sections.strategies.loading ? "생성 중..." : sections.strategies.data ? "재생성" : "생성"}
              </button>
            </div>
            <div
              className="card-b"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {sections.strategies.loading ? (
                <>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[80, 70, 85, 75].map((w, i) => (
                      <SkeletonBlock
                        key={i}
                        height={30}
                        width={w}
                        radius={999}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          padding: "14px 15px",
                          borderRadius: 11,
                          border: "1px solid var(--line)",
                          background: "#FAFBFD",
                        }}
                      >
                        <SkeletonBlock
                          height={13}
                          width="80%"
                          style={{ marginBottom: 10 }}
                        />
                        <SkeletonBlock
                          height={11}
                          width="100%"
                          style={{ marginBottom: 6 }}
                        />
                        <SkeletonBlock height={11} width="70%" />
                      </div>
                    ))}
                  </div>
                </>
              ) : aiStrategies.length > 0 ? (
                <>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {aiStrategies.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setStratTab(tab.id)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 999,
                          fontSize: 12.5,
                          fontWeight: 600,
                          border: "1px solid",
                          borderColor:
                            activeStratTab === tab.id
                              ? "var(--accent)"
                              : "var(--line)",
                          background:
                            activeStratTab === tab.id
                              ? "var(--accent)"
                              : "#fff",
                          color:
                            activeStratTab === tab.id ? "#fff" : "var(--muted)",
                          cursor: "default",
                          transition: "background 0.12s, color 0.12s",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {activeStratItems.map((s, i) => {
                      const tagMeta = TAG_META[s.tag] || {
                        color: "var(--muted)",
                        bg: "#F7F9FC",
                      };
                      return (
                        <div
                          key={i}
                          style={{
                            padding: "14px 15px",
                            borderRadius: 11,
                            border: "1px solid var(--line)",
                            background: "#FAFBFD",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: 8,
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: "var(--ink)",
                                lineHeight: 1.3,
                              }}
                            >
                              {s.title}
                            </div>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "2px 7px",
                                borderRadius: 999,
                                background: tagMeta.bg,
                                color: tagMeta.color,
                                flexShrink: 0,
                              }}
                            >
                              {s.tag}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--muted)",
                              lineHeight: 1.6,
                            }}
                          >
                            {s.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  전략 데이터가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 데이터 근거 패널 */}
          <div>
            <div className="section-h">
              <h2>데이터 근거 패널</h2>
              <span className="sub">· 백엔드 실시간 데이터</span>
            </div>
            <div
              style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                marginTop: 10,
                paddingBottom: 4,
              }}
            >
              <div className="kpis" style={{ minWidth: 700 }}>
                <KPI
                  label="방문자 수"
                  icon={<Ic.Users />}
                  iconBg="oklch(0.95 0.03 250)"
                  iconFg="oklch(0.48 0.16 250)"
                  value={(videoData?.summary?.total_visitors ?? "—").toLocaleString?.() ?? "—"}
                  unit="명"
                  hint="실시간"
                />
                <KPI
                  label="평균 체류 시간"
                  icon={<Ic.Clock />}
                  iconBg="oklch(0.95 0.04 155)"
                  iconFg="oklch(0.42 0.12 155)"
                  value={dwellStr}
                  hint="실시간"
                />
                <KPI
                  label="입장 이벤트"
                  icon={<Ic.Trend />}
                  iconBg="oklch(0.95 0.04 295)"
                  iconFg="oklch(0.50 0.16 295)"
                  value={videoData ? persons.filter(p => p.entrance_event).length : "—"}
                  unit="건"
                  hint="오늘 누적"
                />
                <KPI
                  label="여성 비율"
                  icon={<Ic.Users />}
                  iconBg="oklch(0.95 0.05 80)"
                  iconFg="oklch(0.55 0.14 65)"
                  value={videoData ? femPct : "—"}
                  unit="%"
                  hint="익명 추정"
                />
                <KPI
                  label="혼잡도"
                  icon={<Ic.Activity />}
                  iconBg="oklch(0.95 0.05 80)"
                  iconFg="oklch(0.55 0.14 65)"
                  value={videoData?.summary?.peak_congestion ?? "—"}
                  hint="실시간"
                />
              </div>
            </div>
          </div>

          <div
            className="priv"
            style={{ padding: "6px 4px 12px", fontSize: 12 }}
          >
            <Ic.Shield color="#9AA3AF" />
            모든 인사이트는 Vision AI 익명 집계 데이터를 Gemini AI로 분석하여
            생성됩니다. 얼굴 인식, 개인 식별, 영상 저장은 수행하지 않습니다.
          </div>
        </div>
      </div>

      <ChatPanel videoData={videoData} feedback={feedback} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="데이터" />
        <TweakNumber
          label="비디오 ID"
          value={t.videoId}
          min={1}
          step={1}
          onChange={(v) => setTweak("videoId", v)}
        />
        <TweakSection label="비주얼" />
        <TweakColor
          label="액센트"
          value={t.accent}
          options={["#3B7CF6", "#2563EB", "#0EA5E9", "#7C3AED", "#10B981"]}
          onChange={(v) => setTweak("accent", v)}
        />
      </TweaksPanel>
    </div>
  );
}
