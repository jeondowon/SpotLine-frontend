import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import spotLineLogo from "../assets/images/SpotLine_FullLogo.png";
import "../styles/preview.css";

/* ============================================================
   PreviewPage — 온보딩 플로우 첫 진입 (서비스 소개 / 프리뷰)
   토스 스타일 롱스크롤 랜딩. 모든 CTA는 /onboarding 으로 연결.
   스타일은 .sl-preview 래퍼 아래로 스코프되어 globals.css와 충돌하지 않음.
   ============================================================ */

// 화살표 아이콘 (CTA / 네비)
const ArrowIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const CheckIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ShieldIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const UsersIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const ClockIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const ActivityIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
const SparkleIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z" />
    <path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15z" />
  </svg>
);
const ChartIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M3 3v18h18" />
    <path d="M7 14l4-4 3 3 5-6" />
  </svg>
);
const UserIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const TrendUpIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const ReportIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
    <path d="M8 13h8M8 17h5" />
  </svg>
);
const StoreIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
    <path d="M3 9h18" />
    <path d="M9 20v-6h6v6" />
  </svg>
);
const VideoIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);

const ACCENT_LINE = "oklch(0.66 0.13 205)";
const TEAL_FILL = "#1B8CA6";

export default function PreviewPage() {
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onAnchorClick = (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || !root.contains(link)) return;

      const target = root.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    };

    root.addEventListener("click", onAnchorClick);
    return () => root.removeEventListener("click", onAnchorClick);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("js-reveal");
    const reveals = Array.from(root.querySelectorAll(".reveal"));
    const show = (el) => el.classList.add("in");

    // 첫 화면에 보이는 요소는 즉시 노출
    reveals.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) show(el);
    });

    let io;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              show(e.target);
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
      reveals.forEach((el) => {
        if (!el.classList.contains("in")) io.observe(el);
      });
      var t = setTimeout(() => reveals.forEach(show), 1400); // 관찰자 미발화 대비 안전장치
    } else {
      reveals.forEach(show);
    }
    return () => {
      if (io) io.disconnect();
      if (t) clearTimeout(t);
    };
  }, []);

  return (
    <div className="sl-preview" ref={rootRef}>
      {/* ============ 상단 네비 ============ */}
      <nav className={"nav" + (scrolled ? " scrolled" : "")}>
        <img className="nav-logo" src={spotLineLogo} alt="SpotLine" />
        <div className="nav-links">
          <a href="#analytics">방문 분석</a>
          <a href="#audience">고객 이해</a>
          <a href="#strategy">AI 전략</a>
          <a href="#privacy">프라이버시</a>
        </div>
        <div className="nav-right">
          <Link className="btn btn-primary" to="/onboarding">
            시작하기 <ArrowIcon width="17" height="17" />
          </Link>
        </div>
      </nav>

      {/* ============ 히어로 ============ */}
      <header className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow reveal">
              <span className="dot"></span>VISION AI 매장 분석
            </div>
            <h1 className="display reveal d1">
              매장이 보내는 신호,
              <br />
              이제 <span className="accent-text">데이터</span>로 읽으세요
            </h1>
            <p className="lede reveal d2">
              SpotLine은 매장 CCTV 영상을 Vision AI로 분석해 방문·체류·혼잡
              흐름을 비식별 데이터로 보여주고, 매출을 올리는 운영 전략까지
              제안하는 AI 매장 분석 플랫폼이에요.
            </p>
            <div className="hero-actions reveal d3">
              <Link className="btn btn-accent btn-lg" to="/onboarding">
                1분 만에 시작하기 <ArrowIcon width="17" height="17" />
              </Link>
              <a className="btn btn-ghost-lg" href="#analytics">
                기능 둘러보기
              </a>
            </div>
          </div>

          {/* 대시보드 목업 */}
          <div className="stage reveal d2">
            <div className="dash">
              <div className="dash-bar">
                <span className="tl r"></span>
                <span className="tl y"></span>
                <span className="tl g"></span>
                <span className="crumb">SpotLine · 홍대점 대시보드</span>
                <span className="live">
                  <i></i> LIVE
                </span>
              </div>
              <div className="dash-body">
                <div className="mkpis">
                  <div className="mkpi">
                    <div className="l">
                      <span
                        className="ic"
                        style={{
                          background: "var(--accent-soft)",
                          color: "var(--accent-ink)",
                        }}
                      >
                        <UsersIcon width="13" height="13" />
                      </span>
                      방문자
                    </div>
                    <div className="v">
                      1,284<span className="u">명</span>
                    </div>
                    <div className="d up">▲ 12.4%</div>
                  </div>
                  <div className="mkpi">
                    <div className="l">
                      <span
                        className="ic"
                        style={{
                          background: "var(--warn-soft)",
                          color: "oklch(0.48 0.14 65)",
                        }}
                      >
                        <ActivityIcon width="13" height="13" />
                      </span>
                      혼잡도
                    </div>
                    <div className="v">보통</div>
                    <div className="d" style={{ color: "var(--muted)" }}>
                      14–16시 피크
                    </div>
                  </div>
                  <div className="mkpi">
                    <div className="l">
                      <span
                        className="ic"
                        style={{
                          background: "var(--good-soft)",
                          color: "oklch(0.42 0.12 155)",
                        }}
                      >
                        <ClockIcon width="13" height="13" />
                      </span>
                      평균 체류
                    </div>
                    <div className="v">
                      4<span className="u">분</span> 12
                      <span className="u">초</span>
                    </div>
                    <div className="d up">▲ 0.6분</div>
                  </div>
                </div>
                <div className="mchart">
                  <div className="ct">
                    <span className="t">시간대별 방문 추이</span>
                    <span className="tag">오늘</span>
                  </div>
                  <svg viewBox="0 0 340 128" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="slpG1" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="oklch(0.68 0.13 205)"
                          stopOpacity="0.28"
                        />
                        <stop
                          offset="100%"
                          stopColor="oklch(0.68 0.13 205)"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,104 C40,96 56,70 88,72 C120,74 132,40 168,38 C204,36 220,58 252,52 C284,46 300,22 340,18 L340,128 L0,128 Z"
                      fill="url(#slpG1)"
                    />
                    <path
                      d="M0,104 C40,96 56,70 88,72 C120,74 132,40 168,38 C204,36 220,58 252,52 C284,46 300,22 340,18"
                      fill="none"
                      stroke={ACCENT_LINE}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="168"
                      cy="38"
                      r="4"
                      fill="#fff"
                      stroke={ACCENT_LINE}
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* 플로팅: 성별 분포 */}
            <div className="float-card fc-gender">
              <div className="gt">성별 분포 (익명 추정)</div>
              <div className="grow">
                <span className="gl">여성</span>
                <span className="track">
                  <span
                    className="fill"
                    style={{ width: "58%", background: "#D14E9A" }}
                  ></span>
                </span>
                <span className="gv mono">58%</span>
              </div>
              <div className="grow">
                <span className="gl">남성</span>
                <span className="track">
                  <span
                    className="fill"
                    style={{ width: "42%", background: TEAL_FILL }}
                  ></span>
                </span>
                <span className="gv mono">42%</span>
              </div>
            </div>

            {/* 플로팅: AI 인사이트 */}
            <div className="float-card fc-ai">
              <div className="head">
                <span className="badge">
                  <SparkleIcon width="12" height="12" /> AI 전략 제안
                </span>
              </div>
              <div className="txt">
                오후 <b>2–4시 한산</b>해요. 이 시간대 한정 쿠폰으로 방문을{" "}
                <b>최대 18%</b> 끌어올릴 수 있어요.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============ 1. 방문 분석 ============ */}
      <section className="section" id="analytics">
        <div className="wrap">
          <div className="feat">
            <div className="feat-copy">
              <div className="eyebrow reveal">
                <span className="dot"></span>방문 분석
              </div>
              <h2 className="h-sec reveal d1">
                하루에 몇 명이, 언제 다녀갔는지
                <br />
                정확히 보여드려요
              </h2>
              <p className="lede reveal d2">
                사람이 직접 세지 않아도 돼요. Vision AI가 영상 속 방문 흐름을
                자동으로 집계해 시간대별 추이와 피크 시간을 한눈에 정리해
                드려요.
              </p>
              <ul className="feat-points reveal d2">
                <li>
                  <span className="pic">
                    <UsersIcon width="16" height="16" />
                  </span>
                  <div>
                    <div className="pt">방문자 수 자동 집계</div>
                    <div className="pd">중복 없이 실제 방문 인원만 셉니다</div>
                  </div>
                </li>
                <li>
                  <span className="pic">
                    <ClockIcon width="16" height="16" />
                  </span>
                  <div>
                    <div className="pt">체류 시간 · 피크 시간</div>
                    <div className="pd">언제 가장 붐비고 얼마나 머무는지</div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="feat-visual reveal d1">
              <div className="panel">
                <div className="trend-card">
                  <div className="th">
                    <div className="t">방문 추이</div>
                    <div className="s">오늘 · 영업 시작 이후</div>
                  </div>
                  <div className="big">
                    <span className="n">1,284</span>
                    <span className="u">명</span>
                    <span className="d up">▲ 12.4%</span>
                  </div>
                  <svg viewBox="0 0 400 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="slpG2" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="oklch(0.68 0.13 205)"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="oklch(0.68 0.13 205)"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,120 C44,112 64,84 104,86 C144,88 156,52 200,46 C244,40 260,66 300,58 C340,50 360,26 400,22 L400,150 L0,150 Z"
                      fill="url(#slpG2)"
                    />
                    <path
                      d="M0,120 C44,112 64,84 104,86 C144,88 156,52 200,46 C244,40 260,66 300,58 C340,50 360,26 400,22"
                      fill="none"
                      stroke={ACCENT_LINE}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="200"
                      cy="46"
                      r="4.5"
                      fill="#fff"
                      stroke={ACCENT_LINE}
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="peakrow">
                    <span style={{ height: "38%" }}></span>
                    <span style={{ height: "52%" }}></span>
                    <span style={{ height: "46%" }}></span>
                    <span style={{ height: "70%" }}></span>
                    <span className="hi" style={{ height: "100%" }}></span>
                    <span className="hi" style={{ height: "88%" }}></span>
                    <span style={{ height: "64%" }}></span>
                    <span style={{ height: "54%" }}></span>
                    <span style={{ height: "40%" }}></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2. 고객 이해 ============ */}
      <section className="section soft" id="audience">
        <div className="wrap">
          <div className="feat rev">
            <div className="feat-copy">
              <div className="eyebrow reveal">
                <span className="dot"></span>고객 이해
              </div>
              <h2 className="h-sec reveal d1">
                어떤 손님이 찾아오는지
                <br />알 수 있어요
              </h2>
              <p className="lede reveal d2">
                성별과 연령대를 익명으로 추정해 우리 매장의 실제 고객층을
                보여줘요. 누구인지는 저장하지 않고, 비율과 흐름만 데이터로
                남습니다.
              </p>
              <ul className="feat-points reveal d2">
                <li>
                  <span className="pic">
                    <UserIcon width="16" height="16" />
                  </span>
                  <div>
                    <div className="pt">성별 · 연령대 비식별 추정</div>
                    <div className="pd">우리 매장 주 고객층을 비율로 파악</div>
                  </div>
                </li>
                <li>
                  <span className="pic">
                    <ChartIcon width="16" height="16" />
                  </span>
                  <div>
                    <div className="pt">요일·시간대별 고객 변화</div>
                    <div className="pd">시간에 따라 달라지는 고객층까지</div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="feat-visual reveal d1">
              <div className="panel mint">
                <div className="trend-card" style={{ maxWidth: 330 }}>
                  <div className="th">
                    <div className="t">연령대 분포</div>
                    <div className="s">최근 7일 · 익명 추정</div>
                  </div>
                  <div
                    style={{
                      padding: "16px 18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 13,
                    }}
                  >
                    {[
                      { label: "10대", pct: 14 },
                      { label: "20대", pct: 38 },
                      { label: "30대", pct: 27 },
                      { label: "40대", pct: 14 },
                      { label: "50대+", pct: 7 },
                    ].map((row) => (
                      <div
                        className="grow"
                        key={row.label}
                        style={{ gridTemplateColumns: "46px 1fr 40px" }}
                      >
                        <span className="gl">{row.label}</span>
                        <span className="track">
                          <span
                            className="fill"
                            style={{
                              width: `${row.pct}%`,
                              background: TEAL_FILL,
                            }}
                          ></span>
                        </span>
                        <span className="gv mono">{row.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 3. AI 전략 ============ */}
      <section className="section" id="strategy">
        <div className="wrap">
          <div className="feat">
            <div className="feat-copy">
              <div className="eyebrow reveal">
                <span className="dot"></span>AI 전략 추천
              </div>
              <h2 className="h-sec reveal d1">
                데이터만 주고 끝내지 않아요.
                <br />
                무엇을 할지 제안해요
              </h2>
              <p className="lede reveal d2">
                쌓인 데이터를 바탕으로 AI가 매출을 올릴 구체적인 운영·마케팅
                전략을 매일 제안해요. 데이터가 쌓일수록 제안은 더 정교해집니다.
              </p>
              <ul className="feat-points reveal d2">
                <li>
                  <span className="pic">
                    <TrendUpIcon width="16" height="16" />
                  </span>
                  <div>
                    <div className="pt">매출 상승 운영 전략</div>
                    <div className="pd">한산한 시간대·고객층 공략 제안</div>
                  </div>
                </li>
                <li>
                  <span className="pic">
                    <ReportIcon width="16" height="16" />
                  </span>
                  <div>
                    <div className="pt">매일 자동 인사이트 리포트</div>
                    <div className="pd">매장 현황을 매일 정리해 드려요</div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="feat-visual reveal d1">
              <div className="panel">
                <div className="ai-stack">
                  <div className="ai-item">
                    <span className="num">01</span>
                    <div>
                      <div className="it">한산한 평일 오후 공략</div>
                      <div className="ib">
                        14–16시 방문이 30% 적어요. 이 시간대 한정 쿠폰을
                        추천해요.
                      </div>
                      <span className="ig k">우선순위 높음</span>
                    </div>
                  </div>
                  <div className="ai-item">
                    <span className="num">02</span>
                    <div>
                      <div className="it">20대 여성 타깃 메뉴</div>
                      <div className="ib">
                        주 고객층에 맞춘 신메뉴·세트로 객단가를 올려보세요.
                      </div>
                      <span className="ig r">예상 +12%</span>
                    </div>
                  </div>
                  <div className="ai-item">
                    <span className="num">03</span>
                    <div>
                      <div className="it">피크 시간 동선 정리</div>
                      <div className="ib">
                        18시 입구 혼잡이 잦아요. 대기 동선을 분리해 보세요.
                      </div>
                      <span className="ig r">체류 개선</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 4. 프라이버시 띠 ============ */}
      <section className="privacy" id="privacy">
        <div className="wrap">
          <div>
            <div className="eyebrow reveal">
              <span className="dot"></span>PRIVACY FIRST
            </div>
            <h2 className="h-sec reveal d1">얼굴이 아니라, 흐름을 봅니다</h2>
            <p className="lede reveal d2">
              SpotLine은 누가 왔는지가 아니라 어떻게 움직였는지에 집중해요. 모든
              분석은 개인을 식별할 수 없는 익명 통계로 처리되며, 얼굴 같은 식별
              정보는 저장하지 않습니다.
            </p>
            <div className="priv-tags reveal d3">
              <span className="priv-tag">
                <CheckIcon width="14" height="14" />
                개인 식별 정보 미저장
              </span>
              <span className="priv-tag">
                <CheckIcon width="14" height="14" />
                익명 추정 통계만 활용
              </span>
              <span className="priv-tag">
                <CheckIcon width="14" height="14" />
                비식별 데이터 처리
              </span>
            </div>
          </div>
          <div className="shield-wrap reveal d2">
            <div className="shield-badge">
              <ShieldIcon width="78" height="78" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5. 작동 방식 ============ */}
      <section className="section soft">
        <div className="wrap" style={{ textAlign: "center" }}>
          <div className="eyebrow reveal" style={{ justifyContent: "center" }}>
            <span className="dot"></span>시작은 이렇게
          </div>
          <h2 className="h-sec reveal d1">3단계면 충분해요</h2>
          <div className="steps">
            <div className="step reveal d1">
              <div className="sn">01</div>
              <div className="si">
                <StoreIcon width="26" height="26" />
              </div>
              <div className="st">매장 정보 입력</div>
              <div className="sd">
                매장명·업종·운영시간을 알려주세요. 1분이면 끝나요.
              </div>
              <div className="arrow">
                <ArrowIcon width="22" height="22" />
              </div>
            </div>
            <div className="step reveal d2">
              <div className="sn">02</div>
              <div className="si">
                <VideoIcon width="26" height="26" />
              </div>
              <div className="st">영상 연결</div>
              <div className="sd">매장 CCTV를 연결하면 분석이 시작돼요.</div>
              <div className="arrow">
                <ArrowIcon width="22" height="22" />
              </div>
            </div>
            <div className="step reveal d3">
              <div className="sn">03</div>
              <div className="si">
                <SparkleIcon width="26" height="26" />
              </div>
              <div className="st">인사이트 확인</div>
              <div className="sd">
                대시보드에서 방문 분석과 AI 전략을 매일 받아보세요.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 6. 마지막 CTA ============ */}
      <section className="cta">
        <div className="wrap">
          <div className="eyebrow reveal" style={{ justifyContent: "center" }}>
            <span className="dot"></span>지금 시작하기
          </div>
          <h2 className="h-sec reveal d1">
            매장의 데이터,
            <br />
            오늘부터 쌓아보세요
          </h2>
          <p className="lede reveal d2">
            매장 정보만 입력하면 바로 Vision AI 분석을 체험할 수 있습니다.
          </p>
          <div className="cta-actions reveal d3">
            <Link className="btn btn-accent btn-lg" to="/onboarding">
              매장 등록하고 시작하기 <ArrowIcon width="17" height="17" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 푸터 ============ */}
      <footer className="footer">
        <div className="wrap">
          <img src={spotLineLogo} alt="SpotLine" />
          <span className="copy">Vision AI 매장 분석 플랫폼</span>
          <div className="fl">
            <a href="#analytics">기능</a>
            <a href="#privacy">프라이버시</a>
            <Link to="/onboarding">시작하기</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
