import { useEffect, useState } from "react";
import InfoTooltip from "../components/ui/InfoTooltip";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/dashboard/Header";
import TrendChart from "../components/dashboard/TrendChart";
import KPI from "../components/ui/KPI";
import { Ic } from "../components/ui/Icons";
import CoreCustomerProfile from "../components/dashboard/CoreCustomerProfile";
import TimeDemographics from "../components/dashboard/TimeDemographics";
import WeatherPerformance from "../components/dashboard/WeatherPerformance";
import WeekdayAnomaly from "../components/dashboard/WeekdayAnomaly";
import PredictionDetail from "../components/dashboard/PredictionDetail";
import Heatmap from "../components/analytics/charts/Heatmap";
import Donut from "../components/analytics/charts/Donut";
import "../styles/analytics.css";
import {
  TweaksPanel,
  TweakSection,
  TweakColor,
  TweakToggle,
} from "../components/ui/TweaksPanel";
import { useTweaks } from "../hooks/useTweaks";
import {
  fetchCoreCustomers,
  fetchHourlyPopulation,
  fetchWeatherImpact,
  fetchWeekdayPatterns,
  fetchVisitCount,
  fetchTomorrowPrediction,
  fetchNextWeekPrediction,
  fetchDailyBriefing,
  fetchRawAnalytics,
  fetchMarketingRecommendations,
} from "../api/index";

const TWEAK_DEFAULTS = {
  accent: "#3B7CF6",
  showPrivacyBadge: true,
};


const AGE_KEYS = [
  { key: "age10s", label: "10대" },
  { key: "age20s", label: "20대" },
  { key: "age30s", label: "30대" },
  { key: "age40s", label: "40대" },
  { key: "age50s", label: "50대+" },
];

function todayRange() {
  const now = new Date();
  const s = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  return {
    startAt: s.toISOString(),
    endAt: now.toISOString(),
    day: s.toISOString(),
    dayOfWeek: (now.getDay() + 6) % 7,
  };
}

function formatDwell(sec) {
  if (!sec) return "—";
  if (sec < 60) return `${Math.round(sec)}초`;
  return `${Math.floor(sec / 60)}분 ${Math.round(sec % 60)}초`;
}

function genderLabel(g) {
  if (g === "MAN") return "남성";
  if (g === "WOMAN") return "여성";
  return "—";
}

function ageLabel(a) {
  if (!a) return "—";
  return a.replace("s", "대");
}

function resultMeta(r) {
  if (r === "GOOD")
    return {
      text: "선방",
      iconBg: "var(--good-soft)",
      iconFg: "oklch(0.42 0.12 155)",
    };
  if (r === "BAD")
    return {
      text: "부진",
      iconBg: "var(--bad-soft)",
      iconFg: "oklch(0.45 0.16 25)",
    };
  return {
    text: "보통",
    iconBg: "var(--warn-soft)",
    iconFg: "oklch(0.55 0.14 65)",
  };
}

export default function DashboardPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [state, setState] = useState({ data: {}, loading: true });
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [marketingLoading, setMarketingLoading] = useState(false);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  useEffect(() => {
    const { startAt, endAt, day, dayOfWeek } = todayRange();
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    sixtyDaysAgo.setHours(0, 0, 0, 0);
    const videoId = localStorage.getItem("last_video_id");
    Promise.allSettled([
      fetchCoreCustomers(startAt, endAt),
      fetchHourlyPopulation(startAt, endAt),
      fetchWeatherImpact(day),
      fetchWeekdayPatterns(day, dayOfWeek),
      fetchVisitCount(sixtyDaysAgo.toISOString(), endAt),
      fetchTomorrowPrediction(),
      fetchNextWeekPrediction(),
      videoId ? fetchRawAnalytics(videoId) : Promise.resolve(null),
    ]).then(
      ([core, hourly, weather, weekday, visits, tomorrow, nextWeek, raw]) => {
        setState({
          loading: false,
          data: {
            core: core.status === "fulfilled" ? core.value : null,
            hourly: hourly.status === "fulfilled" ? hourly.value : null,
            weather: weather.status === "fulfilled" ? weather.value : null,
            weekday: weekday.status === "fulfilled" ? weekday.value : null,
            visits: visits.status === "fulfilled" ? visits.value : null,
            tomorrow: tomorrow.status === "fulfilled" ? tomorrow.value : null,
            nextWeek: nextWeek.status === "fulfilled" ? nextWeek.value : null,
            raw: raw.status === "fulfilled" ? raw.value : null,
          },
        });
      },
    );
  }, []);

  const { data, loading } = state;
  const { core, hourly, weather, weekday, visits, tomorrow, nextWeek, raw } =
    data;

  const [briefing, setBriefing] = useState(null);
  const [marketing, setMarketing] = useState(null);

  const generateBriefing = async () => {
    setBriefingLoading(true);
    try {
      const result = await fetchDailyBriefing();
      setBriefing(result);
    } catch {
      /* 실패 시 무시 */
    } finally {
      setBriefingLoading(false);
    }
  };

  const generateMarketing = async () => {
    setMarketingLoading(true);
    try {
      const result = await fetchMarketingRecommendations();
      setMarketing(result);
    } catch {
      /* 실패 시 무시 */
    } finally {
      setMarketingLoading(false);
    }
  };

  const weatherMeta = resultMeta(weather?.result);

  const coreLabel = core
    ? `${ageLabel(core.age)} ${genderLabel(core.gender)}`
    : "—";

  const ageGroups = AGE_KEYS.map(({ key, label }) => ({
    label,
    pct: hourly?.[key] ?? 0,
  }));

  const genderSlices = (() => {
    const persons = raw?.persons;
    if (!persons || persons.length === 0) {
      return [
        { label: "여성", pct: 58, color: "oklch(0.7 0.13 0)" },
        { label: "남성", pct: 42, color: "oklch(0.62 0.13 250)" },
      ];
    }
    const f = persons.filter((p) => p.gender === "female").length;
    const fPct = Math.round((f / persons.length) * 100);
    return [
      { label: "여성", pct: fPct, color: "oklch(0.7 0.13 0)" },
      { label: "남성", pct: 100 - fPct, color: "oklch(0.62 0.13 250)" },
    ];
  })();



  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Header />

        <div className="content">
          <div>
            <div
              style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}
            >
              {dateLabel}
            </div>
            <div className="row-greet" style={{ marginTop: 4 }}>
              <div className="greet">
                <h1>
                  {loading
                    ? "데이터를 불러오는 중입니다..."
                    : "오늘 매장 인사이트를 확인하세요."}
                </h1>
              </div>
            </div>
          </div>

          {/* KPI 4개 */}
          <div className="kpis">
            <KPI
              label="오늘 방문자"
              icon={<Ic.Users />}
              iconBg="oklch(0.95 0.03 250)"
              iconFg="oklch(0.48 0.16 250)"
              value={raw?.summary?.totalVisitors ?? "—"}
              unit={raw ? "명" : ""}
              hint="분석된 영상 기준"
            />
            <KPI
              label="오늘 핵심 고객"
              icon={<Ic.Users />}
              iconBg="oklch(0.95 0.03 250)"
              iconFg="oklch(0.48 0.16 250)"
              value={coreLabel}
              hint="오늘 최다 방문 그룹"
            />
            <KPI
              label="오늘 평균 체류"
              icon={<Ic.Clock />}
              iconBg="oklch(0.95 0.04 155)"
              iconFg="oklch(0.42 0.12 155)"
              value={formatDwell(raw?.summary?.avgDwellTimeSeconds)}
              hint="분석된 영상 기준"
            />
            <KPI
              label="오늘 날씨 대비 실제 성과"
              icon={<Ic.Cloud />}
              iconBg={weatherMeta.iconBg}
              iconFg={weatherMeta.iconFg}
              value={
                weather
                  ? `${Math.round((weather.realValue / weather.expectValue) * 100)}%`
                  : "—"
              }
              hint={
                weather
                  ? `${weatherMeta.text} · 기대 ${weather.expectValue}명 대비`
                  : "날씨 영향 보정 후"
              }
            />
          </div>

          {/* 방문 추세선 */}
          <div className="card">
            <div className="card-h">
              <h3>방문 추세선</h3>
              <span className="sub">· 5 / 10 / 20 / 60일 이동평균</span>
              <div className="right">
                <span className="chip dot">날씨 보정값</span>
                <InfoTooltip text={'최근 60일간 방문자 수의 진짜 흐름을 보여줘요.\n\n하루하루 들쭉날쭉한 노이즈를 줄이고, 5·10·20·60일 이동평균선으로 실제 트렌드를 읽을 수 있어요. 파란 점선은 날씨 영향을 보정한 방문자 수예요.'} />
              </div>
            </div>
            <div className="card-b" style={{ padding: "8px 12px 14px" }}>
              <TrendChart data={visits} />
            </div>
          </div>

          {/* 연령대 분포 + 다음 주 예측 + 핵심 고객 프로파일 */}
          <div className="grid-second">
            <div className="card">
              <div className="card-h">
                <h3>오늘 연령대 분포</h3>
                <span className="sub">· 시간대별 인구통계</span>
                <div className="right"><InfoTooltip text={'오늘 방문한 손님을 연령대별로 나눠서 보여줘요.\n\nVision AI가 영상을 보고 익명으로 연령대를 추정한 통계예요. 주요 고객층이 어떤 연령대인지 파악하는 데 활용할 수 있어요.'} /></div>
              </div>
              <div className="card-b">
                <div className="ages">
                  {ageGroups.map((a) => (
                    <div className="age-row" key={a.label}>
                      <div className="l mono">{a.label}</div>
                      <div className="track">
                        <div className="fill" style={{ width: a.pct + "%" }} />
                      </div>
                      <div className="v mono">{a.pct}%</div>
                    </div>
                  ))}
                </div>
                <div className="priv" style={{ marginTop: 14, fontSize: 11.5 }}>
                  <Ic.Shield color="#9AA3AF" />
                  Vision AI 익명 추정 통계입니다.
                </div>
              </div>
            </div>

            <PredictionDetail tomorrow={tomorrow} nextWeek={nextWeek} compact />

            <CoreCustomerProfile persons={raw?.persons} />
          </div>

          {/* AI 일일 브리핑 + AI 마케팅 추천 */}
          <div className="grid-2">
            <div className="card">
              <div className="card-h">
                <span className="ai-h-badge">
                  <Ic.Sparkle /> 일일 브리핑
                </span>
                <div className="right">
                  <span className="chip">AI</span>
                  <button
                    className="gen-btn"
                    onClick={generateBriefing}
                    disabled={briefingLoading}
                  >
                    {briefingLoading ? "생성 중..." : "생성하기"}
                  </button>
                  <InfoTooltip text={'오늘 하루 매장 데이터를 AI가 분석해서 중요한 내용만 짧게 정리해줘요.\n\n방문자 수 변화, 고객 패턴, 특이사항 등을 빠르게 파악할 수 있어요. 하루를 마무리하며 오늘을 복기하고 싶을 때 눌러보세요.'} />
                </div>
              </div>
              <div className="card-b">
                {briefing?.message ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      lineHeight: 1.75,
                      color: "var(--ink-2)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {briefing.message}
                  </p>
                ) : (
                  <p
                    style={{ margin: 0, fontSize: 13, color: "var(--muted-2)" }}
                  >
                    {briefingLoading
                      ? "생성 중..."
                      : "생성하기 버튼을 눌러 AI 브리핑을 받아보세요."}
                  </p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <span className="ai-h-badge">
                  <Ic.Sparkle /> 마케팅 추천
                </span>
                <div className="right">
                  <span className="chip">AI</span>
                  <button
                    className="gen-btn"
                    onClick={generateMarketing}
                    disabled={marketingLoading}
                  >
                    {marketingLoading ? "생성 중..." : "생성하기"}
                  </button>
                  <InfoTooltip text={'오늘의 방문 데이터와 고객 패턴을 분석해서 지금 매장에 맞는 마케팅 아이디어를 제안해줘요.\n\n어떤 고객이 많이 왔는지, 어떤 시간대가 한산했는지를 바탕으로 실질적인 액션을 추천해줘요.'} />
                </div>
              </div>
              <div className="card-b">
                {marketing?.message ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      lineHeight: 1.75,
                      color: "var(--ink-2)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {marketing.message}
                  </p>
                ) : (
                  <p
                    style={{ margin: 0, fontSize: 13, color: "var(--muted-2)" }}
                  >
                    {marketingLoading
                      ? "생성 중..."
                      : "생성하기 버튼을 눌러 AI 마케팅 추천을 받아보세요."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 날씨 보정 성과 상세 + 요일 이상 탐지 상세 */}
          <div className="grid-2">
            <WeatherPerformance weather={weather} />
            <WeekdayAnomaly weekday={weekday} />
          </div>


          {/* 시간대별 인구통계 변화 */}
          <TimeDemographics persons={raw?.persons} />

          {/* PRO: 히트맵 + 성별 분포 */}
          <div className="grid-2">
            <div className="card" style={{ position: "relative" }}>
              <div className="card-h">
                <h3>요일 × 시간대 히트맵</h3>
                <span className="sub">· 방문자 밀도</span>
                <div className="right">
                  <span
                    className="chip"
                    style={{
                      background: "oklch(0.92 0.06 290)",
                      color: "oklch(0.42 0.18 290)",
                      fontWeight: 700,
                    }}
                  >
                    PRO
                  </span>
                  <InfoTooltip text={'요일과 시간대를 격자로 나눠, 어느 타이밍에 방문자가 몰리는지 색상으로 보여줘요.\n\n피크 타임과 한산한 시간대를 한눈에 파악해서 효율적인 운영 계획을 세울 수 있어요. PRO 플랜에서 이용 가능해요.'} />
                </div>
              </div>
              <div
                className="card-b"
                style={{ padding: "16px 16px 14px", position: "relative" }}
              >
                <div
                  className="heat-wrap"
                  style={{
                    filter: "blur(3px)",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  <Heatmap />
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Ic.Lock color="oklch(0.42 0.18 290)" />
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "oklch(0.42 0.18 290)",
                    }}
                  >
                    프리미엄 기능입니다
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    업그레이드하면 요일 × 시간대 패턴을 분석할 수 있습니다.
                  </div>
                </div>
              </div>
            </div>

            <div
              className="card"
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="card-h">
                <h3>성별 추정 분포</h3>
                <span className="sub">· AI 추정 · 익명</span>
                <div className="right">
                  <span
                    className="chip"
                    style={{
                      background: "oklch(0.92 0.06 290)",
                      color: "oklch(0.42 0.18 290)",
                      fontWeight: 700,
                    }}
                  >
                    PRO
                  </span>
                  <InfoTooltip text={'Vision AI가 영상에서 익명으로 성별을 추정해 분포를 보여줘요.\n\n주요 고객의 성별 비중을 파악해서 상품 구성이나 마케팅 방향을 잡는 데 도움이 돼요. PRO 플랜에서 이용 가능해요.'} />
                </div>
              </div>
              <div
                className="card-b"
                style={{
                  position: "relative",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px",
                }}
              >
                <div
                  style={{
                    filter: "blur(3px)",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  <div className="donut-wrap" style={{ gap: 100 }}>
                    <Donut slices={genderSlices} label="전체" size={170} />
                    <div className="donut-legend">
                      {genderSlices.map((s) => (
                        <div className="row" key={s.label}>
                          <span
                            className="sw"
                            style={{ background: s.color }}
                          />
                          <span>{s.label}</span>
                          <span className="v mono">{s.pct}%</span>
                        </div>
                      ))}
                      <div className="priv" style={{ marginTop: 6 }}>
                        <Ic.Shield color="#9AA3AF" />
                        외관 기반 추정 · 얼굴 식별 없음
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Ic.Lock color="oklch(0.42 0.18 290)" />
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "oklch(0.42 0.18 290)",
                    }}
                  >
                    프리미엄 기능입니다
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    업그레이드하면 성별 분포를 분석할 수 있습니다.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 프리미엄 유도 배너 */}
          <div
            style={{
              background: "var(--accent-soft)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow-sm)",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            {/* 왼쪽: 흰색 절반 */}
            <div
              style={{
                background: "#fff",
                padding: "32px 32px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "var(--accent-ink)",
                    lineHeight: 1,
                  }}
                >
                  15
                </span>
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                  개의 잠긴 인사이트가 발견됐어요
                </span>
              </div>
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: 21,
                  fontWeight: 800,
                  color: "var(--ink)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.4,
                }}
              >
                왜 어떤 날은 잘 되고,
                <br />
                어떤 날은 안 될까요?
              </h2>
              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: 13,
                  color: "var(--muted)",
                  lineHeight: 1.75,
                }}
              >
                알림 기능, 구역별 체류 분석, 방문자 특성까지
                <br />
                더욱 전문적인 분석을 기반으로 프리미엄이 해답을 찾아드릴게요.
              </p>
              <button
                style={{
                  alignSelf: "flex-start",
                  padding: "11px 20px",
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "#fff",
                  background: "var(--ink)",
                  border: "none",
                  borderRadius: 999,
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                }}
              >
                프리미엄 시작하기 →
              </button>
            </div>

            {/* 오른쪽: 하늘색 배경 위 티저 스탯 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 8,
                padding: "16px 14px",
              }}
            >
              {[
                {
                  icon: <Ic.Bell />,
                  title: "혼잡 알림",
                  sub: "임계치 초과 시 즉시 푸시 알림",
                },
                {
                  icon: <Ic.Dash />,
                  title: "구역별 체류 분석",
                  sub: "진열대 앞 평균 체류 2.3배 ↑",
                },
                {
                  icon: <Ic.Users />,
                  title: "그룹 방문 비율",
                  sub: "2인 이상 방문이 전체의 58%",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    background: "#fff",
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      flexShrink: 0,
                      background: "var(--accent-soft)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--accent-ink)",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--ink)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      {item.sub}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 44,
                      height: 18,
                      borderRadius: 6,
                      flexShrink: 0,
                      background: "var(--line-2)",
                      filter: "blur(5px)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {t.showPrivacyBadge && (
            <div
              className="priv"
              style={{ padding: "6px 4px 12px", fontSize: 12 }}
            >
              <Ic.Shield color="#9AA3AF" />본 대시보드는 Vision AI 기반 익명
              집계 데이터만 표시합니다. 얼굴 인식, 개인 식별, 영상 저장은
              수행하지 않으며 모든 처리는 백엔드에서 수치화 후 폐기됩니다.
            </div>
          )}
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

        <TweakSection label="패널" />
        <TweakToggle
          label="개인정보 배지"
          value={t.showPrivacyBadge}
          onChange={(v) => setTweak("showPrivacyBadge", v)}
        />
      </TweaksPanel>
    </div>
  );
}
