export const HOUR_DATA = [
  [9, 12, 14], [10, 28, 22], [11, 45, 38], [12, 78, 68], [13, 92, 82],
  [14, 70, 64], [15, 52, 48], [16, 64, 60], [17, 88, 76],
  [18, 110, 95], [19, 124, 102], [20, 96, 88], [21, 58, 60],
];

export const PRESETS = {
  cafe:   { name: "코지 카페 · 강남점",  ownerInitial: "박", visitorsToday: 412, congestion: 62, stay: "23분 12초", conv: 38.4, peak: "19:00–20:00", entry: 487, checkout: 158, deltaV: 12.3, deltaC: -3.1, deltaS: 4.2, deltaCv: 1.6 },
  retail: { name: "스토리 리테일 · 성수", ownerInitial: "김", visitorsToday: 308, congestion: 48, stay: "11분 04초", conv: 26.1, peak: "17:00–18:00", entry: 362, checkout: 80,  deltaV: -4.1, deltaC: -7.0, deltaS: 1.1, deltaCv: -0.4 },
  resto:  { name: "수파 한식당 · 광화문", ownerInitial: "이", visitorsToday: 198, congestion: 81, stay: "47분 22초", conv: 64.5, peak: "12:30–13:30", entry: 224, checkout: 128, deltaV: 8.2,  deltaC: 11.2, deltaS: -2.0, deltaCv: 3.2 },
};

export const AGE_GROUPS = [
  { label: "20–29", pct: 38, count: 156 },
  { label: "30–39", pct: 31, count: 128 },
  { label: "40–49", pct: 16, count: 66 },
  { label: "50–59", pct: 9,  count: 37 },
  { label: "기타",   pct: 6,  count: 25 },
];

export const GENDER = { f: 58, m: 42 };

export const PEAK_BARS = [10, 14, 22, 28, 40, 64, 70, 52, 48, 60, 78, 92, 84, 72, 56, 38, 24, 16];
