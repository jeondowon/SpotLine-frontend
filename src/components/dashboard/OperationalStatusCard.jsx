import { useState, useEffect } from "react";
import {
  fetchAvgDwell,
  fetchJustLeftCount,
  fetchBestMenu,
  fetchResponseWaitTime,
  fetchEmptyTableTime,
} from "../../api/index";
import { Ic } from "../ui/Icons";
import InfoTooltip from "../ui/InfoTooltip";

export default function OperationalStatusCard({ startAt, endAt }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!startAt || !endAt) return;
    let live = true;
    Promise.all([
      fetchBestMenu(startAt, endAt),
      fetchAvgDwell(startAt, endAt),
      fetchResponseWaitTime(startAt, endAt),
      fetchEmptyTableTime(startAt, endAt),
      fetchJustLeftCount(startAt, endAt),
    ])
      .then(([bestMenu, dwell, waitTime, emptyTable, lost]) => {
        if (live) setData({ bestMenu, dwell, waitTime, emptyTable, lost });
      })
      .catch(() => {});
    return () => {
      live = false;
      setData(null);
    };
  }, [startAt, endAt]);

  const items = [
    {
      label: "베스트 아이템",
      display: data?.bestMenu?.menu ?? "—",
      value: data?.bestMenu?.menu ?? null,
      unit: "",
      icon: <Ic.Sparkle />,
      iconBg: "oklch(0.955 0.03 65)",
      iconFg: "oklch(0.55 0.14 65)",
      isText: true,
      tooltip: "오늘 가장 많이 팔린 메뉴예요.\nPOS 데이터를 기준으로 집계해요.",
    },
    {
      label: "평균 체류",
      display: data?.dwell?.time != null ? `${data.dwell.time}` : "—",
      value: data?.dwell?.time ?? null,
      unit: "분",
      icon: <Ic.Clock />,
      iconBg: "oklch(0.95 0.04 155)",
      iconFg: "oklch(0.42 0.12 155)",
      tooltip:
        "오늘 방문자의 평균 체류 시간이에요.\nVision AI가 입장·퇴장을 분석해 계산해요.",
    },
    {
      label: "최대 응대 대기",
      display: data?.waitTime?.time != null ? `${data.waitTime.time}` : "—",
      value: data?.waitTime?.time ?? null,
      unit: "분",
      icon: <Ic.Bell />,
      iconBg: "oklch(0.955 0.05 80)",
      iconFg: "oklch(0.55 0.14 65)",
      tooltip:
        "손님이 착석 후 직원 응대를 기다린 최대 시간이에요. 높을수록 서비스 대응이 늦었다는 신호예요.",
    },
    {
      label: "테이블 유휴",
      display: data?.emptyTable?.time != null ? `${data.emptyTable.time}` : "—",
      value: data?.emptyTable?.time ?? null,
      unit: "분",
      icon: <Ic.Dash />,
      iconBg: "oklch(0.955 0.02 250)",
      iconFg: "oklch(0.48 0.10 250)",
      tooltip:
        "오늘 테이블이 빈 채로 가장 오래 유지된 시간이에요. 회전율 개선 포인트를 파악하는 데 도움돼요.",
    },
    {
      label: "그냥 나간 손님",
      display: data?.lost?.count != null ? `${data.lost.count}` : "—",
      value: data?.lost?.count ?? null,
      unit: "명",
      icon: <Ic.Door />,
      iconBg: "oklch(0.955 0.04 25)",
      iconFg: "oklch(0.55 0.16 25)",
      tooltip:
        "입장했지만 주문 없이 이탈한 손님 수예요. 높을수록 메뉴·서비스·환경 개선이 필요하다는 신호예요.",
    },
  ];

  return (
    <div className="card">
      <div className="card-h">
        <h3>운영 현황</h3>
      </div>
      <div className="ops-grid">
        {items.map((item, i) => (
          <div key={i} className="ops-item">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: item.iconBg,
                  color: item.iconFg,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <span
                style={{
                  fontSize: 11.5,
                  color: "var(--muted)",
                  fontWeight: 500,
                  lineHeight: 1.3,
                }}
              >
                {item.label}
              </span>
              <div style={{ marginLeft: "auto" }}>
                <InfoTooltip text={item.tooltip} />
              </div>
            </div>
            <div
              className={item.isText ? "" : "mono"}
              style={{
                fontSize: item.isText ? 17 : 26,
                fontWeight: item.isText ? 700 : 800,
                color: "var(--ink)",
                letterSpacing: item.isText ? "-0.01em" : "-0.03em",
                lineHeight: 1,
                marginBottom: 6,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.display}
              {!item.isText && item.value != null && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--muted)",
                    marginLeft: 4,
                  }}
                >
                  {item.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
