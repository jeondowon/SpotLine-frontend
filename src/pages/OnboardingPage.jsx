import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import spotLineLogo from "../assets/images/SpotLine_FullLogo.png";
import "../styles/onboarding.css";
import O from "./OnboardingIcons";

const BIZ = [
  { v: "카페", ic: <O.Coffee />, Ic: O.Coffee },
  { v: "음식점", ic: <O.Fork />, Ic: O.Fork },
  { v: "베이커리", ic: <O.Bread />, Ic: O.Bread },
  { v: "주점 · 바", ic: <O.Glass />, Ic: O.Glass },
  { v: "리테일 · 편의", ic: <O.Bag />, Ic: O.Bag },
  { v: "뷰티 · 헤어", ic: <O.Scissors />, Ic: O.Scissors },
  { v: "의류 · 패션", ic: <O.Shirt />, Ic: O.Shirt },
  { v: "기타", ic: <O.Dot />, Ic: O.Dot },
];

const bizIcon = (v) => (BIZ.find((b) => b.v === v) || {}).ic;

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const TIMES_12H = [
  "12:00",
  "12:30",
  ...Array.from({ length: 22 }, (_, i) => {
    const h = Math.floor(i / 2) + 1;
    const m = i % 2 === 0 ? "00" : "30";
    return `${h}:${m}`;
  }),
];

function useStore() {
  const [name, setName] = useState("");
  const [biz, setBiz] = useState("");
  const [loc, setLoc] = useState("");
  const [days, setDays] = useState([]);
  const [openHours, setOpenHours] = useState({
    startPeriod: "오전",
    startTime: "",
    endPeriod: "오후",
    endTime: "",
  });
  const [breakTime, setBreakTime] = useState({
    startPeriod: "오전",
    startTime: "",
    endPeriod: "오후",
    endTime: "",
  });
  const [done, setDone] = useState(false);

  const toggleDay = (i) =>
    setDays((d) =>
      d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort(),
    );

  const hoursSet = days.length > 0;
  const openSet = !!(openHours.startTime && openHours.endTime);
  const filledCount = [
    !!name.trim(),
    !!biz,
    !!loc.trim(),
    hoursSet,
    openSet,
  ].filter(Boolean).length;
  const valid = !!name.trim() && !!biz && !!loc.trim();

  return {
    name,
    setName,
    biz,
    setBiz,
    loc,
    setLoc,
    days,
    toggleDay,
    openHours,
    setOpenHours,
    breakTime,
    setBreakTime,
    done,
    setDone,
    hoursSet,
    openSet,
    filledCount,
    valid,
  };
}

function hoursLabel(s) {
  if (s.days.length === 0) return "휴무일 없음";
  return s.days.map((i) => DAYS[i]).join("·") + "요일";
}

function timeLabel(t) {
  if (!t.startTime || !t.endTime) return null;
  return `${t.startPeriod} ${t.startTime} ~ ${t.endPeriod} ${t.endTime}`;
}

function FieldLabel({ children, req, filled }) {
  return (
    <div className="ob-field-top">
      <span className="ob-label">
        {children}
        {req && <span className="req">*</span>}
      </span>
      {filled && (
        <span className="ob-check">
          <O.Check />
        </span>
      )}
    </div>
  );
}

function TextField({ icon, value, onChange, placeholder }) {
  return (
    <div className="ob-input-wrap">
      <span className="ic">{icon}</span>
      <input
        className="ob-input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function BizSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div className={"ob-select" + (open ? " open" : "")} ref={ref}>
      <button className="ob-select-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="ic">{value ? bizIcon(value) : <O.Tag />}</span>
        <span className={"ob-select-val" + (value ? "" : " ph")}>
          {value || "업종을 선택하세요"}
        </span>
        <span className="chev">
          <O.Chev />
        </span>
      </button>
      {open && (
        <div className="ob-menu">
          {BIZ.map((b) => (
            <div
              key={b.v}
              className={"ob-opt" + (b.v === value ? " sel" : "")}
              onClick={() => {
                onChange(b.v);
                setOpen(false);
              }}
            >
              <span className="oic">{b.ic}</span>
              <span>{b.v}</span>
              {b.v === value && (
                <span className="ocheck">
                  <O.Check />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DayPicker({ days, toggleDay }) {
  return (
    <div className="ob-days">
      {DAYS.map((d, i) => (
        <button
          key={d}
          className={
            "ob-day" +
            (days.includes(i) ? " on" : "") +
            (i === 6 ? " sun" : i === 5 ? " sat" : "")
          }
          onClick={() => toggleDay(i)}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

function PeriodSelect({ value, onChange }) {
  return (
    <select
      className="ob-period-sel"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="오전">오전</option>
      <option value="오후">오후</option>
    </select>
  );
}

function TimeSelect({ value, onChange }) {
  return (
    <select
      className="ob-time-sel"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">--:--</option>
      {TIMES_12H.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}

function TimeRangeSelect({ value, onChange }) {
  return (
    <div className="ob-time-range">
      <span className="ic">
        <O.Clock />
      </span>
      <PeriodSelect
        value={value.startPeriod}
        onChange={(v) => onChange({ ...value, startPeriod: v })}
      />
      <TimeSelect
        value={value.startTime}
        onChange={(v) => onChange({ ...value, startTime: v })}
      />
      <span className="ob-time-sep">~</span>
      <PeriodSelect
        value={value.endPeriod}
        onChange={(v) => onChange({ ...value, endPeriod: v })}
      />
      <TimeSelect
        value={value.endTime}
        onChange={(v) => onChange({ ...value, endTime: v })}
      />
    </div>
  );
}

function Progress({ count }) {
  return (
    <div className="ob-progress">
      <div className="meta">
        <span>입력 완성도</span>
        <span>
          <b>{count}</b>/5
        </span>
      </div>
      <div className="ob-track">
        <div style={{ width: `${(count / 5) * 100}%` }}></div>
      </div>
    </div>
  );
}

function Success({ s, onReset }) {
  return (
    <div className="ob-success">
      <div className="ring">
        <div className="dot">
          <O.CheckLg />
        </div>
      </div>
      <h3>등록이 완료됐어요</h3>
      <p>
        <b>{s.name}</b>의 인사이트를 지금부터 수집할게요.
        <br />첫 리포트는 24시간 안에 준비됩니다.
      </p>
      <div className="recap">
        <span className="chip">
          {bizIcon(s.biz)} {s.biz}
        </span>
        <span className="chip">
          <O.Pin /> {s.loc}
        </span>
        <span className="chip">
          <O.Cal /> {hoursLabel(s)}
        </span>
      </div>
      <div className="btn-row">
        <Link to="/dashboard" className="ob-submit accent">
          대시보드로 가기 <O.Arrow />
        </Link>
        <button className="ob-btn-ghost" onClick={onReset}>
          다시 입력
        </button>
      </div>
    </div>
  );
}
function LiveProfile({ s }) {
  const initial = s.name.trim()[0] || "+";
  const BizIc = s.biz ? (BIZ.find((b) => b.v === s.biz) || {}).Ic : null;
  return (
    <div className="ob-profile">
      <div className="banner">
        {s.biz && (
          <span className="biz-badge">
            {bizIcon(s.biz)} {s.biz}
          </span>
        )}
        <div className="avatar">
          {BizIc ? <BizIc width="26" height="26" /> : initial}
        </div>
      </div>
      <div className="pbody">
        <div className={"pname" + (s.name.trim() ? "" : " empty")}>
          {s.name.trim() || "매장명 미입력"}
        </div>
        <div className={"ploc" + (s.loc.trim() ? "" : " empty")}>
          <O.Pin width="13" height="13" />{" "}
          {s.loc.trim() || "위치를 입력하면 여기 표시돼요"}
        </div>
        <div className="pmeta">
          <div className="m">
            <div className="ml">휴무일</div>
            <div className="ob-week">
              {DAYS.map((d, i) => (
                <i key={d} className={s.days.includes(i) ? "closed" : ""}>
                  {d}
                </i>
              ))}
            </div>
          </div>
        </div>
        <div className="pmeta">
          <div className="m">
            <div className="ml">휴무</div>
            <div className={"mv" + (s.hoursSet ? "" : " empty")}>
              {hoursLabel(s)}
            </div>
          </div>
          <div className="m">
            <div className="ml">상태</div>
            <div className={"mv mono" + (s.valid ? " valid" : " empty")}>
              {s.valid ? "● 등록 준비완료" : "○ 입력 중"}
            </div>
          </div>
        </div>
        <div className="pmeta">
          <div className="m">
            <div className="ml">운영시간</div>
            <div className={"mv time" + (s.openSet ? "" : " empty")}>
              {s.openSet ? timeLabel(s.openHours) : "미입력"}
            </div>
          </div>
          <div className="m">
            <div className="ml">브레이크</div>
            <div
              className={
                "mv time" +
                (s.breakTime.startTime && s.breakTime.endTime ? "" : " empty")
              }
            >
              {s.breakTime.startTime && s.breakTime.endTime
                ? timeLabel(s.breakTime)
                : "없음"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BENEFITS = [
  {
    icon: <O.Spark />,
    title: "인사이트 리포트",
    desc: "매장 현황을 매일 자동 분석해 드려요",
  },
  {
    icon: <O.Cal />,
    title: "트렌드 대시보드",
    desc: "매출·방문 패턴을 한눈에 파악하세요",
  },
  {
    icon: <O.TrendUp />,
    title: "매장 성장 전략 추천",
    desc: "마케팅·매출 상승 전략을 제안해드려요",
  },
];

const FLOW_STEPS = [
  { icon: <O.Store />, label: "매장 정보 입력", desc: "지금 이 단계예요" },
  { icon: <O.Camera />, label: "CCTV 연결", desc: "SpotLine 앱에서 진행해요" },
  {
    icon: <O.Spark />,
    label: "AI 분석 시작",
    desc: "등록 즉시 데이터 수집 시작",
  },
];

function OnboardingFlow() {
  return (
    <div className="ob-flow">
      <div className="ob-flow-label">가입 진행 순서</div>
      {FLOW_STEPS.map((step, i) => (
        <div key={step.label} className="ob-flow-row">
          <div className="ob-flow-left">
            <div className={"ob-flow-dot" + (i === 0 ? " active" : "")}>
              {step.icon}
            </div>
            {i < FLOW_STEPS.length - 1 && <div className="ob-flow-line" />}
          </div>
          <div className="ob-flow-body">
            <div className={"ob-flow-title" + (i === 0 ? " active" : "")}>
              {step.label}
            </div>
            <div className="ob-flow-desc">{step.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Benefits() {
  return (
    <div className="ob-benefits">
      {BENEFITS.map((b) => (
        <div key={b.title} className="ob-benefit">
          <span className="ob-benefit-ic">{b.icon}</span>
          <div>
            <div className="ob-benefit-title">{b.title}</div>
            <div className="ob-benefit-desc">{b.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const s = useStore();

  return (
    <div className="ob-frame">
      <div className="ob-card ob-c">
        {s.done && <Success s={s} onReset={() => s.setDone(false)} />}
        <div className="form">
          <div className="fh">
            <img className="ob-logo" src={spotLineLogo} alt="SpotLine" />
          </div>
          <div className="ob-intro">
            <div className="ob-eyebrow">첫 매장 등록</div>
            <h1 className="ob-title">매장 정보를 알려주세요</h1>
            <p className="ob-sub">
              입력하면 오른쪽 카드가 실시간으로 채워져요. 1분이면 충분합니다.
            </p>
          </div>
          <div className="ob-fields">
            <label className="ob-field">
              <FieldLabel req filled={!!s.name.trim()}>
                매장명
              </FieldLabel>
              <TextField
                icon={<O.Store />}
                value={s.name}
                onChange={s.setName}
                placeholder="예: 스팟라인 홍대점"
              />
            </label>
            <div className="ob-field">
              <FieldLabel req filled={!!s.biz}>
                업종
              </FieldLabel>
              <BizSelect value={s.biz} onChange={s.setBiz} />
            </div>
            <label className="ob-field">
              <FieldLabel req filled={!!s.loc.trim()}>
                위치
              </FieldLabel>
              <TextField
                icon={<O.Pin />}
                value={s.loc}
                onChange={s.setLoc}
                placeholder="도로명 주소를 입력하세요"
              />
            </label>
            <div className="ob-field">
              <FieldLabel filled={s.hoursSet}>휴무일</FieldLabel>
              <DayPicker days={s.days} toggleDay={s.toggleDay} />
              <div className="ob-hint">
                정기 휴무 요일을 선택하세요. 쉬는 날이 없다면 비워두셔도 돼요.
              </div>
            </div>
            <div className="ob-field">
              <FieldLabel filled={s.openSet}>운영시간</FieldLabel>
              <TimeRangeSelect value={s.openHours} onChange={s.setOpenHours} />
            </div>
            <div className="ob-field">
              <FieldLabel
                filled={!!(s.breakTime.startTime && s.breakTime.endTime)}
              >
                브레이크타임
              </FieldLabel>
              <TimeRangeSelect value={s.breakTime} onChange={s.setBreakTime} />
              <div className="ob-hint">
                브레이크타임이 없다면 비워두셔도 돼요.
              </div>
            </div>
          </div>
          <div className="ob-foot">
            <Progress count={s.filledCount} />
            <button
              className={"ob-submit accent" + (s.valid ? "" : " disabled")}
              onClick={s.valid ? () => s.setDone(true) : undefined}
            >
              매장 등록 완료 <O.Arrow />
            </button>
          </div>
        </div>

        <div className="preview">
          <LiveProfile s={s} />
          <Benefits />
          <div className="ob-flow-card">
            <OnboardingFlow />
          </div>
        </div>
      </div>
    </div>
  );
}
