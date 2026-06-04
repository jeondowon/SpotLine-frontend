import { useEffect, useRef, useState } from "react";

const LINE_COLOR = "var(--accent)";
const TOOLTIP_COLOR = "var(--navy)";

export default function TrendChart({ data, selectedDay }) {
  const chartRef = useRef(null);
  const [activePoint, setActivePoint] = useState(null);
  const [chartWidth, setChartWidth] = useState(760);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return undefined;

    const updateWidth = () => {
      const nextWidth = Math.round(chart.getBoundingClientRect().width);
      if (nextWidth > 0) setChartWidth(nextWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(chart);
    return () => observer.disconnect();
  }, []);

  if (!data?.time?.length) {
    return (
      <div
        style={{
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted-2)",
          fontSize: 13,
        }}
      >
        추세 데이터가 없습니다.
      </div>
    );
  }

  const rawData = data.data ?? [];
  const dailyTotalMap = new Map();

  data.time.forEach((time, i) => {
    const value = Number(rawData[i]);
    if (!Number.isFinite(value)) return;

    const day = time.slice(0, 10);
    dailyTotalMap.set(day, (dailyTotalMap.get(day) ?? 0) + value);
  });

  const slicedDate = Array.from(dailyTotalMap.keys());
  const slicedData = Array.from(dailyTotalMap.values());
  const selectedIndex = selectedDay
    ? slicedDate.findIndex((d) => d.slice(0, 10) === selectedDay.slice(0, 10))
    : -1;

  const W = chartWidth,
    H = 220,
    PAD_L = 36,
    PAD_R = 14,
    PAD_T = 12,
    PAD_B = 24;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const n = slicedDate.length;

  const allVals = slicedData.filter((v) => v != null && !isNaN(v));
  const maxRaw = allVals.length ? Math.max(...allVals) : 100;
  const minY = 0;
  const maxY = Math.max(10, Math.ceil(maxRaw * 1.1));
  const range = maxY - minY || 1;

  const xi = (i) => PAD_L + (n > 1 ? i / (n - 1) : 0.5) * innerW;
  const yv = (v) => PAD_T + innerH - ((v - minY) / range) * innerH;

  const points = slicedData
    .map((v, i) =>
      v != null ? { x: xi(i), y: yv(v), value: v, date: slicedDate[i] } : null,
    )
    .filter(Boolean);
  const linePath =
    points.length >= 2
      ? `M${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L")}`
      : "";

  const step = Math.max(1, Math.floor(n / 6));
  const minLabelGap = Math.max(2, Math.ceil(step / 2));
  const labelIndexes = [];
  for (let i = 0; i < n; i += step) labelIndexes.push(i);
  if (n > 0) {
    const lastIndex = n - 1;
    const previousIndex = labelIndexes[labelIndexes.length - 1];
    if (previousIndex !== lastIndex) {
      if (lastIndex - previousIndex < minLabelGap) {
        labelIndexes[labelIndexes.length - 1] = lastIndex;
      } else {
        labelIndexes.push(lastIndex);
      }
    }
  }
  const dateLabels = labelIndexes.map((i) => ({
    label: slicedDate[i].slice(5, 10),
    i,
  }));

  const gridStep = Math.max(1, Math.ceil(maxY / 4 / 10) * 10);
  const gridStart = Math.ceil(minY / gridStep) * gridStep;
  const gridVals = [];
  for (let v = gridStart; v <= maxY; v += gridStep) gridVals.push(v);
  const tooltip = activePoint
    ? {
        ...activePoint,
        label: `${Math.round(activePoint.value).toLocaleString()}명`,
      }
    : null;
  const tooltipWidth = tooltip
    ? Math.max(42, tooltip.label.length * 7.4 + 16)
    : 0;
  const tooltipX = tooltip
    ? Math.min(
        W - PAD_R - tooltipWidth / 2,
        Math.max(PAD_L + tooltipWidth / 2, tooltip.x),
      )
    : 0;
  const tooltipY = tooltip ? Math.max(17, tooltip.y - 20) : 0;

  return (
    <div className="chart-wrap" ref={chartRef}>
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        {gridVals.map((gv, i) => {
          const gy = yv(gv);
          return (
            <g key={i}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={gy}
                y2={gy}
                stroke="#ECEEF2"
                strokeDasharray={i === 0 ? "" : "3 4"}
              />
              <text
                x={PAD_L - 8}
                y={gy + 3}
                fontSize="10"
                textAnchor="end"
                fill="#9AA3AF"
                fontFamily="JetBrains Mono"
              >
                {gv}
              </text>
            </g>
          );
        })}

        {dateLabels.map(({ i, label }) => (
          <text
            key={i}
            x={xi(i)}
            y={H - 6}
            fontSize="10"
            textAnchor="middle"
            fill="#9AA3AF"
            fontFamily="JetBrains Mono"
          >
            {label}
          </text>
        ))}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={LINE_COLOR}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {points.map((p, i) => (
          <circle
            key={`${p.date}-${i}`}
            cx={p.x}
            cy={p.y}
            r={i === selectedIndex ? "4.5" : "3.5"}
            fill="#fff"
            stroke={i === selectedIndex ? "var(--navy)" : LINE_COLOR}
            strokeWidth="2"
            tabIndex="0"
            role="button"
            aria-label={`${p.date.slice(5, 10)} ${Math.round(p.value).toLocaleString()}명`}
            style={{ cursor: "pointer" }}
            onClick={() =>
              setActivePoint((current) => (current?.date === p.date ? null : p))
            }
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              setActivePoint((current) =>
                current?.date === p.date ? null : p,
              );
            }}
          />
        ))}
        {tooltip && (
          <g pointerEvents="none">
            <rect
              x={tooltipX - tooltipWidth / 2}
              y={tooltipY - 11}
              width={tooltipWidth}
              height="19"
              rx="9.5"
              fill={TOOLTIP_COLOR}
            />
            <text
              x={tooltipX}
              y={tooltipY + 2}
              fontSize="11"
              textAnchor="middle"
              fill="#fff"
              fontWeight="700"
            >
              {tooltip.label}
            </text>
          </g>
        )}
      </svg>

      <div className="legend">
        <div>
          <span className="sw" style={{ background: LINE_COLOR }} />
          일별 총 방문자 수
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#9AA3AF" }}>
          단위: 방문자(명)
        </div>
      </div>
    </div>
  );
}
