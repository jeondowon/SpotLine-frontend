export const DAYS_30 = [
  280, 312, 295, 348, 410, 462, 380,
  302, 328, 311, 360, 422, 475, 398,
  315, 340, 322, 372, 430, 488, 410,
  328, 352, 336, 384, 442, 502, 425,
  368, 412,
];

export const HOURS = [
  { h: 9,  v: 14,  prev: 15,  stay: 12 },
  { h: 10, v: 32,  prev: 27,  stay: 17 },
  { h: 11, v: 48,  prev: 42,  stay: 19 },
  { h: 12, v: 86,  prev: 74,  stay: 28 },
  { h: 13, v: 98,  prev: 88,  stay: 32 },
  { h: 14, v: 72,  prev: 64,  stay: 23 },
  { h: 15, v: 55,  prev: 52,  stay: 20 },
  { h: 16, v: 64,  prev: 60,  stay: 22 },
  { h: 17, v: 92,  prev: 80,  stay: 25 },
  { h: 18, v: 116, prev: 102, stay: 27 },
  { h: 19, v: 124, prev: 108, stay: 29 },
  { h: 20, v: 96,  prev: 92,  stay: 24 },
  { h: 21, v: 58,  prev: 62,  stay: 19 },
];

export const STAY_DIST = [
  { range: "< 5분",   pct: 14, color: "oklch(0.85 0.06 25)" },
  { range: "5–10분",  pct: 22, color: "oklch(0.78 0.08 80)" },
  { range: "10–20분", pct: 28, color: "oklch(0.72 0.11 240)" },
  { range: "20–40분", pct: 21, color: "oklch(0.62 0.14 250)" },
  { range: "40–60분", pct: 10, color: "oklch(0.55 0.16 265)" },
  { range: "60분+",   pct: 5,  color: "oklch(0.48 0.18 280)" },
];

export const AGE_GROUPS = [
  { label: "20–29", pct: 38, count: 1562, stay: 21 },
  { label: "30–39", pct: 31, count: 1283, stay: 26 },
  { label: "40–49", pct: 16, count: 660,  stay: 24 },
  { label: "50–59", pct: 9,  count: 372,  stay: 18 },
  { label: "기타",   pct: 6,  count: 248,  stay: 14 },
];

export const GENDER = { f: 58, m: 42, fCount: 2398, mCount: 1736 };

export const WEATHER_CORR = [
  { id: "sunny",  label: "맑음",        icon: "Sun",       days: 12, v: 412, dv: +9.4,  stay: 24, ds: +3.1,  cong: 64, dc: +6.2,  conv: 38.4, dcv: +2.1 },
  { id: "cloudy", label: "흐림",        icon: "Cloud",     days: 9,  v: 376, dv: +0.0,  stay: 22, ds: 0,     cong: 58, dc: 0,     conv: 36.1, dcv: 0 },
  { id: "rain",   label: "비",          icon: "CloudRain", days: 6,  v: 282, dv: -25.0, stay: 28, ds: +8.6,  cong: 44, dc: -24.1, conv: 32.8, dcv: -3.3 },
  { id: "hot",    label: "고온 (30°+)", icon: "Sun",       days: 3,  v: 354, dv: -5.8,  stay: 18, ds: -18.2, cong: 60, dc: +3.4,  conv: 34.5, dcv: -1.6 },
];

export const FUNNEL = [
  { label: "입구 진입",     sub: "Entrance Zone 진입 이벤트",  count: 4126, base: true },
  { label: "체류 (90초 +)", sub: "유효 방문으로 인정된 체류",   count: 3284 },
  { label: "계산대 진입",   sub: "Checkout Zone 진입 이벤트", count: 1392 },
  { label: "이탈",          sub: "체류만 하고 계산대 미진입",   count: 1892, neg: true },
];

export const SCATTER_PTS = [
  [12, 280, "rain"],  [14, 295, "cloudy"], [16, 322, "cloudy"], [18, 340, "sunny"],
  [20, 412, "sunny"], [22, 462, "sunny"],  [24, 488, "sunny"],  [26, 475, "sunny"],
  [11, 268, "rain"],  [13, 298, "rain"],   [15, 310, "cloudy"], [17, 336, "cloudy"],
  [19, 388, "sunny"], [21, 432, "sunny"],  [23, 502, "sunny"],  [25, 478, "sunny"],
  [28, 425, "sunny"], [30, 384, "hot"],    [32, 348, "hot"],
];

export const TABS = [
  { id: "overview", label: "개요" },
  { id: "visitors", label: "방문자" },
  { id: "stay",     label: "체류 시간" },
  { id: "funnel",   label: "전환 분석" },
  { id: "weather",  label: "날씨 영향" },
];
