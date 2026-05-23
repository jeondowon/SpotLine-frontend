import { useState, useEffect } from "react";
import "../styles/analytics.css";
import Sidebar from "../components/layout/Sidebar";
import KPI from "../components/ui/KPI";
import { Ic } from "../components/ui/Icons";
import {
  TweaksPanel,
  TweakSection,
  TweakColor,
} from "../components/ui/TweaksPanel";
import { useTweaks } from "../hooks/useTweaks";

const TWEAK_DEFAULTS = { accent: "#3B7CF6" };

const REPORT_TYPES = ["주간 리포트", "월간 리포트", "사용자 지정"];

const THIS_WEEK = [295, 312, 328, 348, 368, 502, 412];
const LAST_WEEK = [268, 290, 311, 322, 340, 468, 392];
const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

const CONV_THIS = [24, 44, 32, 38, 42, 36, 28];
const CONV_LAST = [22, 40, 30, 35, 38, 32, 25];
const HOUR_LABELS = ["10시", "13시", "15시", "17시", "19시", "21시", "22시"];

const STAY_THIS = [22, 25, 23, 24, 26, 29, 28];
const STAY_LAST = [20, 22, 21, 22, 24, 27, 25];

const FINDINGS = [
  {
    label: "방문자 수 변화",
    value: "+12.3%",
    dir: "up",
    desc: "전주 대비 증가, 토요일 피크 502명으로 주간 최고점 기록",
  },
  {
    label: "체류 시간 변화",
    value: "+4.2%",
    dir: "up",
    desc: "평균 23분 → 이전 주(22분) 대비 소폭 증가",
  },
  {
    label: "전환율 변화",
    value: "+1.6%p",
    dir: "up",
    desc: "계산대 진입률 33.7%, 동선 개선 효과 지속 중",
  },
  {
    label: "고객층 변화",
    value: "20대",
    dir: "neu",
    desc: "20대 비율 38%로 1위 유지, 전주 대비 +2%p 증가",
  },
  {
    label: "날씨 영향",
    value: "주의",
    dir: "warn",
    desc: "비 오는 날 방문자 -25% — 우천 대비 전략 검토 필요",
  },
];

const RECOMMENDATIONS = [
  {
    tag: "마케팅",
    tagColor: "oklch(0.50 0.16 295)",
    tagBg: "oklch(0.95 0.04 295)",
    title: "저녁 한정 SNS 프로모션",
    desc: "토요일 18–20시 집중 유입을 활용한 공유형 이벤트를 기획하세요.",
  },
  {
    tag: "운영",
    tagColor: "oklch(0.48 0.16 250)",
    tagBg: "oklch(0.95 0.03 250)",
    title: "토요일 19시 직원 추가 배치",
    desc: "지난주 혼잡도 76으로 이탈 가능성이 높았습니다. 피크 30분 전 배치를 권장합니다.",
  },
  {
    tag: "공간",
    tagColor: "oklch(0.42 0.12 155)",
    tagBg: "oklch(0.95 0.04 155)",
    title: "점심 메뉴판 가시성 개선",
    desc: "점심 전환율이 평균보다 12%p 낮습니다. 메뉴판 위치와 크기를 재검토하세요.",
  },
  {
    tag: "상품",
    tagColor: "oklch(0.55 0.14 65)",
    tagBg: "oklch(0.95 0.05 80)",
    title: "우천 따뜻한 음료 패키지",
    desc: "비 오는 날 체류가 길어지는 패턴을 활용해 음료 + 디저트 세트를 운영하세요.",
  },
];

const HISTORY = [
  {
    name: "주간 리포트 #12",
    period: "05.05 – 05.11",
    created: "5월 12일",
    change: "방문자 +8.2%",
    dir: "up",
  },
  {
    name: "주간 리포트 #11",
    period: "04.28 – 05.04",
    created: "5월 5일",
    change: "전환율 -1.4%",
    dir: "dn",
  },
  {
    name: "월간 리포트 #4",
    period: "4월 전체",
    created: "5월 1일",
    change: "방문자 +15.2%",
    dir: "up",
  },
  {
    name: "주간 리포트 #10",
    period: "04.21 – 04.27",
    created: "4월 28일",
    change: "체류 +3.1%",
    dir: "up",
  },
  {
    name: "주간 리포트 #9",
    period: "04.14 – 04.20",
    created: "4월 21일",
    change: "날씨 영향 큼",
    dir: "warn",
  },
];

function GroupedBars({ thisData, lastData, labels, yMax, unit = "" }) {
  const W = 480,
    H = 155,
    PL = 28,
    PR = 8,
    PT = 10,
    PB = 24;
  const innerW = W - PL - PR,
    innerH = H - PT - PB;
  const n = labels.length;
  const gw = innerW / n;
  const bw = Math.min(13, gw / 3);
  const gap = 3;

  const x0 = (i) => PL + i * gw + gw / 2 - bw - gap / 2;
  const x1 = (i) => PL + i * gw + gw / 2 + gap / 2;
  const y = (v) => PT + innerH - (v / yMax) * innerH;
  const bh = (v) => Math.max(2, (v / yMax) * innerH);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: H }}
    >
      {[0, yMax / 2, yMax].map((g) => (
        <g key={g}>
          <line
            x1={PL}
            x2={W - PR}
            y1={y(g)}
            y2={y(g)}
            stroke="#ECEEF2"
            strokeDasharray={g === 0 ? "" : "3 3"}
          />
          <text
            x={PL - 4}
            y={y(g) + 3}
            fontSize="9"
            textAnchor="end"
            fill="#9AA3AF"
            fontFamily="JetBrains Mono"
          >
            {g}
            {unit}
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text
          key={l}
          x={PL + i * gw + gw / 2}
          y={H - 7}
          fontSize="9.5"
          textAnchor="middle"
          fill="#9AA3AF"
          fontFamily="JetBrains Mono"
        >
          {l}
        </text>
      ))}
      {thisData.map((v, i) => (
        <g key={i}>
          <rect
            x={x0(i)}
            y={y(v)}
            width={bw}
            height={bh(v)}
            fill="var(--accent)"
            rx="2.5"
            opacity="0.88"
          />
          <rect
            x={x1(i)}
            y={y(lastData[i])}
            width={bw}
            height={bh(lastData[i])}
            fill="#C9D0DA"
            rx="2.5"
          />
        </g>
      ))}
    </svg>
  );
}

const DIR_STYLE = {
  up: {
    color: "oklch(0.42 0.12 155)",
    bg: "oklch(0.95 0.04 155)",
    symbol: "▲",
  },
  dn: { color: "oklch(0.55 0.16 25)", bg: "oklch(0.95 0.04 25)", symbol: "▼" },
  warn: {
    color: "oklch(0.55 0.14 65)",
    bg: "oklch(0.95 0.05 80)",
    symbol: "!",
  },
  neu: {
    color: "oklch(0.48 0.16 250)",
    bg: "oklch(0.95 0.03 250)",
    symbol: "–",
  },
};

export default function ReportsPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [reportType, setReportType] = useState("주간 리포트");

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  const dateRange =
    reportType === "월간 리포트"
      ? "2026.04.17 – 05.16 · 30일"
      : "2026.05.10 – 05.16 · 7일";

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <header className="hdr">
          <div>
            <div className="hdr-title">리포트</div>
            <div className="hdr-sub">{dateRange} · 코지 카페 · 강남점</div>
          </div>
          <div className="hdr-right">
            <div className="ai-status">
              <span className="d" />
              AI 리포트 생성 완료
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
          {/* 리포트 제어 영역 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 14,
              boxShadow: "var(--shadow-sm)",
              flexWrap: "wrap",
            }}
          >
            <div className="seg-tabs">
              {REPORT_TYPES.map((type) => (
                <button
                  key={type}
                  className={reportType === type ? "on" : ""}
                  onClick={() => setReportType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="date-pick" style={{ marginLeft: 4 }}>
              <Ic.Cal color="#6B7280" />
              <span className="mono" style={{ fontSize: 12 }}>
                {reportType === "월간 리포트"
                  ? "2026.04.17 – 05.16"
                  : "2026.05.10 – 05.16"}
              </span>
              <Ic.Chevron color="#9AA3AF" />
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="btn-secondary">
                <Ic.Download /> PDF 내보내기
              </button>
              <button
                style={{
                  height: 32,
                  padding: "0 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "default",
                  fontFamily: "inherit",
                }}
              >
                리포트 생성
              </button>
            </div>
          </div>

          {/* KPI 요약 */}
          <div>
            <div className="section-h">
              <h2>선택 기간 핵심 요약</h2>
              <span className="sub">
                · {reportType === "월간 리포트" ? "30일" : "7일"} 기준
              </span>
              <span className="meta">기준일 2026.05.16</span>
            </div>
            <div className="kpis-6" style={{ marginTop: 10 }}>
              <KPI
                className="compact"
                label="총 방문자 수"
                icon={<Ic.Users />}
                iconBg="oklch(0.95 0.03 250)"
                iconFg="oklch(0.48 0.16 250)"
                value="2,565"
                unit="명"
                delta={12.3}
              />
              <KPI
                className="compact"
                label="평균 체류 시간"
                icon={<Ic.Clock />}
                iconBg="oklch(0.95 0.04 155)"
                iconFg="oklch(0.42 0.12 155)"
                value="23분"
                delta={4.2}
              />
              <KPI
                className="compact"
                label="평균 전환율"
                icon={<Ic.Trend />}
                iconBg="oklch(0.95 0.04 295)"
                iconFg="oklch(0.50 0.16 295)"
                value="33.7"
                unit="%"
                delta={1.6}
              />
              <KPI
                className="compact"
                label="가장 붐빈 시간대"
                icon={<Ic.Activity />}
                iconBg="oklch(0.95 0.05 80)"
                iconFg="oklch(0.55 0.14 65)"
                value="19시"
                hint="토 502명"
              />
              <KPI
                className="compact"
                label="주요 방문 고객층"
                icon={<Ic.Users />}
                iconBg="oklch(0.95 0.04 295)"
                iconFg="oklch(0.50 0.16 295)"
                value="20대"
                hint="전체의 38%"
              />
              <KPI
                className="compact"
                label="날씨 영향 요약"
                icon={<Ic.Sun />}
                iconBg="oklch(0.95 0.05 80)"
                iconFg="oklch(0.55 0.14 65)"
                value="높음"
                hint="상관계수 0.78"
              />
            </div>
          </div>

          {/* AI 요약 + 핵심 발견점 | 추천 액션 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.45fr 1fr",
              gap: 16,
            }}
          >
            {/* 왼쪽: AI 종합 요약 + 핵심 발견점 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* AI 기반 종합 요약 */}
              <div className="card">
                <div className="card-h">
                  <span className="ai-h-badge">
                    <Ic.Sparkle /> AI 기반 종합 요약
                  </span>
                  <span className="sub">· 자동 생성 · 경영진 보고 형식</span>
                  <div className="right">
                    <span className="chip">베타</span>
                  </div>
                </div>
                <div
                  className="card-b"
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div
                    style={{
                      padding: "16px 18px",
                      background:
                        "linear-gradient(135deg, oklch(0.97 0.02 250), oklch(0.96 0.02 280))",
                      border: "1px solid oklch(0.92 0.03 260)",
                      borderRadius: 11,
                      fontSize: 13.5,
                      lineHeight: 1.75,
                      color: "oklch(0.22 0.03 255)",
                    }}
                  >
                    이번 기간 동안 총 방문자 수는 전주 대비 <b>12.3% 증가</b>
                    했으며, 저녁 시간대 방문 집중도가 높게 나타났습니다. 20대
                    고객층의 비율이 가장 높았고, 비 오는 날에는 평균 체류 시간이{" "}
                    <b>+8.6% 증가</b>하는 경향을 보였습니다. 계산대 전환율은
                    33.7%로 5일 연속 상승 중이며, 신규 동선 배치의 효과가
                    데이터로 확인됩니다. 점심 시간대 전환율 저하는 지속적인
                    과제로 남아 있습니다.
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11.5,
                      color: "var(--muted-2)",
                    }}
                  >
                    <span>Vision AI · 익명 집계 데이터 기반</span>
                    <span className="mono">생성일 2026.05.16</span>
                  </div>
                </div>
              </div>

              {/* 핵심 발견점 */}
              <div className="card">
                <div className="card-h">
                  <h3>핵심 발견점</h3>
                  <span className="sub">· 기간 내 주요 변화</span>
                </div>
                <div
                  className="card-b"
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {FINDINGS.map((f, i) => {
                    const ds = DIR_STYLE[f.dir];
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "12px 0",
                          borderBottom:
                            i < FINDINGS.length - 1
                              ? "1px solid var(--line)"
                              : "none",
                        }}
                      >
                        <span
                          style={{
                            minWidth: 40,
                            textAlign: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "3px 0",
                            borderRadius: 7,
                            background: ds.bg,
                            color: ds.color,
                          }}
                        >
                          {ds.symbol} {f.value}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--ink)",
                              marginBottom: 3,
                            }}
                          >
                            {f.label}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--muted)",
                              lineHeight: 1.5,
                            }}
                          >
                            {f.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 오른쪽: 추천 액션 */}
            <div className="card">
              <div className="card-h">
                <h3>추천 액션</h3>
                <span className="sub">· 다음 기간 개선 전략</span>
              </div>
              <div
                className="card-b"
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {RECOMMENDATIONS.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "13px 14px",
                      borderRadius: 11,
                      border: "1px solid var(--line)",
                      background: "#FAFBFD",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: r.tagBg,
                          color: r.tagColor,
                        }}
                      >
                        {r.tag}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--ink)",
                        }}
                      >
                        {r.title}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        lineHeight: 1.55,
                      }}
                    >
                      {r.desc}
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 4,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "var(--accent-soft)",
                    color: "var(--accent-ink)",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  <Ic.Sparkle color="var(--accent-ink)" /> 위 추천은 Vision AI
                  익명 집계 데이터를 기반으로 자동 생성됩니다.
                </div>
              </div>
            </div>
          </div>

          {/* 기간 비교 분석 */}
          <div>
            <div className="section-h">
              <h2>기간 비교 분석</h2>
              <span className="sub">· 이번 주 vs 지난주</span>
            </div>
            <div className="grid-3" style={{ marginTop: 10 }}>
              {/* 방문자 비교 */}
              <div className="card">
                <div className="card-h">
                  <h3>일별 방문자 비교</h3>
                </div>
                <div className="card-b" style={{ paddingBottom: 8 }}>
                  <GroupedBars
                    thisData={THIS_WEEK}
                    lastData={LAST_WEEK}
                    labels={DAY_LABELS}
                    yMax={550}
                  />
                  <div className="legend" style={{ marginTop: 8 }}>
                    <div>
                      <span
                        className="sw"
                        style={{ background: "var(--accent)" }}
                      />{" "}
                      이번 주
                    </div>
                    <div>
                      <span className="sw" style={{ background: "#C9D0DA" }} />{" "}
                      지난주
                    </div>
                  </div>
                </div>
              </div>

              {/* 전환율 비교 */}
              <div className="card">
                <div className="card-h">
                  <h3>시간대별 전환율 비교</h3>
                </div>
                <div className="card-b" style={{ paddingBottom: 8 }}>
                  <GroupedBars
                    thisData={CONV_THIS}
                    lastData={CONV_LAST}
                    labels={HOUR_LABELS}
                    yMax={60}
                    unit="%"
                  />
                  <div className="legend" style={{ marginTop: 8 }}>
                    <div>
                      <span
                        className="sw"
                        style={{ background: "var(--accent)" }}
                      />{" "}
                      이번 주
                    </div>
                    <div>
                      <span className="sw" style={{ background: "#C9D0DA" }} />{" "}
                      지난주
                    </div>
                  </div>
                </div>
              </div>

              {/* 체류 시간 비교 */}
              <div className="card">
                <div className="card-h">
                  <h3>일별 평균 체류 비교</h3>
                </div>
                <div className="card-b" style={{ paddingBottom: 8 }}>
                  <GroupedBars
                    thisData={STAY_THIS}
                    lastData={STAY_LAST}
                    labels={DAY_LABELS}
                    yMax={35}
                    unit="분"
                  />
                  <div className="legend" style={{ marginTop: 8 }}>
                    <div>
                      <span
                        className="sw"
                        style={{ background: "var(--accent)" }}
                      />{" "}
                      이번 주
                    </div>
                    <div>
                      <span className="sw" style={{ background: "#C9D0DA" }} />{" "}
                      지난주
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 리포트 히스토리 */}
          <div className="card">
            <div className="card-h">
              <h3>리포트 히스토리</h3>
              <span className="sub">· 최근 5개</span>
              <div className="right">
                <span className="chip">전체 보기</span>
              </div>
            </div>
            <div className="card-b" style={{ padding: 0 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)" }}>
                    {[
                      "리포트 이름",
                      "기간",
                      "생성일",
                      "주요 변화",
                      "다운로드",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--muted-2)",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HISTORY.map((r, i) => {
                    const ds = DIR_STYLE[r.dir];
                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom:
                            i < HISTORY.length - 1
                              ? "1px solid var(--line)"
                              : "none",
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                            fontWeight: 600,
                            color: "var(--ink)",
                          }}
                        >
                          {r.name}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "var(--muted)",
                          }}
                          className="mono"
                        >
                          {r.period}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "var(--muted)",
                          }}
                        >
                          {r.created}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              padding: "3px 9px",
                              borderRadius: 999,
                              background: ds.bg,
                              color: ds.color,
                            }}
                          >
                            {ds.symbol} {r.change}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "5px 11px",
                              borderRadius: 7,
                              border: "1px solid var(--line)",
                              background: "#fff",
                              color: "var(--muted)",
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: "default",
                              fontFamily: "inherit",
                            }}
                          >
                            <Ic.Download /> PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="priv"
            style={{ padding: "6px 4px 12px", fontSize: 12 }}
          >
            <Ic.Shield color="#9AA3AF" />
            모든 리포트 데이터는 Vision AI 익명 집계 결과입니다. 얼굴 인식, 개인
            식별은 수행하지 않습니다.
          </div>
        </div>
      </div>

      <TweaksPanel title="Tweaks">
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
