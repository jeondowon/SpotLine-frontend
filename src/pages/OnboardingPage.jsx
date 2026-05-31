import { useState } from "react";
import { Link } from "react-router-dom";
import spotLineLogo from "../assets/images/SpotLine_FullLogo.png";
import "../styles/onboarding.css";
import { Ic } from "../components/ui/Icons";
import {
  BIZ,
  DAYS,
  bizIcon,
  timeLabel,
  BizSelect,
  DayPicker,
  TimeRangeSelect,
} from "../components/store/StoreFormInputs";

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
  const [dailyGoals, setDailyGoals] = useState({ visitors: "", revenue: "" });
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

  const saveAndDone = () => {
    localStorage.setItem("store_name", name);
    localStorage.setItem("store_address", loc);
    localStorage.setItem("store_biz_type", biz);
    localStorage.setItem("store_open_hours", JSON.stringify(openHours));
    localStorage.setItem("store_break_time", JSON.stringify(breakTime));
    localStorage.setItem("store_closed_days", JSON.stringify(days));
    localStorage.setItem("store_daily_goals", JSON.stringify(dailyGoals));
    window.dispatchEvent(new Event("store-profile-updated"));
    setDone(true);
  };

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
    dailyGoals,
    setDailyGoals,
    done,
    setDone,
    saveAndDone,
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

function FieldLabel({ children, req, filled }) {
  return (
    <div className="ob-field-top">
      <span className="ob-label">
        {children}
        {req && <span className="req">*</span>}
      </span>
      {filled && (
        <span className="ob-check">
          <Ic.Check />
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
          <Ic.CheckLg />
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
          <Ic.Pin /> {s.loc}
        </span>
        <span className="chip">
          <Ic.Cal /> {hoursLabel(s)}
        </span>
      </div>
      <div className="btn-row">
        <Link to="/dashboard" className="ob-submit accent">
          대시보드로 가기 <Ic.Arrow />
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
          <Ic.Pin width="13" height="13" />{" "}
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
        <div className="pmeta">
          <div className="m">
            <div className="ml">방문 목표</div>
            <div className={"mv" + (s.dailyGoals.visitors ? "" : " empty")}>
              {s.dailyGoals.visitors
                ? `${Number(s.dailyGoals.visitors).toLocaleString()}명`
                : "미설정"}
            </div>
          </div>
          <div className="m">
            <div className="ml">매출 목표</div>
            <div className={"mv" + (s.dailyGoals.revenue ? "" : " empty")}>
              {s.dailyGoals.revenue
                ? `${Number(s.dailyGoals.revenue).toLocaleString()}만원`
                : "미설정"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BENEFITS = [
  {
    icon: <Ic.Spark />,
    title: "인사이트 리포트",
    desc: "매장 현황을 매일 자동 분석해 드려요",
  },
  {
    icon: <Ic.Cal />,
    title: "트렌드 대시보드",
    desc: "매출·방문 패턴을 한눈에 파악하세요",
  },
  {
    icon: <Ic.TrendUp />,
    title: "매장 성장 전략 추천",
    desc: "마케팅·매출 상승 전략을 제안해드려요",
  },
];

const FLOW_STEPS = [
  { icon: <Ic.Store />, label: "매장 정보 입력", desc: "지금 이 단계예요" },
  { icon: <Ic.Video />, label: "CCTV 연결", desc: "SpotLine 앱에서 진행해요" },
  {
    icon: <Ic.Spark />,
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
                icon={<Ic.Store />}
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
                icon={<Ic.Pin />}
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
            <div className="ob-field">
              <FieldLabel
                filled={!!(s.dailyGoals.visitors || s.dailyGoals.revenue)}
              >
                일일 목표
              </FieldLabel>
              <div className="ob-goal-row">
                <div className="ob-goal-field">
                  <div className="ob-goal-sublabel">방문자 수 목표</div>
                  <div className="ob-goal-input-wrap">
                    <span className="ic">
                      <Ic.Users />
                    </span>
                    <input
                      className="ob-input"
                      type="number"
                      min="0"
                      step="10"
                      value={s.dailyGoals.visitors}
                      onChange={(e) =>
                        s.setDailyGoals({
                          ...s.dailyGoals,
                          visitors: e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                    <span className="ob-goal-unit">명</span>
                  </div>
                </div>
                <div className="ob-goal-field">
                  <div className="ob-goal-sublabel">매출 목표</div>
                  <div className="ob-goal-input-wrap">
                    <span className="ic">
                      <Ic.TrendUp />
                    </span>
                    <input
                      className="ob-input"
                      type="number"
                      min="0"
                      step="5"
                      value={s.dailyGoals.revenue}
                      onChange={(e) =>
                        s.setDailyGoals({
                          ...s.dailyGoals,
                          revenue: e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                    <span className="ob-goal-unit">만원</span>
                  </div>
                </div>
              </div>
              <div className="ob-hint">
                목표를 설정하면 대시보드에서 달성률을 확인할 수 있어요.
              </div>
            </div>
          </div>
          <div className="ob-foot">
            <Progress count={s.filledCount} />
            <button
              className={"ob-submit accent" + (s.valid ? "" : " disabled")}
              onClick={s.valid ? s.saveAndDone : undefined}
            >
              매장 등록 완료 <Ic.Arrow />
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
