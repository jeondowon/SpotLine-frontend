import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/dashboard/Header";
import DatePicker from "../components/ui/DatePicker";
import { Ic } from "../components/ui/Icons";
import PremiumModal from "../components/ui/PremiumModal";
import {
  TweaksPanel,
  TweakSection,
  TweakColor,
  TweakToggle,
} from "../components/ui/TweaksPanel";
import { useTweaks } from "../hooks/useTweaks";

// 상단 KPI 4개
import DailyVisitsCard from "../components/dashboard/DailyVisitsCard";
import CurrentCountCard from "../components/dashboard/CurrentCountCard";
import DailySalesCard from "../components/dashboard/DailySalesCard";
import DailyGoalCard from "../components/dashboard/DailyGoalCard";

// 운영 현황 통합 카드
import OperationalStatusCard from "../components/dashboard/OperationalStatusCard";

// 분석 카드 (자체 페칭)
import VisitTrendCard from "../components/dashboard/VisitTrendCard";
import HourlyPopulationCard from "../components/dashboard/HourlyPopulationCard";
import CoreCustomerProfile from "../components/dashboard/CoreCustomerProfile";
import PredictionDetail from "../components/dashboard/PredictionDetail";
import WeatherPerformance from "../components/dashboard/WeatherPerformance";
import WeekdayAnomaly from "../components/dashboard/WeekdayAnomaly";
import HourlyCongestionCard from "../components/dashboard/HourlyCongestionCard";
import GenderCard from "../components/dashboard/GenderCard";

// AI 카드 (버튼 트리거)
import AIGenerateCard from "../components/dashboard/AIGenerateCard";
import { fetchDailyBriefing, fetchMarketingRecommendations } from "../api/index";

const TWEAK_DEFAULTS = {
  accent: "#00A5BB",
  showPrivacyBadge: true,
};

export default function DashboardPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  const [day, setDay] = useState(() => new Date().toLocaleDateString("en-CA"));

  const startAt = `${day}T00:00:00`;
  const endAt = `${day}T23:59:59`;

  const trendStartAt = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 60);
    d.setHours(0, 0, 0, 0);
    return `${d.toISOString().slice(0, 10)}T00:00:00`;
  })();

  const dateLabel = new Date(day).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Header />

        <div className="content">
          {/* 날짜 헤더 */}
          <div>
            <div
              style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}
            >
              {dateLabel}
            </div>
            <div className="row-greet" style={{ marginTop: 4 }}>
              <div className="greet">
                <h1>오늘 매장 인사이트를 확인하세요.</h1>
              </div>
              <DatePicker day={day} setDay={setDay} dataDates={[]} />
            </div>
          </div>

          {/* 상단 KPI 4개: 방문자 · 현재인원 · 매출 · 목표달성률 */}
          <div className="kpis">
            <DailyVisitsCard day={day} />
            <CurrentCountCard />
            <DailySalesCard startAt={startAt} endAt={endAt} />
            <DailyGoalCard startAt={startAt} endAt={endAt} day={day} />
          </div>

          {/* 운영 현황: 베스트메뉴 · 평균체류 · 최대응대대기 · 테이블유휴 · 그냥나간손님 */}
          <OperationalStatusCard startAt={startAt} endAt={endAt} />

          {/* 60일 방문 추세 */}
          <VisitTrendCard
            startAt={trendStartAt}
            endAt={endAt}
            selectedDay={day}
          />

          {/* 연령대 분포 · 예측 · 핵심고객 프로파일 */}
          <div className="grid-second">
            <HourlyPopulationCard startAt={startAt} endAt={endAt} />
            <PredictionDetail />
            <CoreCustomerProfile startAt={startAt} endAt={endAt} />
          </div>

          {/* AI 브리핑 · 마케팅 추천 */}
          <div className="grid-2">
            <AIGenerateCard
              title="일일 브리핑"
              fetch={fetchDailyBriefing}
              tooltip={"오늘 하루 매장 데이터를 AI가 분석해서 중요한 내용만 짧게 정리해줘요.\n\n방문자 수 변화, 고객 패턴, 특이사항 등을 빠르게 파악할 수 있어요."}
              emptyText="생성하기 버튼을 눌러 AI 브리핑을 받아보세요."
            />
            <AIGenerateCard
              title="마케팅 추천"
              fetch={fetchMarketingRecommendations}
              tooltip={"오늘의 방문 데이터와 고객 패턴을 분석해서 지금 매장에 맞는 마케팅 아이디어를 제안해줘요.\n\n어떤 고객이 많이 왔는지, 어떤 시간대가 한산했는지를 바탕으로 실질적인 액션을 추천해줘요."}
              emptyText="생성하기 버튼을 눌러 AI 마케팅 추천을 받아보세요."
            />
          </div>

          {/* 날씨 대비 성과 · 요일 이상 탐지 */}
          <div className="grid-2">
            <WeatherPerformance startAt={startAt} endAt={endAt} />
            <WeekdayAnomaly startAt={startAt} endAt={endAt} />
          </div>

          {/* 시간대별 혼잡도 · 성별 분포 */}
          <div className="grid-2">
            <HourlyCongestionCard startAt={startAt} endAt={endAt} />
            <GenderCard day={day} />
          </div>

          {/* 프리미엄 유도 배너 */}
          <div
            style={{
              background:
                "linear-gradient(90deg, #fff 40%, var(--accent-soft) 58%, var(--accent) 100%)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow-sm)",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <div
              style={{
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
                onClick={() => setIsPremiumModalOpen(true)}
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
              집계 데이터만 표시합니다. 얼굴 인식, 개인 식별은 수행하지 않으며
              모든 처리는 백엔드에서 수치화 후 폐기됩니다.
            </div>
          )}
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="비주얼" />
        <TweakColor
          label="액센트"
          value={t.accent}
          options={["#00A5BB", "#0284c7", "#0EA5E9", "#7C3AED", "#10B981"]}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakSection label="패널" />
        <TweakToggle
          label="개인정보 배지"
          value={t.showPrivacyBadge}
          onChange={(v) => setTweak("showPrivacyBadge", v)}
        />
      </TweaksPanel>

      {isPremiumModalOpen && (
        <PremiumModal onClose={() => setIsPremiumModalOpen(false)} />
      )}
    </div>
  );
}
