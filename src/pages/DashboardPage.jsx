import { useEffect, useState } from "react";
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
import "../styles/analytics.css";
import {
  TweaksPanel,
  TweakSection,
  TweakColor,
  TweakToggle,
  TweakNumber,
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
  rain: 0,
  temp: 20,
  showPrivacyBadge: true,
};

const DOW_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

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
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return {
    startAt: fmt(s),
    endAt: fmt(now),
    day: fmt(s),
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
    const videoId = localStorage.getItem("last_video_id");
    Promise.allSettled([
      fetchCoreCustomers(startAt, endAt),
      fetchHourlyPopulation(startAt, endAt),
      fetchWeatherImpact(day, t.rain, t.temp),
      fetchWeekdayPatterns(day, dayOfWeek),
      fetchVisitCount(startAt, endAt),
      fetchTomorrowPrediction(),
      fetchNextWeekPrediction(),
      videoId ? fetchRawAnalytics(videoId) : Promise.resolve(null),
    ]).then(
      ([
        core,
        hourly,
        weather,
        weekday,
        visits,
        tomorrow,
        nextWeek,
        raw,
      ]) => {
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
  }, [t.rain, t.temp]);

  const { data, loading } = state;
  const {
    core,
    hourly,
    weather,
    weekday,
    visits,
    tomorrow,
    nextWeek,
    raw,
  } = data;

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

  const nextWeekArr = (nextWeek?.result ?? []).map((v) =>
    typeof v === "object" ? (v?.expectedVisits ?? 0) : v
  );
  const maxNextWeek = Math.max(...nextWeekArr, 1);

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
              value={raw?.summary?.total_visitors ?? "—"}
              unit={raw ? "명" : ""}
              hint="분석된 영상 기준"
            />
            <KPI
              label="핵심 고객"
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
              value={formatDwell(raw?.summary?.avg_dwell_time_seconds)}
              hint="분석된 영상 기준"
            />
            <KPI
              label="날씨 보정 성과"
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

          {/* 기능 5·7: 방문 추세선 + 일일 브리핑 */}
          <div className="grid-main">
            <div className="card">
              <div className="card-h">
                <h3>방문 추세선</h3>
                <span className="sub">· 5 / 10 / 20 / 60일 이동평균</span>
                <div className="right">
                  <span className="chip dot">날씨 보정값</span>
                </div>
              </div>
              <div className="card-b" style={{ padding: "8px 12px 14px" }}>
                <TrendChart data={visits} />
              </div>
            </div>

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
                    {briefingLoading ? "생성 중..." : "생성하기 버튼을 눌러 AI 브리핑을 받아보세요."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 기능 2·6·8: 연령대 분포 + 다음 주 예측 + 마케팅 추천 */}
          <div className="grid-second">
            <div className="card">
              <div className="card-h">
                <h3>오늘 연령대 분포</h3>
                <span className="sub">· 시간대별 인구통계</span>
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

            <div className="card">
              <div className="card-h">
                <h3>다음 주 방문 예측</h3>
                <span className="sub">· 월 ~ 일</span>
              </div>
              <div className="card-b">
                {nextWeekArr.length > 0 ? (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 9 }}
                  >
                    {nextWeekArr.map((v, i) => (
                      <div
                        key={i}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "20px 1fr 36px",
                          gap: 8,
                          alignItems: "center",
                          fontSize: 12.5,
                        }}
                      >
                        <div
                          style={{ color: "var(--muted)", textAlign: "right" }}
                        >
                          {DOW_LABELS[i]}
                        </div>
                        <div
                          style={{
                            height: 7,
                            background: "#F1F3F6",
                            borderRadius: 99,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${(v / maxNextWeek) * 100}%`,
                              background: "var(--accent)",
                              borderRadius: 99,
                            }}
                          />
                        </div>
                        <div
                          className="mono"
                          style={{ fontWeight: 600, textAlign: "right" }}
                        >
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{ margin: 0, fontSize: 13, color: "var(--muted-2)" }}
                  >
                    {loading ? "불러오는 중..." : "예측 데이터가 없습니다."}
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
                    {marketingLoading ? "생성 중..." : "생성하기 버튼을 눌러 AI 마케팅 추천을 받아보세요."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 핵심 고객 프로파일 + 히트맵 */}
          <div className="grid-2">
            <CoreCustomerProfile persons={raw?.persons} />
            <div className="card">
              <div className="card-h">
                <h3>요일 × 시간대 히트맵</h3>
                <span className="sub">· 방문자 밀도</span>
              </div>
              <div className="card-b" style={{ padding: "16px 16px 14px" }}>
                <div className="heat-wrap">
                  <Heatmap />
                </div>
              </div>
            </div>
          </div>

          {/* 날씨 보정 성과 상세 + 요일 이상 탐지 상세 */}
          <div className="grid-2">
            <WeatherPerformance weather={weather} rain={t.rain} temp={t.temp} />
            <WeekdayAnomaly weekday={weekday} />
          </div>

          {/* 단기 방문 예측 상세 */}
          <PredictionDetail tomorrow={tomorrow} nextWeek={nextWeek} />

          {/* 시간대별 인구통계 변화 */}
          <TimeDemographics persons={raw?.persons} />

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
        <TweakSection label="날씨 (보정용)" />
        <TweakNumber
          label="강수량 (mm)"
          value={t.rain}
          min={0}
          step={1}
          onChange={(v) => setTweak("rain", v)}
        />
        <TweakNumber
          label="기온 (°C)"
          value={t.temp}
          min={-20}
          max={45}
          step={1}
          onChange={(v) => setTweak("temp", v)}
        />

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
